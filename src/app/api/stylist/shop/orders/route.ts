/**
 * API Route: Bestellungen für Stylisten
 * GET /api/stylist/shop/orders
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStylistOrders } from '@/lib/shopify'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId') || undefined
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const orders = await getStylistOrders(session.user.id, {
      salonId,
      status,
      limit,
      offset: (page - 1) * limit,
    })

    // Gesamtzahl für Pagination
    const total = await prisma.shopOrder.count({
      where: {
        stylistId: session.user.id,
        ...(salonId && { salonId }),
        ...(status && { status: status as never }),
      },
    })

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        salon: order.salon,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        status: order.status,
        paidAt: order.paidAt,
        readyAt: order.readyAt,
        pickedUpAt: order.pickedUpAt,
        notes: order.notes,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productTitle: item.productTitle,
          productImageUrl: item.productImageUrl,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Bestellungen:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

