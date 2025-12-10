import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

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

// Cached function to get homepage config
const getHomepageConfig = unstable_cache(
  async () => {
    try {
      const config = await prisma.homePageConfig.findFirst()
      return config || defaultConfig
    } catch {
      return defaultConfig
    }
  },
  ['homepage-config'],
  { revalidate: 60 } // Cache for 60 seconds
)

// GET - Hole Homepage-Konfiguration (öffentlich, gecached)
export async function GET() {
  try {
    const config = await getHomepageConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching homepage config:', error)
    return NextResponse.json(defaultConfig)
  }
}




