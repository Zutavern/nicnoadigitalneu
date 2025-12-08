import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDemoModeActive, getMockSalonChairs } from '@/lib/mock-data'

// GET /api/salon/chairs - Alle Stühle des Salons abrufen
export async function GET() {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockSalonChairs())
    }

    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Salon des Besitzers finden
    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 404 })
    }

    // Stühle mit aktuellen Mietern abrufen
    const chairs = await prisma.chair.findMany({
      where: { salonId: salon.id },
      include: {
        rentals: {
          where: {
            status: 'ACTIVE',
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          },
          include: {
            chair: false
          },
          orderBy: { startDate: 'desc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    })

    // Mieter-Infos hinzufügen
    const stylistIds = chairs
      .filter(c => c.rentals.length > 0)
      .map(c => c.rentals[0].stylistId)
    
    const stylists = await prisma.user.findMany({
      where: { id: { in: stylistIds } },
      select: { id: true, name: true, email: true, image: true }
    })
    const stylistsMap = new Map(stylists.map(s => [s.id, s]))

    const chairsWithRenters = chairs.map(chair => ({
      id: chair.id,
      name: chair.name,
      description: chair.description,
      dailyRate: chair.dailyRate ? Number(chair.dailyRate) : null,
      weeklyRate: chair.weeklyRate ? Number(chair.weeklyRate) : null,
      monthlyRate: chair.monthlyRate ? Number(chair.monthlyRate) : null,
      amenities: chair.amenities,
      images: chair.images,
      isAvailable: chair.isAvailable,
      isActive: chair.isActive,
      createdAt: chair.createdAt,
      currentRental: chair.rentals.length > 0 ? {
        id: chair.rentals[0].id,
        stylistId: chair.rentals[0].stylistId,
        stylist: stylistsMap.get(chair.rentals[0].stylistId) || null,
        startDate: chair.rentals[0].startDate,
        endDate: chair.rentals[0].endDate,
        monthlyRent: Number(chair.rentals[0].monthlyRent),
        status: chair.rentals[0].status
      } : null
    }))

    // Statistiken berechnen
    const stats = {
      total: chairs.length,
      available: chairs.filter(c => c.isAvailable && c.rentals.length === 0).length,
      rented: chairs.filter(c => c.rentals.length > 0).length,
      inactive: chairs.filter(c => !c.isActive).length
    }

    return NextResponse.json({
      chairs: chairsWithRenters,
      stats
    })
  } catch (error) {
    console.error('Error fetching chairs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Stühle' },
      { status: 500 }
    )
  }
}

// POST /api/salon/chairs - Neuen Stuhl erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, dailyRate, weeklyRate, monthlyRate, amenities, images } = body

    if (!name) {
      return NextResponse.json({ error: 'Name ist erforderlich' }, { status: 400 })
    }

    // Stuhl erstellen
    const chair = await prisma.chair.create({
      data: {
        salonId: salon.id,
        name,
        description,
        dailyRate: dailyRate || null,
        weeklyRate: weeklyRate || null,
        monthlyRate: monthlyRate || null,
        amenities: amenities || [],
        images: images || [],
        isAvailable: true,
        isActive: true
      }
    })

    // Stuhlanzahl im Salon aktualisieren
    await prisma.salon.update({
      where: { id: salon.id },
      data: { chairCount: { increment: 1 } }
    })

    return NextResponse.json(chair, { status: 201 })
  } catch (error) {
    console.error('Error creating chair:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Stuhls' },
      { status: 500 }
    )
  }
}

// PUT /api/salon/chairs - Stuhl aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 404 })
    }

    const body = await request.json()
    const { id, name, description, dailyRate, weeklyRate, monthlyRate, amenities, images, isAvailable, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Stuhl-ID ist erforderlich' }, { status: 400 })
    }

    // Prüfen ob Stuhl zum Salon gehört
    const existingChair = await prisma.chair.findFirst({
      where: { id, salonId: salon.id }
    })

    if (!existingChair) {
      return NextResponse.json({ error: 'Stuhl nicht gefunden' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (dailyRate !== undefined) updateData.dailyRate = dailyRate
    if (weeklyRate !== undefined) updateData.weeklyRate = weeklyRate
    if (monthlyRate !== undefined) updateData.monthlyRate = monthlyRate
    if (amenities !== undefined) updateData.amenities = amenities
    if (images !== undefined) updateData.images = images
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable
    if (isActive !== undefined) updateData.isActive = isActive

    const chair = await prisma.chair.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(chair)
  } catch (error) {
    console.error('Error updating chair:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Stuhls' },
      { status: 500 }
    )
  }
}

// DELETE /api/salon/chairs - Stuhl löschen (soft delete)
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Stuhl-ID ist erforderlich' }, { status: 400 })
    }

    // Prüfen ob Stuhl zum Salon gehört
    const chair = await prisma.chair.findFirst({
      where: { id, salonId: salon.id },
      include: {
        rentals: {
          where: { status: 'ACTIVE' }
        }
      }
    })

    if (!chair) {
      return NextResponse.json({ error: 'Stuhl nicht gefunden' }, { status: 404 })
    }

    // Prüfen ob aktive Miete besteht
    if (chair.rentals.length > 0) {
      return NextResponse.json(
        { error: 'Stuhl kann nicht gelöscht werden - aktive Miete vorhanden' },
        { status: 400 }
      )
    }

    // Soft Delete - nur deaktivieren
    await prisma.chair.update({
      where: { id },
      data: { isActive: false, isAvailable: false }
    })

    // Stuhlanzahl im Salon aktualisieren
    await prisma.salon.update({
      where: { id: salon.id },
      data: { chairCount: { decrement: 1 } }
    })

    return NextResponse.json({ success: true, message: 'Stuhl wurde deaktiviert' })
  } catch (error) {
    console.error('Error deleting chair:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Stuhls' },
      { status: 500 }
    )
  }
}



