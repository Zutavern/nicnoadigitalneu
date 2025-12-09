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
      id: c.id,
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
      team1Name,
      team1Role,
      team1Description,
      team1ImageUrl,
      team1LinkedInUrl,
      team2Name,
      team2Role,
      team2Description,
      team2ImageUrl,
      team2LinkedInUrl,
      visionBadgeText,
      visionTitle,
      visionDescription,
      missionBadgeText,
      missionTitle,
      missionDescription,
      approachTitle,
      approachDescription,
      approach1Title,
      approach1Description,
      approach2Title,
      approach2Description,
      approach3Title,
      approach3Description,
      approach4Title,
      approach4Description,
      whyTitle,
      whyDescription,
      whyButtonText,
      whyButtonLink,
    } = body

    if (!heroTitle) {
      return NextResponse.json(
        { error: 'Hero-Titel ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Konfiguration existiert
    const existing = await prisma.$queryRaw`
      SELECT id FROM about_us_page_config ORDER BY created_at DESC LIMIT 1
    ` as any[]

    if (existing.length > 0) {
      // Update
      await prisma.$queryRaw`
        UPDATE about_us_page_config SET
          hero_badge_text = ${heroBadgeText || null},
          hero_title = ${heroTitle},
          hero_description = ${heroDescription || null},
          team_1_name = ${team1Name || null},
          team_1_role = ${team1Role || null},
          team_1_description = ${team1Description || null},
          team_1_image_url = ${team1ImageUrl || null},
          team_1_linkedin_url = ${team1LinkedInUrl || null},
          team_2_name = ${team2Name || null},
          team_2_role = ${team2Role || null},
          team_2_description = ${team2Description || null},
          team_2_image_url = ${team2ImageUrl || null},
          team_2_linkedin_url = ${team2LinkedInUrl || null},
          vision_badge_text = ${visionBadgeText || null},
          vision_title = ${visionTitle || null},
          vision_description = ${visionDescription || null},
          mission_badge_text = ${missionBadgeText || null},
          mission_title = ${missionTitle || null},
          mission_description = ${missionDescription || null},
          approach_title = ${approachTitle || null},
          approach_description = ${approachDescription || null},
          approach_1_title = ${approach1Title || null},
          approach_1_description = ${approach1Description || null},
          approach_2_title = ${approach2Title || null},
          approach_2_description = ${approach2Description || null},
          approach_3_title = ${approach3Title || null},
          approach_3_description = ${approach3Description || null},
          approach_4_title = ${approach4Title || null},
          approach_4_description = ${approach4Description || null},
          why_title = ${whyTitle || null},
          why_description = ${whyDescription || null},
          why_button_text = ${whyButtonText || 'Jetzt durchstarten'},
          why_button_link = ${whyButtonLink || '/registrieren'},
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `
    } else {
      // Create
      await prisma.$queryRaw`
        INSERT INTO about_us_page_config (
          hero_badge_text, hero_title, hero_description,
          team_1_name, team_1_role, team_1_description, team_1_image_url, team_1_linkedin_url,
          team_2_name, team_2_role, team_2_description, team_2_image_url, team_2_linkedin_url,
          vision_badge_text, vision_title, vision_description,
          mission_badge_text, mission_title, mission_description,
          approach_title, approach_description,
          approach_1_title, approach_1_description,
          approach_2_title, approach_2_description,
          approach_3_title, approach_3_description,
          approach_4_title, approach_4_description,
          why_title, why_description, why_button_text, why_button_link,
          created_at, updated_at
        ) VALUES (
          ${heroBadgeText || null}, ${heroTitle}, ${heroDescription || null},
          ${team1Name || null}, ${team1Role || null}, ${team1Description || null}, ${team1ImageUrl || null}, ${team1LinkedInUrl || null},
          ${team2Name || null}, ${team2Role || null}, ${team2Description || null}, ${team2ImageUrl || null}, ${team2LinkedInUrl || null},
          ${visionBadgeText || null}, ${visionTitle || null}, ${visionDescription || null},
          ${missionBadgeText || null}, ${missionTitle || null}, ${missionDescription || null},
          ${approachTitle || null}, ${approachDescription || null},
          ${approach1Title || null}, ${approach1Description || null},
          ${approach2Title || null}, ${approach2Description || null},
          ${approach3Title || null}, ${approach3Description || null},
          ${approach4Title || null}, ${approach4Description || null},
          ${whyTitle || null}, ${whyDescription || null}, ${whyButtonText || 'Jetzt durchstarten'}, ${whyButtonLink || '/registrieren'},
          NOW(), NOW()
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating About Us page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Konfiguration' },
      { status: 500 }
    )
  }
}

