import { prisma } from '@/lib/prisma'
import { encrypt, decrypt } from './encryption'
import { GoogleBusinessConnectionStatus } from '@prisma/client'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

// Refresh token 5 minutes before expiry
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000

interface TokenResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  refresh_token?: string
}

interface GoogleAccountInfo {
  id: string
  email: string
  name?: string
  picture?: string
}

export interface GoogleBusinessTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export class GoogleBusinessTokenService {
  private clientId: string
  private clientSecret: string
  private redirectUri: string

  constructor() {
    this.clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID || ''
    this.clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET || ''
    this.redirectUri = process.env.GOOGLE_BUSINESS_REDIRECT_URI || ''

    if (!this.clientId || !this.clientSecret) {
      console.warn('Google Business API credentials not configured')
    }
  }

  /**
   * Generate the OAuth2 authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleBusinessTokens> {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to exchange code: ${error.error_description || error.error}`)
    }

    const data: TokenResponse = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || '',
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    }
  }

  /**
   * Refresh an access token using the refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleBusinessTokens> {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to refresh token: ${error.error_description || error.error}`)
    }

    const data: TokenResponse = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Keep old refresh token if not returned
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    }
  }

  /**
   * Get Google account info using access token
   */
  async getAccountInfo(accessToken: string): Promise<GoogleAccountInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get Google account info')
    }

    return response.json()
  }

  /**
   * Revoke a refresh token
   */
  async revokeToken(token: string): Promise<void> {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: 'POST',
    })
  }

  /**
   * Get valid tokens for a user, refreshing if necessary
   */
  async getValidTokensForUser(userId: string): Promise<{ accessToken: string; connectionId: string } | null> {
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: {
        userId,
        status: GoogleBusinessConnectionStatus.ACTIVE,
      },
    })

    if (!connection) {
      return null
    }

    // Decrypt tokens
    let accessToken: string
    let refreshToken: string
    
    try {
      accessToken = decrypt(connection.accessToken)
      refreshToken = decrypt(connection.refreshToken)
    } catch (error) {
      console.error('Failed to decrypt tokens:', error)
      await this.markConnectionAsError(connection.id, 'Token decryption failed')
      return null
    }

    // Check if token needs refresh
    const needsRefresh = new Date(connection.tokenExpiresAt).getTime() - Date.now() < TOKEN_REFRESH_BUFFER_MS

    if (needsRefresh) {
      try {
        const newTokens = await this.refreshAccessToken(refreshToken)
        
        // Update database with new tokens
        await prisma.googleBusinessConnection.update({
          where: { id: connection.id },
          data: {
            accessToken: encrypt(newTokens.accessToken),
            refreshToken: encrypt(newTokens.refreshToken),
            tokenExpiresAt: newTokens.expiresAt,
            lastSyncedAt: new Date(),
          },
        })

        accessToken = newTokens.accessToken
      } catch (error) {
        console.error('Failed to refresh token:', error)
        await this.markConnectionAsExpired(connection.id)
        return null
      }
    }

    return { accessToken, connectionId: connection.id }
  }

  /**
   * Store tokens for a new connection
   */
  async storeConnection(
    userId: string,
    tokens: GoogleBusinessTokens,
    googleAccountInfo: GoogleAccountInfo,
    locationId: string,
    locationName: string
  ): Promise<string> {
    // Check for existing connection with same location
    const existing = await prisma.googleBusinessConnection.findFirst({
      where: {
        userId,
        locationId,
      },
    })

    if (existing) {
      // Update existing connection
      await prisma.googleBusinessConnection.update({
        where: { id: existing.id },
        data: {
          googleAccountId: googleAccountInfo.id,
          googleEmail: googleAccountInfo.email,
          accessToken: encrypt(tokens.accessToken),
          refreshToken: encrypt(tokens.refreshToken),
          tokenExpiresAt: tokens.expiresAt,
          status: GoogleBusinessConnectionStatus.ACTIVE,
          errorMessage: null,
          lastSyncedAt: new Date(),
        },
      })
      return existing.id
    }

    // Create new connection
    const connection = await prisma.googleBusinessConnection.create({
      data: {
        userId,
        googleAccountId: googleAccountInfo.id,
        googleEmail: googleAccountInfo.email,
        locationId,
        locationName,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        tokenExpiresAt: tokens.expiresAt,
        scopes: ['https://www.googleapis.com/auth/business.manage'],
        status: GoogleBusinessConnectionStatus.ACTIVE,
        lastSyncedAt: new Date(),
      },
    })

    return connection.id
  }

  /**
   * Delete a connection and revoke tokens
   */
  async deleteConnection(connectionId: string): Promise<void> {
    const connection = await prisma.googleBusinessConnection.findUnique({
      where: { id: connectionId },
    })

    if (connection) {
      try {
        const refreshToken = decrypt(connection.refreshToken)
        await this.revokeToken(refreshToken)
      } catch (error) {
        console.error('Failed to revoke token:', error)
      }

      await prisma.googleBusinessConnection.delete({
        where: { id: connectionId },
      })
    }
  }

  /**
   * Mark connection as expired
   */
  private async markConnectionAsExpired(connectionId: string): Promise<void> {
    await prisma.googleBusinessConnection.update({
      where: { id: connectionId },
      data: {
        status: GoogleBusinessConnectionStatus.EXPIRED,
        errorMessage: 'Token expired and refresh failed',
      },
    })
  }

  /**
   * Mark connection as error
   */
  private async markConnectionAsError(connectionId: string, errorMessage: string): Promise<void> {
    await prisma.googleBusinessConnection.update({
      where: { id: connectionId },
      data: {
        status: GoogleBusinessConnectionStatus.ERROR,
        errorMessage,
      },
    })
  }

  /**
   * Get connection status for a user
   */
  async getConnectionStatus(userId: string): Promise<{
    isConnected: boolean
    status: GoogleBusinessConnectionStatus | null
    googleEmail: string | null
    locationName: string | null
    lastSyncedAt: Date | null
    errorMessage: string | null
  }> {
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!connection) {
      return {
        isConnected: false,
        status: null,
        googleEmail: null,
        locationName: null,
        lastSyncedAt: null,
        errorMessage: null,
      }
    }

    return {
      isConnected: connection.status === GoogleBusinessConnectionStatus.ACTIVE,
      status: connection.status,
      googleEmail: connection.googleEmail,
      locationName: connection.locationName,
      lastSyncedAt: connection.lastSyncedAt,
      errorMessage: connection.errorMessage,
    }
  }
}

// Export singleton instance
export const googleBusinessTokenService = new GoogleBusinessTokenService()

