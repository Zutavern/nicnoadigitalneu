import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { isDemoModeActive, getMockStylistEarnings } from '@/lib/mock-data'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        ...getMockStylistEarnings(),
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'

    // Zeitraum berechnen
    const months = period === '1month' ? 1 : period === '3months' ? 3 : period === '12months' ? 12 : 6
    const startDate = startOfMonth(subMonths(new Date(), months))
    const endDate = endOfMonth(new Date())
    const thisMonthStart = startOfMonth(new Date())
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1))
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1))

    // Einnahmen abrufen
    const [totalEarnings, thisMonthEarnings, lastMonthEarnings, pendingPayments] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          receiverId: session.user.id,
          status: 'PAID',
          paidAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          receiverId: session.user.id,
          status: 'PAID',
          paidAt: { gte: thisMonthStart, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          receiverId: session.user.id,
          status: 'PAID',
          paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          receiverId: session.user.id,
          status: 'PENDING',
        },
        _sum: { amount: true },
      }),
    ])

    const totalAmount = totalEarnings._sum.amount?.toNumber() || 0
    const thisMonth = thisMonthEarnings._sum.amount?.toNumber() || 0
    const lastMonth = lastMonthEarnings._sum.amount?.toNumber() || 0
    const pending = pendingPayments._sum.amount?.toNumber() || 0

    // Wachstum berechnen
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    // Monatliche Daten
    const monthlyPayments = await prisma.payment.findMany({
      where: {
        receiverId: session.user.id,
        status: 'PAID',
        paidAt: { gte: startDate, lte: endDate },
      },
      select: {
        amount: true,
        paidAt: true,
      },
    })

    const bookingsByMonth = await prisma.booking.groupBy({
      by: ['stylistId'],
      where: {
        stylistId: session.user.id,
        status: 'COMPLETED',
        startTime: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
    })

    // Monatliche Buchungen detailliert
    const bookings = await prisma.booking.findMany({
      where: {
        stylistId: session.user.id,
        status: 'COMPLETED',
        startTime: { gte: startDate, lte: endDate },
      },
      select: {
        startTime: true,
        totalPrice: true,
      },
    })

    const monthlyDataMap: Record<string, { earnings: number; bookings: number }> = {}
    
    for (let i = 0; i < months; i++) {
      const monthDate = subMonths(new Date(), i)
      const monthKey = format(monthDate, 'MMM yyyy', { locale: de })
      monthlyDataMap[monthKey] = { earnings: 0, bookings: 0 }
    }

    monthlyPayments.forEach(payment => {
      if (!payment.paidAt) return
      const monthKey = format(payment.paidAt, 'MMM yyyy', { locale: de })
      if (monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey].earnings += payment.amount.toNumber()
      }
    })

    bookings.forEach(booking => {
      const monthKey = format(booking.startTime, 'MMM yyyy', { locale: de })
      if (monthlyDataMap[monthKey]) {
        monthlyDataMap[monthKey].bookings += 1
      }
    })

    const monthlyData = Object.entries(monthlyDataMap)
      .map(([month, data]) => ({
        month,
        earnings: data.earnings,
        bookings: data.bookings,
      }))
      .reverse()

    // Letzte Zahlungen
    const recentPayments = await prisma.payment.findMany({
      where: {
        receiverId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    })

    const formattedRecentPayments = recentPayments.map(p => ({
      id: p.id,
      amount: p.amount.toNumber(),
      type: p.type,
      date: p.paidAt || p.createdAt,
      status: p.status,
    }))

    return NextResponse.json({
      totalEarnings: totalAmount,
      thisMonth,
      lastMonth,
      growth,
      pendingPayments: pending,
      monthlyData,
      recentPayments: formattedRecentPayments,
    })
  } catch (error) {
    console.error('Error fetching stylist earnings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Einnahmen' },
      { status: 500 }
    )
  }
}

