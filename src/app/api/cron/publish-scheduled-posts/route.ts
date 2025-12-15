/**
 * Cron Job: Publish Scheduled Posts
 * 
 * GET /api/cron/publish-scheduled-posts
 * 
 * Dieser Cron-Job wird regelmäßig aufgerufen, um geplante Posts zu veröffentlichen.
 * Sollte alle 1-5 Minuten ausgeführt werden.
 * 
 * Vercel Cron: In vercel.json konfigurieren
 * Oder extern via Uptime Robot, cron-job.org, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptToken, isTokenExpired } from '@/lib/social/crypto'
import { instagramProvider } from '@/lib/social/providers/instagram'
import { facebookProvider } from '@/lib/social/providers/facebook'
import type { SocialProvider, PostContent } from '@/lib/social/types'

const PROVIDERS: Record<string, SocialProvider> = {
  INSTAGRAM: instagramProvider,
  FACEBOOK: facebookProvider,
}

// Secret für Cron-Auth (optional)
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  try {
    // Authentifizierung für Cron-Jobs
    const authHeader = request.headers.get('authorization')
    const cronSecret = request.nextUrl.searchParams.get('secret')
    
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Geplante Posts finden, die jetzt veröffentlicht werden sollen
    const now = new Date()
    
    const scheduledPosts = await prisma.socialMediaPost.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: now, // Scheduled time ist in der Vergangenheit oder jetzt
        },
      },
      include: {
        postAccounts: {
          include: {
            account: true,
          },
        },
      },
      take: 50, // Max 50 Posts pro Durchlauf
      orderBy: {
        scheduledFor: 'asc',
      },
    })
    
    if (scheduledPosts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Keine geplanten Posts zu veröffentlichen',
        processed: 0,
      })
    }
    
    const results: Array<{
      postId: string
      success: boolean
      platforms: number
      successfulPlatforms: number
      errors: string[]
    }> = []
    
    for (const post of scheduledPosts) {
      const postResults = {
        postId: post.id,
        success: false,
        platforms: post.postAccounts.length,
        successfulPlatforms: 0,
        errors: [] as string[],
      }
      
      // Content vorbereiten
      const postContent: PostContent = {
        text: post.content,
        mediaUrls: post.mediaUrls,
        hashtags: post.hashtags,
      }
      
      // Für jeden Account veröffentlichen
      for (const postAccount of post.postAccounts) {
        const account = postAccount.account
        const provider = PROVIDERS[account.platform]
        
        if (!provider) {
          postResults.errors.push(`Provider ${account.platform} nicht unterstützt`)
          continue
        }
        
        // Token prüfen
        if (isTokenExpired(account.tokenExpiresAt)) {
          postResults.errors.push(`${account.platform}: Token abgelaufen`)
          
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
          postResults.errors.push(`${account.platform}: Token-Entschlüsselung fehlgeschlagen`)
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
          
          if (result.success) {
            postResults.successfulPlatforms++
          } else {
            postResults.errors.push(`${account.platform}: ${result.error}`)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          postResults.errors.push(`${account.platform}: ${errorMessage}`)
          
          await prisma.socialMediaPostAccount.update({
            where: { id: postAccount.id },
            data: {
              publishError: errorMessage,
            },
          })
        }
      }
      
      // Post-Status aktualisieren
      postResults.success = postResults.successfulPlatforms > 0
      
      await prisma.socialMediaPost.update({
        where: { id: post.id },
        data: {
          status: postResults.success ? 'PUBLISHED' : 'FAILED',
          publishedAt: postResults.success ? new Date() : null,
        },
      })
      
      results.push(postResults)
    }
    
    const totalSuccess = results.filter(r => r.success).length
    
    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: totalSuccess,
      failed: results.length - totalSuccess,
      results,
    })
  } catch (error) {
    console.error('[Cron: Publish Scheduled Posts] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten geplanter Posts' },
      { status: 500 }
    )
  }
}

// POST auch erlauben für manuelle Trigger
export async function POST(request: NextRequest) {
  return GET(request)
}

