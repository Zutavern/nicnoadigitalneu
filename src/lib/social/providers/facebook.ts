/**
 * Facebook Provider
 * 
 * OAuth 2.0 Integration für Facebook Pages API
 * 
 * Dokumentation:
 * - https://developers.facebook.com/docs/pages-api
 * - https://developers.facebook.com/docs/graph-api
 */

import type { 
  SocialProvider, 
  AuthUrlParams, 
  OAuthTokens, 
  SocialAccount, 
  PostContent, 
  PostResult 
} from '../types'

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET

const GRAPH_API_VERSION = 'v18.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`
const AUTH_URL = `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth`

export class FacebookProvider implements SocialProvider {
  platform = 'FACEBOOK' as const
  name = 'Facebook'
  
  private getAppCredentials() {
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      throw new Error('Facebook App ID und Secret müssen konfiguriert sein')
    }
    return { appId: FACEBOOK_APP_ID, appSecret: FACEBOOK_APP_SECRET }
  }
  
  /**
   * Generiert die OAuth URL für Facebook Pages
   */
  generateAuthUrl(params: AuthUrlParams): string {
    const { appId } = this.getAppCredentials()
    
    const scopes = params.scopes || [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_engagement',
      'pages_read_user_content',
      'business_management',
    ]
    
    const queryParams = new URLSearchParams({
      client_id: appId,
      redirect_uri: params.redirectUri,
      state: params.state,
      scope: scopes.join(','),
      response_type: 'code',
    })
    
    return `${AUTH_URL}?${queryParams.toString()}`
  }
  
  /**
   * Tauscht den Authorization Code gegen Access Token
   */
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens> {
    const { appId, appSecret } = this.getAppCredentials()
    
    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    })
    
    // Short-lived User Token holen
    const response = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Facebook Token Error: ${error.error?.message || 'Unknown error'}`)
    }
    
    const data = await response.json()
    
    // Long-lived Token holen
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: data.access_token,
    })
    
    const longLivedResponse = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?${longLivedParams.toString()}`
    )
    
    if (!longLivedResponse.ok) {
      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
      }
    }
    
    const longLivedData = await longLivedResponse.json()
    
    return {
      accessToken: longLivedData.access_token,
      expiresAt: new Date(Date.now() + (longLivedData.expires_in || 5184000) * 1000),
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
   * Holt Facebook Page Info
   * Gibt die erste Page des Users zurück
   */
  async getAccountInfo(accessToken: string): Promise<SocialAccount> {
    // Alle Pages des Users holen
    const pagesResponse = await fetch(
      `${GRAPH_API_BASE}/me/accounts?fields=id,name,username,picture,fan_count,followers_count&access_token=${accessToken}`
    )
    
    if (!pagesResponse.ok) {
      const error = await pagesResponse.json()
      throw new Error(`Pages Error: ${error.error?.message || 'Unknown error'}`)
    }
    
    const pagesData = await pagesResponse.json()
    
    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error('Keine Facebook Page gefunden. Bitte erstelle zuerst eine Facebook Page.')
    }
    
    const page = pagesData.data[0]
    
    return {
      platformAccountId: page.id,
      accountName: page.name,
      accountHandle: page.username,
      profileImageUrl: page.picture?.data?.url,
      followersCount: page.followers_count || page.fan_count,
    }
  }
  
  /**
   * Holt alle verfügbaren Facebook Pages
   */
  async getAllPages(accessToken: string): Promise<SocialAccount[]> {
    const pagesResponse = await fetch(
      `${GRAPH_API_BASE}/me/accounts?fields=id,name,username,picture,fan_count,followers_count,access_token&access_token=${accessToken}`
    )
    
    if (!pagesResponse.ok) {
      return []
    }
    
    const pagesData = await pagesResponse.json()
    
    return (pagesData.data || []).map((page: Record<string, unknown>) => ({
      platformAccountId: page.id as string,
      accountName: page.name as string,
      accountHandle: page.username as string | undefined,
      profileImageUrl: (page.picture as { data?: { url?: string } })?.data?.url,
      followersCount: (page.followers_count || page.fan_count) as number | undefined,
      // Page Access Token für spätere Posts
      _pageAccessToken: page.access_token as string,
    }))
  }
  
  /**
   * Erstellt einen Facebook Page Post
   */
  async createPost(
    accessToken: string,
    pageId: string,
    content: PostContent
  ): Promise<PostResult> {
    try {
      // Erst Page Access Token holen
      const pageTokenResponse = await fetch(
        `${GRAPH_API_BASE}/${pageId}?fields=access_token&access_token=${accessToken}`
      )
      
      if (!pageTokenResponse.ok) {
        throw new Error('Page Access Token konnte nicht abgerufen werden')
      }
      
      const pageTokenData = await pageTokenResponse.json()
      const pageAccessToken = pageTokenData.access_token
      
      const message = this.buildMessage(content)
      
      if (content.mediaUrls && content.mediaUrls.length > 0) {
        return await this.createPhotoPost(pageAccessToken, pageId, content.mediaUrls, message)
      } else {
        return await this.createTextPost(pageAccessToken, pageId, message, content.link)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      }
    }
  }
  
  private buildMessage(content: PostContent): string {
    let message = content.text
    
    if (content.hashtags && content.hashtags.length > 0) {
      message += '\n\n' + content.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')
    }
    
    return message
  }
  
  private async createTextPost(
    pageAccessToken: string,
    pageId: string,
    message: string,
    link?: string
  ): Promise<PostResult> {
    const body: Record<string, string> = { message }
    
    if (link) {
      body.link = link
    }
    
    const response = await fetch(
      `${GRAPH_API_BASE}/${pageId}/feed?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Post Error: ${error.error?.message || 'Unknown error'}`)
    }
    
    const data = await response.json()
    
    return {
      success: true,
      platformPostId: data.id,
      postedAt: new Date(),
    }
  }
  
  private async createPhotoPost(
    pageAccessToken: string,
    pageId: string,
    photoUrls: string[],
    message: string
  ): Promise<PostResult> {
    if (photoUrls.length === 1) {
      // Single Photo Post
      const response = await fetch(
        `${GRAPH_API_BASE}/${pageId}/photos?access_token=${pageAccessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: photoUrls[0],
            message,
          }),
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Photo Post Error: ${error.error?.message || 'Unknown error'}`)
      }
      
      const data = await response.json()
      
      return {
        success: true,
        platformPostId: data.post_id || data.id,
        postedAt: new Date(),
      }
    } else {
      // Multi-Photo Post
      const photoIds: string[] = []
      
      // Erst alle Fotos hochladen (unpublished)
      for (const photoUrl of photoUrls.slice(0, 10)) {
        const uploadResponse = await fetch(
          `${GRAPH_API_BASE}/${pageId}/photos?access_token=${pageAccessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: photoUrl,
              published: false,
            }),
          }
        )
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          photoIds.push(uploadData.id)
        }
      }
      
      if (photoIds.length === 0) {
        throw new Error('Keine Fotos konnten hochgeladen werden')
      }
      
      // Multi-Photo Post erstellen
      const attachedMedia = photoIds.map(id => ({ media_fbid: id }))
      
      const response = await fetch(
        `${GRAPH_API_BASE}/${pageId}/feed?access_token=${pageAccessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            attached_media: attachedMedia,
          }),
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Multi-Photo Post Error: ${error.error?.message || 'Unknown error'}`)
      }
      
      const data = await response.json()
      
      return {
        success: true,
        platformPostId: data.id,
        postedAt: new Date(),
      }
    }
  }
  
  /**
   * Holt Post-Analytics
   */
  async getPostAnalytics(
    accessToken: string,
    postId: string
  ): Promise<Record<string, number>> {
    // Page Access Token für die Page des Posts holen
    const [pageId] = postId.split('_')
    
    const pageTokenResponse = await fetch(
      `${GRAPH_API_BASE}/${pageId}?fields=access_token&access_token=${accessToken}`
    )
    
    if (!pageTokenResponse.ok) {
      return {}
    }
    
    const pageTokenData = await pageTokenResponse.json()
    const pageAccessToken = pageTokenData.access_token
    
    // Post Insights holen
    const insightsResponse = await fetch(
      `${GRAPH_API_BASE}/${postId}/insights?metric=post_impressions,post_reach,post_engaged_users,post_clicks&access_token=${pageAccessToken}`
    )
    
    if (!insightsResponse.ok) {
      return {}
    }
    
    const insightsData = await insightsResponse.json()
    
    const analytics: Record<string, number> = {}
    
    for (const metric of insightsData.data || []) {
      analytics[metric.name] = metric.values?.[0]?.value || 0
    }
    
    // Reactions und Comments separat holen
    const reactionsResponse = await fetch(
      `${GRAPH_API_BASE}/${postId}?fields=reactions.summary(true),comments.summary(true),shares&access_token=${pageAccessToken}`
    )
    
    if (reactionsResponse.ok) {
      const reactionsData = await reactionsResponse.json()
      analytics.reactions = reactionsData.reactions?.summary?.total_count || 0
      analytics.comments = reactionsData.comments?.summary?.total_count || 0
      analytics.shares = reactionsData.shares?.count || 0
    }
    
    return analytics
  }
}

export const facebookProvider = new FacebookProvider()

