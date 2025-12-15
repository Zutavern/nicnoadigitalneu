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

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    // Hole Replicate-Konfiguration
    const config = await getReplicateConfig()
    
    if (!config.apiKey) {
      return NextResponse.json(
        { 
          error: 'Replicate API-Key nicht konfiguriert',
          hint: 'Bitte den Replicate API-Key unter Admin → Einstellungen → Integrationen hinterlegen.'
        },
        { status: 500 }
      )
    }
    
    if (!config.enabled) {
      return NextResponse.json(
        { 
          error: 'Replicate ist deaktiviert',
          hint: 'Bitte Replicate unter Admin → Einstellungen → Integrationen aktivieren.'
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
    
    // Input für Replicate vorbereiten
    const input: Record<string, unknown> = {
      prompt,
      num_outputs: numOutputs,
    }
    
    // Modell-spezifische Parameter
    if (selectedModel.supportsAspectRatio) {
      input.aspect_ratio = aspectRatio
    } else {
      // Für Modelle ohne Aspect Ratio Support - feste Größen
      input.width = Math.min(imageFormat.width, selectedModel.maxResolution || 1024)
      input.height = Math.min(imageFormat.height, selectedModel.maxResolution || 1024)
    }
    
    // Output-Format wenn unterstützt
    if (selectedModel.outputFormat !== 'png') {
      input.output_format = selectedModel.outputFormat
    }
    
    // Replicate API aufrufen
    const apiUrl = `https://api.replicate.com/v1/models/${selectedModel.id}/predictions`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=120', // Warte bis zu 120 Sekunden auf Ergebnis
      },
      body: JSON.stringify({ input }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Replicate Image] API Error: ${response.status} - ${errorText}`)
      
      let errorMessage = 'Bildgenerierung fehlgeschlagen'
      let hint = 'Versuche es später erneut.'
      
      if (response.status === 404) {
        errorMessage = `Modell "${selectedModel.id}" nicht gefunden`
        hint = 'Das Modell ist möglicherweise nicht mehr verfügbar. Wähle ein anderes Modell.'
      } else if (response.status === 422) {
        errorMessage = 'Ungültige Parameter'
        hint = 'Versuche einen kürzeren Prompt oder andere Einstellungen.'
      } else if (response.status === 402) {
        errorMessage = 'Keine Replicate Credits'
        hint = 'Bitte Replicate-Konto aufladen.'
      }
      
      return NextResponse.json(
        { error: errorMessage, hint },
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

