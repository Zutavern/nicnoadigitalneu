/**
 * Social Media Integration - Types
 */

export type SocialPlatform = 
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'TWITTER'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'PINTEREST'
  | 'THREADS'

export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scope?: string
}

export interface SocialAccount {
  platformAccountId: string
  accountName: string
  accountHandle?: string
  profileImageUrl?: string
  followersCount?: number
  followingCount?: number
  postsCount?: number
}

export interface OAuthCallbackParams {
  code: string
  state?: string
  error?: string
  errorDescription?: string
}

export interface AuthUrlParams {
  redirectUri: string
  state: string
  scopes?: string[]
}

export interface PostContent {
  text: string
  mediaUrls?: string[]
  hashtags?: string[]
  link?: string
}

export interface PostResult {
  success: boolean
  platformPostId?: string
  error?: string
  postedAt?: Date
}

export interface SocialProvider {
  platform: SocialPlatform
  name: string
  
  // OAuth
  generateAuthUrl(params: AuthUrlParams): string
  exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens>
  refreshAccessToken(refreshToken: string): Promise<OAuthTokens>
  
  // Account Info
  getAccountInfo(accessToken: string): Promise<SocialAccount>
  
  // Posting
  createPost(accessToken: string, accountId: string, content: PostContent): Promise<PostResult>
  
  // Analytics (optional)
  getPostAnalytics?(accessToken: string, postId: string): Promise<Record<string, number>>
}

// Environment Variable Keys
export const SOCIAL_ENV_KEYS = {
  INSTAGRAM: {
    APP_ID: 'INSTAGRAM_APP_ID',
    APP_SECRET: 'INSTAGRAM_APP_SECRET',
  },
  FACEBOOK: {
    APP_ID: 'FACEBOOK_APP_ID',
    APP_SECRET: 'FACEBOOK_APP_SECRET',
  },
  LINKEDIN: {
    CLIENT_ID: 'LINKEDIN_CLIENT_ID',
    CLIENT_SECRET: 'LINKEDIN_CLIENT_SECRET',
  },
  TWITTER: {
    API_KEY: 'X_API_KEY',
    API_SECRET: 'X_API_SECRET',
  },
  TIKTOK: {
    CLIENT_ID: 'TIKTOK_CLIENT_ID',
    CLIENT_SECRET: 'TIKTOK_CLIENT_SECRET',
  },
  YOUTUBE: {
    CLIENT_ID: 'YOUTUBE_CLIENT_ID',
    CLIENT_SECRET: 'YOUTUBE_CLIENT_SECRET',
  },
} as const

