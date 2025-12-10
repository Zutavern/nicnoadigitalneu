import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive } from '@/lib/mock-data'

// Default Homepage Config für Demo-Modus und Initialisierung
const defaultConfig = {
  id: 'default',
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
  metaTitle: 'NICNOA&CO.online - Die All-in-One Salon-Coworking Lösung',
  metaDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces. Maximieren Sie Ihre Auslastung und minimieren Sie den Verwaltungsaufwand.',
  ogImageUrl: null,
  showTestimonials: true,
  showPartners: true,
  showPricing: true,
  showFaq: true,
  showCta: true,
}

// GET - Hole Homepage-Konfiguration
export async function GET() {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      return NextResponse.json(defaultConfig)
    }

    // Versuche bestehende Config zu laden
    let config = await prisma.homePageConfig.findFirst()
    
    // Wenn keine Config existiert, erstelle Default
    if (!config) {
      config = await prisma.homePageConfig.create({
        data: {
          heroType: defaultConfig.heroType,
          heroLayout: defaultConfig.heroLayout,
          heroBadgeText: defaultConfig.heroBadgeText,
          heroBadgeIcon: defaultConfig.heroBadgeIcon,
          heroTitleLine1: defaultConfig.heroTitleLine1,
          heroTitleLine2: defaultConfig.heroTitleLine2,
          heroTitleHighlight: defaultConfig.heroTitleHighlight,
          heroDescription: defaultConfig.heroDescription,
          ctaPrimaryText: defaultConfig.ctaPrimaryText,
          ctaPrimaryLink: defaultConfig.ctaPrimaryLink,
          ctaPrimaryIcon: defaultConfig.ctaPrimaryIcon,
          ctaSecondaryText: defaultConfig.ctaSecondaryText,
          ctaSecondaryLink: defaultConfig.ctaSecondaryLink,
          showSecondaryCta: defaultConfig.showSecondaryCta,
          showTrustIndicators: defaultConfig.showTrustIndicators,
          trustIndicator1: defaultConfig.trustIndicator1,
          trustIndicator2: defaultConfig.trustIndicator2,
          trustIndicator3: defaultConfig.trustIndicator3,
          showDashboardPreview: defaultConfig.showDashboardPreview,
          dashboardTitle: defaultConfig.dashboardTitle,
          dashboardSubtitle: defaultConfig.dashboardSubtitle,
          animationEnabled: defaultConfig.animationEnabled,
          particlesEnabled: defaultConfig.particlesEnabled,
          gradientColors: defaultConfig.gradientColors,
          showScrollIndicator: defaultConfig.showScrollIndicator,
          scrollTargetId: defaultConfig.scrollTargetId,
          metaTitle: defaultConfig.metaTitle,
          metaDescription: defaultConfig.metaDescription,
          showTestimonials: defaultConfig.showTestimonials,
          showPartners: defaultConfig.showPartners,
          showPricing: defaultConfig.showPricing,
          showFaq: defaultConfig.showFaq,
          showCta: defaultConfig.showCta,
        }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching homepage config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Homepage-Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Update Homepage-Konfiguration
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
    
    // Finde existierende Config
    const existing = await prisma.homePageConfig.findFirst()
    
    // Update oder Create
    const config = existing
      ? await prisma.homePageConfig.update({
          where: { id: existing.id },
          data: {
            heroType: body.heroType,
            heroLayout: body.heroLayout,
            heroImageUrl: body.heroImageUrl,
            heroImageAlt: body.heroImageAlt,
            heroImageOverlay: body.heroImageOverlay,
            heroImagePosition: body.heroImagePosition,
            heroVideoUrl: body.heroVideoUrl,
            heroVideoPoster: body.heroVideoPoster,
            heroBadgeText: body.heroBadgeText,
            heroBadgeIcon: body.heroBadgeIcon,
            heroTitleLine1: body.heroTitleLine1,
            heroTitleLine2: body.heroTitleLine2,
            heroTitleHighlight: body.heroTitleHighlight,
            heroDescription: body.heroDescription,
            ctaPrimaryText: body.ctaPrimaryText,
            ctaPrimaryLink: body.ctaPrimaryLink,
            ctaPrimaryIcon: body.ctaPrimaryIcon,
            ctaSecondaryText: body.ctaSecondaryText,
            ctaSecondaryLink: body.ctaSecondaryLink,
            showSecondaryCta: body.showSecondaryCta,
            showTrustIndicators: body.showTrustIndicators,
            trustIndicator1: body.trustIndicator1,
            trustIndicator2: body.trustIndicator2,
            trustIndicator3: body.trustIndicator3,
            showDashboardPreview: body.showDashboardPreview,
            dashboardTitle: body.dashboardTitle,
            dashboardSubtitle: body.dashboardSubtitle,
            animationEnabled: body.animationEnabled,
            particlesEnabled: body.particlesEnabled,
            gradientColors: body.gradientColors,
            showScrollIndicator: body.showScrollIndicator,
            scrollTargetId: body.scrollTargetId,
            metaTitle: body.metaTitle,
            metaDescription: body.metaDescription,
            ogImageUrl: body.ogImageUrl,
            showTestimonials: body.showTestimonials,
            showPartners: body.showPartners,
            showPricing: body.showPricing,
            showFaq: body.showFaq,
            showCta: body.showCta,
          }
        })
      : await prisma.homePageConfig.create({
          data: body
        })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating homepage config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Homepage-Konfiguration' },
      { status: 500 }
    )
  }
}

