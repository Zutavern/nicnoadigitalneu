import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LegalPageType } from '@prisma/client'

interface RouteParams {
  params: Promise<{ type: string }>
}

// GET - Public: Konfiguration + Sections für eine Legal Page laden
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { type: typeParam } = await params
    const type = typeParam.toUpperCase() as LegalPageType

    if (!['IMPRESSUM', 'DATENSCHUTZ', 'AGB'].includes(type)) {
      return NextResponse.json(
        { error: 'Ungültiger Seitentyp. Erlaubt: impressum, datenschutz, agb' },
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
      // Return defaults wenn noch keine Config existiert
      return NextResponse.json(getDefaultConfig(type))
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching legal page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Seiten-Konfiguration' },
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
      sections: getDefaultSections('IMPRESSUM'),
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
      sections: getDefaultSections('DATENSCHUTZ'),
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
      sections: getDefaultSections('AGB'),
    },
  }

  return defaults[type]
}

function getDefaultSections(type: LegalPageType) {
  if (type === 'IMPRESSUM') {
    return [
      {
        id: 'default-1',
        title: 'Angaben gemäß § 5 TMG',
        content: `NICNOA&CO.online
Musterstraße 123
12345 Berlin
Deutschland

**Kontakt**
Telefon: +49 (0) 123 456789
E-Mail: info@nicnoa.online

**Vertreten durch**
Geschäftsführer: Max Mustermann`,
        sortOrder: 0,
        isActive: true,
        isCollapsible: false,
      },
      {
        id: 'default-2',
        title: 'Registereintrag',
        content: `Eintragung im Handelsregister.
Registergericht: Amtsgericht Berlin
Registernummer: HRB 123456

**Umsatzsteuer-ID**
Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:
DE 123 456 789`,
        sortOrder: 1,
        isActive: true,
        isCollapsible: true,
      },
    ]
  }

  if (type === 'DATENSCHUTZ') {
    return [
      {
        id: 'default-1',
        title: '1. Verantwortlicher',
        content: `NICNOA&CO.online
Musterstraße 123
12345 Berlin
Deutschland
E-Mail: info@nicnoa.online`,
        sortOrder: 0,
        isActive: true,
        isCollapsible: true,
      },
      {
        id: 'default-2',
        title: '2. Erhebung und Verarbeitung von Daten',
        content: `Bei der Nutzung unserer Plattform werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Diese Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen.`,
        sortOrder: 1,
        isActive: true,
        isCollapsible: true,
      },
    ]
  }

  // AGB
  return [
    {
      id: 'default-1',
      title: '§1 Geltungsbereich',
      content: `Diese Allgemeinen Geschäftsbedingungen ("AGB") regeln die Nutzung der nicnoa-Plattform ("Plattform") zwischen der nicnoa GmbH ("Anbieter") und den Nutzern der Plattform ("Nutzer").`,
      sortOrder: 0,
      isActive: true,
      isCollapsible: true,
    },
    {
      id: 'default-2',
      title: '§2 Leistungsbeschreibung',
      content: `Die Plattform ermöglicht die Vermittlung von Salonarbeitsplätzen zwischen Salonbetreibern ("Vermieter") und Beautyprofis ("Mieter"). Der Anbieter stellt hierfür die technische Infrastruktur zur Verfügung.`,
      sortOrder: 1,
      isActive: true,
      isCollapsible: true,
    },
  ]
}
