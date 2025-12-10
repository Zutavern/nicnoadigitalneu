import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/roadmap-config - Öffentliche Roadmap-Konfiguration
export async function GET() {
  try {
    const config = await prisma.roadmapPageConfig.findUnique({
      where: { id: 'default' }
    })

    if (!config) {
      // Standardwerte zurückgeben
      return NextResponse.json({
        heroBadgeText: 'Roadmap',
        heroTitle: 'Unsere Vision für die Zukunft des Salon-Managements',
        heroTitleHighlight: 'Zukunft des Salon-Managements',
        heroDescription: 'Gemeinsam mit unseren Kunden entwickeln wir die Zukunft der Salon-Coworking-Branche.',
        showCta: true,
        ctaTitle: 'Gestalten Sie die Zukunft mit',
        ctaDescription: 'Werden Sie Teil unseres Beta-Programms.',
        ctaButtonText: 'Beta-Programm anfragen',
        ctaButtonLink: '/beta-programm',
        showStatusFilter: true,
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
