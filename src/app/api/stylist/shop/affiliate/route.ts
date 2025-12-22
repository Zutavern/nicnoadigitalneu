import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/stylist/shop/affiliate - Get affiliate data for stylist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Check if user is a stylist
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        salons: {
          include: {
            shopifyConnections: {
              where: { isActive: true },
            },
            shopSettings: true,
          },
        },
      },
    })

    if (!user || user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Check if any salon has affiliate enabled
    const affiliateEnabledSalons = user.salons.filter(
      (s) =>
        s.shopifyConnections.length > 0 &&
        s.shopSettings?.affiliateEnabled
    )

    if (affiliateEnabledSalons.length === 0) {
      return NextResponse.json({
        enabled: false,
        orders: [],
        stats: null,
        message: 'Kein Salon hat das Affiliate-System aktiviert',
      })
    }

    // Build filter for orders
    const salonIds = salonId
      ? [salonId]
      : affiliateEnabledSalons.map((s) => s.id)

    // Get affiliate orders for this stylist
    const [orders, totalOrders] = await Promise.all([
      prisma.affiliateOrder.findMany({
        where: {
          affiliateId: session.user.id,
          salonId: { in: salonIds },
        },
        include: {
          salon: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.affiliateOrder.count({
        where: {
          affiliateId: session.user.id,
          salonId: { in: salonIds },
        },
      }),
    ])

    // Get statistics
    const stats = await prisma.affiliateOrder.aggregate({
      where: {
        affiliateId: session.user.id,
        salonId: { in: salonIds },
      },
      _sum: {
        orderTotal: true,
        commission: true,
      },
      _count: true,
    })

    // Get commission breakdown by status
    const commissionByStatus = await prisma.affiliateOrder.groupBy({
      by: ['commissionStatus'],
      where: {
        affiliateId: session.user.id,
        salonId: { in: salonIds },
      },
      _sum: {
        commission: true,
      },
    })

    const commissionBreakdown = commissionByStatus.reduce(
      (acc, item) => {
        acc[item.commissionStatus] = item._sum.commission || 0
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      enabled: true,
      orders: orders.map((o) => ({
        id: o.id,
        salon: o.salon,
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
        pendingCommission: commissionBreakdown.PENDING || 0,
        approvedCommission: commissionBreakdown.APPROVED || 0,
        paidCommission: commissionBreakdown.PAID || 0,
      },
      salons: affiliateEnabledSalons.map((s) => ({
        id: s.id,
        name: s.name,
        commissionRate: s.shopSettings?.defaultAffiliateCommission || 10,
      })),
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching affiliate data:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// PUT /api/stylist/shop/affiliate - Update payout preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { salonId, payoutMethod } = body

    if (!salonId || !payoutMethod) {
      return NextResponse.json(
        { error: 'Salon und Auszahlungsmethode erforderlich' },
        { status: 400 }
      )
    }

    // Validate payout method
    if (!['BANK_TRANSFER', 'RENT_DEDUCTION'].includes(payoutMethod)) {
      return NextResponse.json(
        { error: 'Ungültige Auszahlungsmethode' },
        { status: 400 }
      )
    }

    // Verify user is stylist assigned to this salon
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        salons: { select: { id: true } },
      },
    })

    if (!user || user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const isSalonAssigned = user.salons.some((s) => s.id === salonId)
    if (!isSalonAssigned) {
      return NextResponse.json(
        { error: 'Nicht diesem Salon zugeordnet' },
        { status: 403 }
      )
    }

    // Update payout method for all pending/approved orders from this salon
    await prisma.affiliateOrder.updateMany({
      where: {
        affiliateId: session.user.id,
        salonId,
        commissionStatus: { in: ['PENDING', 'APPROVED'] },
      },
      data: {
        payoutMethod,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Auszahlungsmethode aktualisiert',
    })
  } catch (error) {
    console.error('Error updating payout method:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
