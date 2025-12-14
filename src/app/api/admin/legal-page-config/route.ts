import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LegalPageType } from '@prisma/client'

// GET - Konfiguration laden (mit Query-Parameter ?type=IMPRESSUM|DATENSCHUTZ|AGB)
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as LegalPageType | null

    if (!type || !['IMPRESSUM', 'DATENSCHUTZ', 'AGB'].includes(type)) {
      return NextResponse.json(
        { error: 'Ungültiger Seitentyp. Erlaubt: IMPRESSUM, DATENSCHUTZ, AGB' },
        { status: 400 }
      )
    }

    const config = await prisma.legalPageConfig.findUnique({
      where: { pageType: type },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!config) {
      // Return defaults
      return NextResponse.json(getDefaultConfig(type))
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching legal page config:', error)
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
    const {
      pageType,
      heroBadgeText,
      heroTitle,
      heroDescription,
      metaTitle,
      metaDescription,
      contactEmail,
      contactPhone,
      lastUpdated,
    } = body

    if (!pageType || !['IMPRESSUM', 'DATENSCHUTZ', 'AGB'].includes(pageType)) {
      return NextResponse.json(
        { error: 'Ungültiger Seitentyp' },
        { status: 400 }
      )
    }

    if (!heroTitle) {
      return NextResponse.json(
        { error: 'Hero-Titel ist erforderlich' },
        { status: 400 }
      )
    }

    const config = await prisma.legalPageConfig.upsert({
      where: { pageType },
      create: {
        pageType,
        heroBadgeText,
        heroTitle,
        heroDescription,
        metaTitle,
        metaDescription,
        contactEmail,
        contactPhone,
        lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
      },
      update: {
        heroBadgeText,
        heroTitle,
        heroDescription,
        metaTitle,
        metaDescription,
        contactEmail,
        contactPhone,
        lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating legal page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Konfiguration' },
      { status: 500 }
    )
  }
}

function getDefaultConfig(type: LegalPageType) {
  const defaults: Record<LegalPageType, object> = {
    IMPRESSUM: {
      pageType: 'IMPRESSUM',
      heroBadgeText: 'Rechtliches',
      heroTitle: 'Impressum',
      heroDescription: 'Angaben gemäß § 5 TMG',
      metaTitle: 'Impressum | NICNOA',
      metaDescription: 'Impressum und rechtliche Informationen von NICNOA',
      contactEmail: 'info@nicnoa.online',
      contactPhone: '+49 (0) 123 456789',
      sections: [],
    },
    DATENSCHUTZ: {
      pageType: 'DATENSCHUTZ',
      heroBadgeText: 'Rechtliches',
      heroTitle: 'Datenschutzerklärung',
      heroDescription: 'Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen.',
      metaTitle: 'Datenschutz | NICNOA',
      metaDescription: 'Datenschutzerklärung für die Nutzung der NICNOA Plattform',
      contactEmail: 'datenschutz@nicnoa.online',
      contactPhone: '+49 (0) 123 456789',
      sections: [],
    },
    AGB: {
      pageType: 'AGB',
      heroBadgeText: 'Rechtliches',
      heroTitle: 'Allgemeine Geschäftsbedingungen',
      heroDescription: 'Die AGB regeln die Nutzung der NICNOA-Plattform.',
      metaTitle: 'AGB | NICNOA',
      metaDescription: 'Allgemeine Geschäftsbedingungen für die Nutzung der NICNOA Plattform',
      contactEmail: null,
      contactPhone: null,
      sections: [],
    },
  }

  return defaults[type]
}
