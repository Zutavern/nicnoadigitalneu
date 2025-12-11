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
export const MODEL_PRICING: Record<string, { prompt: number; completion: number }> = {
  // OpenAI Models
  'openai/gpt-4o': { prompt: 2.5, completion: 10 },
  'openai/gpt-4o-mini': { prompt: 0.15, completion: 0.6 },
  'openai/gpt-4-turbo': { prompt: 10, completion: 30 },
  'openai/gpt-3.5-turbo': { prompt: 0.5, completion: 1.5 },
  'openai/o1-preview': { prompt: 15, completion: 60 },
  'openai/o1-mini': { prompt: 3, completion: 12 },
  
  // Anthropic Models
  'anthropic/claude-3.5-sonnet': { prompt: 3, completion: 15 },
  'anthropic/claude-3-opus': { prompt: 15, completion: 75 },
  'anthropic/claude-3-haiku': { prompt: 0.25, completion: 1.25 },
  
  // Google Models
  'google/gemini-pro-1.5': { prompt: 2.5, completion: 7.5 },
  'google/gemini-flash-1.5': { prompt: 0.075, completion: 0.3 },
  
  // Meta Models
  'meta-llama/llama-3.1-70b-instruct': { prompt: 0.52, completion: 0.75 },
  'meta-llama/llama-3.1-8b-instruct': { prompt: 0.055, completion: 0.055 },
  
  // Mistral Models
  'mistralai/mistral-large': { prompt: 2, completion: 6 },
  'mistralai/mistral-small': { prompt: 0.2, completion: 0.6 },
}

// Beliebte Modelle für das Dropdown
export const POPULAR_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', recommended: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'Google' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral' },
]

export interface UsageLogEntry {
  userId?: string
  salonId?: string
  userType: 'admin' | 'salon_owner' | 'chair_renter'
  requestType: 'translation' | 'chat' | 'completion' | 'embedding'
  model: string
  provider: 'openrouter' | 'openai' | 'deepl'
  inputTokens: number
  outputTokens: number
  totalTokens: number
  costUsd: number
  responseTimeMs?: number
  success: boolean
  errorMessage?: string
  metadata?: Record<string, unknown>
}
