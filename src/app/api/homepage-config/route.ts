import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isValidLocale, type Locale } from '@/lib/translation/i18n-config'

// Übersetzbaren Felder der Homepage-Konfiguration
const TRANSLATABLE_FIELDS = [
  'heroBadgeText',
  'heroTitleLine1',
  'heroTitleLine2',
  'heroTitleHighlight',
  'heroDescription',
  'ctaPrimaryText',
  'ctaSecondaryText',
  'trustIndicator1',
  'trustIndicator2',
  'trustIndicator3',
  'dashboardTitle',
  'dashboardSubtitle',
]

// Default Homepage Config
const defaultConfig = {
  heroType: 'animated',
  heroLayout: 'split',
  heroImageUrl: null,
  heroImageAlt: null,
  heroImageOverlay: 40,
  heroImagePosition: 'center',
  heroVideoUrl: null,
  heroVideoPoster: null,
  heroBadgeText: 'Jetzt im Beta-Programm verfügbar',
  heroBadgeIcon: 'sparkles',
  heroTitleLine1: 'Revolutionieren',
  heroTitleLine2: 'Sie Ihren',
  heroTitleHighlight: 'Salon-Space',
  heroDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces. Maximieren Sie Ihre Auslastung, minimieren Sie den Verwaltungsaufwand und schaffen Sie ein professionelles Arbeitsumfeld für selbstständige Stylisten.',
  ctaPrimaryText: 'Jetzt kostenlos starten',
  ctaPrimaryLink: '/registrieren',
  ctaPrimaryIcon: 'arrow-right',
  ctaSecondaryText: 'Produkt entdecken',
  ctaSecondaryLink: '/produkt',
  showSecondaryCta: true,
  showTrustIndicators: true,
  trustIndicator1: '14 Tage kostenlos testen',
  trustIndicator2: 'Keine Kreditkarte erforderlich',
  trustIndicator3: 'DSGVO-konform',
  showDashboardPreview: true,
  dashboardTitle: 'NICNOA Dashboard',
  dashboardSubtitle: 'Salon Overview',
  animationEnabled: true,
  particlesEnabled: true,
  gradientColors: 'purple,pink,blue',
  showScrollIndicator: true,
  scrollTargetId: 'testimonials',
  metaTitle: null,
  metaDescription: null,
  ogImageUrl: null,
  showTestimonials: true,
  showPartners: true,
  showPricing: true,
  showFaq: true,
  showCta: true,
}

// Kein Cache! CMS-Inhalte werden immer frisch aus der DB geladen
// Demo-Modus gilt NICHT für CMS-Inhalte (Homepage, FAQs, Blog, etc.)
export const dynamic = 'force-dynamic'

// GET - Hole Homepage-Konfiguration (öffentlich, kein Cache)
export async function GET() {
  try {
    // Locale aus Cookie ermitteln
    let locale: Locale = DEFAULT_LOCALE
    try {
      const cookieStore = await cookies()
      const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)
      if (localeCookie?.value && isValidLocale(localeCookie.value)) {
        locale = localeCookie.value as Locale
      }
    } catch {
      // Cookies nicht verfügbar
    }

    // CMS-Inhalte werden IMMER aus der echten Datenbank geladen
    const config = await prisma.homePageConfig.findFirst()
    const result = config || defaultConfig

    // Übersetzungen laden und anwenden wenn nicht Deutsch
    if (locale !== DEFAULT_LOCALE && config?.id) {
      const translations = await prisma.translation.findMany({
        where: {
          contentType: 'homepage_config',
          contentId: config.id,
          languageId: locale,
          status: 'TRANSLATED',
          field: { in: TRANSLATABLE_FIELDS },
        },
        select: {
          field: true,
          value: true,
        },
      })

      // Übersetzungen auf Config anwenden
      for (const t of translations) {
        if (t.field in result) {
          (result as Record<string, unknown>)[t.field] = t.value
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching homepage config:', error)
    return NextResponse.json(defaultConfig)
  }
}




