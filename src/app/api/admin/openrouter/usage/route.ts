import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getUsageStats,
  getUsageByModel,
  getUsageByUser,
  getDailyUsage,
} from '@/lib/openrouter/usage-tracker'

// GET: Nutzungsstatistiken abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // 'day', 'week', 'month', 'year'
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : undefined

    // Zeitraum berechnen
    const now = new Date()
    let startDate: Date

    if (days) {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    } else {
      switch (period) {
        case 'day':
          startDate = new Date(now)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'year':
          startDate = new Date(now)
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
        case 'month':
        default:
          startDate = new Date(now)
          startDate.setMonth(startDate.getMonth() - 1)
      }
    }

    // Alle Stats parallel abrufen
    const [stats, byModel, byUser, daily] = await Promise.all([
      getUsageStats(startDate, now),
      getUsageByModel(startDate, now),
      getUsageByUser(startDate, now, 10),
      getDailyUsage(days || (period === 'year' ? 365 : period === 'week' ? 7 : 30)),
    ])

    // Heute und diesen Monat separat
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const [todayStats, monthStats] = await Promise.all([
      getUsageStats(todayStart, now),
      getUsageStats(monthStart, now),
    ])

    return NextResponse.json({
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      overview: stats,
      today: todayStats,
      thisMonth: monthStats,
      byModel,
      byUser,
      daily,
    })
  } catch (error) {
    console.error('Error fetching OpenRouter usage:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Nutzungsstatistiken' },
      { status: 500 }
    )
  }
}


