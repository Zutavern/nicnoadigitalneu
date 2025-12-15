/**
 * TikTok Provider
 * 
 * OAuth 2.0 Integration für TikTok Login Kit & Content Posting API
 * 
 * Dokumentation:
 * - https://developers.tiktok.com/doc/login-kit-web
 * - https://developers.tiktok.com/doc/content-posting-api-get-started
 */

import type { 
  SocialProvider, 
  AuthUrlParams, 
  OAuthTokens, 
  SocialAccount, 
  PostContent, 
  PostResult 
} from '../types'
import { generateCodeVerifier, generateCodeChallenge } from '../crypto'

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET

const AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize'
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
const API_BASE = 'https://open.tiktokapis.com/v2'

// PKCE Code Verifier Storage
const codeVerifiers = new Map<string, string>()

export class TikTokProvider implements SocialProvider {
  platform = 'TIKTOK' as const
  name = 'TikTok'
  
  private getAppCredentials() {
    if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
      throw new Error('TikTok App credentials nicht konfiguriert. Setze TIKTOK_CLIENT_KEY und TIKTOK_CLIENT_SECRET.')
    }
    return { clientKey: TIKTOK_CLIENT_KEY, clientSecret: TIKTOK_CLIENT_SECRET }
  }

  /**
   * Generiert die OAuth 2.0 Autorisierungs-URL
   */
  generateAuthUrl(params: AuthUrlParams): string {
    const { clientKey } = this.getAppCredentials()
    
    // PKCE
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)
    codeVerifiers.set(params.state, codeVerifier)
    
    const scopes = params.scopes || [
      'user.info.basic',
      'user.info.profile',
      'user.info.stats',
      'video.publish',
      'video.upload',
    ]
    
    const authParams = new URLSearchParams({
      client_key: clientKey,
      response_type: 'code',
      scope: scopes.join(','),
      redirect_uri: params.redirectUri,
      state: params.state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })
    
    return `${AUTH_URL}?${authParams.toString()}`
  }

  /**
   * Holt den Code Verifier für einen State
   */
  getCodeVerifier(state: string): string | undefined {
    const verifier = codeVerifiers.get(state)
    if (verifier) {
      codeVerifiers.delete(state)
    }
    return verifier
  }

  /**
   * Tauscht den Authorization Code gegen Tokens
   */
  async exchangeCodeForTokens(code: string, redirectUri: string, codeVerifier?: string): Promise<OAuthTokens> {
    const { clientKey, clientSecret } = this.getAppCredentials()
    
    const tokenBody: Record<string, string> = {
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }
    
    if (codeVerifier) {
      tokenBody.code_verifier = codeVerifier
    }
    
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenBody).toString(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TikTok Token Exchange fehlgeschlagen: ${errorText}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(`TikTok Error: ${data.error_description || data.error}`)
    }
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in 
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope,
    }
  }

  /**
   * Erneuert den Access Token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const { clientKey, clientSecret } = this.getAppCredentials()
    
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TikTok Token Refresh fehlgeschlagen: ${errorText}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(`TikTok Error: ${data.error_description || data.error}`)
    }
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: data.expires_in 
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope,
    }
  }

  /**
   * Holt Account-Informationen
   */
  async getAccountInfo(accessToken: string): Promise<SocialAccount> {
    const response = await fetch(`${API_BASE}/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TikTok Profil-Abruf fehlgeschlagen: ${errorText}`)
    }
    
    const result = await response.json()
    
    if (result.error?.code !== 'ok') {
      throw new Error(`TikTok Error: ${result.error?.message || 'Unbekannter Fehler'}`)
    }
    
    const user = result.data?.user
    
    return {
      platformAccountId: user?.open_id || user?.union_id,
      accountName: user?.display_name || 'TikTok User',
      profileImageUrl: user?.avatar_url,
      followersCount: user?.follower_count,
      followingCount: user?.following_count,
      postsCount: user?.video_count,
    }
  }

  /**
   * Postet Content auf TikTok (Photo Mode für Bilder)
   * 
   * Hinweis: TikTok Content Posting API unterstützt primär Videos.
   * Für Bilder muss Photo Mode aktiviert sein.
   */
  async publishPost(accessToken: string, _accountId: string, content: PostContent): Promise<PostResult> {
    // Prüfen ob Media vorhanden
    if (!content.mediaUrls || content.mediaUrls.length === 0) {
      throw new Error('TikTok erfordert mindestens ein Bild oder Video')
    }
    
    // Caption formatieren
    let caption = content.text
    
    if (content.hashtags && content.hashtags.length > 0) {
      caption += ' ' + content.hashtags.map(tag => `#${tag}`).join(' ')
    }
    
    // Max 2200 Zeichen für Caption
    if (caption.length > 2200) {
      caption = caption.substring(0, 2197) + '...'
    }
    
    // Bestimme ob Video oder Foto
    const isVideo = content.mediaUrls.some(url => 
      url.includes('.mp4') || url.includes('.mov') || url.includes('.avi')
    )
    
    if (isVideo) {
      return this.publishVideo(accessToken, content.mediaUrls[0], caption)
    } else {
      return this.publishPhotoPost(accessToken, content.mediaUrls, caption)
    }
  }

  /**
   * Veröffentlicht ein Video
   */
  private async publishVideo(accessToken: string, videoUrl: string, caption: string): Promise<PostResult> {
    // 1. Initiiere Video-Upload
    const initResponse = await fetch(`${API_BASE}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: caption,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      }),
    })
    
    if (!initResponse.ok) {
      const errorText = await initResponse.text()
      throw new Error(`TikTok Video Init fehlgeschlagen: ${errorText}`)
    }
    
    const initData = await initResponse.json()
    
    if (initData.error?.code !== 'ok') {
      throw new Error(`TikTok Error: ${initData.error?.message}`)
    }
    
    return {
      success: true,
      postId: initData.data?.publish_id,
      postUrl: `https://www.tiktok.com/@user/video/${initData.data?.publish_id}`,
    }
  }

  /**
   * Veröffentlicht Bilder als Photo Post (Carousel)
   */
  private async publishPhotoPost(accessToken: string, imageUrls: string[], caption: string): Promise<PostResult> {
    // Photo Post (max 35 Bilder)
    const images = imageUrls.slice(0, 35)
    
    const response = await fetch(`${API_BASE}/post/publish/content/init/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: caption,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_comment: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          photo_images: images,
        },
        post_mode: 'DIRECT_POST',
        media_type: 'PHOTO',
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`TikTok Photo Post fehlgeschlagen: ${errorText}`)
    }
    
    const data = await response.json()
    
    if (data.error?.code !== 'ok') {
      throw new Error(`TikTok Error: ${data.error?.message}`)
    }
    
    return {
      success: true,
      postId: data.data?.publish_id,
      postUrl: `https://www.tiktok.com/@user/photo/${data.data?.publish_id}`,
    }
  }
}

export const tiktokProvider = new TikTokProvider()

