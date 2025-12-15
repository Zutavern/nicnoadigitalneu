/**
 * Post Publish Route
 * 
 * POST /api/social/posts/[id]/publish
 * Veröffentlicht einen Post auf den gewählten Plattformen
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decryptToken, encryptToken, isTokenExpired } from '@/lib/social/crypto'
import { instagramProvider } from '@/lib/social/providers/instagram'
import { facebookProvider } from '@/lib/social/providers/facebook'
import type { SocialProvider, PostContent } from '@/lib/social/types'

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
    
    // Post mit Accounts laden
    const post = await prisma.socialMediaPost.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        postAccounts: {
          include: {
            account: true,
          },
        },
      },
    })
    
    if (!post) {
      return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 })
    }
    
    if (post.status === 'PUBLISHED') {
      return NextResponse.json({ error: 'Post wurde bereits veröffentlicht' }, { status: 400 })
    }
    
    if (post.postAccounts.length === 0) {
      return NextResponse.json(
        { error: 'Keine Plattformen für diesen Post ausgewählt' },
        { status: 400 }
      )
    }
    
    // Content vorbereiten
    const postContent: PostContent = {
      text: post.content,
      mediaUrls: post.mediaUrls,
      hashtags: post.hashtags,
    }
    
    const results: Array<{
      platform: string
      accountId: string
      success: boolean
      platformPostId?: string
      error?: string
    }> = []
    
    // Für jeden Account veröffentlichen
    for (const postAccount of post.postAccounts) {
      const account = postAccount.account
      const provider = PROVIDERS[account.platform]
      
      if (!provider) {
        results.push({
          platform: account.platform,
          accountId: account.id,
          success: false,
          error: `Provider ${account.platform} nicht unterstützt`,
        })
        continue
      }
      
      // Token prüfen
      if (isTokenExpired(account.tokenExpiresAt)) {
        results.push({
          platform: account.platform,
          accountId: account.id,
          success: false,
          error: 'Token abgelaufen. Bitte Account neu verbinden.',
        })
        
        // Account als inaktiv markieren
        await prisma.socialMediaAccount.update({
          where: { id: account.id },
          data: { 
            isActive: false,
            lastError: 'Token abgelaufen',
          },
        })
        continue
      }
      
      // Token entschlüsseln
      let accessToken: string
      
      try {
        accessToken = decryptToken(account.accessToken)
      } catch {
        results.push({
          platform: account.platform,
          accountId: account.id,
          success: false,
          error: 'Token konnte nicht entschlüsselt werden',
        })
        continue
      }
      
      // Veröffentlichen
      try {
        const result = await provider.createPost(
          accessToken,
          account.platformAccountId,
          postContent
        )
        
        // PostAccount aktualisieren
        await prisma.socialMediaPostAccount.update({
          where: { id: postAccount.id },
          data: {
            platformPostId: result.platformPostId,
            publishedAt: result.postedAt,
            publishError: result.error,
          },
        })
        
        results.push({
          platform: account.platform,
          accountId: account.id,
          success: result.success,
          platformPostId: result.platformPostId,
          error: result.error,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        await prisma.socialMediaPostAccount.update({
          where: { id: postAccount.id },
          data: {
            publishError: errorMessage,
          },
        })
        
        results.push({
          platform: account.platform,
          accountId: account.id,
          success: false,
          error: errorMessage,
        })
      }
    }
    
    // Post-Status aktualisieren
    const allSuccessful = results.every(r => r.success)
    const anySuccessful = results.some(r => r.success)
    
    await prisma.socialMediaPost.update({
      where: { id },
      data: {
        status: anySuccessful ? 'PUBLISHED' : 'FAILED',
        publishedAt: anySuccessful ? new Date() : null,
      },
    })
    
    return NextResponse.json({
      success: anySuccessful,
      allSuccessful,
      results,
    })
  } catch (error) {
    console.error('[Post Publish] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Veröffentlichen des Posts' },
      { status: 500 }
    )
  }
}

