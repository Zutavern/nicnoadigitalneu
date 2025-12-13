// i18n Konfiguration

export const DEFAULT_LOCALE = 'de'
export const FALLBACK_LOCALE = 'en' // Englisch als Fallback wenn Browser-Sprache nicht verfügbar

export const SUPPORTED_LOCALES = [
  'de', 'en', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'cs', 'sv',
  'da', 'fi', 'no', 'el', 'hu', 'ro', 'bg', 'hr', 'sk', 'sl',
  'et', 'lv', 'lt'
] as const

export type Locale = typeof SUPPORTED_LOCALES[number]

// Cookie Name für Sprachpräferenz
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'

// Locale aus verschiedenen Quellen ermitteln
export function getLocaleFromHeaders(headers: Headers): Locale {
  // 1. Cookie prüfen
  const cookieHeader = headers.get('cookie')
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${LOCALE_COOKIE_NAME}=([^;]+)`))
    if (match && isValidLocale(match[1])) {
      return match[1] as Locale
    }
  }

  // 2. Accept-Language Header
  const acceptLanguage = headers.get('accept-language')
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => {
      const [code, priority] = lang.trim().split(';q=')
      return {
        code: code.split('-')[0].toLowerCase(),
        priority: priority ? parseFloat(priority) : 1
      }
    })

    languages.sort((a, b) => b.priority - a.priority)

    for (const lang of languages) {
      if (isValidLocale(lang.code)) {
        return lang.code as Locale
      }
    }
  }

  // Fallback: Englisch (wenn Browser-Sprache nicht verfügbar)
  return FALLBACK_LOCALE as Locale
}

// Prüfen ob Locale gültig ist
export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale)
}

// Locale aus URL-Pfad extrahieren (für zukünftige URL-basierte Lokalisierung)
export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/')
  const firstSegment = segments[1]
  
  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment as Locale
  }
  
  return null
}

// Pfad ohne Locale-Präfix
export function removeLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname)
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/'
  }
  return pathname
}

// Pfad mit Locale-Präfix
export function addLocaleToPath(pathname: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) {
    return pathname
  }
  return `/${locale}${pathname}`
}



