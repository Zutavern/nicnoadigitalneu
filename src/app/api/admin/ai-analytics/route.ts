/**
 * AI Analytics API Route
 * 
 * Liefert Statistiken zur AI-Nutzung für das Admin-Dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { 
  getUsageStats, 
  getUsageByModel, 
  getUsageByUser, 
  getDailyUsage,
  getExtendedStats,
  getUsageByFeature,
  getUsageByProvider,
} from '@/lib/openrouter/usage-tracker'
import { prisma } from '@/lib/prisma'

/**
 * GET: Holt AI-Analytics-Daten
 */
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

    // Query-Parameter
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30', 10)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date()

    // Hole alle Statistiken parallel
    const [
      basicStats,
      byModel,
      byUser,
      dailyUsage,
      byFeature,
      byProvider,
      recentLogs,
    ] = await Promise.all([
      getUsageStats(startDate, endDate),
      getUsageByModel(startDate, endDate),
      getUsageByUser(startDate, endDate, 20),
      getDailyUsage(days),
      getUsageByFeature(startDate, endDate),
      getUsageByProvider(startDate, endDate),
      // Letzte 50 Logs für die Tabelle
      prisma.aIUsageLog.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          userId: true,
          salonId: true,
          userType: true,
          requestType: true,
          model: true,
          provider: true,
          totalTokens: true,
          costUsd: true,
          responseTimeMs: true,
          success: true,
          errorMessage: true,
          createdAt: true,
        },
      }),
    ])

    // User-Details für die Top-User holen
    const userIds = byUser.map(u => u.userId).filter(Boolean) as string[]
    const users = userIds.length > 0 
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, role: true },
        })
      : []

    const userMap = new Map(users.map(u => [u.id, u]))

    return NextResponse.json({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days,
      },
      summary: {
        ...basicStats,
        successRate: basicStats.totalRequests > 0 
          ? Math.round((basicStats.successfulRequests / basicStats.totalRequests) * 100) 
          : 0,
        avgCostPerRequest: basicStats.totalRequests > 0 
          ? basicStats.totalCostUsd / basicStats.totalRequests 
          : 0,
      },
      byModel,
      byUser: byUser.map(u => ({
        ...u,
        user: u.userId ? userMap.get(u.userId) : null,
      })),
      byFeature,
      byProvider,
      dailyUsage,
      recentLogs: recentLogs.map(log => ({
        ...log,
        costUsd: Number(log.costUsd),
      })),
    })

  } catch (error) {
    console.error('[AI Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Analytics' },
      { status: 500 }
    )
  }
}

