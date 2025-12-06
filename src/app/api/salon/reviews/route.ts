import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockSalonReviews } from '@/lib/mock-data'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        ...getMockSalonReviews(),
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    // Find the salon owned by this user
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
      },
    })

    if (!salon) {
      return NextResponse.json({ 
        reviews: [],
        stats: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        }
      })
    }

    // Get all reviews for this salon
    const reviews = await prisma.review.findMany({
      where: {
        salonId: salon.id,
      },
      include: {
        customer: true,
        stylist: {
          select: {
            name: true,
          },
        },
        booking: {
          select: {
            services: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // Calculate stats
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    // Calculate rating distribution
    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      const rating = Math.round(review.rating)
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++
      }
    })

    // Format reviews for response
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      customerName: `${review.customer.firstName} ${review.customer.lastName}`,
      customerImage: null,
      stylistName: review.stylist?.name || 'Unbekannt',
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      serviceName: review.booking?.services?.[0] || null,
    }))

    return NextResponse.json({
      reviews: formattedReviews,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
      },
    })
  } catch (error) {
    console.error('Error fetching salon reviews:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
