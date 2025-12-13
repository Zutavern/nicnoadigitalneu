import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/invitation/[token] - Einladungsdetails öffentlich abrufen
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Suche nach Token oder ShortCode
    const invitation = await prisma.salonInvitation.findFirst({
      where: {
        OR: [
          { token },
          { shortCode: token },
        ],
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
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Einladung nicht gefunden', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Prüfen ob abgelaufen
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json({
        error: 'Diese Einladung ist abgelaufen',
        code: 'EXPIRED',
        salon: {
          name: invitation.salon.name,
        },
      }, { status: 410 })
    }

    // Prüfen ob widerrufen
    if (invitation.status === 'REVOKED') {
      return NextResponse.json({
        error: 'Diese Einladung wurde zurückgezogen',
        code: 'REVOKED',
        salon: {
          name: invitation.salon.name,
        },
      }, { status: 410 })
    }

    // Prüfen ob bereits angenommen
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json({
        error: 'Diese Einladung wurde bereits angenommen',
        code: 'ALREADY_ACCEPTED',
        salon: {
          name: invitation.salon.name,
        },
      }, { status: 410 })
    }

    // Prüfen ob abgelehnt
    if (invitation.status === 'REJECTED') {
      return NextResponse.json({
        error: 'Diese Einladung wurde abgelehnt',
        code: 'REJECTED',
        salon: {
          name: invitation.salon.name,
        },
      }, { status: 410 })
    }

    // viewedAt aktualisieren (nur wenn noch nicht angesehen)
    if (!invitation.viewedAt) {
      await prisma.salonInvitation.update({
        where: { id: invitation.id },
        data: { viewedAt: new Date() },
      })
    }

    return NextResponse.json({
      id: invitation.id,
      shortCode: invitation.shortCode,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      message: invitation.message,
      invitedEmail: invitation.invitedEmail,
      salon: invitation.salon,
      invitedBy: invitation.invitedBy,
    })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Einladung' },
      { status: 500 }
    )
  }
}











