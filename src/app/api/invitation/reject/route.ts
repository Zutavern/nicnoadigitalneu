import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'

const rejectInvitationSchema = z.object({
  token: z.string().min(1, 'Token ist erforderlich'),
  reason: z.string().optional(),
})

// POST /api/invitation/reject - Einladung ablehnen
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht angemeldet', code: 'NOT_AUTHENTICATED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token, reason } = rejectInvitationSchema.parse(body)

    // Einladung finden
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
            ownerId: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
            email: true,
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

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Diese Einladung ist nicht mehr gültig', code: 'INVALID_STATUS' },
        { status: 400 }
      )
    }

    // Einladung ablehnen
    await prisma.salonInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
        invitedUserId: session.user.id,
      },
    })

    // Benachrichtigung an Salonbesitzer senden
    try {
      await sendEmail({
        to: invitation.invitedBy.email,
        template: 'salon-invitation-rejected',
        data: {
          salonName: invitation.salon.name,
          stylistEmail: invitation.invitedEmail,
          ownerName: invitation.invitedBy.name || 'Salonbesitzer',
          reason: reason || 'Kein Grund angegeben',
        },
      })
    } catch (emailError) {
      console.error('Error sending rejection notification:', emailError)
    }

    // Notification für Salonbesitzer erstellen
    await prisma.notification.create({
      data: {
        userId: invitation.salon.ownerId,
        type: 'SYSTEM_ALERT',
        title: 'Einladung abgelehnt',
        message: `Die Einladung an ${invitation.invitedEmail} für ${invitation.salon.name} wurde abgelehnt.`,
        link: '/salon/stylists',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Einladung wurde abgelehnt',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error rejecting invitation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Ablehnen der Einladung' },
      { status: 500 }
    )
  }
}




