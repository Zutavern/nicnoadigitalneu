import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDemoModeActive, getMockStylistAvailability } from '@/lib/mock-data'

export async function GET() {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockStylistAvailability())
    }

    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const stylistProfile = await prisma.stylistProfile.findUnique({
      where: { userId: session.user.id },
      select: { availability: true },
    })

    if (!stylistProfile) {
      return NextResponse.json({ error: 'Profil nicht gefunden' }, { status: 404 })
    }

    // Return default availability if none set
    const defaultAvailability = {
      monday: { enabled: true, slots: [{ id: '1', start: '09:00', end: '17:00' }] },
      tuesday: { enabled: true, slots: [{ id: '2', start: '09:00', end: '17:00' }] },
      wednesday: { enabled: true, slots: [{ id: '3', start: '09:00', end: '17:00' }] },
      thursday: { enabled: true, slots: [{ id: '4', start: '09:00', end: '17:00' }] },
      friday: { enabled: true, slots: [{ id: '5', start: '09:00', end: '17:00' }] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] },
    }

    return NextResponse.json(stylistProfile.availability || defaultAvailability)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Verfügbarkeit' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const availability = await request.json()

    const stylistProfile = await prisma.stylistProfile.upsert({
      where: { userId: session.user.id },
      update: { availability },
      create: {
        userId: session.user.id,
        availability,
      },
    })

    return NextResponse.json({ success: true, availability: stylistProfile.availability })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Verfügbarkeit' },
      { status: 500 }
    )
  }
}
