import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Produkt-Seiten-Konfiguration abrufen (Public)
export async function GET() {
  try {
    let config = await prisma.productPageConfig.findUnique({
      where: { id: 'default' },
    })

    // Wenn keine Konfiguration existiert, erstelle eine mit Standardwerten
    if (!config) {
      config = await prisma.productPageConfig.create({
        data: {
          id: 'default',
          heroType: 'animated',
          heroLayout: 'split',
          heroBadgeText: 'Die All-in-One Plattform',
          heroBadgeIcon: 'sparkles',
          heroTitle: 'Alles was Ihr Salon-Space braucht',
          heroTitleHighlight: 'Salon-Space',
          heroDescription: 'Eine Plattform für Terminbuchung, Stuhlvermietung, Kundenverwaltung und Analytics. Entwickelt von Salon-Experten für Salon-Experten.',
          ctaPrimaryText: 'Kostenlos starten',
          ctaPrimaryLink: '/registrieren',
          ctaPrimaryIcon: 'arrow-right',
          ctaSecondaryText: 'Preise ansehen',
          ctaSecondaryLink: '/preise',
          showSecondaryCta: true,
          showTrustIndicators: true,
          trustIndicator1: '14 Tage kostenlos testen',
          trustIndicator2: 'Keine Kreditkarte erforderlich',
          trustIndicator3: 'DSGVO-konform',
          animationEnabled: true,
          particlesEnabled: true,
          showDashboardPreview: true,
          useDesignSystemColors: true,
          gradientColors: 'primary,secondary,accent',
          dashboardTitle: 'NICNOA Dashboard',
          dashboardSubtitle: 'Produkt Overview',
          showScrollIndicator: true,
          scrollTargetId: 'features',
          featuresSectionTitle: 'Unsere Features',
          featuresSectionDescription: 'Entdecken Sie alle Funktionen, die NICNOA zu Ihrer idealen Lösung machen.',
          showFeatureCategories: true,
          // Glow Effect Settings
          glowEffectEnabled: true,
          glowEffectSpread: 40,
          glowEffectProximity: 64,
          glowEffectBorderWidth: 3,
          glowUseDesignSystem: true,
          glowUseGradient: true,
          bottomCtaTitle: 'Bereit für die Zukunft Ihres Salons?',
          bottomCtaDescription: 'Starten Sie noch heute und erleben Sie, wie NICNOA Ihren Arbeitsalltag revolutioniert.',
          bottomCtaButtonText: 'Jetzt kostenlos testen',
          bottomCtaButtonLink: '/registrieren',
        },
      })
    }

    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error fetching product page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

