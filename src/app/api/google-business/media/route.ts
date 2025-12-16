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
        media: MOCK_GOOGLE_BUSINESS_DATA.photos,
        isDemo: true,
      })
    }

    const media = await client.getMedia()

    return NextResponse.json({
      media,
      isDemo: false,
    })
  } catch (error) {
    console.error('Error getting media:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Medien' },
      { status: 500 }
    )
  }
}

// Upload a photo
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

    const { url, category } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'url erforderlich' },
        { status: 400 }
      )
    }

    const photoId = await client.uploadPhoto(url, category || 'ADDITIONAL')

    return NextResponse.json({ 
      success: true,
      photoId,
      message: 'Foto hochgeladen'
    })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Fotos' },
      { status: 500 }
    )
  }
}

// Delete a photo
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
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json(
        { error: 'photoId erforderlich' },
        { status: 400 }
      )
    }

    await client.deletePhoto(photoId)

    return NextResponse.json({ 
      success: true,
      message: 'Foto gelöscht'
    })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Fotos' },
      { status: 500 }
    )
  }
}

