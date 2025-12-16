/**
 * Admin AI Analytics Live Feed API
 * 
 * Liefert die neuesten AI-Anfragen für den Echtzeit-Feed
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Feature Labels
const featureLabels: Record<string, string> = {
  social_post: 'Social Media',
  video_gen: 'Videos',
  image_gen: 'Bilder',
  translation: 'Übersetzungen',
  chat: 'Chat',
  hashtags: 'Hashtags',
  content_improvement: 'Verbesserungen',
}

// Feature Farben für UI
const featureColors: Record<string, string> = {
  social_post: 'pink',
  video_gen: 'purple',
  image_gen: 'blue',
  translation: 'emerald',
  chat: 'sky',
  hashtags: 'orange',
  content_improvement: 'amber',
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Prüfe Admin-Rechte
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)
    const since = searchParams.get('since') // Optional: nur neue seit diesem Timestamp

    // Baue Where-Bedingung
    const whereCondition: {
      success: boolean
      createdAt?: { gt: Date }
    } = { success: true }
    
    if (since) {
      whereCondition.createdAt = { gt: new Date(since) }
    }

    // Hole die neuesten Logs
    const logs = await prisma.aIUsageLog.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        feature: true,
        model: true,
        provider: true,
        totalTokens: true,
        costUsd: true,
        responseTimeMs: true,
        createdAt: true,
      },
    })

    // Lade User-Daten
    const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))] as string[]
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : []

    const userMap = new Map(users.map(u => [u.id, u]))

    // Response formatieren
    const activities = logs.map(log => {
      const userData = log.userId ? userMap.get(log.userId) : null
      const feature = log.feature || 'other'
      
      return {
        id: log.id,
        timestamp: log.createdAt.toISOString(),
        feature,
        featureLabel: featureLabels[feature] || 'Sonstiges',
        featureColor: featureColors[feature] || 'gray',
        model: log.model || 'unknown',
        provider: log.provider,
        tokens: log.totalTokens,
        costEur: Math.round(Number(log.costUsd) * 0.92 * 10000) / 10000,
        responseTimeMs: log.responseTimeMs,
        user: userData
          ? { name: userData.name || 'Unbekannt', email: userData.email }
          : { name: 'System', email: '-' },
      }
    })

    return NextResponse.json({
      activities,
      count: activities.length,
      latestTimestamp: activities[0]?.timestamp || null,
    })

  } catch (error) {
    console.error('[Admin AI Analytics Live] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Live-Daten' },
      { status: 500 }
    )
  }
}

