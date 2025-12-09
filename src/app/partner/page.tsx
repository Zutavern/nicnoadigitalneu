import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { PartnerContent } from './partner-content'

export const metadata: Metadata = {
  title: 'Partner | nicnoa',
  description: 'Unsere starken Partner für deinen Erfolg - Exklusive Vorteile für NICNOA&CO.online Mitglieder',
}

// Revalidate every 5 minutes for fresh data
export const revalidate = 300

interface Partner {
  id: string
  name: string
  slug: string
  category: string
  description: string
  offer: string
  code: string | null
  link: string
  isHighlight: boolean
}

interface PartnerPageConfig {
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  heroFeature1Text: string
  heroFeature2Text: string
  heroFeature3Text: string
  cardCtaText: string
  cardCtaLink: string
  cardCtaButtonText: string
  ctaTitle: string
  ctaDescription: string
  ctaButton1Text: string
  ctaButton1Link: string
  ctaButton2Text: string
  ctaButton2Link: string
}

async function getPartners(): Promise<Partner[]> {
  try {
    const partners = await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: [
        { isHighlight: 'desc' },
        { sortOrder: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        offer: true,
        code: true,
        link: true,
        isHighlight: true,
      },
    })

    return partners as Partner[]
  } catch (error) {
    console.error('Error fetching partners:', error)
    return []
  }
}

async function getPartnerPageConfig(): Promise<PartnerPageConfig> {
  const defaultConfig: PartnerPageConfig = {
    heroBadgeText: 'Starke Partnerschaften',
    heroTitle: 'Unsere Partner für deinen Erfolg',
    heroDescription: 'Wir arbeiten mit führenden Unternehmen zusammen, um dir die besten Tools, Systeme und Services für deinen Salon-Space zu bieten.',
    heroFeature1Text: 'Verifizierte Partner',
    heroFeature2Text: 'Exklusive Vorteile',
    heroFeature3Text: 'Nur für Mitglieder',
    cardCtaText: 'Exklusive Vorteile für NICNOA&CO.online Mitglieder',
    cardCtaLink: '/registrieren',
    cardCtaButtonText: 'Jetzt Mitglied werden',
    ctaTitle: 'Werde Teil unserer Community',
    ctaDescription: 'Als NICNOA&CO.online Mitglied profitierst du von exklusiven Partner-Deals, Rabatten und Sonderangeboten.',
    ctaButton1Text: 'Jetzt registrieren',
    ctaButton1Link: '/registrieren',
    ctaButton2Text: 'Preise ansehen',
    ctaButton2Link: '/preise',
  }

  try {
    const config = await prisma.partnerPageConfig.findFirst()
    if (config) {
      return {
        heroBadgeText: config.heroBadgeText || defaultConfig.heroBadgeText,
        heroTitle: config.heroTitle || defaultConfig.heroTitle,
        heroDescription: config.heroDescription || defaultConfig.heroDescription,
        heroFeature1Text: config.heroFeature1Text || defaultConfig.heroFeature1Text,
        heroFeature2Text: config.heroFeature2Text || defaultConfig.heroFeature2Text,
        heroFeature3Text: config.heroFeature3Text || defaultConfig.heroFeature3Text,
        cardCtaText: config.cardCtaText || defaultConfig.cardCtaText,
        cardCtaLink: config.cardCtaLink || defaultConfig.cardCtaLink,
        cardCtaButtonText: config.cardCtaButtonText || defaultConfig.cardCtaButtonText,
        ctaTitle: config.ctaTitle || defaultConfig.ctaTitle,
        ctaDescription: config.ctaDescription || defaultConfig.ctaDescription,
        ctaButton1Text: config.ctaButton1Text || defaultConfig.ctaButton1Text,
        ctaButton1Link: config.ctaButton1Link || defaultConfig.ctaButton1Link,
        ctaButton2Text: config.ctaButton2Text || defaultConfig.ctaButton2Text,
        ctaButton2Link: config.ctaButton2Link || defaultConfig.ctaButton2Link,
      }
    }
  } catch (error) {
    console.error('Error fetching partner page config:', error)
  }

  return defaultConfig
}

export default async function PartnerPage() {
  // Daten werden parallel auf dem Server geladen - kein Wasserfall!
  const [partners, config] = await Promise.all([
    getPartners(),
    getPartnerPageConfig(),
  ])

  return <PartnerContent partners={partners} config={config} />
}
