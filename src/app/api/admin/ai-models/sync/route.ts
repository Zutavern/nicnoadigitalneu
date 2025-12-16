/**
 * Admin AI Models Sync API
 * 
 * POST: Synchronisiert Modelle aus dem Code mit der Datenbank
 * Aktualisiert Kosten, fügt neue Modelle hinzu, behält benutzerdefinierte Margen
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AIModelCategory, AIModelProvider } from '@prisma/client'

// Diese Daten kommen aus den bestehenden Modelldefinitionen
// In einer Produktionsumgebung würden diese dynamisch aus den Quelldateien geladen

interface OpenRouterModel {
  modelId: string
  modelKey: string
  name: string
  description?: string
  subcategory?: string
  costPerInputToken: number
  costPerOutputToken: number
  isFree?: boolean
}

interface ReplicateModel {
  modelId: string
  modelKey: string
  name: string
  description: string
  costPerRun: number
  avgDurationMs: number
  isFree?: boolean
}

// OpenRouter Models (aktuelle Preise Stand Dez 2024)
const OPENROUTER_MODELS: OpenRouterModel[] = [
  { modelId: 'openai/gpt-4o', modelKey: 'gpt-4o', name: 'GPT-4o', subcategory: 'pro', costPerInputToken: 2.5, costPerOutputToken: 10 },
  { modelId: 'openai/gpt-4o-mini', modelKey: 'gpt-4o-mini', name: 'GPT-4o Mini', subcategory: 'recommended', costPerInputToken: 0.15, costPerOutputToken: 0.6 },
  { modelId: 'openai/gpt-4-turbo', modelKey: 'gpt-4-turbo', name: 'GPT-4 Turbo', subcategory: 'pro', costPerInputToken: 10, costPerOutputToken: 30 },
  { modelId: 'openai/gpt-4.5-preview', modelKey: 'gpt-4.5-preview', name: 'GPT-4.5 Preview', subcategory: 'pro', costPerInputToken: 75, costPerOutputToken: 150 },
  { modelId: 'openai/gpt-3.5-turbo', modelKey: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', subcategory: 'fast', costPerInputToken: 0.5, costPerOutputToken: 1.5 },
  { modelId: 'openai/o1', modelKey: 'o1', name: 'OpenAI o1', subcategory: 'reasoning', costPerInputToken: 15, costPerOutputToken: 60 },
  { modelId: 'openai/o1-mini', modelKey: 'o1-mini', name: 'OpenAI o1 Mini', subcategory: 'reasoning', costPerInputToken: 3, costPerOutputToken: 12 },
  { modelId: 'openai/o3-mini', modelKey: 'o3-mini', name: 'OpenAI o3 Mini', subcategory: 'reasoning', costPerInputToken: 1.1, costPerOutputToken: 4.4 },
  { modelId: 'anthropic/claude-sonnet-4', modelKey: 'claude-sonnet-4', name: 'Claude 4 Sonnet', subcategory: 'pro', costPerInputToken: 3, costPerOutputToken: 15 },
  { modelId: 'anthropic/claude-3.5-sonnet', modelKey: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', subcategory: 'recommended', costPerInputToken: 3, costPerOutputToken: 15 },
  { modelId: 'anthropic/claude-3-opus', modelKey: 'claude-3-opus', name: 'Claude 3 Opus', subcategory: 'pro', costPerInputToken: 15, costPerOutputToken: 75 },
  { modelId: 'anthropic/claude-3.5-haiku', modelKey: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', subcategory: 'fast', costPerInputToken: 0.8, costPerOutputToken: 4 },
  { modelId: 'google/gemini-2.0-flash', modelKey: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', subcategory: 'recommended', costPerInputToken: 0.1, costPerOutputToken: 0.4 },
  { modelId: 'google/gemini-2.5-pro-preview', modelKey: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', subcategory: 'pro', costPerInputToken: 1.25, costPerOutputToken: 10 },
  { modelId: 'deepseek/deepseek-r1', modelKey: 'deepseek-r1', name: 'DeepSeek R1', subcategory: 'reasoning', costPerInputToken: 0.55, costPerOutputToken: 2.19 },
  { modelId: 'deepseek/deepseek-chat', modelKey: 'deepseek-chat', name: 'DeepSeek Chat', subcategory: 'fast', costPerInputToken: 0.14, costPerOutputToken: 0.28 },
  { modelId: 'meta-llama/llama-3.3-70b-instruct', modelKey: 'llama-3.3-70b', name: 'Llama 3.3 70B', subcategory: 'pro', costPerInputToken: 0.3, costPerOutputToken: 0.4 },
  { modelId: 'mistralai/codestral-latest', modelKey: 'codestral', name: 'Codestral', subcategory: 'coding', costPerInputToken: 0.3, costPerOutputToken: 0.9 },
  { modelId: 'qwen/qwen-2.5-coder-32b-instruct', modelKey: 'qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B', subcategory: 'coding', costPerInputToken: 0.07, costPerOutputToken: 0.16 },
]

// Replicate Image Models
const REPLICATE_IMAGE_MODELS: ReplicateModel[] = [
  { modelId: 'black-forest-labs/flux-schnell', modelKey: 'flux-schnell', name: 'Flux Schnell', description: 'Schnell & kostenlos', costPerRun: 0.003, avgDurationMs: 5000, isFree: true },
  { modelId: 'black-forest-labs/flux-dev', modelKey: 'flux-dev', name: 'Flux Dev', description: 'Gute Qualität', costPerRun: 0.025, avgDurationMs: 15000 },
  { modelId: 'black-forest-labs/flux-1.1-pro', modelKey: 'flux-pro-11', name: 'Flux Pro 1.1', description: 'Premium Qualität', costPerRun: 0.04, avgDurationMs: 20000 },
  { modelId: 'stability-ai/sdxl', modelKey: 'sdxl', name: 'Stable Diffusion XL', description: 'Klassische SDXL', costPerRun: 0.004, avgDurationMs: 8000 },
  { modelId: 'bytedance/sdxl-lightning-4step', modelKey: 'sdxl-lightning', name: 'SDXL Lightning', description: 'Ultra-schnell', costPerRun: 0.002, avgDurationMs: 3000, isFree: true },
  { modelId: 'ideogram-ai/ideogram-v2-turbo', modelKey: 'ideogram', name: 'Ideogram V2', description: 'Text auf Bildern', costPerRun: 0.01, avgDurationMs: 8000 },
]

// Replicate Video Models
const REPLICATE_VIDEO_MODELS: ReplicateModel[] = [
  { modelId: 'minimax/video-01', modelKey: 'minimax-video-01', name: 'Minimax Video-01', description: 'Text-zu-Video', costPerRun: 0.25, avgDurationMs: 60000 },
  { modelId: 'minimax/video-01-live', modelKey: 'minimax-video-01-live', name: 'Minimax Video-01 Live', description: 'Bild-zu-Video', costPerRun: 0.25, avgDurationMs: 60000 },
  { modelId: 'stability-ai/stable-video-diffusion', modelKey: 'stable-video-diffusion', name: 'Stable Video Diffusion', description: 'Bild-Animation', costPerRun: 0.04, avgDurationMs: 30000 },
  { modelId: 'tencent/cogvideox-5b', modelKey: 'cogvideox', name: 'CogVideoX 5B', description: 'Text-zu-Video', costPerRun: 0.20, avgDurationMs: 90000 },
  { modelId: 'lucataco/animate-diff', modelKey: 'animatediff', name: 'AnimateDiff', description: 'Bild-Animation', costPerRun: 0.05, avgDurationMs: 45000 },
]

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let created = 0
    let updated = 0
    const errors: string[] = []

    // Sync OpenRouter Modelle
    for (const model of OPENROUTER_MODELS) {
      try {
        const existing = await prisma.aIModelConfig.findUnique({
          where: { modelKey: model.modelKey },
        })

        if (existing) {
          // Update nur Kosten, behalte benutzerdefinierte Marge
          const margin = existing.marginPercent
          await prisma.aIModelConfig.update({
            where: { modelKey: model.modelKey },
            data: {
              costPerInputToken: model.costPerInputToken,
              costPerOutputToken: model.costPerOutputToken,
              pricePerInputToken: model.costPerInputToken * (1 + margin / 100),
              pricePerOutputToken: model.costPerOutputToken * (1 + margin / 100),
              name: model.name,
              subcategory: model.subcategory,
            },
          })
          updated++
        } else {
          // Neues Modell erstellen
          const defaultMargin = 40
          await prisma.aIModelConfig.create({
            data: {
              provider: AIModelProvider.OPENROUTER,
              modelId: model.modelId,
              modelKey: model.modelKey,
              name: model.name,
              description: model.description,
              category: AIModelCategory.TEXT,
              subcategory: model.subcategory,
              costPerInputToken: model.costPerInputToken,
              costPerOutputToken: model.costPerOutputToken,
              marginPercent: defaultMargin,
              pricePerInputToken: model.costPerInputToken * (1 + defaultMargin / 100),
              pricePerOutputToken: model.costPerOutputToken * (1 + defaultMargin / 100),
              isFree: model.isFree ?? false,
              isActive: true,
            },
          })
          created++
        }
      } catch (e) {
        errors.push(`OpenRouter ${model.modelKey}: ${e}`)
      }
    }

    // Sync Replicate Image Modelle
    for (const model of REPLICATE_IMAGE_MODELS) {
      try {
        const existing = await prisma.aIModelConfig.findUnique({
          where: { modelKey: model.modelKey },
        })

        if (existing) {
          const margin = existing.marginPercent
          await prisma.aIModelConfig.update({
            where: { modelKey: model.modelKey },
            data: {
              costPerRun: model.costPerRun,
              pricePerRun: model.costPerRun * (1 + margin / 100),
              name: model.name,
              avgDurationMs: model.avgDurationMs,
            },
          })
          updated++
        } else {
          const defaultMargin = 50
          await prisma.aIModelConfig.create({
            data: {
              provider: AIModelProvider.REPLICATE,
              modelId: model.modelId,
              modelKey: model.modelKey,
              name: model.name,
              description: model.description,
              category: AIModelCategory.IMAGE,
              costPerRun: model.costPerRun,
              marginPercent: defaultMargin,
              pricePerRun: model.costPerRun * (1 + defaultMargin / 100),
              avgDurationMs: model.avgDurationMs,
              isFree: model.isFree ?? false,
              isActive: true,
            },
          })
          created++
        }
      } catch (e) {
        errors.push(`Replicate Image ${model.modelKey}: ${e}`)
      }
    }

    // Sync Replicate Video Modelle
    for (const model of REPLICATE_VIDEO_MODELS) {
      try {
        const existing = await prisma.aIModelConfig.findUnique({
          where: { modelKey: model.modelKey },
        })

        if (existing) {
          const margin = existing.marginPercent
          await prisma.aIModelConfig.update({
            where: { modelKey: model.modelKey },
            data: {
              costPerRun: model.costPerRun,
              pricePerRun: model.costPerRun * (1 + margin / 100),
              name: model.name,
              avgDurationMs: model.avgDurationMs,
            },
          })
          updated++
        } else {
          const defaultMargin = 35
          await prisma.aIModelConfig.create({
            data: {
              provider: AIModelProvider.REPLICATE,
              modelId: model.modelId,
              modelKey: model.modelKey,
              name: model.name,
              description: model.description,
              category: AIModelCategory.VIDEO,
              costPerRun: model.costPerRun,
              marginPercent: defaultMargin,
              pricePerRun: model.costPerRun * (1 + defaultMargin / 100),
              avgDurationMs: model.avgDurationMs,
              isFree: false,
              isActive: true,
            },
          })
          created++
        }
      } catch (e) {
        errors.push(`Replicate Video ${model.modelKey}: ${e}`)
      }
    }

    return NextResponse.json({
      message: `Sync abgeschlossen: ${created} erstellt, ${updated} aktualisiert`,
      created,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Error syncing AI models:', error)
    return NextResponse.json(
      { error: 'Fehler beim Synchronisieren der Modelle' },
      { status: 500 }
    )
  }
}

