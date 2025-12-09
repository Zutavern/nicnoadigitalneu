import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const config = await prisma.$queryRaw`
      SELECT * FROM about_us_page_config ORDER BY created_at DESC LIMIT 1
    ` as any[]
    
    if (config.length === 0) {
      return NextResponse.json({
        heroBadgeText: 'Das Team hinter NICNOA&CO.online',
        heroTitle: 'Experten für moderne Salon-Spaces',
        heroDescription: 'Wir sind Daniel und Nico – zwei erfahrene Experten, die mit Leidenschaft die Zukunft des Salon-Managements gestalten. Mit unserer Expertise revolutionieren wir die Art und Weise, wie Salon-Spaces verwaltet werden.',
        team1Name: 'Daniel',
        team1Role: 'Co-Founder',
        team1Description: 'Mit über 20 Jahren Berufserfahrung in Produktentwicklung, Agilität, Daten-Analytics und als Tech- sowie Produkt-Lead hat Daniel bereits zahlreiche branchenübergreifende Projekte erfolgreich geleitet.',
        team1ImageUrl: null,
        team1LinkedInUrl: 'https://linkedin.com',
        team2Name: 'Nico',
        team2Role: 'Co-Founder',
        team2Description: 'Nico ist Industrie-Experte mit 15 Jahren Erfahrung im Wellness- und Beauty-Business und Betreiber von drei sehr erfolgreichen Coworking Spaces.',
        team2ImageUrl: null,
        team2LinkedInUrl: 'https://linkedin.com',
        visionBadgeText: 'Unsere Vision',
        visionTitle: 'Die Zukunft der Salon-Branche gestalten',
        visionDescription: 'Wir glauben an eine Zukunft, in der flexible Salon-Spaces und gemeinsame Ressourcen den Unternehmergeist in der Beauty-Branche beflügeln und nachhaltiges Wachstum fördern.',
        missionBadgeText: 'Unsere Mission',
        missionTitle: 'Innovativ & Effizient',
        missionDescription: 'Unser Antrieb ist es, innovative und effiziente Lösungen zu schaffen, die das Management von Salon-Spaces vereinfachen und die Zusammenarbeit in der Beauty-Branche fördern.',
        approachTitle: 'Unser Ansatz',
        approachDescription: 'Wie wir arbeiten und was uns auszeichnet',
        approach1Title: 'Praxisnah validiert',
        approach1Description: 'Wir haben unsere Konzepte zunächst offline getestet und bewiesen, dass sie in der realen Welt funktionieren – bevor wir sie digital skaliert haben.',
        approach2Title: 'Rechtssicherheit & Automatisierung',
        approach2Description: 'Automatisierte Verträge und integrierte Compliance-Standards schaffen Sicherheit bei allen Mietprozessen.',
        approach3Title: 'Skalierbarkeit & Flexibilität',
        approach3Description: 'Unsere Plattform passt sich an individuelle Anforderungen an, ob Einzelunternehmer, KMU oder Großunternehmen.',
        approach4Title: 'Benutzerfreundlichkeit',
        approach4Description: 'Ein intuitives Design und durchdachte Workflows machen die Verwaltung und Vermietung von Flächen so einfach wie möglich.',
        whyTitle: 'Warum wir tun, was wir tun',
        whyDescription: 'Wir sind fest davon überzeugt, dass moderne Salon-Spaces und intelligente Ressourcennutzung der Schlüssel zum Erfolg in der Beauty-Branche sind. Gemeinsam gestalten wir die Zukunft des Salon-Managements.',
        whyButtonText: 'Jetzt durchstarten',
        whyButtonLink: '/registrieren',
      })
    }

    const c = config[0]
    return NextResponse.json({
      heroBadgeText: c.hero_badge_text,
      heroTitle: c.hero_title,
      heroDescription: c.hero_description,
      team1Name: c.team_1_name,
      team1Role: c.team_1_role,
      team1Description: c.team_1_description,
      team1ImageUrl: c.team_1_image_url,
      team1LinkedInUrl: c.team_1_linkedin_url,
      team2Name: c.team_2_name,
      team2Role: c.team_2_role,
      team2Description: c.team_2_description,
      team2ImageUrl: c.team_2_image_url,
      team2LinkedInUrl: c.team_2_linkedin_url,
      visionBadgeText: c.vision_badge_text,
      visionTitle: c.vision_title,
      visionDescription: c.vision_description,
      missionBadgeText: c.mission_badge_text,
      missionTitle: c.mission_title,
      missionDescription: c.mission_description,
      approachTitle: c.approach_title,
      approachDescription: c.approach_description,
      approach1Title: c.approach_1_title,
      approach1Description: c.approach_1_description,
      approach2Title: c.approach_2_title,
      approach2Description: c.approach_2_description,
      approach3Title: c.approach_3_title,
      approach3Description: c.approach_3_description,
      approach4Title: c.approach_4_title,
      approach4Description: c.approach_4_description,
      whyTitle: c.why_title,
      whyDescription: c.why_description,
      whyButtonText: c.why_button_text,
      whyButtonLink: c.why_button_link,
    })
  } catch (error) {
    console.error('Error fetching About Us page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

