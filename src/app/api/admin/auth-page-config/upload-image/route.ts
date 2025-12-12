import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put, del } from '@vercel/blob'

// Erlaubte Dateitypen
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

// Max. Dateigröße
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

// POST - Upload Bild zu Vercel Blob
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
    const type = formData.get('type') as string // 'login' | 'register'
    
    if (!file) {
      return NextResponse.json({ error: 'Keine Datei gefunden' }, { status: 400 })
    }

    // Bild-Validierung
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Ungültiger Bildtyp. Erlaubt: JPEG, PNG, WebP, AVIF' },
        { status: 400 }
      )
    }
    
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Bild zu groß (max. 10MB)' },
        { status: 400 }
      )
    }

    // Generiere eindeutigen Dateinamen
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `auth/${type || 'login'}-${timestamp}.${extension}`

    // Upload zu Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Error uploading auth image:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Bildes' },
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
    console.error('Error deleting auth image:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Bildes' },
      { status: 500 }
    )
  }
}
