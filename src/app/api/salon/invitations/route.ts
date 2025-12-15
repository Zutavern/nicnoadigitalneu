import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isDemoModeActive, getMockSalonInvitations } from '@/lib/mock-data'
import crypto from 'crypto'

// GET /api/salon/invitations - Alle Einladungen abrufen
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    // Demo-Modus prüfen ODER kein Salon vorhanden
    const demoMode = await isDemoModeActive()
    if (demoMode || !salon) {
      const mockInvitations = getMockSalonInvitations()
      return NextResponse.json({
        invitations: mockInvitations,
        stats: {
          total: mockInvitations.length,
          pending: mockInvitations.filter((i: { status: string }) => i.status === 'PENDING').length,
          accepted: mockInvitations.filter((i: { status: string }) => i.status === 'ACCEPTED').length,
          expired: mockInvitations.filter((i: { status: string }) => i.status === 'EXPIRED').length,
          rejected: mockInvitations.filter((i: { status: string }) => i.status === 'REJECTED').length,
        },
        _source: 'demo',
        _message: !salon 
          ? 'Kein Salon vorhanden - Es werden Beispieldaten angezeigt'
          : 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const invitations = await prisma.salonInvitation.findMany({
      where: { salonId: salon.id },
      orderBy: { createdAt: 'desc' },
    })

    // Statistiken
    const stats = {
      total: invitations.length,
      pending: invitations.filter(i => i.status === 'PENDING').length,
      accepted: invitations.filter(i => i.status === 'ACCEPTED').length,
      expired: invitations.filter(i => i.status === 'EXPIRED').length,
      rejected: invitations.filter(i => i.status === 'REJECTED').length,
    }

    return NextResponse.json({
      invitations: invitations.map(inv => ({
        id: inv.id,
        email: inv.invitedEmail,
        name: inv.invitedName,
        status: inv.status,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
        message: inv.message,
        viewedAt: inv.viewedAt,
        respondedAt: inv.respondedAt,
      })),
      stats,
    })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einladungen' },
      { status: 500 }
    )
  }
}

// POST /api/salon/invitations - Neue Einladung erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon nicht gefunden' }, { status: 404 })
    }

    const body = await request.json()
    const { email, name, message } = body

    if (!email) {
      return NextResponse.json({ error: 'E-Mail ist erforderlich' }, { status: 400 })
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
      return NextResponse.json(
        { error: 'Eine ausstehende Einladung für diese E-Mail existiert bereits' },
        { status: 400 }
      )
    }

    // Token und Shortcode generieren
    const token = crypto.randomUUID()
    const shortCode = crypto.randomBytes(4).toString('hex').toUpperCase()

    // Einladung erstellen (30 Tage gültig)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const invitation = await prisma.salonInvitation.create({
      data: {
        salonId: salon.id,
        invitedById: session.user.id,
        invitedEmail: email.toLowerCase(),
        invitedName: name || null,
        token,
        shortCode,
        status: 'PENDING',
        expiresAt,
        message,
      },
    })

    // TODO: E-Mail an Eingeladenen senden

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.invitedEmail,
        name: invitation.invitedName,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        shortCode: invitation.shortCode,
      },
    })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Einladung' },
      { status: 500 }
    )
  }
}
