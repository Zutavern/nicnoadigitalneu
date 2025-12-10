import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, RentalStatus } from '@prisma/client'
import { isDemoModeActive, getMockSalonChairRentals } from '@/lib/mock-data'

// GET /api/salon/chair-rentals - Alle Mietanfragen/Mieten abrufen
export async function GET(request: Request) {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockSalonChairRentals())
    }

    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as RentalStatus | null

    // Salon des Besitzers finden
    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 404 })
    }

    // Where-Klausel bauen
    const where: Record<string, unknown> = {
      chair: { salonId: salon.id }
    }
    if (status) where.status = status

    // Mietanfragen abrufen
    const rentals = await prisma.chairRental.findMany({
      where,
      include: {
        chair: {
          select: {
            id: true,
            name: true,
            monthlyRate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Stylisten-Infos hinzufügen
    const stylistIds = [...new Set(rentals.map(r => r.stylistId))]
    const stylists = await prisma.user.findMany({
      where: { id: { in: stylistIds } },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        image: true,
        stylistProfile: {
          select: {
            phone: true,
            yearsExperience: true,
            specialties: true
          }
        }
      }
    })
    const stylistsMap = new Map(stylists.map(s => [s.id, s]))

    const rentalsWithStylists = rentals.map(rental => ({
      id: rental.id,
      chairId: rental.chairId,
      chair: {
        id: rental.chair.id,
        name: rental.chair.name,
        monthlyRate: rental.chair.monthlyRate ? Number(rental.chair.monthlyRate) : null
      },
      stylistId: rental.stylistId,
      stylist: stylistsMap.get(rental.stylistId) || null,
      startDate: rental.startDate,
      endDate: rental.endDate,
      monthlyRent: Number(rental.monthlyRent),
      deposit: rental.deposit ? Number(rental.deposit) : null,
      status: rental.status,
      contractUrl: rental.contractUrl,
      notes: rental.notes,
      createdAt: rental.createdAt,
      updatedAt: rental.updatedAt
    }))

    // Statistiken
    const stats = {
      pending: rentals.filter(r => r.status === 'PENDING').length,
      active: rentals.filter(r => r.status === 'ACTIVE').length,
      completed: rentals.filter(r => r.status === 'COMPLETED').length,
      cancelled: rentals.filter(r => r.status === 'CANCELLED').length
    }

    return NextResponse.json({
      rentals: rentalsWithStylists,
      stats
    })
  } catch (error) {
    console.error('Error fetching chair rentals:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Mietanfragen' },
      { status: 500 }
    )
  }
}

// PUT /api/salon/chair-rentals - Mietanfrage akzeptieren/ablehnen
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { rentalId, action, notes } = body

    if (!rentalId || !action) {
      return NextResponse.json(
        { error: 'Rental-ID und Aktion sind erforderlich' },
        { status: 400 }
      )
    }

    // Salon des Besitzers finden
    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 404 })
    }

    // Mietanfrage prüfen
    const rental = await prisma.chairRental.findFirst({
      where: { 
        id: rentalId,
        chair: { salonId: salon.id }
      },
      include: { chair: true }
    })

    if (!rental) {
      return NextResponse.json({ error: 'Mietanfrage nicht gefunden' }, { status: 404 })
    }

    let updatedRental

    switch (action) {
      case 'accept':
        if (rental.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Nur ausstehende Anfragen können akzeptiert werden' },
            { status: 400 }
          )
        }

        // Mietanfrage akzeptieren
        updatedRental = await prisma.chairRental.update({
          where: { id: rentalId },
          data: { 
            status: 'ACTIVE',
            notes: notes || rental.notes
          }
        })

        // Stuhl als nicht verfügbar markieren
        await prisma.chair.update({
          where: { id: rental.chairId },
          data: { isAvailable: false }
        })

        // TODO: Benachrichtigung an Stylisten senden
        break

      case 'reject':
        if (rental.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Nur ausstehende Anfragen können abgelehnt werden' },
            { status: 400 }
          )
        }

        updatedRental = await prisma.chairRental.update({
          where: { id: rentalId },
          data: { 
            status: 'CANCELLED',
            notes: notes || rental.notes
          }
        })

        // TODO: Benachrichtigung an Stylisten senden
        break

      case 'terminate':
        if (rental.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Nur aktive Mieten können beendet werden' },
            { status: 400 }
          )
        }

        updatedRental = await prisma.chairRental.update({
          where: { id: rentalId },
          data: { 
            status: 'COMPLETED',
            endDate: new Date(),
            notes: notes || rental.notes
          }
        })

        // Stuhl wieder als verfügbar markieren
        await prisma.chair.update({
          where: { id: rental.chairId },
          data: { isAvailable: true }
        })

        // TODO: Benachrichtigung an Stylisten senden
        break

      default:
        return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      rental: updatedRental,
      message: action === 'accept' ? 'Mietanfrage akzeptiert' : 
               action === 'reject' ? 'Mietanfrage abgelehnt' : 
               'Miete beendet'
    })
  } catch (error) {
    console.error('Error updating chair rental:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Mietanfrage' },
      { status: 500 }
    )
  }
}







