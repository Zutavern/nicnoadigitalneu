import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token ist erforderlich'),
})

// POST /api/invitation/accept - Einladung annehmen
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht angemeldet', code: 'NOT_AUTHENTICATED' },
        { status: 401 }
      )
    }

    // Prüfen ob der Nutzer ein Stylist ist
    if (session.user.role !== UserRole.STYLIST) {
      return NextResponse.json(
        { error: 'Nur Stylisten können Einladungen annehmen', code: 'WRONG_ROLE' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { token } = acceptInvitationSchema.parse(body)

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

    // Status-Prüfungen
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Diese Einladung ist nicht mehr gültig', code: 'INVALID_STATUS' },
        { status: 400 }
      )
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Diese Einladung ist abgelaufen', code: 'EXPIRED' },
        { status: 410 }
      )
    }

    // Prüfen ob der aktuelle Nutzer der Eingeladene ist (oder die E-Mail passt)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        onboardingCompleted: true,
        stylistOnboarding: {
          select: { onboardingStatus: true },
        },
      },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Nutzer nicht gefunden', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Prüfen ob Onboarding abgeschlossen ist
    if (!currentUser.onboardingCompleted || currentUser.stylistOnboarding?.onboardingStatus !== 'APPROVED') {
      return NextResponse.json({
        error: 'Bitte schließen Sie zuerst das Onboarding ab',
        code: 'ONBOARDING_REQUIRED',
        onboardingStatus: currentUser.stylistOnboarding?.onboardingStatus || 'NOT_STARTED',
      }, { status: 403 })
    }

    // Prüfen ob bereits verbunden
    const existingConnection = await prisma.salonStylistConnection.findUnique({
      where: {
        salonId_stylistId: {
          salonId: invitation.salonId,
          stylistId: currentUser.id,
        },
      },
    })

    if (existingConnection?.isActive) {
      return NextResponse.json({
        error: 'Sie sind bereits mit diesem Salon verbunden',
        code: 'ALREADY_CONNECTED',
      }, { status: 400 })
    }

    // Transaktion: Einladung annehmen und Verbindung erstellen
    const result = await prisma.$transaction(async (tx) => {
      // Einladung aktualisieren
      await tx.salonInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
          invitedUserId: currentUser.id,
        },
      })

      // Verbindung erstellen oder reaktivieren
      let connection
      if (existingConnection) {
        connection = await tx.salonStylistConnection.update({
          where: { id: existingConnection.id },
          data: {
            isActive: true,
            leftAt: null,
            joinedAt: new Date(),
          },
        })
      } else {
        connection = await tx.salonStylistConnection.create({
          data: {
            salonId: invitation.salonId,
            stylistId: currentUser.id,
            role: 'CHAIR_RENTER',
          },
        })
      }

      return connection
    })

    // Benachrichtigung an Salonbesitzer senden
    try {
      await sendEmail({
        to: invitation.invitedBy.email,
        template: 'salon-invitation-accepted',
        data: {
          salonName: invitation.salon.name,
          stylistName: currentUser.name || currentUser.email,
          ownerName: invitation.invitedBy.name || 'Salonbesitzer',
        },
      })
    } catch (emailError) {
      console.error('Error sending acceptance notification:', emailError)
    }

    // Notification für Salonbesitzer erstellen
    await prisma.notification.create({
      data: {
        userId: invitation.salon.ownerId,
        type: 'SYSTEM_ALERT',
        title: 'Einladung angenommen',
        message: `${currentUser.name || currentUser.email} hat Ihre Einladung für ${invitation.salon.name} angenommen.`,
        link: '/salon/stylists',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Einladung erfolgreich angenommen',
      connection: result,
      salon: {
        id: invitation.salon.id,
        name: invitation.salon.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Annehmen der Einladung' },
      { status: 500 }
    )
  }
}


