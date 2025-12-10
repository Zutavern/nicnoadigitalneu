import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use DIRECT_DATABASE_URL for direct TCP connection
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('📋 Seeding Updates Page data...')

  // 1. Updates Page Config
  await prisma.updatesPageConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heroBadgeText: 'Neueste Updates',
      heroTitle: 'Stetige Verbesserungen für Ihren Salon-Space',
      heroTitleHighlight: 'Salon-Space',
      heroDescription: 'Entdecken Sie unsere neuesten Entwicklungen und Verbesserungen. Wir arbeiten kontinuierlich daran, Ihre Erfahrung noch besser zu machen.',
      ctaTitle: 'Bleiben Sie auf dem Laufenden',
      ctaDescription: 'Abonnieren Sie unseren Newsletter und erhalten Sie als Erste/r Informationen über neue Features und Verbesserungen.',
      ctaButtonText: 'Newsletter abonnieren',
      ctaButtonLink: '#newsletter',
      metaTitle: 'Updates | NICNOA',
      metaDescription: 'Entdecken Sie die neuesten Updates und Verbesserungen der NICNOA Plattform.',
    },
  })
  console.log('✅ Updates page config created')

  // 2. Changelog Entries
  await prisma.changelogEntry.deleteMany({})
  
  const entries = [
    {
      date: new Date('2025-03-01'),
      category: 'Neu',
      icon: 'sparkles',
      title: 'Dark Mode & Performance',
      description: 'Elegantes dunkles Design für bessere Übersicht und optimierte Ladezeiten für schnellere Navigation.',
      isHighlight: true,
      sortOrder: 0,
      isActive: true,
    },
    {
      date: new Date('2025-02-15'),
      category: 'Sicherheit',
      icon: 'shield',
      title: 'Erweiterte Datensicherheit',
      description: 'Implementierung modernster Verschlüsselungstechnologien und verbesserter Zugriffskontrollen.',
      isHighlight: false,
      sortOrder: 1,
      isActive: true,
    },
    {
      date: new Date('2025-02-01'),
      category: 'Feature',
      icon: 'zap',
      title: 'Intelligente Terminplanung',
      description: 'Neue Algorithmen für optimale Auslastung und automatische Terminerinnerungen.',
      isHighlight: false,
      sortOrder: 2,
      isActive: true,
    },
    {
      date: new Date('2025-01-15'),
      category: 'Optimierung',
      icon: 'wrench',
      title: 'UI/UX Verbesserungen',
      description: 'Überarbeitete Navigation und intuitivere Benutzerführung für effizienteres Arbeiten.',
      isHighlight: false,
      sortOrder: 3,
      isActive: true,
    },
    {
      date: new Date('2025-01-01'),
      category: 'Feature',
      icon: 'rocket',
      title: 'Beta Start',
      description: 'Offizieller Start der Beta-Phase mit ausgewählten Partnersalons.',
      isHighlight: false,
      sortOrder: 4,
      isActive: true,
    },
  ]

  for (const entry of entries) {
    await prisma.changelogEntry.create({ data: entry })
  }
  console.log(`✅ ${entries.length} changelog entries created`)

  console.log('🎉 Updates Page seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding updates page:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
