import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { isDemoModeActive, getMockSalonInvitations } from '@/lib/mock-data'
import { sendEmail } from '@/lib/email'

// Token generieren
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// Kurzen Code generieren (8 Zeichen, alphanumerisch)
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Keine verwechselbaren Zeichen (0,O,1,I)
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// GET /api/salon/invitations - Alle Einladungen des Salons abrufen
export async function GET() {
  try {
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockSalonInvitations())
    }

    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    const invitations = await prisma.salonInvitation.findMany({
      where: { salonId: salon.id },
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Einladungen' },
      { status: 500 }
    )
  }
}

// POST /api/salon/invitations - Neue Einladung erstellen
const createInvitationSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  message: z.string().optional(),
  sendEmail: z.boolean().optional().default(true),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createInvitationSchema.parse(body)

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    // Prüfen ob bereits eine aktive Einladung existiert
    const existingInvitation = await prisma.salonInvitation.findFirst({
      where: {
        salonId: salon.id,
        invitedEmail: validatedData.email.toLowerCase(),
        status: 'PENDING',
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Es existiert bereits eine ausstehende Einladung für diese E-Mail' },
        { status: 400 }
      )
    }

    // Prüfen ob der Nutzer bereits mit dem Salon verbunden ist
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      select: {
        id: true,
        name: true,
        emailVerified: true,
        onboardingCompleted: true,
        role: true,
      },
    })

    if (existingUser) {
      // Prüfen ob bereits eine Verbindung existiert
      const existingConnection = await prisma.salonStylistConnection.findUnique({
        where: {
          salonId_stylistId: {
            salonId: salon.id,
            stylistId: existingUser.id,
          },
        },
      })

      if (existingConnection?.isActive) {
        return NextResponse.json(
          { error: 'Dieser Nutzer ist bereits mit Ihrem Salon verbunden' },
          { status: 400 }
        )
      }

      // Prüfen ob es ein Stylist ist
      if (existingUser.role !== UserRole.STYLIST) {
        return NextResponse.json(
          { error: 'Nur Stylisten können als Stuhlmieter eingeladen werden' },
          { status: 400 }
        )
      }
    }

    // Token und ShortCode generieren
    const token = generateToken()
    let shortCode = generateShortCode()

    // Sicherstellen dass ShortCode eindeutig ist
    let attempts = 0
    while (await prisma.salonInvitation.findUnique({ where: { shortCode } })) {
      shortCode = generateShortCode()
      attempts++
      if (attempts > 10) {
        return NextResponse.json(
          { error: 'Fehler bei der Code-Generierung. Bitte erneut versuchen.' },
          { status: 500 }
        )
      }
    }

    // Einladung erstellen
    const invitation = await prisma.salonInvitation.create({
      data: {
        salonId: salon.id,
        invitedById: session.user.id,
        invitedEmail: validatedData.email.toLowerCase(),
        invitedUserId: existingUser?.id || null,
        invitedName: existingUser?.name || null,
        token,
        shortCode,
        message: validatedData.message,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Tage
        emailSentAt: validatedData.sendEmail ? new Date() : null,
      },
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

    // E-Mail senden wenn gewünscht
    if (validatedData.sendEmail) {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://nicnoa.de'
      const invitationUrl = `${baseUrl}/join/${shortCode}`

      try {
        if (existingUser) {
          // Nutzer ist registriert
          await sendEmail({
            to: validatedData.email,
            template: 'salon-invitation',
            data: {
              salonName: salon.name,
              inviterName: session.user.name || 'Ein Salonbesitzer',
              invitationUrl,
              message: validatedData.message,
              recipientName: existingUser.name || 'Stylist',
            },
          })
        } else {
          // Nutzer ist nicht registriert
          await sendEmail({
            to: validatedData.email,
            template: 'salon-invitation-unregistered',
            data: {
              salonName: salon.name,
              inviterName: session.user.name || 'Ein Salonbesitzer',
              invitationUrl,
              registrationUrl: `${baseUrl}/auth/register?invite=${shortCode}`,
              message: validatedData.message,
            },
          })
        }
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError)
        // Einladung wurde erstellt, E-Mail-Fehler wird ignoriert
      }
    }

    // Status-Info hinzufügen
    const userStatus = existingUser
      ? existingUser.onboardingCompleted
        ? 'verified'
        : existingUser.emailVerified
          ? 'needs_onboarding'
          : 'needs_email_verification'
      : 'not_registered'

    return NextResponse.json({
      ...invitation,
      userStatus,
      invitationUrl: `${process.env.NEXTAUTH_URL || 'https://nicnoa.de'}/join/${shortCode}`,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Einladung' },
      { status: 500 }
    )
  }
}





