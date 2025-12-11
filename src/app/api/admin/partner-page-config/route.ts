import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Hole Partner-Seiten-Konfiguration
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Hole aus PartnerPageConfig Model
    const config = await prisma.partnerPageConfig.findFirst()

    const defaultConfig = {
      heroBadgeText: 'Starke Partnerschaften',
      heroTitle: 'Unsere Partner für deinen Erfolg',
      heroDescription: 'Profitiere von exklusiven Vorteilen unserer Partner.',
      heroFeature1Text: 'Verifizierte Partner',
      heroFeature2Text: 'Exklusive Vorteile',
      heroFeature3Text: 'Nur für Mitglieder',
      cardCtaText: 'Exklusive Vorteile für NICNOA&CO.online Mitglieder',
      cardCtaLink: '/registrieren',
      cardCtaButtonText: 'Jetzt Mitglied werden',
      ctaTitle: 'Werde Teil unserer Community',
      ctaDescription: 'Registriere dich jetzt und profitiere von allen Vorteilen.',
      ctaButton1Text: 'Jetzt registrieren',
      ctaButton1Link: '/registrieren',
      ctaButton2Text: 'Preise ansehen',
      ctaButton2Link: '/preise',
      // Glow Effect Defaults
      glowEffectEnabled: true,
      glowEffectSpread: 40,
      glowEffectProximity: 64,
      glowEffectBorderWidth: 3,
      glowUseDesignSystem: true,
      glowUseGradient: true,
      glowCustomPrimary: null,
      glowCustomSecondary: null,
      // SEO
      metaTitle: null,
      metaDescription: null,
    }

    if (config) {
      return NextResponse.json({
        id: config.id,
        heroBadgeText: config.heroBadgeText || defaultConfig.heroBadgeText,
        heroTitle: config.heroTitle || defaultConfig.heroTitle,
        heroDescription: config.heroDescription || defaultConfig.heroDescription,
        heroFeature1Text: config.heroFeature1Text || defaultConfig.heroFeature1Text,
        heroFeature2Text: config.heroFeature2Text || defaultConfig.heroFeature2Text,
        heroFeature3Text: config.heroFeature3Text || defaultConfig.heroFeature3Text,
        cardCtaText: config.cardCtaText || defaultConfig.cardCtaText,
        cardCtaLink: config.cardCtaLink || defaultConfig.cardCtaLink,
        cardCtaButtonText: config.cardCtaButtonText || defaultConfig.cardCtaButtonText,
        ctaTitle: config.ctaTitle || defaultConfig.ctaTitle,
        ctaDescription: config.ctaDescription || defaultConfig.ctaDescription,
        ctaButton1Text: config.ctaButton1Text || defaultConfig.ctaButton1Text,
        ctaButton1Link: config.ctaButton1Link || defaultConfig.ctaButton1Link,
        ctaButton2Text: config.ctaButton2Text || defaultConfig.ctaButton2Text,
        ctaButton2Link: config.ctaButton2Link || defaultConfig.ctaButton2Link,
        // Glow Effect
        glowEffectEnabled: config.glowEffectEnabled ?? defaultConfig.glowEffectEnabled,
        glowEffectSpread: config.glowEffectSpread ?? defaultConfig.glowEffectSpread,
        glowEffectProximity: config.glowEffectProximity ?? defaultConfig.glowEffectProximity,
        glowEffectBorderWidth: config.glowEffectBorderWidth ?? defaultConfig.glowEffectBorderWidth,
        glowUseDesignSystem: config.glowUseDesignSystem ?? defaultConfig.glowUseDesignSystem,
        glowUseGradient: config.glowUseGradient ?? defaultConfig.glowUseGradient,
        glowCustomPrimary: config.glowCustomPrimary,
        glowCustomSecondary: config.glowCustomSecondary,
        // SEO
        metaTitle: config.metaTitle,
        metaDescription: config.metaDescription,
      })
    }

    return NextResponse.json(defaultConfig)
  } catch (error) {
    console.error('Error fetching partner page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Partner-Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Speichere Partner-Seiten-Konfiguration
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()

    // Prüfen ob bereits ein Config existiert
    const existingConfig = await prisma.partnerPageConfig.findFirst()

    if (existingConfig) {
      // Update existing config
      const config = await prisma.partnerPageConfig.update({
        where: { id: existingConfig.id },
        data: {
          heroBadgeText: body.heroBadgeText,
          heroTitle: body.heroTitle,
          heroDescription: body.heroDescription,
          heroFeature1Text: body.heroFeature1Text,
          heroFeature2Text: body.heroFeature2Text,
          heroFeature3Text: body.heroFeature3Text,
          cardCtaText: body.cardCtaText,
          cardCtaLink: body.cardCtaLink,
          cardCtaButtonText: body.cardCtaButtonText,
          ctaTitle: body.ctaTitle,
          ctaDescription: body.ctaDescription,
          ctaButton1Text: body.ctaButton1Text,
          ctaButton1Link: body.ctaButton1Link,
          ctaButton2Text: body.ctaButton2Text,
          ctaButton2Link: body.ctaButton2Link,
          // Glow Effect
          glowEffectEnabled: body.glowEffectEnabled,
          glowEffectSpread: body.glowEffectSpread,
          glowEffectProximity: body.glowEffectProximity,
          glowEffectBorderWidth: body.glowEffectBorderWidth,
          glowUseDesignSystem: body.glowUseDesignSystem,
          glowUseGradient: body.glowUseGradient,
          glowCustomPrimary: body.glowCustomPrimary,
          glowCustomSecondary: body.glowCustomSecondary,
          // SEO
          metaTitle: body.metaTitle,
          metaDescription: body.metaDescription,
        },
      })
      return NextResponse.json(config)
    } else {
      // Create new config
      const config = await prisma.partnerPageConfig.create({
        data: {
          heroTitle: body.heroTitle || 'Unsere Partner für deinen Erfolg',
          heroBadgeText: body.heroBadgeText,
          heroDescription: body.heroDescription,
          heroFeature1Text: body.heroFeature1Text,
          heroFeature2Text: body.heroFeature2Text,
          heroFeature3Text: body.heroFeature3Text,
          cardCtaText: body.cardCtaText,
          cardCtaLink: body.cardCtaLink,
          cardCtaButtonText: body.cardCtaButtonText,
          ctaTitle: body.ctaTitle,
          ctaDescription: body.ctaDescription,
          ctaButton1Text: body.ctaButton1Text,
          ctaButton1Link: body.ctaButton1Link,
          ctaButton2Text: body.ctaButton2Text,
          ctaButton2Link: body.ctaButton2Link,
          // Glow Effect
          glowEffectEnabled: body.glowEffectEnabled ?? true,
          glowEffectSpread: body.glowEffectSpread ?? 40,
          glowEffectProximity: body.glowEffectProximity ?? 64,
          glowEffectBorderWidth: body.glowEffectBorderWidth ?? 3,
          glowUseDesignSystem: body.glowUseDesignSystem ?? true,
          glowUseGradient: body.glowUseGradient ?? true,
          glowCustomPrimary: body.glowCustomPrimary,
          glowCustomSecondary: body.glowCustomSecondary,
          // SEO
          metaTitle: body.metaTitle,
          metaDescription: body.metaDescription,
        },
      })
      return NextResponse.json(config)
    }
  } catch (error) {
    console.error('Error saving partner page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Partner-Konfiguration' },
      { status: 500 }
    )
  }
}
