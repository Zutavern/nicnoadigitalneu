import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('⚙️ Seeding Platform Settings...')

  // Prüfe ob bereits Settings existieren
  const existing = await prisma.platformSettings.findUnique({
    where: { id: 'default' }
  })
  
  if (existing) {
    // Update Demo-Modus auf false
    if (existing.useDemoMode) {
      await prisma.platformSettings.update({
        where: { id: 'default' },
        data: { useDemoMode: false }
      })
      console.log('✅ Demo-Modus deaktiviert')
    } else {
      console.log('✅ Platform Settings existieren bereits (Demo-Modus: AUS)')
    }
    return
  }

  // Erstelle die Standard-Settings
  await prisma.platformSettings.create({
    data: {
      id: 'default',
      companyName: 'NICNOA & CO.',
      supportEmail: 'support@nicnoa.de',
      defaultLanguage: 'de',
      timezone: 'Europe/Berlin',
      currency: 'EUR',
      primaryColor: '#3B82F6',
      trialDays: 14,
      useDemoMode: false, // WICHTIG: Demo-Modus deaktiviert!
      demoModeMessage: null,
    },
  })

  console.log('✅ Platform Settings erstellt (Demo-Modus: AUS)')
}

main()
  .catch((e) => {
    console.error('❌ Fehler beim Seeden der Platform Settings:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })



