import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderNewsletterToHtml } from '@/lib/newsletter-builder/render-email'
import type { NewsletterBlock } from '@/lib/newsletter-builder/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST - Test-E-Mail für Newsletter senden
 * Rendert den aktuellen Newsletter-Content und sendet ihn an eine Test-Adresse
 * Verwendet automatisch die Test-Domain wenn die eigene Domain nicht verifiziert ist
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { email, contentBlocks } = body

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse erforderlich' },
        { status: 400 }
      )
    }

    // Newsletter laden
    const newsletter = await prisma.newsletter.findUnique({ where: { id } })
    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter nicht gefunden' },
        { status: 404 }
      )
    }

    // Resend-Konfiguration aus Platform Settings laden
    const settings = await prisma.platformSettings.findFirst()
    if (!settings?.resendEnabled || !settings?.resendApiKey) {
      return NextResponse.json(
        { error: 'E-Mail-Versand ist nicht konfiguriert. Bitte Resend in den Einstellungen aktivieren.' },
        { status: 500 }
      )
    }

    // Branding laden - NICNOA&CO.online als Standard-Firmenname
    const branding = {
      logoUrl: settings.emailLogoUrl || undefined,
      primaryColor: settings.emailPrimaryColor || '#10b981',
      companyName: settings.companyName || 'NICNOA&CO.online',
      websiteUrl: settings.websiteUrl || 'https://www.nicnoa.online',
    }

    // HTML Content generieren
    // Entweder vom Request (für Live-Preview) oder vom gespeicherten Newsletter
    let htmlContent: string

    if (contentBlocks && Array.isArray(contentBlocks) && contentBlocks.length > 0) {
      // Live-Content vom Editor verwenden
      htmlContent = renderNewsletterToHtml(contentBlocks as NewsletterBlock[], branding)
    } else if (newsletter.htmlContent) {
      // Gespeicherten Content verwenden
      htmlContent = newsletter.htmlContent
    } else {
      // Content aus designJson generieren
      const designJson = newsletter.designJson as Record<string, unknown> | null
      const blocks = (designJson?.contentBlocks as NewsletterBlock[]) || []
      
      if (blocks.length === 0) {
        return NextResponse.json(
          { error: 'Newsletter hat keinen Inhalt. Bitte zuerst Blöcke hinzufügen.' },
          { status: 400 }
        )
      }
      
      htmlContent = renderNewsletterToHtml(blocks, branding)
    }

    // From-Adresse bestimmen - mit Fallback auf Test-Domain
    const fromName = settings.resendFromName || settings.companyName || 'NICNOA'
    
    // Hilfsfunktion zum E-Mail senden
    async function tryToSendEmail(fromAddress: string): Promise<Response> {
      return fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings!.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [email],
          subject: `[TEST] ${newsletter!.subject}`,
          html: htmlContent,
        }),
      })
    }

    // Zuerst mit der konfigurierten Domain versuchen (falls vorhanden)
    let response: Response
    let usedTestDomain = false

    if (settings.resendFromEmail) {
      // Versuche mit der konfigurierten Domain
      response = await tryToSendEmail(`${fromName} <${settings.resendFromEmail}>`)
      
      // Wenn Domain-Fehler, automatisch auf Test-Domain wechseln
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = (errorData.message || '').toLowerCase()
        
        if (errorMessage.includes('domain') || errorMessage.includes('verif')) {
          console.log('Domain nicht verifiziert, wechsle zu Resend Test-Domain...')
          response = await tryToSendEmail(`${fromName} <onboarding@resend.dev>`)
          usedTestDomain = true
        } else {
          // Anderer Fehler
          return NextResponse.json(
            { error: errorData.message || 'Fehler beim Senden der Test-E-Mail' },
            { status: 500 }
          )
        }
      }
    } else {
      // Keine eigene Domain konfiguriert, direkt Test-Domain verwenden
      response = await tryToSendEmail(`${fromName} <onboarding@resend.dev>`)
      usedTestDomain = true
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Resend API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'Fehler beim Senden der Test-E-Mail' },
        { status: 500 }
      )
    }

    const successMessage = usedTestDomain
      ? `Test-E-Mail wurde an ${email} gesendet (via Resend Test-Domain)`
      : `Test-E-Mail wurde an ${email} gesendet`

    return NextResponse.json({
      success: true,
      message: successMessage,
      usedTestDomain,
    })
  } catch (error) {
    console.error('Send test email error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Test-E-Mail' },
      { status: 500 }
    )
  }
}
