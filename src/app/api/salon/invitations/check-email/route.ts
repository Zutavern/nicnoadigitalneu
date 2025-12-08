import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const checkEmailSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
})

// POST /api/salon/invitations/check-email - E-Mail-Status prüfen
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const body = await request.json()
    const { email } = checkEmailSchema.parse(body)

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    // Nutzer suchen
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        onboardingCompleted: true,
        stylistOnboarding: {
          select: {
            onboardingStatus: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({
        status: 'not_registered',
        message: 'Dieser Nutzer ist noch nicht auf der Plattform registriert.',
        canInvite: true,
      })
    }

    // Prüfen ob es ein Stylist ist
    if (user.role !== UserRole.STYLIST) {
      return NextResponse.json({
        status: 'wrong_role',
        message: 'Nur Stylisten können als Stuhlmieter eingeladen werden.',
        canInvite: false,
        user: {
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        },
      })
    }

    // Prüfen ob bereits verbunden
    const existingConnection = await prisma.salonStylistConnection.findUnique({
      where: {
        salonId_stylistId: {
          salonId: salon.id,
          stylistId: user.id,
        },
      },
    })

    if (existingConnection?.isActive) {
      return NextResponse.json({
        status: 'already_connected',
        message: 'Dieser Stylist ist bereits mit Ihrem Salon verbunden.',
        canInvite: false,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
    }

    // Prüfen ob bereits eine Einladung existiert
    const existingInvitation = await prisma.salonInvitation.findFirst({
      where: {
        salonId: salon.id,
        invitedEmail: email.toLowerCase(),
        status: 'PENDING',
      },
    })

    if (existingInvitation) {
      return NextResponse.json({
        status: 'already_invited',
        message: 'Es existiert bereits eine ausstehende Einladung.',
        canInvite: false,
        invitationId: existingInvitation.id,
        shortCode: existingInvitation.shortCode,
      })
    }

    // E-Mail-Verifizierung prüfen
    if (!user.emailVerified) {
      return NextResponse.json({
        status: 'needs_email_verification',
        message: 'Dieser Nutzer muss zuerst seine E-Mail-Adresse verifizieren.',
        canInvite: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
    }

    // Onboarding prüfen
    const onboardingStatus = user.stylistOnboarding?.onboardingStatus
    if (!user.onboardingCompleted || onboardingStatus !== 'APPROVED') {
      return NextResponse.json({
        status: 'needs_onboarding',
        message: 'Dieser Nutzer muss zuerst das Onboarding abschließen und von NICNOA freigegeben werden.',
        canInvite: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        onboardingStatus: onboardingStatus || 'NOT_STARTED',
      })
    }

    // Nutzer ist bereit für Einladung
    return NextResponse.json({
      status: 'verified',
      message: 'Dieser Stylist kann eingeladen werden.',
      canInvite: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Fehler beim Prüfen der E-Mail' },
      { status: 500 }
    )
  }
}



