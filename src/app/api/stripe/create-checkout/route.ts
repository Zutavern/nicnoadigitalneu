import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe, isStripeConfigured } from '@/lib/stripe-server'
import { PRICING_PLANS, PlanId } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured || !stripe) {
      return NextResponse.json({ error: 'Stripe ist nicht konfiguriert' }, { status: 503 })
    }

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { planId } = await req.json() as { planId: PlanId }

    if (!planId || !PRICING_PLANS[planId]) {
      return NextResponse.json({ error: 'Ungültiger Plan' }, { status: 400 })
    }

    const plan = PRICING_PLANS[planId]

    if (!plan.priceId) {
      return NextResponse.json({ error: 'Dieser Plan hat keinen Preis' }, { status: 400 })
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })

      customerId = customer.id

      // Save customer ID to user
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/preise?canceled=true`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: user.id,
          planId: plan.id,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Checkout-Session' },
      { status: 500 }
    )
  }
}

