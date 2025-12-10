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
  console.log('🚀 Seeding Beta Page data...')

  // 1. Beta Page Config
  await prisma.betaPageConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heroBadgeText: 'Start in Q2 2025',
      heroTitle: 'Gestalten Sie die Zukunft des Salon-Managements',
      heroTitleHighlight: 'Salon-Managements',
      heroDescription: 'Werden Sie einer von nur 5 exklusiven Beta-Testern und profitieren Sie von einzigartigen Vorteilen. Gemeinsam entwickeln wir die perfekte Lösung für moderne Salon-Spaces.',
      heroCtaPrimaryText: 'Jetzt bewerben',
      heroCtaPrimaryLink: '#bewerbung',
      heroCtaSecondaryText: 'Mehr erfahren',
      heroCtaSecondaryLink: '#vorteile',
      requirementsTitle: 'Anforderungen',
      requirementsDescription: 'Wir suchen innovative Salon-Betreiber, die mit uns die Zukunft gestalten möchten.',
      timelineTitle: 'Beta-Programm Timeline',
      timelineDescription: 'Ein strukturierter Fahrplan für die Entwicklung unserer Plattform.',
      ctaTitle: 'Bereit für die Zukunft?',
      ctaDescription: 'Sichern Sie sich jetzt einen der exklusiven Beta-Tester Plätze und profitieren Sie von einzigartigen Vorteilen.',
      ctaButtonText: 'Beta-Bewerbung starten',
      ctaButtonLink: '#bewerbung',
      metaTitle: 'Beta-Programm | NICNOA',
      metaDescription: 'Werden Sie Beta-Tester und gestalten Sie die Zukunft des Salon-Managements mit NICNOA.',
    },
  })
  console.log('✅ Beta page config created')

  // 2. Benefits
  await prisma.betaBenefit.deleteMany({})
  
  const benefits = [
    {
      icon: 'rocket',
      title: 'Early Access',
      description: 'Exklusiver Zugriff auf alle Features vor dem offiziellen Launch.',
      sortOrder: 0,
      isActive: true,
      configId: 'default',
    },
    {
      icon: 'users',
      title: 'Direkter Einfluss',
      description: 'Gestalten Sie aktiv die Zukunft der Plattform mit Ihrem Feedback.',
      sortOrder: 1,
      isActive: true,
      configId: 'default',
    },
    {
      icon: 'message-square',
      title: 'Premium Support',
      description: 'Direkter Draht zu unserem Entwicklungsteam für schnelle Hilfe.',
      sortOrder: 2,
      isActive: true,
      configId: 'default',
    },
    {
      icon: 'gift',
      title: 'Lifetime Rabatt',
      description: '50% Rabatt auf alle Preispläne - garantiert für die gesamte Nutzungsdauer.',
      sortOrder: 3,
      isActive: true,
      configId: 'default',
    },
  ]

  for (const benefit of benefits) {
    await prisma.betaBenefit.create({ data: benefit })
  }
  console.log(`✅ ${benefits.length} benefits created`)

  // 3. Requirements
  await prisma.betaRequirement.deleteMany({})
  
  const requirements = [
    {
      text: 'Aktiver Salon-Space mit mindestens 3 Arbeitsplätzen',
      sortOrder: 0,
      isActive: true,
      configId: 'default',
    },
    {
      text: 'Bereitschaft zur aktiven Teilnahme am Feedback-Prozess',
      sortOrder: 1,
      isActive: true,
      configId: 'default',
    },
    {
      text: 'Mindestens 2 Jahre Erfahrung im Salon-Management',
      sortOrder: 2,
      isActive: true,
      configId: 'default',
    },
    {
      text: 'Offenheit für digitale Innovationen',
      sortOrder: 3,
      isActive: true,
      configId: 'default',
    },
  ]

  for (const req of requirements) {
    await prisma.betaRequirement.create({ data: req })
  }
  console.log(`✅ ${requirements.length} requirements created`)

  // 4. Timeline Items
  await prisma.betaTimelineItem.deleteMany({})
  
  const timelineItems = [
    {
      date: 'Q2 2025',
      title: 'Start der Beta',
      description: 'Onboarding der ersten 5 Beta-Tester und initiale Systemeinrichtung.',
      sortOrder: 0,
      isActive: true,
      configId: 'default',
    },
    {
      date: 'Q3 2025',
      title: 'Feedback & Optimierung',
      description: 'Intensive Feedback-Runden und kontinuierliche Verbesserungen.',
      sortOrder: 1,
      isActive: true,
      configId: 'default',
    },
    {
      date: 'Q4 2025',
      title: 'Feature-Erweiterung',
      description: 'Integration neuer Features basierend auf Beta-Feedback.',
      sortOrder: 2,
      isActive: true,
      configId: 'default',
    },
    {
      date: 'Q1 2026',
      title: 'Finalisierung',
      description: 'Letzte Optimierungen vor dem offiziellen Launch.',
      sortOrder: 3,
      isActive: true,
      configId: 'default',
    },
  ]

  for (const item of timelineItems) {
    await prisma.betaTimelineItem.create({ data: item })
  }
  console.log(`✅ ${timelineItems.length} timeline items created`)

  console.log('🎉 Beta Page seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding beta page:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
