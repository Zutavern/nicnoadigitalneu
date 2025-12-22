import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/salon/shop/affiliate/commissions - Get affiliate orders/commissions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Get user's salon
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedSalon: true },
    })

    if (!user || user.role !== 'SALON_OWNER' || !user.ownedSalon) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const salonId = user.ownedSalon.id

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const affiliateId = searchParams.get('affiliateId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build filter
    const where: Record<string, unknown> = { salonId }
    if (status) where.commissionStatus = status
    if (affiliateId) where.affiliateId = affiliateId

    // Get affiliate orders
    const [orders, totalOrders] = await Promise.all([
      prisma.affiliateOrder.findMany({
        where,
        include: {
          affiliate: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.affiliateOrder.count({ where }),
    ])

    // Get statistics
    const stats = await prisma.affiliateOrder.aggregate({
      where: { salonId },
      _sum: {
        orderTotal: true,
        commission: true,
      },
      _count: true,
    })

    // Get commission breakdown by status
    const commissionByStatus = await prisma.affiliateOrder.groupBy({
      by: ['commissionStatus'],
      where: { salonId },
      _sum: {
        commission: true,
      },
      _count: true,
    })

    // Get top affiliates
    const topAffiliates = await prisma.affiliateOrder.groupBy({
      by: ['affiliateId'],
      where: { salonId },
      _sum: {
        orderTotal: true,
        commission: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          orderTotal: 'desc',
        },
      },
      take: 5,
    })

    // Get affiliate names
    const affiliateIds = topAffiliates.map((a) => a.affiliateId)
    const affiliateUsers = await prisma.user.findMany({
      where: { id: { in: affiliateIds } },
      select: { id: true, name: true, email: true },
    })

    const affiliateMap = affiliateUsers.reduce(
      (acc, u) => {
        acc[u.id] = u
        return acc
      },
      {} as Record<string, { id: string; name: string | null; email: string | null }>
    )

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        affiliate: o.affiliate,
        shopifyOrderId: o.shopifyOrderId,
        shopifyOrderNumber: o.shopifyOrderNumber,
        customerName: o.customerName,
        orderTotal: o.orderTotal,
        commission: o.commission,
        status: o.status,
        commissionStatus: o.commissionStatus,
        payoutMethod: o.payoutMethod,
        paidOutAt: o.paidOutAt?.toISOString(),
        createdAt: o.createdAt.toISOString(),
      })),
      stats: {
        totalOrders: stats._count,
        totalRevenue: stats._sum.orderTotal || 0,
        totalCommission: stats._sum.commission || 0,
        breakdown: commissionByStatus.reduce(
          (acc, item) => {
            acc[item.commissionStatus] = {
              count: item._count,
              amount: item._sum.commission || 0,
            }
            return acc
          },
          {} as Record<string, { count: number; amount: number }>
        ),
      },
      topAffiliates: topAffiliates.map((a) => ({
        affiliate: affiliateMap[a.affiliateId],
        orders: a._count,
        revenue: a._sum.orderTotal || 0,
        commission: a._sum.commission || 0,
      })),
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching affiliate commissions:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// PUT /api/salon/shop/affiliate/commissions - Update commission status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedSalon: true },
    })

    if (!user || user.role !== 'SALON_OWNER' || !user.ownedSalon) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, action } = body

    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'Bestell-ID und Aktion erforderlich' },
        { status: 400 }
      )
    }

    // Validate action
    if (!['approve', 'pay', 'void'].includes(action)) {
      return NextResponse.json(
        { error: 'Ungültige Aktion' },
        { status: 400 }
      )
    }

    // Get order and verify it belongs to salon
    const order = await prisma.affiliateOrder.findUnique({
      where: { id: orderId },
    })

    if (!order || order.salonId !== user.ownedSalon.id) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      )
    }

    // Determine new status based on action
    let newStatus: string
    let paidOutAt: Date | null = null

    switch (action) {
      case 'approve':
        if (order.commissionStatus !== 'PENDING') {
          return NextResponse.json(
            { error: 'Nur ausstehende Provisionen können freigegeben werden' },
            { status: 400 }
          )
        }
        newStatus = 'APPROVED'
        break
      case 'pay':
        if (!['PENDING', 'APPROVED'].includes(order.commissionStatus)) {
          return NextResponse.json(
            { error: 'Provision kann nicht ausgezahlt werden' },
            { status: 400 }
          )
        }
        newStatus = 'PAID'
        paidOutAt = new Date()
        break
      case 'void':
        if (order.commissionStatus === 'PAID') {
          return NextResponse.json(
            { error: 'Ausgezahlte Provisionen können nicht storniert werden' },
            { status: 400 }
          )
        }
        newStatus = 'VOID'
        break
      default:
        return NextResponse.json(
          { error: 'Ungültige Aktion' },
          { status: 400 }
        )
    }

    // Update order
    const updatedOrder = await prisma.affiliateOrder.update({
      where: { id: orderId },
      data: {
        commissionStatus: newStatus,
        ...(paidOutAt && { paidOutAt }),
      },
    })

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        commissionStatus: updatedOrder.commissionStatus,
        paidOutAt: updatedOrder.paidOutAt?.toISOString(),
      },
      message:
        action === 'approve'
          ? 'Provision freigegeben'
          : action === 'pay'
            ? 'Provision als ausgezahlt markiert'
            : 'Provision storniert',
    })
  } catch (error) {
    console.error('Error updating commission:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// POST /api/salon/shop/affiliate/commissions - Bulk payout
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedSalon: true },
    })

    if (!user || user.role !== 'SALON_OWNER' || !user.ownedSalon) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { affiliateId, payoutMethod } = body

    if (!affiliateId) {
      return NextResponse.json(
        { error: 'Affiliate ID erforderlich' },
        { status: 400 }
      )
    }

    // Get all approved commissions for this affiliate
    const orders = await prisma.affiliateOrder.findMany({
      where: {
        salonId: user.ownedSalon.id,
        affiliateId,
        commissionStatus: 'APPROVED',
        ...(payoutMethod && { payoutMethod }),
      },
    })

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Keine freigegebenen Provisionen zum Auszahlen' },
        { status: 400 }
      )
    }

    // Mark all as paid
    const result = await prisma.affiliateOrder.updateMany({
      where: {
        id: { in: orders.map((o) => o.id) },
      },
      data: {
        commissionStatus: 'PAID',
        paidOutAt: new Date(),
      },
    })

    const totalAmount = orders.reduce((sum, o) => sum + o.commission, 0)

    return NextResponse.json({
      success: true,
      paidCount: result.count,
      totalAmount,
      message: `${result.count} Provisionen (${totalAmount.toFixed(2)} €) als ausgezahlt markiert`,
    })
  } catch (error) {
    console.error('Error bulk paying commissions:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

