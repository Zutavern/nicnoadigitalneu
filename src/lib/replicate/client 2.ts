/**
 * Replicate API Client
 * 
 * Verwaltet Konfiguration und API-Aufrufe für Replicate
 */

import { prisma } from '@/lib/prisma'
import { logAIUsage } from '@/lib/openrouter/usage-tracker'
import { 
  ReplicateConfigCache, 
  ReplicatePrediction, 
  ReplicateCreatePredictionResponse,
  PredictionStatus,
  VideoGenerationInput,
  ImageAnimationInput,
} from './types'
import { VIDEO_MODELS, DEFAULT_VIDEO_MODEL, getVideoModel, getVideoModelById } from './models'

const REPLICATE_API_URL = 'https://api.replicate.com/v1'

// Cache für Konfiguration
let configCache: ReplicateConfigCache | null = null
let configCacheTimestamp = 0
const CONFIG_CACHE_TTL = 5 * 60 * 1000 // 5 Minuten

/**
 * Lädt die Replicate-Konfiguration aus der Datenbank
 */
export async function getReplicateConfig(): Promise<ReplicateConfigCache> {
  const now = Date.now()
  if (configCache && (now - configCacheTimestamp) < CONFIG_CACHE_TTL) {
    return configCache
  }

  const settings = await prisma.platformSettings.findUnique({
    where: { id: 'default' },
    select: {
      replicateApiKey: true,
      replicateEnabled: true,
      replicateDefaultVideoModel: true,
      replicateWebhookSecret: true,
    },
  })

  configCache = {
    apiKey: settings?.replicateApiKey || process.env.REPLICATE_API_TOKEN || null,
    enabled: settings?.replicateEnabled ?? false,
    defaultVideoModel: settings?.replicateDefaultVideoModel || DEFAULT_VIDEO_MODEL,
    webhookSecret: settings?.replicateWebhookSecret || null,
  }
  configCacheTimestamp = now

  return configCache
}

/**
 * Leert den Konfigurations-Cache
 */
export function clearReplicateConfigCache(): void {
  configCache = null
  configCacheTimestamp = 0
}

/**
 * Prüft, ob Replicate aktiviert und konfiguriert ist
 */
export async function isReplicateEnabled(): Promise<boolean> {
  const config = await getReplicateConfig()
  return config.enabled && !!config.apiKey
}

/**
 * Erstellt eine neue Prediction (Video-Generierung)
 * 
 * Verwendet den Models-Endpoint für offizielle Modelle:
 * POST https://api.replicate.com/v1/models/{owner}/{model}/predictions
 * 
 * Dieser Endpoint erfordert KEINE Version - er verwendet automatisch die neueste.
 */
export async function createPrediction(
  modelId: string,
  input: Record<string, unknown>,
  options: {
    webhook?: string
    webhookEventsFilter?: string[]
  } = {}
): Promise<ReplicateCreatePredictionResponse> {
  const config = await getReplicateConfig()

  if (!config.apiKey) {
    throw new Error('Replicate API-Key nicht konfiguriert')
  }

  if (!config.enabled) {
    throw new Error('Replicate ist deaktiviert')
  }

  // Finde das Modell
  const model = getVideoModelById(modelId) || Object.values(VIDEO_MODELS).find(m => m.id === modelId)
  if (!model) {
    throw new Error(`Unbekanntes Modell: ${modelId}`)
  }

  // Verwende den Models-Endpoint (akzeptiert model IDs wie "owner/name")
  // WICHTIG: Der Endpoint ist /models/{owner}/{name}/predictions OHNE /v1/ Präfix für model ID
  const apiUrl = `${REPLICATE_API_URL}/models/${modelId}/predictions`
  
  console.log(`[Replicate] Creating prediction for model: ${modelId}`)
  console.log(`[Replicate] API URL: ${apiUrl}`)
  console.log(`[Replicate] Input:`, JSON.stringify(input).slice(0, 200))

  // Request Body - NUR input, KEINE model oder version Felder!
  const requestBody: Record<string, unknown> = {
    input,
  }
  
  if (options.webhook) {
    requestBody.webhook = options.webhook
  }
  if (options.webhookEventsFilter) {
    requestBody.webhook_events_filter = options.webhookEventsFilter
  }

  console.log(`[Replicate] Request body:`, JSON.stringify(requestBody).slice(0, 500))

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait=60', // Warte bis zu 60 Sekunden auf Ergebnis
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Replicate] API Error: ${response.status} - ${errorText}`)
    
    // Bei 404 - Modell nicht gefunden
    if (response.status === 404) {
      throw new Error(`Modell "${modelId}" nicht auf Replicate gefunden. Bitte überprüfen Sie den Modellnamen.`)
    }
    
    // Bei 422 - Validierungsfehler
    if (response.status === 422) {
      try {
        const errorJson = JSON.parse(errorText)
        const detail = errorJson.detail || errorText
        throw new Error(`Validierungsfehler: ${detail}`)
      } catch {
        throw new Error(`Replicate Validierungsfehler: ${errorText}`)
      }
    }
    
    throw new Error(`Replicate API Error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  console.log(`[Replicate] Prediction created: ${result.id}, Status: ${result.status}`)
  return result
}

/**
 * Holt den Status einer Prediction
 */
export async function getPrediction(predictionId: string): Promise<ReplicatePrediction> {
  const config = await getReplicateConfig()

  if (!config.apiKey) {
    throw new Error('Replicate API-Key nicht konfiguriert')
  }

  const response = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}`, {
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Replicate API Error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * Wartet auf das Ergebnis einer Prediction (Polling)
 * 
 * Video-Generierung kann bis zu 5 Minuten dauern!
 */
export async function waitForPrediction(
  predictionId: string,
  options: {
    maxWaitMs?: number
    pollIntervalMs?: number
  } = {}
): Promise<ReplicatePrediction> {
  const { maxWaitMs = 600000, pollIntervalMs = 3000 } = options // 10 Minuten max, alle 3 Sek prüfen
  const startTime = Date.now()
  let pollCount = 0

  console.log(`[Replicate] Waiting for prediction ${predictionId}...`)

  while (Date.now() - startTime < maxWaitMs) {
    pollCount++
    const prediction = await getPrediction(predictionId)
    
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    console.log(`[Replicate] Poll #${pollCount}: Status = ${prediction.status}, Elapsed = ${elapsed}s`)
    
    if (prediction.status === 'succeeded') {
      console.log(`[Replicate] Prediction succeeded! Output:`, prediction.output)
      return prediction
    }
    
    if (prediction.status === 'failed') {
      console.error(`[Replicate] Prediction failed:`, prediction.error)
      throw new Error(prediction.error || 'Video-Generierung fehlgeschlagen')
    }
    
    if (prediction.status === 'canceled') {
      throw new Error('Video-Generierung wurde abgebrochen')
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }

  throw new Error(`Timeout: Video-Generierung hat zu lange gedauert (>${maxWaitMs/1000}s)`)
}

/**
 * Generiert ein Video aus Text
 */
export async function generateVideoFromText(
  prompt: string,
  options: {
    modelKey?: string
    optimizePrompt?: boolean
    userId?: string
    salonId?: string
    userType?: 'admin' | 'salon_owner' | 'chair_renter'
  } = {}
): Promise<{ videoUrl: string; prediction: ReplicatePrediction }> {
  const config = await getReplicateConfig()
  const modelKey = options.modelKey || config.defaultVideoModel
  const model = getVideoModel(modelKey)

  if (!model) {
    throw new Error(`Unbekanntes Modell: ${modelKey}`)
  }

  if (model.type !== 'text-to-video') {
    throw new Error(`Modell ${model.name} unterstützt keine Text-zu-Video Generierung`)
  }

  const startTime = Date.now()

  try {
    // Erstelle Input basierend auf Modell
    const input: VideoGenerationInput = {
      prompt,
      prompt_optimizer: options.optimizePrompt ?? model.supportsPromptOptimizer ?? false,
    }

    // Erstelle Prediction
    const createResponse = await createPrediction(model.id, input as Record<string, unknown>)
    
    // Warte auf Ergebnis
    const prediction = await waitForPrediction(createResponse.id)
    
    const responseTime = Date.now() - startTime

    if (prediction.status !== 'succeeded') {
      throw new Error(prediction.error || 'Video-Generierung fehlgeschlagen')
    }

    // Extrahiere Video-URL
    const videoUrl = Array.isArray(prediction.output) 
      ? prediction.output[0] 
      : prediction.output as string

    if (!videoUrl) {
      throw new Error('Keine Video-URL in der Antwort')
    }

    // Logge Nutzung
    await logAIUsage({
      userId: options.userId,
      salonId: options.salonId,
      userType: options.userType || 'admin',
      requestType: 'video_generation',
      model: model.id,
      provider: 'replicate',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: model.costPerRun,
      responseTimeMs: responseTime,
      success: true,
      metadata: {
        predictionId: prediction.id,
        prompt,
        modelKey,
        predictTime: prediction.metrics?.predict_time,
      },
    })

    return { videoUrl, prediction }
  } catch (error) {
    const responseTime = Date.now() - startTime

    // Logge Fehler
    await logAIUsage({
      userId: options.userId,
      salonId: options.salonId,
      userType: options.userType || 'admin',
      requestType: 'video_generation',
      model: model.id,
      provider: 'replicate',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      responseTimeMs: responseTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unbekannter Fehler',
      metadata: {
        prompt,
        modelKey,
      },
    })

    throw error
  }
}

/**
 * Generiert ein Video aus einem Bild
 */
export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string,
  options: {
    modelKey?: string
    userId?: string
    salonId?: string
    userType?: 'admin' | 'salon_owner' | 'chair_renter'
  } = {}
): Promise<{ videoUrl: string; prediction: ReplicatePrediction }> {
  const config = await getReplicateConfig()
  const modelKey = options.modelKey || 'minimax-video-01-live'
  const model = getVideoModel(modelKey)

  if (!model) {
    throw new Error(`Unbekanntes Modell: ${modelKey}`)
  }

  if (model.type !== 'image-to-video' && model.type !== 'image-animation') {
    throw new Error(`Modell ${model.name} unterstützt keine Bild-zu-Video Generierung`)
  }

  const startTime = Date.now()

  try {
    // Erstelle Input basierend auf Modell-Typ
    let input: Record<string, unknown>

    if (model.type === 'image-animation') {
      input = {
        input_image: imageUrl,
        motion_bucket_id: 127,
        fps: 25,
        cond_aug: 0.02,
      } as ImageAnimationInput
    } else {
      input = {
        prompt,
        first_frame_image: imageUrl,
        prompt_optimizer: model.supportsPromptOptimizer ?? false,
      } as VideoGenerationInput
    }

    // Erstelle Prediction
    const createResponse = await createPrediction(model.id, input)
    
    // Warte auf Ergebnis
    const prediction = await waitForPrediction(createResponse.id)
    
    const responseTime = Date.now() - startTime

    if (prediction.status !== 'succeeded') {
      throw new Error(prediction.error || 'Video-Generierung fehlgeschlagen')
    }

    // Extrahiere Video-URL
    const videoUrl = Array.isArray(prediction.output) 
      ? prediction.output[0] 
      : prediction.output as string

    if (!videoUrl) {
      throw new Error('Keine Video-URL in der Antwort')
    }

    // Logge Nutzung
    await logAIUsage({
      userId: options.userId,
      salonId: options.salonId,
      userType: options.userType || 'admin',
      requestType: 'video_generation',
      model: model.id,
      provider: 'replicate',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: model.costPerRun,
      responseTimeMs: responseTime,
      success: true,
      metadata: {
        predictionId: prediction.id,
        prompt,
        imageUrl,
        modelKey,
        predictTime: prediction.metrics?.predict_time,
      },
    })

    return { videoUrl, prediction }
  } catch (error) {
    const responseTime = Date.now() - startTime

    // Logge Fehler
    await logAIUsage({
      userId: options.userId,
      salonId: options.salonId,
      userType: options.userType || 'admin',
      requestType: 'video_generation',
      model: model.id,
      provider: 'replicate',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      responseTimeMs: responseTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unbekannter Fehler',
      metadata: {
        prompt,
        imageUrl,
        modelKey,
      },
    })

    throw error
  }
}

/**
 * Cancelt eine laufende Prediction
 */
export async function cancelPrediction(predictionId: string): Promise<void> {
  const config = await getReplicateConfig()

  if (!config.apiKey) {
    throw new Error('Replicate API-Key nicht konfiguriert')
  }

  const response = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Replicate API Error: ${response.status} - ${errorText}`)
  }
}

