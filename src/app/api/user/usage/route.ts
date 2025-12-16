/**
 * User Usage API
 * 
 * GET: Eigene Verbrauchsübersicht (nach Feature, Modell, Zeitraum)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      // Demo-Modus: Leere Daten zurückgeben
      return NextResponse.json({
        summary: {
          totalRequests: 0,
          totalTokens: 0,
          totalCostEur: 0,
          currentMonthCostEur: 0,
          period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
            days: 30,
          },
        },
        spendingLimit: null,
        byFeature: [],
        byModel: [],
        dailyUsage: [],
        recentActivity: [],
        isDemo: true,
      })
    }

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '20')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Hole alle Usage Logs des Nutzers
    const usageLogs = await prisma.aIUsageLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
        success: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Aggregiere nach Feature
    const byFeature = await prisma.aIUsageLog.groupBy({
      by: ['feature'],
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
        success: true,
      },
      _count: true,
      _sum: {
        totalTokens: true,
        costUsd: true,
      },
    })

    // Aggregiere nach Modell
    const byModel = await prisma.aIUsageLog.groupBy({
      by: ['model'],
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
        success: true,
      },
      _count: true,
      _sum: {
        totalTokens: true,
        costUsd: true,
      },
    })

    // Tägliche Kosten für den Zeitraum
    const dailyUsage = await prisma.$queryRaw<Array<{ date: string; totalCost: number; requests: number }>>`
      SELECT 
        DATE(created_at) as date,
        SUM(cost_usd) as "totalCost",
        COUNT(*) as requests
      FROM ai_usage_logs
      WHERE user_id = ${session.user.id}::uuid
        AND created_at >= ${startDate}
        AND success = true
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    // Gesamt-Statistiken
    const totals = await prisma.aIUsageLog.aggregate({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
        success: true,
      },
      _sum: {
        totalTokens: true,
        costUsd: true,
        inputTokens: true,
        outputTokens: true,
      },
      _count: true,
    })

    // Hole SpendingLimit des Users
    const spendingLimit = await prisma.spendingLimit.findUnique({
      where: { userId: session.user.id },
    })

    // Hole aktuelle Monatskosten
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const currentMonthCost = await prisma.aIUsageLog.aggregate({
      where: {
        userId: session.user.id,
        createdAt: { gte: monthStart },
        success: true,
      },
      _sum: {
        costUsd: true,
      },
    })

    // Berechne mit Marge (durchschnittlich ~40%)
    const marginMultiplier = 1.4
    const totalCostWithMargin = Number(totals._sum.costUsd || 0) * marginMultiplier
    const currentMonthWithMargin = Number(currentMonthCost._sum.costUsd || 0) * marginMultiplier

    // Feature-Labels für bessere Darstellung
    const featureLabels: Record<string, { label: string; icon: string }> = {
      social_post: { label: 'Social Media Posts', icon: '📝' },
      video_gen: { label: 'Video-Erstellung', icon: '🎬' },
      image_gen: { label: 'Bild-Generierung', icon: '🖼️' },
      translation: { label: 'Übersetzungen', icon: '🌍' },
      chat: { label: 'Chat & Assistenz', icon: '💬' },
      hashtags: { label: 'Hashtags', icon: '#️⃣' },
      content_improvement: { label: 'Content-Verbesserung', icon: '✨' },
    }

    // Formatiere Feature-Statistiken
    const featureStats = byFeature.map(f => ({
      feature: f.feature || 'other',
      label: featureLabels[f.feature || 'other']?.label || 'Sonstiges',
      icon: featureLabels[f.feature || 'other']?.icon || '🤖',
      requests: f._count,
      tokens: f._sum.totalTokens || 0,
      costEur: Number(f._sum.costUsd || 0) * marginMultiplier * 0.92, // USD to EUR
      percentage: totalCostWithMargin > 0 
        ? ((Number(f._sum.costUsd || 0) * marginMultiplier) / totalCostWithMargin) * 100 
        : 0,
    })).sort((a, b) => b.costEur - a.costEur)

    // Formatiere Modell-Statistiken
    const modelStats = byModel.map(m => ({
      model: m.model,
      requests: m._count,
      tokens: m._sum.totalTokens || 0,
      costEur: Number(m._sum.costUsd || 0) * marginMultiplier * 0.92,
    })).sort((a, b) => b.costEur - a.costEur)

    // Formatiere letzte Aktivitäten
    const recentActivity = usageLogs.map(log => ({
      id: log.id,
      timestamp: log.createdAt,
      feature: log.feature || 'other',
      featureLabel: featureLabels[log.feature || 'other']?.label || 'Sonstiges',
      featureIcon: featureLabels[log.feature || 'other']?.icon || '🤖',
      model: log.model,
      tokens: log.totalTokens,
      costEur: Number(log.costUsd) * marginMultiplier * 0.92,
      responseTimeMs: log.responseTimeMs,
    }))

    return NextResponse.json({
      summary: {
        totalRequests: totals._count,
        totalTokens: totals._sum.totalTokens || 0,
        totalCostEur: totalCostWithMargin * 0.92, // USD to EUR
        currentMonthCostEur: currentMonthWithMargin * 0.92,
        period: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
          days,
        },
      },
      spendingLimit: spendingLimit ? {
        monthlyLimitEur: Number(spendingLimit.monthlyLimitEur),
        currentMonthSpentEur: Number(spendingLimit.currentMonthSpent),
        alertThreshold: spendingLimit.alertThreshold,
        hardLimit: spendingLimit.hardLimit,
        percentageUsed: Number(spendingLimit.monthlyLimitEur) > 0
          ? (Number(spendingLimit.currentMonthSpent) / Number(spendingLimit.monthlyLimitEur)) * 100
          : 0,
      } : null,
      byFeature: featureStats,
      byModel: modelStats,
      dailyUsage: dailyUsage.map(d => ({
        date: d.date,
        costEur: Number(d.totalCost) * marginMultiplier * 0.92,
        requests: Number(d.requests),
      })),
      recentActivity,
    })

  } catch (error) {
    console.error('Error fetching user usage:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Verbrauchsdaten' },
      { status: 500 }
    )
  }
}

