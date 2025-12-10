import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Hole Karriere-Seiten-Konfiguration
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Hole aus PlatformSettings
    const settings = await prisma.platformSettings.findFirst()
    
    // Extrahiere Karriere-Konfiguration aus den Settings
    const careerConfig = settings?.careerPageConfig as Record<string, unknown> || {}

    return NextResponse.json({
      heroBadgeText: careerConfig.heroBadgeText || 'Wir suchen dich!',
      heroTitle: careerConfig.heroTitle || 'Karriere bei NICNOA&CO.online',
      heroDescription: careerConfig.heroDescription || 'Werde Teil unseres Teams und gestalte die Zukunft der Friseurbranche mit uns.',
      heroFeature1Text: careerConfig.heroFeature1Text || 'Remote-First',
      heroFeature2Text: careerConfig.heroFeature2Text || 'Startup-Kultur',
      heroFeature3Text: careerConfig.heroFeature3Text || 'Faire Bezahlung',
      noJobsTitle: careerConfig.noJobsTitle || 'Aktuell keine offenen Stellen',
      noJobsDescription: careerConfig.noJobsDescription || 'Aber wir freuen uns über Initiativbewerbungen!',
      ctaTitle: careerConfig.ctaTitle || 'Bereit für deinen nächsten Karriereschritt?',
      ctaDescription: careerConfig.ctaDescription || 'Wir bieten dir ein spannendes Umfeld, in dem du wachsen und dich entwickeln kannst.',
      ctaButtonText: careerConfig.ctaButtonText || 'Initiativbewerbung',
      ctaButtonLink: careerConfig.ctaButtonLink || '/karriere/initiativ',
      initiativeTitle: careerConfig.initiativeTitle || 'Initiativbewerbung',
      initiativeDescription: careerConfig.initiativeDescription || 'Du hast kein passendes Stellenangebot gefunden? Bewirb dich trotzdem bei uns!',
      initiativeButtonText: careerConfig.initiativeButtonText || 'Jetzt initiativ bewerben',
    })
  } catch (error) {
    console.error('Error fetching career page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Karriere-Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Speichere Karriere-Seiten-Konfiguration
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
          careerPageConfig: body,
        },
      })
    } else {
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: {
          careerPageConfig: body,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving career page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Karriere-Konfiguration' },
      { status: 500 }
    )
  }
}


