/**
 * AI Image Generation Route
 * 
 * POST /api/social/ai/image
 * Generiert Bilder für Social Media Posts via OpenRouter
 * 
 * Verwendet die zentrale OpenRouter-Konfiguration aus der Datenbank
 * Nutzt Google Gemini Modelle für Bildgenerierung
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { 
  PLATFORM_IMAGE_FORMATS, 
  getDefaultFormat, 
  getAIPromptSuffix,
  type ImageFormat 
} from '@/lib/social/image-formats'

// Cache für OpenRouter-Konfiguration
interface OpenRouterConfig {
  apiKey: string | null
  enabled: boolean
  siteUrl: string | null
  siteName: string | null
}

let configCache: OpenRouterConfig | null = null
let configCacheTimestamp = 0
const CONFIG_CACHE_TTL = 5 * 60 * 1000 // 5 Minuten

/**
 * Lädt die OpenRouter-Konfiguration aus der Datenbank
 */
async function getOpenRouterConfig(): Promise<OpenRouterConfig> {
  const now = Date.now()
  if (configCache && (now - configCacheTimestamp) < CONFIG_CACHE_TTL) {
    return configCache
  }

  const settings = await prisma.platformSettings.findUnique({
    where: { id: 'default' },
    select: {
      openRouterApiKey: true,
      openRouterEnabled: true,
      openRouterSiteUrl: true,
      openRouterSiteName: true,
    },
  })

  configCache = {
    apiKey: settings?.openRouterApiKey || null,
    enabled: settings?.openRouterEnabled ?? false,
    siteUrl: settings?.openRouterSiteUrl || process.env.NEXT_PUBLIC_APP_URL || null,
    siteName: settings?.openRouterSiteName || 'NICNOA',
  }
  configCacheTimestamp = now

  return configCache
}

// OpenRouter API URL
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/**
 * Verfügbare Bildgenerierungs-Modelle
 * 
 * Nur Modelle die tatsächlich Bildgenerierung über modalities: ["image", "text"] unterstützen
 * Gemini-Modelle sind die zuverlässigsten für Bildgenerierung über OpenRouter
 */
const IMAGE_MODELS = {
  // Google Gemini Modelle - funktionieren zuverlässig für Bildgenerierung
  'gemini-2.0-flash': {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Kostenlos)',
    description: 'Schnell & kostenlos - kann bei hoher Nutzung Rate Limits haben',
    free: true,
    supportsAspectRatio: true,
  },
  'gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash',
    description: 'Neueste Version, beste Qualität, zuverlässiger',
    free: false,
    supportsAspectRatio: true,
  },
  'gemini-2.0-flash-thinking': {
    id: 'google/gemini-2.0-flash-thinking-exp:free',
    name: 'Gemini 2.0 Thinking (Kostenlos)',
    description: 'Alternative kostenlose Version',
    free: true,
    supportsAspectRatio: true,
  },
} as const

// Fallback-Reihenfolge bei Rate Limits
const MODEL_FALLBACK_ORDER = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-thinking',
  'gemini-2.5-flash',
]

type ModelKey = keyof typeof IMAGE_MODELS

interface GenerateImageRequest {
  prompt?: string
  postContent?: string // Generiert automatisch Prompt aus Post-Inhalt
  platform: string
  format?: string // z.B. 'feed_square', 'story'
  model?: ModelKey
  style?: 'vivid' | 'natural' | 'artistic'
  industry?: string
}

/**
 * Konvertiert unser Format zu Gemini Aspect Ratios
 */
function getGeminiAspectRatio(imageFormat: ImageFormat): string {
  const ratio = imageFormat.width / imageFormat.height
  
  // Gemini unterstützte Aspect Ratios: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
  if (ratio > 2) return '21:9'        // Ultra-wide
  if (ratio > 1.5) return '16:9'      // Landscape wide
  if (ratio > 1.2) return '4:3'       // Landscape
  if (ratio > 0.9) return '1:1'       // Square
  if (ratio > 0.7) return '4:5'       // Portrait (Instagram)
  if (ratio > 0.6) return '3:4'       // Portrait
  return '9:16'                        // Stories/Reels
}

/**
 * Generiert einen optimierten Bildprompt aus dem Post-Inhalt
 */
function generateImagePromptFromContent(
  postContent: string, 
  platform: string,
  style: string,
  industry: string,
  imageFormat: ImageFormat
): string {
  // Extrahiere Hauptthema aus dem Post-Inhalt
  const cleanContent = postContent
    .replace(/#\w+/g, '') // Hashtags entfernen
    .replace(/https?:\/\/\S+/g, '') // URLs entfernen
    .replace(/\n+/g, ' ') // Zeilenumbrüche
    .trim()
    .slice(0, 300) // Auf 300 Zeichen begrenzen
  
  // Style-spezifische Anweisungen
  const styleInstructions = {
    vivid: 'Vibrant, eye-catching colors with high contrast.',
    natural: 'Natural, realistic photography style with soft lighting.',
    artistic: 'Artistic, creative interpretation with unique visual elements.',
  }
  
  // Plattform-spezifische Anweisungen
  const platformInstructions = {
    INSTAGRAM: 'Optimized for Instagram - visually striking, lifestyle-focused.',
    FACEBOOK: 'Suitable for Facebook - engaging, shareable content.',
    LINKEDIN: 'Professional and business-appropriate for LinkedIn.',
    TWITTER: 'Bold and attention-grabbing for Twitter/X.',
    TIKTOK: 'Trendy, dynamic visual style for TikTok.',
    YOUTUBE: 'High-quality thumbnail style for YouTube.',
  }
  
  const platformSuffix = getAIPromptSuffix(platform, imageFormat)
  const platformHint = platformInstructions[platform as keyof typeof platformInstructions] || ''
  const styleHint = styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.vivid
  
  return `Create a professional ${industry} related image. 
Topic: "${cleanContent}"
Style: ${styleHint}
Platform: ${platformHint}
${platformSuffix}
High quality, professional. No text overlays. Clean composition.`
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    // Hole OpenRouter-Konfiguration aus der Datenbank
    const config = await getOpenRouterConfig()
    
    if (!config.apiKey) {
      return NextResponse.json(
        { 
          error: 'OpenRouter API-Key nicht konfiguriert',
          hint: 'Bitte den OpenRouter API-Key unter Admin → Einstellungen → Integrationen hinterlegen.'
        },
        { status: 500 }
      )
    }
    
    if (!config.enabled) {
      return NextResponse.json(
        { 
          error: 'OpenRouter ist deaktiviert',
          hint: 'Bitte OpenRouter unter Admin → Einstellungen → Integrationen aktivieren.'
        },
        { status: 500 }
      )
    }
    
    const body: GenerateImageRequest = await request.json()
    const { 
      prompt, 
      postContent, 
      platform, 
      format, 
      model = 'gemini-2.0-flash', // Kostenloses Gemini Modell als Default
      style = 'vivid', 
      industry = 'Beauty/Salon' 
    } = body
    
    // Modell validieren
    const selectedModel = IMAGE_MODELS[model as ModelKey]
    if (!selectedModel) {
      return NextResponse.json(
        { 
          error: `Ungültiges Modell: ${model}`,
          availableModels: Object.keys(IMAGE_MODELS)
        },
        { status: 400 }
      )
    }
    
    // Format bestimmen
    const platformFormats = PLATFORM_IMAGE_FORMATS[platform.toUpperCase()]
    let imageFormat: ImageFormat | null = null
    
    if (platformFormats && format) {
      imageFormat = platformFormats.formats[format] || null
    }
    
    if (!imageFormat) {
      imageFormat = getDefaultFormat(platform.toUpperCase())
    }
    
    // Fallback Format
    if (!imageFormat) {
      imageFormat = {
        width: 1080,
        height: 1080,
        ratio: '1:1',
        name: 'Default',
        description: 'Quadratisches Bild',
      }
    }
    
    // Prompt generieren - entweder direkt oder aus Post-Inhalt
    let finalPrompt: string
    
    if (prompt?.trim()) {
      // Direkter Prompt wurde angegeben
      const platformSuffix = getAIPromptSuffix(platform.toUpperCase(), imageFormat)
      finalPrompt = `${prompt}. ${platformSuffix} High quality, professional.`
    } else if (postContent?.trim()) {
      // Prompt aus Post-Inhalt generieren
      finalPrompt = generateImagePromptFromContent(
        postContent,
        platform.toUpperCase(),
        style,
        industry,
        imageFormat
      )
    } else {
      return NextResponse.json(
        { error: 'Entweder prompt oder postContent ist erforderlich' },
        { status: 400 }
      )
    }
    
    // Aspect Ratio für Gemini
    const aspectRatio = getGeminiAspectRatio(imageFormat)
    
    // Funktion für API-Call mit Retry-Logik
    async function tryGenerateImage(modelKey: ModelKey): Promise<{ success: boolean; data?: unknown; error?: string; status?: number }> {
      const modelConfig = IMAGE_MODELS[modelKey]
      if (!modelConfig) {
        return { success: false, error: `Ungültiges Modell: ${modelKey}` }
      }
      
      console.log('[AI Image] Trying model:', modelConfig.id)
      
      const requestBody: Record<string, unknown> = {
        model: modelConfig.id,
        messages: [
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
        modalities: ['image', 'text'],
      }
      
      if (modelConfig.supportsAspectRatio) {
        requestBody.image_config = {
          aspect_ratio: aspectRatio,
        }
      }
      
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.siteUrl || 'http://localhost:3000',
          'X-Title': config.siteName || 'NICNOA Social Media',
        },
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AI Image] Error with', modelConfig.id, ':', response.status, errorText)
        return { success: false, error: errorText, status: response.status }
      }
      
      const data = await response.json()
      return { success: true, data }
    }
    
    // Versuche das gewählte Modell, dann Fallbacks bei Rate Limits
    let result: { success: boolean; data?: unknown; error?: string; status?: number }
    let usedModel = model
    let triedModels: string[] = []
    
    // Zuerst das gewählte Modell versuchen
    result = await tryGenerateImage(model as ModelKey)
    triedModels.push(model)
    
    // Bei Rate Limit (429) automatisch Fallback-Modelle versuchen
    if (!result.success && result.status === 429) {
      console.log('[AI Image] Rate limited, trying fallback models...')
      
      for (const fallbackModel of MODEL_FALLBACK_ORDER) {
        if (triedModels.includes(fallbackModel)) continue
        
        // Kurze Pause zwischen Versuchen
        await new Promise(resolve => setTimeout(resolve, 500))
        
        result = await tryGenerateImage(fallbackModel as ModelKey)
        triedModels.push(fallbackModel)
        
        if (result.success) {
          usedModel = fallbackModel
          console.log('[AI Image] Fallback successful with:', fallbackModel)
          break
        }
        
        // Bei nicht-429 Fehler abbrechen
        if (result.status !== 429) break
      }
    }
    
    // Wenn immer noch nicht erfolgreich
    if (!result.success) {
      let errorMessage = 'Bildgenerierung fehlgeschlagen'
      let errorHint = 'Versuche es später erneut.'
      
      try {
        const errorJson = JSON.parse(result.error || '{}')
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        
        if (result.status === 429 || errorMessage.includes('rate limit') || errorMessage.includes('rate-limited')) {
          errorMessage = 'Alle Modelle sind gerade ausgelastet (Rate Limit)'
          errorHint = 'Die kostenlosen Modelle haben begrenzte Kapazität. Bitte warte 1-2 Minuten und versuche es erneut, oder wähle ein kostenpflichtiges Modell.'
        } else if (errorMessage.includes('insufficient') || errorMessage.includes('credits')) {
          errorHint = 'Nicht genügend Credits. Prüfe deinen OpenRouter Account.'
        }
      } catch {
        // Ignore parse error
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          hint: errorHint,
          triedModels,
        },
        { status: result.status || 500 }
      )
    }
    
    const data = result.data as Record<string, unknown>
    console.log('[AI Image] Response keys:', Object.keys(data))
    
    // Bild-URL aus der Antwort extrahieren
    let imageDataUrl: string | null = null
    
    const message = data.choices?.[0]?.message
    if (message?.images && message.images.length > 0) {
      // Standard Format: images Array mit image_url
      const imageObj = message.images[0]
      imageDataUrl = imageObj?.image_url?.url || imageObj?.url
    } else if (message?.content && typeof message.content === 'string' && message.content.startsWith('data:image')) {
      // Falls das Bild direkt im content ist
      imageDataUrl = message.content
    }
    
    if (!imageDataUrl) {
      console.error('[AI Image] No image in response:', JSON.stringify(data).slice(0, 1000))
      
      // Prüfe ob eine Text-Antwort kam
      const textContent = message?.content
      if (textContent && typeof textContent === 'string') {
        return NextResponse.json(
          { 
            error: 'Das Modell hat kein Bild generiert',
            hint: 'Das Modell hat stattdessen Text zurückgegeben. Versuche einen anderen Prompt oder Modell.',
            modelResponse: textContent.slice(0, 200)
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Keine Bilddaten in der Antwort',
          hint: 'Das Modell hat möglicherweise ein Problem. Versuche es erneut.',
        },
        { status: 500 }
      )
    }
    
    // Base64 Bild in Vercel Blob speichern
    let blobUrl: string
    
    if (imageDataUrl.startsWith('data:image')) {
      // Base64 Data URL - in Buffer konvertieren
      const base64Data = imageDataUrl.split(',')[1]
      const imageBuffer = Buffer.from(base64Data, 'base64')
      
      // Content-Type aus Data URL extrahieren
      const contentType = imageDataUrl.match(/data:([^;]+);/)?.[1] || 'image/png'
      const extension = contentType.split('/')[1] || 'png'
      
      const timestamp = Date.now()
      const fileName = `ai-image-${session.user.id}-${timestamp}.${extension}`
      
      const blob = await put(`social/ai-images/${fileName}`, imageBuffer, {
        access: 'public',
        contentType,
      })
      
      blobUrl = blob.url
    } else {
      // Falls es eine URL ist, herunterladen und speichern
      const imageResponse = await fetch(imageDataUrl)
      if (!imageResponse.ok) {
        throw new Error('Bild konnte nicht heruntergeladen werden')
      }
      
      const imageBuffer = await imageResponse.arrayBuffer()
      const timestamp = Date.now()
      const fileName = `ai-image-${session.user.id}-${timestamp}.png`
      
      const blob = await put(`social/ai-images/${fileName}`, imageBuffer, {
        access: 'public',
        contentType: 'image/png',
      })
      
      blobUrl = blob.url
    }
    
    const finalModelConfig = IMAGE_MODELS[usedModel as ModelKey]
    
    return NextResponse.json({
      success: true,
      imageUrl: blobUrl,
      prompt: finalPrompt,
      format: imageFormat,
      platform: platform.toUpperCase(),
      model: {
        key: usedModel,
        id: finalModelConfig?.id || selectedModel.id,
        name: finalModelConfig?.name || selectedModel.name,
        usedFallback: usedModel !== model,
        triedModels,
      },
      dimensions: {
        width: imageFormat.width,
        height: imageFormat.height,
        ratio: imageFormat.ratio,
        geminiAspectRatio: aspectRatio,
      },
    })
  } catch (error) {
    console.error('[AI Image] Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Bildgenerierung fehlgeschlagen',
        hint: 'Prüfe die Server-Logs für Details'
      },
      { status: 500 }
    )
  }
}

/**
 * GET: Verfügbare Modelle und Formate abrufen
 */
export async function GET() {
  // Prüfe ob OpenRouter konfiguriert ist
  const config = await getOpenRouterConfig()
  
  return NextResponse.json({
    configured: !!config.apiKey && config.enabled,
    models: Object.entries(IMAGE_MODELS).map(([key, model]) => ({
      key,
      id: model.id,
      name: model.name,
      description: model.description,
      free: model.free,
      supportsAspectRatio: model.supportsAspectRatio,
    })),
    defaultModel: 'gemini-2.0-flash',
    platforms: Object.keys(PLATFORM_IMAGE_FORMATS),
    formats: PLATFORM_IMAGE_FORMATS,
    styles: [
      { id: 'vivid', name: 'Lebendig', description: 'Kräftige, auffällige Farben' },
      { id: 'natural', name: 'Natürlich', description: 'Realistischer Look' },
      { id: 'artistic', name: 'Künstlerisch', description: 'Kreative Interpretation' },
    ],
    aspectRatios: ['1:1', '4:5', '9:16', '16:9', '4:3', '3:4'],
  })
}
