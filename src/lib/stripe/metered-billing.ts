/**
 * Stripe Metered Billing
 * 
 * Sendet Usage-Events an Stripe für nutzungsbasierte Abrechnung
 */

import { stripe, isStripeConfigured } from '@/lib/stripe-server'
import { prisma } from '@/lib/prisma'

interface UsageReportParams {
  userId: string
  subscriptionItemId: string
  quantityCents: number // Betrag in Cent (€0.02 = 2)
  timestamp?: number
  action?: 'increment' | 'set'
  idempotencyKey?: string
}

/**
 * Meldet Nutzung an Stripe für metered billing
 */
export async function reportUsageToStripe(params: UsageReportParams) {
  if (!isStripeConfigured() || !stripe) {
    console.warn('Stripe not configured, skipping usage report')
    return null
  }

  try {
    const record = await stripe.subscriptionItems.createUsageRecord(
      params.subscriptionItemId,
      {
        quantity: params.quantityCents,
        timestamp: params.timestamp || Math.floor(Date.now() / 1000),
        action: params.action || 'increment',
      },
      {
        idempotencyKey: params.idempotencyKey,
      }
    )

    return record
  } catch (error) {
    console.error('Error reporting usage to Stripe:', error)
    throw error
  }
}

/**
 * Holt die Subscription Item ID für metered billing
 */
export async function getMeteredSubscriptionItemId(userId: string): Promise<string | null> {
  if (!isStripeConfigured() || !stripe) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  })

  if (!user?.stripeSubscriptionId) {
    return null
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
    
    // Suche nach dem metered price item
    const meteredItem = subscription.items.data.find(item => 
      item.price.recurring?.usage_type === 'metered'
    )

    return meteredItem?.id || null
  } catch (error) {
    console.error('Error getting metered subscription item:', error)
    return null
  }
}

/**
 * Berechnet den Preis für eine AI-Anfrage basierend auf der DB-Konfiguration
 */
export async function calculateAIPricing(params: {
  modelKey: string
  inputTokens?: number
  outputTokens?: number
  isImageOrVideo?: boolean
}): Promise<{ costUsd: number; priceUsd: number; marginPercent: number }> {
  const { modelKey, inputTokens = 0, outputTokens = 0, isImageOrVideo = false } = params

  // Hole Modell-Konfiguration aus DB
  const modelConfig = await prisma.aIModelConfig.findUnique({
    where: { modelKey },
  })

  if (!modelConfig) {
    // Fallback auf Standard-Marge
    console.warn(`Model config not found for ${modelKey}, using defaults`)
    return {
      costUsd: 0,
      priceUsd: 0,
      marginPercent: 40,
    }
  }

  let costUsd = 0
  let priceUsd = 0

  if (isImageOrVideo) {
    // Bild/Video: Kosten pro Run
    costUsd = modelConfig.costPerRun ? Number(modelConfig.costPerRun) : 0
    priceUsd = modelConfig.pricePerRun ? Number(modelConfig.pricePerRun) : 0
  } else {
    // Text: Kosten pro Token
    const costInput = modelConfig.costPerInputToken ? Number(modelConfig.costPerInputToken) : 0
    const costOutput = modelConfig.costPerOutputToken ? Number(modelConfig.costPerOutputToken) : 0
    const priceInput = modelConfig.pricePerInputToken ? Number(modelConfig.pricePerInputToken) : 0
    const priceOutput = modelConfig.pricePerOutputToken ? Number(modelConfig.pricePerOutputToken) : 0

    // Preise sind pro 1M Tokens
    costUsd = (inputTokens * costInput + outputTokens * costOutput) / 1_000_000
    priceUsd = (inputTokens * priceInput + outputTokens * priceOutput) / 1_000_000
  }

  return {
    costUsd,
    priceUsd,
    marginPercent: modelConfig.marginPercent,
  }
}

/**
 * Holt die inkludierten AI-Credits aus dem aktuellen Plan des Users
 */
export async function getUserIncludedAiCredits(userId: string): Promise<number> {
  // Hole User mit aktuellem Plan
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripePriceId: true },
  })

  if (!user?.stripePriceId) {
    return 0 // Kein aktiver Plan
  }

  // Finde den Plan basierend auf der Stripe Price ID
  const plans = await prisma.$queryRaw<Array<{ included_ai_credits_eur: number }>>`
    SELECT included_ai_credits_eur FROM subscription_plans
    WHERE stripe_price_monthly = ${user.stripePriceId}
       OR stripe_price_quarterly = ${user.stripePriceId}
       OR stripe_price_six_months = ${user.stripePriceId}
       OR stripe_price_yearly = ${user.stripePriceId}
    LIMIT 1
  `

  return plans.length > 0 ? Number(plans[0].included_ai_credits_eur) : 0
}

/**
 * Trackt und meldet AI-Nutzung an Stripe
 * Berücksichtigt inkludierte Credits - nur Überschuss wird an Stripe gemeldet
 */
export async function trackAndReportAIUsage(params: {
  userId: string
  modelKey: string
  feature: string
  inputTokens?: number
  outputTokens?: number
  isImageOrVideo?: boolean
  metadata?: Record<string, unknown>
}): Promise<{ 
  priceEur: number
  chargedToStripe: number
  usedFromIncluded: number 
}> {
  const {
    userId,
    modelKey,
    feature,
    inputTokens = 0,
    outputTokens = 0,
    isImageOrVideo = false,
  } = params

  // Berechne Preise
  const pricing = await calculateAIPricing({
    modelKey,
    inputTokens,
    outputTokens,
    isImageOrVideo,
  })

  const priceEur = pricing.priceUsd * 0.92 // USD to EUR

  // Hole aktuelle Spending-Daten und inkludierte Credits
  const [spendingLimit, includedCreditsEur] = await Promise.all([
    prisma.spendingLimit.findUnique({ where: { userId } }),
    getUserIncludedAiCredits(userId),
  ])

  const currentMonthSpent = spendingLimit ? Number(spendingLimit.currentMonthSpent) : 0
  const newTotalSpent = currentMonthSpent + priceEur

  // Berechne wie viel an Stripe gemeldet werden muss (nur Überschuss über inkludierte Credits)
  let chargedToStripe = 0
  let usedFromIncluded = 0

  if (includedCreditsEur > 0) {
    if (currentMonthSpent >= includedCreditsEur) {
      // Inkludierte Credits bereits aufgebraucht - alles an Stripe
      chargedToStripe = priceEur
    } else if (newTotalSpent > includedCreditsEur) {
      // Teilweise inkludiert, Rest an Stripe
      usedFromIncluded = includedCreditsEur - currentMonthSpent
      chargedToStripe = newTotalSpent - includedCreditsEur
    } else {
      // Komplett durch inkludierte Credits gedeckt
      usedFromIncluded = priceEur
    }
  } else {
    // Keine inkludierten Credits - alles an Stripe
    chargedToStripe = priceEur
  }

  // Melde nur den Überschuss an Stripe
  if (chargedToStripe > 0) {
    const subscriptionItemId = await getMeteredSubscriptionItemId(userId)

    if (subscriptionItemId) {
      // Konvertiere zu Cent (Stripe erwartet Integer)
      const quantityCents = Math.round(chargedToStripe * 100)

      await reportUsageToStripe({
        userId,
        subscriptionItemId,
        quantityCents,
        idempotencyKey: `${userId}-${Date.now()}-${feature}`,
      })
    }
  }

  // Update SpendingLimit
  if (spendingLimit) {
    const percentUsed = (newTotalSpent / Number(spendingLimit.monthlyLimitEur)) * 100

    await prisma.spendingLimit.update({
      where: { id: spendingLimit.id },
      data: {
        currentMonthSpent: newTotalSpent,
        // Check if limit hit
        limitHitAt: spendingLimit.hardLimit && percentUsed >= 100 && !spendingLimit.limitHitAt
          ? new Date()
          : spendingLimit.limitHitAt,
        // Check if alert threshold reached
        alertSentAt: percentUsed >= spendingLimit.alertThreshold && !spendingLimit.alertSentAt
          ? new Date()
          : spendingLimit.alertSentAt,
      },
    })
  } else {
    // Erstelle SpendingLimit wenn nicht vorhanden
    await prisma.spendingLimit.create({
      data: {
        userId,
        monthlyLimitEur: 50, // Default limit
        currentMonthSpent: priceEur,
        alertThreshold: 80,
        hardLimit: false,
      },
    })
  }

  return {
    priceEur,
    chargedToStripe,
    usedFromIncluded,
  }
}

/**
 * Prüft ob ein User sein Spending Limit erreicht hat
 * Gibt auch Infos über inkludierte Credits zurück
 */
export async function checkSpendingLimit(userId: string): Promise<{
  canUseAI: boolean
  percentageUsed: number
  remainingEur: number
  currentMonthSpent: number
  includedCreditsEur: number
  includedCreditsRemaining: number
  message?: string
}> {
  const [spendingLimit, includedCreditsEur] = await Promise.all([
    prisma.spendingLimit.findUnique({ where: { userId } }),
    getUserIncludedAiCredits(userId),
  ])

  if (!spendingLimit) {
    // Kein Limit gesetzt
    return {
      canUseAI: true,
      percentageUsed: 0,
      remainingEur: 999999,
      currentMonthSpent: 0,
      includedCreditsEur,
      includedCreditsRemaining: includedCreditsEur,
    }
  }

  const currentMonthSpent = Number(spendingLimit.currentMonthSpent)
  const monthlyLimit = Number(spendingLimit.monthlyLimitEur)
  const percentageUsed = (currentMonthSpent / monthlyLimit) * 100
  const remainingEur = Math.max(0, monthlyLimit - currentMonthSpent)
  
  // Berechne verbleibende inkludierte Credits
  const includedCreditsRemaining = Math.max(0, includedCreditsEur - currentMonthSpent)

  if (spendingLimit.hardLimit && percentageUsed >= 100) {
    return {
      canUseAI: false,
      percentageUsed,
      remainingEur,
      currentMonthSpent,
      includedCreditsEur,
      includedCreditsRemaining,
      message: 'Du hast dein monatliches AI-Limit erreicht. Erhöhe dein Limit in den Einstellungen.',
    }
  }

  return {
    canUseAI: true,
    percentageUsed,
    remainingEur,
    currentMonthSpent,
    includedCreditsEur,
    includedCreditsRemaining,
    message: percentageUsed >= spendingLimit.alertThreshold
      ? `Du hast bereits ${percentageUsed.toFixed(0)}% deines Limits verwendet.`
      : undefined,
  }
}

/**
 * Erstellt oder holt einen Stripe Meter für AI-Usage
 */
export async function getOrCreateAIMeter(): Promise<string | null> {
  if (!isStripeConfigured() || !stripe) {
    return null
  }

  try {
    // Prüfe ob Meter bereits existiert
    const meters = await stripe.billing.meters.list({ limit: 10 })
    const existingMeter = meters.data.find(m => m.display_name === 'AI Usage')

    if (existingMeter) {
      return existingMeter.id
    }

    // Erstelle neuen Meter
    const meter = await stripe.billing.meters.create({
      display_name: 'AI Usage',
      event_name: 'ai_usage',
      default_aggregation: {
        formula: 'sum',
      },
      customer_mapping: {
        event_payload_key: 'stripe_customer_id',
        type: 'by_id',
      },
      value_settings: {
        event_payload_key: 'value',
      },
    })

    return meter.id
  } catch (error) {
    console.error('Error creating/getting AI meter:', error)
    return null
  }
}

