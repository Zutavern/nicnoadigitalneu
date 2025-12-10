import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDemoModeActive, getMockStylistInvitations } from '@/lib/mock-data'

// GET /api/stylist/invitations - Offene Einladungen an mich
export async function GET() {
  try {
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockStylistInvitations())
    }

    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Aktuelle E-Mail des Nutzers
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Nutzer nicht gefunden' }, { status: 404 })
    }

    // Ausstehende Einladungen finden (per E-Mail oder User-ID)
    const invitations = await prisma.salonInvitation.findMany({
      where: {
        OR: [
          { invitedEmail: user.email.toLowerCase() },
          { invitedUserId: session.user.id },
        ],
        status: 'PENDING',
        expiresAt: { gte: new Date() },
      },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            street: true,
            city: true,
            zipCode: true,
            images: true,
            description: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invitations.map(inv => ({
      id: inv.id,
      shortCode: inv.shortCode,
      status: inv.status,
      expiresAt: inv.expiresAt,
      message: inv.message,
      createdAt: inv.createdAt,
      salon: inv.salon,
      invitedBy: inv.invitedBy,
    })))
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Einladungen' },
      { status: 500 }
    )
  }
}







