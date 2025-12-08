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
    SELECT COUNT(*)::int as count FROM faq_page_config
  ` as any[]
  
  if (existing[0].count > 0) {
    console.log('✅ FAQ Page Config bereits vorhanden, überspringe Seed.')
    return
  }

  await prisma.$queryRaw`
    INSERT INTO faq_page_config (
      hero_badge_text, hero_title, hero_description,
      section_title, section_description,
      salon_tab_label, stylist_tab_label,
      contact_text, contact_link_text, contact_link_url,
      created_at, updated_at
    ) VALUES (
      'Häufig gestellte Fragen',
      'Ihre Fragen beantwortet',
      'Hier finden Sie Antworten auf die wichtigsten Fragen rund um NICNOA & CO. DIGITAL',
      'Frequently Asked Questions',
      'Entdecken Sie schnelle und umfassende Antworten auf häufige Fragen zu unserer Plattform, Services und Features.',
      'Für Salon-Space Betreiber',
      'Für Stuhlmieter',
      'Können Sie nicht finden, wonach Sie suchen? Kontaktieren Sie unser',
      'Support-Team',
      '/support',
      NOW(),
      NOW()
    )
  `

  console.log('✅ FAQ Page Config erfolgreich erstellt')
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

