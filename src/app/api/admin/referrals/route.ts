import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReferralStatus } from '@prisma/client'

// GET /api/admin/referrals - Referral Analytics für Admin
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') as ReferralStatus | null
    const role = searchParams.get('role') // SALON_OWNER oder STYLIST
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (status) where.status = status
    if (role) where.referrerRole = role
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate)
    }

    // Hole Referrals mit Pagination
    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.referral.count({ where })
    ])

    // Hole User-Infos für Referrer
    const referrerIds = [...new Set(referrals.map(r => r.referrerId))]
    const referrers = await prisma.user.findMany({
      where: { id: { in: referrerIds } },
      select: { id: true, name: true, email: true, role: true }
    })
    const referrersMap = new Map(referrers.map(u => [u.id, u]))

    // Hole User-Infos für Referred (wenn vorhanden)
    const referredIds = referrals.filter(r => r.referredId).map(r => r.referredId as string)
    const referredUsers = await prisma.user.findMany({
      where: { id: { in: referredIds } },
      select: { id: true, name: true, email: true, role: true }
    })
    const referredMap = new Map(referredUsers.map(u => [u.id, u]))

    const referralsWithUsers = referrals.map(r => ({
      ...r,
      referrer: referrersMap.get(r.referrerId) || null,
      referred: r.referredId ? referredMap.get(r.referredId) || null : null
    }))

    // === STATISTIKEN ===

    // Gesamt-Statistiken
    const totalStats = await prisma.referral.aggregate({
      _count: true,
      _sum: {
        totalRevenue: true,
        totalCommission: true
      }
    })

    // Statistiken nach Status
    const statusStats = await prisma.referral.groupBy({
      by: ['status'],
      _count: true
    })

    // Statistiken nach Rolle
    const roleStats = await prisma.referral.groupBy({
      by: ['referrerRole'],
      _count: true,
      _sum: {
        totalRevenue: true,
        totalCommission: true
      }
    })

    // Konversionsrate berechnen
    const pendingCount = statusStats.find(s => s.status === 'PENDING')?._count || 0
    const registeredCount = statusStats.find(s => s.status === 'REGISTERED')?._count || 0
    const convertedCount = statusStats.find(s => s.status === 'CONVERTED')?._count || 0
    const rewardedCount = statusStats.find(s => s.status === 'REWARDED')?._count || 0
    
    const totalSent = totalStats._count || 0
    const totalRegistered = registeredCount + convertedCount + rewardedCount
    const totalConverted = convertedCount + rewardedCount

    const registrationRate = totalSent > 0 ? (totalRegistered / totalSent) * 100 : 0
    const conversionRate = totalRegistered > 0 ? (totalConverted / totalRegistered) * 100 : 0

    // Monatliche Trends (letzte 6 Monate)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyReferrals = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('REGISTERED', 'CONVERTED', 'REWARDED') THEN 1 END) as registered,
        COUNT(CASE WHEN status IN ('CONVERTED', 'REWARDED') THEN 1 END) as converted,
        SUM(total_revenue) as revenue
      FROM referrals
      WHERE created_at >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 6
    ` as Array<{
      month: Date
      total: bigint
      registered: bigint
      converted: bigint
      revenue: number | null
    }>

    // Top Referrer
    const topReferrers = await prisma.userReferralProfile.findMany({
      orderBy: { successfulReferrals: 'desc' },
      take: 10,
      select: {
        userId: true,
        referralCode: true,
        userRole: true,
        totalReferrals: true,
        successfulReferrals: true,
        totalEarnings: true,
        totalReferredRevenue: true,
        totalClicks: true
      }
    })

    // Hole User-Infos für Top Referrer
    const topReferrerUserIds = topReferrers.map(r => r.userId)
    const topReferrerUsers = await prisma.user.findMany({
      where: { id: { in: topReferrerUserIds } },
      select: { id: true, name: true, email: true, role: true, image: true }
    })
    const topReferrerUsersMap = new Map(topReferrerUsers.map(u => [u.id, u]))

    const topReferrersWithUsers = topReferrers.map(r => ({
      ...r,
      user: topReferrerUsersMap.get(r.userId) || null
    }))

    return NextResponse.json({
      referrals: referralsWithUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total: totalStats._count || 0,
        pending: pendingCount,
        registered: registeredCount,
        converted: convertedCount,
        rewarded: rewardedCount,
        expired: statusStats.find(s => s.status === 'EXPIRED')?._count || 0,
        totalRevenue: Number(totalStats._sum?.totalRevenue || 0),
        totalCommission: Number(totalStats._sum?.totalCommission || 0),
        registrationRate: Math.round(registrationRate * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10
      },
      roleStats: {
        salonOwner: {
          count: roleStats.find(r => r.referrerRole === 'SALON_OWNER')?._count || 0,
          revenue: Number(roleStats.find(r => r.referrerRole === 'SALON_OWNER')?._sum?.totalRevenue || 0)
        },
        stylist: {
          count: roleStats.find(r => r.referrerRole === 'STYLIST')?._count || 0,
          revenue: Number(roleStats.find(r => r.referrerRole === 'STYLIST')?._sum?.totalRevenue || 0)
        }
      },
      monthlyTrends: monthlyReferrals.map(m => ({
        month: m.month,
        total: Number(m.total),
        registered: Number(m.registered),
        converted: Number(m.converted),
        revenue: Number(m.revenue || 0)
      })),
      topReferrers: topReferrersWithUsers
    })
  } catch (error) {
    console.error('Error fetching referral analytics:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Referral-Daten' },
      { status: 500 }
    )
  }
}

// POST /api/admin/referrals - Manuelle Referral-Aktionen (z.B. Belohnung markieren)
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { action, referralId, rewardId } = body

    switch (action) {
      case 'mark_rewarded':
        if (!referralId) {
          return NextResponse.json({ error: 'Referral-ID erforderlich' }, { status: 400 })
        }

        const referral = await prisma.referral.update({
          where: { id: referralId },
          data: {
            status: 'REWARDED',
            rewardedAt: new Date(),
            rewardApplied: true
          }
        })

        // Update alle zugehörigen Rewards
        await prisma.referralReward.updateMany({
          where: { referralId },
          data: {
            isApplied: true,
            appliedAt: new Date()
          }
        })

        // Update Referral-Profil
        await prisma.userReferralProfile.updateMany({
          where: { userId: referral.referrerId },
          data: {
            pendingRewards: { decrement: 1 },
            totalEarnings: { increment: Number(referral.rewardValue || 0) }
          }
        })

        return NextResponse.json({ success: true, referral })

      case 'apply_reward':
        if (!rewardId) {
          return NextResponse.json({ error: 'Reward-ID erforderlich' }, { status: 400 })
        }

        const reward = await prisma.referralReward.update({
          where: { id: rewardId },
          data: {
            isApplied: true,
            appliedAt: new Date()
          }
        })

        return NextResponse.json({ success: true, reward })

      case 'cancel':
        if (!referralId) {
          return NextResponse.json({ error: 'Referral-ID erforderlich' }, { status: 400 })
        }

        const canceledReferral = await prisma.referral.update({
          where: { id: referralId },
          data: { status: 'CANCELLED' }
        })

        return NextResponse.json({ success: true, referral: canceledReferral })

      default:
        return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing referral action:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Verarbeitung' },
      { status: 500 }
    )
  }
}

