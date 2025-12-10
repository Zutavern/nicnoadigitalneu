import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

// Lade .env Variablen
dotenv.config()

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
console.log('Verbinde mit Datenbank...')
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

const categoryAnimations = [
  // ==========================================
  // KERNFUNKTIONEN (core)
  // ==========================================
  {
    categoryKey: 'core',
    title: 'Kernfunktionen',
    subtitle: 'Das Fundament Ihres Erfolgs',
    description: 'Alle essentiellen Werkzeuge für Ihren Salon-Alltag: Von der digitalen Terminbuchung über Stuhl- und Teamverwaltung bis hin zum integrierten CRM-System. Alles, was Sie für einen reibungslosen Betrieb brauchen.',
    badgeText: 'Alles in einem',
    features: [
      '24/7 Online-Buchung',
      'Stuhl- & Team-Management',
      'Kundendatenbank (CRM)',
      'Mobile App für unterwegs',
      'Kalender-Synchronisation',
      'Multi-Standort Support',
    ],
    animationType: 'preset',
    presetAnimation: 'calendar',
    animationPosition: 'right',
    animationSize: 'medium',
    animationSpeed: 1.0,
    useDesignSystemColors: true,
    isActive: true,
    sortOrder: 1,
  },
  // ==========================================
  // KOMMUNIKATION (communication)
  // ==========================================
  {
    categoryKey: 'communication',
    title: 'Kommunikation',
    subtitle: 'Immer in Verbindung',
    description: 'Bleiben Sie mit Ihren Kunden und Ihrem Team in Kontakt. Automatische Terminerinnerungen, integrierter Chat, Marketing-Kampagnen und Feedback-System – alles aus einer Hand.',
    badgeText: 'Kundenbindung stärken',
    features: [
      'Automatische Erinnerungen',
      'SMS & E-Mail Integration',
      'Integrierter Team-Chat',
      'Marketing-Kampagnen',
      'Bewertungen sammeln',
      'WhatsApp-Anbindung',
    ],
    animationType: 'preset',
    presetAnimation: 'chat',
    animationPosition: 'right',
    animationSize: 'medium',
    animationSpeed: 1.0,
    useDesignSystemColors: true,
    isActive: true,
    sortOrder: 2,
  },
  // ==========================================
  // ANALYTICS & BERICHTE (analytics)
  // ==========================================
  {
    categoryKey: 'analytics',
    title: 'Analytics & Berichte',
    subtitle: 'Datenbasierte Entscheidungen',
    description: 'Verstehen Sie Ihr Geschäft besser mit umfassenden Analytics. Umsatz-Dashboards, Auslastungsberichte, Kunden-Insights und exportierbare Reports für Ihre Buchhaltung.',
    badgeText: 'Volle Transparenz',
    features: [
      'Echtzeit-Dashboard',
      'Umsatz- & Gewinnanalyse',
      'Auslastungs-Berichte',
      'Kunden-Insights',
      'Mitarbeiter-Performance',
      'Export für Steuerberater',
    ],
    animationType: 'preset',
    presetAnimation: 'chart',
    animationPosition: 'right',
    animationSize: 'large',
    animationSpeed: 1.0,
    useDesignSystemColors: true,
    isActive: true,
    sortOrder: 3,
  },
  // ==========================================
  // SICHERHEIT & COMPLIANCE (security)
  // ==========================================
  {
    categoryKey: 'security',
    title: 'Sicherheit & Compliance',
    subtitle: 'Maximaler Schutz',
    description: 'Ihre Daten und die Ihrer Kunden sind bei uns sicher. DSGVO-konform, verschlüsselte Speicherung, deutsche Server und rechtssichere Verträge – für ein sorgenfreies Arbeiten.',
    badgeText: 'DSGVO-konform',
    features: [
      'SSL-Verschlüsselung',
      'Deutsche Rechenzentren',
      'DSGVO-Konformität',
      'GoBD-konforme Belege',
      'Zwei-Faktor-Authentifizierung',
      'Audit-Log für Änderungen',
    ],
    animationType: 'preset',
    presetAnimation: 'shield',
    animationPosition: 'right',
    animationSize: 'medium',
    animationSpeed: 1.0,
    useDesignSystemColors: true,
    isActive: true,
    sortOrder: 4,
  },
  // ==========================================
  // AUTOMATISIERUNG (automation)
  // ==========================================
  {
    categoryKey: 'automation',
    title: 'Automatisierung',
    subtitle: 'Mehr Zeit für das Wesentliche',
    description: 'Lassen Sie wiederkehrende Aufgaben automatisch erledigen. Von der Rechnungsstellung über Terminerinnerungen bis hin zu intelligenten Buchungsvorschlägen – NICNOA arbeitet für Sie.',
    badgeText: 'Zeit sparen',
    features: [
      'Automatische Rechnungen',
      'Workflow-Automatisierung',
      'Smart Scheduling (KI)',
      'Wiederkehrende Termine',
      'API & Webhooks',
      'Zapier-Integration',
    ],
    animationType: 'preset',
    presetAnimation: 'workflow',
    animationPosition: 'right',
    animationSize: 'large',
    animationSpeed: 1.0,
    useDesignSystemColors: true,
    isActive: true,
    sortOrder: 5,
  },
]

async function main() {
  console.log('🚀 Seeding Category Animations...')

  // Lösche bestehende Daten
  console.log('Lösche bestehende Category Animations...')
  await prisma.categoryAnimation.deleteMany({})

  // Füge neue Animationen hinzu
  console.log('Erstelle Category Animations...')
  for (const animation of categoryAnimations) {
    await prisma.categoryAnimation.create({
      data: animation,
    })
    console.log(`  ✅ Animation erstellt: ${animation.title}`)
  }

  // Aktualisiere ProductPageConfig mit Category Showcase Einstellungen
  console.log('Aktualisiere Product Page Config...')
  await prisma.productPageConfig.upsert({
    where: { id: 'default' },
    update: {
      showCategoryShowcase: true,
      categoryShowcaseTitle: 'Entdecken Sie unsere Funktionen',
      categoryShowcaseSubtitle: 'Jede Kategorie bietet spezialisierte Tools für Ihren Erfolg im Salon-Business.',
      autoPlayEnabled: true,
      autoPlayInterval: 5000,
      showDots: true,
      showArrows: true,
    },
    create: {
      id: 'default',
      heroType: 'animated',
      heroLayout: 'split',
      heroTitle: 'Alles was Ihr Salon-Space braucht',
      ctaPrimaryText: 'Kostenlos starten',
      ctaPrimaryLink: '/registrieren',
      showCategoryShowcase: true,
      categoryShowcaseTitle: 'Entdecken Sie unsere Funktionen',
      categoryShowcaseSubtitle: 'Jede Kategorie bietet spezialisierte Tools für Ihren Erfolg im Salon-Business.',
      autoPlayEnabled: true,
      autoPlayInterval: 5000,
      showDots: true,
      showArrows: true,
    },
  })
  console.log('  ✅ Page Config aktualisiert')

  console.log('\n✨ Seeding abgeschlossen!')
  console.log(`   ${categoryAnimations.length} Animationen erstellt`)
}

main()
  .catch((e) => {
    console.error('❌ Fehler beim Seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })


