import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendTestEmail } from '@/lib/email'

// POST - Test-Email senden
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { templateSlug, testEmail } = body

    if (!templateSlug || !testEmail) {
      return NextResponse.json(
        { error: 'Template Slug und Test-E-Mail erforderlich' },
        { status: 400 }
      )
    }

    // Validiere E-Mail-Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      )
    }

    const result = await sendTestEmail(templateSlug, testEmail)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Fehler beim Senden' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      preview: result.preview || false,
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Test-E-Mail' },
      { status: 500 }
    )
  }
}


