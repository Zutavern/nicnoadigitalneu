import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { sendEmail } from '@/lib/email'

// DELETE /api/salon/connections/[id] - Verbindung trennen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const { id } = await params

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    const connection = await prisma.salonStylistConnection.findUnique({
      where: { id },
      include: {
        stylist: {
          select: { name: true, email: true },
        },
      },
    })

    if (!connection || connection.salonId !== salon.id) {
      return NextResponse.json(
        { error: 'Verbindung nicht gefunden' },
        { status: 404 }
      )
    }

    if (!connection.isActive) {
      return NextResponse.json(
        { error: 'Verbindung ist bereits inaktiv' },
        { status: 400 }
      )
    }

    // Verbindung deaktivieren
    await prisma.salonStylistConnection.update({
      where: { id },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    })

    // Aktive Stuhlmieten beenden
    await prisma.chairRental.updateMany({
      where: {
        stylistId: connection.stylistId,
        chair: { salonId: salon.id },
        status: 'ACTIVE',
      },
      data: {
        status: 'ENDED',
        endDate: new Date(),
      },
    })

    // E-Mail an Stylisten senden
    try {
      await sendEmail({
        to: connection.stylist.email,
        template: 'stylist-left-salon',
        data: {
          salonName: salon.name,
          stylistName: connection.stylist.name || 'Stylist',
        },
      })
    } catch (emailError) {
      console.error('Error sending notification email:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verbindung wurde getrennt' 
    })
  } catch (error) {
    console.error('Error disconnecting stylist:', error)
    return NextResponse.json(
      { error: 'Fehler beim Trennen der Verbindung' },
      { status: 500 }
    )
  }
}

// GET /api/salon/connections/[id] - Einzelne Verbindung abrufen
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const { id } = await params

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    const connection = await prisma.salonStylistConnection.findUnique({
      where: { id },
      include: {
        stylist: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            stylistProfile: true,
          },
        },
      },
    })

    if (!connection || connection.salonId !== salon.id) {
      return NextResponse.json(
        { error: 'Verbindung nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(connection)
  } catch (error) {
    console.error('Error fetching connection:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Verbindung' },
      { status: 500 }
    )
  }
}










