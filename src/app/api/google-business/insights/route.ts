import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createGoogleBusinessClient } from '@/lib/google-business/api-client'
import { MOCK_GOOGLE_BUSINESS_DATA } from '@/lib/google-business/mock-data'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') as '7d' | '28d' | '90d' | null

    const client = await createGoogleBusinessClient(session.user.id)
    
    if (!client) {
      // Return mock data if not connected
      return NextResponse.json({
        insights: MOCK_GOOGLE_BUSINESS_DATA.insights,
        isDemo: true,
      })
    }

    const insights = await client.getInsights(period || '28d')

    return NextResponse.json({
      insights,
      isDemo: false,
    })
  } catch (error) {
    console.error('Error getting insights:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Insights' },
      { status: 500 }
    )
  }
}

