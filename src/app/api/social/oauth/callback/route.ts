/**
 * OAuth Callback Route
 * 
 * GET /api/social/oauth/callback
 * Verarbeitet den OAuth-Callback und speichert den Account
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptToken, encryptToken } from '@/lib/social/crypto'
import { SOCIAL_PROVIDERS } from '@/lib/social'
import type { SocialPlatform } from '@/lib/social/types'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const successUrl = `${baseUrl}/salon/marketing/social-media/accounts?connected=true`
  const errorUrl = `${baseUrl}/salon/marketing/social-media/accounts?error=`
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.redirect(`${errorUrl}unauthorized`)
    }
    
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    // Fehler von OAuth Provider
    if (error) {
      console.error('[OAuth Callback] Provider Error:', error, errorDescription)
      return NextResponse.redirect(`${errorUrl}${encodeURIComponent(errorDescription || error)}`)
    }
    
    if (!code || !state) {
      return NextResponse.redirect(`${errorUrl}missing_params`)
    }
    
    // State validieren
    const cookieStore = await cookies()
    const savedState = cookieStore.get('oauth_state')?.value
    
    if (!savedState || savedState !== state) {
      return NextResponse.redirect(`${errorUrl}invalid_state`)
    }
    
    // State dekodieren
    let stateData: { userId: string; platform: string; timestamp: number }
    
    try {
      stateData = JSON.parse(decryptToken(state))
    } catch {
      return NextResponse.redirect(`${errorUrl}invalid_state_data`)
    }
    
    // User-ID prüfen
    if (stateData.userId !== session.user.id) {
      return NextResponse.redirect(`${errorUrl}user_mismatch`)
    }
    
    // Timestamp prüfen (max 10 Minuten alt)
    if (Date.now() - stateData.timestamp > 600000) {
      return NextResponse.redirect(`${errorUrl}state_expired`)
    }
    
    const platform = stateData.platform
    const provider = SOCIAL_PROVIDERS[platform]
    
    if (!provider) {
      return NextResponse.redirect(`${errorUrl}invalid_platform`)
    }
    
    // Code Verifier holen falls PKCE verwendet wird (Twitter, TikTok)
    let codeVerifier: string | undefined
    if (provider.getCodeVerifier) {
      codeVerifier = provider.getCodeVerifier(state)
    }
    
    // Token holen
    const redirectUri = `${baseUrl}/api/social/oauth/callback`
    const tokens = await provider.exchangeCodeForTokens(code, redirectUri, codeVerifier)
    
    // Account-Info holen
    const accountInfo = await provider.getAccountInfo(tokens.accessToken)
    
    // Token verschlüsseln für Speicherung
    const encryptedAccessToken = encryptToken(tokens.accessToken)
    const encryptedRefreshToken = tokens.refreshToken 
      ? encryptToken(tokens.refreshToken) 
      : null
    
    // Platform als Enum casten
    const platformEnum = platform as SocialPlatform
    
    // Account in DB speichern/aktualisieren
    await prisma.socialMediaAccount.upsert({
      where: {
        userId_platform_platformAccountId: {
          userId: session.user.id,
          platform: platformEnum,
          platformAccountId: accountInfo.platformAccountId,
        },
      },
      update: {
        accountName: accountInfo.accountName,
        accountHandle: accountInfo.accountHandle,
        profileImageUrl: accountInfo.profileImageUrl,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: tokens.expiresAt,
        tokenScope: tokens.scope,
        followersCount: accountInfo.followersCount,
        followingCount: accountInfo.followingCount,
        postsCount: accountInfo.postsCount,
        metricsUpdatedAt: new Date(),
        isActive: true,
        lastError: null,
        lastSyncAt: new Date(),
      },
      create: {
        userId: session.user.id,
        platform: platformEnum,
        platformAccountId: accountInfo.platformAccountId,
        accountName: accountInfo.accountName,
        accountHandle: accountInfo.accountHandle,
        profileImageUrl: accountInfo.profileImageUrl,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: tokens.expiresAt,
        tokenScope: tokens.scope,
        followersCount: accountInfo.followersCount,
        followingCount: accountInfo.followingCount,
        postsCount: accountInfo.postsCount,
        metricsUpdatedAt: new Date(),
      },
    })
    
    // State Cookie löschen
    cookieStore.delete('oauth_state')
    
    // Erfolg - zur Accounts-Seite weiterleiten
    return NextResponse.redirect(`${successUrl}&platform=${platform.toLowerCase()}`)
  } catch (error) {
    console.error('[OAuth Callback] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'unknown_error'
    return NextResponse.redirect(`${errorUrl}${encodeURIComponent(errorMessage)}`)
  }
}
