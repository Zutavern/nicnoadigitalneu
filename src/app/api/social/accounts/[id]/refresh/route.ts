/**
 * Account Refresh Route
 * 
 * POST /api/social/accounts/[id]/refresh
 * Synchronisiert Account-Daten und erneuert Token wenn nötig
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptToken, encryptToken, isTokenExpiringSoon } from '@/lib/social/crypto'
import { instagramProvider } from '@/lib/social/providers/instagram'
import { facebookProvider } from '@/lib/social/providers/facebook'
import type { SocialProvider } from '@/lib/social/types'

const PROVIDERS: Record<string, SocialProvider> = {
  INSTAGRAM: instagramProvider,
  FACEBOOK: facebookProvider,
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Account laden
    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })
    
    if (!account) {
      return NextResponse.json({ error: 'Account nicht gefunden' }, { status: 404 })
    }
    
    const provider = PROVIDERS[account.platform]
    
    if (!provider) {
      return NextResponse.json(
        { error: `Provider ${account.platform} nicht unterstützt` },
        { status: 400 }
      )
    }
    
    // Token entschlüsseln
    let accessToken: string
    
    try {
      accessToken = decryptToken(account.accessToken)
    } catch {
      return NextResponse.json(
        { error: 'Token konnte nicht entschlüsselt werden. Bitte neu verbinden.' },
        { status: 400 }
      )
    }
    
    // Token erneuern wenn nötig
    if (isTokenExpiringSoon(account.tokenExpiresAt)) {
      try {
        const newTokens = await provider.refreshAccessToken(accessToken)
        accessToken = newTokens.accessToken
        
        await prisma.socialMediaAccount.update({
          where: { id },
          data: {
            accessToken: encryptToken(newTokens.accessToken),
            refreshToken: newTokens.refreshToken 
              ? encryptToken(newTokens.refreshToken) 
              : account.refreshToken,
            tokenExpiresAt: newTokens.expiresAt,
          },
        })
      } catch (error) {
        console.error('[Account Refresh] Token refresh failed:', error)
        // Weitermachen mit altem Token, falls noch gültig
      }
    }
    
    // Account-Info aktualisieren
    try {
      const accountInfo = await provider.getAccountInfo(accessToken)
      
      await prisma.socialMediaAccount.update({
        where: { id },
        data: {
          accountName: accountInfo.accountName,
          accountHandle: accountInfo.accountHandle,
          profileImageUrl: accountInfo.profileImageUrl,
          followersCount: accountInfo.followersCount,
          followingCount: accountInfo.followingCount,
          postsCount: accountInfo.postsCount,
          metricsUpdatedAt: new Date(),
          lastSyncAt: new Date(),
          lastError: null,
          isActive: true,
        },
      })
      
      return NextResponse.json({ success: true, accountInfo })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      await prisma.socialMediaAccount.update({
        where: { id },
        data: {
          lastError: errorMessage,
          lastSyncAt: new Date(),
        },
      })
      
      return NextResponse.json(
        { error: `Sync fehlgeschlagen: ${errorMessage}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Account Refresh] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Synchronisieren des Accounts' },
      { status: 500 }
    )
  }
}

