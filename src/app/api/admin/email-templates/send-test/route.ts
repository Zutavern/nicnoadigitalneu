import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

// POST - Test-Email senden
// Test-E-Mails verwenden automatisch Resend's Test-Domain (onboarding@resend.dev)
// damit sie auch ohne verifizierte Domain funktionieren
// Wenn keine E-Mail-Adresse angegeben wird, wird die E-Mail an den eingeloggten User gesendet
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { templateSlug, testEmail } = body

    if (!templateSlug) {
      return NextResponse.json(
        { error: 'Template Slug erforderlich' },
        { status: 400 }
      )
    }

    // Verwende testEmail aus Body ODER die E-Mail des eingeloggten Users
    const recipientEmail = testEmail || session.user.email
    
    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Keine E-Mail-Adresse verfügbar' },
        { status: 400 }
      )
    }

    // Validiere E-Mail-Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      )
    }

    // Test-E-Mail mit Beispiel-Daten senden
    // useTestSender: true verwendet Resend's Test-Domain (onboarding@resend.dev)
    // Damit funktionieren Test-E-Mails auch ohne verifizierte Domain
    const result = await sendEmail({
      to: recipientEmail,
      templateSlug: templateSlug,
      data: {
        userName: session.user.name || 'Test-Benutzer',
        userEmail: recipientEmail,
      },
      useTestSender: true, // Immer Test-Sender für Test-E-Mails verwenden
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Fehler beim Senden' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: recipientEmail,
      info: 'Test-E-Mail gesendet via Resend Test-Domain (onboarding@resend.dev)',
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Test-E-Mail' },
      { status: 500 }
    )
  }
}
