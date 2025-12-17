import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public Press Page Config laden (für öffentliche Presse-Seite)
export async function GET() {
  try {
    // Config laden oder Default-Werte zurückgeben
    const config = await prisma.pressPageConfig.findUnique({
      where: { id: 'default' }
    })

    // Fallback auf Default-Werte wenn nicht vorhanden
    const defaultConfig = {
      heroBadgeText: 'Presse & Medien',
      heroTitle: 'NICNOA in den Medien',
      heroDescription: null,
      showStats: true,
      stat1Label: 'Presse-Artikel',
      stat1Value: '50+',
      stat2Label: 'Medienreichweite',
      stat2Value: '10M+',
      stat3Label: 'Auszeichnungen',
      stat3Value: '5',
      showPressKit: true,
      pressKitTitle: 'Presse-Kit',
      pressKitDescription: null,
      pressKitDownloadUrl: null,
      contactTitle: 'Presse-Kontakt',
      contactDescription: null,
      contactEmail: 'presse@nicnoa.de',
      contactPhone: null,
      contactPerson: null,
      metaTitle: 'Presse & Medien | NICNOA',
      metaDescription: 'Aktuelle Pressemitteilungen, Medienberichte und Presse-Kit von NICNOA.',
      ogImage: null
    }

    return NextResponse.json(config || defaultConfig)
  } catch (error) {
    console.error('Error fetching press page config:', error)
    // Bei Fehler Default-Config zurückgeben
    return NextResponse.json({
      heroBadgeText: 'Presse & Medien',
      heroTitle: 'NICNOA in den Medien',
      heroDescription: null,
      showStats: true,
      stat1Label: 'Presse-Artikel',
      stat1Value: '50+',
      stat2Label: 'Medienreichweite',
      stat2Value: '10M+',
      stat3Label: 'Auszeichnungen',
      stat3Value: '5',
      showPressKit: true,
      pressKitTitle: 'Presse-Kit',
      pressKitDescription: null,
      pressKitDownloadUrl: null,
      contactTitle: 'Presse-Kontakt',
      contactDescription: null,
      contactEmail: 'presse@nicnoa.de',
      contactPhone: null,
      contactPerson: null
    })
  }
}
