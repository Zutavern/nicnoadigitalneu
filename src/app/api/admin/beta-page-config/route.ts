import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Konfiguration laden
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const config = await prisma.betaPageConfig.findUnique({
      where: { id: 'default' },
      include: {
        benefits: { orderBy: { sortOrder: 'asc' } },
        requirements: { orderBy: { sortOrder: 'asc' } },
        timelineItems: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!config) {
      return NextResponse.json(getDefaultConfig())
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching beta page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Konfiguration aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()

    const config = await prisma.betaPageConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        heroBadgeText: body.heroBadgeText,
        heroTitle: body.heroTitle || 'Beta-Programm',
        heroTitleHighlight: body.heroTitleHighlight,
        heroDescription: body.heroDescription,
        heroCtaPrimaryText: body.heroCtaPrimaryText,
        heroCtaPrimaryLink: body.heroCtaPrimaryLink,
        heroCtaSecondaryText: body.heroCtaSecondaryText,
        heroCtaSecondaryLink: body.heroCtaSecondaryLink,
        requirementsTitle: body.requirementsTitle,
        requirementsDescription: body.requirementsDescription,
        timelineTitle: body.timelineTitle,
        timelineDescription: body.timelineDescription,
        ctaTitle: body.ctaTitle,
        ctaDescription: body.ctaDescription,
        ctaButtonText: body.ctaButtonText,
        ctaButtonLink: body.ctaButtonLink,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
      },
      update: {
        heroBadgeText: body.heroBadgeText,
        heroTitle: body.heroTitle,
        heroTitleHighlight: body.heroTitleHighlight,
        heroDescription: body.heroDescription,
        heroCtaPrimaryText: body.heroCtaPrimaryText,
        heroCtaPrimaryLink: body.heroCtaPrimaryLink,
        heroCtaSecondaryText: body.heroCtaSecondaryText,
        heroCtaSecondaryLink: body.heroCtaSecondaryLink,
        requirementsTitle: body.requirementsTitle,
        requirementsDescription: body.requirementsDescription,
        timelineTitle: body.timelineTitle,
        timelineDescription: body.timelineDescription,
        ctaTitle: body.ctaTitle,
        ctaDescription: body.ctaDescription,
        ctaButtonText: body.ctaButtonText,
        ctaButtonLink: body.ctaButtonLink,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating beta page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Konfiguration' },
      { status: 500 }
    )
  }
}

function getDefaultConfig() {
  return {
    id: 'default',
    heroBadgeText: 'Start in Q2 2025',
    heroTitle: 'Gestalten Sie die Zukunft des Salon-Managements',
    heroTitleHighlight: 'Salon-Managements',
    heroDescription: 'Werden Sie einer von nur 5 exklusiven Beta-Testern und profitieren Sie von einzigartigen Vorteilen.',
    heroCtaPrimaryText: 'Jetzt bewerben',
    heroCtaPrimaryLink: '#bewerbung',
    heroCtaSecondaryText: 'Mehr erfahren',
    heroCtaSecondaryLink: '#vorteile',
    requirementsTitle: 'Anforderungen',
    requirementsDescription: 'Wir suchen innovative Salon-Betreiber, die mit uns die Zukunft gestalten möchten.',
    timelineTitle: 'Beta-Programm Timeline',
    timelineDescription: 'Ein strukturierter Fahrplan für die Entwicklung unserer Plattform.',
    ctaTitle: 'Bereit für die Zukunft?',
    ctaDescription: 'Sichern Sie sich jetzt einen der exklusiven Beta-Tester Plätze.',
    ctaButtonText: 'Beta-Bewerbung starten',
    ctaButtonLink: '#bewerbung',
    metaTitle: 'Beta-Programm | NICNOA',
    metaDescription: 'Werden Sie Beta-Tester und gestalten Sie die Zukunft des Salon-Managements mit.',
    benefits: [],
    requirements: [],
    timelineItems: [],
  }
}
