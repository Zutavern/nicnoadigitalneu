/**
 * Replicate Model Definitions
 * 
 * Verfügbare Modelle für Bild- und Video-Generierung
 * 
 * WICHTIG: Modell-IDs müssen exakt mit Replicate übereinstimmen
 * Format: {owner}/{model-name}
 */

import { ReplicateModel } from './types'

// Erweiterte Model-Definition mit optionaler Version
export interface ExtendedReplicateModel extends ReplicateModel {
  version?: string // Optionale Version für direkte API-Calls
}

// Bild-Generierungs-Modelle
export interface ImageModel {
  id: string
  name: string
  description: string
  costPerRun: number
  avgDuration: number
  outputFormat: 'png' | 'jpg' | 'webp'
  supportsAspectRatio: boolean
  maxResolution?: number
  free?: boolean
}

// Bild-Generierungs-Modelle - geprüfte und verfügbare Modelle
export const IMAGE_MODELS: Record<string, ImageModel> = {
  // Flux Schnell - KOSTENLOS und SCHNELL (empfohlen)
  'flux-schnell': {
    id: 'black-forest-labs/flux-schnell',
    name: 'Flux Schnell',
    description: 'Schnell & kostenlos - perfekt für Social Media',
    costPerRun: 0.003,
    avgDuration: 5,
    outputFormat: 'webp',
    supportsAspectRatio: true,
    maxResolution: 1440,
    free: true,
  },

  // Flux Dev - Bessere Qualität als Schnell
  'flux-dev': {
    id: 'black-forest-labs/flux-dev',
    name: 'Flux Dev',
    description: 'Gute Qualität mit Prompt-Adherence',
    costPerRun: 0.025,
    avgDuration: 15,
    outputFormat: 'webp',
    supportsAspectRatio: true,
    maxResolution: 1440,
  },

  // Flux Pro 1.1 - Premium Qualität
  'flux-pro-11': {
    id: 'black-forest-labs/flux-1.1-pro',
    name: 'Flux Pro 1.1',
    description: 'Premium Qualität für professionelle Anwendung',
    costPerRun: 0.04,
    avgDuration: 20,
    outputFormat: 'webp',
    supportsAspectRatio: true,
    maxResolution: 1440,
  },

  // Stable Diffusion XL - Klassiker
  'sdxl': {
    id: 'stability-ai/sdxl',
    name: 'Stable Diffusion XL',
    description: 'Klassische SDXL Qualität, viele Stile',
    costPerRun: 0.004,
    avgDuration: 8,
    outputFormat: 'png',
    supportsAspectRatio: false,
    maxResolution: 1024,
  },

  // Stable Diffusion 3.5 Large Turbo - Neu & Schnell
  'sd35-turbo': {
    id: 'stability-ai/stable-diffusion-3.5-large-turbo',
    name: 'SD 3.5 Large Turbo',
    description: 'Neueste SD Version, schnell & qualitativ',
    costPerRun: 0.006,
    avgDuration: 6,
    outputFormat: 'webp',
    supportsAspectRatio: true,
    maxResolution: 1440,
  },

  // PlaygroundV2.5 - Kreativ & Künstlerisch
  'playground-v25': {
    id: 'playgroundai/playground-v2.5-1024px-aesthetic',
    name: 'Playground V2.5',
    description: 'Künstlerisch & ästhetisch, ideal für Social Media',
    costPerRun: 0.004,
    avgDuration: 8,
    outputFormat: 'png',
    supportsAspectRatio: false,
    maxResolution: 1024,
  },

  // SDXL Lightning - Ultra-Schnell
  'sdxl-lightning': {
    id: 'bytedance/sdxl-lightning-4step',
    name: 'SDXL Lightning',
    description: 'Ultra-schnell in 4 Schritten',
    costPerRun: 0.002,
    avgDuration: 3,
    outputFormat: 'webp',
    supportsAspectRatio: false,
    maxResolution: 1024,
    free: true,
  },

  // RealVisXL - Fotorealistisch
  'realvisxl': {
    id: 'adirik/realvisxl-v4.0',
    name: 'RealVisXL V4',
    description: 'Fotorealistisch - ideal für Produktbilder',
    costPerRun: 0.004,
    avgDuration: 10,
    outputFormat: 'png',
    supportsAspectRatio: false,
    maxResolution: 1024,
  },

  // Ideogram - Text auf Bildern
  'ideogram': {
    id: 'ideogram-ai/ideogram-v2-turbo',
    name: 'Ideogram V2 Turbo',
    description: 'Beste Text-auf-Bild Qualität',
    costPerRun: 0.01,
    avgDuration: 8,
    outputFormat: 'png',
    supportsAspectRatio: true,
    maxResolution: 1280,
  },
}

// Standard Bildmodell
export const DEFAULT_IMAGE_MODEL = 'flux-schnell'

// Bild Model Pricing
export const IMAGE_MODEL_PRICING: Record<string, number> = Object.fromEntries(
  Object.entries(IMAGE_MODELS).map(([key, model]) => [model.id, model.costPerRun])
)

/**
 * Holt ein Bildmodell nach Key
 */
export function getImageModel(key: string): ImageModel | null {
  return IMAGE_MODELS[key] || null
}

/**
 * Holt ein Bildmodell nach Replicate-ID
 */
export function getImageModelById(id: string): ImageModel | null {
  return Object.values(IMAGE_MODELS).find(m => m.id === id) || null
}

/**
 * Liste aller verfügbaren Bild-Modelle
 */
export function getAvailableImageModels(): Array<ImageModel & { key: string }> {
  return Object.entries(IMAGE_MODELS).map(([key, model]) => ({
    key,
    ...model,
  }))
}

/**
 * Holt kostenlose Bildmodelle
 */
export function getFreeImageModels(): Array<ImageModel & { key: string }> {
  return getAvailableImageModels().filter(m => m.free === true)
}

// Video-Generierungs-Modelle - geprüfte und verfügbare Modelle
export const VIDEO_MODELS: Record<string, ExtendedReplicateModel> = {
  // Minimax Video-01 - Hochwertige Text-to-Video
  'minimax-video-01': {
    id: 'minimax/video-01',
    name: 'Minimax Video-01',
    description: 'Hochwertige Text-zu-Video Generierung mit Prompt-Optimizer',
    type: 'text-to-video',
    costPerRun: 0.25,
    avgDuration: 60,
    outputFormat: 'mp4',
    maxDuration: 6,
    supportsPromptOptimizer: true,
  },

  // Minimax Video-01 Live - Bild-zu-Video
  'minimax-video-01-live': {
    id: 'minimax/video-01-live',
    name: 'Minimax Video-01 Live',
    description: 'Bild-zu-Video Animation',
    type: 'image-to-video',
    costPerRun: 0.25,
    avgDuration: 60,
    outputFormat: 'mp4',
    maxDuration: 6,
    supportsPromptOptimizer: true,
  },

  // Stable Video Diffusion - Günstige Bild-Animation
  // Korrekter Modell-Name auf Replicate
  'stable-video-diffusion': {
    id: 'stability-ai/stable-video-diffusion',
    name: 'Stable Video Diffusion',
    description: 'Bild-Animation mit 25 Frames',
    type: 'image-animation',
    costPerRun: 0.04,
    avgDuration: 30,
    outputFormat: 'mp4',
    maxDuration: 4,
  },

  // CogVideoX - Open Source Text-to-Video (Alternative)
  'cogvideox': {
    id: 'tencent/cogvideox-5b',
    name: 'CogVideoX 5B',
    description: 'Open-Source Text-zu-Video Modell',
    type: 'text-to-video',
    costPerRun: 0.20,
    avgDuration: 90,
    outputFormat: 'mp4',
    maxDuration: 6,
    supportsPromptOptimizer: false,
  },

  // AnimateDiff - Bild-Animation (Alternative)
  'animatediff': {
    id: 'lucataco/animate-diff',
    name: 'AnimateDiff',
    description: 'Bild-Animation mit Bewegungssteuerung',
    type: 'image-animation',
    costPerRun: 0.05,
    avgDuration: 45,
    outputFormat: 'mp4',
    maxDuration: 3,
    supportsPromptOptimizer: false,
  },
}

// Standardmodell
export const DEFAULT_VIDEO_MODEL = 'minimax-video-01'

// Model Pricing für Kosten-Kalkulation
export const MODEL_PRICING: Record<string, number> = Object.fromEntries(
  Object.entries(VIDEO_MODELS).map(([key, model]) => [model.id, model.costPerRun])
)

/**
 * Holt ein Modell nach Key
 */
export function getVideoModel(key: string): ReplicateModel | null {
  return VIDEO_MODELS[key] || null
}

/**
 * Holt ein Modell nach Replicate-ID
 */
export function getVideoModelById(id: string): ReplicateModel | null {
  return Object.values(VIDEO_MODELS).find(m => m.id === id) || null
}

/**
 * Liste aller verfügbaren Video-Modelle
 */
export function getAvailableVideoModels(): Array<ReplicateModel & { key: string }> {
  return Object.entries(VIDEO_MODELS).map(([key, model]) => ({
    key,
    ...model,
  }))
}

/**
 * Holt Modelle nach Typ
 */
export function getVideoModelsByType(type: ReplicateModel['type']): Array<ReplicateModel & { key: string }> {
  return getAvailableVideoModels().filter(m => m.type === type)
}

/**
 * Berechnet geschätzte Kosten für ein Modell
 */
export function estimateCost(modelKey: string, quantity: number = 1): number {
  const model = getVideoModel(modelKey)
  if (!model) return 0
  return model.costPerRun * quantity
}

