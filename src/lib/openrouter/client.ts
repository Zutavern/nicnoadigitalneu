import { prisma } from '@/lib/prisma'
import { 
  OpenRouterRequest, 
  OpenRouterResponse, 
  OpenRouterMessage,
  MODEL_PRICING 
} from './types'
import { logAIUsage } from './usage-tracker'

// Cache für OpenRouter-Konfiguration
interface OpenRouterConfigCache {
  apiKey: string | null
  enabled: boolean
  defaultModel: string
  siteUrl: string | null
  siteName: string | null
}

let configCache: OpenRouterConfigCache | null = null
let configCacheTimestamp = 0
const CONFIG_CACHE_TTL = 5 * 60 * 1000 // 5 Minuten

/**
 * Lädt die OpenRouter-Konfiguration aus der Datenbank
 */
async function getOpenRouterConfig(): Promise<OpenRouterConfigCache> {
  const now = Date.now()
  if (configCache && (now - configCacheTimestamp) < CONFIG_CACHE_TTL) {
    return configCache
  }

  const settings = await prisma.platformSettings.findUnique({
    where: { id: 'default' },
    select: {
      openRouterApiKey: true,
      openRouterEnabled: true,
      openRouterDefaultModel: true,
      openRouterSiteUrl: true,
      openRouterSiteName: true,
    },
  })

  configCache = {
    apiKey: settings?.openRouterApiKey || process.env.OPENROUTER_API_KEY || null,
    enabled: settings?.openRouterEnabled ?? false,
    defaultModel: settings?.openRouterDefaultModel || 'openai/gpt-4o-mini',
    siteUrl: settings?.openRouterSiteUrl || process.env.NEXT_PUBLIC_APP_URL || null,
    siteName: settings?.openRouterSiteName || 'NICNOA',
  }
  configCacheTimestamp = now

  return configCache
}

/**
 * Leert den Konfigurations-Cache (z.B. nach Einstellungsänderungen)
 */
export function clearOpenRouterConfigCache(): void {
  configCache = null
  configCacheTimestamp = 0
}

/**
 * Prüft, ob OpenRouter aktiviert und konfiguriert ist
 */
export async function isOpenRouterEnabled(): Promise<boolean> {
  const config = await getOpenRouterConfig()
  return config.enabled && !!config.apiKey
}

/**
 * Führt einen Chat-Completion-Request an OpenRouter aus
 */
export async function chatCompletion(
  messages: OpenRouterMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
    userId?: string
    salonId?: string
    userType?: 'admin' | 'salon_owner' | 'chair_renter'
    requestType?: 'translation' | 'chat' | 'completion' | 'embedding'
  } = {}
): Promise<string> {
  const config = await getOpenRouterConfig()

  if (!config.apiKey) {
    throw new Error('OpenRouter API-Key nicht konfiguriert')
  }

  if (!config.enabled) {
    throw new Error('OpenRouter ist deaktiviert')
  }

  const model = options.model || config.defaultModel
  const startTime = Date.now()

  const requestBody: OpenRouterRequest = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2000,
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': config.siteUrl || '',
        'X-Title': config.siteName || 'NICNOA',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`)
    }

    const data: OpenRouterResponse = await response.json()
    const responseTime = Date.now() - startTime
    const content = data.choices[0]?.message?.content || ''

    // Berechne Kosten
    const pricing = MODEL_PRICING[model] || { prompt: 0, completion: 0 }
    const inputTokens = data.usage?.prompt_tokens || 0
    const outputTokens = data.usage?.completion_tokens || 0
    const costUsd = (inputTokens * pricing.prompt + outputTokens * pricing.completion) / 1_000_000

    // Logge Nutzung
    await logAIUsage({
      userId: options.userId,
      salonId: options.salonId,
      userType: options.userType || 'admin',
      requestType: options.requestType || 'chat',
      model,
      provider: 'openrouter',
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      costUsd,
      responseTimeMs: responseTime,
      success: true,
    })

    return content
  } catch (error) {
    const responseTime = Date.now() - startTime

    // Logge fehlgeschlagenen Request
    await logAIUsage({
      userId: options.userId,
      salonId: options.salonId,
      userType: options.userType || 'admin',
      requestType: options.requestType || 'chat',
      model,
      provider: 'openrouter',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      responseTimeMs: responseTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unbekannter Fehler',
    })

    throw error
  }
}

/**
 * Übersetzt Text via OpenRouter
 */
export async function translateViaOpenRouter(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'German',
  options: {
    model?: string
    userId?: string
    salonId?: string
    userType?: 'admin' | 'salon_owner' | 'chair_renter'
    requestType?: 'translation' | 'chat' | 'completion' | 'embedding'
  } = {}
): Promise<string> {
  const systemPrompt = `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
Keep the formatting intact (line breaks, bullet points, etc.).
Only output the translated text, no explanations or notes.
If the text contains HTML tags, preserve them in the translation.`

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text },
  ]

  return chatCompletion(messages, {
    ...options,
    temperature: 0.3, // Niedrige Temperatur für konsistente Übersetzungen
    requestType: options.requestType || 'translation',
  })
}

/**
 * Holt das Standard-Modell aus der Konfiguration
 */
export async function getDefaultModel(): Promise<string> {
  const config = await getOpenRouterConfig()
  return config.defaultModel
}
