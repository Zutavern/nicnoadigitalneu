import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

interface UnsplashPhoto {
  id: string
  urls: {
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    username: string
  }
  links: {
    download: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { searchTerms } = body

    if (!searchTerms?.length) {
      return NextResponse.json({ images: [] })
    }

    // Wenn kein Unsplash API Key konfiguriert ist, gib leeres Array zurück
    if (!UNSPLASH_ACCESS_KEY) {
      console.log('Unsplash API key not configured')
      return NextResponse.json({ images: [] })
    }

    // Kombiniere Suchbegriffe für eine bessere Suche
    const query = searchTerms.slice(0, 3).join(' ')

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=9&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Unsplash API error:', response.status)
      return NextResponse.json({ images: [] })
    }

    const data = await response.json()
    
    const images = data.results.map((photo: UnsplashPhoto) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumb: photo.urls.small,
      alt: photo.alt_description || photo.description || searchTerms[0],
      photographer: photo.user.name,
      photographerUrl: `https://unsplash.com/@${photo.user.username}`,
      downloadUrl: photo.links.download,
    }))

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error fetching Unsplash images:', error)
    return NextResponse.json({ images: [] })
  }
}

