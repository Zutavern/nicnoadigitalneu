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
    SELECT COUNT(*)::int as count FROM partner_page_config
  ` as any[]
  
  if (existing[0].count > 0) {
    console.log('✅ Partner Page Config bereits vorhanden, überspringe Seed.')
    return
  }

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
      'Starke Partnerschaften',
      'Unsere Partner für deinen Erfolg',
      'Wir arbeiten mit führenden Unternehmen zusammen, um dir die besten Tools, Systeme und Services für deinen Salon-Space zu bieten.',
      'Verifizierte Partner',
      'Exklusive Vorteile',
      'Nur für Mitglieder',
      'Exklusive Vorteile für NICNOA Mitglieder',
      '/registrieren',
      'Jetzt Mitglied werden',
      'Werde Teil unserer Community',
      'Als NICNOA Mitglied profitierst du von exklusiven Partner-Deals, Rabatten und Sonderangeboten.',
      'Jetzt registrieren',
      '/registrieren',
      'Preise ansehen',
      '/preise',
      NOW(),
      NOW()
    )
  `

  console.log('✅ Partner Page Config erfolgreich erstellt')
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

