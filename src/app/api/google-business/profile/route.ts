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
        profile: MOCK_GOOGLE_BUSINESS_DATA.profile,
        isDemo: true,
      })
    }

    const profile = await client.getProfile()

    return NextResponse.json({
      profile,
      isDemo: false,
    })
  } catch (error) {
    console.error('Error getting profile:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Profils' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const updates = await request.json()
    await client.updateProfile(updates)

    return NextResponse.json({ 
      success: true,
      message: 'Profil aktualisiert'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Profils' },
      { status: 500 }
    )
  }
}

