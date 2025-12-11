import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { isOpenRouterEnabled, translateViaOpenRouter } from '@/lib/openrouter'

// Cache für API-Keys (um nicht bei jeder Übersetzung die DB abzufragen)
interface ApiKeysCache {
  deeplApiKey: string | null
  openaiApiKey: string | null
  translationProvider: string | null
  openRouterEnabled: boolean
}
let cachedApiKeys: ApiKeysCache | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 Minuten Cache

async function getApiKeys(): Promise<ApiKeysCache> {
  const now = Date.now()
  if (cachedApiKeys && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedApiKeys
  }

  const [settings, openRouterActive] = await Promise.all([
    prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: {
        deeplApiKey: true,
        openaiApiKey: true,
        translationProvider: true,
      }
    }),
    isOpenRouterEnabled(),
  ])

  cachedApiKeys = {
    deeplApiKey: settings?.deeplApiKey || process.env.DEEPL_API_KEY || null,
    openaiApiKey: settings?.openaiApiKey || process.env.OPENAI_API_KEY || null,
    translationProvider: settings?.translationProvider || 'auto',
    openRouterEnabled: openRouterActive,
  }
  cacheTimestamp = now

  return cachedApiKeys
}

// Cache leeren (z.B. nach Einstellungsänderung)
export function clearTranslationApiCache() {
  cachedApiKeys = null
  cacheTimestamp = 0
}

// DeepL Language Codes Mapping
// null = nicht von DeepL unterstützt, Fallback zu OpenAI
const DEEPL_LANGUAGE_MAP: Record<string, string | null> = {
  // Westeuropa
  'de': 'DE',
  'en': 'EN-GB',
  'fr': 'FR',
  'es': 'ES',
  'it': 'IT',
  'pt': 'PT-PT',
  'nl': 'NL',
  // Nordeuropa
  'sv': 'SV',
  'da': 'DA',
  'fi': 'FI',
  'no': 'NB', // Norwegian Bokmål
  // Osteuropa
  'pl': 'PL',
  'cs': 'CS',
  'sk': 'SK',
  'hu': 'HU',
  'ro': 'RO',
  'bg': 'BG',
  'sl': 'SL',
  'et': 'ET',
  'lv': 'LV',
  'lt': 'LT',
  'uk': 'UK', // Ukrainisch
  // Südosteuropa
  'el': 'EL',
  'hr': null, // Kroatisch - nicht von DeepL unterstützt
  // Osteuropa/Asien
  'ru': 'RU',
  'tr': 'TR',
  // Asien
  'zh': 'ZH', // Chinesisch (vereinfacht)
  'ja': 'JA',
  'ko': 'KO',
  'id': 'ID', // Indonesisch
  // Naher Osten
  'ar': 'AR',
  // Sprachen nur via OpenAI (nicht von DeepL unterstützt)
  'th': null, // Thai
  'vi': null, // Vietnamesisch
  'he': null, // Hebräisch
  'fa': null, // Persisch
  'hi': null, // Hindi
}

// OpenAI Language Names für bessere Übersetzungen
const LANGUAGE_NAMES: Record<string, string> = {
  // Westeuropa
  'de': 'German',
  'en': 'English',
  'fr': 'French',
  'es': 'Spanish',
  'it': 'Italian',
  'pt': 'Portuguese',
  'nl': 'Dutch',
  // Nordeuropa
  'sv': 'Swedish',
  'da': 'Danish',
  'fi': 'Finnish',
  'no': 'Norwegian',
  // Osteuropa
  'pl': 'Polish',
  'cs': 'Czech',
  'sk': 'Slovak',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'uk': 'Ukrainian',
  // Südosteuropa
  'el': 'Greek',
  'hr': 'Croatian',
  // Osteuropa/Asien
  'ru': 'Russian',
  'tr': 'Turkish',
  // Asien
  'zh': 'Chinese (Simplified)',
  'ja': 'Japanese',
  'ko': 'Korean',
  'id': 'Indonesian',
  'th': 'Thai',
  'vi': 'Vietnamese',
  // Naher Osten
  'ar': 'Arabic',
  'he': 'Hebrew',
  'fa': 'Persian',
  // Südasien
  'hi': 'Hindi',
}

export interface TranslationResult {
  translatedText: string
  provider: 'deepl' | 'openai'
  charactersUsed: number
}

export interface TranslationError extends Error {
  provider: 'deepl' | 'openai'
  statusCode?: number
}

// DeepL API aufrufen
async function translateWithDeepL(
  text: string,
  targetLang: string,
  apiKey: string
): Promise<TranslationResult> {
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY not configured')
  }

  const deeplLang = DEEPL_LANGUAGE_MAP[targetLang]
  
  if (!deeplLang) {
    throw new Error(`Language ${targetLang} not supported by DeepL`)
  }

  // DeepL API URL (Free vs Pro)
  const apiUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: deeplLang,
      source_lang: 'DE', // Quellsprache ist immer Deutsch
      preserve_formatting: true,
    }),
  })

  if (!response.ok) {
    const error = new Error(`DeepL API error: ${response.status}`) as TranslationError
    error.provider = 'deepl'
    error.statusCode = response.status
    throw error
  }

  const data = await response.json()
  const translatedText = data.translations?.[0]?.text

  if (!translatedText) {
    throw new Error('No translation returned from DeepL')
  }

  return {
    translatedText,
    provider: 'deepl',
    charactersUsed: text.length,
  }
}

// OpenAI GPT für Übersetzung (direkt oder via OpenRouter)
async function translateWithOpenAI(
  text: string,
  targetLang: string,
  apiKey: string,
  useOpenRouter: boolean = false
): Promise<TranslationResult> {
  const languageName = LANGUAGE_NAMES[targetLang] || targetLang

  // Wenn OpenRouter aktiviert ist, nutze OpenRouter
  if (useOpenRouter) {
    try {
      const translatedText = await translateViaOpenRouter(
        text,
        languageName,
        'German',
        { requestType: 'translation' }
      )
      
      return {
        translatedText,
        provider: 'openrouter',
        charactersUsed: text.length,
      }
    } catch (error) {
      console.warn('[Translation] OpenRouter failed, falling back to direct OpenAI:', error)
      // Fallback zu direkter OpenAI API wenn OpenRouter fehlschlägt
      if (!apiKey) {
        throw error // Wenn kein direkter API-Key, Fehler werfen
      }
    }
  }

  // Direkte OpenAI API
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const openai = new OpenAI({ apiKey })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the following German text to ${languageName}.
Maintain the original tone, style, and formatting.
If there are technical terms, brand names, or proper nouns, keep them as is.
Only output the translated text, nothing else.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.3, // Niedrige Temperatur für konsistentere Übersetzungen
    max_tokens: Math.max(text.length * 2, 500), // Genug Platz für längere Zielsprachen
  })

  const translatedText = response.choices[0]?.message?.content?.trim()

  if (!translatedText) {
    throw new Error('No translation returned from OpenAI')
  }

  return {
    translatedText,
    provider: 'openai',
    charactersUsed: text.length,
  }
}

// Hauptfunktion: Übersetzen mit Fallback
export async function translateText(
  text: string,
  targetLang: string
): Promise<TranslationResult> {
  // Leere Texte nicht übersetzen
  if (!text || text.trim().length === 0) {
    return {
      translatedText: text,
      provider: 'deepl',
      charactersUsed: 0,
    }
  }

  // API-Keys aus DB oder Umgebung laden
  const { deeplApiKey, openaiApiKey, translationProvider, openRouterEnabled } = await getApiKeys()

  // Prüfen ob überhaupt ein Key konfiguriert ist
  if (!deeplApiKey && !openaiApiKey && !openRouterEnabled) {
    throw new Error('Keine Übersetzungs-API konfiguriert. Bitte unter Einstellungen > Übersetzungen oder OpenRouter konfigurieren.')
  }

  // Wenn DeepL die Sprache nicht unterstützt, direkt zu OpenAI/OpenRouter
  if (DEEPL_LANGUAGE_MAP[targetLang] === null) {
    if (!openaiApiKey && !openRouterEnabled) {
      throw new Error(`Sprache ${targetLang} wird nur von OpenAI/OpenRouter unterstützt, aber keines konfiguriert.`)
    }
    console.log(`[Translation] Using ${openRouterEnabled ? 'OpenRouter' : 'OpenAI'} for ${targetLang} (not supported by DeepL)`)
    return translateWithOpenAI(text, targetLang, openaiApiKey || '', openRouterEnabled)
  }

  // Provider-Auswahl basierend auf Einstellung
  const useDeepL = translationProvider === 'deepl' || (translationProvider === 'auto' && deeplApiKey)

  // Versuche zuerst DeepL (wenn konfiguriert und bevorzugt)
  if (useDeepL && deeplApiKey) {
    try {
      const result = await translateWithDeepL(text, targetLang, deeplApiKey)
      console.log(`[Translation] DeepL: ${text.substring(0, 50)}... → ${targetLang}`)
      return result
    } catch (error) {
      console.warn(`[Translation] DeepL failed, falling back to OpenAI/OpenRouter:`, error)
    }
  }

  // Fallback zu OpenAI/OpenRouter
  if (openaiApiKey || openRouterEnabled) {
    try {
      const result = await translateWithOpenAI(text, targetLang, openaiApiKey || '', openRouterEnabled)
      console.log(`[Translation] ${openRouterEnabled ? 'OpenRouter' : 'OpenAI'}: ${text.substring(0, 50)}... → ${targetLang}`)
      return result
    } catch (error) {
      console.error(`[Translation] ${openRouterEnabled ? 'OpenRouter' : 'OpenAI'} also failed:`, error)
      throw error
    }
  }

  throw new Error('Kein funktionierender Übersetzungsdienst verfügbar.')
}

// Batch-Übersetzung für mehrere Texte
export async function translateBatch(
  items: { text: string; id: string }[],
  targetLang: string,
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, TranslationResult>> {
  const results = new Map<string, TranslationResult>()
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    
    try {
      const result = await translateText(item.text, targetLang)
      results.set(item.id, result)
    } catch (error) {
      console.error(`[Translation] Failed for item ${item.id}:`, error)
      // Fehler markieren, aber weitermachen
      results.set(item.id, {
        translatedText: '',
        provider: 'deepl',
        charactersUsed: 0,
      })
    }
    
    if (onProgress) {
      onProgress(i + 1, items.length)
    }
    
    // Rate Limiting: Kurze Pause zwischen Anfragen
    if (i < items.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}

// Hilfsfunktion: Prüfen ob Sprache unterstützt wird
export function isLanguageSupported(langCode: string): boolean {
  return langCode in LANGUAGE_NAMES
}

// Hilfsfunktion: Provider für Sprache ermitteln
export async function getPreferredProvider(langCode: string): Promise<'deepl' | 'openai'> {
  if (DEEPL_LANGUAGE_MAP[langCode] === null) {
    return 'openai'
  }
  const { deeplApiKey, translationProvider } = await getApiKeys()
  
  if (translationProvider === 'openai') return 'openai'
  if (translationProvider === 'deepl') return 'deepl'
  
  // Auto: DeepL bevorzugt wenn Key vorhanden
  return deeplApiKey ? 'deepl' : 'openai'
}

// Hilfsfunktion: API-Status prüfen
export async function getTranslationApiStatus(): Promise<{
  deeplConfigured: boolean
  openaiConfigured: boolean
  provider: string
}> {
  const { deeplApiKey, openaiApiKey, translationProvider } = await getApiKeys()
  return {
    deeplConfigured: !!deeplApiKey,
    openaiConfigured: !!openaiApiKey,
    provider: translationProvider || 'auto',
  }
}
