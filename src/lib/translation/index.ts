// Translation System - Main Exports

// Configuration
export * from './i18n-config'

// Translation Service
export { translateText, translateBatch, isLanguageSupported, getPreferredProvider } from './translation-service'
export type { TranslationResult, TranslationError } from './translation-service'

// Content Scanner
export { getTranslatableContent, TRANSLATABLE_FIELDS } from './content-scanner'
export type { TranslatableContent } from './content-scanner'

// Translation Tracker
export { 
  trackContentChanges, 
  withTranslationTracking,
  createContentHash,
  refreshTranslationsFor
} from './translation-tracker'

// SEO Utilities
export {
  generateHreflangTags,
  generateHreflangHtml,
  generateHreflangMetadata,
  generateCanonicalUrl,
  generateLanguageMetaTags,
  isLanguageActive,
  getDefaultLocale,
  getInactiveLocales,
} from './seo-utils'
export type { HreflangTag } from './seo-utils'

// Client-side Hooks - importiere direkt aus './use-translations' für Client-Komponenten
export { 
  useLocale, 
  LocaleProvider, 
  useTranslations, 
  useTranslatedText,
  getServerTranslations,
  t,
} from './use-translations'

// Server-side Translation Application
// HINWEIS: Für Server-Komponenten direkt aus './apply-translations' importieren:
// import { getServerLocale, applyTranslations } from '@/lib/translation/apply-translations'
export type { Locale } from './i18n-config'



