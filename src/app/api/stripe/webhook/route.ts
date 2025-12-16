import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, isStripeConfigured } from '@/lib/stripe-server'
import { prisma } from '@/lib/prisma'
import { emails } from '@/lib/email'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured || !webhookSecret) {
      return NextResponse.json({ error: 'Stripe ist nicht konfiguriert' }, { status: 503 })
    }

    const stripe = getStripe()
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Unterscheide zwischen Subscription und Credit-Kauf
        if (session.mode === 'payment' && session.metadata?.type === 'credit_purchase') {
          await handleCreditPurchase(session)
        } else if (session.mode === 'subscription') {
          await handleCheckoutCompleted(session)
        }
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        await handleTrialWillEnd(subscription)
        break
      }

      case 'invoice.finalized': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoiceFinalized(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle Credit-Paket Kauf (Einmalzahlung)
 */
async function handleCreditPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const packageId = session.metadata?.packageId
  const creditsStr = session.metadata?.credits

  if (!userId || !packageId || !creditsStr) {
    console.error('Credit purchase missing metadata:', { userId, packageId, creditsStr })
    return
  }

  const creditsToAdd = parseFloat(creditsStr)
  
  if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
    console.error('Invalid credits amount:', creditsStr)
    return
  }

  try {
    // Aktuelle Credits abrufen oder erstellen
    let userCredits = await prisma.userCredits.findUnique({
      where: { userId }
    })

    const currentBalance = userCredits ? Number(userCredits.balance) : 0

    if (!userCredits) {
      // UserCredits Eintrag erstellen
      userCredits = await prisma.userCredits.create({
        data: {
          userId,
          balance: creditsToAdd,
          lifetimeBought: creditsToAdd,
          lastTopUpAt: new Date()
        }
      })
    } else {
      // Bestehende Credits aktualisieren
      userCredits = await prisma.userCredits.update({
        where: { userId },
        data: {
          balance: { increment: creditsToAdd },
          lifetimeBought: { increment: creditsToAdd },
          lastTopUpAt: new Date()
        }
      })
    }

    // Credit Package Details laden für Beschreibung
    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: packageId },
      select: { name: true, credits: true, bonusCredits: true }
    })

    const description = creditPackage 
      ? `${creditPackage.name} gekauft (${creditPackage.credits} Credits${creditPackage.bonusCredits ? ` + ${creditPackage.bonusCredits} Bonus` : ''})`
      : `Credit-Paket gekauft (${creditsToAdd} Credits)`

    // Transaktion protokollieren
    await prisma.creditTransaction.create({
      data: {
        userId,
        userCreditsId: userCredits.id,
        type: 'purchase',
        amount: creditsToAdd,
        balanceBefore: currentBalance,
        balanceAfter: currentBalance + creditsToAdd,
        packageId,
        stripePaymentId: session.payment_intent as string,
        description,
        metadata: {
          sessionId: session.id,
          amountTotal: session.amount_total,
          currency: session.currency
        }
      }
    })

    console.log(`Credit purchase completed: ${creditsToAdd} credits added for user ${userId}`)

  } catch (error) {
    console.error('Error processing credit purchase:', error)
    throw error
  }
}

/**
 * Handle Subscription Checkout abgeschlossen
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId
  const subscriptionId = session.subscription as string

  if (!userId || !subscriptionId) {
    console.error('Checkout completed missing data:', { userId, subscriptionId })
    return
  }

  // Update user with subscription info
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripeSubscriptionStatus: 'active',
    },
  })

  console.log(`Checkout completed for user ${userId}, plan: ${planId}`)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) return

  // Get the current period end from the subscription
  const currentPeriodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    },
  })

  console.log(`Subscription created for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const currentPeriodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end

  if (!userId) {
    // Try to find user by subscription ID
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    })
    if (!user) return

    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionStatus: subscription.status,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      },
    })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionStatus: subscription.status,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      },
    })
  }

  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      stripePriceId: null,
    },
  })

  console.log(`Subscription canceled for user ${user.id}`)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription

  if (!subscriptionId) return

  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!user) return

  // Update subscription end date
  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const currentPeriodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    },
  })

  console.log(`Invoice paid for user ${user.id}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription

  if (!subscriptionId) return

  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionStatus: 'past_due',
    },
  })

  // E-Mail-Benachrichtigung senden
  try {
    const amount = invoice.amount_due 
      ? `${(invoice.amount_due / 100).toFixed(2)} €` 
      : undefined
    const invoiceUrl = invoice.hosted_invoice_url || undefined

    await emails.sendPaymentFailed(
      user.email,
      user.name || 'Geschätzte/r Kunde/in',
      amount,
      invoiceUrl
    )
    console.log(`Payment failed email sent to ${user.email}`)
  } catch (emailError) {
    console.error('Error sending payment failed email:', emailError)
  }

  console.log(`Payment failed for user ${user.id}`)
}

/**
 * Handle Trial endet in 3 Tagen
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  // User finden
  let user = userId 
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findFirst({ where: { stripeSubscriptionId: subscription.id } })

  if (!user) {
    console.error('User not found for trial ending subscription:', subscription.id)
    return
  }

  // Trial-Ende Datum berechnen
  const trialEnd = (subscription as Stripe.Subscription & { trial_end?: number }).trial_end
  if (!trialEnd) return

  const trialEndDate = new Date(trialEnd * 1000)
  const now = new Date()
  const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Plan-Name ermitteln
  const priceId = subscription.items.data[0]?.price.id
  let planName = 'Premium'
  
  if (priceId) {
    // Use raw SQL to avoid TypeScript issues with prisma types
    const plans = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM subscription_plans
      WHERE stripe_price_monthly = ${priceId}
         OR stripe_price_quarterly = ${priceId}
         OR stripe_price_six_months = ${priceId}
         OR stripe_price_yearly = ${priceId}
      LIMIT 1
    `
    if (plans.length > 0) planName = plans[0].name
  }

  // E-Mail senden
  try {
    await emails.sendTrialEndingSoon(
      user.email,
      user.name || 'Geschätzte/r Kunde/in',
      trialEndDate.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      }),
      daysRemaining,
      planName
    )
    console.log(`Trial ending email sent to ${user.email} (${daysRemaining} days remaining)`)
  } catch (emailError) {
    console.error('Error sending trial ending email:', emailError)
  }
}

/**
 * Handle Invoice finalized (Metered Billing)
 * Wird aufgerufen wenn Stripe die monatliche Rechnung erstellt
 */
async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription
  const customerId = invoice.customer as string
  
  console.log(`Invoice finalized: ${invoice.id}`)
  console.log(`  - Amount: ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency?.toUpperCase()}`)
  console.log(`  - Subscription: ${subscriptionId || 'N/A'}`)
  
  // Finde den User anhand der Customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.log('No user found for invoice, might be a test or external customer')
    return
  }

  // Prüfe ob diese Rechnung Metered Usage enthält
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceLines = invoice.lines?.data as any[]
  const hasMeteredUsage = invoiceLines?.some(line => {
    const price = line?.price
    return price && price.recurring?.usage_type === 'metered'
  })

  if (hasMeteredUsage) {
    console.log(`  - Contains metered usage for user ${user.id}`)
    
    // Berechne den Metered-Anteil
    const meteredAmount = invoiceLines
      ?.filter(line => {
        const price = line?.price
        return price && price.recurring?.usage_type === 'metered'
      })
      ?.reduce((sum, line) => sum + (line?.amount || 0), 0) || 0
    
    console.log(`  - Metered amount: ${(meteredAmount / 100).toFixed(2)} ${invoice.currency?.toUpperCase()}`)

    // Reset SpendingLimit für neuen Monat (wenn Rechnung bezahlt wird)
    // Dieser Reset passiert in handleInvoicePaid, hier nur logging
  }

  // E-Mail mit Rechnungsübersicht senden
  try {
    const amountFormatted = `${(invoice.amount_due / 100).toFixed(2)} €`
    const invoiceUrl = invoice.hosted_invoice_url || undefined
    const invoicePdf = invoice.invoice_pdf || undefined
    
    // Optional: Sende monatliche Kostenübersicht
    if (user.email && hasMeteredUsage) {
      console.log(`Would send invoice notification to ${user.email}`)
      // Hier könnte eine Email-Benachrichtigung gesendet werden
      // await emails.sendMonthlyUsageSummary(user.email, ...)
    }
  } catch (emailError) {
    console.error('Error processing invoice finalized:', emailError)
  }
}

/**
 * Reset SpendingLimit at the start of a new billing period
 * Uses Raw SQL due to Prisma types not being regenerated
 */
export async function resetMonthlySpendingLimits() {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Finde und resette alle SpendingLimits die seit dem Monatsersten nicht zurückgesetzt wurden
  const result = await prisma.$executeRaw`
    UPDATE spending_limits
    SET current_month_spent = 0,
        limit_hit_at = NULL,
        alert_sent_at = NULL,
        updated_at = NOW()
    WHERE updated_at < ${firstOfMonth}
  `

  console.log(`Reset ${result} spending limits for new month`)
  return result
}
