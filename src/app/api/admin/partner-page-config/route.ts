import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Hole Partner-Seiten-Konfiguration
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Hole aus PlatformSettings
    const settings = await prisma.platformSettings.findFirst()
    
    // Extrahiere Partner-Konfiguration aus den Settings
    const partnerConfig = settings?.partnerPageConfig as Record<string, unknown> || {}

    return NextResponse.json({
      heroBadgeText: partnerConfig.heroBadgeText || 'Starke Partnerschaften',
      heroTitle: partnerConfig.heroTitle || 'Unsere Partner für deinen Erfolg',
      heroDescription: partnerConfig.heroDescription || 'Profitiere von exklusiven Vorteilen unserer Partner.',
      heroFeature1Text: partnerConfig.heroFeature1Text || 'Verifizierte Partner',
      heroFeature2Text: partnerConfig.heroFeature2Text || 'Exklusive Vorteile',
      heroFeature3Text: partnerConfig.heroFeature3Text || 'Nur für Mitglieder',
      cardCtaText: partnerConfig.cardCtaText || 'Exklusive Vorteile für NICNOA&CO.online Mitglieder',
      cardCtaLink: partnerConfig.cardCtaLink || '/registrieren',
      cardCtaButtonText: partnerConfig.cardCtaButtonText || 'Jetzt Mitglied werden',
      ctaTitle: partnerConfig.ctaTitle || 'Werde Teil unserer Community',
      ctaDescription: partnerConfig.ctaDescription || 'Registriere dich jetzt und profitiere von allen Vorteilen.',
      ctaButton1Text: partnerConfig.ctaButton1Text || 'Jetzt registrieren',
      ctaButton1Link: partnerConfig.ctaButton1Link || '/registrieren',
      ctaButton2Text: partnerConfig.ctaButton2Text || 'Preise ansehen',
      ctaButton2Link: partnerConfig.ctaButton2Link || '/preise',
    })
  } catch (error) {
    console.error('Error fetching partner page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Partner-Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Speichere Partner-Seiten-Konfiguration
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()

    // Hole oder erstelle PlatformSettings
    let settings = await prisma.platformSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          platformName: 'NICNOA&CO.online',
          partnerPageConfig: body,
        },
      })
    } else {
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: {
          partnerPageConfig: body,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving partner page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Partner-Konfiguration' },
      { status: 500 }
    )
  }
}
