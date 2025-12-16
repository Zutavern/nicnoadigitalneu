import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isStripeConfigured } from '@/lib/stripe-server'
import { stripeService } from '@/lib/stripe/stripe-service'

interface CreditCheckoutRequest {
  packageId: string
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

    const body = await req.json() as CreditCheckoutRequest
    const { packageId } = body

    // Validierung
    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID ist erforderlich' }, 
        { status: 400 }
      )
    }

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
    const creditsPath = userRole === 'SALON_OWNER' ? '/salon/credits' : '/stylist/credits'

    // Checkout Session erstellen
    const checkoutSession = await stripeService.createCreditCheckout({
      customerId,
      packageId,
      userId: session.user.id,
      successUrl: `${baseUrl}${creditsPath}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}${creditsPath}?canceled=true`
    })

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    })

  } catch (error) {
    console.error('Credit checkout error:', error)
    
    const message = error instanceof Error 
      ? error.message 
      : 'Fehler beim Erstellen der Checkout-Session'
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

