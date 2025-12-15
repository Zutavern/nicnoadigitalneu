/**
 * LinkedIn Provider
 * 
 * OAuth 2.0 Integration für LinkedIn API
 * 
 * Dokumentation:
 * - https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow
 * - https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
 */

import type { 
  SocialProvider, 
  AuthUrlParams, 
  OAuthTokens, 
  SocialAccount, 
  PostContent, 
  PostResult 
} from '../types'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET

const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const API_BASE = 'https://api.linkedin.com/v2'
const USERINFO_URL = 'https://api.linkedin.com/v2/userinfo'

export class LinkedInProvider implements SocialProvider {
  platform = 'LINKEDIN' as const
  name = 'LinkedIn'
  
  private getAppCredentials() {
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      throw new Error('LinkedIn App credentials nicht konfiguriert. Setze LINKEDIN_CLIENT_ID und LINKEDIN_CLIENT_SECRET.')
    }
    return { clientId: LINKEDIN_CLIENT_ID, clientSecret: LINKEDIN_CLIENT_SECRET }
  }

  /**
   * Generiert die OAuth-Autorisierungs-URL
   */
  generateAuthUrl(params: AuthUrlParams): string {
    const { clientId } = this.getAppCredentials()
    
    // OpenID Connect Scopes für LinkedIn
    const scopes = params.scopes || [
      'openid',
      'profile',
      'email',
      'w_member_social', // Zum Posten
    ]
    
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: params.redirectUri,
      state: params.state,
      scope: scopes.join(' '),
    })
    
    return `${AUTH_URL}?${authParams.toString()}`
  }

  /**
   * Tauscht den Authorization Code gegen Tokens
   */
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens> {
    const { clientId, clientSecret } = this.getAppCredentials()
    
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    })
    
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LinkedIn Token Exchange fehlgeschlagen: ${errorText}`)
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
   * Erneuert den Access Token (LinkedIn unterstützt Refresh nur für bestimmte Apps)
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const { clientId, clientSecret } = this.getAppCredentials()
    
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    })
    
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LinkedIn Token Refresh fehlgeschlagen: ${errorText}`)
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
   * Holt Account-Informationen via OpenID Connect
   */
  async getAccountInfo(accessToken: string): Promise<SocialAccount> {
    // UserInfo Endpoint (OpenID Connect)
    const response = await fetch(USERINFO_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LinkedIn Profil-Abruf fehlgeschlagen: ${errorText}`)
    }
    
    const data = await response.json()
    
    return {
      platformAccountId: data.sub,
      accountName: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
      accountHandle: data.email,
      profileImageUrl: data.picture,
    }
  }

  /**
   * Postet Content auf LinkedIn
   */
  async publishPost(accessToken: string, accountId: string, content: PostContent): Promise<PostResult> {
    // URN für den Autor (Person)
    const authorUrn = `urn:li:person:${accountId}`
    
    // Build the post payload
    const postPayload: Record<string, unknown> = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: this.formatContent(content),
          },
          shareMediaCategory: content.mediaUrls?.length ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }
    
    // Wenn Medien vorhanden sind, müssen diese erst hochgeladen werden
    if (content.mediaUrls && content.mediaUrls.length > 0) {
      const mediaAssets = await this.uploadMedia(accessToken, authorUrn, content.mediaUrls)
      
      const shareContent = postPayload.specificContent as Record<string, unknown>
      const ugcContent = shareContent['com.linkedin.ugc.ShareContent'] as Record<string, unknown>
      ugcContent.media = mediaAssets.map((asset) => ({
        status: 'READY',
        description: {
          text: content.text.substring(0, 200),
        },
        media: asset,
        title: {
          text: 'Post Image',
        },
      }))
    }
    
    const response = await fetch(`${API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postPayload),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LinkedIn Post fehlgeschlagen: ${errorText}`)
    }
    
    const data = await response.json()
    
    return {
      success: true,
      postId: data.id,
      postUrl: `https://www.linkedin.com/feed/update/${data.id}`,
    }
  }

  /**
   * Lädt Medien auf LinkedIn hoch
   */
  private async uploadMedia(accessToken: string, authorUrn: string, mediaUrls: string[]): Promise<string[]> {
    const uploadedAssets: string[] = []
    
    for (const mediaUrl of mediaUrls) {
      // 1. Register upload
      const registerResponse = await fetch(`${API_BASE}/assets?action=registerUpload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: authorUrn,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            }],
          },
        }),
      })
      
      if (!registerResponse.ok) {
        console.error('LinkedIn Media Register fehlgeschlagen')
        continue
      }
      
      const registerData = await registerResponse.json()
      const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl
      const asset = registerData.value.asset
      
      // 2. Download image from URL
      const imageResponse = await fetch(mediaUrl)
      if (!imageResponse.ok) {
        console.error('Bild-Download fehlgeschlagen:', mediaUrl)
        continue
      }
      const imageBuffer = await imageResponse.arrayBuffer()
      
      // 3. Upload to LinkedIn
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: imageBuffer,
      })
      
      if (uploadResponse.ok) {
        uploadedAssets.push(asset)
      }
    }
    
    return uploadedAssets
  }

  /**
   * Formatiert den Content mit Hashtags
   */
  private formatContent(content: PostContent): string {
    let text = content.text
    
    if (content.hashtags && content.hashtags.length > 0) {
      text += '\n\n' + content.hashtags.map(tag => `#${tag}`).join(' ')
    }
    
    if (content.link) {
      text += '\n\n' + content.link
    }
    
    return text
  }
}

export const linkedInProvider = new LinkedInProvider()

