/**
 * Threads OAuth Provider
 * 
 * Meta's Threads API Integration
 * https://developers.facebook.com/docs/threads
 * 
 * Threads verwendet das gleiche OAuth-System wie Instagram/Facebook
 */

import { SocialProvider, SocialAccountInfo } from '../types'
import { generateState } from '../crypto'

// Threads OAuth Konfiguration (via Facebook/Meta)
const THREADS_AUTH_URL = 'https://threads.net/oauth/authorize'
const THREADS_TOKEN_URL = 'https://graph.threads.net/oauth/access_token'
const THREADS_API_URL = 'https://graph.threads.net/v1.0'

// Benötigte Scopes für Threads
const THREADS_SCOPES = [
  'threads_basic',                    // Basis-Profil-Info
  'threads_content_publish',          // Posts veröffentlichen
  'threads_manage_insights',          // Analytics (optional)
  'threads_manage_replies',           // Antworten verwalten
].join(',')

interface ThreadsTokenResponse {
  access_token: string
  user_id: string
  token_type?: string
  expires_in?: number
}

interface ThreadsLongLivedTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface ThreadsUserResponse {
  id: string
  username: string
  name?: string
  threads_profile_picture_url?: string
  threads_biography?: string
}

interface ThreadsUserInsightsResponse {
  data: Array<{
    name: string
    period: string
    values: Array<{
      value: number
    }>
    title: string
    description: string
    id: string
  }>
}

export const threadsProvider: SocialProvider = {
  name: 'threads',
  displayName: 'Threads',
  icon: 'AtSign', // Threads-Icon (oder custom)
  color: '#000000',
  
  /**
   * Generiert die OAuth-URL für Threads
   */
  generateAuthUrl(callbackUrl: string): { url: string; state: string } {
    const clientId = process.env.THREADS_CLIENT_ID || process.env.INSTAGRAM_CLIENT_ID
    
    if (!clientId) {
      throw new Error('THREADS_CLIENT_ID ist nicht konfiguriert')
    }

    const state = generateState()
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: THREADS_SCOPES,
      state,
    })

    return {
      url: `${THREADS_AUTH_URL}?${params.toString()}`,
      state,
    }
  },

  /**
   * Tauscht den Auth-Code gegen Access Token
   */
  async exchangeCodeForTokens(code: string, callbackUrl: string): Promise<{
    accessToken: string
    refreshToken?: string
    expiresIn?: number
    tokenType?: string
    userId?: string
  }> {
    const clientId = process.env.THREADS_CLIENT_ID || process.env.INSTAGRAM_CLIENT_ID
    const clientSecret = process.env.THREADS_CLIENT_SECRET || process.env.INSTAGRAM_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Threads OAuth Credentials fehlen')
    }

    // Short-lived Token abrufen
    const response = await fetch(THREADS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Threads] Token exchange error:', error)
      throw new Error(`Token-Austausch fehlgeschlagen: ${error}`)
    }

    const data: ThreadsTokenResponse = await response.json()

    // Konvertiere zu Long-Lived Token
    const longLivedToken = await exchangeForLongLivedToken(data.access_token, clientSecret)

    return {
      accessToken: longLivedToken.access_token,
      expiresIn: longLivedToken.expires_in,
      tokenType: longLivedToken.token_type,
      userId: data.user_id,
    }
  },

  /**
   * Erneuert den Access Token
   */
  async refreshAccessToken(accessToken: string): Promise<{
    accessToken: string
    refreshToken?: string
    expiresIn?: number
  }> {
    // Threads Long-Lived Token erneuern
    const response = await fetch(
      `${THREADS_API_URL}/refresh_access_token?grant_type=th_refresh_token&access_token=${accessToken}`,
      { method: 'GET' }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('[Threads] Token refresh error:', error)
      throw new Error(`Token-Erneuerung fehlgeschlagen: ${error}`)
    }

    const data: ThreadsLongLivedTokenResponse = await response.json()

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }
  },

  /**
   * Holt Account-Informationen
   */
  async getAccountInfo(accessToken: string): Promise<SocialAccountInfo> {
    const response = await fetch(
      `${THREADS_API_URL}/me?fields=id,username,name,threads_profile_picture_url,threads_biography&access_token=${accessToken}`,
      { method: 'GET' }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('[Threads] Get user error:', error)
      throw new Error(`Account-Info konnte nicht abgerufen werden: ${error}`)
    }

    const user: ThreadsUserResponse = await response.json()

    // Versuche Follower-Zahl über Insights zu holen
    let followers = 0
    try {
      const insightsResponse = await fetch(
        `${THREADS_API_URL}/${user.id}/threads_insights?metric=followers_count&access_token=${accessToken}`,
        { method: 'GET' }
      )
      if (insightsResponse.ok) {
        const insights: ThreadsUserInsightsResponse = await insightsResponse.json()
        const followersMetric = insights.data?.find(d => d.name === 'followers_count')
        followers = followersMetric?.values?.[0]?.value || 0
      }
    } catch {
      console.warn('[Threads] Could not fetch follower count')
    }

    return {
      platformId: user.id,
      username: user.username,
      displayName: user.name || user.username,
      profileImageUrl: user.threads_profile_picture_url,
      profileUrl: `https://threads.net/@${user.username}`,
      followers,
      metadata: {
        biography: user.threads_biography,
      },
    }
  },
}

/**
 * Tauscht Short-Lived Token gegen Long-Lived Token
 */
async function exchangeForLongLivedToken(
  shortLivedToken: string,
  clientSecret: string
): Promise<ThreadsLongLivedTokenResponse> {
  const response = await fetch(
    `${THREADS_API_URL}/access_token?grant_type=th_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`,
    { method: 'GET' }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('[Threads] Long-lived token exchange error:', error)
    throw new Error(`Long-Lived Token Austausch fehlgeschlagen: ${error}`)
  }

  return response.json()
}

/**
 * Erstellt einen Thread-Post
 */
export async function createThreadsPost(
  accessToken: string,
  userId: string,
  content: {
    text: string
    mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL'
    imageUrl?: string
    videoUrl?: string
    carouselItems?: Array<{ mediaType: 'IMAGE' | 'VIDEO'; mediaUrl: string }>
    replyToId?: string
  }
): Promise<{ postId: string; permalink: string }> {
  // Container erstellen
  const containerParams: Record<string, string> = {
    access_token: accessToken,
    media_type: content.mediaType || 'TEXT',
    text: content.text,
  }

  if (content.imageUrl) {
    containerParams.image_url = content.imageUrl
  }
  if (content.videoUrl) {
    containerParams.video_url = content.videoUrl
  }
  if (content.replyToId) {
    containerParams.reply_to_id = content.replyToId
  }

  const containerResponse = await fetch(
    `${THREADS_API_URL}/${userId}/threads`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(containerParams),
    }
  )

  if (!containerResponse.ok) {
    const error = await containerResponse.text()
    throw new Error(`Container creation failed: ${error}`)
  }

  const container = await containerResponse.json()
  const containerId = container.id

  // Post veröffentlichen
  const publishResponse = await fetch(
    `${THREADS_API_URL}/${userId}/threads_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        access_token: accessToken,
        creation_id: containerId,
      }),
    }
  )

  if (!publishResponse.ok) {
    const error = await publishResponse.text()
    throw new Error(`Post publish failed: ${error}`)
  }

  const post = await publishResponse.json()

  // Hole Permalink
  const mediaResponse = await fetch(
    `${THREADS_API_URL}/${post.id}?fields=permalink&access_token=${accessToken}`,
    { method: 'GET' }
  )

  let permalink = ''
  if (mediaResponse.ok) {
    const mediaData = await mediaResponse.json()
    permalink = mediaData.permalink
  }

  return {
    postId: post.id,
    permalink,
  }
}

/**
 * Holt Thread-Insights für einen Post
 */
export async function getThreadsPostInsights(
  accessToken: string,
  postId: string
): Promise<{
  views: number
  likes: number
  replies: number
  reposts: number
  quotes: number
}> {
  const response = await fetch(
    `${THREADS_API_URL}/${postId}/insights?metric=views,likes,replies,reposts,quotes&access_token=${accessToken}`,
    { method: 'GET' }
  )

  if (!response.ok) {
    throw new Error('Could not fetch post insights')
  }

  const data = await response.json()
  const metrics: Record<string, number> = {}

  for (const metric of data.data || []) {
    metrics[metric.name] = metric.values?.[0]?.value || 0
  }

  return {
    views: metrics.views || 0,
    likes: metrics.likes || 0,
    replies: metrics.replies || 0,
    reposts: metrics.reposts || 0,
    quotes: metrics.quotes || 0,
  }
}

export default threadsProvider

