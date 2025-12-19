import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, isStripeConfigured } from '@/lib/stripe-server'
import { isDemoModeActive, getMockUserSubscription } from '@/lib/mock-data'

// GET /api/user/subscription - Aktuelle Subscription des Users abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        ...getMockUserSubscription(),
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Hole Details zum aktuellen Plan
    let currentPlan = null
    let stripeSubscription = null

    if (user.stripePriceId) {
      // Finde den Plan anhand der Stripe Price ID
      currentPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          OR: [
            { stripePriceMonthly: user.stripePriceId },
            { stripePriceQuarterly: user.stripePriceId },
            { stripePriceYearly: user.stripePriceId }
          ]
        }
      })
    }

    // Hole erweiterte Stripe-Infos wenn vorhanden
    if (user.stripeSubscriptionId && isStripeConfigured) {
      try {
        const stripe = getStripe()
        stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
      } catch (e) {
        console.error('Error fetching Stripe subscription:', e)
      }
    }

    // Bestimme den Billing-Intervall
    let billingInterval = 'monthly'
    if (currentPlan && user.stripePriceId) {
      if (user.stripePriceId === currentPlan.stripePriceYearly) {
        billingInterval = 'yearly'
      } else if (user.stripePriceId === currentPlan.stripePriceQuarterly) {
        billingInterval = 'quarterly'
      }
    }

    // Verfügbare Pläne für den User (basierend auf Rolle)
    const planType = user.role === 'SALON_OWNER' ? 'SALON_OWNER' : 'STYLIST'
    const availablePlans = await prisma.subscriptionPlan.findMany({
      where: {
        planType,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({
      subscription: {
        status: user.stripeSubscriptionStatus || 'none',
        currentPeriodEnd: user.stripeCurrentPeriodEnd,
        cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end || false,
        billingInterval
      },
      currentPlan,
      availablePlans,
      stripeCustomerId: user.stripeCustomerId,
      hasActiveSubscription: ['active', 'trialing'].includes(user.stripeSubscriptionStatus || '')
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Subscription' },
      { status: 500 }
    )
  }
}

// POST /api/user/subscription - Subscription erstellen oder upgraden
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (!isStripeConfigured) {
      return NextResponse.json({ error: 'Stripe ist nicht konfiguriert' }, { status: 503 })
    }

    const body = await request.json()
    const { planId, interval = 'monthly', referralCode } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan-ID erforderlich' }, { status: 400 })
    }

    const stripe = getStripe()

    // Hole den Plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Plan nicht verfügbar' }, { status: 404 })
    }

    // Bestimme die Stripe Price ID
    let priceId: string | null = null
    switch (interval) {
      case 'yearly':
        priceId = plan.stripePriceYearly
        break
      case 'quarterly':
        priceId = plan.stripePriceQuarterly
        break
      default:
        priceId = plan.stripePriceMonthly
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe-Preise für diesen Plan nicht konfiguriert' },
        { status: 400 }
      )
    }

    // Hole den User
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Erstelle oder hole Stripe Customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          role: user.role
        }
      })
      customerId = customer.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Prüfe Referral Code
    let couponId: string | undefined
    if (referralCode) {
      const referral = await prisma.referral.findFirst({
        where: {
          code: referralCode,
          status: 'REGISTERED',
          referredId: user.id
        }
      })

      if (referral) {
        // Erstelle einen Coupon für den ersten Monat gratis
        const coupon = await stripe.coupons.create({
          percent_off: 100,
          duration: 'once',
          name: 'Referral Bonus - 1 Monat gratis',
          metadata: {
            referralId: referral.id
          }
        })
        couponId = coupon.id
      }
    }

    // Erstelle Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      // Link für schnellen 1-Klick-Checkout + SEPA für deutsche Kunden
      payment_method_types: ['card', 'link', 'sepa_debit'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings/billing?canceled=true`,
      subscription_data: {
        trial_period_days: plan.trialDays,
        metadata: {
          userId: user.id,
          planId: plan.id,
          planSlug: plan.slug,
          interval
        }
      },
      ...(couponId && { discounts: [{ coupon: couponId }] }),
      allow_promotion_codes: !couponId, // Erlaube Promo-Codes wenn kein Referral
      billing_address_collection: 'required',
      // Speichere die Adresse automatisch auf dem Customer
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      // Stripe Tax für automatische MwSt-Berechnung
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      locale: 'de'
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Subscription' },
      { status: 500 }
    )
  }
}

// PUT /api/user/subscription - Subscription ändern (Upgrade/Downgrade)
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (!isStripeConfigured) {
      return NextResponse.json({ error: 'Stripe ist nicht konfiguriert' }, { status: 503 })
    }

    const body = await request.json()
    const { planId, interval = 'monthly' } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan-ID erforderlich' }, { status: 400 })
    }

    const stripe = getStripe()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Keine aktive Subscription gefunden' },
        { status: 400 }
      )
    }

    // Hole den neuen Plan
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!newPlan || !newPlan.isActive) {
      return NextResponse.json({ error: 'Plan nicht verfügbar' }, { status: 404 })
    }

    // Bestimme die neue Price ID
    let newPriceId: string | null = null
    switch (interval) {
      case 'yearly':
        newPriceId = newPlan.stripePriceYearly
        break
      case 'quarterly':
        newPriceId = newPlan.stripePriceQuarterly
        break
      default:
        newPriceId = newPlan.stripePriceMonthly
    }

    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Stripe-Preise für diesen Plan nicht konfiguriert' },
        { status: 400 }
      )
    }

    // Hole aktuelle Subscription
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)

    // Update die Subscription
    const updatedSubscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId
          }
        ],
        proration_behavior: 'create_prorations',
        metadata: {
          planId: newPlan.id,
          planSlug: newPlan.slug,
          interval
        }
      }
    )

    // Update in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripePriceId: newPriceId,
        stripeCurrentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription wurde aktualisiert',
      subscription: {
        status: updatedSubscription.status,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000)
      }
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/user/subscription - Subscription kündigen
export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (!isStripeConfigured) {
      return NextResponse.json({ error: 'Stripe ist nicht konfiguriert' }, { status: 503 })
    }

    const stripe = getStripe()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Keine aktive Subscription gefunden' },
        { status: 400 }
      )
    }

    // Kündige zum Ende der Periode
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Subscription wird zum Ende der Periode gekündigt',
      cancelAt: new Date(subscription.current_period_end * 1000)
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Fehler beim Kündigen der Subscription' },
      { status: 500 }
    )
  }
}

