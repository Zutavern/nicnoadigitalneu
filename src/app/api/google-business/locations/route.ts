import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { googleBusinessTokenService } from '@/lib/google-business/token-service'
import { GoogleBusinessApiClient } from '@/lib/google-business/api-client'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const client = new GoogleBusinessApiClient(session.user.id)
    const initialized = await client.initialize()
    
    if (!initialized) {
      return NextResponse.json(
        { error: 'Keine Google Business Verbindung' },
        { status: 404 }
      )
    }

    const locations = await client.getLocations()

    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Error getting locations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Standorte' },
      { status: 500 }
    )
  }
}

// Save selected location
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { locationId, locationName } = await request.json()

    if (!locationId || !locationName) {
      return NextResponse.json(
        { error: 'locationId und locationName erforderlich' },
        { status: 400 }
      )
    }

    // Get temp data from callback
    const tempDataCookie = request.cookies.get('google_business_temp')?.value
    
    if (!tempDataCookie) {
      return NextResponse.json(
        { error: 'Temporäre Daten abgelaufen. Bitte erneut verbinden.' },
        { status: 400 }
      )
    }

    const tempData = JSON.parse(Buffer.from(tempDataCookie, 'base64').toString())

    // Store connection
    await googleBusinessTokenService.storeConnection(
      session.user.id,
      tempData.tokens,
      tempData.accountInfo,
      locationId,
      locationName
    )

    const response = NextResponse.json({ 
      success: true,
      message: 'Standort erfolgreich verbunden'
    })
    
    // Clear temp cookie
    response.cookies.delete('google_business_temp')

    return response
  } catch (error) {
    console.error('Error saving location:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Standorts' },
      { status: 500 }
    )
  }
}

