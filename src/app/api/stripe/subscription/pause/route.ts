import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripeService } from '@/lib/stripe/stripe-service'
import { isStripeConfigured } from '@/lib/stripe-server'

/**
 * POST /api/stripe/subscription/pause
 * Pausiert das aktuelle Abo des Nutzers
 */
export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe ist nicht konfiguriert' },
        { status: 503 }
      )
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeSubscriptionId: true, stripeSubscriptionStatus: true }
    })

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Kein aktives Abonnement gefunden' },
        { status: 400 }
      )
    }

    if (user.stripeSubscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Abonnement kann nur pausiert werden, wenn es aktiv ist' },
        { status: 400 }
      )
    }

    // Subscription in Stripe pausieren
    const subscription = await stripeService.pauseSubscription(user.stripeSubscriptionId)

    // Status in DB aktualisieren
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeSubscriptionStatus: 'paused' }
    })

    return NextResponse.json({
      message: 'Abonnement erfolgreich pausiert',
      pausedAt: new Date().toISOString(),
      subscription: {
        status: subscription.status,
        pauseCollection: subscription.pause_collection
      }
    })

  } catch (error) {
    console.error('Error pausing subscription:', error)
    return NextResponse.json(
      { error: 'Fehler beim Pausieren des Abonnements' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/stripe/subscription/pause
 * Reaktiviert ein pausiertes Abo
 */
export async function DELETE(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe ist nicht konfiguriert' },
        { status: 503 }
      )
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeSubscriptionId: true, stripeSubscriptionStatus: true }
    })

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Kein Abonnement gefunden' },
        { status: 400 }
      )
    }

    if (user.stripeSubscriptionStatus !== 'paused') {
      return NextResponse.json(
        { error: 'Abonnement ist nicht pausiert' },
        { status: 400 }
      )
    }

    // Subscription in Stripe reaktivieren
    const subscription = await stripeService.resumeSubscription(user.stripeSubscriptionId)

    // Status in DB aktualisieren
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeSubscriptionStatus: subscription.status }
    })

    return NextResponse.json({
      message: 'Abonnement erfolgreich reaktiviert',
      subscription: {
        status: subscription.status
      }
    })

  } catch (error) {
    console.error('Error resuming subscription:', error)
    return NextResponse.json(
      { error: 'Fehler beim Reaktivieren des Abonnements' },
      { status: 500 }
    )
  }
}

