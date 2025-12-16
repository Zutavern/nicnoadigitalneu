import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isStripeConfigured } from '@/lib/stripe-server'
import { stripeService } from '@/lib/stripe/stripe-service'
import { BillingInterval } from '@prisma/client'

interface CheckoutRequest {
  planId: string
  interval: string
}

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured) {
      return NextResponse.json(
        { error: 'Stripe ist nicht konfiguriert' }, 
        { status: 503 }
      )
    }

    const session = await auth()

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' }, 
        { status: 401 }
      )
    }

    const body = await req.json() as CheckoutRequest
    const { planId, interval } = body

    // Validierung
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID ist erforderlich' }, 
        { status: 400 }
      )
    }

    // Interval validieren (Standard: MONTHLY)
    const validIntervals: BillingInterval[] = ['MONTHLY', 'QUARTERLY', 'SIX_MONTHS', 'YEARLY']
    const selectedInterval: BillingInterval = validIntervals.includes(interval as BillingInterval) 
      ? (interval as BillingInterval) 
      : 'MONTHLY'

    // Customer erstellen oder abrufen
    const customerId = await stripeService.getOrCreateCustomer(
      session.user.id,
      session.user.email,
      session.user.name || undefined
    )

    // URLs für Redirect
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Bestimme die Rückleitung basierend auf der User-Rolle
    const userRole = session.user.role || 'STYLIST'
    const dashboardPath = userRole === 'SALON_OWNER' ? '/salon' : '/stylist'

    // Checkout Session erstellen
    const checkoutSession = await stripeService.createSubscriptionCheckout({
      customerId,
      planId,
      interval: selectedInterval,
      userId: session.user.id,
      successUrl: `${baseUrl}${dashboardPath}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/preise?canceled=true`
    })

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    })

  } catch (error) {
    console.error('Checkout error:', error)
    
    const message = error instanceof Error 
      ? error.message 
      : 'Fehler beim Erstellen der Checkout-Session'
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
