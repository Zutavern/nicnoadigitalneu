import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isValidLocale, type Locale } from '@/lib/translation/i18n-config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Übersetzbare Felder
const TRANSLATABLE_FIELDS = [
  'heroBadgeText', 'heroTitle', 'heroTitleHighlight', 'heroDescription',
  'ctaPrimaryText', 'ctaSecondaryText',
  'trustIndicator1', 'trustIndicator2', 'trustIndicator3',
  'dashboardTitle', 'dashboardSubtitle',
  'featuresSectionTitle', 'featuresSectionDescription',
  'bottomCtaTitle', 'bottomCtaDescription', 'bottomCtaButtonText',
]

// GET - Produkt-Seiten-Konfiguration abrufen (Public, mit Übersetzungen)
export async function GET() {
  try {
    // Locale ermitteln
    let locale: Locale = DEFAULT_LOCALE
    try {
      const cookieStore = await cookies()
      const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)
      if (localeCookie?.value && isValidLocale(localeCookie.value)) {
        locale = localeCookie.value as Locale
      }
    } catch { /* ignore */ }

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

    // Übersetzungen laden und anwenden
    if (locale !== DEFAULT_LOCALE && config) {
      const translations = await prisma.translation.findMany({
        where: {
          contentType: 'product_page_config',
          contentId: config.id,
          languageId: locale,
          status: 'TRANSLATED',
          field: { in: TRANSLATABLE_FIELDS },
        },
        select: { field: true, value: true },
      })

      for (const t of translations) {
        if (t.field in config) {
          (config as Record<string, unknown>)[t.field] = t.value
        }
      }
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

