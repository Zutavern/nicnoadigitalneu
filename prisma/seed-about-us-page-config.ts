import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL oder DIRECT_DATABASE_URL muss gesetzt sein')
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Prüfe ob bereits Konfiguration existiert
  const existing = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count FROM about_us_page_config
  ` as any[]
  
  if (existing[0].count > 0) {
    console.log('✅ About Us Page Config bereits vorhanden, überspringe Seed.')
    return
  }

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
      'Das Team hinter NICNOA&CO.online',
      'Experten für moderne Salon-Spaces',
      'Wir sind Daniel und Nico – zwei erfahrene Experten, die mit Leidenschaft die Zukunft des Salon-Managements gestalten. Mit unserer Expertise revolutionieren wir die Art und Weise, wie Salon-Spaces verwaltet werden.',
      'Daniel',
      'Co-Founder',
      'Mit über 20 Jahren Berufserfahrung in Produktentwicklung, Agilität, Daten-Analytics und als Tech- sowie Produkt-Lead hat Daniel bereits zahlreiche branchenübergreifende Projekte erfolgreich geleitet.',
      NULL,
      'https://linkedin.com',
      'Nico',
      'Co-Founder',
      'Nico ist Industrie-Experte mit 15 Jahren Erfahrung im Wellness- und Beauty-Business und Betreiber von drei sehr erfolgreichen Coworking Spaces.',
      NULL,
      'https://linkedin.com',
      'Unsere Vision',
      'Die Zukunft der Salon-Branche gestalten',
      'Wir glauben an eine Zukunft, in der flexible Salon-Spaces und gemeinsame Ressourcen den Unternehmergeist in der Beauty-Branche beflügeln und nachhaltiges Wachstum fördern.',
      'Unsere Mission',
      'Innovativ & Effizient',
      'Unser Antrieb ist es, innovative und effiziente Lösungen zu schaffen, die das Management von Salon-Spaces vereinfachen und die Zusammenarbeit in der Beauty-Branche fördern.',
      'Unser Ansatz',
      'Wie wir arbeiten und was uns auszeichnet',
      'Praxisnah validiert',
      'Wir haben unsere Konzepte zunächst offline getestet und bewiesen, dass sie in der realen Welt funktionieren – bevor wir sie digital skaliert haben.',
      'Rechtssicherheit & Automatisierung',
      'Automatisierte Verträge und integrierte Compliance-Standards schaffen Sicherheit bei allen Mietprozessen.',
      'Skalierbarkeit & Flexibilität',
      'Unsere Plattform passt sich an individuelle Anforderungen an, ob Einzelunternehmer, KMU oder Großunternehmen.',
      'Benutzerfreundlichkeit',
      'Ein intuitives Design und durchdachte Workflows machen die Verwaltung und Vermietung von Flächen so einfach wie möglich.',
      'Warum wir tun, was wir tun',
      'Wir sind fest davon überzeugt, dass moderne Salon-Spaces und intelligente Ressourcennutzung der Schlüssel zum Erfolg in der Beauty-Branche sind. Gemeinsam gestalten wir die Zukunft des Salon-Managements.',
      'Jetzt durchstarten',
      '/registrieren',
      NOW(),
      NOW()
    )
  `

  console.log('✅ About Us Page Config erfolgreich erstellt')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })

