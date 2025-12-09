import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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

