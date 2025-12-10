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
  // Prüfe ob bereits Cards existieren
  const existing = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count FROM approach_cards
  ` as any[]
  
  if (existing[0].count > 0) {
    console.log('✅ Approach Cards bereits vorhanden, überspringe Seed.')
    return
  }

  await prisma.$queryRaw`
    INSERT INTO approach_cards (title, description, icon_name, sort_order, is_active, created_at, updated_at)
    VALUES
      ('Praxisnah validiert', 'Wir haben unsere Konzepte zunächst offline getestet und bewiesen, dass sie in der realen Welt funktionieren – bevor wir sie digital skaliert haben.', 'Target', 0, true, NOW(), NOW()),
      ('Rechtssicherheit & Automatisierung', 'Automatisierte Verträge und integrierte Compliance-Standards schaffen Sicherheit bei allen Mietprozessen.', 'ShieldCheck', 1, true, NOW(), NOW()),
      ('Skalierbarkeit & Flexibilität', 'Unsere Plattform passt sich an individuelle Anforderungen an, ob Einzelunternehmer, KMU oder Großunternehmen.', 'Scaling', 2, true, NOW(), NOW()),
      ('Benutzerfreundlichkeit', 'Ein intuitives Design und durchdachte Workflows machen die Verwaltung und Vermietung von Flächen so einfach wie möglich.', 'Sparkles', 3, true, NOW(), NOW())
  `

  console.log('✅ Approach Cards erfolgreich erstellt')
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



