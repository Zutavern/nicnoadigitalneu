/**
 * Social Media Integration - Main Export
 * 
 * Zentrale Exportdatei für alle Social Media Funktionen
 */

export * from './crypto'
export * from './types'
export * from './image-formats'
export * from './providers/instagram'
export * from './providers/facebook'
export * from './providers/linkedin'
export * from './providers/twitter'
export * from './providers/tiktok'
export * from './providers/youtube'
export * from './providers/threads'

// Provider Registry für einfachen Zugriff
import { instagramProvider } from './providers/instagram'
import { facebookProvider } from './providers/facebook'
import { linkedInProvider } from './providers/linkedin'
import { twitterProvider } from './providers/twitter'
import { tiktokProvider } from './providers/tiktok'
import { youtubeProvider } from './providers/youtube'
import { threadsProvider } from './providers/threads'
import type { SocialProvider } from './types'

export const SOCIAL_PROVIDERS: Record<string, SocialProvider> = {
  INSTAGRAM: instagramProvider,
  FACEBOOK: facebookProvider,
  LINKEDIN: linkedInProvider,
  TWITTER: twitterProvider,
  TIKTOK: tiktokProvider,
  YOUTUBE: youtubeProvider,
  THREADS: threadsProvider,
}

export function getProvider(platform: string): SocialProvider | undefined {
  return SOCIAL_PROVIDERS[platform.toUpperCase()]
}

