import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDemoModeActive, getMockStylistMySalons } from '@/lib/mock-data'

// GET /api/stylist/my-salons - Meine verbundenen Salons abrufen
export async function GET() {
  try {
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockStylistMySalons())
    }

    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const connections = await prisma.salonStylistConnection.findMany({
      where: {
        stylistId: session.user.id,
        isActive: true,
      },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            slug: true,
            street: true,
            city: true,
            zipCode: true,
            phone: true,
            email: true,
            images: true,
            amenities: true,
            owner: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
            chairs: {
              where: {
                isActive: true,
              },
              select: {
                id: true,
                name: true,
                isAvailable: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    // Zusätzliche Daten für jeden Salon (aktive Miete etc.)
    const salonsWithDetails = await Promise.all(
      connections.map(async (conn) => {
        // Aktive Stuhlmiete finden
        const activeRental = await prisma.chairRental.findFirst({
          where: {
            stylistId: session.user.id,
            chair: { salonId: conn.salonId },
            status: 'ACTIVE',
          },
          include: {
            chair: {
              select: {
                id: true,
                name: true,
                monthlyRate: true,
                amenities: true,
              },
            },
          },
        })

        // Buchungsstatistiken für den aktuellen Monat
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const monthlyBookings = await prisma.booking.count({
          where: {
            stylistId: session.user.id,
            salonId: conn.salonId,
            startTime: { gte: startOfMonth },
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
        })

        const upcomingBookings = await prisma.booking.count({
          where: {
            stylistId: session.user.id,
            salonId: conn.salonId,
            startTime: { gte: new Date() },
            status: 'CONFIRMED',
          },
        })

        return {
          id: conn.id,
          joinedAt: conn.joinedAt,
          role: conn.role,
          salon: {
            ...conn.salon,
            availableChairs: conn.salon.chairs.filter(c => c.isAvailable).length,
            totalChairs: conn.salon.chairs.length,
          },
          activeRental: activeRental
            ? {
                id: activeRental.id,
                chairId: activeRental.chair.id,
                chairName: activeRental.chair.name,
                monthlyRent: Number(activeRental.monthlyRent),
                startDate: activeRental.startDate,
                endDate: activeRental.endDate,
                amenities: activeRental.chair.amenities,
              }
            : null,
          stats: {
            monthlyBookings,
            upcomingBookings,
          },
        }
      })
    )

    return NextResponse.json(salonsWithDetails)
  } catch (error) {
    console.error('Error fetching my salons:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Salons' },
      { status: 500 }
    )
  }
}









