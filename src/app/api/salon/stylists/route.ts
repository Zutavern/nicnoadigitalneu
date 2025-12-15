import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockSalonStylists } from '@/lib/mock-data'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Salon des Benutzers finden
    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    // Check if demo mode is active OR no salon exists
    const demoMode = await isDemoModeActive()
    if (demoMode || !salon) {
      return NextResponse.json({
        ...getMockSalonStylists(),
        _source: 'demo',
        _message: !salon 
          ? 'Kein Salon vorhanden - Es werden Beispieldaten angezeigt'
          : 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    // Aktive Mietverhältnisse mit Stylist-Details
    const rentals = await prisma.chairRental.findMany({
      where: {
        chair: { salonId: salon.id },
      },
      include: {
        chair: { select: { name: true } },
        stylist: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            stylistProfile: {
              select: {
                phone: true,
              },
            },
          },
        },
      },
    })

    // Statistiken für jeden Stylist berechnen
    const stylistIds = rentals.map(r => r.stylistId)
    
    const [bookingStats, reviews] = await Promise.all([
      prisma.booking.groupBy({
        by: ['stylistId'],
        where: {
          stylistId: { in: stylistIds },
          salonId: salon.id,
        },
        _count: { id: true },
      }),
      prisma.review.groupBy({
        by: ['stylistId'],
        where: {
          stylistId: { in: stylistIds },
          salonId: salon.id,
        },
        _avg: { rating: true },
        _count: { id: true },
      }),
    ])

    // Monatliche Buchungen
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const monthlyBookings = await prisma.booking.groupBy({
      by: ['stylistId'],
      where: {
        stylistId: { in: stylistIds },
        salonId: salon.id,
        startTime: { gte: startOfMonth },
      },
      _count: { id: true },
      _sum: { totalPrice: true },
    })

    const stylists = rentals.map((rental) => {
      const bookingStat = bookingStats.find(b => b.stylistId === rental.stylistId)
      const reviewStat = reviews.find(r => r.stylistId === rental.stylistId)
      const monthlyStat = monthlyBookings.find(m => m.stylistId === rental.stylistId)

      return {
        id: rental.stylist.id,
        name: rental.stylist.name || 'Unbekannt',
        email: rental.stylist.email,
        phone: rental.stylist.stylistProfile?.phone,
        image: rental.stylist.image,
        chairName: rental.chair.name,
        monthlyRent: rental.monthlyRent.toNumber(),
        startDate: rental.startDate,
        rating: reviewStat?._avg.rating || 0,
        totalBookings: bookingStat?._count.id || 0,
        monthlyBookings: monthlyStat?._count.id || 0,
        monthlyRevenue: monthlyStat?._sum.totalPrice?.toNumber() || 0,
        status: rental.status as 'ACTIVE' | 'PENDING' | 'INACTIVE',
      }
    })

    return NextResponse.json({ stylists })
  } catch (error) {
    console.error('Error fetching salon stylists:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Stylisten' },
      { status: 500 }
    )
  }
}

