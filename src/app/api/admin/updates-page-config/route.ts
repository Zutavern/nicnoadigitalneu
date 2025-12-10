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

    const config = await prisma.updatesPageConfig.findUnique({
      where: { id: 'default' },
    })

    if (!config) {
      return NextResponse.json(getDefaultConfig())
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching updates page config:', error)
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

    const config = await prisma.updatesPageConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        heroBadgeText: body.heroBadgeText,
        heroTitle: body.heroTitle || 'Updates',
        heroTitleHighlight: body.heroTitleHighlight,
        heroDescription: body.heroDescription,
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
    console.error('Error updating updates page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Konfiguration' },
      { status: 500 }
    )
  }
}

function getDefaultConfig() {
  return {
    id: 'default',
    heroBadgeText: 'Neueste Updates',
    heroTitle: 'Stetige Verbesserungen für Ihren Salon-Space',
    heroTitleHighlight: 'Salon-Space',
    heroDescription: 'Entdecken Sie unsere neuesten Entwicklungen und Verbesserungen. Wir arbeiten kontinuierlich daran, Ihre Erfahrung noch besser zu machen.',
    ctaTitle: 'Bleiben Sie auf dem Laufenden',
    ctaDescription: 'Abonnieren Sie unseren Newsletter und erhalten Sie als Erste/r Informationen über neue Features und Verbesserungen.',
    ctaButtonText: 'Newsletter abonnieren',
    ctaButtonLink: '#newsletter',
    metaTitle: 'Updates | NICNOA',
    metaDescription: 'Entdecken Sie die neuesten Updates und Verbesserungen der NICNOA Plattform.',
  }
}
