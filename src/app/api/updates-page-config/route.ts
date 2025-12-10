import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public: Updates Page Konfiguration mit Changelog-Einträgen laden
export async function GET() {
  try {
    const [config, entries] = await Promise.all([
      prisma.updatesPageConfig.findUnique({
        where: { id: 'default' },
      }),
      prisma.changelogEntry.findMany({
        where: { isActive: true },
        orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }],
      }),
    ])

    if (!config) {
      return NextResponse.json({
        ...getDefaultConfig(),
        entries: entries.length > 0 ? entries : getDefaultEntries(),
      })
    }

    return NextResponse.json({
      ...config,
      entries: entries.length > 0 ? entries : getDefaultEntries(),
    })
  } catch (error) {
    console.error('Error fetching updates page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Seiten-Konfiguration' },
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
  }
}

function getDefaultEntries() {
  return [
    {
      id: '1',
      date: new Date('2025-03-01'),
      category: 'Neu',
      icon: 'sparkles',
      title: 'Dark Mode & Performance',
      description: 'Elegantes dunkles Design für bessere Übersicht und optimierte Ladezeiten für schnellere Navigation.',
      isHighlight: true,
    },
    {
      id: '2',
      date: new Date('2025-02-15'),
      category: 'Sicherheit',
      icon: 'shield',
      title: 'Erweiterte Datensicherheit',
      description: 'Implementierung modernster Verschlüsselungstechnologien und verbesserter Zugriffskontrollen.',
      isHighlight: false,
    },
    {
      id: '3',
      date: new Date('2025-02-01'),
      category: 'Feature',
      icon: 'zap',
      title: 'Intelligente Terminplanung',
      description: 'Neue Algorithmen für optimale Auslastung und automatische Terminerinnerungen.',
      isHighlight: false,
    },
  ]
}
