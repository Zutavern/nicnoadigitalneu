/**
 * API Route: Bestellungen
 * GET /api/salon/shop/orders
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSalonOrders, updateOrderStatus, getOrderStats } from '@/lib/shopify'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
        isActive: true,
        isDeleted: false,
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 403 })
    }

    const orders = await getSalonOrders(salon.id, {
      status,
      limit,
      offset: (page - 1) * limit,
    })

    // Bestellstatistiken holen
    const stats = await getOrderStats(salon.id)

    // Gesamtzahl für Pagination
    const total = await prisma.shopOrder.count({
      where: {
        salonId: salon.id,
        ...(status && { status: status as never }),
      },
    })

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        stylist: order.stylist,
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
      stats,
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Bestellungen:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
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
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Bestellungs-ID und Status sind erforderlich' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'PAID', 'READY', 'PICKED_UP', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Ungültiger Status' },
        { status: 400 }
      )
    }

    const success = await updateOrderStatus(orderId, salon.id, status)

    if (!success) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden oder keine Berechtigung' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Bestellstatus auf "${status}" geändert`,
    })
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Bestellung:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

