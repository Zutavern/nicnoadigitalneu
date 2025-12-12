import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

// DELETE /api/salon/invitations/[id] - Einladung widerrufen
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
      select: { id: true },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    const invitation = await prisma.salonInvitation.findUnique({
      where: { id },
    })

    if (!invitation || invitation.salonId !== salon.id) {
      return NextResponse.json(
        { error: 'Einladung nicht gefunden oder nicht berechtigt' },
        { status: 404 }
      )
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Nur ausstehende Einladungen können widerrufen werden' },
        { status: 400 }
      )
    }

    await prisma.salonInvitation.update({
      where: { id },
      data: {
        status: 'REVOKED',
        respondedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: 'Einladung wurde widerrufen' })
  } catch (error) {
    console.error('Error revoking invitation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Widerrufen der Einladung' },
      { status: 500 }
    )
  }
}

// GET /api/salon/invitations/[id] - Einladungsdetails abrufen
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

    const invitation = await prisma.salonInvitation.findUnique({
      where: { id },
      include: {
        invitedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
            onboardingCompleted: true,
          },
        },
      },
    })

    if (!invitation || invitation.salonId !== salon.id) {
      return NextResponse.json(
        { error: 'Einladung nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Einladung' },
      { status: 500 }
    )
  }
}








