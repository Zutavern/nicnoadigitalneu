/**
 * Create Checkout Intent API
 * 
 * Erstellt einen SetupIntent für Subscription-Checkout
 * Verwendet für Custom Checkout mit Elements
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe-server'
import prisma from '@/lib/prisma'
import { BillingInterval } from '@prisma/client'
import { getStripePriceIdForInterval } from '@/lib/stripe/subscription-helpers'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { planId, interval, userType } = await req.json()

    if (!planId || !interval) {
      return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })
    }

    // Interval validieren
    const validIntervals: BillingInterval[] = ['MONTHLY', 'QUARTERLY', 'SIX_MONTHS', 'YEARLY']
    const selectedInterval: BillingInterval = validIntervals.includes(interval)
      ? interval
      : 'MONTHLY'

    // Plan laden
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan nicht gefunden' },
        { status: 404 }
      )
    }

    // Stripe Price ID ermitteln
    const priceId = getStripePriceIdForInterval(plan, selectedInterval)

    if (!priceId) {
      return NextResponse.json(
        { error: `Kein Stripe-Preis für "${plan.name}" (${selectedInterval}) konfiguriert` },
        { status: 400 }
      )
    }

    // User laden oder Stripe Customer erstellen
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true, name: true, role: true }
    })

    // Stripe Client holen
    const stripe = getStripe()
    
    let customerId = user?.stripeCustomerId

    if (!customerId) {
      // Neuen Stripe Customer erstellen
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        metadata: {
          userId: session.user.id,
          role: user?.role || 'UNKNOWN',
        },
      })
      customerId = customer.id

      // Customer ID speichern
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Subscription mit PaymentIntent erstellen
    // Wir erstellen eine Subscription mit payment_behavior: 'default_incomplete'
    // Das gibt uns einen PaymentIntent mit clientSecret zurück
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card', 'sepa_debit', 'link'],
      },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: plan.trialDays || undefined,
      metadata: {
        userId: session.user.id,
        planId: planId,
        interval: selectedInterval,
        userType: userType || 'UNKNOWN',
      },
    })

    // Client Secret aus dem PaymentIntent extrahieren
    const invoice = subscription.latest_invoice as {
      payment_intent?: {
        client_secret: string
      }
    }
    
    const clientSecret = invoice?.payment_intent?.client_secret

    if (!clientSecret) {
      // Falls Trial Period ohne PaymentIntent
      // In diesem Fall verwenden wir SetupIntent
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card', 'sepa_debit', 'link'],
        metadata: {
          subscription_id: subscription.id,
          userId: session.user.id,
          planId: planId,
        },
      })

      return NextResponse.json({
        clientSecret: setupIntent.client_secret,
        subscriptionId: subscription.id,
        type: 'setup',
      })
    }

    return NextResponse.json({
      clientSecret,
      subscriptionId: subscription.id,
      type: 'payment',
    })

  } catch (error) {
    console.error('Error creating checkout intent:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler beim Erstellen des Checkout' },
      { status: 500 }
    )
  }
}

