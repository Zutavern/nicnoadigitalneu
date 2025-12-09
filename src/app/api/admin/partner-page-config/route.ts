import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Konfiguration laden
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

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
        cardCtaText: 'Exklusive Vorteile für NICNOA&CO.online Mitglieder',
        cardCtaLink: '/registrieren',
        cardCtaButtonText: 'Jetzt Mitglied werden',
        ctaTitle: 'Werde Teil unserer Community',
        ctaDescription: 'Als NICNOA&CO.online Mitglied profitierst du von exklusiven Partner-Deals, Rabatten und Sonderangeboten.',
        ctaButton1Text: 'Jetzt registrieren',
        ctaButton1Link: '/registrieren',
        ctaButton2Text: 'Preise ansehen',
        ctaButton2Link: '/preise',
      })
    }

    const c = config[0]
    return NextResponse.json({
      id: c.id,
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

// PUT - Konfiguration aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      heroBadgeText,
      heroTitle,
      heroDescription,
      heroFeature1Text,
      heroFeature2Text,
      heroFeature3Text,
      cardCtaText,
      cardCtaLink,
      cardCtaButtonText,
      ctaTitle,
      ctaDescription,
      ctaButton1Text,
      ctaButton1Link,
      ctaButton2Text,
      ctaButton2Link,
    } = body

    if (!heroTitle) {
      return NextResponse.json(
        { error: 'Hero-Titel ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Konfiguration existiert
    const existing = await prisma.$queryRaw`
      SELECT id FROM partner_page_config ORDER BY created_at DESC LIMIT 1
    ` as any[]

    if (existing.length > 0) {
      // Update
      await prisma.$queryRaw`
        UPDATE partner_page_config SET
          hero_badge_text = ${heroBadgeText || null},
          hero_title = ${heroTitle},
          hero_description = ${heroDescription || null},
          hero_feature_1_text = ${heroFeature1Text || null},
          hero_feature_2_text = ${heroFeature2Text || null},
          hero_feature_3_text = ${heroFeature3Text || null},
          card_cta_text = ${cardCtaText || null},
          card_cta_link = ${cardCtaLink || '/registrieren'},
          card_cta_button_text = ${cardCtaButtonText || 'Jetzt Mitglied werden'},
          cta_title = ${ctaTitle || null},
          cta_description = ${ctaDescription || null},
          cta_button_1_text = ${ctaButton1Text || 'Jetzt registrieren'},
          cta_button_1_link = ${ctaButton1Link || '/registrieren'},
          cta_button_2_text = ${ctaButton2Text || 'Preise ansehen'},
          cta_button_2_link = ${ctaButton2Link || '/preise'},
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `
    } else {
      // Create
      await prisma.$queryRaw`
        INSERT INTO partner_page_config (
          hero_badge_text, hero_title, hero_description,
          hero_feature_1_text, hero_feature_2_text, hero_feature_3_text,
          card_cta_text, card_cta_link, card_cta_button_text,
          cta_title, cta_description,
          cta_button_1_text, cta_button_1_link,
          cta_button_2_text, cta_button_2_link,
          created_at, updated_at
        ) VALUES (
          ${heroBadgeText || null}, ${heroTitle}, ${heroDescription || null},
          ${heroFeature1Text || null}, ${heroFeature2Text || null}, ${heroFeature3Text || null},
          ${cardCtaText || null}, ${cardCtaLink || '/registrieren'}, ${cardCtaButtonText || 'Jetzt Mitglied werden'},
          ${ctaTitle || null}, ${ctaDescription || null},
          ${ctaButton1Text || 'Jetzt registrieren'}, ${ctaButton1Link || '/registrieren'},
          ${ctaButton2Text || 'Preise ansehen'}, ${ctaButton2Link || '/preise'},
          NOW(), NOW()
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating Partner page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Konfiguration' },
      { status: 500 }
    )
  }
}

