import { prisma } from '@/lib/prisma'
import { UsageLogEntry } from './types'

/**
 * Loggt einen AI-Request in die Datenbank
 */
export async function logAIUsage(entry: UsageLogEntry): Promise<void> {
  try {
    await prisma.aIUsageLog.create({
      data: {
        userId: entry.userId,
        salonId: entry.salonId,
        userType: entry.userType,
        requestType: entry.requestType,
        model: entry.model,
        provider: entry.provider,
        inputTokens: entry.inputTokens,
        outputTokens: entry.outputTokens,
        totalTokens: entry.totalTokens,
        costUsd: entry.costUsd, // Prisma handles Decimal conversion automatically
        responseTimeMs: entry.responseTimeMs,
        success: entry.success,
        errorMessage: entry.errorMessage,
        metadata: entry.metadata as object | undefined,
      },
    })
  } catch (error) {
    // Logging sollte nie den Hauptprozess blockieren
    console.error('Error logging AI usage:', error)
  }
}

interface UsageStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalTokens: number
  totalCostUsd: number
  avgResponseTimeMs: number
}

interface UsageByModel {
  model: string
  requests: number
  tokens: number
  costUsd: number
}

interface UsageByUser {
  userId: string | null
  userType: string
  requests: number
  tokens: number
  costUsd: number
}

/**
 * Holt Nutzungsstatistiken für einen Zeitraum
 */
export async function getUsageStats(
  startDate: Date,
  endDate: Date = new Date()
): Promise<UsageStats> {
  const [stats, avgResponse] = await Promise.all([
    prisma.aIUsageLog.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      _sum: {
        totalTokens: true,
        costUsd: true,
      },
    }),
    prisma.aIUsageLog.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        success: true,
        responseTimeMs: { not: null },
      },
      _avg: {
        responseTimeMs: true,
      },
    }),
  ])
  
  const successCount = await prisma.aIUsageLog.count({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      success: true,
    },
  })
  
  return {
    totalRequests: stats._count,
    successfulRequests: successCount,
    failedRequests: stats._count - successCount,
    totalTokens: stats._sum.totalTokens || 0,
    totalCostUsd: Number(stats._sum.costUsd || 0),
    avgResponseTimeMs: Math.round(avgResponse._avg.responseTimeMs || 0),
  }
}

/**
 * Holt Nutzung gruppiert nach Modell
 */
export async function getUsageByModel(
  startDate: Date,
  endDate: Date = new Date()
): Promise<UsageByModel[]> {
  const results = await prisma.aIUsageLog.groupBy({
    by: ['model'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
    _sum: {
      totalTokens: true,
      costUsd: true,
    },
    orderBy: {
      _sum: {
        costUsd: 'desc',
      },
    },
  })
  
  return results.map((r) => ({
    model: r.model,
    requests: r._count,
    tokens: r._sum.totalTokens || 0,
    costUsd: Number(r._sum.costUsd || 0),
  }))
}

/**
 * Holt Nutzung gruppiert nach User
 */
export async function getUsageByUser(
  startDate: Date,
  endDate: Date = new Date(),
  limit: number = 10
): Promise<UsageByUser[]> {
  const results = await prisma.aIUsageLog.groupBy({
    by: ['userId', 'userType'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
    _sum: {
      totalTokens: true,
      costUsd: true,
    },
    orderBy: {
      _sum: {
        costUsd: 'desc',
      },
    },
    take: limit,
  })
  
  return results.map((r) => ({
    userId: r.userId,
    userType: r.userType,
    requests: r._count,
    tokens: r._sum.totalTokens || 0,
    costUsd: Number(r._sum.costUsd || 0),
  }))
}

/**
 * Holt tägliche Nutzung für Charts
 */
export async function getDailyUsage(
  days: number = 30
): Promise<{ date: string; requests: number; tokens: number; costUsd: number }[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)
  
  const logs = await prisma.aIUsageLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
      totalTokens: true,
      costUsd: true,
    },
  })
  
  // Gruppiere nach Tag
  const dailyMap = new Map<string, { requests: number; tokens: number; costUsd: number }>()
  
  // Initialisiere alle Tage
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dailyMap.set(dateStr, { requests: 0, tokens: 0, costUsd: 0 })
  }
  
  // Fülle mit echten Daten
  for (const log of logs) {
    const dateStr = log.createdAt.toISOString().split('T')[0]
    const existing = dailyMap.get(dateStr) || { requests: 0, tokens: 0, costUsd: 0 }
    dailyMap.set(dateStr, {
      requests: existing.requests + 1,
      tokens: existing.tokens + log.totalTokens,
      costUsd: existing.costUsd + Number(log.costUsd),
    })
  }
  
  // Konvertiere zu Array und sortiere
  return Array.from(dailyMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Holt Nutzung für einen bestimmten Nutzer
 */
export async function getUserUsage(
  userId: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<UsageStats> {
  const [stats, avgResponse] = await Promise.all([
    prisma.aIUsageLog.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      _sum: {
        totalTokens: true,
        costUsd: true,
      },
    }),
    prisma.aIUsageLog.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        success: true,
        responseTimeMs: { not: null },
      },
      _avg: {
        responseTimeMs: true,
      },
    }),
  ])
  
  const successCount = await prisma.aIUsageLog.count({
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
      success: true,
    },
  })
  
  return {
    totalRequests: stats._count,
    successfulRequests: successCount,
    failedRequests: stats._count - successCount,
    totalTokens: stats._sum.totalTokens || 0,
    totalCostUsd: Number(stats._sum.costUsd || 0),
    avgResponseTimeMs: Math.round(avgResponse._avg.responseTimeMs || 0),
  }
}


