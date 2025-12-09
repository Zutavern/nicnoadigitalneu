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
      SELECT * FROM faq_page_config ORDER BY created_at DESC LIMIT 1
    ` as any[]
    
    if (config.length === 0) {
      return NextResponse.json({
        heroBadgeText: 'Häufig gestellte Fragen',
        heroTitle: 'Ihre Fragen beantwortet',
        heroDescription: 'Hier finden Sie Antworten auf die wichtigsten Fragen rund um NICNOA&CO.online',
        sectionTitle: 'Frequently Asked Questions',
        sectionDescription: 'Entdecken Sie schnelle und umfassende Antworten auf häufige Fragen zu unserer Plattform, Services und Features.',
        salonTabLabel: 'Für Salon-Space Betreiber',
        stylistTabLabel: 'Für Stuhlmieter',
        contactText: 'Können Sie nicht finden, wonach Sie suchen? Kontaktieren Sie unser',
        contactLinkText: 'Support-Team',
        contactLinkUrl: '/support',
      })
    }

    const c = config[0]
    return NextResponse.json({
      id: c.id,
      heroBadgeText: c.hero_badge_text,
      heroTitle: c.hero_title,
      heroDescription: c.hero_description,
      sectionTitle: c.section_title,
      sectionDescription: c.section_description,
      salonTabLabel: c.salon_tab_label,
      stylistTabLabel: c.stylist_tab_label,
      contactText: c.contact_text,
      contactLinkText: c.contact_link_text,
      contactLinkUrl: c.contact_link_url,
    })
  } catch (error) {
    console.error('Error fetching FAQ page config:', error)
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
      sectionTitle,
      sectionDescription,
      salonTabLabel,
      stylistTabLabel,
      contactText,
      contactLinkText,
      contactLinkUrl,
    } = body

    if (!heroTitle) {
      return NextResponse.json(
        { error: 'Hero-Titel ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Konfiguration existiert
    const existing = await prisma.$queryRaw`
      SELECT id FROM faq_page_config ORDER BY created_at DESC LIMIT 1
    ` as any[]

    if (existing.length > 0) {
      // Update
      await prisma.$queryRaw`
        UPDATE faq_page_config SET
          hero_badge_text = ${heroBadgeText || null},
          hero_title = ${heroTitle},
          hero_description = ${heroDescription || null},
          section_title = ${sectionTitle || null},
          section_description = ${sectionDescription || null},
          salon_tab_label = ${salonTabLabel || 'Für Salon-Space Betreiber'},
          stylist_tab_label = ${stylistTabLabel || 'Für Stuhlmieter'},
          contact_text = ${contactText || null},
          contact_link_text = ${contactLinkText || 'Support-Team'},
          contact_link_url = ${contactLinkUrl || '/support'},
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `
    } else {
      // Create
      await prisma.$queryRaw`
        INSERT INTO faq_page_config (
          hero_badge_text, hero_title, hero_description,
          section_title, section_description,
          salon_tab_label, stylist_tab_label,
          contact_text, contact_link_text, contact_link_url
        ) VALUES (
          ${heroBadgeText || null}, ${heroTitle}, ${heroDescription || null},
          ${sectionTitle || null}, ${sectionDescription || null},
          ${salonTabLabel || 'Für Salon-Space Betreiber'}, ${stylistTabLabel || 'Für Stuhlmieter'},
          ${contactText || null}, ${contactLinkText || 'Support-Team'}, ${contactLinkUrl || '/support'}
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating FAQ page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Konfiguration' },
      { status: 500 }
    )
  }
}

