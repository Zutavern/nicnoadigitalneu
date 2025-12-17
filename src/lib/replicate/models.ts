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
  category?: 'fast' | 'quality' | 'premium' | 'editing'
}

/**
 * Bild-Generierungs-Modelle - verifiziert und aktualisiert
 * 
 * Quellen:
 * - https://replicate.com/black-forest-labs/flux-schnell
 * - https://replicate.com/black-forest-labs/flux-1.1-pro
 * - https://replicate.com/google/imagen-4
 * - https://replicate.com/google/imagen-4-fast
 * - https://replicate.com/ideogram-ai/ideogram-v3-turbo
 * - https://replicate.com/bytedance/seedream-4
 * - https://replicate.com/qwen/qwen-image
 * - https://replicate.com/google/nano-banana-pro
 * - https://replicate.com/black-forest-labs/flux-kontext-max
 */
export const IMAGE_MODELS: Record<string, ImageModel> = {
  // ============================================
  // SCHNELLE MODELLE (Empfohlen für Social Media)
  // ============================================
  
  // Flux Schnell - SCHNELLSTES Modell (571M+ Runs)
  'flux-schnell': {
    id: 'black-forest-labs/flux-schnell',
    name: 'Flux Schnell ⚡',
    description: 'Schnellstes Modell - 1-4 Schritte, ideal für Social Media',
    costPerRun: 0.003,
    avgDuration: 3,
    outputFormat: 'webp',
    supportsAspectRatio: true,
    maxResolution: 1440,
    free: true,
    category: 'fast',
  },

  // Google Imagen 4 Fast - Schnelle Version (2.7M+ Runs)
  'imagen-4-fast': {
    id: 'google/imagen-4-fast',
    name: 'Imagen 4 Fast ⚡',
    description: 'Google AI - 10x schneller als Imagen 3',
    costPerRun: 0.02,
    avgDuration: 5,
    outputFormat: 'png',
    supportsAspectRatio: true,
    maxResolution: 2048,
    category: 'fast',
  },

  // Ideogram V3 Turbo - Schnell & günstig (5.4M+ Runs)
  'ideogram-v3-turbo': {
    id: 'ideogram-ai/ideogram-v3-turbo',
    name: 'Ideogram V3 Turbo ⚡',
    description: 'Beste Text-Rendering - $0.03/Bild',
    costPerRun: 0.03,
    avgDuration: 6,
    outputFormat: 'png',
    supportsAspectRatio: true,
    maxResolution: 1280,
    category: 'fast',
  },

  // ============================================
  // QUALITÄTS-MODELLE (Beste Ergebnisse)
  // ============================================

  // Flux Pro 1.1 - Premium Qualität (65M+ Runs)
  'flux-pro-11': {
    id: 'black-forest-labs/flux-1.1-pro',
    name: 'Flux Pro 1.1 ✨',
    description: '6x schneller als Flux Pro, höchste Qualität',
    costPerRun: 0.04,
    avgDuration: 8,
    outputFormat: 'webp',
    supportsAspectRatio: true,
    maxResolution: 1440,
    category: 'quality',
  },

  // Google Imagen 4 - Flagship (6.5M+ Runs)
  'imagen-4': {
    id: 'google/imagen-4',
    name: 'Imagen 4 ✨',
    description: 'Google Flagship - Feine Details, 2K Auflösung',
    costPerRun: 0.04,
    avgDuration: 15,
    outputFormat: 'png',
    supportsAspectRatio: true,
    maxResolution: 2048,
    category: 'quality',
  },

  // ByteDance Seedream 4 - 4K Generierung (18M+ Runs)
  'seedream-4': {
    id: 'bytedance/seedream-4',
    name: 'Seedream 4 ✨',
    description: 'ByteDance - bis zu 4K, Multi-Referenz',
    costPerRun: 0.035,
    avgDuration: 10,
    outputFormat: 'png',
    supportsAspectRatio: true,
    maxResolution: 4096,
    category: 'quality',
  },

  // Qwen Image - Text-Rendering Spezialist (1.2M+ Runs)
  'qwen-image': {
    id: 'qwen/qwen-image',
    name: 'Qwen Image',
    description: 'Alibaba - Beste komplexe Text-Generierung',
    costPerRun: 0.025,
    avgDuration: 12,
    outputFormat: 'png',
    supportsAspectRatio: true,
    maxResolution: 2048,
    category: 'quality',
  },

  // ============================================
  // PREMIUM MODELLE (Höchste Qualität)
  // ============================================

  // Google Nano Banana Pro - State of the Art (4.7M+ Runs)
  'nano-banana-pro': {
    id: 'google/nano-banana-pro',
    name: 'Nano Banana Pro 🍌',
    description: 'Google State-of-Art - Generation & Editing',
    costPerRun: 0.05,
    avgDuration: 15,
    outputFormat: 'png',
    supportsAspectRatio: true,
    maxResolution: 2048,
    category: 'premium',
  },

  // ============================================
  // EDITING MODELLE (Bild-Bearbeitung)
  // ============================================

  // Flux Kontext Max - Bild-Editing (9.3M+ Runs)
  'flux-kontext-max': {
    id: 'black-forest-labs/flux-kontext-max',
    name: 'Flux Kontext Max 🎨',
    description: 'Premium Bild-Editing via Text-Prompts',
    costPerRun: 0.05,
    avgDuration: 12,
    outputFormat: 'webp',
    supportsAspectRatio: true,
    maxResolution: 1440,
    category: 'editing',
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

