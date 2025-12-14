import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'

// GET - Alle Admin-Hintergründe abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const backgrounds = await prisma.pricelistBackground.findMany({
      where: { type: 'admin' },
      orderBy: [
        { isActive: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Zähle aktive Hintergründe
    const activeCount = backgrounds.filter(bg => bg.isActive).length

    return NextResponse.json({
      backgrounds,
      activeCount,
      maxActive: 6,
    })
  } catch (error) {
    console.error('Error fetching pricelist backgrounds:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Hintergründe' },
      { status: 500 }
    )
  }
}

// POST - Neuen Hintergrund hochladen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
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

    // Max 5MB für Hintergründe
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
    const fileName = `pricelist-bg-admin-${timestamp}.${fileExt}`
    const blobPath = `pricelist-backgrounds/admin/${fileName}`

    // Upload zu Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    })

    // Aktuelle höchste sortOrder ermitteln
    const lastBackground = await prisma.pricelistBackground.findFirst({
      where: { type: 'admin' },
      orderBy: { sortOrder: 'desc' },
    })
    const nextSortOrder = (lastBackground?.sortOrder ?? -1) + 1

    // In Datenbank speichern
    const background = await prisma.pricelistBackground.create({
      data: {
        url: blob.url,
        filename: file.name,
        type: 'admin',
        sortOrder: nextSortOrder,
        isActive: false, // Standardmäßig nicht aktiv
      },
    })

    return NextResponse.json({
      success: true,
      background,
    })
  } catch (error) {
    console.error('Error uploading pricelist background:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Hintergrunds' },
      { status: 500 }
    )
  }
}

