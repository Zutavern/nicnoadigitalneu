import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const city = searchParams.get('city')

    // Build where clause
    const whereClause: any = {
      isActive: true,
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (city) {
      whereClause.city = city
    }

    // Get salons with available chairs
    const salons = await prisma.salon.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            name: true,
            image: true,
          },
        },
        chairs: {
          select: {
            id: true,
            pricePerMonth: true,
            isAvailable: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      take: 50,
    })

    // Calculate stats for each salon
    const salonsWithStats = salons.map(salon => {
      const availableChairs = salon.chairs.filter(c => c.isAvailable)
      const prices = salon.chairs.map(c => c.pricePerMonth.toNumber())
      const ratings = salon.reviews.map(r => r.rating)
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0

      return {
        id: salon.id,
        name: salon.name,
        address: salon.address,
        city: salon.city,
        zipCode: salon.zipCode,
        description: salon.description,
        image: salon.images?.[0] || null,
        rating: avgRating,
        reviewCount: ratings.length,
        availableChairs: availableChairs.length,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        amenities: salon.amenities || [],
        owner: salon.owner,
      }
    })

    // Sort by available chairs first, then by rating
    salonsWithStats.sort((a, b) => {
      if (a.availableChairs > 0 && b.availableChairs === 0) return -1
      if (a.availableChairs === 0 && b.availableChairs > 0) return 1
      return b.rating - a.rating
    })

    return NextResponse.json(salonsWithStats)
  } catch (error) {
    console.error('Error fetching salons:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Salons' },
      { status: 500 }
    )
  }
}

