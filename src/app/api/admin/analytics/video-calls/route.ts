import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/analytics/video-calls
 * Get video call analytics data
 */
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all video call events
    const events = await prisma.analyticsEvent.findMany({
      where: {
        eventType: {
          startsWith: 'video_call_',
        },
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Calculate statistics
    const stats = {
      totalCalls: 0,
      completedCalls: 0,
      missedCalls: 0,
      rejectedCalls: 0,
      totalDuration: 0, // in seconds
      averageDuration: 0,
    }

    // Group by day for chart
    const dailyData: Record<string, {
      date: string
      initiated: number
      completed: number
      missed: number
      rejected: number
      totalDuration: number
    }> = {}

    // Initialize days
    for (let i = 0; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      const dateStr = date.toISOString().split('T')[0]
      dailyData[dateStr] = {
        date: dateStr,
        initiated: 0,
        completed: 0,
        missed: 0,
        rejected: 0,
        totalDuration: 0,
      }
    }

    // Process events
    for (const event of events) {
      const dateStr = event.createdAt.toISOString().split('T')[0]
      const metadata = event.metadata as Record<string, unknown> | null

      if (!dailyData[dateStr]) continue

      switch (event.eventType) {
        case 'video_call_call_initiated':
          stats.totalCalls++
          dailyData[dateStr].initiated++
          break
        case 'video_call_call_ended':
          stats.completedCalls++
          dailyData[dateStr].completed++
          if (metadata?.duration && typeof metadata.duration === 'number') {
            stats.totalDuration += metadata.duration
            dailyData[dateStr].totalDuration += metadata.duration
          }
          break
        case 'video_call_call_missed':
          stats.missedCalls++
          dailyData[dateStr].missed++
          break
        case 'video_call_call_rejected':
          stats.rejectedCalls++
          dailyData[dateStr].rejected++
          break
      }
    }

    // Calculate average duration
    if (stats.completedCalls > 0) {
      stats.averageDuration = Math.round(stats.totalDuration / stats.completedCalls)
    }

    // Convert daily data to array
    const chartData = Object.values(dailyData).sort((a, b) => 
      a.date.localeCompare(b.date)
    )

    // Success rate
    const successRate = stats.totalCalls > 0 
      ? Math.round((stats.completedCalls / stats.totalCalls) * 100)
      : 0

    return NextResponse.json({
      stats: {
        ...stats,
        successRate,
        averageDurationFormatted: formatDuration(stats.averageDuration),
        totalDurationFormatted: formatDuration(stats.totalDuration),
      },
      chartData,
    })
  } catch (error) {
    console.error('Error fetching video call analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}
