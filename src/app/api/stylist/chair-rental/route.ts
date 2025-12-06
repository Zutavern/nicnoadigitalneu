import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDemoModeActive, getMockStylistChairRental } from '@/lib/mock-data'

// GET /api/stylist/chair-rental - Aktuelle Miete und Mietanfragen abrufen
export async function GET() {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockStylistChairRental())
    }

    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Alle Mietanfragen/Mieten des Stylisten abrufen
    const rentals = await prisma.chairRental.findMany({
      where: { stylistId: session.user.id },
      include: {
        chair: {
          include: {
            salon: {
              select: {
                id: true,
                name: true,
                street: true,
                city: true,
                zipCode: true,
                phone: true,
                images: true,
                owner: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Aktive Miete finden
    const activeRental = rentals.find(r => r.status === 'ACTIVE')
    
    // Ausstehende Anfragen
    const pendingRentals = rentals.filter(r => r.status === 'PENDING')

    // Vergangene Mieten
    const pastRentals = rentals.filter(r => 
      r.status === 'COMPLETED' || r.status === 'CANCELLED'
    )

    const formatRental = (rental: typeof rentals[0]) => ({
      id: rental.id,
      chair: {
        id: rental.chair.id,
        name: rental.chair.name,
        description: rental.chair.description,
        amenities: rental.chair.amenities,
        images: rental.chair.images
      },
      salon: {
        id: rental.chair.salon.id,
        name: rental.chair.salon.name,
        address: `${rental.chair.salon.street}, ${rental.chair.salon.zipCode} ${rental.chair.salon.city}`,
        phone: rental.chair.salon.phone,
        image: rental.chair.salon.images?.[0] || null,
        owner: rental.chair.salon.owner
      },
      startDate: rental.startDate,
      endDate: rental.endDate,
      monthlyRent: Number(rental.monthlyRent),
      deposit: rental.deposit ? Number(rental.deposit) : null,
      status: rental.status,
      notes: rental.notes,
      createdAt: rental.createdAt
    })

    return NextResponse.json({
      activeRental: activeRental ? formatRental(activeRental) : null,
      pendingRentals: pendingRentals.map(formatRental),
      pastRentals: pastRentals.map(formatRental)
    })
  } catch (error) {
    console.error('Error fetching chair rental:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Stuhlmiete' },
      { status: 500 }
    )
  }
}

// POST /api/stylist/chair-rental - Mietanfrage stellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { chairId, startDate, message } = body

    if (!chairId || !startDate) {
      return NextResponse.json(
        { error: 'Stuhl-ID und Startdatum sind erforderlich' },
        { status: 400 }
      )
    }

    // Prüfen ob bereits eine aktive Miete oder ausstehende Anfrage existiert
    const existingRental = await prisma.chairRental.findFirst({
      where: {
        stylistId: session.user.id,
        status: { in: ['ACTIVE', 'PENDING'] }
      }
    })

    if (existingRental) {
      const message = existingRental.status === 'ACTIVE'
        ? 'Sie haben bereits eine aktive Stuhlmiete'
        : 'Sie haben bereits eine ausstehende Mietanfrage'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Stuhl prüfen
    const chair = await prisma.chair.findUnique({
      where: { id: chairId },
      include: { salon: true }
    })

    if (!chair) {
      return NextResponse.json({ error: 'Stuhl nicht gefunden' }, { status: 404 })
    }

    if (!chair.isAvailable || !chair.isActive) {
      return NextResponse.json(
        { error: 'Dieser Stuhl ist nicht verfügbar' },
        { status: 400 }
      )
    }

    // Prüfen ob der Stylist mit dem Salon verbunden ist
    const connection = await prisma.salonStylistConnection.findUnique({
      where: {
        salonId_stylistId: {
          salonId: chair.salonId,
          stylistId: session.user.id,
        },
      },
    })

    if (!connection || !connection.isActive) {
      return NextResponse.json(
        { error: 'Sie sind nicht mit diesem Salon verbunden. Bitte warten Sie auf eine Einladung.' },
        { status: 403 }
      )
    }

    // Mietanfrage erstellen
    const rental = await prisma.chairRental.create({
      data: {
        chairId,
        stylistId: session.user.id,
        startDate: new Date(startDate),
        monthlyRent: chair.monthlyRate || 0,
        deposit: chair.monthlyRate ? Number(chair.monthlyRate) * 2 : null, // 2 Monatsmieten Kaution
        status: 'PENDING',
        notes: message || null
      },
      include: {
        chair: {
          include: {
            salon: {
              select: {
                id: true,
                name: true,
                owner: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      }
    })

    // TODO: Benachrichtigung an Salonbesitzer senden

    return NextResponse.json({
      success: true,
      rental: {
        id: rental.id,
        chair: {
          id: rental.chair.id,
          name: rental.chair.name
        },
        salon: {
          id: rental.chair.salon.id,
          name: rental.chair.salon.name
        },
        startDate: rental.startDate,
        monthlyRent: Number(rental.monthlyRent),
        deposit: rental.deposit ? Number(rental.deposit) : null,
        status: rental.status,
        createdAt: rental.createdAt
      },
      message: 'Mietanfrage wurde erfolgreich gesendet'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating chair rental request:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Mietanfrage' },
      { status: 500 }
    )
  }
}

// DELETE /api/stylist/chair-rental - Mietanfrage zurückziehen oder Miete kündigen
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const rentalId = searchParams.get('id')

    if (!rentalId) {
      return NextResponse.json({ error: 'Rental-ID ist erforderlich' }, { status: 400 })
    }

    // Miete finden und prüfen
    const rental = await prisma.chairRental.findFirst({
      where: {
        id: rentalId,
        stylistId: session.user.id
      }
    })

    if (!rental) {
      return NextResponse.json({ error: 'Mietanfrage nicht gefunden' }, { status: 404 })
    }

    if (rental.status === 'PENDING') {
      // Ausstehende Anfrage zurückziehen
      await prisma.chairRental.update({
        where: { id: rentalId },
        data: { status: 'CANCELLED' }
      })

      return NextResponse.json({
        success: true,
        message: 'Mietanfrage wurde zurückgezogen'
      })
    } else if (rental.status === 'ACTIVE') {
      // Aktive Miete kündigen (mit Kündigungsfrist)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1) // 1 Monat Kündigungsfrist

      await prisma.chairRental.update({
        where: { id: rentalId },
        data: { 
          endDate,
          notes: `Kündigung eingereicht am ${new Date().toLocaleDateString('de-DE')}`
        }
      })

      // TODO: Benachrichtigung an Salonbesitzer senden

      return NextResponse.json({
        success: true,
        message: `Kündigung wurde eingereicht. Die Miete endet am ${endDate.toLocaleDateString('de-DE')}`
      })
    }

    return NextResponse.json(
      { error: 'Diese Miete kann nicht gekündigt werden' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error cancelling chair rental:', error)
    return NextResponse.json(
      { error: 'Fehler beim Kündigen der Miete' },
      { status: 500 }
    )
  }
}

