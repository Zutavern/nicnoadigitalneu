import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, isStripeConfigured } from '@/lib/stripe-server'
import { isDemoModeActive, getMockEnhancedRevenue } from '@/lib/mock-data'

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
    const period = searchParams.get('period') || '30d'

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        ...getMockEnhancedRevenue(),
        source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // If Stripe is configured, fetch real data
    if (isStripeConfigured() && stripe) {
      return await getStripeEnhancedRevenue(startDate, now, period)
    }

    // Fallback: Local data
    return await getLocalEnhancedRevenue(startDate, now, period)
  } catch (error) {
    console.error('Error fetching enhanced revenue:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Revenue-Analytics' },
      { status: 500 }
    )
  }
}

async function getStripeEnhancedRevenue(startDate: Date, endDate: Date, period: string) {
  const startTimestamp = Math.floor(startDate.getTime() / 1000)
  const endTimestamp = Math.floor(endDate.getTime() / 1000)

  // Fetch multiple Stripe resources in parallel
  const [
    balanceTransactions,
    subscriptions,
    charges,
    balance,
    invoices,
  ] = await Promise.all([
    stripe!.balanceTransactions.list({
      created: { gte: startTimestamp, lte: endTimestamp },
      limit: 100,
      type: 'charge'
    }),
    stripe!.subscriptions.list({ status: 'all', limit: 100 }),
    stripe!.charges.list({
      created: { gte: startTimestamp, lte: endTimestamp },
      limit: 100
    }),
    stripe!.balance.retrieve(),
    stripe!.invoices.list({
      created: { gte: startTimestamp, lte: endTimestamp },
      limit: 100
    }),
  ])

  // Calculate overview metrics
  const totalRevenue = balanceTransactions.data.reduce((sum, t) => sum + t.amount, 0) / 100
  const totalFees = balanceTransactions.data.reduce((sum, t) => sum + (t.fee || 0), 0) / 100
  const netRevenue = totalRevenue - totalFees

  // Calculate MRR from active subscriptions
  const activeSubscriptions = subscriptions.data.filter(s => s.status === 'active')
  const trialingSubscriptions = subscriptions.data.filter(s => s.status === 'trialing')
  
  const mrr = activeSubscriptions.reduce((sum, sub) => {
    const item = sub.items.data[0]
    if (!item?.price?.unit_amount) return sum
    const amount = item.price.unit_amount / 100
    if (item.price.recurring?.interval === 'year') return sum + amount / 12
    if (item.price.recurring?.interval === 'month' && item.price.recurring?.interval_count === 6) return sum + amount / 6
    if (item.price.recurring?.interval === 'month' && item.price.recurring?.interval_count === 3) return sum + amount / 3
    return sum + amount
  }, 0)

  // Revenue by day
  const revenueByDay = new Map<string, { revenue: number; count: number }>()
  for (const t of balanceTransactions.data) {
    const date = new Date(t.created * 1000).toISOString().split('T')[0]
    const existing = revenueByDay.get(date) || { revenue: 0, count: 0 }
    revenueByDay.set(date, {
      revenue: existing.revenue + t.amount / 100,
      count: existing.count + 1
    })
  }

  const dailyTrend = Array.from(revenueByDay.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Subscription metrics by plan
  const planMetrics = new Map<string, {
    planId: string
    planName: string
    count: number
    mrr: number
    trialing: number
  }>()

  for (const sub of subscriptions.data) {
    const item = sub.items.data[0]
    if (!item?.price) continue
    
    const product = typeof item.price.product === 'object' 
      ? (item.price.product as { id?: string; name?: string })
      : { id: String(item.price.product), name: 'Unknown' }
    
    const planId = product.id || 'unknown'
    const planName = product.name || 'Unknown'
    const amount = (item.price.unit_amount || 0) / 100
    
    const existing = planMetrics.get(planId) || {
      planId,
      planName,
      count: 0,
      mrr: 0,
      trialing: 0
    }
    
    existing.count++
    if (sub.status === 'active') {
      existing.mrr += amount
    }
    if (sub.status === 'trialing') {
      existing.trialing++
    }
    
    planMetrics.set(planId, existing)
  }

  const revenueByPlan = Array.from(planMetrics.values())
    .map(p => ({
      ...p,
      percentage: mrr > 0 ? Math.round(p.mrr / mrr * 100) : 0
    }))
    .sort((a, b) => b.mrr - a.mrr)

  // Recent transactions
  const recentTransactions = charges.data.slice(0, 10).map(charge => ({
    id: charge.id,
    stripeId: charge.id,
    customerName: charge.billing_details?.name || 'Unbekannt',
    email: charge.billing_details?.email || 'Unbekannt',
    amount: charge.amount / 100,
    fee: 0, // Would need to lookup
    net: charge.amount / 100,
    plan: charge.description || 'Zahlung',
    type: 'subscription' as const,
    status: charge.status,
    date: new Date(charge.created * 1000)
  }))

  // Stripe balance
  const stripeBalance = {
    available: balance.available.reduce((sum, b) => sum + b.amount, 0) / 100,
    pending: balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100,
    total: 0
  }
  stripeBalance.total = stripeBalance.available + stripeBalance.pending

  // Trial metrics
  const trialMetrics = {
    activeTrials: trialingSubscriptions.length,
    trialsStartedThisMonth: 0,
    trialsConvertedThisMonth: 0,
    trialConversionRate: 0,
    avgTrialDuration: 14,
    trialsByPlan: [] as Array<{ plan: string; active: number; converted: number; rate: number }>
  }

  // Get AI revenue from local database
  const aiUsageLogs = await prisma.aIUsageLog.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate }
    },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  })

  const aiRevenue = {
    totalRevenueEur: aiUsageLogs.reduce((sum, log) => sum + Number(log.priceEur || 0), 0),
    totalCostEur: aiUsageLogs.reduce((sum, log) => sum + Number(log.costEur || 0), 0),
    profitEur: 0,
    marginPercent: 0,
    totalRequests: aiUsageLogs.length,
    uniqueUsers: new Set(aiUsageLogs.map(l => l.userId)).size,
    avgRevenuePerUser: 0,
    includedCreditsUsed: 0,
    overage: 0,
    dailyTrend: [] as Array<{ date: string; revenue: number; cost: number; requests: number }>,
    byFeature: [] as Array<{ feature: string; label: string; revenue: number; cost: number; requests: number; avgCost: number }>,
    topConsumers: [] as Array<{ userId: string; name: string; email: string; spent: number; requests: number; plan: string }>
  }

  aiRevenue.profitEur = aiRevenue.totalRevenueEur - aiRevenue.totalCostEur
  aiRevenue.marginPercent = aiRevenue.totalCostEur > 0 
    ? Math.round(aiRevenue.profitEur / aiRevenue.totalCostEur * 100) 
    : 0
  aiRevenue.avgRevenuePerUser = aiRevenue.uniqueUsers > 0 
    ? Math.round(aiRevenue.totalRevenueEur / aiRevenue.uniqueUsers * 100) / 100 
    : 0

  // Group AI usage by feature
  const featureGroups = new Map<string, { revenue: number; cost: number; requests: number }>()
  for (const log of aiUsageLogs) {
    const feature = log.feature || 'other'
    const existing = featureGroups.get(feature) || { revenue: 0, cost: 0, requests: 0 }
    featureGroups.set(feature, {
      revenue: existing.revenue + Number(log.priceEur || 0),
      cost: existing.cost + Number(log.costEur || 0),
      requests: existing.requests + 1
    })
  }

  const featureLabels: Record<string, string> = {
    social_post: 'Social Media',
    image_gen: 'Bildgenerierung',
    video_gen: 'Videos',
    translation: 'Übersetzungen',
    chat: 'Chat/Beratung',
    hashtags: 'Hashtags',
    content_improvement: 'Content',
    other: 'Sonstiges'
  }

  aiRevenue.byFeature = Array.from(featureGroups.entries()).map(([feature, data]) => ({
    feature,
    label: featureLabels[feature] || feature,
    revenue: Math.round(data.revenue * 100) / 100,
    cost: Math.round(data.cost * 100) / 100,
    requests: data.requests,
    avgCost: data.requests > 0 ? Math.round(data.cost / data.requests * 1000) / 1000 : 0
  }))

  // Top AI consumers
  const userSpending = new Map<string, { name: string; email: string; spent: number; requests: number }>()
  for (const log of aiUsageLogs) {
    const existing = userSpending.get(log.userId) || { 
      name: log.user.name || 'Unbekannt', 
      email: log.user.email,
      spent: 0, 
      requests: 0 
    }
    userSpending.set(log.userId, {
      ...existing,
      spent: existing.spent + Number(log.priceEur || 0),
      requests: existing.requests + 1
    })
  }

  aiRevenue.topConsumers = Array.from(userSpending.entries())
    .map(([userId, data]) => ({ userId, ...data, plan: '' }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)

  // Credit package sales from local database
  const creditPackageSales = {
    totalSales: 0,
    totalPackages: 0,
    avgPackageValue: 0,
    packages: [] as Array<{ name: string; price: number; sold: number; revenue: number }>,
    monthlySales: [] as Array<{ month: string; count: number; revenue: number }>
  }

  // Get credit transactions
  const creditTransactions = await prisma.creditTransaction.findMany({
    where: {
      type: 'PURCHASE',
      createdAt: { gte: startDate, lte: endDate }
    }
  })

  creditPackageSales.totalSales = creditTransactions.reduce((sum, t) => sum + Number(t.amountEur || 0), 0)
  creditPackageSales.totalPackages = creditTransactions.length
  creditPackageSales.avgPackageValue = creditPackageSales.totalPackages > 0 
    ? creditPackageSales.totalSales / creditPackageSales.totalPackages 
    : 0

  // Coupon analytics
  const couponRedemptions = await prisma.couponRedemption.findMany({
    where: { redeemedAt: { gte: startDate, lte: endDate } },
    include: { coupon: true }
  })

  const couponAnalytics = {
    totalRedemptions: couponRedemptions.length,
    totalDiscount: couponRedemptions.reduce((sum, r) => sum + Number(r.discountApplied || 0), 0),
    avgDiscountPerUse: 0,
    activeCoupons: 0,
    topCoupons: [] as Array<{ code: string; redemptions: number; discount: number; type: string; value: number }>,
    monthlyRedemptions: [] as Array<{ month: string; count: number; discount: number }>
  }

  couponAnalytics.avgDiscountPerUse = couponAnalytics.totalRedemptions > 0 
    ? couponAnalytics.totalDiscount / couponAnalytics.totalRedemptions 
    : 0

  // Active coupons count
  couponAnalytics.activeCoupons = await prisma.coupon.count({
    where: { 
      isActive: true,
      OR: [
        { validUntil: null },
        { validUntil: { gte: new Date() } }
      ]
    }
  })

  // Referral revenue
  const referrals = await prisma.referral.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    include: { referrer: true }
  })

  const referralRevenue = {
    totalReferrals: referrals.length,
    successfulConversions: referrals.filter(r => r.status === 'COMPLETED').length,
    conversionRate: 0,
    revenueFromReferrals: 0,
    rewardsGiven: 0,
    netReferralRevenue: 0,
    avgReferralValue: 0,
    topReferrers: [] as Array<{ name: string; email: string; referrals: number; conversions: number; revenue: number }>
  }

  referralRevenue.conversionRate = referralRevenue.totalReferrals > 0 
    ? Math.round(referralRevenue.successfulConversions / referralRevenue.totalReferrals * 1000) / 10 
    : 0

  // Churn metrics
  const cancelledSubs = subscriptions.data.filter(s => 
    s.canceled_at && s.canceled_at * 1000 >= startDate.getTime()
  )

  const churnMetrics = {
    currentChurnRate: activeSubscriptions.length > 0 
      ? Math.round(cancelledSubs.length / activeSubscriptions.length * 1000) / 10 
      : 0,
    lastMonthChurnRate: 0,
    churnedThisMonth: cancelledSubs.length,
    churnedMrr: cancelledSubs.reduce((sum, s) => {
      const item = s.items.data[0]
      return sum + ((item?.price?.unit_amount || 0) / 100)
    }, 0),
    churnReasons: [] as Array<{ reason: string; count: number }>,
    atRiskSubscriptions: 0
  }

  return NextResponse.json({
    overview: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyRevenue: Math.round(totalRevenue * 100) / 100,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(mrr * 12 * 100) / 100,
      activeSubscriptions: activeSubscriptions.length,
      trialingSubscriptions: trialingSubscriptions.length,
      churnRate: churnMetrics.currentChurnRate,
      ltv: 0,
      arpu: activeSubscriptions.length > 0 ? Math.round(mrr / activeSubscriptions.length * 100) / 100 : 0,
      netRevenue: Math.round(netRevenue * 100) / 100,
      stripeFees: Math.round(totalFees * 100) / 100,
    },
    revenueByPlan,
    revenueByInterval: [],
    monthlyTrend: dailyTrend.slice(-30),
    trialMetrics,
    aiRevenue,
    creditPackageSales,
    couponAnalytics,
    referralRevenue,
    stripeMetrics: {
      balance: stripeBalance,
      fees: {
        thisMonth: Math.round(totalFees * 100) / 100,
        lastMonth: 0,
        avgPerTransaction: charges.data.length > 0 ? Math.round(totalFees / charges.data.length * 100) / 100 : 0,
        feeRate: 2.9
      },
      disputes: { open: 0, won: 0, lost: 0, totalAmountDisputed: 0, disputeRate: 0 },
      paymentMethods: []
    },
    churnMetrics,
    recentTransactions,
    period,
    source: 'stripe'
  })
}

async function getLocalEnhancedRevenue(startDate: Date, endDate: Date, period: string) {
  // Get payments
  const payments = await prisma.payment.findMany({
    where: {
      status: 'PAID',
      paidAt: { gte: startDate, lte: endDate }
    },
    orderBy: { paidAt: 'desc' }
  })

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  // Get active subscribers
  const activeSubscribers = await prisma.user.count({
    where: { stripeSubscriptionStatus: 'active' }
  })

  const trialingSubscribers = await prisma.user.count({
    where: { stripeSubscriptionStatus: 'trialing' }
  })

  // Get subscription plans
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true }
  })

  // Count subscribers per plan
  const planCounts = await prisma.user.groupBy({
    by: ['stripePriceId'],
    where: { stripeSubscriptionStatus: 'active' },
    _count: true
  })

  const revenueByPlan = plans.map(plan => {
    const count = planCounts.find(pc => 
      pc.stripePriceId === plan.stripePriceMonthly || 
      pc.stripePriceId === plan.stripePriceQuarterly ||
      pc.stripePriceId === plan.stripePriceSixMonths ||
      pc.stripePriceId === plan.stripePriceYearly
    )?._count || 0

    return {
      planId: plan.id,
      planName: plan.name,
      planType: plan.planType,
      count,
      mrr: count * Number(plan.priceMonthly),
      percentage: 0,
      color: plan.planType === 'STYLIST' ? 'bg-violet-500' : 'bg-emerald-500'
    }
  })

  const totalMrr = revenueByPlan.reduce((sum, p) => sum + p.mrr, 0)
  revenueByPlan.forEach(p => {
    p.percentage = totalMrr > 0 ? Math.round(p.mrr / totalMrr * 100) : 0
  })

  // AI Usage
  const aiUsageLogs = await prisma.aIUsageLog.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    include: { user: { select: { id: true, name: true, email: true } } }
  })

  const aiRevenue = {
    totalRevenueEur: aiUsageLogs.reduce((sum, l) => sum + Number(l.priceEur || 0), 0),
    totalCostEur: aiUsageLogs.reduce((sum, l) => sum + Number(l.costEur || 0), 0),
    profitEur: 0,
    marginPercent: 0,
    totalRequests: aiUsageLogs.length,
    uniqueUsers: new Set(aiUsageLogs.map(l => l.userId)).size,
    avgRevenuePerUser: 0,
    includedCreditsUsed: 0,
    overage: 0,
    dailyTrend: [],
    byFeature: [],
    topConsumers: []
  }

  aiRevenue.profitEur = aiRevenue.totalRevenueEur - aiRevenue.totalCostEur
  aiRevenue.marginPercent = aiRevenue.totalCostEur > 0 
    ? Math.round(aiRevenue.profitEur / aiRevenue.totalCostEur * 100) 
    : 0

  // Recent transactions
  const recentPayments = await prisma.payment.findMany({
    where: { status: 'PAID' },
    orderBy: { paidAt: 'desc' },
    take: 10
  })

  const payerIds = [...new Set(recentPayments.map(p => p.payerId))]
  const payers = await prisma.user.findMany({
    where: { id: { in: payerIds } },
    select: { id: true, email: true, name: true }
  })
  const payersMap = new Map(payers.map(p => [p.id, p]))

  const recentTransactions = recentPayments.map(p => ({
    id: p.id,
    stripeId: p.stripePaymentIntentId || '',
    customerName: payersMap.get(p.payerId)?.name || 'Unbekannt',
    email: payersMap.get(p.payerId)?.email || 'Unbekannt',
    amount: Number(p.amount),
    fee: Number(p.amount) * 0.029,
    net: Number(p.amount) * 0.971,
    plan: p.description || p.type,
    type: 'subscription' as const,
    status: p.status.toLowerCase(),
    date: p.paidAt || p.createdAt
  }))

  return NextResponse.json({
    overview: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyRevenue: Math.round(totalRevenue * 100) / 100,
      mrr: Math.round(totalMrr * 100) / 100,
      arr: Math.round(totalMrr * 12 * 100) / 100,
      activeSubscriptions: activeSubscribers,
      trialingSubscriptions: trialingSubscribers,
      churnRate: 0,
      ltv: 0,
      arpu: activeSubscribers > 0 ? Math.round(totalMrr / activeSubscribers * 100) / 100 : 0,
      netRevenue: Math.round(totalRevenue * 0.97 * 100) / 100,
      stripeFees: Math.round(totalRevenue * 0.03 * 100) / 100,
    },
    revenueByPlan,
    revenueByInterval: [],
    monthlyTrend: [],
    trialMetrics: {
      activeTrials: trialingSubscribers,
      trialsStartedThisMonth: 0,
      trialsConvertedThisMonth: 0,
      trialConversionRate: 0,
      avgTrialDuration: 14,
      trialsByPlan: []
    },
    aiRevenue,
    creditPackageSales: { totalSales: 0, totalPackages: 0, avgPackageValue: 0, packages: [], monthlySales: [] },
    couponAnalytics: { totalRedemptions: 0, totalDiscount: 0, avgDiscountPerUse: 0, activeCoupons: 0, topCoupons: [], monthlyRedemptions: [] },
    referralRevenue: { totalReferrals: 0, successfulConversions: 0, conversionRate: 0, revenueFromReferrals: 0, rewardsGiven: 0, netReferralRevenue: 0, avgReferralValue: 0, topReferrers: [] },
    stripeMetrics: {
      balance: { available: 0, pending: 0, total: 0 },
      fees: { thisMonth: 0, lastMonth: 0, avgPerTransaction: 0, feeRate: 2.9 },
      disputes: { open: 0, won: 0, lost: 0, totalAmountDisputed: 0, disputeRate: 0 },
      paymentMethods: []
    },
    churnMetrics: { currentChurnRate: 0, lastMonthChurnRate: 0, churnedThisMonth: 0, churnedMrr: 0, churnReasons: [], atRiskSubscriptions: 0 },
    recentTransactions,
    period,
    source: 'local'
  })
}

