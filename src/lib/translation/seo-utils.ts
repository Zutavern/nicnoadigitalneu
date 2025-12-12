import { prisma } from '@/lib/prisma'
import { DEFAULT_LOCALE, type Locale } from './i18n-config'

// Cache für aktive Sprachen
let cachedActiveLanguages: { id: string; isDefault: boolean }[] | null = null
let cacheTime = 0
const CACHE_DURATION = 60000 // 1 Minute

async function getActiveLanguages() {
  const now = Date.now()
  if (cachedActiveLanguages && now - cacheTime < CACHE_DURATION) {
    return cachedActiveLanguages
  }

  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      select: { id: true, isDefault: true },
      orderBy: { sortOrder: 'asc' },
    })
    cachedActiveLanguages = languages
    cacheTime = now
    return languages
  } catch (error) {
    console.warn('Error fetching active languages:', error)
    return [{ id: DEFAULT_LOCALE, isDefault: true }]
  }
}

// hreflang-Tags generieren
export interface HreflangTag {
  hreflang: string
  href: string
}

export async function generateHreflangTags(
  pagePath: string,
  baseUrl = 'https://nicnoa.de'
): Promise<HreflangTag[]> {
  const languages = await getActiveLanguages()
  
  if (languages.length <= 1) {
    // Nur eine Sprache aktiv, keine hreflang nötig
    return []
  }

  const tags: HreflangTag[] = []
  const defaultLang = languages.find(l => l.isDefault) || languages[0]

  for (const lang of languages) {
    // URL mit Sprach-Präfix
    const href = lang.isDefault
      ? `${baseUrl}${pagePath}`
      : `${baseUrl}/${lang.id}${pagePath}`

    tags.push({
      hreflang: lang.id,
      href,
    })
  }

  // x-default Tag (zeigt auf die Default-Sprache)
  tags.push({
    hreflang: 'x-default',
    href: `${baseUrl}${pagePath}`,
  })

  return tags
}

// hreflang-Tags als HTML-String
export async function generateHreflangHtml(
  pagePath: string,
  baseUrl = 'https://nicnoa.de'
): Promise<string> {
  const tags = await generateHreflangTags(pagePath, baseUrl)
  
  return tags
    .map(tag => `<link rel="alternate" hreflang="${tag.hreflang}" href="${tag.href}" />`)
    .join('\n')
}

// hreflang-Tags als Next.js Metadata format
export async function generateHreflangMetadata(
  pagePath: string,
  baseUrl = 'https://nicnoa.de'
): Promise<Record<string, string>> {
  const tags = await generateHreflangTags(pagePath, baseUrl)
  
  const alternates: Record<string, string> = {}
  for (const tag of tags) {
    if (tag.hreflang !== 'x-default') {
      alternates[tag.hreflang] = tag.href
    }
  }
  
  return alternates
}

// Canonical URL generieren
export function generateCanonicalUrl(
  pagePath: string,
  locale: Locale = DEFAULT_LOCALE,
  baseUrl = 'https://nicnoa.de'
): string {
  if (locale === DEFAULT_LOCALE) {
    return `${baseUrl}${pagePath}`
  }
  return `${baseUrl}/${locale}${pagePath}`
}

// Meta-Tags für Sprache
export function generateLanguageMetaTags(locale: Locale = DEFAULT_LOCALE): {
  lang: string
  ogLocale: string
} {
  const localeMap: Record<string, string> = {
    de: 'de_DE',
    en: 'en_GB',
    fr: 'fr_FR',
    es: 'es_ES',
    it: 'it_IT',
    pt: 'pt_PT',
    nl: 'nl_NL',
    pl: 'pl_PL',
    cs: 'cs_CZ',
    sv: 'sv_SE',
    da: 'da_DK',
    fi: 'fi_FI',
    no: 'nb_NO',
    el: 'el_GR',
    hu: 'hu_HU',
    ro: 'ro_RO',
    bg: 'bg_BG',
    hr: 'hr_HR',
    sk: 'sk_SK',
    sl: 'sl_SI',
    et: 'et_EE',
    lv: 'lv_LV',
    lt: 'lt_LT',
  }

  return {
    lang: locale,
    ogLocale: localeMap[locale] || `${locale}_${locale.toUpperCase()}`,
  }
}

// Prüfen ob Sprache aktiv ist (für 301 Redirects)
export async function isLanguageActive(locale: string): Promise<boolean> {
  try {
    const language = await prisma.language.findUnique({
      where: { id: locale },
      select: { isActive: true },
    })
    return language?.isActive ?? false
  } catch {
    return locale === DEFAULT_LOCALE
  }
}

// Default-Sprache ermitteln
export async function getDefaultLocale(): Promise<Locale> {
  try {
    const defaultLang = await prisma.language.findFirst({
      where: { isDefault: true, isActive: true },
      select: { id: true },
    })
    return (defaultLang?.id as Locale) || DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

// Inaktive Sprachen für Redirects
export async function getInactiveLocales(): Promise<string[]> {
  try {
    const inactive = await prisma.language.findMany({
      where: { isActive: false },
      select: { id: true },
    })
    return inactive.map(l => l.id)
  } catch {
    return []
  }
}

