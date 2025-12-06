import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, subMonths, format } from 'date-fns'
import { de } from 'date-fns/locale'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')

    const now = new Date()
    const periodStart = new Date(now.getTime() - period * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(periodStart.getTime() - period * 24 * 60 * 60 * 1000)

    // Get bookings for this stylist
    const currentBookings = await prisma.booking.findMany({
      where: {
        stylistId: session.user.id,
        startTime: { gte: periodStart },
      },
      include: {
        salon: { select: { name: true } },
      },
    })

    const previousBookings = await prisma.booking.findMany({
      where: {
        stylistId: session.user.id,
        startTime: { gte: previousPeriodStart, lt: periodStart },
      },
    })

    // Calculate earnings
    const currentEarnings = currentBookings.reduce((sum, b) => sum + b.totalPrice, 0)
    const previousEarnings = previousBookings.reduce((sum, b) => sum + b.totalPrice, 0)
    const earningsChange = previousEarnings > 0 
      ? ((currentEarnings - previousEarnings) / previousEarnings) * 100 
      : 0

    // Calculate bookings change
    const bookingsChange = previousBookings.length > 0
      ? ((currentBookings.length - previousBookings.length) / previousBookings.length) * 100
      : 0

    // Get customers
    const currentCustomerIds = [...new Set(currentBookings.map(b => b.customerId))]
    const previousCustomerIds = [...new Set(previousBookings.map(b => b.customerId))]
    const newCustomers = currentCustomerIds.filter(id => !previousCustomerIds.includes(id)).length

    // Monthly data for charts (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = startOfMonth(subMonths(now, i - 1))
      
      const monthBookings = await prisma.booking.findMany({
        where: {
          stylistId: session.user.id,
          startTime: { gte: monthStart, lt: monthEnd },
        },
      })
      
      monthlyData.push({
        month: format(monthStart, 'MMM', { locale: de }),
        earnings: monthBookings.reduce((sum, b) => sum + b.totalPrice, 0),
        bookings: monthBookings.length,
      })
    }

    // Salon performance
    const salonMap = new Map<string, { name: string; bookings: number; earnings: number }>()
    
    for (const booking of currentBookings) {
      const salonId = booking.salonId
      if (!salonMap.has(salonId)) {
        salonMap.set(salonId, {
          name: booking.salon?.name || 'Unbekannt',
          bookings: 0,
          earnings: 0,
        })
      }
      const salon = salonMap.get(salonId)!
      salon.bookings++
      salon.earnings += booking.totalPrice
    }

    const salonPerformance = Array.from(salonMap.values())
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5)

    // Service breakdown
    const serviceCount = new Map<string, number>()
    currentBookings.forEach(booking => {
      booking.services.forEach(service => {
        serviceCount.set(service, (serviceCount.get(service) || 0) + 1)
      })
    })
    
    const totalServices = Array.from(serviceCount.values()).reduce((a, b) => a + b, 0)
    const colors = ['#ec4899', '#f472b6', '#fb7185', '#fda4af', '#fecdd3', '#fce7f3']
    const serviceBreakdown = Array.from(serviceCount.entries())
      .map(([name, count], index) => ({
        name,
        value: totalServices > 0 ? Math.round((count / totalServices) * 100) : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    // Peak hours
    const hourCount: Record<string, number> = {}
    currentBookings.forEach(booking => {
      const hour = format(new Date(booking.startTime), 'HH:00')
      hourCount[hour] = (hourCount[hour] || 0) + 1
    })
    
    const peakHours = Object.entries(hourCount)
      .map(([hour, bookings]) => ({ hour, bookings }))
      .sort((a, b) => {
        const hourA = parseInt(a.hour.split(':')[0])
        const hourB = parseInt(b.hour.split(':')[0])
        return hourA - hourB
      })

    return NextResponse.json({
      earnings: {
        total: currentEarnings,
        change: Math.round(earningsChange * 10) / 10,
        data: monthlyData.map(m => ({ month: m.month, value: m.earnings })),
      },
      bookings: {
        total: currentBookings.length,
        change: Math.round(bookingsChange * 10) / 10,
        data: monthlyData.map(m => ({ month: m.month, value: m.bookings })),
      },
      customers: {
        total: currentCustomerIds.length,
        newCustomers,
        returningCustomers: currentCustomerIds.length - newCustomers,
      },
      salonPerformance,
      serviceBreakdown,
      peakHours,
    })
  } catch (error) {
    console.error('Error fetching stylist analytics:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
