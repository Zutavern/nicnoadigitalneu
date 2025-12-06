import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { isDemoModeActive, getMockSalonRevenue } from '@/lib/mock-data'

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
        ...getMockSalonRevenue(),
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'

    // Salon des Benutzers finden
    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!salon) {
      return NextResponse.json({
        totalRevenue: 0,
        rentalIncome: 0,
        bookingCommission: 0,
        previousMonthRevenue: 0,
        growth: 0,
        monthlyData: [],
        topStylists: [],
      })
    }

    // Zeitraum berechnen
    const months = period === '1month' ? 1 : period === '3months' ? 3 : period === '12months' ? 12 : 6
    const startDate = startOfMonth(subMonths(new Date(), months))
    const endDate = endOfMonth(new Date())
    const previousMonthStart = startOfMonth(subMonths(new Date(), 1))
    const previousMonthEnd = endOfMonth(subMonths(new Date(), 1))

    // Zahlungen abrufen
    const [rentalPayments, bookingPayments, previousMonthPayments] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          receiverId: session.user.id,
          type: 'CHAIR_RENTAL',
          status: 'PAID',
          paidAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          receiverId: session.user.id,
          type: 'BOOKING_COMMISSION',
          status: 'PAID',
          paidAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          receiverId: session.user.id,
          status: 'PAID',
          paidAt: { gte: previousMonthStart, lte: previousMonthEnd },
        },
        _sum: { amount: true },
      }),
    ])

    const rentalIncome = rentalPayments._sum.amount?.toNumber() || 0
    const bookingCommission = bookingPayments._sum.amount?.toNumber() || 0
    const totalRevenue = rentalIncome + bookingCommission
    const previousMonthRevenue = previousMonthPayments._sum.amount?.toNumber() || 0

    // Wachstum berechnen
    const twoMonthsAgoStart = startOfMonth(subMonths(new Date(), 2))
    const twoMonthsAgoEnd = endOfMonth(subMonths(new Date(), 2))
    const twoMonthsAgoPayments = await prisma.payment.aggregate({
      where: {
        receiverId: session.user.id,
        status: 'PAID',
        paidAt: { gte: twoMonthsAgoStart, lte: twoMonthsAgoEnd },
      },
      _sum: { amount: true },
    })
    const twoMonthsAgoRevenue = twoMonthsAgoPayments._sum.amount?.toNumber() || 0
    const growth = twoMonthsAgoRevenue > 0 
      ? ((previousMonthRevenue - twoMonthsAgoRevenue) / twoMonthsAgoRevenue) * 100 
      : 0

    // Monatliche Daten
    const monthlyPayments = await prisma.payment.findMany({
      where: {
        receiverId: session.user.id,
        status: 'PAID',
        paidAt: { gte: startDate, lte: endDate },
      },
      select: {
        type: true,
        amount: true,
        paidAt: true,
      },
    })

    const monthlyDataMap: Record<string, { rental: number; commission: number }> = {}
    
    for (let i = 0; i < months; i++) {
      const monthDate = subMonths(new Date(), i)
      const monthKey = format(monthDate, 'MMM yyyy', { locale: de })
      monthlyDataMap[monthKey] = { rental: 0, commission: 0 }
    }

    monthlyPayments.forEach(payment => {
      if (!payment.paidAt) return
      const monthKey = format(payment.paidAt, 'MMM yyyy', { locale: de })
      if (monthlyDataMap[monthKey]) {
        if (payment.type === 'CHAIR_RENTAL') {
          monthlyDataMap[monthKey].rental += payment.amount.toNumber()
        } else {
          monthlyDataMap[monthKey].commission += payment.amount.toNumber()
        }
      }
    })

    const monthlyData = Object.entries(monthlyDataMap)
      .map(([month, data]) => ({
        month,
        rental: data.rental,
        commission: data.commission,
        total: data.rental + data.commission,
      }))
      .reverse()

    // Top Stylisten
    const stylistBookings = await prisma.booking.groupBy({
      by: ['stylistId'],
      where: {
        salonId: salon.id,
        status: 'COMPLETED',
        startTime: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
      _sum: { totalPrice: true },
    })

    const stylistIds = stylistBookings.map(s => s.stylistId)
    const stylists = await prisma.user.findMany({
      where: { id: { in: stylistIds } },
      select: { id: true, name: true },
    })

    const topStylists = stylistBookings
      .map(stat => ({
        id: stat.stylistId,
        name: stylists.find(s => s.id === stat.stylistId)?.name || 'Unbekannt',
        revenue: stat._sum.totalPrice?.toNumber() || 0,
        bookings: stat._count.id,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return NextResponse.json({
      totalRevenue,
      rentalIncome,
      bookingCommission,
      previousMonthRevenue,
      growth,
      monthlyData,
      topStylists,
    })
  } catch (error) {
    console.error('Error fetching salon revenue:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Einnahmen' },
      { status: 500 }
    )
  }
}

