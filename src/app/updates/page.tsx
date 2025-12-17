import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { UpdatesContent } from './updates-content'

// Revalidate every 5 minutes
export const revalidate = 300

interface ChangelogEntry {
  id: string
  date: Date
  category: string
  icon: string
  title: string
  description: string
  isHighlight: boolean
}

interface UpdatesPageData {
  heroBadgeText: string | null
  heroTitle: string
  heroTitleHighlight: string | null
  heroDescription: string | null
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  ctaButtonLink: string | null
  metaTitle: string | null
  metaDescription: string | null
  entries: ChangelogEntry[]
}

async function getUpdatesPageData(): Promise<UpdatesPageData> {
  const [config, entries] = await Promise.all([
    prisma.updatesPageConfig.findUnique({
      where: { id: 'default' },
    }),
    prisma.changelogEntry.findMany({
      where: { isActive: true },
      orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }],
    }),
  ])

  if (!config) {
    return {
      ...getDefaultConfig(),
      entries,
    }
  }

  return {
    ...config,
    entries,
  }
}

function getDefaultConfig() {
  return {
    heroBadgeText: 'Neueste Updates',
    heroTitle: 'Stetige Verbesserungen für Ihren Salon-Space',
    heroTitleHighlight: 'Salon-Space',
    heroDescription: 'Entdecken Sie unsere neuesten Entwicklungen und Verbesserungen.',
    ctaTitle: 'Bleiben Sie auf dem Laufenden',
    ctaDescription: 'Abonnieren Sie unseren Newsletter.',
    ctaButtonText: 'Newsletter abonnieren',
    ctaButtonLink: '#newsletter',
    metaTitle: 'Updates | NICNOA',
    metaDescription: 'Entdecken Sie die neuesten Updates und Verbesserungen der NICNOA Plattform.',
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getUpdatesPageData()

  const title = data.metaTitle || 'Updates | NICNOA'
  const description = data.metaDescription || data.heroDescription || 
    'Entdecken Sie die neuesten Updates und Verbesserungen der NICNOA Plattform.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://nicnoa.online/updates',
      siteName: 'NICNOA',
      images: [
        {
          url: 'https://nicnoa.online/og-updates.png',
          width: 1200,
          height: 630,
          alt: 'NICNOA Updates',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://nicnoa.online/og-updates.png'],
    },
    alternates: {
      canonical: 'https://nicnoa.online/updates',
    },
  }
}

export default async function UpdatesPage() {
  const data = await getUpdatesPageData()

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.metaTitle || 'Updates | NICNOA',
    description: data.metaDescription || data.heroDescription,
    url: 'https://nicnoa.online/updates',
    publisher: {
      '@type': 'Organization',
      name: 'NICNOA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nicnoa.online/logo.png',
      },
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'NICNOA Changelog',
      description: 'Alle Updates und Verbesserungen der NICNOA Plattform',
      numberOfItems: data.entries.length,
      itemListElement: data.entries.slice(0, 10).map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          headline: entry.title,
          description: entry.description,
          datePublished: entry.date,
          articleSection: entry.category,
        },
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UpdatesContent data={data} />
    </>
  )
}
