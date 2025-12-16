/**
 * Admin AI Analytics API Route
 * 
 * Liefert umfassende Analytics-Daten für das AI Usage Dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Feature Labels für bessere Lesbarkeit
const featureLabels: Record<string, string> = {
  social_post: 'Social Media',
  video_gen: 'Videos',
  image_gen: 'Bilder',
  translation: 'Übersetzungen',
  chat: 'Chat',
  hashtags: 'Hashtags',
  content_improvement: 'Verbesserungen',
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
    const days = parseInt(searchParams.get('days') || '30', 10)

    // Datum-Bereiche
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const periodStart = new Date(todayStart)
    periodStart.setDate(periodStart.getDate() - days)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Parallele Queries für Performance
    const [
      todayStats,
      yesterdayStats,
      activeUsers24h,
      dailyUsage,
      topUsersData,
      featureStats,
      topFeatureToday,
    ] = await Promise.all([
      // Heute Stats
      prisma.aIUsageLog.aggregate({
        where: {
          createdAt: { gte: todayStart },
          success: true,
        },
        _count: { id: true },
        _sum: { costUsd: true },
      }),

      // Gestern Stats (für Trend)
      prisma.aIUsageLog.aggregate({
        where: {
          createdAt: {
            gte: yesterdayStart,
            lt: todayStart,
          },
          success: true,
        },
        _count: { id: true },
      }),

      // Aktive Nutzer in den letzten 24h
      prisma.aIUsageLog.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          userId: { not: null },
        },
      }),

      // Tägliche Nutzung für Chart
      prisma.$queryRaw<Array<{ date: string; requests: string; cost_eur: string }>>`
        SELECT 
          DATE(created_at AT TIME ZONE 'Europe/Berlin')::text as date,
          COUNT(*)::text as requests,
          (COALESCE(SUM(cost_usd), 0) * 0.92)::text as cost_eur
        FROM ai_usage_logs
        WHERE created_at >= ${periodStart}
          AND success = true
        GROUP BY DATE(created_at AT TIME ZONE 'Europe/Berlin')
        ORDER BY date ASC
      `,

      // Top Users diesen Monat
      prisma.$queryRaw<Array<{
        user_id: string
        total_cost: string
        request_count: string
      }>>`
        SELECT 
          user_id,
          (COALESCE(SUM(cost_usd), 0) * 0.92)::text as total_cost,
          COUNT(*)::text as request_count
        FROM ai_usage_logs
        WHERE created_at >= ${monthStart}
          AND user_id IS NOT NULL
          AND success = true
        GROUP BY user_id
        ORDER BY SUM(cost_usd) DESC
        LIMIT 10
      `,

      // Feature Breakdown
      prisma.$queryRaw<Array<{
        feature: string
        requests: string
        cost_eur: string
        models: string[]
      }>>`
        SELECT 
          COALESCE(feature, 'other') as feature,
          COUNT(*)::text as requests,
          (COALESCE(SUM(cost_usd), 0) * 0.92)::text as cost_eur,
          array_agg(DISTINCT model) FILTER (WHERE model IS NOT NULL) as models
        FROM ai_usage_logs
        WHERE created_at >= ${periodStart}
          AND success = true
        GROUP BY feature
        ORDER BY COUNT(*) DESC
      `,

      // Top Feature heute
      prisma.aIUsageLog.groupBy({
        by: ['feature'],
        where: {
          createdAt: { gte: todayStart },
          success: true,
          feature: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
      }),
    ])

    // Lade User-Daten für Top Users
    const userIds = topUsersData.map(u => u.user_id).filter(Boolean)
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, role: true },
        })
      : []

    const userMap = new Map(users.map(u => [u.id, u]))

    // Trend berechnen
    const todayRequests = todayStats._count.id || 0
    const yesterdayRequests = yesterdayStats._count.id || 0
    const trend = yesterdayRequests > 0
      ? Math.round(((todayRequests - yesterdayRequests) / yesterdayRequests) * 100)
      : todayRequests > 0 ? 100 : 0

    // Kosten in EUR umrechnen (USD * 0.92)
    const todayCostEur = Number(todayStats._sum.costUsd || 0) * 0.92

    // Response zusammenstellen
    const response = {
      stats: {
        todayRequests,
        todayRequestsTrend: trend,
        todayCostEur: Math.round(todayCostEur * 100) / 100,
        activeUsers24h: activeUsers24h.length,
        topFeature: topFeatureToday[0]
          ? {
              name: featureLabels[topFeatureToday[0].feature || ''] || topFeatureToday[0].feature || 'Unbekannt',
              count: topFeatureToday[0]._count.id,
            }
          : { name: '-', count: 0 },
      },

      dailyUsage: dailyUsage.map(d => ({
        date: d.date,
        requests: parseInt(d.requests, 10),
        costEur: Math.round(parseFloat(d.cost_eur) * 100) / 100,
      })),

      topUsers: topUsersData.map(u => {
        const userData = userMap.get(u.user_id)
        return {
          user: userData || { id: u.user_id, name: 'Unbekannt', email: '-', role: 'USER' },
          totalCostEur: Math.round(parseFloat(u.total_cost) * 100) / 100,
          requestCount: parseInt(u.request_count, 10),
        }
      }),

      byFeature: featureStats.map(f => {
        const requests = parseInt(f.requests, 10)
        const costEur = parseFloat(f.cost_eur)
        return {
          feature: f.feature,
          label: featureLabels[f.feature] || f.feature || 'Sonstiges',
          requests,
          costEur: Math.round(costEur * 100) / 100,
          avgCost: requests > 0 ? Math.round((costEur / requests) * 10000) / 10000 : 0,
          topModels: (f.models || []).slice(0, 3),
        }
      }),

      period: {
        days,
        start: periodStart.toISOString(),
        end: now.toISOString(),
      },
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Admin AI Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Analytics-Daten' },
      { status: 500 }
    )
  }
}
