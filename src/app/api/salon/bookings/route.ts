import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Salon des Benutzers finden
    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!salon) {
      return NextResponse.json({ bookings: [], total: 0 })
    }

    const where: Record<string, unknown> = {
      salonId: salon.id,
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
          stylist: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          chair: {
            select: {
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

    // Service-Namen abrufen (falls serviceIds vorhanden)
    const serviceIds = bookings.flatMap(b => b.serviceIds)
    const services = serviceIds.length > 0
      ? await prisma.service.findMany({
          where: { id: { in: serviceIds } },
          select: { id: true, name: true },
        })
      : []

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customerEmail: booking.customer.email,
      customerPhone: booking.customer.phone,
      stylistName: booking.stylist.name,
      stylistImage: booking.stylist.image,
      chairName: booking.chair?.name,
      serviceName: services.find(s => booking.serviceIds.includes(s.id))?.name || 'Service',
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice.toNumber(),
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt,
    }))

    return NextResponse.json({
      bookings: formattedBookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching salon bookings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Buchungen' },
      { status: 500 }
    )
  }
}

