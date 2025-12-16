import { NextResponse } from 'next/server'
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
        checklist: MOCK_GOOGLE_BUSINESS_DATA.checklist,
        score: MOCK_GOOGLE_BUSINESS_DATA.score,
        isDemo: true,
      })
    }

    const [checklist, score] = await Promise.all([
      client.generateChecklist(),
      client.calculateProfileScore(),
    ])

    return NextResponse.json({
      checklist,
      score,
      isDemo: false,
    })
  } catch (error) {
    console.error('Error getting checklist:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Checkliste' },
      { status: 500 }
    )
  }
}

