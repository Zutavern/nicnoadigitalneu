/**
 * Twitter/X Provider
 * 
 * OAuth 2.0 PKCE Integration für Twitter API v2
 * 
 * Dokumentation:
 * - https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code
 * - https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference
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

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET

const AUTH_URL = 'https://twitter.com/i/oauth2/authorize'
const TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'
const API_BASE = 'https://api.twitter.com/2'
const UPLOAD_URL = 'https://upload.twitter.com/1.1/media/upload.json'

// PKCE Code Verifier wird temporär gespeichert (in Produktion: Redis/DB)
const codeVerifiers = new Map<string, string>()

export class TwitterProvider implements SocialProvider {
  platform = 'TWITTER' as const
  name = 'X/Twitter'
  
  private getAppCredentials() {
    if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
      throw new Error('Twitter App credentials nicht konfiguriert. Setze TWITTER_CLIENT_ID und TWITTER_CLIENT_SECRET.')
    }
    return { clientId: TWITTER_CLIENT_ID, clientSecret: TWITTER_CLIENT_SECRET }
  }

  /**
   * Generiert die OAuth 2.0 PKCE Autorisierungs-URL
   */
  generateAuthUrl(params: AuthUrlParams): string {
    const { clientId } = this.getAppCredentials()
    
    // PKCE: Generate Code Verifier and Challenge
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)
    
    // Store code verifier for later token exchange
    codeVerifiers.set(params.state, codeVerifier)
    
    const scopes = params.scopes || [
      'tweet.read',
      'tweet.write',
      'users.read',
      'offline.access', // Für Refresh Tokens
    ]
    
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: params.redirectUri,
      state: params.state,
      scope: scopes.join(' '),
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
   * Tauscht den Authorization Code gegen Tokens (PKCE)
   */
  async exchangeCodeForTokens(code: string, redirectUri: string, codeVerifier?: string): Promise<OAuthTokens> {
    const { clientId, clientSecret } = this.getAppCredentials()
    
    if (!codeVerifier) {
      throw new Error('Code Verifier ist für Twitter PKCE Flow erforderlich')
    }
    
    // Basic Auth Header
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    })
    
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: tokenParams.toString(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Twitter Token Exchange fehlgeschlagen: ${errorText}`)
    }
    
    const data = await response.json()
    
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
    const { clientId, clientSecret } = this.getAppCredentials()
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
    
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: tokenParams.toString(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Twitter Token Refresh fehlgeschlagen: ${errorText}`)
    }
    
    const data = await response.json()
    
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
    const response = await fetch(`${API_BASE}/users/me?user.fields=profile_image_url,public_metrics`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Twitter Profil-Abruf fehlgeschlagen: ${errorText}`)
    }
    
    const data = await response.json()
    const user = data.data
    
    return {
      platformAccountId: user.id,
      accountName: user.name,
      accountHandle: `@${user.username}`,
      profileImageUrl: user.profile_image_url?.replace('_normal', '_400x400'),
      followersCount: user.public_metrics?.followers_count,
      followingCount: user.public_metrics?.following_count,
      postsCount: user.public_metrics?.tweet_count,
    }
  }

  /**
   * Postet einen Tweet
   */
  async publishPost(accessToken: string, _accountId: string, content: PostContent): Promise<PostResult> {
    // Tweet-Text formatieren (max 280 Zeichen)
    let tweetText = content.text
    
    // Hashtags hinzufügen wenn Platz
    if (content.hashtags && content.hashtags.length > 0) {
      const hashtagsText = content.hashtags.map(tag => `#${tag}`).join(' ')
      if ((tweetText + '\n\n' + hashtagsText).length <= 280) {
        tweetText += '\n\n' + hashtagsText
      }
    }
    
    // Link hinzufügen wenn vorhanden
    if (content.link) {
      // Twitter kürzt Links automatisch auf 23 Zeichen
      if ((tweetText + '\n\n' + content.link).length <= 280 + content.link.length - 23) {
        tweetText += '\n\n' + content.link
      }
    }
    
    // Auf 280 Zeichen kürzen
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + '...'
    }
    
    // Payload vorbereiten
    const tweetPayload: Record<string, unknown> = {
      text: tweetText,
    }
    
    // Medien hochladen wenn vorhanden (via v1.1 API)
    if (content.mediaUrls && content.mediaUrls.length > 0) {
      const mediaIds = await this.uploadMedia(accessToken, content.mediaUrls)
      if (mediaIds.length > 0) {
        tweetPayload.media = {
          media_ids: mediaIds,
        }
      }
    }
    
    const response = await fetch(`${API_BASE}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetPayload),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Tweet fehlgeschlagen: ${errorText}`)
    }
    
    const data = await response.json()
    
    return {
      success: true,
      postId: data.data.id,
      postUrl: `https://twitter.com/i/status/${data.data.id}`,
    }
  }

  /**
   * Lädt Medien auf Twitter hoch (v1.1 API - benötigt OAuth 1.0a oder User Context Token)
   */
  private async uploadMedia(accessToken: string, mediaUrls: string[]): Promise<string[]> {
    const mediaIds: string[] = []
    
    for (const mediaUrl of mediaUrls.slice(0, 4)) { // Max 4 Bilder pro Tweet
      try {
        // Download image
        const imageResponse = await fetch(mediaUrl)
        if (!imageResponse.ok) continue
        
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString('base64')
        
        // Upload via v1.1 API
        const formData = new URLSearchParams({
          media_data: base64Image,
        })
        
        const uploadResponse = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          mediaIds.push(uploadData.media_id_string)
        }
      } catch (error) {
        console.error('Twitter Media Upload fehlgeschlagen:', error)
      }
    }
    
    return mediaIds
  }
}

export const twitterProvider = new TwitterProvider()

