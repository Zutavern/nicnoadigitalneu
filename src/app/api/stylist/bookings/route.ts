import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockStylistBookings } from '@/lib/mock-data'

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
        ...getMockStylistBookings(),
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start') || searchParams.get('startDate')
    const end = searchParams.get('end') || searchParams.get('endDate')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {
      stylistId: session.user.id,
    }

    if (start && end) {
      where.startTime = {
        gte: new Date(start),
        lte: new Date(end),
      }
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          salon: {
            select: {
              name: true,
              street: true,
              city: true,
              zipCode: true,
            },
          },
          chair: {
            select: {
              name: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    // Service-Namen abrufen (für mehrere Services)
    const allServiceIds = bookings.flatMap(b => b.serviceIds)
    const services = allServiceIds.length > 0
      ? await prisma.service.findMany({
          where: { id: { in: allServiceIds } },
          select: { id: true, name: true },
        })
      : []

    const formattedBookings = bookings.map((booking) => {
      // Kombiniere einzelnen Service und mehrere Services
      const serviceNames = booking.serviceIds.length > 0
        ? services.filter(s => booking.serviceIds.includes(s.id)).map(s => s.name)
        : booking.service ? [booking.service.name] : []

      return {
        id: booking.id,
        customerName: booking.customer 
          ? `${booking.customer.firstName} ${booking.customer.lastName}` 
          : 'Unbekannt',
        customerEmail: booking.customer?.email,
        customerPhone: booking.customer?.phone,
        salonName: booking.salon?.name || 'Kein Salon',
        salonAddress: booking.salon 
          ? `${booking.salon.street}, ${booking.salon.zipCode} ${booking.salon.city}`
          : '',
        chairName: booking.chair?.name,
        serviceName: serviceNames[0] || booking.title || 'Service',
        services: serviceNames,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice.toNumber(),
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
      }
    })

    return NextResponse.json({
      bookings: formattedBookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching stylist bookings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Buchungen' },
      { status: 500 }
    )
  }
}

// POST: Neue Buchung erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerId,
      salonId,
      chairId,
      serviceId,
      serviceIds = [],
      startTime,
      endTime,
      title,
      notes,
      totalPrice,
    } = body

    // Validierung
    if (!startTime || !endTime || !title) {
      return NextResponse.json(
        { error: 'Startzeit, Endzeit und Titel sind erforderlich' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        stylistId: session.user.id,
        customerId,
        salonId,
        chairId,
        serviceId,
        serviceIds,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        title,
        notes,
        totalPrice: totalPrice || 0,
        status: 'PENDING',
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        salon: {
          select: { name: true },
        },
        service: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Buchung' },
      { status: 500 }
    )
  }
}

