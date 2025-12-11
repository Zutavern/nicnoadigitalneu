import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    // CMS-Inhalte werden IMMER aus der echten Datenbank geladen
    // Der Demo-Modus beeinflusst nur operative Daten (User, Buchungen, etc.)
    const config = await prisma.homePageConfig.findFirst()
    return NextResponse.json(config || defaultConfig)
  } catch (error) {
    console.error('Error fetching homepage config:', error)
    return NextResponse.json(defaultConfig)
  }
}




