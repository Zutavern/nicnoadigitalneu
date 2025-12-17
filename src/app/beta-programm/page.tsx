import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { BetaProgrammContent } from './beta-content'

// Revalidate every 5 minutes
export const revalidate = 300

interface BetaPageData {
  heroBadgeText: string | null
  heroTitle: string
  heroTitleHighlight: string | null
  heroDescription: string | null
  heroCtaPrimaryText: string | null
  heroCtaPrimaryLink: string | null
  heroCtaSecondaryText: string | null
  heroCtaSecondaryLink: string | null
  requirementsTitle: string | null
  requirementsDescription: string | null
  timelineTitle: string | null
  timelineDescription: string | null
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  ctaButtonLink: string | null
  metaTitle: string | null
  metaDescription: string | null
  benefits: Array<{
    id: string
    icon: string
    title: string
    description: string
  }>
  requirements: Array<{
    id: string
    text: string
  }>
  timelineItems: Array<{
    id: string
    date: string
    title: string
    description: string
  }>
}

async function getBetaPageData(): Promise<BetaPageData> {
  const config = await prisma.betaPageConfig.findUnique({
    where: { id: 'default' },
    include: {
      benefits: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, icon: true, title: true, description: true },
      },
      requirements: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, text: true },
      },
      timelineItems: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, date: true, title: true, description: true },
      },
    },
  })

  if (!config) {
    return getDefaultData()
  }

  return config
}

function getDefaultData(): BetaPageData {
  return {
    heroBadgeText: 'Start in Q2 2025',
    heroTitle: 'Gestalten Sie die Zukunft des Salon-Managements',
    heroTitleHighlight: 'Salon-Managements',
    heroDescription: 'Werden Sie einer von nur 5 exklusiven Beta-Testern und profitieren Sie von einzigartigen Vorteilen.',
    heroCtaPrimaryText: 'Jetzt bewerben',
    heroCtaPrimaryLink: '#bewerbung',
    heroCtaSecondaryText: 'Mehr erfahren',
    heroCtaSecondaryLink: '#vorteile',
    requirementsTitle: 'Anforderungen',
    requirementsDescription: 'Wir suchen innovative Salon-Betreiber.',
    timelineTitle: 'Beta-Programm Timeline',
    timelineDescription: 'Ein strukturierter Fahrplan.',
    ctaTitle: 'Bereit für die Zukunft?',
    ctaDescription: 'Sichern Sie sich jetzt einen der exklusiven Beta-Tester Plätze.',
    ctaButtonText: 'Beta-Bewerbung starten',
    ctaButtonLink: '#bewerbung',
    metaTitle: 'Beta-Programm | NICNOA',
    metaDescription: 'Werden Sie Beta-Tester und gestalten Sie die Zukunft des Salon-Managements mit.',
    benefits: [],
    requirements: [],
    timelineItems: [],
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getBetaPageData()

  const title = data.metaTitle || `Beta-Programm | NICNOA`
  const description = data.metaDescription || data.heroDescription || 
    'Werden Sie Beta-Tester und gestalten Sie die Zukunft des Salon-Managements mit NICNOA.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://nicnoa.online/beta-programm',
      siteName: 'NICNOA',
      images: [
        {
          url: 'https://nicnoa.online/og-beta.png',
          width: 1200,
          height: 630,
          alt: 'NICNOA Beta-Programm',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://nicnoa.online/og-beta.png'],
    },
    alternates: {
      canonical: 'https://nicnoa.online/beta-programm',
    },
  }
}

export default async function BetaProgrammPage() {
  const data = await getBetaPageData()

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.metaTitle || 'Beta-Programm | NICNOA',
    description: data.metaDescription || data.heroDescription,
    url: 'https://nicnoa.online/beta-programm',
    publisher: {
      '@type': 'Organization',
      name: 'NICNOA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nicnoa.online/logo.png',
      },
    },
    mainEntity: {
      '@type': 'Product',
      name: 'NICNOA Beta-Programm',
      description: data.heroDescription,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/LimitedAvailability',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BetaProgrammContent data={data} />
    </>
  )
}
