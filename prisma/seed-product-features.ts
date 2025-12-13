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

const productFeatures = [
  // ==========================================
  // KERNFUNKTIONEN (core)
  // ==========================================
  {
    title: 'Digitale Terminbuchung',
    description: 'Ihre Kunden buchen 24/7 online. Automatische Bestätigungen und Erinnerungen reduzieren No-Shows um bis zu 80%.',
    iconName: 'Calendar',
    category: 'core',
    isActive: true,
    isHighlight: true,
    sortOrder: 1,
  },
  {
    title: 'Team & Stuhlverwaltung',
    description: 'Verwalten Sie Ihre Mitarbeiter, Stuhlmieter und deren Verfügbarkeiten zentral. Flexible Mietmodelle und transparente Abrechnung.',
    iconName: 'Users',
    category: 'core',
    isActive: true,
    isHighlight: false,
    sortOrder: 2,
  },
  {
    title: 'Mobile App',
    description: 'Volle Kontrolle von unterwegs. Push-Benachrichtigungen für neue Buchungen und wichtige Updates.',
    iconName: 'Smartphone',
    category: 'core',
    isActive: true,
    isHighlight: false,
    sortOrder: 3,
  },
  {
    title: 'Integrierte Zahlungen',
    description: 'Sichere Online-Zahlungen, automatische Rechnungsstellung und transparente Provisionsmodelle.',
    iconName: 'CreditCard',
    category: 'core',
    isActive: true,
    isHighlight: true,
    sortOrder: 4,
  },
  {
    title: 'Anpassbares Branding',
    description: 'Ihr Logo, Ihre Farben, Ihre Domain. Passen Sie die Plattform vollständig an Ihre Marke an.',
    iconName: 'Settings',
    category: 'core',
    isActive: true,
    isHighlight: false,
    sortOrder: 5,
  },
  {
    title: 'Kundendatenbank (CRM)',
    description: 'Alle Kundendaten an einem Ort. Historie, Präferenzen, Notizen und Kommunikation übersichtlich verwalten.',
    iconName: 'Users',
    category: 'core',
    isActive: true,
    isHighlight: true,
    sortOrder: 6,
  },
  {
    title: 'Kalender-Synchronisation',
    description: 'Nahtlose Synchronisation mit Google Calendar, Apple Kalender und Outlook für alle Team-Mitglieder.',
    iconName: 'Calendar',
    category: 'core',
    isActive: true,
    isHighlight: false,
    sortOrder: 7,
  },
  {
    title: 'Wartelisten-Management',
    description: 'Automatische Wartelisten bei ausgebuchten Terminen. Kunden werden benachrichtigt, sobald Plätze frei werden.',
    iconName: 'Clock',
    category: 'core',
    isActive: true,
    isHighlight: false,
    sortOrder: 8,
  },
  {
    title: 'Multi-Standort Support',
    description: 'Verwalten Sie mehrere Salons oder Standorte in einem Dashboard. Zentrale Übersicht, individuelle Einstellungen.',
    iconName: 'Globe',
    category: 'core',
    isActive: true,
    isHighlight: false,
    sortOrder: 9,
  },
  {
    title: 'Ressourcen-Management',
    description: 'Verwalten Sie Räume, Waschplätze und Equipment. Vermeiden Sie Überbuchungen und optimieren Sie die Auslastung.',
    iconName: 'Layers',
    category: 'core',
    isActive: true,
    isHighlight: false,
    sortOrder: 10,
  },
  
  // ==========================================
  // KOMMUNIKATION (communication)
  // ==========================================
  {
    title: 'Kundenkommunikation',
    description: 'Integrierter Chat, SMS und E-Mail. Bleiben Sie mit Ihren Kunden und Mietern in Kontakt.',
    iconName: 'MessageSquare',
    category: 'communication',
    isActive: true,
    isHighlight: false,
    sortOrder: 11,
  },
  {
    title: 'Automatische Erinnerungen',
    description: 'Termin-Erinnerungen per SMS, E-Mail oder WhatsApp. Reduzieren Sie No-Shows um bis zu 80%.',
    iconName: 'Bell',
    category: 'communication',
    isActive: true,
    isHighlight: true,
    sortOrder: 12,
  },
  {
    title: 'Marketing-Kampagnen',
    description: 'Erstellen Sie Newsletter und Promotions. Erreichen Sie Ihre Zielgruppe mit personalisierten Nachrichten.',
    iconName: 'Target',
    category: 'communication',
    isActive: true,
    isHighlight: false,
    sortOrder: 13,
  },
  {
    title: 'Bewertungen & Feedback',
    description: 'Automatisches Feedback nach jedem Termin. Sammeln Sie Bewertungen und verbessern Sie Ihren Service.',
    iconName: 'Star',
    category: 'communication',
    isActive: true,
    isHighlight: false,
    sortOrder: 14,
  },
  {
    title: 'Team-Messenger',
    description: 'Interne Kommunikation für Ihr Team. Nachrichten, Ankündigungen und Aufgaben an einem Ort.',
    iconName: 'MessageSquare',
    category: 'communication',
    isActive: true,
    isHighlight: false,
    sortOrder: 15,
  },
  
  // ==========================================
  // ANALYTICS & BERICHTE (analytics)
  // ==========================================
  {
    title: 'Umfassende Analytics',
    description: 'Detaillierte Einblicke in Auslastung, Umsatz und Kundenverhalten. Datenbasierte Entscheidungen für Ihr Wachstum.',
    iconName: 'BarChart3',
    category: 'analytics',
    isActive: true,
    isHighlight: true,
    sortOrder: 16,
  },
  {
    title: 'Umsatz-Dashboard',
    description: 'Echtzeit-Übersicht über Einnahmen, Ausgaben und Gewinn. Pro Mitarbeiter, Service oder Zeitraum.',
    iconName: 'BarChart3',
    category: 'analytics',
    isActive: true,
    isHighlight: false,
    sortOrder: 17,
  },
  {
    title: 'Auslastungs-Berichte',
    description: 'Optimieren Sie Ihre Kapazitäten. Sehen Sie, wann Stoßzeiten sind und wo Potenzial liegt.',
    iconName: 'Target',
    category: 'analytics',
    isActive: true,
    isHighlight: false,
    sortOrder: 18,
  },
  {
    title: 'Kunden-Insights',
    description: 'Verstehen Sie Ihre Kunden besser. Besuchshäufigkeit, bevorzugte Services und Lifetime Value.',
    iconName: 'Users',
    category: 'analytics',
    isActive: true,
    isHighlight: false,
    sortOrder: 19,
  },
  {
    title: 'Export & Reporting',
    description: 'Exportieren Sie alle Daten als CSV oder PDF. Perfekt für Buchhaltung und Steuerberater.',
    iconName: 'FileText',
    category: 'analytics',
    isActive: true,
    isHighlight: false,
    sortOrder: 20,
  },
  {
    title: 'Mitarbeiter-Performance',
    description: 'Leistungsübersicht für jedes Team-Mitglied. Umsatz, Auslastung und Kundenbewertungen.',
    iconName: 'BarChart3',
    category: 'analytics',
    isActive: true,
    isHighlight: false,
    sortOrder: 21,
  },
  
  // ==========================================
  // SICHERHEIT & COMPLIANCE (security)
  // ==========================================
  {
    title: 'Rechtssichere Verträge',
    description: 'Von Fachanwälten geprüfte Mietverträge. Digitale Unterschriften und revisionssichere Dokumentation.',
    iconName: 'Shield',
    category: 'security',
    isActive: true,
    isHighlight: false,
    sortOrder: 22,
  },
  {
    title: 'DSGVO-konform',
    description: 'Vollständig DSGVO-konform. Automatische Datenlöschung, Einwilligungsmanagement und Auskunftsrechte.',
    iconName: 'Lock',
    category: 'security',
    isActive: true,
    isHighlight: true,
    sortOrder: 23,
  },
  {
    title: 'Sichere Datenspeicherung',
    description: 'Hosting in deutschen Rechenzentren. SSL-Verschlüsselung und regelmäßige Backups.',
    iconName: 'Shield',
    category: 'security',
    isActive: true,
    isHighlight: false,
    sortOrder: 24,
  },
  {
    title: 'Zugriffskontrolle',
    description: 'Feingranulare Berechtigungen für jeden Nutzer. Wer darf was sehen und bearbeiten.',
    iconName: 'Lock',
    category: 'security',
    isActive: true,
    isHighlight: false,
    sortOrder: 25,
  },
  {
    title: 'Audit-Log',
    description: 'Lückenlose Protokollierung aller Änderungen. Wer hat wann was geändert - für volle Transparenz.',
    iconName: 'FileText',
    category: 'security',
    isActive: true,
    isHighlight: false,
    sortOrder: 26,
  },
  {
    title: 'GoBD-konform',
    description: 'Revisionssichere Aufbewahrung aller Belege. Perfekt für die deutsche Finanzbuchhaltung.',
    iconName: 'CheckCircle2',
    category: 'security',
    isActive: true,
    isHighlight: false,
    sortOrder: 27,
  },
  
  // ==========================================
  // AUTOMATISIERUNG (automation)
  // ==========================================
  {
    title: 'Workflow-Automatisierung',
    description: 'Wiederkehrende Aufgaben automatisieren. Von Rechnungsstellung bis Terminerinnerungen - alles läuft von selbst.',
    iconName: 'Zap',
    category: 'automation',
    isActive: true,
    isHighlight: true,
    sortOrder: 28,
  },
  {
    title: 'Automatische Rechnungen',
    description: 'Rechnungen werden automatisch erstellt und versendet. Mit allen gesetzlichen Pflichtangaben.',
    iconName: 'FileText',
    category: 'automation',
    isActive: true,
    isHighlight: false,
    sortOrder: 29,
  },
  {
    title: 'Wiederkehrende Termine',
    description: 'Stammkunden buchen automatisch. Regelmäßige Termine ohne manuellen Aufwand.',
    iconName: 'Calendar',
    category: 'automation',
    isActive: true,
    isHighlight: false,
    sortOrder: 30,
  },
  {
    title: 'Smart Scheduling',
    description: 'KI-gestützte Terminvorschläge. Optimale Auslastung und weniger Lücken im Kalender.',
    iconName: 'Sparkles',
    category: 'automation',
    isActive: true,
    isHighlight: false,
    sortOrder: 31,
  },
  {
    title: 'API & Integrationen',
    description: 'Verbinden Sie NICNOA mit Ihrer Software. REST API und Webhooks für individuelle Integrationen.',
    iconName: 'Layers',
    category: 'automation',
    isActive: true,
    isHighlight: false,
    sortOrder: 32,
  },
  {
    title: 'Zapier-Integration',
    description: 'Verbinden Sie NICNOA mit 5.000+ Apps. Automatisieren Sie Prozesse ohne Programmierung.',
    iconName: 'Zap',
    category: 'automation',
    isActive: true,
    isHighlight: false,
    sortOrder: 33,
  },
]

const productPageConfig = {
  id: 'default',
  // Hero Type & Layout
  heroType: 'animated',
  heroLayout: 'split',
  // Hero Content
  heroBadgeText: 'Die All-in-One Plattform',
  heroBadgeIcon: 'sparkles',
  heroTitle: 'Alles was Ihr Salon-Space braucht',
  heroTitleHighlight: 'Salon-Space',
  heroDescription: 'Eine Plattform für Terminbuchung, Stuhlvermietung, Kundenverwaltung und Analytics. Entwickelt von Salon-Experten für Salon-Experten.',
  // CTA
  ctaPrimaryText: 'Kostenlos starten',
  ctaPrimaryLink: '/registrieren',
  ctaPrimaryIcon: 'arrow-right',
  ctaSecondaryText: 'Preise ansehen',
  ctaSecondaryLink: '/preise',
  showSecondaryCta: true,
  // Trust Indicators
  showTrustIndicators: true,
  trustIndicator1: '14 Tage kostenlos testen',
  trustIndicator2: 'Keine Kreditkarte erforderlich',
  trustIndicator3: 'DSGVO-konform',
  // Animation
  animationEnabled: true,
  particlesEnabled: true,
  showDashboardPreview: true,
  useDesignSystemColors: true,
  gradientColors: 'primary,secondary,accent',
  dashboardTitle: 'NICNOA Dashboard',
  dashboardSubtitle: 'Produkt Overview',
  showScrollIndicator: true,
  scrollTargetId: 'features',
  // Features Section
  featuresSectionTitle: 'Unsere Features',
  featuresSectionDescription: 'Entdecken Sie alle Funktionen, die NICNOA zu Ihrer idealen Lösung machen.',
  showFeatureCategories: true,
  // Bottom CTA
  bottomCtaTitle: 'Bereit für die Zukunft Ihres Salons?',
  bottomCtaDescription: 'Starten Sie noch heute und erleben Sie, wie NICNOA Ihren Arbeitsalltag revolutioniert.',
  bottomCtaButtonText: 'Jetzt kostenlos testen',
  bottomCtaButtonLink: '/registrieren',
  // SEO
  metaTitle: 'Produkt - NICNOA | All-in-One Salon-Space Verwaltung',
  metaDescription: 'Terminbuchung, Stuhlvermietung, Kundenverwaltung und Analytics in einer Plattform. Entwickelt von Salon-Experten für Salon-Experten.',
}

async function main() {
  console.log('🚀 Seeding Product Features und Page Config...')

  // Lösche bestehende Daten
  console.log('Lösche bestehende Product Features...')
  await prisma.productFeature.deleteMany({})

  // Füge neue Features hinzu
  console.log('Erstelle Product Features...')
  for (const feature of productFeatures) {
    await prisma.productFeature.create({
      data: feature,
    })
    console.log(`  ✅ Feature erstellt: ${feature.title}`)
  }

  // Erstelle/Aktualisiere Page Config
  console.log('Erstelle Product Page Config...')
  await prisma.productPageConfig.upsert({
    where: { id: 'default' },
    update: productPageConfig,
    create: productPageConfig,
  })
  console.log('  ✅ Page Config erstellt')

  console.log('\n✨ Seeding abgeschlossen!')
  console.log(`   ${productFeatures.length} Features erstellt`)
  console.log(`   1 Page Config erstellt`)
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





