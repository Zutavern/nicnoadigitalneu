/**
 * Replicate API Types
 */

// Prediction Status
export type PredictionStatus = 
  | 'starting' 
  | 'processing' 
  | 'succeeded' 
  | 'failed' 
  | 'canceled'

// Base Prediction
export interface ReplicatePrediction {
  id: string
  version: string
  status: PredictionStatus
  input: Record<string, unknown>
  output: unknown
  error: string | null
  logs: string | null
  metrics?: {
    predict_time?: number
    total_time?: number
  }
  created_at: string
  started_at: string | null
  completed_at: string | null
  urls: {
    get: string
    cancel: string
  }
}

// Video Generation Input (Minimax)
export interface VideoGenerationInput {
  prompt: string
  prompt_optimizer?: boolean
  first_frame_image?: string // URL für Bild-zu-Video
}

// Image Animation Input (Stable Video Diffusion)
export interface ImageAnimationInput {
  input_image: string
  motion_bucket_id?: number
  fps?: number
  cond_aug?: number
  decoding_t?: number
  seed?: number
}

// Model Info
export interface ReplicateModel {
  id: string
  name: string
  description: string
  type: 'text-to-video' | 'image-to-video' | 'image-animation'
  costPerRun: number // USD
  avgDuration: number // Sekunden
  outputFormat: 'mp4' | 'webm' | 'gif'
  maxDuration?: number // Max Video-Länge in Sekunden
  supportsPromptOptimizer?: boolean
}

// Usage Log Entry
export interface ReplicateUsageEntry {
  userId?: string
  salonId?: string
  userType: 'admin' | 'salon_owner' | 'chair_renter'
  model: string
  predictionId: string
  status: PredictionStatus
  inputTokens?: number
  outputSeconds?: number
  costUsd: number
  responseTimeMs: number
  success: boolean
  errorMessage?: string
  metadata?: Record<string, unknown>
}

// API Response Types
export interface ReplicateCreatePredictionResponse {
  id: string
  version: string
  status: PredictionStatus
  input: Record<string, unknown>
  output: null
  error: null
  logs: null
  metrics: null
  created_at: string
  started_at: null
  completed_at: null
  urls: {
    get: string
    cancel: string
  }
}

export interface ReplicateGetPredictionResponse extends ReplicatePrediction {}

// Config Cache
export interface ReplicateConfigCache {
  apiKey: string | null
  enabled: boolean
  defaultVideoModel: string
  webhookSecret: string | null
}

