/**
 * API Route: Shop-Einstellungen
 * GET/PUT /api/salon/shop/settings
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
        isActive: true,
        isDeleted: false,
      },
      include: {
        shopSettings: true,
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 403 })
    }

    if (!salon.shopSettings) {
      return NextResponse.json(
        { error: 'Keine Shop-Einstellungen gefunden. Bitte verbinden Sie zuerst Shopify.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      settings: {
        defaultMarginType: salon.shopSettings.defaultMarginType,
        defaultMarginValue: Number(salon.shopSettings.defaultMarginValue),
        defaultCommissionType: salon.shopSettings.defaultCommissionType,
        defaultCommissionValue: Number(salon.shopSettings.defaultCommissionValue),
        allowStripePayment: salon.shopSettings.allowStripePayment,
        allowRentAddition: salon.shopSettings.allowRentAddition,
        affiliateEnabled: salon.shopSettings.affiliateEnabled,
      },
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Einstellungen:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
        isActive: true,
        isDeleted: false,
      },
      include: {
        shopSettings: true,
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 403 })
    }

    if (!salon.shopSettings) {
      return NextResponse.json(
        { error: 'Keine Shop-Einstellungen gefunden' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validierung
    const {
      defaultMarginType,
      defaultMarginValue,
      defaultCommissionType,
      defaultCommissionValue,
      allowStripePayment,
      allowRentAddition,
      affiliateEnabled,
    } = body

    if (defaultMarginType && !['PERCENTAGE', 'FIXED'].includes(defaultMarginType)) {
      return NextResponse.json(
        { error: 'Ungültiger Marge-Typ' },
        { status: 400 }
      )
    }

    if (defaultCommissionType && !['PERCENTAGE', 'FIXED'].includes(defaultCommissionType)) {
      return NextResponse.json(
        { error: 'Ungültiger Provisions-Typ' },
        { status: 400 }
      )
    }

    if (defaultMarginValue !== undefined && (defaultMarginValue < 0 || defaultMarginValue > 100)) {
      return NextResponse.json(
        { error: 'Marge muss zwischen 0 und 100 liegen' },
        { status: 400 }
      )
    }

    if (defaultCommissionValue !== undefined && (defaultCommissionValue < 0 || defaultCommissionValue > 100)) {
      return NextResponse.json(
        { error: 'Provision muss zwischen 0 und 100 liegen' },
        { status: 400 }
      )
    }

    // Einstellungen aktualisieren
    const updatedSettings = await prisma.shopSettings.update({
      where: { id: salon.shopSettings.id },
      data: {
        ...(defaultMarginType && { defaultMarginType }),
        ...(defaultMarginValue !== undefined && { defaultMarginValue }),
        ...(defaultCommissionType && { defaultCommissionType }),
        ...(defaultCommissionValue !== undefined && { defaultCommissionValue }),
        ...(allowStripePayment !== undefined && { allowStripePayment }),
        ...(allowRentAddition !== undefined && { allowRentAddition }),
        ...(affiliateEnabled !== undefined && { affiliateEnabled }),
      },
    })

    return NextResponse.json({
      success: true,
      settings: {
        defaultMarginType: updatedSettings.defaultMarginType,
        defaultMarginValue: Number(updatedSettings.defaultMarginValue),
        defaultCommissionType: updatedSettings.defaultCommissionType,
        defaultCommissionValue: Number(updatedSettings.defaultCommissionValue),
        allowStripePayment: updatedSettings.allowStripePayment,
        allowRentAddition: updatedSettings.allowRentAddition,
        affiliateEnabled: updatedSettings.affiliateEnabled,
      },
    })
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Einstellungen:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

