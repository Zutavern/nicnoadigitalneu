import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { FAQContent } from './faq-content'
import { getServerLocale, applyTranslations, applyConfigTranslations } from '@/lib/translation/apply-translations'

export const metadata: Metadata = {
  title: 'FAQ | nicnoa',
  description: 'Häufig gestellte Fragen zu NICNOA&CO.online - Antworten für Salonbesitzer und Stylisten',
}

// Revalidate every 5 minutes for fresh data
export const revalidate = 300

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  role: 'STYLIST' | 'SALON_OWNER'
  sortOrder: number
}

interface FAQPageConfig {
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  sectionTitle: string
  sectionDescription: string
  salonTabLabel: string
  stylistTabLabel: string
  contactText: string
  contactLinkText: string
  contactLinkUrl: string
}

async function getFAQs(): Promise<{ SALON_OWNER: FAQ[], STYLIST: FAQ[] }> {
  try {
    const [salonOwnerFaqs, stylistFaqs] = await Promise.all([
      prisma.fAQ.findMany({
        where: { isActive: true, role: 'SALON_OWNER' },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          question: true,
          answer: true,
          category: true,
          role: true,
          sortOrder: true,
        },
      }),
      prisma.fAQ.findMany({
        where: { isActive: true, role: 'STYLIST' },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          question: true,
          answer: true,
          category: true,
          role: true,
          sortOrder: true,
        },
      }),
    ])

    return {
      SALON_OWNER: salonOwnerFaqs as FAQ[],
      STYLIST: stylistFaqs as FAQ[],
    }
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return { SALON_OWNER: [], STYLIST: [] }
  }
}

async function getFAQPageConfig(): Promise<FAQPageConfig> {
  const defaultConfig: FAQPageConfig = {
    heroBadgeText: 'Häufig gestellte Fragen',
    heroTitle: 'Ihre Fragen beantwortet',
    heroDescription: 'Hier finden Sie Antworten auf die wichtigsten Fragen rund um NICNOA&CO.online',
    sectionTitle: 'Frequently Asked Questions',
    sectionDescription: 'Entdecken Sie schnelle und umfassende Antworten auf häufige Fragen zu unserer Plattform, Services und Features.',
    salonTabLabel: 'Für Salon-Space Betreiber',
    stylistTabLabel: 'Für Stuhlmieter',
    contactText: 'Können Sie nicht finden, wonach Sie suchen? Kontaktieren Sie unser',
    contactLinkText: 'Support-Team',
    contactLinkUrl: '/support',
  }

  try {
    const config = await prisma.fAQPageConfig.findFirst()
    if (config) {
      return {
        heroBadgeText: config.heroBadgeText || defaultConfig.heroBadgeText,
        heroTitle: config.heroTitle || defaultConfig.heroTitle,
        heroDescription: config.heroDescription || defaultConfig.heroDescription,
        sectionTitle: config.sectionTitle || defaultConfig.sectionTitle,
        sectionDescription: config.sectionDescription || defaultConfig.sectionDescription,
        salonTabLabel: config.salonTabLabel || defaultConfig.salonTabLabel,
        stylistTabLabel: config.stylistTabLabel || defaultConfig.stylistTabLabel,
        contactText: config.contactText || defaultConfig.contactText,
        contactLinkText: config.contactLinkText || defaultConfig.contactLinkText,
        contactLinkUrl: config.contactLinkUrl || defaultConfig.contactLinkUrl,
      }
    }
  } catch (error) {
    console.error('Error fetching FAQ page config:', error)
  }

  return defaultConfig
}

export default async function FAQPage() {
  // Aktuelle Sprache ermitteln
  const locale = await getServerLocale()
  
  // Daten werden parallel auf dem Server geladen - kein Wasserfall!
  const [faqs, config] = await Promise.all([
    getFAQs(),
    getFAQPageConfig(),
  ])

  // Übersetzungen anwenden
  const translatedFaqs = {
    SALON_OWNER: await applyTranslations(
      faqs.SALON_OWNER,
      'faq',
      locale,
      ['question', 'answer']
    ),
    STYLIST: await applyTranslations(
      faqs.STYLIST,
      'faq',
      locale,
      ['question', 'answer']
    ),
  }

  // Config ID für Übersetzungen ermitteln
  let configId = 'default'
  try {
    const dbConfig = await prisma.fAQPageConfig.findFirst({ select: { id: true } })
    if (dbConfig) configId = dbConfig.id
  } catch { /* ignore */ }

  const translatedConfig = await applyConfigTranslations(
    config,
    'faq_page_config',
    configId,
    locale,
    ['heroBadgeText', 'heroTitle', 'heroDescription', 'sectionTitle', 'sectionDescription', 'salonTabLabel', 'stylistTabLabel', 'contactText', 'contactLinkText']
  )

  return <FAQContent faqs={translatedFaqs} config={translatedConfig || config} />
}
