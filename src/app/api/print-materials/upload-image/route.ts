import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { trackUpload } from '@/lib/media/track-upload'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Nur Salon Owner und Stylisten dürfen Bilder hochladen
    if (session.user.role !== 'SALON_OWNER' && session.user.role !== 'STYLIST' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    // Validiere Dateityp
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Ungültiges Dateiformat. Erlaubt: JPEG, PNG, GIF, WebP, SVG' },
        { status: 400 }
      )
    }

    // Validiere Dateigröße (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei zu groß. Maximum: 5MB' },
        { status: 400 }
      )
    }

    // Generiere eindeutigen Dateinamen
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `print-materials/${session.user.id}/${timestamp}-${randomString}.${extension}`

    // Upload zu Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    })

    // Track in Media Library
    await trackUpload({
      userId: session.user.id,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: blob.url,
      category: 'PRINT_MATERIALS',
      uploadContext: 'print-materials',
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Error uploading print material image:', error)
    return NextResponse.json({ error: 'Fehler beim Upload' }, { status: 500 })
  }
}
