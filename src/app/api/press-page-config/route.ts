import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/press-page-config - Öffentliche Seiten-Konfiguration abrufen
export async function GET() {
  try {
    const config = await prisma.pressPageConfig.findFirst()

    if (!config) {
      // Standardwerte zurückgeben
      return NextResponse.json({
        heroBadgeText: 'Presse & Medien',
        heroTitle: 'NICNOA in den Medien',
        heroDescription: 'Aktuelle Berichte, Interviews und Pressemitteilungen über NICNOA und die Zukunft der Friseurbranche.',
        showStats: true,
        stat1Label: 'Presse-Artikel',
        stat1Value: '50+',
        stat2Label: 'Medienreichweite',
        stat2Value: '10M+',
        stat3Label: 'Auszeichnungen',
        stat3Value: '5',
        showPressKit: true,
        pressKitTitle: 'Presse-Kit',
        pressKitDescription: 'Laden Sie unser Presse-Kit mit Logos, Bildern und Unternehmensinformationen herunter.',
        pressKitDownloadUrl: '',
        contactTitle: 'Presse-Kontakt',
        contactDescription: 'Für Medienanfragen und Interviews stehen wir Ihnen gerne zur Verfügung.',
        contactEmail: 'presse@nicnoa.de',
        contactPhone: '',
        contactPerson: '',
        metaTitle: 'Presse & Medien | NICNOA',
        metaDescription: 'Aktuelle Berichte und Pressemitteilungen über NICNOA - die innovative Plattform für Friseure und Salons.',
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching press page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}
