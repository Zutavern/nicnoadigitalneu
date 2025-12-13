import { prisma } from '@/lib/prisma'
import {
  OpenRouterConfig,
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterMessage,
  MODEL_PRICING,
} from './types'
import { logAIUsage } from './usage-tracker'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Cache für Config
let cachedConfig: OpenRouterConfig | null = null
let configCacheTime = 0
const CONFIG_CACHE_TTL = 5 * 60 * 1000 // 5 Minuten

/**
 * Holt die OpenRouter-Konfiguration aus der Datenbank
 */
export async function getOpenRouterConfig(): Promise<OpenRouterConfig | null> {
  const now = Date.now()
  
  if (cachedConfig && (now - configCacheTime) < CONFIG_CACHE_TTL) {
    return cachedConfig
  }
  
  try {
    const settings = await prisma.platformSettings.findFirst({
      select: {
        openRouterApiKey: true,
        openRouterEnabled: true,
        openRouterDefaultModel: true,
        openRouterSiteUrl: true,
        openRouterSiteName: true,
      }
    })
    
    if (!settings?.openRouterApiKey || !settings.openRouterEnabled) {
      cachedConfig = null
      return null
    }
    
    cachedConfig = {
      apiKey: settings.openRouterApiKey,
      siteUrl: settings.openRouterSiteUrl || 'https://www.nicnoa.online',
      siteName: settings.openRouterSiteName || 'NICNOA Platform',
      defaultModel: settings.openRouterDefaultModel || 'openai/gpt-4o-mini',
    }
    configCacheTime = now
    
    return cachedConfig
  } catch (error) {
    console.error('Error fetching OpenRouter config:', error)
    return null
  }
}

/**
 * Cache leeren (nach Config-Änderung)
 */
export function clearOpenRouterConfigCache(): void {
  cachedConfig = null
  configCacheTime = 0
}

/**
 * Prüft ob OpenRouter konfiguriert und aktiviert ist
 */
export async function isOpenRouterEnabled(): Promise<boolean> {
  const config = await getOpenRouterConfig()
  return config !== null
}

/**
 * Berechnet die Kosten basierend auf Tokens und Modell
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['openai/gpt-4o-mini']
  
  // Preise sind pro 1M Tokens
  const inputCost = (inputTokens / 1_000_000) * pricing.prompt
  const outputCost = (outputTokens / 1_000_000) * pricing.completion
  
  return inputCost + outputCost
}

interface ChatCompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  // Tracking-Infos
  userId?: string
  salonId?: string
  userType?: 'admin' | 'salon_owner' | 'chair_renter'
  requestType?: 'translation' | 'chat' | 'completion' | 'embedding'
}

/**
 * Hauptfunktion: Chat Completion via OpenRouter
 */
export async function chatCompletion(
  messages: OpenRouterMessage[],
  options: ChatCompletionOptions = {}
): Promise<{ content: string; usage: { inputTokens: number; outputTokens: number; totalTokens: number; costUsd: number } }> {
  const config = await getOpenRouterConfig()
  
  if (!config) {
    throw new Error('OpenRouter ist nicht konfiguriert oder deaktiviert')
  }
  
  const model = options.model || config.defaultModel || 'openai/gpt-4o-mini'
  const startTime = Date.now()
  
  const requestBody: OpenRouterRequest = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens,
  }
  
  try {
    // Stelle sicher, dass Header nur ASCII-Zeichen enthalten
    const sanitizeHeader = (str: string) => str.replace(/[^\x00-\x7F]/g, '')
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': sanitizeHeader(config.siteUrl || 'https://www.nicnoa.online'),
        'X-Title': sanitizeHeader(config.siteName || 'NICNOA Platform'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `OpenRouter API Error: ${response.status}`)
    }
    
    const data: OpenRouterResponse = await response.json()
    const responseTime = Date.now() - startTime
    
    const inputTokens = data.usage?.prompt_tokens || 0
    const outputTokens = data.usage?.completion_tokens || 0
    const totalTokens = data.usage?.total_tokens || inputTokens + outputTokens
    const costUsd = calculateCost(model, inputTokens, outputTokens)
    
    // Usage loggen
    await logAIUsage({
      userId: options.userId,
      salonId: options.salonId,
      userType: options.userType || 'admin',
      requestType: options.requestType || 'chat',
      model,
      provider: 'openrouter',
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd,
      responseTimeMs: responseTime,
      success: true,
    })
    
    const content = data.choices[0]?.message?.content || ''
    
    return {
      content,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        costUsd,
      },
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Fehler auch loggen
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
      errorMessage,
    })
    
    throw error
  }
}

/**
 * Einfache Text-Completion (Wrapper um chatCompletion)
 */
export async function textCompletion(
  prompt: string,
  options: ChatCompletionOptions = {}
): Promise<string> {
  const result = await chatCompletion(
    [{ role: 'user', content: prompt }],
    { ...options, requestType: 'completion' }
  )
  return result.content
}

/**
 * Übersetzung via OpenRouter (für Translation Service)
 */
export async function translateViaOpenRouter(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string,
  options: Omit<ChatCompletionOptions, 'requestType'> = {}
): Promise<string> {
  const systemPrompt = sourceLanguage
    ? `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only output the translation, nothing else.`
    : `You are a professional translator. Translate the following text to ${targetLanguage}. Only output the translation, nothing else.`
  
  const result = await chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ],
    { ...options, requestType: 'translation', temperature: 0.3 }
  )
  
  return result.content
}



