/**
 * Instagram Provider
 * 
 * OAuth 2.0 Integration für Instagram Basic Display API & Instagram Graph API
 * 
 * Dokumentation:
 * - https://developers.facebook.com/docs/instagram-basic-display-api
 * - https://developers.facebook.com/docs/instagram-api
 */

import type { 
  SocialProvider, 
  AuthUrlParams, 
  OAuthTokens, 
  SocialAccount, 
  PostContent, 
  PostResult 
} from '../types'

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET

// Instagram Graph API Endpoints
const GRAPH_API_VERSION = 'v18.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

// Instagram Basic Display API (für Personal Accounts)
const BASIC_DISPLAY_AUTH_URL = 'https://api.instagram.com/oauth/authorize'
const BASIC_DISPLAY_TOKEN_URL = 'https://api.instagram.com/oauth/access_token'

// Instagram Graph API (für Business/Creator Accounts via Facebook)
const GRAPH_AUTH_URL = `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth`

export class InstagramProvider implements SocialProvider {
  platform = 'INSTAGRAM' as const
  name = 'Instagram'
  
  private getAppCredentials() {
    if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET) {
      throw new Error('Instagram App ID und Secret müssen konfiguriert sein')
    }
    return { appId: INSTAGRAM_APP_ID, appSecret: INSTAGRAM_APP_SECRET }
  }
  
  /**
   * Generiert die OAuth URL für Instagram Business/Creator Accounts
   * (über Facebook Login)
   */
  generateAuthUrl(params: AuthUrlParams): string {
    const { appId } = this.getAppCredentials()
    
    // Scopes für Instagram Business API
    const scopes = params.scopes || [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement',
      'business_management',
    ]
    
    const queryParams = new URLSearchParams({
      client_id: appId,
      redirect_uri: params.redirectUri,
      state: params.state,
      scope: scopes.join(','),
      response_type: 'code',
    })
    
    return `${GRAPH_AUTH_URL}?${queryParams.toString()}`
  }
  
  /**
   * Tauscht den Authorization Code gegen Access Token
   */
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens> {
    const { appId, appSecret } = this.getAppCredentials()
    
    // Short-lived token holen
    const tokenResponse = await fetch(`${GRAPH_API_BASE}/oauth/access_token`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    })
    
    const shortLivedResponse = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?${tokenParams.toString()}`
    )
    
    if (!shortLivedResponse.ok) {
      const error = await shortLivedResponse.json()
      throw new Error(`Instagram Token Error: ${error.error?.message || 'Unknown error'}`)
    }
    
    const shortLivedData = await shortLivedResponse.json()
    
    // Long-lived token holen (60 Tage gültig)
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedData.access_token,
    })
    
    const longLivedResponse = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?${longLivedParams.toString()}`
    )
    
    if (!longLivedResponse.ok) {
      // Fallback auf short-lived token
      return {
        accessToken: shortLivedData.access_token,
        expiresAt: new Date(Date.now() + (shortLivedData.expires_in || 3600) * 1000),
      }
    }
    
    const longLivedData = await longLivedResponse.json()
    
    return {
      accessToken: longLivedData.access_token,
      expiresAt: new Date(Date.now() + (longLivedData.expires_in || 5184000) * 1000), // ~60 Tage
    }
  }
  
  /**
   * Erneuert den Access Token
   */
  async refreshAccessToken(accessToken: string): Promise<OAuthTokens> {
    const { appId, appSecret } = this.getAppCredentials()
    
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: accessToken,
    })
    
    const response = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Token Refresh Error: ${error.error?.message || 'Unknown error'}`)
    }
    
    const data = await response.json()
    
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000),
    }
  }
  
  /**
   * Holt Instagram Business Account Info
   */
  async getAccountInfo(accessToken: string): Promise<SocialAccount> {
    // Zuerst Facebook Pages holen
    const pagesResponse = await fetch(
      `${GRAPH_API_BASE}/me/accounts?access_token=${accessToken}`
    )
    
    if (!pagesResponse.ok) {
      throw new Error('Fehler beim Laden der Facebook Pages')
    }
    
    const pagesData = await pagesResponse.json()
    
    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error('Keine Facebook Page gefunden. Instagram Business Account benötigt eine verknüpfte Facebook Page.')
    }
    
    // Instagram Business Account von der ersten Page holen
    const pageId = pagesData.data[0].id
    const pageAccessToken = pagesData.data[0].access_token
    
    const igAccountResponse = await fetch(
      `${GRAPH_API_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    )
    
    if (!igAccountResponse.ok) {
      throw new Error('Fehler beim Laden des Instagram Business Accounts')
    }
    
    const igAccountData = await igAccountResponse.json()
    
    if (!igAccountData.instagram_business_account) {
      throw new Error('Kein Instagram Business Account mit dieser Page verknüpft')
    }
    
    const igAccountId = igAccountData.instagram_business_account.id
    
    // Account Details holen
    const detailsResponse = await fetch(
      `${GRAPH_API_BASE}/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${pageAccessToken}`
    )
    
    if (!detailsResponse.ok) {
      throw new Error('Fehler beim Laden der Account-Details')
    }
    
    const details = await detailsResponse.json()
    
    return {
      platformAccountId: details.id,
      accountName: details.name || details.username,
      accountHandle: details.username,
      profileImageUrl: details.profile_picture_url,
      followersCount: details.followers_count,
      followingCount: details.follows_count,
      postsCount: details.media_count,
    }
  }
  
  /**
   * Erstellt einen Instagram Post
   * 
   * Für Bilder: Erst Container erstellen, dann veröffentlichen
   */
  async createPost(
    accessToken: string, 
    accountId: string, 
    content: PostContent
  ): Promise<PostResult> {
    try {
      const caption = this.buildCaption(content)
      
      if (!content.mediaUrls || content.mediaUrls.length === 0) {
        // Instagram erfordert mindestens ein Bild
        return {
          success: false,
          error: 'Instagram Posts benötigen mindestens ein Bild',
        }
      }
      
      if (content.mediaUrls.length === 1) {
        // Single Image Post
        return await this.createSingleImagePost(accessToken, accountId, content.mediaUrls[0], caption)
      } else {
        // Carousel Post
        return await this.createCarouselPost(accessToken, accountId, content.mediaUrls, caption)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      }
    }
  }
  
  private buildCaption(content: PostContent): string {
    let caption = content.text
    
    if (content.hashtags && content.hashtags.length > 0) {
      caption += '\n\n' + content.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')
    }
    
    return caption
  }
  
  private async createSingleImagePost(
    accessToken: string,
    accountId: string,
    imageUrl: string,
    caption: string
  ): Promise<PostResult> {
    // Container erstellen
    const containerParams = new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    })
    
    const containerResponse = await fetch(
      `${GRAPH_API_BASE}/${accountId}/media?${containerParams.toString()}`,
      { method: 'POST' }
    )
    
    if (!containerResponse.ok) {
      const error = await containerResponse.json()
      throw new Error(`Container Error: ${error.error?.message || 'Unknown error'}`)
    }
    
    const containerData = await containerResponse.json()
    
    // Veröffentlichen
    const publishParams = new URLSearchParams({
      creation_id: containerData.id,
      access_token: accessToken,
    })
    
    const publishResponse = await fetch(
      `${GRAPH_API_BASE}/${accountId}/media_publish?${publishParams.toString()}`,
      { method: 'POST' }
    )
    
    if (!publishResponse.ok) {
      const error = await publishResponse.json()
      throw new Error(`Publish Error: ${error.error?.message || 'Unknown error'}`)
    }
    
    const publishData = await publishResponse.json()
    
    return {
      success: true,
      platformPostId: publishData.id,
      postedAt: new Date(),
    }
  }
  
  private async createCarouselPost(
    accessToken: string,
    accountId: string,
    mediaUrls: string[],
    caption: string
  ): Promise<PostResult> {
    // Container für jedes Bild erstellen
    const containerIds: string[] = []
    
    for (const imageUrl of mediaUrls.slice(0, 10)) { // Max 10 Bilder
      const containerParams = new URLSearchParams({
        image_url: imageUrl,
        is_carousel_item: 'true',
        access_token: accessToken,
      })
      
      const containerResponse = await fetch(
        `${GRAPH_API_BASE}/${accountId}/media?${containerParams.toString()}`,
        { method: 'POST' }
      )
      
      if (!containerResponse.ok) {
        const error = await containerResponse.json()
        throw new Error(`Carousel Item Error: ${error.error?.message || 'Unknown error'}`)
      }
      
      const containerData = await containerResponse.json()
      containerIds.push(containerData.id)
    }
    
    // Carousel Container erstellen
    const carouselParams = new URLSearchParams({
      media_type: 'CAROUSEL',
      caption,
      children: containerIds.join(','),
      access_token: accessToken,
    })
    
    const carouselResponse = await fetch(
      `${GRAPH_API_BASE}/${accountId}/media?${carouselParams.toString()}`,
      { method: 'POST' }
    )
    
    if (!carouselResponse.ok) {
      const error = await carouselResponse.json()
      throw new Error(`Carousel Error: ${error.error?.message || 'Unknown error'}`)
    }
    
    const carouselData = await carouselResponse.json()
    
    // Veröffentlichen
    const publishParams = new URLSearchParams({
      creation_id: carouselData.id,
      access_token: accessToken,
    })
    
    const publishResponse = await fetch(
      `${GRAPH_API_BASE}/${accountId}/media_publish?${publishParams.toString()}`,
      { method: 'POST' }
    )
    
    if (!publishResponse.ok) {
      const error = await publishResponse.json()
      throw new Error(`Publish Error: ${error.error?.message || 'Unknown error'}`)
    }
    
    const publishData = await publishResponse.json()
    
    return {
      success: true,
      platformPostId: publishData.id,
      postedAt: new Date(),
    }
  }
  
  /**
   * Holt Post-Analytics
   */
  async getPostAnalytics(
    accessToken: string, 
    postId: string
  ): Promise<Record<string, number>> {
    const fields = 'impressions,reach,engagement,saved,likes,comments,shares'
    
    const response = await fetch(
      `${GRAPH_API_BASE}/${postId}/insights?metric=${fields}&access_token=${accessToken}`
    )
    
    if (!response.ok) {
      return {}
    }
    
    const data = await response.json()
    
    const analytics: Record<string, number> = {}
    
    for (const metric of data.data || []) {
      analytics[metric.name] = metric.values?.[0]?.value || 0
    }
    
    return analytics
  }
}

export const instagramProvider = new InstagramProvider()

