import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Produkt-Seiten-Konfiguration abrufen (Admin)
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
          // Category Showcase
          showCategoryShowcase: true,
          categoryShowcaseTitle: 'Entdecken Sie unsere Funktionen',
          categoryShowcaseSubtitle: 'Jede Kategorie bietet spezialisierte Tools für Ihren Erfolg',
          autoPlayEnabled: true,
          autoPlayInterval: 5000,
          showDots: true,
          showArrows: true,
          bottomCtaTitle: 'Bereit für die Zukunft Ihres Salons?',
          bottomCtaDescription: 'Starten Sie noch heute und erleben Sie, wie NICNOA Ihren Arbeitsalltag revolutioniert.',
          bottomCtaButtonText: 'Jetzt kostenlos testen',
          bottomCtaButtonLink: '/registrieren',
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching product page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Produkt-Seiten-Konfiguration aktualisieren (Admin)
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const data = await request.json()

    const config = await prisma.productPageConfig.upsert({
      where: { id: 'default' },
      update: {
        // Hero Type & Layout
        heroType: data.heroType,
        heroLayout: data.heroLayout,
        
        // Hero Image
        heroImageUrl: data.heroImageUrl,
        heroImageAlt: data.heroImageAlt,
        heroImageOverlay: data.heroImageOverlay,
        heroImagePosition: data.heroImagePosition,
        
        // Hero Video
        heroVideoUrl: data.heroVideoUrl,
        heroVideoPoster: data.heroVideoPoster,
        
        // Hero Code Animation
        heroAnimationCode: data.heroAnimationCode,
        
        // Hero Content
        heroBadgeText: data.heroBadgeText,
        heroBadgeIcon: data.heroBadgeIcon,
        heroTitle: data.heroTitle,
        heroTitleHighlight: data.heroTitleHighlight,
        heroDescription: data.heroDescription,
        
        // CTA Buttons
        ctaPrimaryText: data.ctaPrimaryText,
        ctaPrimaryLink: data.ctaPrimaryLink,
        ctaPrimaryIcon: data.ctaPrimaryIcon,
        ctaSecondaryText: data.ctaSecondaryText,
        ctaSecondaryLink: data.ctaSecondaryLink,
        showSecondaryCta: data.showSecondaryCta,
        
        // Trust Indicators
        showTrustIndicators: data.showTrustIndicators,
        trustIndicator1: data.trustIndicator1,
        trustIndicator2: data.trustIndicator2,
        trustIndicator3: data.trustIndicator3,
        
        // Animation Settings
        animationEnabled: data.animationEnabled,
        particlesEnabled: data.particlesEnabled,
        showDashboardPreview: data.showDashboardPreview,
        
        // Animation Colors
        useDesignSystemColors: data.useDesignSystemColors,
        animationPrimaryColor: data.animationPrimaryColor,
        animationSecondaryColor: data.animationSecondaryColor,
        animationAccentColor: data.animationAccentColor,
        gradientColors: data.gradientColors,
        
        // Dashboard Preview
        dashboardTitle: data.dashboardTitle,
        dashboardSubtitle: data.dashboardSubtitle,
        
        // Scroll Indicator
        showScrollIndicator: data.showScrollIndicator,
        scrollTargetId: data.scrollTargetId,
        
        // Features Section
        featuresSectionTitle: data.featuresSectionTitle,
        featuresSectionDescription: data.featuresSectionDescription,
        showFeatureCategories: data.showFeatureCategories,
        
        // Glow Effect Settings
        glowEffectEnabled: data.glowEffectEnabled,
        glowEffectSpread: data.glowEffectSpread,
        glowEffectProximity: data.glowEffectProximity,
        glowEffectBorderWidth: data.glowEffectBorderWidth,
        glowUseDesignSystem: data.glowUseDesignSystem,
        glowUseGradient: data.glowUseGradient,
        glowCustomPrimary: data.glowCustomPrimary,
        glowCustomSecondary: data.glowCustomSecondary,
        
        // Category Showcase
        showCategoryShowcase: data.showCategoryShowcase,
        categoryShowcaseTitle: data.categoryShowcaseTitle,
        categoryShowcaseSubtitle: data.categoryShowcaseSubtitle,
        autoPlayEnabled: data.autoPlayEnabled,
        autoPlayInterval: data.autoPlayInterval,
        showDots: data.showDots,
        showArrows: data.showArrows,
        
        // Stats Section
        showStats: data.showStats,
        stat1Label: data.stat1Label,
        stat1Value: data.stat1Value,
        stat2Label: data.stat2Label,
        stat2Value: data.stat2Value,
        stat3Label: data.stat3Label,
        stat3Value: data.stat3Value,
        
        // Bottom CTA
        bottomCtaTitle: data.bottomCtaTitle,
        bottomCtaDescription: data.bottomCtaDescription,
        bottomCtaButtonText: data.bottomCtaButtonText,
        bottomCtaButtonLink: data.bottomCtaButtonLink,
        
        // SEO
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        ogImage: data.ogImage,
      },
      create: {
        id: 'default',
        ...data,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating product page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Konfiguration' },
      { status: 500 }
    )
  }
}

