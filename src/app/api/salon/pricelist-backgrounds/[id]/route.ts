import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { del } from '@vercel/blob'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH - Hintergrund aktivieren/deaktivieren
export async function PATCH(request: Request, { params }: RouteParams) {
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

    const { id } = await params
    const body = await request.json()
    const { isActive, sortOrder } = body

    // Prüfen ob Hintergrund existiert und dem Salon gehört
    const existing = await prisma.pricelistBackground.findUnique({
      where: { id },
    })

    if (!existing || existing.type !== 'salon' || existing.salonId !== salonProfile.id) {
      return NextResponse.json(
        { error: 'Hintergrund nicht gefunden' },
        { status: 404 }
      )
    }

    // Wenn aktiviert werden soll, prüfen ob max 6 erreicht
    if (isActive === true && !existing.isActive) {
      const activeCount = await prisma.pricelistBackground.count({
        where: { 
          type: 'salon', 
          salonId: salonProfile.id, 
          isActive: true,
        },
      })

      if (activeCount >= 6) {
        return NextResponse.json(
          { error: 'Maximal 6 Hintergründe können gleichzeitig aktiv sein' },
          { status: 400 }
        )
      }
    }

    // Update durchführen
    const updateData: { isActive?: boolean; sortOrder?: number } = {}
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (typeof sortOrder === 'number') updateData.sortOrder = sortOrder

    const background = await prisma.pricelistBackground.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      background,
    })
  } catch (error) {
    console.error('Error updating salon pricelist background:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Hintergrunds' },
      { status: 500 }
    )
  }
}

// DELETE - Hintergrund löschen
export async function DELETE(request: Request, { params }: RouteParams) {
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

    const { id } = await params

    // Hintergrund finden und prüfen ob er dem Salon gehört
    const background = await prisma.pricelistBackground.findUnique({
      where: { id },
    })

    if (!background || background.type !== 'salon' || background.salonId !== salonProfile.id) {
      return NextResponse.json(
        { error: 'Hintergrund nicht gefunden' },
        { status: 404 }
      )
    }

    // Blob löschen
    if (background.url.includes('blob.vercel-storage.com')) {
      try {
        await del(background.url)
      } catch (deleteError) {
        console.warn('Could not delete blob:', deleteError)
      }
    }

    // Aus Datenbank löschen
    await prisma.pricelistBackground.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting salon pricelist background:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Hintergrunds' },
      { status: 500 }
    )
  }
}

