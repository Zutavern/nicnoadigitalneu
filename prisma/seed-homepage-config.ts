import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🏠 Seeding HomePage Config...')

  // Prüfe ob bereits eine Config existiert
  const existing = await prisma.homePageConfig.findFirst()
  
  if (existing) {
    console.log('✅ HomePage Config existiert bereits:', existing.id)
    return
  }

  // Erstelle die Standard-Konfiguration
  const config = await prisma.homePageConfig.create({
    data: {
      // Hero Type & Layout
      heroType: 'animated',
      heroLayout: 'split',

      // Hero Image (für heroType: "image")
      heroImageUrl: null,
      heroImageAlt: null,
      heroImageOverlay: 40,
      heroImagePosition: 'center',

      // Hero Video (für heroType: "video")
      heroVideoUrl: null,
      heroVideoPoster: null,

      // Hero Content
      heroBadgeText: 'Jetzt im Beta-Programm verfügbar',
      heroBadgeIcon: 'sparkles',
      heroTitleLine1: 'Revolutionieren',
      heroTitleLine2: 'Sie Ihren',
      heroTitleHighlight: 'Salon-Space',
      heroDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces. Verwalten Sie Buchungen, Mietverträge und Finanzen – alles an einem Ort.',

      // CTA Buttons
      ctaPrimaryText: 'Jetzt kostenlos starten',
      ctaPrimaryLink: '/registrieren',
      ctaPrimaryIcon: 'arrow-right',
      ctaSecondaryText: 'Produkt entdecken',
      ctaSecondaryLink: '/produkt',
      showSecondaryCta: true,

      // Trust Indicators
      showTrustIndicators: true,
      trustIndicator1: '14 Tage kostenlos testen',
      trustIndicator2: 'Keine Kreditkarte erforderlich',
      trustIndicator3: 'DSGVO-konform',

      // Dashboard Preview (für animated hero)
      showDashboardPreview: true,
      dashboardTitle: 'NICNOA Dashboard',
      dashboardSubtitle: 'Salon Overview',

      // Animation Settings
      animationEnabled: true,
      particlesEnabled: true,
      gradientColors: 'purple,pink,blue',

      // Scroll Indicator
      showScrollIndicator: true,
      scrollTargetId: 'testimonials',

      // SEO
      metaTitle: 'NICNOA – Die Salon-Space Management Plattform',
      metaDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces. Verwalten Sie Buchungen, Mietverträge und Finanzen.',
      ogImageUrl: null,

      // Sections Visibility
      showTestimonials: true,
      showPartners: true,
      showPricing: true,
      showFaq: true,
      showCta: true,
    },
  })

  console.log('✅ HomePage Config erstellt:', config.id)
}

main()
  .catch((e) => {
    console.error('❌ Fehler beim Seeden der HomePage Config:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })

