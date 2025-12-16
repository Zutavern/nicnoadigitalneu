import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isStripeConfigured } from '@/lib/stripe-server'

/**
 * GET /api/admin/billing-settings
 * Lädt die globalen Billing-Einstellungen
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Singleton-Einstellungen laden oder erstellen
    let settings = await prisma.billingSetting.findUnique({
      where: { id: 'default' }
    })

    if (!settings) {
      settings = await prisma.billingSetting.create({
        data: { id: 'default' }
      })
    }

    // Stripe-Status prüfen (isStripeConfigured ist ein boolean, keine Funktion)
    const stripeConfigured = isStripeConfigured

    return NextResponse.json({
      settings,
      stripeConfigured,
      stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test'
    })

  } catch (error) {
    console.error('Error fetching billing settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einstellungen' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/billing-settings
 * Aktualisiert die globalen Billing-Einstellungen
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Validierung
    const validFields = [
      'monthlyEnabled', 'quarterlyEnabled', 'sixMonthsEnabled', 'yearlyEnabled',
      'monthlyDiscount', 'quarterlyDiscount', 'sixMonthsDiscount', 'yearlyDiscount',
      'defaultInterval', 'defaultTrialDays', 'trialEnabled', 'trialRequiresCard',
      'currency', 'currencySign', 'couponsEnabled', 'showCouponOnPricing',
      'moneyBackEnabled', 'moneyBackDays',
      'priceRoundingEnabled', 'priceRoundingTarget'
    ]

    const updateData: Record<string, unknown> = {}
    
    for (const field of validFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Mindestens ein Intervall muss aktiv sein
    const activeIntervals = [
      updateData.monthlyEnabled ?? true,
      updateData.quarterlyEnabled ?? true,
      updateData.sixMonthsEnabled ?? true,
      updateData.yearlyEnabled ?? true
    ].filter(Boolean).length

    if (activeIntervals === 0) {
      return NextResponse.json(
        { error: 'Mindestens ein Billing-Intervall muss aktiv sein' },
        { status: 400 }
      )
    }

    // Upsert: erstellen falls nicht vorhanden, sonst aktualisieren
    const settings = await prisma.billingSetting.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...updateData },
      update: updateData
    })

    return NextResponse.json({
      settings,
      message: 'Einstellungen erfolgreich aktualisiert'
    })

  } catch (error) {
    console.error('Error updating billing settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Einstellungen' },
      { status: 500 }
    )
  }
}

