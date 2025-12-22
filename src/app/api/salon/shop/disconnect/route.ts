/**
 * API Route: Shopify Store trennen
 * POST /api/salon/shop/disconnect
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
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
        shopifyConnection: true,
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 403 })
    }

    if (!salon.shopifyConnection) {
      return NextResponse.json(
        { error: 'Keine aktive Shopify-Verbindung gefunden' },
        { status: 400 }
      )
    }

    // Prüfen auf offene Bestellungen
    const openOrders = await prisma.shopOrder.count({
      where: {
        salonId: salon.id,
        status: { in: ['PENDING', 'PAID', 'READY'] },
      },
    })

    if (openOrders > 0) {
      return NextResponse.json(
        {
          error: `Es gibt noch ${openOrders} offene Bestellung(en). Bitte alle Bestellungen abschließen oder stornieren.`,
        },
        { status: 400 }
      )
    }

    // Verbindung und zugehörige Daten löschen
    // (CASCADE löscht automatisch Produkte, Cart-Items, etc.)
    await prisma.shopifyConnection.delete({
      where: { id: salon.shopifyConnection.id },
    })

    // Shop-Einstellungen löschen
    await prisma.shopSettings.deleteMany({
      where: { salonId: salon.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Shopify-Verbindung erfolgreich getrennt',
    })
  } catch (error) {
    console.error('Fehler beim Trennen der Verbindung:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

