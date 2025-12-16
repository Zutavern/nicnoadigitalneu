import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripeService } from '@/lib/stripe/stripe-service'
import { isStripeConfigured } from '@/lib/stripe-server'
import { getStripePriceIdForInterval } from '@/lib/stripe/subscription-helpers'
import { BillingInterval } from '@prisma/client'

/**
 * GET /api/stripe/subscription/change
 * Vorschau für Plan-Wechsel (Proration)
 */
export async function GET(req: NextRequest) {
  try {
    if (!isStripeConfigured) {
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

    const { searchParams } = new URL(req.url)
    const newPlanId = searchParams.get('planId')
    const interval = searchParams.get('interval') as BillingInterval

    if (!newPlanId || !interval) {
      return NextResponse.json(
        { error: 'planId und interval sind erforderlich' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        stripeSubscriptionId: true, 
        stripeSubscriptionStatus: true,
        subscriptionPlanId: true
      }
    })

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Kein aktives Abonnement gefunden' },
        { status: 400 }
      )
    }

    // Neuen Plan laden
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId }
    })

    if (!newPlan) {
      return NextResponse.json(
        { error: 'Plan nicht gefunden' },
        { status: 404 }
      )
    }

    const newPriceId = getStripePriceIdForInterval(newPlan, interval)
    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Preis für das gewählte Intervall nicht verfügbar' },
        { status: 400 }
      )
    }

    // Proration-Vorschau von Stripe holen
    const preview = await stripeService.getProrationPreview({
      subscriptionId: user.stripeSubscriptionId,
      newPriceId
    })

    // Aktuellen Plan laden für Vergleich
    const currentPlan = user.subscriptionPlanId 
      ? await prisma.subscriptionPlan.findUnique({ where: { id: user.subscriptionPlanId } })
      : null

    return NextResponse.json({
      preview: {
        immediateCharge: preview.immediate / 100, // In Euro
        nextInvoice: preview.nextInvoice / 100,
        prorationDate: new Date(preview.prorationDate * 1000).toISOString(),
        isUpgrade: currentPlan ? Number(newPlan.priceMonthly) > Number(currentPlan.priceMonthly) : true
      },
      currentPlan: currentPlan ? {
        id: currentPlan.id,
        name: currentPlan.name,
        price: Number(currentPlan.priceMonthly)
      } : null,
      newPlan: {
        id: newPlan.id,
        name: newPlan.name,
        price: Number(newPlan.priceMonthly)
      }
    })

  } catch (error) {
    console.error('Error getting proration preview:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Vorschau' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stripe/subscription/change
 * Plan wechseln (Upgrade/Downgrade)
 */
export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured) {
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

    const body = await req.json()
    const { planId, interval } = body

    if (!planId || !interval) {
      return NextResponse.json(
        { error: 'planId und interval sind erforderlich' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        stripeSubscriptionId: true, 
        stripeSubscriptionStatus: true,
        subscriptionPlanId: true
      }
    })

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Kein aktives Abonnement gefunden' },
        { status: 400 }
      )
    }

    if (user.stripeSubscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Plan kann nur bei aktivem Abo gewechselt werden' },
        { status: 400 }
      )
    }

    // Neuen Plan laden
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!newPlan) {
      return NextResponse.json(
        { error: 'Plan nicht gefunden' },
        { status: 404 }
      )
    }

    const newPriceId = getStripePriceIdForInterval(newPlan, interval)
    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Preis für das gewählte Intervall nicht verfügbar' },
        { status: 400 }
      )
    }

    // Subscription in Stripe aktualisieren
    const subscription = await stripeService.updateSubscription(
      user.stripeSubscriptionId,
      newPriceId
    )

    // DB aktualisieren
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        subscriptionPlanId: planId,
        billingInterval: interval
      }
    })

    return NextResponse.json({
      message: `Plan erfolgreich auf "${newPlan.name}" gewechselt`,
      subscription: {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Error changing subscription:', error)
    return NextResponse.json(
      { error: 'Fehler beim Plan-Wechsel' },
      { status: 500 }
    )
  }
}

