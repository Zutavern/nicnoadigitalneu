import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use DIRECT_DATABASE_URL for direct TCP connection
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedGlobalUIConfig() {
  console.log('🎨 Seeding GlobalUIConfig...')

  await prisma.globalUIConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      
      // Navigation
      navProductLabel: 'Produkt',
      navCompanyLabel: 'Unternehmen',
      navFaqLabel: 'FAQ',
      navPricingLabel: 'Preise',
      navLoginLabel: 'Login',
      navRegisterLabel: 'Registrieren',
      
      // Footer - Branding
      footerDescription: 'Revolutionieren Sie die Art und Weise, wie Salon-Spaces verwaltet werden. Wir machen Coworking im Beauty-Bereich einfach, effizient und profitabel.',
      
      // Footer - Section Headers
      footerProductTitle: 'PRODUKT',
      footerCompanyTitle: 'UNTERNEHMEN',
      footerResourcesTitle: 'RESSOURCEN',
      
      // Footer - Product Links
      footerFeaturesLabel: 'Features',
      footerPricingLabel: 'Preise',
      footerRoadmapLabel: 'Roadmap',
      footerUpdatesLabel: 'Updates',
      footerBetaLabel: 'Beta-Programm',
      
      // Footer - Company Links
      footerAboutLabel: 'Über uns',
      footerPartnerLabel: 'Partner',
      footerCareerLabel: 'Karriere',
      footerBlogLabel: 'Blog',
      footerPressLabel: 'Presse',
      
      // Footer - Resources Links
      footerDocsLabel: 'Dokumentation',
      footerSupportLabel: 'Support',
      footerApiLabel: 'API',
      footerFaqLabel: 'FAQ',
      footerStatusLabel: 'Status',
      
      // Footer - Legal Links
      footerPrivacyLabel: 'Datenschutz',
      footerImprintLabel: 'Impressum',
      footerTermsLabel: 'AGB',
      
      // Footer - Copyright
      footerCopyright: '© 2025 NICNOA&CO.online. Alle Rechte vorbehalten.',
      
      // Testimonials Section
      testimonialsBadgeText: 'Testimonials',
      testimonialsTitle: 'Was unsere Nutzer sagen',
      testimonialsDescription: 'Erfahren Sie, wie NICNOA&CO.online das Leben von Stylisten und Salonbesitzern verändert',
      testimonialsStylistTab: 'Stuhlmietern',
      testimonialsSalonTab: 'Salonbesitzer',
      
      // Homepage FAQ Section
      homeFaqButtonText: 'Noch mehr Fragen & Antworten',
      
      // Empty States
      emptyFaqText: 'Keine FAQs verfügbar.',
      emptyDataText: 'Keine Daten vorhanden.',
      emptySearchText: 'Keine Ergebnisse gefunden.',
      
      // Cookie Consent
      cookieTitle: 'Cookie-Einstellungen',
      cookieDescription: 'Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung zu bieten.',
      cookieAcceptAll: 'Alle akzeptieren',
      cookieRejectAll: 'Alle ablehnen',
      cookieCustomize: 'Anpassen',
      cookieSaveSettings: 'Einstellungen speichern',
      
      // General UI
      loadingText: 'Wird geladen...',
      errorTitle: 'Ein Fehler ist aufgetreten',
      errorDescription: 'Bitte versuchen Sie es später erneut.',
      backToHomeText: 'Zurück zur Startseite',
    },
  })

  console.log('✅ GlobalUIConfig seeded successfully!')
}

seedGlobalUIConfig()
  .catch((e) => {
    console.error('❌ Error seeding GlobalUIConfig:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

