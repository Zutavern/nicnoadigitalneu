import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDefaultTokens } from '@/lib/design-presets'

/**
 * GET /api/admin/newsletter/base-template
 * 
 * Lädt das Branding (Logo, Farben, Footer) für den Newsletter-Editor
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Platform-Settings und Design-Tokens laden
    const settings = await prisma.platformSettings.findFirst({
      where: { id: 'default' },
      select: {
        emailLogoUrl: true,
        emailPrimaryColor: true,
        emailFooterText: true,
        companyName: true,
        websiteUrl: true,
        designTokens: true,
        designSystemPreset: true,
      },
    })

    // Design-Tokens ermitteln
    let tokens = getDefaultTokens()
    
    if (settings?.designTokens) {
      tokens = settings.designTokens as typeof tokens
    }

    // Primary color aus Tokens oder Email-spezifischer Farbe
    const primaryColor = settings?.emailPrimaryColor || tokens.colors?.primary || '#ec4899'

    // Branding-Config erstellen - NICNOA&CO.online als Standard-Firmenname
    const branding = {
      logoUrl: settings?.emailLogoUrl || null,
      primaryColor,
      companyName: settings?.companyName || 'NICNOA&CO.online',
      websiteUrl: settings?.websiteUrl || 'https://www.nicnoa.online',
      // Footer Links (können später in Settings konfigurierbar gemacht werden)
      footerLinks: [
        { label: 'Website', url: settings?.websiteUrl || 'https://www.nicnoa.online' },
        { label: 'Datenschutz', url: `${settings?.websiteUrl || 'https://www.nicnoa.online'}/datenschutz` },
        { label: 'Impressum', url: `${settings?.websiteUrl || 'https://www.nicnoa.online'}/impressum` },
      ],
    }

    return NextResponse.json({
      branding,
    })
  } catch (error) {
    console.error('Base template error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Brandings' },
      { status: 500 }
    )
  }
}
