import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDemoModeActive, getMockFindSalonsWithChairs } from '@/lib/mock-data'

// GET /api/stylist/find-salon/[id] - Salon-Details mit Stühlen abrufen
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      const mockSalons = getMockFindSalonsWithChairs()
      const mockSalon = mockSalons.find(s => s.id === id)
      if (!mockSalon) {
        // Return first mock salon for demo
        const salon = mockSalons[0]
        return NextResponse.json({
          ...salon,
          slug: salon.id,
          street: salon.address,
          phone: '+49 89 123456',
          email: 'info@salon.de',
          website: 'https://salon.de',
          images: [],
          owner: { ...salon.owner, email: 'owner@salon.de' }
        })
      }
      return NextResponse.json({
        ...mockSalon,
        slug: mockSalon.id,
        street: mockSalon.address,
        phone: '+49 89 123456',
        email: 'info@salon.de',
        website: 'https://salon.de',
        images: [],
        owner: { ...mockSalon.owner, email: 'owner@salon.de' }
      })
    }

    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Salon mit Stühlen abrufen
    const salon = await prisma.salon.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
        chairs: {
          where: { isActive: true },
          include: {
            rentals: {
              where: {
                status: 'ACTIVE',
                OR: [
                  { endDate: null },
                  { endDate: { gte: new Date() } }
                ]
              },
              take: 1
            }
          },
          orderBy: { name: 'asc' }
        },
        reviews: {
          select: { rating: true }
        }
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    // Durchschnittsbewertung berechnen
    const ratings = salon.reviews.map(r => r.rating)
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0

    // Stühle formatieren (isAvailable basierend auf aktiven Mieten)
    const chairsFormatted = salon.chairs.map(chair => ({
      id: chair.id,
      name: chair.name,
      description: chair.description,
      monthlyRate: chair.monthlyRate ? Number(chair.monthlyRate) : null,
      amenities: chair.amenities,
      isAvailable: chair.isAvailable && chair.rentals.length === 0
    }))

    return NextResponse.json({
      id: salon.id,
      name: salon.name,
      slug: salon.slug,
      description: salon.description,
      street: salon.street,
      city: salon.city,
      zipCode: salon.zipCode,
      phone: salon.phone,
      email: salon.email,
      website: salon.website,
      images: salon.images,
      amenities: salon.amenities,
      rating: avgRating,
      reviewCount: ratings.length,
      owner: salon.owner,
      chairs: chairsFormatted
    })
  } catch (error) {
    console.error('Error fetching salon detail:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Salons' },
      { status: 500 }
    )
  }
}


