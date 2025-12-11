import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put, del } from '@vercel/blob'

// Erlaubte Dateitypen
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

// Max. Dateigrößen
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

// POST - Upload Bild/Video zu Vercel Blob
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'hero' | 'og' | 'video' | 'video-poster'
    
    if (!file) {
      return NextResponse.json({ error: 'Keine Datei gefunden' }, { status: 400 })
    }

    // Prüfe ob Video oder Bild
    const isVideo = type === 'video' || ALLOWED_VIDEO_TYPES.includes(file.type)
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)

    // Validierung basierend auf Dateityp
    if (isVideo) {
      // Video-Validierung
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Ungültiger Videotyp. Erlaubt: MP4, WebM, MOV' },
          { status: 400 }
        )
      }
      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: 'Video zu groß (max. 100MB)' },
          { status: 400 }
        )
      }
    } else if (isImage) {
      // Bild-Validierung
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: 'Bild zu groß (max. 10MB)' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Ungültiger Dateityp. Erlaubt: JPEG, PNG, WebP, AVIF, MP4, WebM, MOV' },
        { status: 400 }
      )
    }

    // Generiere eindeutigen Dateinamen
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg')
    const folder = isVideo ? 'videos' : 'homepage'
    const filename = `${folder}/${type || 'hero'}-${timestamp}.${extension}`

    // Upload zu Vercel Blob
    // Vercel Blob unterstützt Streaming für Videos automatisch
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      // Content-Type Header für korrektes Streaming
      contentType: file.type,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
      size: file.size,
      type: file.type,
      isVideo,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei' },
      { status: 500 }
    )
  }
}

// DELETE - Lösche Bild aus Vercel Blob
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL erforderlich' }, { status: 400 })
    }

    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Datei' },
      { status: 500 }
    )
  }
}




