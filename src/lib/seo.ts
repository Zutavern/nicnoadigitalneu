import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

// Cache für die globale SEO-Konfiguration (1 Minute)
let cachedConfig: GlobalSeoConfig | null = null
let cacheTime: number = 0
const CACHE_DURATION = 60 * 1000 // 1 Minute

export interface GlobalSeoConfig {
  siteName: string
  titleSuffix: string | null
  defaultMetaDescription: string | null
  defaultOgImage: string | null
  twitterHandle: string | null
  facebookAppId: string | null
  googleSiteVerification: string | null
  bingSiteVerification: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  organizationName: string | null
  organizationLogo: string | null
  organizationAddress: string | null
  organizationPhone: string | null
  organizationEmail: string | null
}

const defaultGlobalConfig: GlobalSeoConfig = {
  siteName: 'NICNOA&CO.online',
  titleSuffix: ' | NICNOA&CO.online',
  defaultMetaDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces.',
  defaultOgImage: null,
  twitterHandle: null,
  facebookAppId: null,
  googleSiteVerification: null,
  bingSiteVerification: null,
  robotsIndex: true,
  robotsFollow: true,
  organizationName: 'NICNOA GmbH',
  organizationLogo: null,
  organizationAddress: null,
  organizationPhone: null,
  organizationEmail: 'info@nicnoa.de',
}

/**
 * Lädt die globale SEO-Konfiguration (mit Caching)
 */
export async function getGlobalSeoConfig(): Promise<GlobalSeoConfig> {
  const now = Date.now()
  
  // Prüfe Cache
  if (cachedConfig && now - cacheTime < CACHE_DURATION) {
    return cachedConfig
  }

  try {
    // Prüfe ob das Model existiert (für Build-Zeit / Cold-Start)
    if (!prisma?.globalSeoConfig) {
      console.warn('GlobalSeoConfig model not available yet')
      return defaultGlobalConfig
    }

    const config = await prisma.globalSeoConfig.findUnique({
      where: { id: 'default' },
    })

    if (config) {
      cachedConfig = {
        siteName: config.siteName,
        titleSuffix: config.titleSuffix,
        defaultMetaDescription: config.defaultMetaDescription,
        defaultOgImage: config.defaultOgImage,
        twitterHandle: config.twitterHandle,
        facebookAppId: config.facebookAppId,
        googleSiteVerification: config.googleSiteVerification,
        bingSiteVerification: config.bingSiteVerification,
        robotsIndex: config.robotsIndex,
        robotsFollow: config.robotsFollow,
        organizationName: config.organizationName,
        organizationLogo: config.organizationLogo,
        organizationAddress: config.organizationAddress,
        organizationPhone: config.organizationPhone,
        organizationEmail: config.organizationEmail,
      }
      cacheTime = now
      return cachedConfig
    }
  } catch (error) {
    console.warn('Error fetching global SEO config (using defaults):', error)
  }

  return defaultGlobalConfig
}

/**
 * Generiert die Root-Metadata für das Layout
 */
export async function generateRootMetadata(): Promise<Metadata> {
  const globalSeo = await getGlobalSeoConfig()

  return {
    title: {
      default: globalSeo.siteName,
      template: `%s${globalSeo.titleSuffix || ''}`,
    },
    description: globalSeo.defaultMetaDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nicnoa.de'),
    openGraph: {
      type: 'website',
      siteName: globalSeo.siteName,
      locale: 'de_DE',
      images: globalSeo.defaultOgImage ? [{ url: globalSeo.defaultOgImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      site: globalSeo.twitterHandle || undefined,
    },
    robots: {
      index: globalSeo.robotsIndex,
      follow: globalSeo.robotsFollow,
    },
    verification: {
      google: globalSeo.googleSiteVerification || undefined,
      other: globalSeo.bingSiteVerification
        ? { 'msvalidate.01': globalSeo.bingSiteVerification }
        : undefined,
    },
    other: globalSeo.facebookAppId
      ? { 'fb:app_id': globalSeo.facebookAppId }
      : undefined,
  }
}

/**
 * Generiert JSON-LD Structured Data für die Organisation
 */
export async function generateOrganizationJsonLd(): Promise<object | null> {
  const globalSeo = await getGlobalSeoConfig()

  if (!globalSeo.organizationName) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: globalSeo.organizationName,
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://nicnoa.de',
    logo: globalSeo.organizationLogo || undefined,
    contactPoint: globalSeo.organizationEmail || globalSeo.organizationPhone
      ? {
          '@type': 'ContactPoint',
          email: globalSeo.organizationEmail || undefined,
          telephone: globalSeo.organizationPhone || undefined,
        }
      : undefined,
    address: globalSeo.organizationAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: globalSeo.organizationAddress,
        }
      : undefined,
  }
}

/**
 * Helper: Erstellt Seiten-spezifische Metadata
 */
export function createPageMetadata(options: {
  title: string
  description?: string | null
  ogImage?: string | null
  noIndex?: boolean
}): Metadata {
  return {
    title: options.title,
    description: options.description || undefined,
    openGraph: options.ogImage
      ? { images: [{ url: options.ogImage }] }
      : undefined,
    robots: options.noIndex
      ? { index: false, follow: false }
      : undefined,
  }
}

