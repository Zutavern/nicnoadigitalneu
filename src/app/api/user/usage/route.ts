/**
 * User Usage API
 * 
 * GET: Eigene Verbrauchsübersicht (nach Feature, Modell, Zeitraum)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive } from '@/lib/mock-data'

// Mock-Daten für Demo-Accounts
function generateDemoUsageData() {
  const now = new Date()
  const getRelativeDate = (daysAgo: number) => {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString()
  }

  // Diverse AI-Aktionen der letzten Tage
  const recentActivity = [
    {
      id: 'demo-usage-1',
      timestamp: getRelativeDate(0),
      feature: 'homepage_generation',
      featureLabel: 'Homepage erstellen',
      featureIcon: '🌐',
      model: 'v0-homepage-generate',
      tokens: 0,
      costEur: 0.75,
      responseTimeMs: 12500,
    },
    {
      id: 'demo-usage-2',
      timestamp: getRelativeDate(0),
      feature: 'homepage_prompt',
      featureLabel: 'Homepage ändern',
      featureIcon: '🌐',
      model: 'v0-homepage-prompt',
      tokens: 0,
      costEur: 0.25,
      responseTimeMs: 8200,
    },
    {
      id: 'demo-usage-3',
      timestamp: getRelativeDate(1),
      feature: 'social_post',
      featureLabel: 'Social Media Posts',
      featureIcon: '📝',
      model: 'gpt-4o-mini',
      tokens: 850,
      costEur: 0.03,
      responseTimeMs: 2100,
    },
    {
      id: 'demo-usage-4',
      timestamp: getRelativeDate(1),
      feature: 'image_gen',
      featureLabel: 'Bild-Generierung',
      featureIcon: '🖼️',
      model: 'dall-e-3',
      tokens: 0,
      costEur: 0.08,
      responseTimeMs: 15000,
    },
    {
      id: 'demo-usage-5',
      timestamp: getRelativeDate(2),
      feature: 'homepage_prompt',
      featureLabel: 'Homepage ändern',
      featureIcon: '🌐',
      model: 'v0-homepage-prompt',
      tokens: 0,
      costEur: 0.25,
      responseTimeMs: 7800,
    },
    {
      id: 'demo-usage-6',
      timestamp: getRelativeDate(2),
      feature: 'translation',
      featureLabel: 'Übersetzungen',
      featureIcon: '🌍',
      model: 'gpt-4o-mini',
      tokens: 420,
      costEur: 0.02,
      responseTimeMs: 1500,
    },
    {
      id: 'demo-usage-7',
      timestamp: getRelativeDate(3),
      feature: 'chat',
      featureLabel: 'Chat & Assistenz',
      featureIcon: '💬',
      model: 'gpt-4o',
      tokens: 1200,
      costEur: 0.05,
      responseTimeMs: 3200,
    },
    {
      id: 'demo-usage-8',
      timestamp: getRelativeDate(4),
      feature: 'social_post',
      featureLabel: 'Social Media Posts',
      featureIcon: '📝',
      model: 'gpt-4o-mini',
      tokens: 680,
      costEur: 0.02,
      responseTimeMs: 1800,
    },
  ]

  // Aggregierte Feature-Statistiken
  const byFeature = [
    {
      feature: 'homepage_generation',
      label: 'Homepage erstellen',
      icon: '🌐',
      requests: 2,
      tokens: 0,
      costEur: 1.50,
      percentage: 45.5,
    },
    {
      feature: 'homepage_prompt',
      label: 'Homepage ändern',
      icon: '🌐',
      requests: 5,
      tokens: 0,
      costEur: 1.25,
      percentage: 37.9,
    },
    {
      feature: 'social_post',
      label: 'Social Media Posts',
      icon: '📝',
      requests: 12,
      tokens: 9800,
      costEur: 0.28,
      percentage: 8.5,
    },
    {
      feature: 'image_gen',
      label: 'Bild-Generierung',
      icon: '🖼️',
      requests: 2,
      tokens: 0,
      costEur: 0.16,
      percentage: 4.8,
    },
    {
      feature: 'chat',
      label: 'Chat & Assistenz',
      icon: '💬',
      requests: 8,
      tokens: 4200,
      costEur: 0.08,
      percentage: 2.4,
    },
    {
      feature: 'translation',
      label: 'Übersetzungen',
      icon: '🌍',
      requests: 4,
      tokens: 1680,
      costEur: 0.03,
      percentage: 0.9,
    },
  ]

  // Tägliche Nutzung
  const dailyUsage = [
    { date: getRelativeDate(0).split('T')[0], costEur: 1.03, requests: 4 },
    { date: getRelativeDate(1).split('T')[0], costEur: 0.36, requests: 5 },
    { date: getRelativeDate(2).split('T')[0], costEur: 0.52, requests: 6 },
    { date: getRelativeDate(3).split('T')[0], costEur: 0.25, requests: 3 },
    { date: getRelativeDate(4).split('T')[0], costEur: 0.47, requests: 8 },
    { date: getRelativeDate(5).split('T')[0], costEur: 0.31, requests: 4 },
    { date: getRelativeDate(6).split('T')[0], costEur: 0.36, requests: 3 },
  ]

  const totalCostEur = byFeature.reduce((sum, f) => sum + f.costEur, 0)
  const totalRequests = byFeature.reduce((sum, f) => sum + f.requests, 0)
  const totalTokens = byFeature.reduce((sum, f) => sum + f.tokens, 0)

  return {
    summary: {
      totalRequests,
      totalTokens,
      totalCostEur,
      currentMonthCostEur: totalCostEur,
      period: {
        start: getRelativeDate(30),
        end: now.toISOString(),
        days: 30,
      },
    },
    subscription: {
      status: 'demo',
      isActive: true,
      message: null,
    },
    spendingLimit: {
      monthlyLimitEur: 50.00,
      currentMonthSpentEur: totalCostEur,
      alertThreshold: 0.8,
      hardLimit: true,
      percentageUsed: (totalCostEur / 50) * 100,
    },
    byFeature,
    byModel: [
      { model: 'v0-homepage-generate', requests: 2, tokens: 0, costEur: 1.50 },
      { model: 'v0-homepage-prompt', requests: 5, tokens: 0, costEur: 1.25 },
      { model: 'gpt-4o-mini', requests: 16, tokens: 11480, costEur: 0.33 },
      { model: 'gpt-4o', requests: 8, tokens: 4200, costEur: 0.15 },
      { model: 'dall-e-3', requests: 2, tokens: 0, costEur: 0.16 },
    ],
    dailyUsage,
    recentActivity,
    isDemo: true,
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const demoMode = await isDemoModeActive()
    
    // Wenn kein User oder Demo-Modus aktiv: Mock-Daten zurückgeben
    if (!session?.user?.id || demoMode) {
      return NextResponse.json(generateDemoUsageData())
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

    // Hole SpendingLimit und Subscription-Status des Users
    const [spendingLimit, user] = await Promise.all([
      prisma.spendingLimit.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          stripeSubscriptionStatus: true,
          stripeSubscriptionId: true,
        },
      }),
    ])

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
      // V0 Homepage Builder
      homepage_generation: { label: 'Homepage erstellen', icon: '🌐' },
      homepage_prompt: { label: 'Homepage ändern', icon: '🌐' },
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

    // Subscription-Status Info
    const validSubscriptionStatuses = ['active', 'trialing', 'past_due']
    const subscriptionStatus = user?.stripeSubscriptionStatus || 'none'
    const hasActiveSubscription = validSubscriptionStatuses.includes(subscriptionStatus)

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
      subscription: {
        status: subscriptionStatus,
        isActive: hasActiveSubscription,
        message: !hasActiveSubscription
          ? subscriptionStatus === 'canceled'
            ? 'Dein Abonnement wurde gekündigt. AI-Features sind deaktiviert.'
            : 'Kein aktives Abonnement. AI-Features sind deaktiviert.'
          : null,
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

