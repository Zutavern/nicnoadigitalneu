import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const config = await prisma.$queryRaw`
      SELECT * FROM partner_page_config ORDER BY created_at DESC LIMIT 1
    ` as any[]
    
    if (config.length === 0) {
      return NextResponse.json({
        heroBadgeText: 'Starke Partnerschaften',
        heroTitle: 'Unsere Partner für deinen Erfolg',
        heroDescription: 'Wir arbeiten mit führenden Unternehmen zusammen, um dir die besten Tools, Systeme und Services für deinen Salon-Space zu bieten.',
        heroFeature1Text: 'Verifizierte Partner',
        heroFeature2Text: 'Exklusive Vorteile',
        heroFeature3Text: 'Nur für Mitglieder',
        cardCtaText: 'Exklusive Vorteile für NICNOA Mitglieder',
        cardCtaLink: '/registrieren',
        cardCtaButtonText: 'Jetzt Mitglied werden',
        ctaTitle: 'Werde Teil unserer Community',
        ctaDescription: 'Als NICNOA Mitglied profitierst du von exklusiven Partner-Deals, Rabatten und Sonderangeboten.',
        ctaButton1Text: 'Jetzt registrieren',
        ctaButton1Link: '/registrieren',
        ctaButton2Text: 'Preise ansehen',
        ctaButton2Link: '/preise',
      })
    }

    const c = config[0]
    return NextResponse.json({
      heroBadgeText: c.hero_badge_text,
      heroTitle: c.hero_title,
      heroDescription: c.hero_description,
      heroFeature1Text: c.hero_feature_1_text,
      heroFeature2Text: c.hero_feature_2_text,
      heroFeature3Text: c.hero_feature_3_text,
      cardCtaText: c.card_cta_text,
      cardCtaLink: c.card_cta_link,
      cardCtaButtonText: c.card_cta_button_text,
      ctaTitle: c.cta_title,
      ctaDescription: c.cta_description,
      ctaButton1Text: c.cta_button_1_text,
      ctaButton1Link: c.cta_button_1_link,
      ctaButton2Text: c.cta_button_2_text,
      ctaButton2Link: c.cta_button_2_link,
    })
  } catch (error) {
    console.error('Error fetching Partner page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

