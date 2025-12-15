/**
 * YouTube OAuth Provider
 * 
 * YouTube Data API v3 Integration für Social Media Management
 * https://developers.google.com/youtube/v3/guides/authentication
 */

import { SocialProvider, SocialAccountInfo } from '../types'
import { generateState } from '../crypto'

// YouTube OAuth Konfiguration
const YOUTUBE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3'

// Benötigte Scopes für YouTube
const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',        // Kanal-Info lesen
  'https://www.googleapis.com/auth/youtube.upload',          // Videos hochladen
  'https://www.googleapis.com/auth/youtube.force-ssl',       // API über SSL
  'https://www.googleapis.com/auth/youtubepartner',          // Partner-Features (optional)
].join(' ')

interface YouTubeTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

interface YouTubeChannelResponse {
  items: Array<{
    id: string
    snippet: {
      title: string
      description: string
      customUrl?: string
      thumbnails: {
        default: { url: string }
        medium: { url: string }
        high: { url: string }
      }
      country?: string
    }
    statistics: {
      viewCount: string
      subscriberCount: string
      hiddenSubscriberCount: boolean
      videoCount: string
    }
  }>
}

export const youtubeProvider: SocialProvider = {
  name: 'youtube',
  displayName: 'YouTube',
  icon: 'Youtube',
  color: '#FF0000',
  
  /**
   * Generiert die OAuth-URL für YouTube
   */
  generateAuthUrl(callbackUrl: string): { url: string; state: string } {
    const clientId = process.env.YOUTUBE_CLIENT_ID
    
    if (!clientId) {
      throw new Error('YOUTUBE_CLIENT_ID ist nicht konfiguriert')
    }

    const state = generateState()
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: YOUTUBE_SCOPES,
      state,
      access_type: 'offline',  // Für Refresh Token
      prompt: 'consent',       // Immer um Zustimmung bitten (für Refresh Token)
      include_granted_scopes: 'true',
    })

    return {
      url: `${YOUTUBE_AUTH_URL}?${params.toString()}`,
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
    scope?: string
  }> {
    const clientId = process.env.YOUTUBE_CLIENT_ID
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('YouTube OAuth Credentials fehlen')
    }

    const response = await fetch(YOUTUBE_TOKEN_URL, {
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
      console.error('[YouTube] Token exchange error:', error)
      throw new Error(`Token-Austausch fehlgeschlagen: ${error}`)
    }

    const data: YouTubeTokenResponse = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    }
  },

  /**
   * Erneuert den Access Token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string
    refreshToken?: string
    expiresIn?: number
  }> {
    const clientId = process.env.YOUTUBE_CLIENT_ID
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('YouTube OAuth Credentials fehlen')
    }

    const response = await fetch(YOUTUBE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[YouTube] Token refresh error:', error)
      throw new Error(`Token-Erneuerung fehlgeschlagen: ${error}`)
    }

    const data: YouTubeTokenResponse = await response.json()

    return {
      accessToken: data.access_token,
      // Google gibt normalerweise keinen neuen Refresh Token zurück
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  },

  /**
   * Holt Kanal-Informationen
   */
  async getAccountInfo(accessToken: string): Promise<SocialAccountInfo> {
    // Hole Kanal-Details des authentifizierten Users
    const response = await fetch(
      `${YOUTUBE_API_URL}/channels?part=snippet,statistics&mine=true`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('[YouTube] Get channel error:', error)
      throw new Error(`Kanal-Info konnte nicht abgerufen werden: ${error}`)
    }

    const data: YouTubeChannelResponse = await response.json()
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Kein YouTube-Kanal gefunden')
    }

    const channel = data.items[0]

    return {
      platformId: channel.id,
      username: channel.snippet.customUrl || channel.snippet.title,
      displayName: channel.snippet.title,
      profileImageUrl: channel.snippet.thumbnails.high?.url || 
                       channel.snippet.thumbnails.medium?.url ||
                       channel.snippet.thumbnails.default?.url,
      profileUrl: channel.snippet.customUrl 
        ? `https://youtube.com/${channel.snippet.customUrl}`
        : `https://youtube.com/channel/${channel.id}`,
      followers: parseInt(channel.statistics.subscriberCount, 10) || 0,
      metadata: {
        description: channel.snippet.description,
        country: channel.snippet.country,
        viewCount: channel.statistics.viewCount,
        videoCount: channel.statistics.videoCount,
        hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount,
      },
    }
  },
}

/**
 * Lädt ein Video auf YouTube hoch
 */
export async function uploadYouTubeVideo(
  accessToken: string,
  videoData: {
    title: string
    description: string
    tags?: string[]
    categoryId?: string
    privacyStatus?: 'public' | 'private' | 'unlisted'
  },
  videoFile: Blob | Buffer
): Promise<{ videoId: string; videoUrl: string }> {
  // Erst Metadaten hochladen (Resumable Upload initieren)
  const metadataResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/*',
      },
      body: JSON.stringify({
        snippet: {
          title: videoData.title,
          description: videoData.description,
          tags: videoData.tags || [],
          categoryId: videoData.categoryId || '22', // People & Blogs
        },
        status: {
          privacyStatus: videoData.privacyStatus || 'private',
          selfDeclaredMadeForKids: false,
        },
      }),
    }
  )

  if (!metadataResponse.ok) {
    const error = await metadataResponse.text()
    throw new Error(`Upload initiation failed: ${error}`)
  }

  const uploadUrl = metadataResponse.headers.get('Location')
  if (!uploadUrl) {
    throw new Error('Keine Upload-URL erhalten')
  }

  // Video-Datei hochladen
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/*',
    },
    body: videoFile,
  })

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text()
    throw new Error(`Video upload failed: ${error}`)
  }

  const result = await uploadResponse.json()
  
  return {
    videoId: result.id,
    videoUrl: `https://youtube.com/watch?v=${result.id}`,
  }
}

/**
 * Postet einen Community-Beitrag (falls verfügbar)
 * Hinweis: Community Posts sind nur über die Inoffizielle API verfügbar
 */
export async function createYouTubeCommunityPost(
  accessToken: string,
  content: string
): Promise<{ success: boolean; message: string }> {
  // YouTube Community Posts sind nicht über die offizielle API verfügbar
  // Dies ist ein Platzhalter für zukünftige Implementierung
  console.warn('[YouTube] Community Posts sind nicht über die offizielle API verfügbar')
  
  return {
    success: false,
    message: 'Community Posts werden noch nicht unterstützt. Bitte lade Videos hoch.',
  }
}

export default youtubeProvider

