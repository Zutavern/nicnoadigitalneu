import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { sendEmail } from '@/lib/email'

// POST /api/salon/invitations/resend/[id] - Einladung erneut senden
export async function POST(
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

    const invitation = await prisma.salonInvitation.findUnique({
      where: { id },
      include: {
        invitedUser: {
          select: { name: true },
        },
      },
    })

    if (!invitation || invitation.salonId !== salon.id) {
      return NextResponse.json(
        { error: 'Einladung nicht gefunden' },
        { status: 404 }
      )
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Nur ausstehende Einladungen können erneut gesendet werden' },
        { status: 400 }
      )
    }

    // Prüfen ob abgelaufen - wenn ja, neues Ablaufdatum setzen
    const isExpired = new Date(invitation.expiresAt) < new Date()
    
    // E-Mail erneut senden
    const baseUrl = process.env.NEXTAUTH_URL || 'https://nicnoa.de'
    const invitationUrl = `${baseUrl}/join/${invitation.shortCode}`

    try {
      if (invitation.invitedUserId) {
        // Nutzer ist registriert
        await sendEmail({
          to: invitation.invitedEmail,
          template: 'salon-invitation',
          data: {
            salonName: salon.name,
            inviterName: session.user.name || 'Ein Salonbesitzer',
            invitationUrl,
            message: invitation.message,
            recipientName: invitation.invitedUser?.name || 'Stylist',
          },
        })
      } else {
        // Nutzer ist nicht registriert
        await sendEmail({
          to: invitation.invitedEmail,
          template: 'salon-invitation-unregistered',
          data: {
            salonName: salon.name,
            inviterName: session.user.name || 'Ein Salonbesitzer',
            invitationUrl,
            registrationUrl: `${baseUrl}/auth/register?invite=${invitation.shortCode}`,
            message: invitation.message,
          },
        })
      }
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      return NextResponse.json(
        { error: 'Fehler beim Senden der E-Mail' },
        { status: 500 }
      )
    }

    // Einladung aktualisieren
    await prisma.salonInvitation.update({
      where: { id },
      data: {
        emailSentAt: new Date(),
        // Wenn abgelaufen, neues Ablaufdatum setzen (7 Tage)
        ...(isExpired && { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }),
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Einladung wurde erneut gesendet',
      extended: isExpired,
    })
  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { error: 'Fehler beim erneuten Senden der Einladung' },
      { status: 500 }
    )
  }
}








