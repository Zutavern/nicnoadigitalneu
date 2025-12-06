import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe, isStripeConfigured } from '@/lib/stripe-server'
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Kein Stripe-Kunde gefunden' },
        { status: 400 }
      )
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Portal-Session' },
      { status: 500 }
    )
  }
}

