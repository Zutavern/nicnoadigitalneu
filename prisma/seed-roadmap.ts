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
  console.log('🗺️ Seeding roadmap data...')

  // 1. Roadmap Page Config
  await prisma.roadmapPageConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heroBadgeText: 'Roadmap',
      heroTitle: 'Unsere Vision für die Zukunft des Salon-Managements',
      heroTitleHighlight: 'Zukunft des Salon-Managements',
      heroDescription: 'Gemeinsam mit unseren Kunden entwickeln wir die Zukunft der Salon-Coworking-Branche. Ihre Bedürfnisse und Feedback fließen direkt in unsere Produktentwicklung ein.',
      timelineSectionTitle: 'Geplante Features',
      showCta: true,
      ctaTitle: 'Gestalten Sie die Zukunft mit',
      ctaDescription: 'Werden Sie Teil unseres Beta-Programms und helfen Sie uns, die perfekte Lösung für Ihren Salon-Space zu entwickeln.',
      ctaButtonText: 'Beta-Programm anfragen',
      ctaButtonLink: '/beta-programm',
      showStatusFilter: true,
      metaTitle: 'Roadmap | nicnoa',
      metaDescription: 'Entdecken Sie die Zukunft des Salon-Managements mit unserer Produktroadmap. Mobile App, KI-Integration und mehr.',
    }
  })
  console.log('✅ Roadmap page config created')

  // 2. Roadmap Items
  const roadmapItems = [
    {
      quarter: 'Q2 2025',
      title: 'Start Beta-Programm',
      description: 'Exklusiver Zugang für ausgewählte Salon-Spaces zur Mitgestaltung der Plattform. Werden Sie einer der ersten Nutzer und helfen Sie uns, die perfekte Lösung zu entwickeln.',
      icon: 'sparkles',
      status: 'Planung',
      sortOrder: 0,
      isActive: true,
    },
    {
      quarter: 'Q3 2025',
      title: 'Mobile App',
      description: 'Native Apps für iOS und Android mit allen wichtigen Features für unterwegs. Verwalten Sie Buchungen, kommunizieren Sie mit Kunden und behalten Sie Ihren Umsatz im Blick.',
      icon: 'smartphone',
      status: 'In Entwicklung',
      sortOrder: 1,
      isActive: true,
    },
    {
      quarter: 'Q4 2025',
      title: 'KI-Integration',
      description: 'Intelligente Automatisierung und Vorhersagen für optimale Geschäftsentscheidungen. Von automatischer Terminplanung bis hin zu Umsatzprognosen.',
      icon: 'brain',
      status: 'Konzeption',
      sortOrder: 2,
      isActive: true,
    },
    {
      quarter: 'Q1 2026',
      title: 'Social Media Manager',
      description: 'Integriertes Tool zur Verwaltung und Analyse Ihrer Social Media Präsenz. Planen Sie Posts, analysieren Sie Reichweiten und steigern Sie Ihre Online-Präsenz.',
      icon: 'share2',
      status: 'Planung',
      sortOrder: 3,
      isActive: true,
    },
    {
      quarter: 'Q2 2026',
      title: 'Landing Pages für Stuhlmieter',
      description: 'Individuelle Präsentationsseiten für jeden Stuhlmieter mit Buchungsfunktion. Professionelle Online-Auftritte für selbstständige Friseure.',
      icon: 'layout',
      status: 'Ideenfindung',
      sortOrder: 4,
      isActive: true,
    },
  ]

  // Lösche vorhandene Items und erstelle neue
  await prisma.roadmapItem.deleteMany({})
  
  for (const item of roadmapItems) {
    await prisma.roadmapItem.create({
      data: item
    })
  }
  console.log(`✅ ${roadmapItems.length} roadmap items created`)

  console.log('🎉 Roadmap seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding roadmap:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })






