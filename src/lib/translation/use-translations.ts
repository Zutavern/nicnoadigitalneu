'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale, isValidLocale } from './i18n-config'

// Context für die aktuelle Sprache
interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  isLoading: true,
})

export function useLocale() {
  return useContext(LocaleContext)
}

// Provider Komponente
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [isLoading, setIsLoading] = useState(true)

  // Locale aus Cookie laden
  useEffect(() => {
    const savedLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
      ?.split('=')[1]

    if (savedLocale && isValidLocale(savedLocale)) {
      setLocaleState(savedLocale)
    } else {
      // Browser-Sprache nutzen
      const browserLang = navigator.language.split('-')[0]
      if (isValidLocale(browserLang)) {
        setLocaleState(browserLang)
      }
    }
    setIsLoading(false)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    // Cookie setzen (1 Jahr)
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
      {children}
    </LocaleContext.Provider>
  )
}

// Cache für Übersetzungen
const translationCache = new Map<string, Record<string, string>>()

// Hook zum Laden von Übersetzungen für einen Content-Typ
export function useTranslations(
  contentType: string,
  contentId: string
): {
  translations: Record<string, string>
  isLoading: boolean
  error: Error | null
  getTranslation: (field: string, fallback?: string) => string
} {
  const { locale } = useLocale()
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const cacheKey = `${contentType}:${contentId}:${locale}`

  useEffect(() => {
    // Bei Default-Locale keine Übersetzungen laden
    if (locale === DEFAULT_LOCALE) {
      setTranslations({})
      setIsLoading(false)
      return
    }

    // Aus Cache laden
    if (translationCache.has(cacheKey)) {
      setTranslations(translationCache.get(cacheKey)!)
      setIsLoading(false)
      return
    }

    // Von API laden
    const loadTranslations = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(
          `/api/translations?contentType=${contentType}&contentId=${contentId}&locale=${locale}`
        )

        if (!res.ok) {
          throw new Error('Failed to load translations')
        }

        const data = await res.json()
        const translationsMap: Record<string, string> = {}
        
        for (const t of data.translations) {
          translationsMap[t.field] = t.value
        }

        translationCache.set(cacheKey, translationsMap)
        setTranslations(translationsMap)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [contentType, contentId, locale, cacheKey])

  // Hilfsfunktion zum Abrufen einer Übersetzung mit Fallback
  const getTranslation = useCallback(
    (field: string, fallback?: string): string => {
      if (locale === DEFAULT_LOCALE) {
        return fallback || ''
      }
      return translations[field] || fallback || ''
    },
    [locale, translations]
  )

  return { translations, isLoading, error, getTranslation }
}

// Hook für einzelnen übersetzten Text
export function useTranslatedText(
  contentType: string,
  contentId: string,
  field: string,
  defaultText: string
): string {
  const { getTranslation, isLoading } = useTranslations(contentType, contentId)
  
  if (isLoading) {
    return defaultText
  }
  
  return getTranslation(field, defaultText)
}

// Server-seitige Funktion zum Abrufen von Übersetzungen
export async function getServerTranslations(
  contentType: string,
  contentId: string,
  locale: Locale
): Promise<Record<string, string>> {
  if (locale === DEFAULT_LOCALE) {
    return {}
  }

  try {
    // Dynamischer Import von prisma für Server-Seite
    const { prisma } = await import('@/lib/prisma')

    const translations = await prisma.translation.findMany({
      where: {
        contentType,
        contentId,
        languageId: locale,
        status: 'TRANSLATED',
      },
      select: {
        field: true,
        value: true,
      },
    })

    const result: Record<string, string> = {}
    for (const t of translations) {
      result[t.field] = t.value
    }

    return result
  } catch (error) {
    console.error('Error fetching server translations:', error)
    return {}
  }
}

// Hilfsfunktion: Text mit Übersetzung oder Fallback
export function t(
  translations: Record<string, string>,
  field: string,
  fallback: string
): string {
  return translations[field] || fallback
}




