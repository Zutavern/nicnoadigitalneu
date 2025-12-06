import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockStylistStats } from '@/lib/mock-data'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'STYLIST' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        ...getMockStylistStats(),
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const userId = session.user.id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    // Parallele Abfragen
    const [
      totalCustomers,
      totalBookings,
      completedBookings,
      upcomingBookings,
      todaysBookings,
      weeklyBookings,
      monthlyRevenue,
      totalRevenue,
      recentBookings,
      popularServices,
      chairRental,
      reviews,
    ] = await Promise.all([
      // Kunden des Stylisten
      prisma.customer.count({ where: { stylistId: userId } }),
      
      // Gesamte Buchungen
      prisma.booking.count({ where: { stylistId: userId } }),
      
      // Abgeschlossene Buchungen
      prisma.booking.count({
        where: { stylistId: userId, status: 'COMPLETED' },
      }),
      
      // Anstehende Buchungen
      prisma.booking.count({
        where: {
          stylistId: userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          startTime: { gte: now },
        },
      }),
      
      // Heutige Buchungen
      prisma.booking.findMany({
        where: {
          stylistId: userId,
          startTime: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
        include: {
          service: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true } },
        },
        orderBy: { startTime: 'asc' },
      }),
      
      // Wöchentliche Buchungen
      prisma.booking.count({
        where: {
          stylistId: userId,
          startTime: { gte: startOfWeek, lt: endOfWeek },
        },
      }),
      
      // Monatlicher Umsatz
      prisma.booking.aggregate({
        _sum: { price: true },
        where: {
          stylistId: userId,
          isPaid: true,
          startTime: { gte: startOfMonth },
        },
      }),
      
      // Gesamtumsatz
      prisma.booking.aggregate({
        _sum: { price: true },
        where: { stylistId: userId, isPaid: true },
      }),
      
      // Letzte 5 Buchungen
      prisma.booking.findMany({
        where: { stylistId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      
      // Beliebteste Services
      prisma.booking.groupBy({
        by: ['serviceId'],
        where: { stylistId: userId, serviceId: { not: null } },
        _count: { id: true },
        _sum: { price: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      
      // Aktuelle Stuhlmiete
      prisma.chairRental.findFirst({
        where: { stylistId: userId, status: 'ACTIVE' },
        include: {
          chair: {
            include: {
              salon: {
                select: { name: true, city: true, street: true },
              },
            },
          },
        },
      }),
      
      // Bewertungen für den Stylisten
      prisma.review.findMany({
        where: { stylistId: userId, isPublic: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    // Service-Details für beliebte Services holen
    const serviceIds = popularServices.map(s => s.serviceId).filter(Boolean) as string[]
    const serviceDetails = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true },
    })

    const popularServicesWithNames = popularServices.map(s => ({
      serviceId: s.serviceId,
      serviceName: serviceDetails.find(d => d.id === s.serviceId)?.name || 'Unbekannt',
      bookingCount: s._count.id,
      totalRevenue: s._sum.price?.toNumber() || 0,
    }))

    // Durchschnittliche Bewertung berechnen
    const allReviews = await prisma.review.findMany({
      where: { stylistId: userId, isPublic: true },
    })
    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

    // Wachstum berechnen (verglichen mit letztem Monat)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const [lastMonthBookings, lastMonthRevenue] = await Promise.all([
      prisma.booking.count({
        where: {
          stylistId: userId,
          status: 'COMPLETED',
          startTime: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
      prisma.booking.aggregate({
        _sum: { price: true },
        where: {
          stylistId: userId,
          isPaid: true,
          startTime: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
    ])

    const thisMonthBookingsCount = await prisma.booking.count({
      where: {
        stylistId: userId,
        status: 'COMPLETED',
        startTime: { gte: startOfMonth },
      },
    })

    const currentMonthlyRevenue = monthlyRevenue._sum.price?.toNumber() || 0
    const lastMonthRevenueValue = lastMonthRevenue._sum.price?.toNumber() || 0

    const bookingGrowth = lastMonthBookings > 0
      ? ((thisMonthBookingsCount - lastMonthBookings) / lastMonthBookings * 100).toFixed(1)
      : '0'

    const revenueGrowth = lastMonthRevenueValue > 0
      ? ((currentMonthlyRevenue - lastMonthRevenueValue) / lastMonthRevenueValue * 100).toFixed(1)
      : '0'

    // Ausstehende Zahlungen (falls Stuhlmiete)
    let pendingPayments = 0
    if (chairRental) {
      const pendingPaymentsResult = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          payerId: userId,
          type: 'CHAIR_RENTAL',
          status: { in: ['PENDING', 'OVERDUE'] },
        },
      })
      pendingPayments = pendingPaymentsResult._sum.amount?.toNumber() || 0
    }

    return NextResponse.json({
      overview: {
        totalCustomers,
        totalBookings,
        completedBookings,
        upcomingBookings,
        weeklyBookings,
        monthlyRevenue: currentMonthlyRevenue,
        totalRevenue: totalRevenue._sum.price?.toNumber() || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allReviews.length,
      },
      
      growth: {
        bookings: parseFloat(bookingGrowth),
        revenue: parseFloat(revenueGrowth),
      },
      
      todaysBookings: todaysBookings.map(b => ({
        id: b.id,
        title: b.title,
        serviceName: b.service?.name,
        customerName: b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : 'Unbekannt',
        startTime: b.startTime,
        endTime: b.endTime,
        price: b.price?.toNumber() || 0,
        status: b.status,
      })),
      
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        title: b.title,
        serviceName: b.service?.name,
        customerName: b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : 'Unbekannt',
        price: b.price?.toNumber() || 0,
        status: b.status,
        startTime: b.startTime,
      })),
      
      popularServices: popularServicesWithNames,
      
      chairRental: chairRental ? {
        id: chairRental.id,
        chairName: chairRental.chair.name,
        salonName: chairRental.chair.salon.name,
        salonCity: chairRental.chair.salon.city,
        salonStreet: chairRental.chair.salon.street,
        monthlyRent: chairRental.monthlyRent.toNumber(),
        startDate: chairRental.startDate,
        pendingPayments,
      } : null,
      
      recentReviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        reviewerName: r.reviewerName,
        createdAt: r.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching stylist stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Statistiken' },
      { status: 500 }
    )
  }
}

