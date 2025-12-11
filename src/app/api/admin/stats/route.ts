import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockAdminStats } from '@/lib/mock-data'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        ...getMockAdminStats(),
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    // Parallele Abfragen für bessere Performance
    const [
      totalUsers,
      totalStylists,
      totalSalonOwners,
      totalSalons,
      totalBookings,
      completedBookings,
      pendingOnboardings,
      approvedOnboardings,
      totalRevenue,
      monthlyRevenue,
      recentBookings,
      topStylists,
      recentUsers,
      bookingsByStatus,
      onboardingsByStatus,
    ] = await Promise.all([
      // Gesamtzahl Benutzer
      prisma.user.count(),
      
      // Stylisten
      prisma.user.count({ where: { role: 'STYLIST' } }),
      
      // Salon-Betreiber
      prisma.user.count({ where: { role: 'SALON_OWNER' } }),
      
      // Salons
      prisma.salon.count({ where: { isActive: true } }),
      
      // Gesamte Buchungen
      prisma.booking.count(),
      
      // Abgeschlossene Buchungen
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      
      // Ausstehende Onboardings
      prisma.stylistOnboarding.count({ where: { onboardingStatus: 'PENDING_REVIEW' } }),
      
      // Genehmigte Onboardings
      prisma.stylistOnboarding.count({ where: { onboardingStatus: 'APPROVED' } }),
      
      // Gesamtumsatz (alle bezahlten Buchungen)
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { isPaid: true },
      }),
      
      // Monatsumsatz (aktueller Monat)
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          isPaid: true,
          startTime: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      
      // Letzte 5 Buchungen
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      
      // Top 5 Stylisten nach Buchungen
      prisma.booking.groupBy({
        by: ['stylistId'],
        _count: { id: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      
      // Neueste Benutzer
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          image: true,
        },
      }),
      
      // Buchungen nach Status
      prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      
      // Onboardings nach Status
      prisma.stylistOnboarding.groupBy({
        by: ['onboardingStatus'],
        _count: { id: true },
      }),
    ])

    // Stylist-Details für Top-Stylisten holen
    const topStylistIds = topStylists.map(s => s.stylistId)
    const stylistDetails = await prisma.user.findMany({
      where: { id: { in: topStylistIds } },
      select: { id: true, name: true, email: true, image: true },
    })

    const topStylistsWithDetails = topStylists.map(s => ({
      ...s,
      stylist: stylistDetails.find(d => d.id === s.stylistId),
    }))

    // Wachstum berechnen (verglichen mit letztem Monat)
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    
    const [lastMonthUsers, lastMonthBookings, lastMonthRevenue] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          isPaid: true,
          startTime: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
    ])

    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const [thisMonthUsers, thisMonthBookings] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),
    ])

    // Prozentuale Veränderungen
    const userGrowth = lastMonthUsers > 0 
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1) 
      : '0'
    
    const bookingGrowth = lastMonthBookings > 0 
      ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1) 
      : '0'
    
    const currentMonthlyRevenue = monthlyRevenue._sum.totalPrice?.toNumber() || 0
    const lastMonthlyRevenue = lastMonthRevenue._sum.totalPrice?.toNumber() || 0
    const revenueGrowth = lastMonthlyRevenue > 0 
      ? ((currentMonthlyRevenue - lastMonthlyRevenue) / lastMonthlyRevenue * 100).toFixed(1) 
      : '0'

    return NextResponse.json({
      // Übersichtszahlen
      overview: {
        totalUsers,
        totalStylists,
        totalSalonOwners,
        totalSalons,
        totalBookings,
        completedBookings,
        pendingOnboardings,
        approvedOnboardings,
        totalRevenue: totalRevenue._sum.totalPrice?.toNumber() || 0,
        monthlyRevenue: currentMonthlyRevenue,
      },
      
      // Wachstum
      growth: {
        users: parseFloat(userGrowth),
        bookings: parseFloat(bookingGrowth),
        revenue: parseFloat(revenueGrowth),
      },
      
      // Listen
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        title: b.title,
        serviceName: b.service?.name,
        customerName: b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : 'Unbekannt',
        price: b.totalPrice?.toNumber() || 0,
        status: b.status,
        startTime: b.startTime,
      })),
      
      topStylists: topStylistsWithDetails.map(s => ({
        stylistId: s.stylistId,
        name: s.stylist?.name || 'Unbekannt',
        email: s.stylist?.email,
        image: s.stylist?.image,
        bookingCount: s._count.id,
        totalRevenue: s._sum.totalPrice?.toNumber() || 0,
      })),
      
      recentUsers,
      
      // Statistiken nach Status
      bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id
        return acc
      }, {} as Record<string, number>),
      
      onboardingsByStatus: onboardingsByStatus.reduce((acc, item) => {
        acc[item.onboardingStatus] = item._count.id
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Statistiken' },
      { status: 500 }
    )
  }
}

