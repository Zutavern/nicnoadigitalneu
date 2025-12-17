/**
 * AI Image Generation Route - Replicate Provider
 * 
 * POST /api/social/ai/image-replicate
 * Generiert Bilder für Social Media Posts via Replicate
 * 
 * Verwendet Modelle wie Flux, SDXL, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { 
  PLATFORM_IMAGE_FORMATS, 
  getDefaultFormat, 
  type ImageFormat 
} from '@/lib/social/image-formats'
import { logAIUsage } from '@/lib/openrouter/usage-tracker'
import { getReplicateConfig } from '@/lib/replicate/client'
import { IMAGE_MODELS, getImageModel, getAvailableImageModels } from '@/lib/replicate/models'

interface GenerateImageRequest {
  prompt: string
  platform: string
  format?: string
  model?: string
  aspectRatio?: string
  numOutputs?: number
}

/**
 * Konvertiert unser Format zu Aspect Ratio String
 */
function getAspectRatio(imageFormat: ImageFormat): string {
  const ratio = imageFormat.width / imageFormat.height
  
  if (ratio > 1.6) return '16:9'      // Landscape wide
  if (ratio > 1.2) return '4:3'       // Landscape
  if (ratio > 0.9) return '1:1'       // Square
  if (ratio > 0.7) return '4:5'       // Portrait (Instagram)
  if (ratio > 0.6) return '3:4'       // Portrait
  return '9:16'                        // Stories/Reels
}

/**
 * Baut modell-spezifische Input-Parameter
 * Jedes Replicate-Modell hat unterschiedliche Anforderungen!
 * 
 * Parameter-Dokumentation basierend auf Replicate OpenAPI Schemas:
 * - FLUX Schnell: prompt, aspect_ratio, output_format, num_outputs, go_fast, seed
 * - FLUX Pro 1.1: prompt, aspect_ratio, output_format, output_quality, safety_tolerance
 * - Google Imagen: prompt, aspect_ratio, safety_filter_level, person_generation, output_format
 * - Ideogram: prompt, aspect_ratio, style_type, magic_prompt_option
 * - Seedream: prompt, aspect_ratio, image_format
 */
function buildModelInput(
  modelKey: string,
  modelId: string,
  prompt: string,
  aspectRatio: string,
  imageFormat: ImageFormat,
  numOutputs: number
): Record<string, unknown> {
  // Basis-Input - NUR prompt, sonst nichts
  const input: Record<string, unknown> = { prompt }

  // Modell-spezifische Parameter basierend auf Replicate OpenAPI Schemas
  switch (modelKey) {
    // ===== BLACK FOREST LABS (FLUX) =====
    case 'flux-schnell':
      // Dokumentiert: prompt, aspect_ratio, output_format, num_outputs, go_fast, seed
      input.aspect_ratio = aspectRatio
      input.output_format = 'webp'
      input.num_outputs = Math.min(numOutputs, 4)
      input.go_fast = true
      break

    case 'flux-pro-11':
      // Dokumentiert: prompt, aspect_ratio, output_format, output_quality, safety_tolerance
      input.aspect_ratio = aspectRatio
      input.output_format = 'webp'
      input.output_quality = 90
      input.safety_tolerance = 2 // 0-6, weniger streng = höher
      break

    case 'flux-kontext-max':
      // Editing-Modell - minimale Parameter
      input.aspect_ratio = aspectRatio
      input.output_format = 'webp'
      break

    // ===== GOOGLE MODELS =====
    case 'imagen-4':
    case 'imagen-4-fast':
      // Google Imagen 4 Parameter
      // Wichtig: Nutzt möglicherweise andere aspect_ratio Formate
      input.aspect_ratio = aspectRatio
      input.output_format = 'png'
      // Safety-Parameter nur hinzufügen wenn nötig
      // input.safety_filter_level = 'block_only_high'
      // input.person_generation = 'allow_adult'
      break

    case 'nano-banana-pro':
      input.aspect_ratio = aspectRatio
      break

    // ===== IDEOGRAM =====
    case 'ideogram-v3-turbo':
      // Ideogram V3 Parameter
      input.aspect_ratio = aspectRatio
      // style_type: Auto, General, Realistic, Design, Render 3D, Anime
      input.style_type = 'Auto'
      // magic_prompt_option: Auto, On, Off
      input.magic_prompt_option = 'Auto'
      break

    // ===== BYTEDANCE =====
    case 'seedream-4':
      input.aspect_ratio = aspectRatio
      // Nutzt image_format statt output_format
      input.image_format = 'png'
      break

    // ===== QWEN =====
    case 'qwen-image':
      // Qwen Image - sehr einfach
      input.aspect_ratio = aspectRatio
      break

    // ===== FALLBACK für unbekannte Modelle =====
    default:
      // Minimale Parameter - nur aspect_ratio hinzufügen
      // Nicht alle Modelle unterstützen das!
      console.warn(`[Replicate] Unbekanntes Modell ${modelKey} - verwende minimale Parameter`)
      input.aspect_ratio = aspectRatio
      break
  }

  return input
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    // Hole Replicate-Konfiguration
    const config = await getReplicateConfig()
    
    console.log('[Replicate Image] Config check - API Key:', !!config.apiKey, 'Enabled:', config.enabled)
    
    if (!config.apiKey) {
      console.error('[Replicate Image] Kein API-Key konfiguriert')
      return NextResponse.json(
        { 
          error: 'Replicate API-Key nicht konfiguriert',
          hint: 'Bitte den Replicate API-Key unter Admin → Einstellungen → Integrationen hinterlegen.',
          debug: { hasApiKey: false, isEnabled: config.enabled }
        },
        { status: 500 }
      )
    }
    
    if (!config.enabled) {
      console.error('[Replicate Image] Replicate ist deaktiviert')
      return NextResponse.json(
        { 
          error: 'Replicate ist deaktiviert',
          hint: 'Bitte Replicate unter Admin → Einstellungen → Integrationen aktivieren.',
          debug: { hasApiKey: true, isEnabled: false }
        },
        { status: 500 }
      )
    }
    
    const body: GenerateImageRequest = await request.json()
    const { 
      prompt, 
      platform, 
      format, 
      model: modelKey = 'flux-schnell',
      numOutputs = 1,
    } = body
    
    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt ist erforderlich' },
        { status: 400 }
      )
    }
    
    // Modell validieren
    const selectedModel = getImageModel(modelKey)
    if (!selectedModel) {
      return NextResponse.json(
        { 
          error: `Ungültiges Modell: ${modelKey}`,
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
    
    const aspectRatio = getAspectRatio(imageFormat)
    
    console.log(`[Replicate Image] Generating with model: ${selectedModel.id}`)
    console.log(`[Replicate Image] Prompt: ${prompt.slice(0, 100)}...`)
    console.log(`[Replicate Image] Aspect Ratio: ${aspectRatio}`)
    
    // Modell-spezifische Input-Parameter
    // Jedes Modell hat unterschiedliche Anforderungen!
    const input: Record<string, unknown> = buildModelInput(
      modelKey, 
      selectedModel.id, 
      prompt, 
      aspectRatio, 
      imageFormat, 
      numOutputs
    )
    
    console.log(`[Replicate Image] Input:`, JSON.stringify(input).slice(0, 500))
    
    // Replicate API aufrufen
    const apiUrl = `https://api.replicate.com/v1/models/${selectedModel.id}/predictions`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60', // Max 60 Sekunden (Replicate Limit)
      },
      body: JSON.stringify({ input }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Replicate Image] API Error: ${response.status} - ${errorText}`)
      console.error(`[Replicate Image] Sent input:`, JSON.stringify(input))
      
      // Versuche JSON zu parsen für bessere Fehlermeldung
      let replicateError: { detail?: string; title?: string } = {}
      try {
        replicateError = JSON.parse(errorText)
      } catch {
        // Nicht JSON, verwende raw text
      }
      
      let errorMessage = 'Bildgenerierung fehlgeschlagen'
      let hint = 'Versuche es später erneut.'
      
      if (response.status === 404) {
        errorMessage = `Modell "${selectedModel.id}" nicht gefunden`
        hint = 'Das Modell ist möglicherweise nicht mehr verfügbar. Wähle ein anderes Modell.'
      } else if (response.status === 422) {
        // Zeige den tatsächlichen Replicate-Fehler
        const detail = replicateError.detail || errorText
        errorMessage = 'Ungültige Parameter'
        hint = `Replicate: ${detail.slice(0, 300)}`
        console.error(`[Replicate Image] 422 Detail: ${detail}`)
        console.error(`[Replicate Image] Input was:`, JSON.stringify(input, null, 2))
      } else if (response.status === 402) {
        errorMessage = 'Keine Replicate Credits'
        hint = 'Bitte Replicate-Konto aufladen.'
      } else if (response.status === 401) {
        errorMessage = 'Replicate API-Key ungültig'
        hint = 'Bitte prüfe den API-Key in den Einstellungen.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          hint, 
          debug: { 
            status: response.status, 
            model: selectedModel.id,
            sentInput: input 
          } 
        },
        { status: response.status }
      )
    }
    
    let prediction = await response.json()
    console.log(`[Replicate Image] Prediction created: ${prediction.id}, Status: ${prediction.status}`)
    
    // Wenn noch nicht fertig, pollen
    if (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      const maxWaitMs = 120000 // 2 Minuten max
      const pollIntervalMs = 2000 // Alle 2 Sekunden
      const pollStart = Date.now()
      
      while (Date.now() - pollStart < maxWaitMs) {
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
        
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
        })
        
        if (!pollResponse.ok) {
          throw new Error('Fehler beim Abrufen des Status')
        }
        
        prediction = await pollResponse.json()
        console.log(`[Replicate Image] Poll: Status = ${prediction.status}`)
        
        if (prediction.status === 'succeeded' || prediction.status === 'failed') {
          break
        }
      }
    }
    
    if (prediction.status === 'failed') {
      console.error(`[Replicate Image] Prediction failed:`, prediction.error)
      return NextResponse.json(
        { 
          error: 'Bildgenerierung fehlgeschlagen',
          hint: prediction.error || 'Unbekannter Fehler',
        },
        { status: 500 }
      )
    }
    
    if (prediction.status !== 'succeeded') {
      return NextResponse.json(
        { 
          error: 'Timeout - Bildgenerierung dauert zu lange',
          hint: 'Versuche es erneut oder wähle ein schnelleres Modell.',
        },
        { status: 408 }
      )
    }
    
    // Bild-URL extrahieren
    let imageUrl: string | null = null
    
    if (Array.isArray(prediction.output)) {
      imageUrl = prediction.output[0]
    } else if (typeof prediction.output === 'string') {
      imageUrl = prediction.output
    }
    
    if (!imageUrl) {
      console.error(`[Replicate Image] No image in output:`, prediction.output)
      return NextResponse.json(
        { 
          error: 'Keine Bilddaten in der Antwort',
          hint: 'Das Modell hat kein Bild zurückgegeben.',
        },
        { status: 500 }
      )
    }
    
    console.log(`[Replicate Image] Got image URL:`, imageUrl.slice(0, 100))
    
    // Bild herunterladen und in Vercel Blob speichern
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Bild konnte nicht heruntergeladen werden')
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const timestamp = Date.now()
    const extension = selectedModel.outputFormat || 'png'
    const fileName = `replicate-image-${session.user.id}-${timestamp}.${extension}`
    
    const blob = await put(`social/ai-images/${fileName}`, imageBuffer, {
      access: 'public',
      contentType: `image/${extension}`,
    })
    
    const responseTime = Date.now() - startTime
    
    // Credits berechnen basierend auf Modell
    const creditsUsed = selectedModel.free ? 1 : Math.ceil(selectedModel.costPerRun * 100)
    
    // Logge AI-Nutzung
    await logAIUsage({
      userId: session.user.id,
      userType: 'salon_owner',
      requestType: 'image_generation',
      model: selectedModel.id,
      provider: 'replicate',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: selectedModel.costPerRun,
      responseTimeMs: responseTime,
      success: true,
      feature: 'image_generation',
      creditsUsed,
    })
    
    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      prompt,
      format: imageFormat,
      platform: platform.toUpperCase(),
      model: {
        key: modelKey,
        id: selectedModel.id,
        name: selectedModel.name,
      },
      dimensions: {
        width: imageFormat.width,
        height: imageFormat.height,
        ratio: imageFormat.ratio,
        aspectRatio,
      },
      predictionId: prediction.id,
      responseTimeMs: responseTime,
    })
  } catch (error) {
    console.error('[Replicate Image] Error:', error)
    
    const responseTime = Date.now() - startTime
    
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
 * GET: Verfügbare Replicate Bildmodelle abrufen
 */
export async function GET() {
  // Prüfe ob Replicate konfiguriert ist
  const config = await getReplicateConfig()
  
  const models = getAvailableImageModels().map(model => ({
    key: model.key,
    id: model.id,
    name: model.name,
    description: model.description,
    free: model.free || false,
    supportsAspectRatio: model.supportsAspectRatio,
    costPerRun: model.costPerRun,
    avgDuration: model.avgDuration,
  }))
  
  return NextResponse.json({
    provider: 'replicate',
    configured: !!config.apiKey && config.enabled,
    models,
    defaultModel: 'flux-schnell',
    aspectRatios: ['1:1', '4:5', '9:16', '16:9', '4:3', '3:4'],
  })
}

