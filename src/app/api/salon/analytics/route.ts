import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, subMonths, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { isDemoModeActive, getMockSalonAnalytics } from '@/lib/mock-data'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        ...getMockSalonAnalytics(),
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')

    // Find the salon owned by this user
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    const now = new Date()
    const periodStart = new Date(now.getTime() - period * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(periodStart.getTime() - period * 24 * 60 * 60 * 1000)

    // Get bookings for this salon
    const currentBookings = await prisma.booking.findMany({
      where: {
        salonId: salon.id,
        startTime: { gte: periodStart },
      },
      include: {
        stylist: { select: { name: true } },
      },
    })

    const previousBookings = await prisma.booking.findMany({
      where: {
        salonId: salon.id,
        startTime: { gte: previousPeriodStart, lt: periodStart },
      },
    })

    // Calculate revenue - totalPrice is a Decimal, convert to number
    const currentRevenue = currentBookings.reduce((sum, b) => sum + (b.totalPrice?.toNumber() || 0), 0)
    const previousRevenue = previousBookings.reduce((sum, b) => sum + (b.totalPrice?.toNumber() || 0), 0)
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    // Calculate bookings change
    const bookingsChange = previousBookings.length > 0
      ? ((currentBookings.length - previousBookings.length) / previousBookings.length) * 100
      : 0

    // Get customers
    const currentCustomerIds = [...new Set(currentBookings.map(b => b.customerId).filter(Boolean))]
    const previousCustomerIds = [...new Set(previousBookings.map(b => b.customerId).filter(Boolean))]
    const newCustomers = currentCustomerIds.filter(id => !previousCustomerIds.includes(id)).length
    const customerChange = previousCustomerIds.length > 0
      ? ((currentCustomerIds.length - previousCustomerIds.length) / previousCustomerIds.length) * 100
      : 0

    // Monthly data for charts (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = startOfMonth(subMonths(now, i - 1))
      
      const monthBookings = await prisma.booking.findMany({
        where: {
          salonId: salon.id,
          startTime: { gte: monthStart, lt: monthEnd },
        },
      })
      
      monthlyData.push({
        month: format(monthStart, 'MMM', { locale: de }),
        revenue: monthBookings.reduce((sum, b) => sum + (b.totalPrice?.toNumber() || 0), 0),
        bookings: monthBookings.length,
      })
    }

    // Stylist performance
    const stylistMap = new Map<string, { name: string; bookings: number; revenue: number; ratings: number[] }>()
    
    for (const booking of currentBookings) {
      const stylistId = booking.stylistId
      if (!stylistMap.has(stylistId)) {
        stylistMap.set(stylistId, {
          name: booking.stylist?.name || 'Unbekannt',
          bookings: 0,
          revenue: 0,
          ratings: [],
        })
      }
      const stylist = stylistMap.get(stylistId)!
      stylist.bookings++
      stylist.revenue += booking.totalPrice?.toNumber() || 0
    }

    // Get ratings for each stylist
    const reviews = await prisma.review.findMany({
      where: {
        salonId: salon.id,
        createdAt: { gte: periodStart },
      },
    })

    reviews.forEach(review => {
      if (review.stylistId && stylistMap.has(review.stylistId)) {
        stylistMap.get(review.stylistId)!.ratings.push(review.rating)
      }
    })

    const stylistPerformance = Array.from(stylistMap.values())
      .map(s => ({
        name: s.name,
        bookings: s.bookings,
        revenue: s.revenue,
        rating: s.ratings.length > 0 
          ? Math.round((s.ratings.reduce((a, b) => a + b, 0) / s.ratings.length) * 10) / 10 
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Service breakdown - use serviceIds instead of services
    const serviceCount = new Map<string, number>()
    
    // Collect all service IDs
    const allServiceIds = currentBookings.flatMap(b => b.serviceIds || [])
    
    // Get service names
    const services = await prisma.service.findMany({
      where: { id: { in: allServiceIds } },
      select: { id: true, name: true },
    })
    
    const serviceNameMap = new Map(services.map(s => [s.id, s.name]))
    
    currentBookings.forEach(booking => {
      (booking.serviceIds || []).forEach(serviceId => {
        const serviceName = serviceNameMap.get(serviceId) || 'Unbekannt'
        serviceCount.set(serviceName, (serviceCount.get(serviceName) || 0) + 1)
      })
    })
    
    const totalServices = Array.from(serviceCount.values()).reduce((a, b) => a + b, 0)
    const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
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
      revenue: {
        total: currentRevenue,
        change: Math.round(revenueChange * 10) / 10,
        data: monthlyData.map(m => ({ month: m.month, value: m.revenue })),
      },
      bookings: {
        total: currentBookings.length,
        change: Math.round(bookingsChange * 10) / 10,
        data: monthlyData.map(m => ({ month: m.month, value: m.bookings })),
      },
      customers: {
        total: currentCustomerIds.length,
        change: Math.round(customerChange * 10) / 10,
        newCustomers,
        returningCustomers: currentCustomerIds.length - newCustomers,
      },
      stylistPerformance,
      serviceBreakdown,
      peakHours,
    })
  } catch (error) {
    console.error('Error fetching salon analytics:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
