/**
 * Plan Details API
 * 
 * GET /api/plans/[planId]
 * Gibt Details zu einem einzelnen Plan zurück
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ planId: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { planId } = await params

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        planType: true,
        priceMonthly: true,
        priceQuarterly: true,
        priceSixMonths: true,
        priceYearly: true,
        features: true,
        maxChairs: true,
        maxBookings: true,
        maxCustomers: true,
        isPopular: true,
        trialDays: true,
        includedAiCreditsEur: true,
        // Keine Stripe IDs zurückgeben (Sicherheit)
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan nicht gefunden' },
        { status: 404 }
      )
    }

    // Preise in Zahlen konvertieren
    return NextResponse.json({
      ...plan,
      priceMonthly: Number(plan.priceMonthly),
      priceQuarterly: Number(plan.priceQuarterly),
      priceSixMonths: Number(plan.priceSixMonths),
      priceYearly: Number(plan.priceYearly),
      includedAiCreditsEur: plan.includedAiCreditsEur ? Number(plan.includedAiCreditsEur) : 0,
    })

  } catch (error) {
    console.error('Error fetching plan:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Plans' },
      { status: 500 }
    )
  }
}



