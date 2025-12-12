// Client-safe exports (can be imported in 'use client' components)
// Types
export type {
  OpenRouterConfig,
  OpenRouterMessage,
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterUsage,
  OpenRouterModel,
  UsageLogEntry,
} from './types'

export {
  MODEL_PRICING,
  POPULAR_MODELS,
  MODEL_GROUPS,
} from './types'

// Server-only exports - DO NOT import these in client components!
// Use: import { chatCompletion } from '@/lib/openrouter/client'
// Use: import { logAIUsage } from '@/lib/openrouter/usage-tracker'

