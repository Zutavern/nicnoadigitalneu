/**
 * AI Models Seed Script
 * 
 * Dieses Script fügt alle bekannten AI-Modelle aus OpenRouter und Replicate
 * in die Datenbank ein. Modelle können über das Admin-Panel bearbeitet werden.
 */

import 'dotenv/config'
import { PrismaClient, AIModelCategory, AIModelProvider } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use DIRECT_DATABASE_URL for pg adapter (TCP connection)
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_DATABASE_URL environment variable is required')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

// Default Margen nach Kategorie
const DEFAULT_MARGINS = {
  text: 40,      // 40% für Text-Modelle
  image: 50,     // 50% für Bild-Modelle
  video: 35,     // 35% für Video-Modelle (teurer, weniger Marge)
}

// ============================================
// OpenRouter Text-Modelle
// ============================================

interface OpenRouterModel {
  modelId: string
  modelKey: string
  name: string
  description?: string
  subcategory?: string
  costPerInputToken: number  // Pro 1M Tokens
  costPerOutputToken: number // Pro 1M Tokens
  isFree?: boolean
}

const openRouterModels: OpenRouterModel[] = [
  // ===== OpenAI Models =====
  {
    modelId: 'openai/gpt-4o',
    modelKey: 'gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI Flaggschiff - multimodal und leistungsstark',
    subcategory: 'pro',
    costPerInputToken: 2.5,
    costPerOutputToken: 10,
  },
  {
    modelId: 'openai/gpt-4o-mini',
    modelKey: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Schnell & günstig - ideal für die meisten Aufgaben',
    subcategory: 'recommended',
    costPerInputToken: 0.15,
    costPerOutputToken: 0.6,
  },
  {
    modelId: 'openai/gpt-4-turbo',
    modelKey: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Leistungsstarkes Modell mit 128K Kontext',
    subcategory: 'pro',
    costPerInputToken: 10,
    costPerOutputToken: 30,
  },
  {
    modelId: 'openai/gpt-4.5-preview',
    modelKey: 'gpt-4.5-preview',
    name: 'GPT-4.5 Preview',
    description: 'Neuestes OpenAI Preview Modell',
    subcategory: 'pro',
    costPerInputToken: 75,
    costPerOutputToken: 150,
  },
  {
    modelId: 'openai/gpt-3.5-turbo',
    modelKey: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Bewährtes Modell für einfache Aufgaben',
    subcategory: 'fast',
    costPerInputToken: 0.5,
    costPerOutputToken: 1.5,
  },
  // OpenAI Reasoning
  {
    modelId: 'openai/o1',
    modelKey: 'o1',
    name: 'OpenAI o1',
    description: 'Top Reasoning Modell für komplexe Probleme',
    subcategory: 'reasoning',
    costPerInputToken: 15,
    costPerOutputToken: 60,
  },
  {
    modelId: 'openai/o1-preview',
    modelKey: 'o1-preview',
    name: 'OpenAI o1 Preview',
    description: 'Reasoning Preview Version',
    subcategory: 'reasoning',
    costPerInputToken: 15,
    costPerOutputToken: 60,
  },
  {
    modelId: 'openai/o1-mini',
    modelKey: 'o1-mini',
    name: 'OpenAI o1 Mini',
    description: 'Schnelles Reasoning Modell',
    subcategory: 'reasoning',
    costPerInputToken: 3,
    costPerOutputToken: 12,
  },
  {
    modelId: 'openai/o3-mini',
    modelKey: 'o3-mini',
    name: 'OpenAI o3 Mini',
    description: 'Neuestes kompaktes Reasoning Modell',
    subcategory: 'reasoning',
    costPerInputToken: 1.1,
    costPerOutputToken: 4.4,
  },
  {
    modelId: 'openai/o3-mini-high',
    modelKey: 'o3-mini-high',
    name: 'OpenAI o3 Mini High',
    description: 'Hohe Präzision Reasoning',
    subcategory: 'reasoning',
    costPerInputToken: 1.1,
    costPerOutputToken: 4.4,
  },

  // ===== Anthropic Models =====
  {
    modelId: 'anthropic/claude-sonnet-4',
    modelKey: 'claude-sonnet-4',
    name: 'Claude 4 Sonnet',
    description: 'Neuestes Claude - beste Balance aus Qualität und Geschwindigkeit',
    subcategory: 'pro',
    costPerInputToken: 3,
    costPerOutputToken: 15,
  },
  {
    modelId: 'anthropic/claude-3.5-sonnet',
    modelKey: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Beste Balance aus Qualität und Geschwindigkeit',
    subcategory: 'recommended',
    costPerInputToken: 3,
    costPerOutputToken: 15,
  },
  {
    modelId: 'anthropic/claude-3.5-sonnet:beta',
    modelKey: 'claude-3.5-sonnet-beta',
    name: 'Claude 3.5 Sonnet Beta',
    description: 'Beta Version mit neuesten Features',
    subcategory: 'pro',
    costPerInputToken: 3,
    costPerOutputToken: 15,
  },
  {
    modelId: 'anthropic/claude-3-opus',
    modelKey: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Maximale Qualität für anspruchsvolle Aufgaben',
    subcategory: 'pro',
    costPerInputToken: 15,
    costPerOutputToken: 75,
  },
  {
    modelId: 'anthropic/claude-3-haiku',
    modelKey: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Schnell und effizient',
    subcategory: 'fast',
    costPerInputToken: 0.25,
    costPerOutputToken: 1.25,
  },
  {
    modelId: 'anthropic/claude-3.5-haiku',
    modelKey: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    description: 'Schnell & günstig',
    subcategory: 'fast',
    costPerInputToken: 0.8,
    costPerOutputToken: 4,
  },

  // ===== Google Models =====
  {
    modelId: 'google/gemini-2.5-pro-preview',
    modelKey: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google Flaggschiff - neuestes Modell',
    subcategory: 'pro',
    costPerInputToken: 1.25,
    costPerOutputToken: 10,
  },
  {
    modelId: 'google/gemini-2.5-flash-preview',
    modelKey: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Schnell und intelligent',
    subcategory: 'fast',
    costPerInputToken: 0.15,
    costPerOutputToken: 0.6,
  },
  {
    modelId: 'google/gemini-2.0-flash',
    modelKey: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Sehr schnell mit guter Qualität',
    subcategory: 'recommended',
    costPerInputToken: 0.1,
    costPerOutputToken: 0.4,
  },
  {
    modelId: 'google/gemini-2.0-flash-thinking',
    modelKey: 'gemini-2.0-flash-thinking',
    name: 'Gemini 2.0 Flash Thinking',
    description: 'Google Reasoning Modell',
    subcategory: 'reasoning',
    costPerInputToken: 0.1,
    costPerOutputToken: 0.4,
  },
  {
    modelId: 'google/gemini-pro-1.5',
    modelKey: 'gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'Leistungsstarkes Modell mit 1M Kontext',
    subcategory: 'pro',
    costPerInputToken: 2.5,
    costPerOutputToken: 7.5,
  },
  {
    modelId: 'google/gemini-flash-1.5',
    modelKey: 'gemini-flash-1.5',
    name: 'Gemini Flash 1.5',
    description: 'Extrem schnell',
    subcategory: 'fast',
    costPerInputToken: 0.075,
    costPerOutputToken: 0.3,
  },
  {
    modelId: 'google/gemini-flash-1.5-8b',
    modelKey: 'gemini-flash-1.5-8b',
    name: 'Gemini Flash 1.5 8B',
    description: 'Kompaktes schnelles Modell',
    subcategory: 'fast',
    costPerInputToken: 0.0375,
    costPerOutputToken: 0.15,
  },

  // ===== xAI Models =====
  {
    modelId: 'x-ai/grok-2',
    modelKey: 'grok-2',
    name: 'Grok 2',
    description: 'xAI Standard Modell',
    subcategory: 'pro',
    costPerInputToken: 2,
    costPerOutputToken: 10,
  },
  {
    modelId: 'x-ai/grok-2-vision',
    modelKey: 'grok-2-vision',
    name: 'Grok 2 Vision',
    description: 'xAI mit Bildverständnis',
    subcategory: 'pro',
    costPerInputToken: 2,
    costPerOutputToken: 10,
  },
  {
    modelId: 'x-ai/grok-3-beta',
    modelKey: 'grok-3-beta',
    name: 'Grok 3 Beta',
    description: 'xAI Flaggschiff',
    subcategory: 'pro',
    costPerInputToken: 3,
    costPerOutputToken: 15,
  },

  // ===== DeepSeek Models =====
  {
    modelId: 'deepseek/deepseek-r1',
    modelKey: 'deepseek-r1',
    name: 'DeepSeek R1',
    description: 'Top Reasoning - günstig und leistungsstark',
    subcategory: 'reasoning',
    costPerInputToken: 0.55,
    costPerOutputToken: 2.19,
  },
  {
    modelId: 'deepseek/deepseek-chat',
    modelKey: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'Sehr günstig für einfache Aufgaben',
    subcategory: 'fast',
    costPerInputToken: 0.14,
    costPerOutputToken: 0.28,
  },
  {
    modelId: 'deepseek/deepseek-reasoner',
    modelKey: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    description: 'Reasoning Spezialist',
    subcategory: 'reasoning',
    costPerInputToken: 0.55,
    costPerOutputToken: 2.19,
  },

  // ===== Meta Llama Models =====
  {
    modelId: 'meta-llama/llama-3.3-70b-instruct',
    modelKey: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    description: 'Open Source Flaggschiff',
    subcategory: 'pro',
    costPerInputToken: 0.3,
    costPerOutputToken: 0.4,
  },
  {
    modelId: 'meta-llama/llama-3.1-70b-instruct',
    modelKey: 'llama-3.1-70b',
    name: 'Llama 3.1 70B',
    description: 'Bewährtes Open Source Modell',
    subcategory: 'pro',
    costPerInputToken: 0.52,
    costPerOutputToken: 0.75,
  },
  {
    modelId: 'meta-llama/llama-3.1-8b-instruct',
    modelKey: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    description: 'Kompaktes effizientes Modell',
    subcategory: 'fast',
    costPerInputToken: 0.055,
    costPerOutputToken: 0.055,
  },
  {
    modelId: 'meta-llama/llama-3.1-405b-instruct',
    modelKey: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    description: 'Größtes Open Source Modell',
    subcategory: 'pro',
    costPerInputToken: 2,
    costPerOutputToken: 2,
  },

  // ===== Mistral Models =====
  {
    modelId: 'mistralai/mistral-large-2411',
    modelKey: 'mistral-large-2411',
    name: 'Mistral Large 2411',
    description: 'Europäisches LLM - neueste Version',
    subcategory: 'pro',
    costPerInputToken: 2,
    costPerOutputToken: 6,
  },
  {
    modelId: 'mistralai/mistral-large',
    modelKey: 'mistral-large',
    name: 'Mistral Large',
    description: 'Europäisches LLM Flaggschiff',
    subcategory: 'pro',
    costPerInputToken: 2,
    costPerOutputToken: 6,
  },
  {
    modelId: 'mistralai/mistral-small-3.1-24b',
    modelKey: 'mistral-small-3.1',
    name: 'Mistral Small 3.1',
    description: 'Effizientes Mistral Modell',
    subcategory: 'fast',
    costPerInputToken: 0.1,
    costPerOutputToken: 0.3,
  },
  {
    modelId: 'mistralai/codestral-latest',
    modelKey: 'codestral',
    name: 'Codestral',
    description: 'Code-Spezialist von Mistral',
    subcategory: 'coding',
    costPerInputToken: 0.3,
    costPerOutputToken: 0.9,
  },

  // ===== Qwen Models =====
  {
    modelId: 'qwen/qwen-2.5-72b-instruct',
    modelKey: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    description: 'Starkes Open Source Modell',
    subcategory: 'pro',
    costPerInputToken: 0.35,
    costPerOutputToken: 0.4,
  },
  {
    modelId: 'qwen/qwen-2.5-coder-32b-instruct',
    modelKey: 'qwen-2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    description: 'Open Source Coding Spezialist',
    subcategory: 'coding',
    costPerInputToken: 0.07,
    costPerOutputToken: 0.16,
  },
  {
    modelId: 'qwen/qwq-32b',
    modelKey: 'qwq-32b',
    name: 'Qwen QwQ 32B',
    description: 'Open Source Reasoning',
    subcategory: 'reasoning',
    costPerInputToken: 0.12,
    costPerOutputToken: 0.18,
  },
]

// ============================================
// Replicate Bild-Modelle
// ============================================

interface ReplicateImageModel {
  modelId: string
  modelKey: string
  name: string
  description: string
  costPerRun: number
  avgDurationMs: number
  isFree?: boolean
}

const replicateImageModels: ReplicateImageModel[] = [
  {
    modelId: 'black-forest-labs/flux-schnell',
    modelKey: 'flux-schnell',
    name: 'Flux Schnell',
    description: 'Schnell & kostenlos - perfekt für Social Media',
    costPerRun: 0.003,
    avgDurationMs: 5000,
    isFree: true,
  },
  {
    modelId: 'black-forest-labs/flux-dev',
    modelKey: 'flux-dev',
    name: 'Flux Dev',
    description: 'Gute Qualität mit Prompt-Adherence',
    costPerRun: 0.025,
    avgDurationMs: 15000,
  },
  {
    modelId: 'black-forest-labs/flux-1.1-pro',
    modelKey: 'flux-pro-11',
    name: 'Flux Pro 1.1',
    description: 'Premium Qualität für professionelle Anwendung',
    costPerRun: 0.04,
    avgDurationMs: 20000,
  },
  {
    modelId: 'stability-ai/sdxl',
    modelKey: 'sdxl',
    name: 'Stable Diffusion XL',
    description: 'Klassische SDXL Qualität, viele Stile',
    costPerRun: 0.004,
    avgDurationMs: 8000,
  },
  {
    modelId: 'stability-ai/stable-diffusion-3.5-large-turbo',
    modelKey: 'sd35-turbo',
    name: 'SD 3.5 Large Turbo',
    description: 'Neueste SD Version, schnell & qualitativ',
    costPerRun: 0.006,
    avgDurationMs: 6000,
  },
  {
    modelId: 'playgroundai/playground-v2.5-1024px-aesthetic',
    modelKey: 'playground-v25',
    name: 'Playground V2.5',
    description: 'Künstlerisch & ästhetisch, ideal für Social Media',
    costPerRun: 0.004,
    avgDurationMs: 8000,
  },
  {
    modelId: 'bytedance/sdxl-lightning-4step',
    modelKey: 'sdxl-lightning',
    name: 'SDXL Lightning',
    description: 'Ultra-schnell in 4 Schritten',
    costPerRun: 0.002,
    avgDurationMs: 3000,
    isFree: true,
  },
  {
    modelId: 'adirik/realvisxl-v4.0',
    modelKey: 'realvisxl',
    name: 'RealVisXL V4',
    description: 'Fotorealistisch - ideal für Produktbilder',
    costPerRun: 0.004,
    avgDurationMs: 10000,
  },
  {
    modelId: 'ideogram-ai/ideogram-v2-turbo',
    modelKey: 'ideogram',
    name: 'Ideogram V2 Turbo',
    description: 'Beste Text-auf-Bild Qualität',
    costPerRun: 0.01,
    avgDurationMs: 8000,
  },
]

// ============================================
// Replicate Video-Modelle
// ============================================

interface ReplicateVideoModel {
  modelId: string
  modelKey: string
  name: string
  description: string
  costPerRun: number
  avgDurationMs: number
}

const replicateVideoModels: ReplicateVideoModel[] = [
  {
    modelId: 'minimax/video-01',
    modelKey: 'minimax-video-01',
    name: 'Minimax Video-01',
    description: 'Hochwertige Text-zu-Video Generierung mit Prompt-Optimizer',
    costPerRun: 0.25,
    avgDurationMs: 60000,
  },
  {
    modelId: 'minimax/video-01-live',
    modelKey: 'minimax-video-01-live',
    name: 'Minimax Video-01 Live',
    description: 'Bild-zu-Video Animation',
    costPerRun: 0.25,
    avgDurationMs: 60000,
  },
  {
    modelId: 'stability-ai/stable-video-diffusion',
    modelKey: 'stable-video-diffusion',
    name: 'Stable Video Diffusion',
    description: 'Bild-Animation mit 25 Frames',
    costPerRun: 0.04,
    avgDurationMs: 30000,
  },
  {
    modelId: 'tencent/cogvideox-5b',
    modelKey: 'cogvideox',
    name: 'CogVideoX 5B',
    description: 'Open-Source Text-zu-Video Modell',
    costPerRun: 0.20,
    avgDurationMs: 90000,
  },
  {
    modelId: 'lucataco/animate-diff',
    modelKey: 'animatediff',
    name: 'AnimateDiff',
    description: 'Bild-Animation mit Bewegungssteuerung',
    costPerRun: 0.05,
    avgDurationMs: 45000,
  },
]

// ============================================
// Hilfsfunktionen
// ============================================

function calculateSellingPrice(cost: number, marginPercent: number): number {
  return cost * (1 + marginPercent / 100)
}

// ============================================
// Seed Funktion
// ============================================

export async function seedAIModels() {
  console.log('🤖 Seeding AI Models...')

  let created = 0
  let updated = 0
  let sortOrder = 0

  // OpenRouter Text-Modelle
  console.log('  📝 OpenRouter Text-Modelle...')
  for (const model of openRouterModels) {
    const margin = DEFAULT_MARGINS.text
    const data = {
      provider: AIModelProvider.OPENROUTER,
      modelId: model.modelId,
      modelKey: model.modelKey,
      name: model.name,
      description: model.description || null,
      category: AIModelCategory.TEXT,
      subcategory: model.subcategory || null,
      costPerInputToken: model.costPerInputToken,
      costPerOutputToken: model.costPerOutputToken,
      marginPercent: margin,
      pricePerInputToken: calculateSellingPrice(model.costPerInputToken, margin),
      pricePerOutputToken: calculateSellingPrice(model.costPerOutputToken, margin),
      isFree: model.isFree || false,
      isActive: true,
      sortOrder: sortOrder++,
    }

    const existing = await prisma.aIModelConfig.findUnique({
      where: { modelKey: model.modelKey },
    })

    if (existing) {
      await prisma.aIModelConfig.update({
        where: { modelKey: model.modelKey },
        data: {
          ...data,
          // Behalte benutzerdefinierte Margen
          marginPercent: existing.marginPercent,
          pricePerInputToken: calculateSellingPrice(
            model.costPerInputToken,
            existing.marginPercent
          ),
          pricePerOutputToken: calculateSellingPrice(
            model.costPerOutputToken,
            existing.marginPercent
          ),
        },
      })
      updated++
    } else {
      await prisma.aIModelConfig.create({ data })
      created++
    }
  }

  // Replicate Bild-Modelle
  console.log('  🖼️  Replicate Bild-Modelle...')
  for (const model of replicateImageModels) {
    const margin = DEFAULT_MARGINS.image
    const data = {
      provider: AIModelProvider.REPLICATE,
      modelId: model.modelId,
      modelKey: model.modelKey,
      name: model.name,
      description: model.description,
      category: AIModelCategory.IMAGE,
      subcategory: null,
      costPerRun: model.costPerRun,
      marginPercent: margin,
      pricePerRun: calculateSellingPrice(model.costPerRun, margin),
      avgDurationMs: model.avgDurationMs,
      isFree: model.isFree || false,
      isActive: true,
      sortOrder: sortOrder++,
    }

    const existing = await prisma.aIModelConfig.findUnique({
      where: { modelKey: model.modelKey },
    })

    if (existing) {
      await prisma.aIModelConfig.update({
        where: { modelKey: model.modelKey },
        data: {
          ...data,
          marginPercent: existing.marginPercent,
          pricePerRun: calculateSellingPrice(model.costPerRun, existing.marginPercent),
        },
      })
      updated++
    } else {
      await prisma.aIModelConfig.create({ data })
      created++
    }
  }

  // Replicate Video-Modelle
  console.log('  🎬 Replicate Video-Modelle...')
  for (const model of replicateVideoModels) {
    const margin = DEFAULT_MARGINS.video
    const data = {
      provider: AIModelProvider.REPLICATE,
      modelId: model.modelId,
      modelKey: model.modelKey,
      name: model.name,
      description: model.description,
      category: AIModelCategory.VIDEO,
      subcategory: null,
      costPerRun: model.costPerRun,
      marginPercent: margin,
      pricePerRun: calculateSellingPrice(model.costPerRun, margin),
      avgDurationMs: model.avgDurationMs,
      isFree: false,
      isActive: true,
      sortOrder: sortOrder++,
    }

    const existing = await prisma.aIModelConfig.findUnique({
      where: { modelKey: model.modelKey },
    })

    if (existing) {
      await prisma.aIModelConfig.update({
        where: { modelKey: model.modelKey },
        data: {
          ...data,
          marginPercent: existing.marginPercent,
          pricePerRun: calculateSellingPrice(model.costPerRun, existing.marginPercent),
        },
      })
      updated++
    } else {
      await prisma.aIModelConfig.create({ data })
      created++
    }
  }

  console.log(`✅ AI Models seeded: ${created} created, ${updated} updated`)
  console.log(`   Total: ${openRouterModels.length + replicateImageModels.length + replicateVideoModels.length} models`)

  return { created, updated }
}

// Standalone execution
if (require.main === module) {
  seedAIModels()
    .then(() => {
      console.log('Done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error seeding AI models:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
      await pool.end()
    })
}

