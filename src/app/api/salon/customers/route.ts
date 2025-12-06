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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    // Salon des Benutzers finden
    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!salon) {
      return NextResponse.json({ customers: [], total: 0, totalPages: 0 })
    }

    const where: Record<string, unknown> = {
      salonId: salon.id,
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ])

    // Buchungsstatistiken für jeden Kunden
    const customerIds = customers.map(c => c.id)
    
    const bookingStats = await prisma.booking.groupBy({
      by: ['customerId'],
      where: {
        customerId: { in: customerIds },
        salonId: salon.id,
      },
      _count: { id: true },
      _sum: { totalPrice: true },
      _max: { startTime: true },
    })

    const formattedCustomers = customers.map((customer) => {
      const stats = bookingStats.find(b => b.customerId === customer.id)

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        totalBookings: stats?._count.id || 0,
        totalSpent: stats?._sum.totalPrice?.toNumber() || 0,
        lastVisit: stats?._max.startTime,
        createdAt: customer.createdAt,
      }
    })

    return NextResponse.json({
      customers: formattedCustomers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching salon customers:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Kunden' },
      { status: 500 }
    )
  }
}

