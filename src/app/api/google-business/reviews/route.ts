import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createGoogleBusinessClient } from '@/lib/google-business/api-client'
import { MOCK_GOOGLE_BUSINESS_DATA } from '@/lib/google-business/mock-data'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const client = await createGoogleBusinessClient(session.user.id)
    
    if (!client) {
      // Return mock data if not connected
      return NextResponse.json({
        reviews: MOCK_GOOGLE_BUSINESS_DATA.reviews,
        stats: MOCK_GOOGLE_BUSINESS_DATA.reviewStats,
        isDemo: true,
      })
    }

    const { reviews, stats } = await client.getReviews()

    return NextResponse.json({
      reviews,
      stats,
      isDemo: false,
    })
  } catch (error) {
    console.error('Error getting reviews:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Bewertungen' },
      { status: 500 }
    )
  }
}

// Reply to a review
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const client = await createGoogleBusinessClient(session.user.id)
    
    if (!client) {
      return NextResponse.json(
        { error: 'Keine Google Business Verbindung' },
        { status: 404 }
      )
    }

    const { reviewId, text } = await request.json()

    if (!reviewId || !text) {
      return NextResponse.json(
        { error: 'reviewId und text erforderlich' },
        { status: 400 }
      )
    }

    await client.replyToReview({ reviewId, text })

    return NextResponse.json({ 
      success: true,
      message: 'Antwort gesendet'
    })
  } catch (error) {
    console.error('Error replying to review:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Antwort' },
      { status: 500 }
    )
  }
}

// Delete a review reply
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const client = await createGoogleBusinessClient(session.user.id)
    
    if (!client) {
      return NextResponse.json(
        { error: 'Keine Google Business Verbindung' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId erforderlich' },
        { status: 400 }
      )
    }

    await client.deleteReviewReply(reviewId)

    return NextResponse.json({ 
      success: true,
      message: 'Antwort gelöscht'
    })
  } catch (error) {
    console.error('Error deleting review reply:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Antwort' },
      { status: 500 }
    )
  }
}

