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

    // Find the salon owned by this user
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
      },
    })

    // Check if demo mode is active OR no salon exists (show mock data)
    const demoMode = await isDemoModeActive()
    if (demoMode || !salon) {
      return NextResponse.json({
        ...getMockSalonReviews(),
        _source: 'demo',
        _message: !salon 
          ? 'Kein Salon vorhanden - Es werden Beispieldaten angezeigt'
          : 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    // Get all reviews for this salon
    const reviews = await prisma.review.findMany({
      where: {
        salonId: salon.id,
        isPublic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // Get stylist names for the reviews
    const stylistIds = reviews
      .filter(r => r.stylistId)
      .map(r => r.stylistId as string)
    
    const stylists = stylistIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: stylistIds } },
          select: { id: true, name: true },
        })
      : []

    const stylistMap = new Map(stylists.map(s => [s.id, s.name]))

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
      customerName: review.reviewerName || 'Anonymer Kunde',
      customerImage: null,
      stylistName: review.stylistId ? (stylistMap.get(review.stylistId) || 'Unbekannt') : 'Unbekannt',
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      serviceName: null, // No service relation in current schema
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
