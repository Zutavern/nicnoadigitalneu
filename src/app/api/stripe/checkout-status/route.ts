/**
 * Checkout Status API
 * 
 * Prüft den Status einer Checkout Session
 * Wird nach dem Embedded Checkout aufgerufen
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe-server'

export async function GET(req: NextRequest) {
  try {
    if (!isStripeConfigured) {
      return NextResponse.json(
        { error: 'Stripe ist nicht konfiguriert' },
        { status: 503 }
      )
    }

    const stripe = getStripe()
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID erforderlich' },
        { status: 400 }
      )
    }

    // Checkout Session abrufen
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription']
    })

    // Plan-Name aus Line Items extrahieren
    let planName: string | undefined
    if (session.line_items?.data?.[0]?.description) {
      planName = session.line_items.data[0].description
    }

    return NextResponse.json({
      status: session.status,
      customerEmail: session.customer_details?.email,
      planName,
      paymentStatus: session.payment_status,
    })

  } catch (error) {
    console.error('Error checking checkout status:', error)
    return NextResponse.json(
      { error: 'Fehler beim Prüfen des Checkout-Status' },
      { status: 500 }
    )
  }
}



