import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDemoModeActive, getMockSalonConnections } from '@/lib/mock-data'

// GET /api/salon/connections - Alle verbundenen Stylisten abrufen
export async function GET() {
  try {
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockSalonConnections())
    }

    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    const connections = await prisma.salonStylistConnection.findMany({
      where: { 
        salonId: salon.id,
        isActive: true,
      },
      include: {
        stylist: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
            onboardingCompleted: true,
            stylistProfile: {
              select: {
                phone: true,
                bio: true,
                instagramUrl: true,
              },
            },
            stylistOnboarding: {
              select: {
                onboardingStatus: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    // Zusätzliche Daten für jeden Stylisten (aktive Miete, Buchungen etc.)
    const connectionsWithDetails = await Promise.all(
      connections.map(async (conn) => {
        // Aktive Stuhlmiete finden
        const activeRental = await prisma.chairRental.findFirst({
          where: {
            stylistId: conn.stylistId,
            chair: { salonId: salon.id },
            status: 'ACTIVE',
          },
          include: {
            chair: {
              select: { name: true, monthlyRate: true },
            },
          },
        })

        // Buchungsstatistiken für den aktuellen Monat
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const monthlyBookings = await prisma.booking.count({
          where: {
            stylistId: conn.stylistId,
            salonId: salon.id,
            startTime: { gte: startOfMonth },
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
        })

        const monthlyRevenue = await prisma.booking.aggregate({
          where: {
            stylistId: conn.stylistId,
            salonId: salon.id,
            startTime: { gte: startOfMonth },
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
          _sum: {
            totalPrice: true,
          },
        })

        // Durchschnittliche Bewertung
        const avgRating = await prisma.review.aggregate({
          where: {
            stylistId: conn.stylistId,
          },
          _avg: {
            rating: true,
          },
        })

        return {
          ...conn,
          activeRental: activeRental
            ? {
                chairName: activeRental.chair.name,
                monthlyRent: Number(activeRental.chair.monthlyRate),
                startDate: activeRental.startDate,
              }
            : null,
          stats: {
            monthlyBookings,
            monthlyRevenue: Number(monthlyRevenue._sum.totalPrice || 0),
            avgRating: avgRating._avg.rating || 0,
          },
        }
      })
    )

    return NextResponse.json(connectionsWithDetails)
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Verbindungen' },
      { status: 500 }
    )
  }
}







