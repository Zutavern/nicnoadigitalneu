/**
 * API Route: Produkte synchronisieren
 * POST /api/salon/shop/sync
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { syncProducts } from '@/lib/shopify'

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

    // Produkte synchronisieren
    const result = await syncProducts(salon.shopifyConnection.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.errors.join(', ') || 'Synchronisierung fehlgeschlagen' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Produkte erfolgreich synchronisiert',
      stats: {
        created: result.productsCreated,
        updated: result.productsUpdated,
        removed: result.productsRemoved,
      },
    })
  } catch (error) {
    console.error('Fehler bei der Synchronisierung:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

