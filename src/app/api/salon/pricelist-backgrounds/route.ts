import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'

// GET - Salon-Hintergründe abrufen (eigene + Admin als Fallback)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'SALON') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Salon-Profil finden
    const salonProfile = await prisma.salonProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!salonProfile) {
      return NextResponse.json(
        { error: 'Salon-Profil nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe ob Salon eigene Hintergründe hat
    const salonBackgrounds = await prisma.pricelistBackground.findMany({
      where: { 
        type: 'salon',
        salonId: salonProfile.id,
      },
      orderBy: [
        { isActive: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Admin-Hintergründe (aktive)
    const adminBackgrounds = await prisma.pricelistBackground.findMany({
      where: { 
        type: 'admin',
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Zähle aktive eigene Hintergründe
    const salonActiveCount = salonBackgrounds.filter(bg => bg.isActive).length
    const hasOwnBackgrounds = salonBackgrounds.length > 0
    const useOwnBackgrounds = salonActiveCount > 0

    return NextResponse.json({
      salonBackgrounds,
      adminBackgrounds,
      salonActiveCount,
      adminActiveCount: adminBackgrounds.length,
      hasOwnBackgrounds,
      useOwnBackgrounds,
      maxActive: 6,
    })
  } catch (error) {
    console.error('Error fetching salon pricelist backgrounds:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Hintergründe' },
      { status: 500 }
    )
  }
}

// POST - Neuen Salon-Hintergrund hochladen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'SALON') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Salon-Profil finden
    const salonProfile = await prisma.salonProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!salonProfile) {
      return NextResponse.json(
        { error: 'Salon-Profil nicht gefunden' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Datei ist erforderlich' },
        { status: 400 }
      )
    }

    // Validierung: Nur Bilder
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nur PNG, JPG und WebP Dateien erlaubt' },
        { status: 400 }
      )
    }

    // Max 5MB
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
    const fileName = `pricelist-bg-salon-${salonProfile.id}-${timestamp}.${fileExt}`
    const blobPath = `pricelist-backgrounds/salon/${salonProfile.id}/${fileName}`

    // Upload zu Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    })

    // Aktuelle höchste sortOrder ermitteln
    const lastBackground = await prisma.pricelistBackground.findFirst({
      where: { type: 'salon', salonId: salonProfile.id },
      orderBy: { sortOrder: 'desc' },
    })
    const nextSortOrder = (lastBackground?.sortOrder ?? -1) + 1

    // In Datenbank speichern
    const background = await prisma.pricelistBackground.create({
      data: {
        url: blob.url,
        filename: file.name,
        type: 'salon',
        salonId: salonProfile.id,
        sortOrder: nextSortOrder,
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      background,
    })
  } catch (error) {
    console.error('Error uploading salon pricelist background:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Hintergrunds' },
      { status: 500 }
    )
  }
}

