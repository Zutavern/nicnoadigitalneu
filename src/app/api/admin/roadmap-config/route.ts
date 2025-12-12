import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/roadmap-config - Roadmap-Konfiguration abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    let config = await prisma.roadmapPageConfig.findUnique({
      where: { id: 'default' }
    })

    // Falls keine Konfiguration existiert, Standardwerte zurückgeben
    if (!config) {
      config = await prisma.roadmapPageConfig.create({
        data: {
          id: 'default',
          heroBadgeText: 'Roadmap',
          heroTitle: 'Unsere Vision für die Zukunft des Salon-Managements',
          heroTitleHighlight: 'Zukunft des Salon-Managements',
          heroDescription: 'Gemeinsam mit unseren Kunden entwickeln wir die Zukunft der Salon-Coworking-Branche. Ihre Bedürfnisse und Feedback fließen direkt in unsere Produktentwicklung ein.',
          timelineSectionTitle: 'Geplante Features',
          showCta: true,
          ctaTitle: 'Gestalten Sie die Zukunft mit',
          ctaDescription: 'Werden Sie Teil unseres Beta-Programms und helfen Sie uns, die perfekte Lösung für Ihren Salon-Space zu entwickeln.',
          ctaButtonText: 'Beta-Programm anfragen',
          ctaButtonLink: '/beta-programm',
          showStatusFilter: true,
        }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching roadmap config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/roadmap-config - Roadmap-Konfiguration aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()

    const config = await prisma.roadmapPageConfig.upsert({
      where: { id: 'default' },
      update: {
        heroBadgeText: data.heroBadgeText,
        heroTitle: data.heroTitle,
        heroTitleHighlight: data.heroTitleHighlight,
        heroDescription: data.heroDescription,
        timelineSectionTitle: data.timelineSectionTitle,
        timelineSectionDescription: data.timelineSectionDescription,
        showCta: data.showCta,
        ctaTitle: data.ctaTitle,
        ctaDescription: data.ctaDescription,
        ctaButtonText: data.ctaButtonText,
        ctaButtonLink: data.ctaButtonLink,
        showStatusFilter: data.showStatusFilter,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
      create: {
        id: 'default',
        heroBadgeText: data.heroBadgeText || 'Roadmap',
        heroTitle: data.heroTitle || 'Unsere Vision für die Zukunft des Salon-Managements',
        heroTitleHighlight: data.heroTitleHighlight,
        heroDescription: data.heroDescription,
        timelineSectionTitle: data.timelineSectionTitle,
        timelineSectionDescription: data.timelineSectionDescription,
        showCta: data.showCta ?? true,
        ctaTitle: data.ctaTitle,
        ctaDescription: data.ctaDescription,
        ctaButtonText: data.ctaButtonText,
        ctaButtonLink: data.ctaButtonLink,
        showStatusFilter: data.showStatusFilter ?? true,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating roadmap config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Konfiguration' },
      { status: 500 }
    )
  }
}



