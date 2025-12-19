import { prisma } from '@/lib/prisma'
import { UsageLogEntry } from './types'
import { calculateCreditsFromUsd, CREDIT_VALUE_EUR } from '@/lib/credits/pricing'
import { 
  calculateAIPricing, 
  trackAndReportAIUsage,
  checkSpendingLimit 
} from '@/lib/stripe/metered-billing'
import { ServerAIEvents } from '@/lib/analytics-server'

// Feature-Labels für lesbare Beschreibungen
const FEATURE_LABELS: Record<string, string> = {
  translation: 'Übersetzung',
  chat: 'AI-Chat',
  completion: 'Text-Generierung',
  social_post: 'Social Media Post',
  image_generation: 'Bild-Generierung',
  video_generation: 'Video-Generierung',
  ai_usage: 'AI-Nutzung',
  // V0 Homepage Builder
  homepage_generation: 'Homepage erstellen',
  homepage_prompt: 'Homepage ändern',
}

// Category mapping for model types
const IMAGE_VIDEO_CATEGORIES = ['images', 'image', 'video', 'videos']

/**
 * Loggt einen AI-Request in die Datenbank UND berechnet Kosten aus DB-Preisen
 * METERED BILLING VERSION - Nutzt AIModelConfig für dynamische Preise
 */
export async function logAIUsage(entry: UsageLogEntry): Promise<string | null> {
  try {
    // Ermittle modelKey für DB-Lookup
    // Für V0 und andere Provider mit direktem modelKey: verwende entry.model direkt
    // Für OpenRouter-ähnliche Provider: verwende provider/model Format
    let modelKey = entry.model
    if (!entry.model.includes('-homepage-') && !entry.model.includes('/')) {
      // Kein V0-Key und kein Slash -> OpenRouter-Format verwenden
      modelKey = `${entry.provider}/${entry.model}`
    }
    
    // Prüfe ob Image/Video Modell oder V0 Homepage Builder (pricePerRun basiert)
    const isImageOrVideo = ['image_generation', 'video_generation', 'homepage_generation', 'homepage_prompt'].includes(entry.feature || '') ||
      IMAGE_VIDEO_CATEGORIES.some(cat => entry.requestType?.includes(cat))

    // Berechne Preise aus der Datenbank
    const pricing = await calculateAIPricing({
      modelKey,
      inputTokens: entry.inputTokens,
      outputTokens: entry.outputTokens,
      isImageOrVideo,
    })

    // Nutze DB-Preis oder Fallback auf übergebene Kosten
    const costUsd = pricing.costUsd > 0 ? pricing.costUsd : entry.costUsd
    const priceUsd = pricing.priceUsd > 0 ? pricing.priceUsd : (entry.costUsd * 1.4) // 40% default margin
    
    // Konvertiere zu Credits (für Legacy-Kompatibilität)
    const creditsUsed = entry.creditsUsed ?? calculateCreditsFromUsd(priceUsd)
    
    // Verwende Prisma.$executeRaw für neue Felder bis TypeScript-Server aktualisiert
    const log = await prisma.aIUsageLog.create({
      data: {
        userId: entry.userId,
        salonId: entry.salonId,
        userType: entry.userType,
        requestType: entry.requestType,
        model: entry.model,
        provider: entry.provider,
        inputTokens: entry.inputTokens,
        outputTokens: entry.outputTokens,
        totalTokens: entry.totalTokens,
        costUsd: costUsd,
        responseTimeMs: entry.responseTimeMs,
        success: entry.success,
        errorMessage: entry.errorMessage,
        metadata: {
          ...entry.metadata as object,
          feature: entry.feature,
          creditsUsed,
          creditsPaid: entry.creditsPaid ?? false,
          // Neue Metered-Billing-Felder
          baseCostUsd: costUsd,
          priceUsd,
          marginPercent: pricing.marginPercent,
          modelKey,
        },
      },
    })
    
    // Update die neuen Felder direkt via SQL
    if (log.id) {
      await prisma.$executeRaw`
        UPDATE ai_usage_logs 
        SET feature = ${entry.feature || null}, 
            credits_used = ${creditsUsed}, 
            credits_paid = ${entry.creditsPaid ?? false}
        WHERE id = ${log.id}
      `
    }
    
    // METERED BILLING: Melde Nutzung an Stripe und update SpendingLimit
    if (entry.success && entry.userId && priceUsd > 0) {
      try {
        await trackAndReportAIUsage({
          userId: entry.userId,
          modelKey,
          feature: entry.feature || entry.requestType || 'ai_usage',
          inputTokens: entry.inputTokens,
          outputTokens: entry.outputTokens,
          isImageOrVideo,
          metadata: entry.metadata as Record<string, unknown>,
        })
        
        // Track AI usage event in PostHog
        await ServerAIEvents.aiUsageLogged(
          entry.userId,
          modelKey,
          entry.feature || entry.requestType || 'ai_usage',
          costUsd,
          priceUsd,
          { input: entry.inputTokens, output: entry.outputTokens }
        )
      } catch (stripeError) {
        // Stripe-Fehler sollten den Hauptprozess nicht blockieren
        console.error('Error reporting to Stripe:', stripeError)
      }
    }
    
    // Legacy Credit-Abzug (optional, für Transition)
    if (entry.success && entry.userId && creditsUsed > 0) {
      await deductCreditsForUsage(entry.userId, creditsUsed, entry.requestType || 'ai_usage', log.id)
    }
    
    return log.id
  } catch (error) {
    // Logging sollte nie den Hauptprozess blockieren
    console.error('Error logging AI usage:', error)
    return null
  }
}

/**
 * Prüft vor einer AI-Anfrage ob der User sein Limit erreicht hat
 */
export async function canUserUseAI(userId: string): Promise<{
  allowed: boolean
  message?: string
  percentageUsed: number
  remainingEur: number
}> {
  const limit = await checkSpendingLimit(userId)
  
  // Track spending limit reached event in PostHog
  if (!limit.canUseAI && limit.percentageUsed >= 100) {
    await ServerAIEvents.spendingLimitReached(
      userId,
      limit.remainingEur + limit.currentMonthSpent, // Total limit
      limit.currentMonthSpent
    )
  }
  
  return {
    allowed: limit.canUseAI,
    message: limit.message,
    percentageUsed: limit.percentageUsed,
    remainingEur: limit.remainingEur,
  }
}

/**
 * Interne Funktion zum Credit-Abzug (mit Unlimited-Support)
 * Verwendet Raw SQL um Prisma TypeScript-Probleme zu umgehen
 */
async function deductCreditsForUsage(
  userId: string, 
  amount: number, 
  feature: string,
  aiUsageLogId: string
): Promise<void> {
  try {
    // Hole UserCredits via Raw SQL
    const userCreditsResult = await prisma.$queryRaw<Array<{
      id: string
      balance: number
      lifetime_used: number
      is_unlimited: boolean
    }>>`
      SELECT id, balance, lifetime_used, is_unlimited 
      FROM user_credits 
      WHERE user_id = ${userId}
    `

    let userCreditsId: string
    let currentBalance: number
    let lifetimeUsed: number
    let isUnlimited: boolean

    if (userCreditsResult.length === 0) {
      // Erstelle UserCredits wenn nicht vorhanden
      const newId = `uc_${Date.now()}_${Math.random().toString(36).substring(7)}`
      await prisma.$executeRaw`
        INSERT INTO user_credits (id, user_id, balance, lifetime_used, lifetime_bought, is_unlimited, created_at, updated_at)
        VALUES (${newId}, ${userId}, 0, 0, 0, false, NOW(), NOW())
      `
      userCreditsId = newId
      currentBalance = 0
      lifetimeUsed = 0
      isUnlimited = false
    } else {
      userCreditsId = userCreditsResult[0].id
      currentBalance = Number(userCreditsResult[0].balance)
      lifetimeUsed = Number(userCreditsResult[0].lifetime_used)
      isUnlimited = userCreditsResult[0].is_unlimited ?? false
    }

    const featureLabel = FEATURE_LABELS[feature] || `AI: ${feature}`

    // Für Unlimited-Accounts: Keine Credits abziehen, aber Nutzung tracken
    if (isUnlimited) {
      // Nur lifetimeUsed aktualisieren
      await prisma.$executeRaw`
        UPDATE user_credits SET lifetime_used = ${lifetimeUsed + amount}, updated_at = NOW()
        WHERE user_id = ${userId}
      `

      // Erstelle Transaktion für Tracking (amount = 0)
      const txId = `ctx_${Date.now()}_${Math.random().toString(36).substring(7)}`
      await prisma.$executeRaw`
        INSERT INTO credit_transactions (id, user_id, user_credits_id, type, amount, balance_before, balance_after, description, ai_usage_log_id, metadata, created_at)
        VALUES (${txId}, ${userId}, ${userCreditsId}, 'usage', 0, ${currentBalance}, ${currentBalance}, 
                ${`[Unlimited] ${featureLabel} (${amount.toFixed(2)} Credits)`}, ${aiUsageLogId}, 
                ${JSON.stringify({ feature, originalAmount: amount, isUnlimited: true })}::jsonb, NOW())
      `

      // Markiere als bezahlt
      await prisma.$executeRaw`UPDATE ai_usage_logs SET credits_paid = true WHERE id = ${aiUsageLogId}`
      return
    }

    // Normale Abbuchung (nur wenn genug Credits vorhanden)
    if (currentBalance >= amount) {
      const newBalance = currentBalance - amount

      await prisma.$executeRaw`
        UPDATE user_credits SET balance = ${newBalance}, lifetime_used = ${lifetimeUsed + amount}, updated_at = NOW()
        WHERE user_id = ${userId}
      `

      const txId = `ctx_${Date.now()}_${Math.random().toString(36).substring(7)}`
      await prisma.$executeRaw`
        INSERT INTO credit_transactions (id, user_id, user_credits_id, type, amount, balance_before, balance_after, description, ai_usage_log_id, metadata, created_at)
        VALUES (${txId}, ${userId}, ${userCreditsId}, 'usage', ${-amount}, ${currentBalance}, ${newBalance}, 
                ${featureLabel}, ${aiUsageLogId}, ${JSON.stringify({ feature })}::jsonb, NOW())
      `

      await prisma.$executeRaw`UPDATE ai_usage_logs SET credits_paid = true WHERE id = ${aiUsageLogId}`
    } else {
      console.warn(`[Credits] User ${userId} hat nicht genug Credits: ${currentBalance} < ${amount}`)
    }
  } catch (error) {
    console.error('[Credits] Error deducting credits:', error)
  }
}

/**
 * Markiert einen Log-Eintrag als bezahlt (Credits abgezogen)
 */
export async function markUsageAsPaid(logId: string): Promise<void> {
  try {
    await prisma.$executeRaw`
      UPDATE ai_usage_logs SET credits_paid = true WHERE id = ${logId}
    `
  } catch (error) {
    console.error('Error marking usage as paid:', error)
  }
}

interface UsageStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalTokens: number
  totalCostUsd: number
  avgResponseTimeMs: number
}

interface UsageByModel {
  model: string
  requests: number
  tokens: number
  costUsd: number
}

interface UsageByUser {
  userId: string | null
  userType: string
  requests: number
  tokens: number
  costUsd: number
}

/**
 * Holt Nutzungsstatistiken für einen Zeitraum
 */
export async function getUsageStats(
  startDate: Date,
  endDate: Date = new Date()
): Promise<UsageStats> {
  const [stats, avgResponse] = await Promise.all([
    prisma.aIUsageLog.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      _sum: {
        totalTokens: true,
        costUsd: true,
      },
    }),
    prisma.aIUsageLog.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        success: true,
        responseTimeMs: { not: null },
      },
      _avg: {
        responseTimeMs: true,
      },
    }),
  ])
  
  const successCount = await prisma.aIUsageLog.count({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      success: true,
    },
  })
  
  return {
    totalRequests: stats._count,
    successfulRequests: successCount,
    failedRequests: stats._count - successCount,
    totalTokens: stats._sum.totalTokens || 0,
    totalCostUsd: Number(stats._sum.costUsd || 0),
    avgResponseTimeMs: Math.round(avgResponse._avg.responseTimeMs || 0),
  }
}

/**
 * Holt Nutzung gruppiert nach Modell
 */
export async function getUsageByModel(
  startDate: Date,
  endDate: Date = new Date()
): Promise<UsageByModel[]> {
  const results = await prisma.aIUsageLog.groupBy({
    by: ['model'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
    _sum: {
      totalTokens: true,
      costUsd: true,
    },
    orderBy: {
      _sum: {
        costUsd: 'desc',
      },
    },
  })
  
  return results.map((r) => ({
    model: r.model,
    requests: r._count,
    tokens: r._sum.totalTokens || 0,
    costUsd: Number(r._sum.costUsd || 0),
  }))
}

/**
 * Holt Nutzung gruppiert nach User
 */
export async function getUsageByUser(
  startDate: Date,
  endDate: Date = new Date(),
  limit: number = 10
): Promise<UsageByUser[]> {
  const results = await prisma.aIUsageLog.groupBy({
    by: ['userId', 'userType'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
    _sum: {
      totalTokens: true,
      costUsd: true,
    },
    orderBy: {
      _sum: {
        costUsd: 'desc',
      },
    },
    take: limit,
  })
  
  return results.map((r) => ({
    userId: r.userId,
    userType: r.userType,
    requests: r._count,
    tokens: r._sum.totalTokens || 0,
    costUsd: Number(r._sum.costUsd || 0),
  }))
}

/**
 * Holt tägliche Nutzung für Charts
 */
export async function getDailyUsage(
  days: number = 30
): Promise<{ date: string; requests: number; tokens: number; costUsd: number }[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)
  
  const logs = await prisma.aIUsageLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
      totalTokens: true,
      costUsd: true,
    },
  })
  
  // Gruppiere nach Tag
  const dailyMap = new Map<string, { requests: number; tokens: number; costUsd: number }>()
  
  // Initialisiere alle Tage
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dailyMap.set(dateStr, { requests: 0, tokens: 0, costUsd: 0 })
  }
  
  // Fülle mit echten Daten
  for (const log of logs) {
    const dateStr = log.createdAt.toISOString().split('T')[0]
    const existing = dailyMap.get(dateStr) || { requests: 0, tokens: 0, costUsd: 0 }
    dailyMap.set(dateStr, {
      requests: existing.requests + 1,
      tokens: existing.tokens + log.totalTokens,
      costUsd: existing.costUsd + Number(log.costUsd),
    })
  }
  
  // Konvertiere zu Array und sortiere
  return Array.from(dailyMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Holt Nutzung für einen bestimmten Nutzer
 */
export async function getUserUsage(
  userId: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<UsageStats> {
  const [stats, avgResponse] = await Promise.all([
    prisma.aIUsageLog.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      _sum: {
        totalTokens: true,
        costUsd: true,
      },
    }),
    prisma.aIUsageLog.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        success: true,
        responseTimeMs: { not: null },
      },
      _avg: {
        responseTimeMs: true,
      },
    }),
  ])
  
  const successCount = await prisma.aIUsageLog.count({
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
      success: true,
    },
  })
  
  return {
    totalRequests: stats._count,
    successfulRequests: successCount,
    failedRequests: stats._count - successCount,
    totalTokens: stats._sum.totalTokens || 0,
    totalCostUsd: Number(stats._sum.costUsd || 0),
    avgResponseTimeMs: Math.round(avgResponse._avg.responseTimeMs || 0),
  }
}

// ============================================
// Feature-basierte Statistiken
// ============================================

interface UsageByFeature {
  feature: string | null
  requests: number
  tokens: number
  costUsd: number
  creditsUsed: number
}

/**
 * Holt Nutzung gruppiert nach Feature (via Raw SQL für neue Felder)
 */
export async function getUsageByFeature(
  startDate: Date,
  endDate: Date = new Date()
): Promise<UsageByFeature[]> {
  const results = await prisma.$queryRaw<Array<{
    feature: string | null
    requests: bigint
    tokens: bigint
    cost_usd: number
    credits_used: number
  }>>`
    SELECT 
      feature,
      COUNT(*)::bigint as requests,
      COALESCE(SUM(total_tokens), 0)::bigint as tokens,
      COALESCE(SUM(cost_usd), 0) as cost_usd,
      COALESCE(SUM(credits_used), 0) as credits_used
    FROM ai_usage_logs
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY feature
    ORDER BY cost_usd DESC
  `
  
  return results.map((r) => ({
    feature: r.feature,
    requests: Number(r.requests),
    tokens: Number(r.tokens),
    costUsd: Number(r.cost_usd),
    creditsUsed: Number(r.credits_used),
  }))
}

/**
 * Holt Nutzung gruppiert nach Provider
 */
export async function getUsageByProvider(
  startDate: Date,
  endDate: Date = new Date()
): Promise<{ provider: string; requests: number; costUsd: number; creditsUsed: number }[]> {
  const results = await prisma.$queryRaw<Array<{
    provider: string
    requests: bigint
    cost_usd: number
    credits_used: number
  }>>`
    SELECT 
      provider,
      COUNT(*)::bigint as requests,
      COALESCE(SUM(cost_usd), 0) as cost_usd,
      COALESCE(SUM(credits_used), 0) as credits_used
    FROM ai_usage_logs
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY provider
    ORDER BY cost_usd DESC
  `
  
  return results.map((r) => ({
    provider: r.provider,
    requests: Number(r.requests),
    costUsd: Number(r.cost_usd),
    creditsUsed: Number(r.credits_used),
  }))
}

/**
 * Holt unbezahlte AI-Nutzung für einen User (für Credits-Abrechnung)
 */
export async function getUnpaidUsage(userId: string): Promise<{
  totalCredits: number
  totalCostUsd: number
  entries: { id: string; feature: string | null; creditsUsed: number; createdAt: Date }[]
}> {
  const entries = await prisma.$queryRaw<Array<{
    id: string
    feature: string | null
    credits_used: number
    cost_usd: number
    created_at: Date
  }>>`
    SELECT id, feature, credits_used, cost_usd, created_at
    FROM ai_usage_logs
    WHERE user_id = ${userId} AND success = true AND credits_paid = false
    ORDER BY created_at DESC
  `

  const totalCredits = entries.reduce((sum, e) => sum + Number(e.credits_used), 0)
  const totalCostUsd = entries.reduce((sum, e) => sum + Number(e.cost_usd), 0)

  return {
    totalCredits,
    totalCostUsd,
    entries: entries.map(e => ({
      id: e.id,
      feature: e.feature,
      creditsUsed: Number(e.credits_used),
      createdAt: e.created_at,
    })),
  }
}

/**
 * Holt erweiterte Statistiken für Admin-Dashboard
 */
export async function getExtendedStats(
  startDate: Date,
  endDate: Date = new Date()
) {
  const [
    basicStats,
    byFeature,
    byProvider,
    byModel,
    totalCreditsResult,
  ] = await Promise.all([
    getUsageStats(startDate, endDate),
    getUsageByFeature(startDate, endDate),
    getUsageByProvider(startDate, endDate),
    getUsageByModel(startDate, endDate),
    prisma.$queryRaw<[{ total: number }]>`
      SELECT COALESCE(SUM(credits_used), 0) as total
      FROM ai_usage_logs
      WHERE created_at >= ${startDate} AND created_at <= ${endDate} AND success = true
    `,
  ])

  return {
    ...basicStats,
    totalCreditsUsed: Number(totalCreditsResult[0]?.total || 0),
    byFeature,
    byProvider,
    byModel,
  }
}




