import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put, del } from '@vercel/blob'

// Erlaubte Dateitypen für Newsletter
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Max. Dateigröße (5MB für Bilder)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export const dynamic = 'force-dynamic'

/**
 * POST - Upload Bild für Newsletter zu Vercel Blob
 * Bilder werden mit öffentlichen URLs gespeichert, damit sie in E-Mails funktionieren
 */
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
    const type = formData.get('type') as string // 'content' | 'thumbnail' | 'product' | 'profile'
    
    if (!file) {
      return NextResponse.json({ error: 'Keine Datei gefunden' }, { status: 400 })
    }

    // Bild-Validierung
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Ungültiger Bildtyp. Erlaubt: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }
    
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Bild zu groß (max. 5MB)' },
        { status: 400 }
      )
    }

    // Generiere eindeutigen Dateinamen
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const imageType = type || 'content'
    const filename = `newsletter/${imageType}/${timestamp}-${randomSuffix}.${extension}`

    // Upload zu Vercel Blob mit öffentlichem Zugriff
    // Wichtig: access: 'public' damit die URL in E-Mails funktioniert
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
    console.error('Error uploading newsletter image:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Bildes' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Lösche Newsletter-Bild aus Vercel Blob
 */
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
      return NextResponse.json({ error: 'Keine URL angegeben' }, { status: 400 })
    }

    // Nur Newsletter-Bilder löschen erlauben
    if (!url.includes('/newsletter/')) {
      return NextResponse.json({ error: 'Ungültige Bild-URL' }, { status: 400 })
    }

    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting newsletter image:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Bildes' },
      { status: 500 }
    )
  }
}



