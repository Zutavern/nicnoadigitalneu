import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/press-page-config - Seiten-Konfiguration abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    let config = await prisma.pressPageConfig.findFirst()

    if (!config) {
      // Erstelle Standardkonfiguration
      config = await prisma.pressPageConfig.create({
        data: {
          id: 'default',
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
        },
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

// PUT /api/admin/press-page-config - Seiten-Konfiguration aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()

    const {
      heroBadgeText,
      heroTitle,
      heroDescription,
      showStats,
      stat1Label,
      stat1Value,
      stat2Label,
      stat2Value,
      stat3Label,
      stat3Value,
      showPressKit,
      pressKitTitle,
      pressKitDescription,
      pressKitDownloadUrl,
      contactTitle,
      contactDescription,
      contactEmail,
      contactPhone,
      contactPerson,
      metaTitle,
      metaDescription,
    } = body

    if (!heroTitle) {
      return NextResponse.json(
        { error: 'Hero-Titel ist erforderlich' },
        { status: 400 }
      )
    }

    const config = await prisma.pressPageConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        heroBadgeText,
        heroTitle,
        heroDescription,
        showStats: showStats ?? true,
        stat1Label,
        stat1Value,
        stat2Label,
        stat2Value,
        stat3Label,
        stat3Value,
        showPressKit: showPressKit ?? true,
        pressKitTitle,
        pressKitDescription,
        pressKitDownloadUrl,
        contactTitle,
        contactDescription,
        contactEmail,
        contactPhone,
        contactPerson,
        metaTitle,
        metaDescription,
      },
      update: {
        heroBadgeText,
        heroTitle,
        heroDescription,
        showStats: showStats ?? true,
        stat1Label,
        stat1Value,
        stat2Label,
        stat2Value,
        stat3Label,
        stat3Value,
        showPressKit: showPressKit ?? true,
        pressKitTitle,
        pressKitDescription,
        pressKitDownloadUrl,
        contactTitle,
        contactDescription,
        contactEmail,
        contactPhone,
        contactPerson,
        metaTitle,
        metaDescription,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating press page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Konfiguration' },
      { status: 500 }
    )
  }
}
