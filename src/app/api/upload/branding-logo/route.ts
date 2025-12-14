import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'platform', 'salon', 'stylist'
    const oldUrl = formData.get('oldUrl') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Datei ist erforderlich' },
        { status: 400 }
      )
    }

    if (!type || !['platform', 'salon', 'stylist'].includes(type)) {
      return NextResponse.json(
        { error: 'Ungültiger Typ. Erlaubt: platform, salon, stylist' },
        { status: 400 }
      )
    }

    // Admin-Check für Platform-Branding
    if (type === 'platform' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht berechtigt' },
        { status: 403 }
      )
    }

    // Validierung der Dateitypen
    const allowedTypes = [
      'image/svg+xml',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nur SVG, PNG, JPG und WebP Dateien erlaubt' },
        { status: 400 }
      )
    }

    // Max 2MB für Logos
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei darf maximal 2MB groß sein' },
        { status: 400 }
      )
    }

    // Generiere eindeutigen Dateinamen
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const timestamp = Date.now()
    const userId = session.user.id
    
    let fileName: string
    let blobPath: string

    switch (type) {
      case 'platform':
        fileName = `platform-logo-${timestamp}.${fileExt}`
        blobPath = `branding/platform/${fileName}`
        break
      case 'salon':
        fileName = `salon-${userId}-${timestamp}.${fileExt}`
        blobPath = `branding/salon/${fileName}`
        break
      case 'stylist':
        fileName = `stylist-${userId}-${timestamp}.${fileExt}`
        blobPath = `branding/stylist/${fileName}`
        break
      default:
        return NextResponse.json(
          { error: 'Ungültiger Typ' },
          { status: 400 }
        )
    }

    // Altes Logo löschen falls vorhanden
    if (oldUrl && oldUrl.includes('blob.vercel-storage.com')) {
      try {
        await del(oldUrl)
      } catch (deleteError) {
        console.warn('Could not delete old logo:', deleteError)
        // Fortfahren auch wenn Löschen fehlschlägt
      }
    }

    // Upload zu Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    })

    // URL in Datenbank speichern basierend auf Typ
    if (type === 'platform') {
      await prisma.platformSettings.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          emailLogoUrl: blob.url,
        },
        update: {
          emailLogoUrl: blob.url,
        },
      })
    } else if (type === 'stylist') {
      await prisma.stylistProfile.upsert({
        where: { userId },
        create: {
          userId,
          brandingLogoUrl: blob.url,
        },
        update: {
          brandingLogoUrl: blob.url,
        },
      })
    } else if (type === 'salon') {
      await prisma.salonProfile.upsert({
        where: { userId },
        create: {
          userId,
          salonName: 'Mein Salon', // Default name, wird später überschrieben
          brandingLogoUrl: blob.url,
        },
        update: {
          brandingLogoUrl: blob.url,
        },
      })
    }

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

// DELETE - Logo löschen
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const url = searchParams.get('url')

    if (!type || !url) {
      return NextResponse.json(
        { error: 'Typ und URL sind erforderlich' },
        { status: 400 }
      )
    }

    // Admin-Check für Platform-Branding
    if (type === 'platform' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht berechtigt' },
        { status: 403 }
      )
    }

    // Blob löschen
    if (url.includes('blob.vercel-storage.com')) {
      try {
        await del(url)
      } catch (deleteError) {
        console.warn('Could not delete blob:', deleteError)
      }
    }

    // URL aus Datenbank entfernen
    const userId = session.user.id

    if (type === 'platform') {
      await prisma.platformSettings.update({
        where: { id: 'default' },
        data: { emailLogoUrl: null },
      })
    } else if (type === 'stylist') {
      await prisma.stylistProfile.update({
        where: { userId },
        data: { brandingLogoUrl: null },
      })
    } else if (type === 'salon') {
      await prisma.salonProfile.update({
        where: { userId },
        data: { brandingLogoUrl: null },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Logos' },
      { status: 500 }
    )
  }
}

