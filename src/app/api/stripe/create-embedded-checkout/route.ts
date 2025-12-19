/**
 * Embedded Checkout API
 * 
 * Erstellt eine Checkout Session im Embedded-Modus
 * für ein nahtloses In-App Checkout-Erlebnis
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, isStripeConfigured } from '@/lib/stripe-server'
import { getStripePriceIdForInterval } from '@/lib/stripe/subscription-helpers'
import { BillingInterval } from '@prisma/client'

interface EmbeddedCheckoutRequest {
  planId: string
  interval: BillingInterval
}

export async function POST(req: NextRequest) {
  try {
    // Prüfe Stripe-Konfiguration
    if (!isStripeConfigured) {
      return NextResponse.json(
        { error: 'Stripe ist nicht konfiguriert. Bitte kontaktiere den Support.' },
        { status: 503 }
      )
    }

    const stripe = getStripe()
    const session = await auth()

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht autorisiert. Bitte melde dich an.' },
        { status: 401 }
      )
    }

    const body = await req.json() as EmbeddedCheckoutRequest
    const { planId, interval } = body

    // Validierung
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID ist erforderlich' },
        { status: 400 }
      )
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

    let customerId = user?.stripeCustomerId

    if (!customerId) {
      // Neuen Stripe Customer erstellen
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
          platform: 'nicnoa'
        }
      })
      customerId = customer.id

      // In DB speichern
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // URLs für Redirect nach Checkout
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const dashboardPath = user?.role === 'SALON_OWNER' ? '/salon' : '/stylist'

    // Embedded Checkout Session erstellen
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      ui_mode: 'embedded', // ← Embedded Mode aktivieren
      // Link für schnellen 1-Klick-Checkout aktivieren
      payment_method_types: ['card', 'link'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      subscription_data: {
        trial_period_days: plan.trialDays || undefined,
        metadata: {
          userId: session.user.id,
          planId: plan.id,
          interval: selectedInterval
        }
      },
      // Return URL für Embedded Checkout (mit Session ID Token)
      return_url: `${baseUrl}${dashboardPath}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      // Billing-Adresse erforderlich für automatic_tax
      billing_address_collection: 'required',
      // Speichere Adresse automatisch auf Customer
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      // Automatische Steuerberechnung
      automatic_tax: { enabled: true },
      // Steuer-ID Sammlung für B2B
      tax_id_collection: { enabled: true },
      // Erlaube Promo-Codes
      allow_promotion_codes: true,
      // Deutsche Lokalisierung
      locale: 'de',
      // Metadata für Tracking
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        planName: plan.name,
        interval: selectedInterval,
        type: 'subscription'
      }
    })

    // Client Secret für Embedded Checkout zurückgeben
    return NextResponse.json({
      clientSecret: checkoutSession.client_secret,
      sessionId: checkoutSession.id
    })

  } catch (error) {
    console.error('Embedded checkout error:', error)

    const message = error instanceof Error
      ? error.message
      : 'Fehler beim Erstellen der Checkout-Session'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}



