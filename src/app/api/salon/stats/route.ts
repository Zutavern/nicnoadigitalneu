import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockSalonStats } from '@/lib/mock-data'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'SALON_OWNER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        ...getMockSalonStats(),
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const userId = session.user.id

    // Salon des Benutzers finden
    const salon = await prisma.salon.findFirst({
      where: { ownerId: userId },
      include: {
        chairs: {
          include: {
            rentals: {
              where: { status: 'ACTIVE' },
              take: 1,
            },
          },
        },
        reviews: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!salon) {
      return NextResponse.json({
        overview: {
          totalChairs: 0,
          availableChairs: 0,
          rentedChairs: 0,
          totalRentals: 0,
          monthlyRentalIncome: 0,
          averageRating: 0,
          totalReviews: 0,
        },
        chairs: [],
        rentals: [],
        recentReviews: [],
        monthlyIncome: [],
      })
    }

    // Alle Stühle mit Mietstatus
    const chairs = salon.chairs.map(chair => ({
      id: chair.id,
      name: chair.name,
      description: chair.description,
      monthlyRate: chair.monthlyRate?.toNumber() || 0,
      isAvailable: chair.isAvailable,
      isRented: chair.rentals.length > 0,
      amenities: chair.amenities,
    }))

    const availableChairs = chairs.filter(c => c.isAvailable && !c.isRented).length
    const rentedChairs = chairs.filter(c => c.isRented).length

    // Aktive Mietverhältnisse mit Stylist-Details
    const activeRentals = await prisma.chairRental.findMany({
      where: {
        chair: { salonId: salon.id },
        status: 'ACTIVE',
      },
      include: {
        chair: { select: { name: true, monthlyRate: true } },
      },
    })

    // Stylist-Details für Mietverhältnisse holen
    const stylistIds = activeRentals.map(r => r.stylistId)
    const stylists = await prisma.user.findMany({
      where: { id: { in: stylistIds } },
      select: { id: true, name: true, email: true, image: true },
    })

    const rentalsWithStylists = activeRentals.map(rental => ({
      id: rental.id,
      chairName: rental.chair.name,
      monthlyRent: rental.monthlyRent.toNumber(),
      startDate: rental.startDate,
      stylist: stylists.find(s => s.id === rental.stylistId),
    }))

    // Monatliche Mieteinnahmen berechnen
    const monthlyRentalIncome = activeRentals.reduce(
      (sum, rental) => sum + rental.monthlyRent.toNumber(),
      0
    )

    // Bewertungen
    const allReviews = await prisma.review.findMany({
      where: { salonId: salon.id, isPublic: true },
    })
    
    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

    // Einnahmen der letzten 6 Monate
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const payments = await prisma.payment.findMany({
      where: {
        receiverId: userId,
        type: 'CHAIR_RENTAL',
        status: 'PAID',
        paidAt: { gte: sixMonthsAgo },
      },
      orderBy: { paidAt: 'asc' },
    })

    // Gruppieren nach Monat
    const monthlyIncome = payments.reduce((acc, payment) => {
      if (!payment.paidAt) return acc
      const monthKey = `${payment.paidAt.getFullYear()}-${String(payment.paidAt.getMonth() + 1).padStart(2, '0')}`
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0 }
      }
      acc[monthKey].income += payment.amount.toNumber()
      return acc
    }, {} as Record<string, { month: string; income: number }>)

    // Anfragen für neue Mietverhältnisse
    const pendingRequests = await prisma.chairRental.count({
      where: {
        chair: { salonId: salon.id },
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      salon: {
        id: salon.id,
        name: salon.name,
        city: salon.city,
        isVerified: salon.isVerified,
      },
      overview: {
        totalChairs: chairs.length,
        availableChairs,
        rentedChairs,
        totalRentals: activeRentals.length,
        monthlyRentalIncome,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allReviews.length,
        pendingRequests,
      },
      chairs,
      rentals: rentalsWithStylists,
      recentReviews: salon.reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        reviewerName: r.reviewerName,
        createdAt: r.createdAt,
      })),
      monthlyIncome: Object.values(monthlyIncome),
    })
  } catch (error) {
    console.error('Error fetching salon stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Statistiken' },
      { status: 500 }
    )
  }
}

