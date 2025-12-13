// Server-seitige Funktion zum Anwenden von Übersetzungen auf Content
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale, isValidLocale } from './i18n-config'

/**
 * Ermittelt die aktuelle Locale aus den Cookies (Server-seitig)
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)
    
    if (localeCookie?.value && isValidLocale(localeCookie.value)) {
      return localeCookie.value as Locale
    }
  } catch {
    // Cookies nicht verfügbar (z.B. während Build)
  }
  
  return DEFAULT_LOCALE
}

/**
 * Lädt Übersetzungen für mehrere Content-Items
 */
export async function getTranslationsForItems(
  contentType: string,
  contentIds: string[],
  locale: Locale
): Promise<Map<string, Record<string, string>>> {
  if (locale === DEFAULT_LOCALE || contentIds.length === 0) {
    return new Map()
  }

  try {
    const translations = await prisma.translation.findMany({
      where: {
        contentType,
        contentId: { in: contentIds },
        languageId: locale,
        status: 'TRANSLATED',
      },
      select: {
        contentId: true,
        field: true,
        value: true,
      },
    })

    // Gruppiere nach contentId
    const result = new Map<string, Record<string, string>>()
    
    for (const t of translations) {
      if (!result.has(t.contentId)) {
        result.set(t.contentId, {})
      }
      result.get(t.contentId)![t.field] = t.value
    }

    return result
  } catch (error) {
    console.error('Error loading translations:', error)
    return new Map()
  }
}

/**
 * Wendet Übersetzungen auf ein Array von Items an
 * @param items - Array von Items mit id-Feld
 * @param contentType - Der Content-Typ (z.B. 'testimonial', 'faq')
 * @param locale - Die Ziel-Sprache
 * @param fields - Die zu übersetzenden Felder
 */
export async function applyTranslations<T extends { id: string }>(
  items: T[],
  contentType: string,
  locale: Locale,
  fields: (keyof T)[]
): Promise<T[]> {
  if (locale === DEFAULT_LOCALE || items.length === 0) {
    return items
  }

  const contentIds = items.map(item => item.id)
  const translations = await getTranslationsForItems(contentType, contentIds, locale)

  return items.map(item => {
    const itemTranslations = translations.get(item.id)
    if (!itemTranslations) {
      return item
    }

    const translatedItem = { ...item }
    for (const field of fields) {
      const fieldName = field as string
      if (itemTranslations[fieldName]) {
        (translatedItem as Record<string, unknown>)[fieldName] = itemTranslations[fieldName]
      }
    }

    return translatedItem
  })
}

/**
 * Lädt Übersetzungen für ein einzelnes Config-Objekt
 */
export async function applyConfigTranslations<T extends Record<string, unknown>>(
  config: T | null,
  contentType: string,
  contentId: string,
  locale: Locale,
  fields: (keyof T)[]
): Promise<T | null> {
  if (!config || locale === DEFAULT_LOCALE) {
    return config
  }

  try {
    const translations = await prisma.translation.findMany({
      where: {
        contentType,
        contentId,
        languageId: locale,
        status: 'TRANSLATED',
        field: { in: fields.map(f => f as string) },
      },
      select: {
        field: true,
        value: true,
      },
    })

    if (translations.length === 0) {
      return config
    }

    const translatedConfig = { ...config }
    for (const t of translations) {
      if (t.field in translatedConfig) {
        (translatedConfig as Record<string, unknown>)[t.field] = t.value
      }
    }

    return translatedConfig
  } catch (error) {
    console.error('Error loading config translations:', error)
    return config
  }
}


