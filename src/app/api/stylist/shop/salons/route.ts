/**
 * API Route: Salons mit Shop für Stylisten
 * GET /api/stylist/shop/salons
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

    // Alle Salons holen, mit denen der Stylist verbunden ist
    const connections = await prisma.salonStylistConnection.findMany({
      where: {
        stylistId: session.user.id,
        isActive: true,
      },
      include: {
        salon: {
          include: {
            shopifyConnection: {
              select: {
                id: true,
                storeName: true,
                isActive: true,
              },
            },
            shopSettings: {
              select: {
                allowStripePayment: true,
                allowRentAddition: true,
              },
            },
            _count: {
              select: {
                shopOrders: {
                  where: {
                    stylistId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Nur Salons mit aktivem Shop filtern
    const salonsWithShop = connections
      .filter(
        (conn) =>
          conn.salon.shopifyConnection?.isActive &&
          !conn.salon.isDeleted &&
          conn.salon.isActive
      )
      .map((conn) => ({
        id: conn.salon.id,
        name: conn.salon.name,
        slug: conn.salon.slug,
        images: conn.salon.images,
        shopName: conn.salon.shopifyConnection?.storeName,
        paymentOptions: {
          stripe: conn.salon.shopSettings?.allowStripePayment ?? true,
          rentAddition: conn.salon.shopSettings?.allowRentAddition ?? true,
        },
        orderCount: conn.salon._count.shopOrders,
        joinedAt: conn.joinedAt,
      }))

    return NextResponse.json({
      salons: salonsWithShop,
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Salons:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

