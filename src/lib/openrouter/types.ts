// OpenRouter Types

export interface OpenRouterConfig {
  apiKey: string
  siteUrl?: string
  siteName?: string
  defaultModel?: string
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterRequest {
  model: string
  messages: OpenRouterMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  stream?: boolean
}

export interface OpenRouterUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface OpenRouterResponse {
  id: string
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: OpenRouterUsage
}

// OpenRouter gibt die Kosten nicht direkt zurück, aber wir können sie berechnen
export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  pricing: {
    prompt: number    // $ per 1M tokens
    completion: number // $ per 1M tokens
  }
  context_length: number
  top_provider?: {
    max_completion_tokens?: number
  }
}

// Vordefinierte Modell-Preise (Stand: Dez 2024)
// Preise in USD pro 1M Tokens
export const MODEL_PRICING: Record<string, { prompt: number; completion: number }> = {
  // ===== OpenAI Models =====
  'openai/gpt-4o': { prompt: 2.5, completion: 10 },
  'openai/gpt-4o-mini': { prompt: 0.15, completion: 0.6 },
  'openai/gpt-4-turbo': { prompt: 10, completion: 30 },
  'openai/gpt-4.5-preview': { prompt: 75, completion: 150 }, // Neuestes Preview
  'openai/gpt-3.5-turbo': { prompt: 0.5, completion: 1.5 },
  
  // OpenAI Reasoning Models (o-Serie)
  'openai/o1': { prompt: 15, completion: 60 },
  'openai/o1-preview': { prompt: 15, completion: 60 },
  'openai/o1-mini': { prompt: 3, completion: 12 },
  'openai/o3-mini': { prompt: 1.1, completion: 4.4 }, // Neuestes Reasoning
  'openai/o3-mini-high': { prompt: 1.1, completion: 4.4 },
  
  // ===== Anthropic Models =====
  'anthropic/claude-sonnet-4': { prompt: 3, completion: 15 }, // Claude 4 Sonnet
  'anthropic/claude-3.5-sonnet': { prompt: 3, completion: 15 },
  'anthropic/claude-3.5-sonnet:beta': { prompt: 3, completion: 15 },
  'anthropic/claude-3-opus': { prompt: 15, completion: 75 },
  'anthropic/claude-3-haiku': { prompt: 0.25, completion: 1.25 },
  'anthropic/claude-3.5-haiku': { prompt: 0.8, completion: 4 },
  
  // ===== Google Models =====
  'google/gemini-2.5-pro-preview': { prompt: 1.25, completion: 10 }, // Neuestes Gemini
  'google/gemini-2.5-flash-preview': { prompt: 0.15, completion: 0.6 },
  'google/gemini-2.0-flash': { prompt: 0.1, completion: 0.4 },
  'google/gemini-2.0-flash-thinking': { prompt: 0.1, completion: 0.4 }, // Reasoning
  'google/gemini-pro-1.5': { prompt: 2.5, completion: 7.5 },
  'google/gemini-flash-1.5': { prompt: 0.075, completion: 0.3 },
  'google/gemini-flash-1.5-8b': { prompt: 0.0375, completion: 0.15 },
  
  // ===== xAI Models =====
  'x-ai/grok-2': { prompt: 2, completion: 10 },
  'x-ai/grok-2-vision': { prompt: 2, completion: 10 },
  'x-ai/grok-3-beta': { prompt: 3, completion: 15 },
  
  // ===== DeepSeek Models =====
  'deepseek/deepseek-r1': { prompt: 0.55, completion: 2.19 }, // Top Reasoning Model
  'deepseek/deepseek-chat': { prompt: 0.14, completion: 0.28 },
  'deepseek/deepseek-reasoner': { prompt: 0.55, completion: 2.19 },
  
  // ===== Meta Llama Models =====
  'meta-llama/llama-3.3-70b-instruct': { prompt: 0.3, completion: 0.4 },
  'meta-llama/llama-3.1-70b-instruct': { prompt: 0.52, completion: 0.75 },
  'meta-llama/llama-3.1-8b-instruct': { prompt: 0.055, completion: 0.055 },
  'meta-llama/llama-3.1-405b-instruct': { prompt: 2, completion: 2 },
  
  // ===== Mistral Models =====
  'mistralai/mistral-large-2411': { prompt: 2, completion: 6 },
  'mistralai/mistral-large': { prompt: 2, completion: 6 },
  'mistralai/mistral-small-3.1-24b': { prompt: 0.1, completion: 0.3 },
  'mistralai/codestral-latest': { prompt: 0.3, completion: 0.9 },
  
  // ===== Qwen Models =====
  'qwen/qwen-2.5-72b-instruct': { prompt: 0.35, completion: 0.4 },
  'qwen/qwen-2.5-coder-32b-instruct': { prompt: 0.07, completion: 0.16 },
  'qwen/qwq-32b': { prompt: 0.12, completion: 0.18 }, // Reasoning
}

// Modell-Kategorien für bessere Organisation
export type ModelCategory = 'recommended' | 'reasoning' | 'pro' | 'fast' | 'coding'

// Beliebte Modelle für das Dropdown - nach Kategorien organisiert
export const POPULAR_MODELS: Array<{
  id: string
  name: string
  provider: string
  category?: ModelCategory
  description?: string
  recommended?: boolean
}> = [
  // ===== EMPFOHLEN =====
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', category: 'recommended', recommended: true, description: 'Schnell & günstig' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', category: 'recommended', description: 'Beste Balance' },
  { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', category: 'recommended', description: 'Sehr schnell' },
  
  // ===== PRO MODELLE =====
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', category: 'pro', description: 'OpenAI Flaggschiff' },
  { id: 'openai/gpt-4.5-preview', name: 'GPT-4.5 Preview', provider: 'OpenAI', category: 'pro', description: 'Neuestes OpenAI' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude 4 Sonnet', provider: 'Anthropic', category: 'pro', description: 'Neuestes Claude' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', category: 'pro', description: 'Maximale Qualität' },
  { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', provider: 'Google', category: 'pro', description: 'Google Flaggschiff' },
  { id: 'x-ai/grok-3-beta', name: 'Grok 3 Beta', provider: 'xAI', category: 'pro', description: 'xAI Flaggschiff' },
  
  // ===== REASONING MODELLE =====
  { id: 'openai/o1', name: 'OpenAI o1', provider: 'OpenAI', category: 'reasoning', description: 'Top Reasoning' },
  { id: 'openai/o1-mini', name: 'OpenAI o1-mini', provider: 'OpenAI', category: 'reasoning', description: 'Schnelles Reasoning' },
  { id: 'openai/o3-mini', name: 'OpenAI o3-mini', provider: 'OpenAI', category: 'reasoning', description: 'Neuestes Reasoning' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', category: 'reasoning', description: 'Günstig & stark' },
  { id: 'google/gemini-2.0-flash-thinking', name: 'Gemini 2.0 Flash Thinking', provider: 'Google', category: 'reasoning', description: 'Google Reasoning' },
  { id: 'qwen/qwq-32b', name: 'Qwen QwQ 32B', provider: 'Qwen', category: 'reasoning', description: 'Open Source Reasoning' },
  
  // ===== SCHNELLE MODELLE =====
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'Google', category: 'fast', description: 'Extrem schnell' },
  { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', provider: 'Google', category: 'fast', description: 'Schnell & smart' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', category: 'fast', description: 'Schnell & günstig' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', category: 'fast', description: 'Sehr günstig' },
  
  // ===== CODING MODELLE =====
  { id: 'mistralai/codestral-latest', name: 'Codestral', provider: 'Mistral', category: 'coding', description: 'Code-Spezialist' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B', provider: 'Qwen', category: 'coding', description: 'Open Source Coding' },
  
  // ===== WEITERE TOP-MODELLE =====
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', description: 'Open Source' },
  { id: 'mistralai/mistral-large-2411', name: 'Mistral Large', provider: 'Mistral', description: 'Europäisches LLM' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Qwen', description: 'Starkes Open Source' },
  { id: 'x-ai/grok-2', name: 'Grok 2', provider: 'xAI', description: 'xAI Standard' },
]

// Gruppierte Modelle für UI
export const MODEL_GROUPS = {
  recommended: { label: '⭐ Empfohlen', models: POPULAR_MODELS.filter(m => m.category === 'recommended') },
  pro: { label: '🚀 Pro Modelle', models: POPULAR_MODELS.filter(m => m.category === 'pro') },
  reasoning: { label: '🧠 Reasoning', models: POPULAR_MODELS.filter(m => m.category === 'reasoning') },
  fast: { label: '⚡ Schnell & Günstig', models: POPULAR_MODELS.filter(m => m.category === 'fast') },
  coding: { label: '💻 Coding', models: POPULAR_MODELS.filter(m => m.category === 'coding') },
  other: { label: '📦 Weitere', models: POPULAR_MODELS.filter(m => !m.category) },
}

export interface UsageLogEntry {
  userId?: string
  salonId?: string
  userType: 'admin' | 'salon_owner' | 'chair_renter'
  requestType: 'translation' | 'chat' | 'completion' | 'embedding' | 'image_generation' | 'video_generation'
  model: string
  provider: 'openrouter' | 'openai' | 'deepl' | 'replicate'
  inputTokens: number
  outputTokens: number
  totalTokens: number
  costUsd: number
  responseTimeMs?: number
  success: boolean
  errorMessage?: string
  metadata?: Record<string, unknown>
  // Neue Felder für Feature-Tracking und Credits
  feature?: 'social_post' | 'video_gen' | 'image_gen' | 'translation' | 'chat' | 'hashtags' | 'content_improvement'
  creditsUsed?: number
  creditsPaid?: boolean
}

// Feature-Typen für bessere Typsicherheit
export type AIFeature = UsageLogEntry['feature']

// Request-Typen
export type AIRequestType = UsageLogEntry['requestType']

// Provider-Typen
export type AIProvider = UsageLogEntry['provider']




