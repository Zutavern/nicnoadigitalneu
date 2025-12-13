import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht berechtigt' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const testimonialId = formData.get('testimonialId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Datei ist erforderlich' },
        { status: 400 }
      )
    }

    // Validierung der Dateitypen (Bilder)
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/svg+xml'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nur PNG, JPG, WebP und SVG Dateien erlaubt' },
        { status: 400 }
      )
    }

    // Max 5MB für Bilder
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei darf maximal 5MB groß sein' },
        { status: 400 }
      )
    }

    // Generiere eindeutigen Dateinamen
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const timestamp = Date.now()
    const fileName = testimonialId 
      ? `testimonial-${testimonialId}-${timestamp}.${fileExt}`
      : `testimonial-${timestamp}.${fileExt}`
    
    const blobPath = `testimonials/${fileName}`

    // Upload zu Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    })

    return NextResponse.json({ 
      url: blob.url,
      fileName,
      success: true 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei' },
      { status: 500 }
    )
  }
}







