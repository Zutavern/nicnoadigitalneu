import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, isStripeConfigured } from '@/lib/stripe-server'
import { prisma } from '@/lib/prisma'
import emails from '@/lib/email'
import { ServerSubscriptionEvents } from '@/lib/analytics-server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured || !stripe || !webhookSecret) {
      return NextResponse.json({ error: 'Stripe ist nicht konfiguriert' }, { status: 503 })
    }

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
        await handleCheckoutCompleted(session)
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const subscriptionId = session.subscription as string
  const planName = session.metadata?.planName || 'Premium'

  if (!userId || !subscriptionId) return

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true }
  })

  if (!user) return

  // Update user with subscription info
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripeSubscriptionStatus: 'active',
    },
  })

  // Track subscription created event in PostHog
  const amount = session.amount_total ? session.amount_total / 100 : 0
  const interval = session.metadata?.billingInterval === 'year' ? 'year' : 'month'
  
  await ServerSubscriptionEvents.subscriptionCreated(
    userId,
    session.metadata?.priceId || subscriptionId,
    planName,
    amount,
    interval as 'month' | 'year'
  )

  // Create welcome notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'WELCOME',
      title: 'Willkommen bei NICNOA!',
      message: 'Dein Abonnement ist jetzt aktiv. Entdecke alle Funktionen!',
      link: '/dashboard'
    }
  })

  // Send welcome & subscription email
  await emails.sendSubscriptionActivated(
    user.email,
    user.name || 'Nutzer',
    planName,
    userId
  )

  // Log security event
  await prisma.securityLog.create({
    data: {
      userId,
      userEmail: session.customer_email || 'unknown',
      event: 'SETTINGS_CHANGED',
      status: 'SUCCESS',
      message: `Subscription aktiviert: ${subscriptionId}`,
      metadata: { subscriptionId, sessionId: session.id }
    }
  })

  console.log(`Checkout completed for user ${userId}`)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) return

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })

  // Track trial started if subscription is in trial
  if (subscription.status === 'trialing' && subscription.trial_end) {
    const trialDays = Math.ceil((subscription.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    await ServerSubscriptionEvents.trialStarted(
      userId,
      subscription.items.data[0]?.price.id || subscription.id,
      trialDays
    )
  }

  console.log(`Subscription created for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  let targetUserId = subscription.metadata?.userId

  if (!targetUserId) {
    // Try to find user by subscription ID
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    })
    if (!user) return
    targetUserId = user.id
  }

  // Get old subscription status to detect changes
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { 
      stripePriceId: true, 
      stripeSubscriptionStatus: true 
    }
  })

  const oldPriceId = user?.stripePriceId
  const newPriceId = subscription.items.data[0]?.price.id
  const oldStatus = user?.stripeSubscriptionStatus

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      stripeSubscriptionStatus: subscription.status,
      stripePriceId: newPriceId,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })

  // Track plan changes
  if (oldPriceId && newPriceId && oldPriceId !== newPriceId) {
    // Determine if upgrade or downgrade (you'd need to compare prices here)
    // For now, just track as upgrade
    await ServerSubscriptionEvents.subscriptionUpgraded(
      targetUserId,
      oldPriceId,
      newPriceId,
      subscription.items.data[0]?.price.unit_amount || 0
    )
  }

  // Track subscription renewed
  if (oldStatus === 'past_due' && subscription.status === 'active') {
    await ServerSubscriptionEvents.subscriptionRenewed(
      targetUserId,
      newPriceId || subscription.id,
      subscription.items.data[0]?.price.unit_amount || 0
    )
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

  // Track subscription cancelled in PostHog
  await ServerSubscriptionEvents.subscriptionCancelled(
    user.id,
    subscription.items.data[0]?.price.id || subscription.id,
    subscription.cancellation_details?.reason || undefined
  )

  // Create notification for canceled subscription
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'SUBSCRIPTION_EXPIRED',
      title: 'Abonnement gekündigt',
      message: 'Dein Abonnement wurde beendet. Du kannst jederzeit ein neues Abonnement abschließen.',
      link: '/pricing'
    }
  })

  // Send subscription expired email
  await emails.sendSubscriptionExpired(
    user.email,
    user.name || 'Nutzer',
    user.id
  )

  console.log(`Subscription canceled for user ${user.id}`)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!user) return

  // Track payment succeeded in PostHog
  await ServerSubscriptionEvents.paymentSucceeded(
    user.id,
    invoice.amount_paid || 0,
    invoice.currency?.toUpperCase() || 'EUR',
    invoice.id
  )

  // Update subscription end date
  const subscription = await stripe!.subscriptions.retrieve(subscriptionId)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })

  // Send invoice receipt email
  const amount = invoice.amount_paid ? `${(invoice.amount_paid / 100).toFixed(2)} €` : '0,00 €'
  const invoiceNumber = invoice.number || `INV-${Date.now()}`
  const invoiceUrl = invoice.hosted_invoice_url || `${process.env.NEXTAUTH_URL}/settings/billing`

  await emails.sendInvoiceReceipt(
    user.email,
    user.name || 'Nutzer',
    invoiceNumber,
    amount,
    invoiceUrl,
    user.id
  )

  console.log(`Invoice paid for user ${user.id}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!user) return

  const amount = invoice.amount_due ? `${(invoice.amount_due / 100).toFixed(2)} €` : 'Unbekannt'

  // Track payment failed in PostHog
  await ServerSubscriptionEvents.paymentFailed(
    user.id,
    invoice.amount_due || 0,
    invoice.last_finalization_error?.message || 'Unknown error',
    invoice.id
  )

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeSubscriptionStatus: 'past_due',
    },
  })

  // Create notification for failed payment
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'SUBSCRIPTION_EXPIRING',
      title: 'Zahlung fehlgeschlagen',
      message: 'Die Zahlung für dein Abonnement konnte nicht verarbeitet werden. Bitte aktualisiere deine Zahlungsmethode.',
      link: '/settings/billing'
    }
  })

  // Send payment failed email to user
  const retryUrl = `${process.env.NEXTAUTH_URL || 'https://nicnoa.de'}/settings/billing`
  await emails.sendPaymentFailed(
    user.email,
    user.name || 'Nutzer',
    amount,
    retryUrl,
    user.id
  )

  // Notify admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true }
  })

  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'SYSTEM_ALERT',
        title: 'Zahlungsausfall',
        message: `Zahlung fehlgeschlagen für ${user.email}`,
        link: '/admin/subscriptions',
        metadata: { userId: user.id, invoiceId: invoice.id }
      }
    })
  }

  console.log(`Payment failed for user ${user.id}`)
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    })
    if (!user) return

    // Track trial ending warning
    await ServerSubscriptionEvents.trialExpired(user.id, false)
    return
  }

  // Track trial ending warning in PostHog
  const trialEnd = subscription.trial_end
  const daysRemaining = trialEnd 
    ? Math.ceil((trialEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  // Note: This is a warning, not the actual expiry
  // The actual trial_expired event is handled when subscription status changes
  console.log(`Trial will end in ${daysRemaining} days for user ${userId}`)
}
