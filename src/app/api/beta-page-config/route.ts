import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public: Beta Page Konfiguration laden
export async function GET() {
  try {
    const config = await prisma.betaPageConfig.findUnique({
      where: { id: 'default' },
      include: {
        benefits: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        requirements: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        timelineItems: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!config) {
      return NextResponse.json(getDefaultConfig())
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching beta page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Seiten-Konfiguration' },
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
    heroDescription: 'Werden Sie einer von nur 5 exklusiven Beta-Testern und profitieren Sie von einzigartigen Vorteilen. Gemeinsam entwickeln wir die perfekte Lösung für moderne Salon-Spaces.',
    heroCtaPrimaryText: 'Jetzt bewerben',
    heroCtaPrimaryLink: '#bewerbung',
    heroCtaSecondaryText: 'Mehr erfahren',
    heroCtaSecondaryLink: '#vorteile',
    requirementsTitle: 'Anforderungen',
    requirementsDescription: 'Wir suchen innovative Salon-Betreiber, die mit uns die Zukunft gestalten möchten.',
    timelineTitle: 'Beta-Programm Timeline',
    timelineDescription: 'Ein strukturierter Fahrplan für die Entwicklung unserer Plattform.',
    ctaTitle: 'Bereit für die Zukunft?',
    ctaDescription: 'Sichern Sie sich jetzt einen der exklusiven Beta-Tester Plätze und profitieren Sie von einzigartigen Vorteilen.',
    ctaButtonText: 'Beta-Bewerbung starten',
    ctaButtonLink: '#bewerbung',
    benefits: [
      { id: '1', icon: 'rocket', title: 'Early Access', description: 'Exklusiver Zugriff auf alle Features vor dem offiziellen Launch.' },
      { id: '2', icon: 'users', title: 'Direkter Einfluss', description: 'Gestalten Sie aktiv die Zukunft der Plattform mit Ihrem Feedback.' },
      { id: '3', icon: 'message-square', title: 'Premium Support', description: 'Direkter Draht zu unserem Entwicklungsteam für schnelle Hilfe.' },
      { id: '4', icon: 'gift', title: 'Lifetime Rabatt', description: '50% Rabatt auf alle Preispläne - garantiert für die gesamte Nutzungsdauer.' },
    ],
    requirements: [
      { id: '1', text: 'Aktiver Salon-Space mit mindestens 3 Arbeitsplätzen' },
      { id: '2', text: 'Bereitschaft zur aktiven Teilnahme am Feedback-Prozess' },
      { id: '3', text: 'Mindestens 2 Jahre Erfahrung im Salon-Management' },
      { id: '4', text: 'Offenheit für digitale Innovationen' },
    ],
    timelineItems: [
      { id: '1', date: 'Q2 2025', title: 'Start der Beta', description: 'Onboarding der ersten 5 Beta-Tester und initiale Systemeinrichtung.' },
      { id: '2', date: 'Q3 2025', title: 'Feedback & Optimierung', description: 'Intensive Feedback-Runden und kontinuierliche Verbesserungen.' },
      { id: '3', date: 'Q4 2025', title: 'Feature-Erweiterung', description: 'Integration neuer Features basierend auf Beta-Feedback.' },
      { id: '4', date: 'Q1 2026', title: 'Finalisierung', description: 'Letzte Optimierungen vor dem offiziellen Launch.' },
    ],
  }
}
