import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/social/analytics - Social Media Analytics abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // Tage
    const platform = searchParams.get('platform')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))
    
    // Posts-Statistiken
    const postStats = await prisma.socialMediaPost.groupBy({
      by: ['status'],
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
        ...(platform ? { platforms: { has: platform } } : {}),
      },
      _count: true,
    })
    
    // Performance-Metriken (nur veröffentlichte Posts)
    const performanceData = await prisma.socialMediaPost.aggregate({
      where: {
        userId: session.user.id,
        status: 'PUBLISHED',
        publishedAt: { gte: startDate },
        ...(platform ? { platforms: { has: platform } } : {}),
      },
      _sum: {
        totalLikes: true,
        totalComments: true,
        totalShares: true,
        totalImpressions: true,
        totalReach: true,
      },
      _avg: {
        engagementRate: true,
      },
      _count: true,
    })
    
    // Top-performing Posts
    const topPosts = await prisma.socialMediaPost.findMany({
      where: {
        userId: session.user.id,
        status: 'PUBLISHED',
        publishedAt: { gte: startDate },
        ...(platform ? { platforms: { has: platform } } : {}),
      },
      orderBy: [
        { totalLikes: 'desc' },
      ],
      take: 5,
      select: {
        id: true,
        content: true,
        platforms: true,
        publishedAt: true,
        totalLikes: true,
        totalComments: true,
        totalShares: true,
        totalImpressions: true,
        engagementRate: true,
      },
    })
    
    // Posts pro Plattform
    const postsByPlatform = await prisma.socialMediaPostAccount.groupBy({
      by: ['status'],
      where: {
        post: {
          userId: session.user.id,
          createdAt: { gte: startDate },
        },
        account: platform ? { platform: platform as 'INSTAGRAM' | 'FACEBOOK' | 'LINKEDIN' | 'TIKTOK' | 'PINTEREST' | 'TWITTER' | 'YOUTUBE' | 'THREADS' } : undefined,
      },
      _count: true,
      _sum: {
        likes: true,
        comments: true,
        shares: true,
        impressions: true,
      },
    })
    
    // Account-Übersicht
    const accounts = await prisma.socialMediaAccount.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        platform: true,
        accountName: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        metricsUpdatedAt: true,
        _count: {
          select: {
            postAccounts: {
              where: {
                status: 'PUBLISHED',
                publishedAt: { gte: startDate },
              },
            },
          },
        },
      },
    })
    
    // Zeitliche Verteilung (Posts pro Tag)
    const postsPerDay = await prisma.socialMediaPost.groupBy({
      by: ['createdAt'],
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    })
    
    return NextResponse.json({
      period: parseInt(period),
      postStats: {
        total: postStats.reduce((acc, s) => acc + s._count, 0),
        byStatus: postStats.reduce((acc, s) => {
          acc[s.status] = s._count
          return acc
        }, {} as Record<string, number>),
      },
      performance: {
        totalPosts: performanceData._count,
        totalLikes: performanceData._sum.totalLikes || 0,
        totalComments: performanceData._sum.totalComments || 0,
        totalShares: performanceData._sum.totalShares || 0,
        totalImpressions: performanceData._sum.totalImpressions || 0,
        totalReach: performanceData._sum.totalReach || 0,
        avgEngagementRate: performanceData._avg.engagementRate || 0,
      },
      topPosts,
      postsByPlatform,
      accounts: accounts.map(a => ({
        ...a,
        postsInPeriod: a._count.postAccounts,
      })),
      timeline: postsPerDay,
    })
  } catch (error) {
    console.error('[Social Analytics GET] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Analytics' },
      { status: 500 }
    )
  }
}

