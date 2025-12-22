/**
 * API Route: Shop-Analytics
 * GET /api/salon/shop/analytics
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrderStats, getInventoryStats } from '@/lib/shopify'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const periodDays = parseInt(searchParams.get('days') || '30', 10)

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

    // Zeitraum berechnen
    const now = new Date()
    const periodStart = new Date(now)
    periodStart.setDate(periodStart.getDate() - periodDays)

    // Bestellstatistiken für den Zeitraum
    const orderStats = await getOrderStats(salon.id, {
      start: periodStart,
      end: now,
    })

    // Inventar-Statistiken
    const inventoryStats = await getInventoryStats(salon.id)

    // Affiliate-Statistiken
    const affiliateOrders = await prisma.affiliateOrder.findMany({
      where: {
        salonId: salon.id,
        createdAt: { gte: periodStart },
      },
      select: {
        orderTotal: true,
        commission: true,
        commissionStatus: true,
      },
    })

    const affiliateStats = {
      totalOrders: affiliateOrders.length,
      totalRevenue: affiliateOrders.reduce(
        (sum, o) =>
          sum +
          (typeof o.orderTotal === 'object'
            ? o.orderTotal.toNumber()
            : Number(o.orderTotal)),
        0
      ),
      totalCommission: affiliateOrders.reduce(
        (sum, o) =>
          sum +
          (typeof o.commission === 'object'
            ? o.commission.toNumber()
            : Number(o.commission)),
        0
      ),
      pendingCommissions: affiliateOrders
        .filter((o) => o.commissionStatus === 'PENDING')
        .reduce(
          (sum, o) =>
            sum +
            (typeof o.commission === 'object'
              ? o.commission.toNumber()
              : Number(o.commission)),
          0
        ),
    }

    // Top-Produkte nach Verkaufsmenge
    const topProducts = await prisma.shopOrderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          salonId: salon.id,
          createdAt: { gte: periodStart },
          status: { not: 'CANCELLED' },
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    })

    // Produkt-Details für Top-Produkte
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.shopProduct.findUnique({
          where: { id: item.productId },
          select: { id: true, title: true, imageUrl: true },
        })

        return {
          product,
          totalQuantity: item._sum.quantity || 0,
          totalRevenue: item._sum.total
            ? typeof item._sum.total === 'object'
              ? item._sum.total.toNumber()
              : Number(item._sum.total)
            : 0,
        }
      })
    )

    // Umsatz-Trend (täglich für den Zeitraum)
    const dailyRevenue = await prisma.shopOrder.groupBy({
      by: ['createdAt'],
      where: {
        salonId: salon.id,
        createdAt: { gte: periodStart },
        status: { not: 'CANCELLED' },
      },
      _sum: {
        total: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({
      period: {
        start: periodStart.toISOString(),
        end: now.toISOString(),
        days: periodDays,
      },
      orders: orderStats,
      inventory: inventoryStats,
      affiliate: affiliateStats,
      topProducts: topProductsWithDetails,
      revenueTrend: dailyRevenue.map((day) => ({
        date: day.createdAt,
        revenue: day._sum.total
          ? typeof day._sum.total === 'object'
            ? day._sum.total.toNumber()
            : Number(day._sum.total)
          : 0,
      })),
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Analytics:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

