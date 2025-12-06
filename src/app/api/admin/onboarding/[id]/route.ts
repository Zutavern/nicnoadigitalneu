import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

// GET: Einzelnen Onboarding-Antrag abrufen
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const onboarding = await prisma.stylistOnboarding.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!onboarding) {
      return NextResponse.json({ error: 'Antrag nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(onboarding)
  } catch (error) {
    console.error('Error fetching onboarding:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Antrags' },
      { status: 500 }
    )
  }
}

// PATCH: Onboarding-Antrag aktualisieren (Genehmigen/Ablehnen)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const body = await request.json()
    const { action, adminNotes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Ungültige Aktion. Erlaubt: approve, reject' },
        { status: 400 }
      )
    }

    // Hole den Antrag
    const onboarding = await prisma.stylistOnboarding.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!onboarding) {
      return NextResponse.json({ error: 'Antrag nicht gefunden' }, { status: 404 })
    }

    // Aktualisiere den Status
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    const updatedOnboarding = await prisma.stylistOnboarding.update({
      where: { id },
      data: {
        onboardingStatus: newStatus,
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        // Bei Genehmigung: Alle Dokumente als geprüft markieren
        ...(action === 'approve' && {
          masterCertificateStatus: onboarding.masterCertificateUrl ? 'APPROVED' : 'PENDING',
          businessRegistrationStatus: onboarding.businessRegistrationUrl ? 'APPROVED' : 'PENDING',
          liabilityInsuranceStatus: onboarding.liabilityInsuranceUrl ? 'APPROVED' : 'PENDING',
          statusDeterminationStatus: onboarding.statusDeterminationUrl ? 'APPROVED' : 'PENDING',
          craftsChamberStatus: onboarding.craftsChamberUrl ? 'APPROVED' : 'PENDING',
        }),
      },
    })

    // Bei Ablehnung: User-Onboarding zurücksetzen, damit er es erneut versuchen kann
    if (action === 'reject') {
      await prisma.user.update({
        where: { id: onboarding.userId },
        data: { onboardingCompleted: false },
      })
    }

    // Sende Benachrichtigung an den Stylist
    try {
      if (action === 'approve') {
        await createNotification({
          userId: onboarding.userId,
          type: 'ONBOARDING_APPROVED',
          title: 'Onboarding genehmigt',
          message: 'Herzlichen Glückwunsch! Dein Onboarding wurde erfolgreich geprüft und genehmigt. Du bist jetzt vollständig freigeschaltet.',
          link: '/stylist',
          metadata: {
            reviewedBy: session.user.id,
            reviewedAt: new Date().toISOString(),
          },
        })
      } else {
        await createNotification({
          userId: onboarding.userId,
          type: 'ONBOARDING_REJECTED',
          title: 'Onboarding abgelehnt',
          message: adminNotes 
            ? `Dein Onboarding wurde abgelehnt. Grund: ${adminNotes}` 
            : 'Dein Onboarding wurde abgelehnt. Bitte überprüfe deine Angaben und versuche es erneut.',
          link: '/onboarding/stylist',
          metadata: {
            reviewedBy: session.user.id,
            reviewedAt: new Date().toISOString(),
            adminNotes: adminNotes || null,
          },
        })
      }
    } catch (notificationError) {
      console.error('Error sending notification to stylist:', notificationError)
      // Fahre fort, auch wenn Benachrichtigung fehlschlägt
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Antrag genehmigt' : 'Antrag abgelehnt',
      onboarding: updatedOnboarding,
    })
  } catch (error) {
    console.error('Error updating onboarding:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Antrags' },
      { status: 500 }
    )
  }
}

