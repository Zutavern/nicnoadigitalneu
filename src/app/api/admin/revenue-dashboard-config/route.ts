import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default configuration for new installs
const defaultConfig = {
  showOverviewStats: true,
  showRevenueChart: true,
  showRevenueByPlan: true,
  showTransactions: true,
  showPaymentMethods: true,
  showChurnMetrics: true,
  showSubscriptionMetrics: true,
  showAiRevenuePanel: true,
  showAiUsageBreakdown: true,
  showAiTopConsumers: true,
  showIncludedCreditsUsage: true,
  showPlanPerformance: true,
  showIntervalBreakdown: true,
  showTrialConversions: true,
  showCouponRedemptions: true,
  showCouponRevenueLoss: true,
  showReferralRevenue: true,
  showStripeBalance: true,
  showStripeFees: true,
  showStripeDisputes: false,
  panelOrder: [],
  defaultPeriod: '30d',
  autoRefreshEnabled: false,
  autoRefreshSeconds: 60,
}

// GET - Fetch dashboard configuration
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    let config = await prisma.revenueDashboardConfig.findUnique({
      where: { id: 'default' }
    })

    // Create default config if not exists
    if (!config) {
      config = await prisma.revenueDashboardConfig.create({
        data: {
          id: 'default',
          ...defaultConfig,
        }
      })
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error fetching revenue dashboard config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Update dashboard configuration
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      showOverviewStats,
      showRevenueChart,
      showRevenueByPlan,
      showTransactions,
      showPaymentMethods,
      showChurnMetrics,
      showSubscriptionMetrics,
      showAiRevenuePanel,
      showAiUsageBreakdown,
      showAiTopConsumers,
      showIncludedCreditsUsage,
      showPlanPerformance,
      showIntervalBreakdown,
      showTrialConversions,
      showCreditPackageSales,
      showCouponRedemptions,
      showCouponRevenueLoss,
      showReferralRevenue,
      showStripeBalance,
      showStripeFees,
      showStripeDisputes,
      panelOrder,
      defaultPeriod,
      autoRefreshEnabled,
      autoRefreshSeconds,
    } = body

    const config = await prisma.revenueDashboardConfig.upsert({
      where: { id: 'default' },
      update: {
        ...(showOverviewStats !== undefined && { showOverviewStats }),
        ...(showRevenueChart !== undefined && { showRevenueChart }),
        ...(showRevenueByPlan !== undefined && { showRevenueByPlan }),
        ...(showTransactions !== undefined && { showTransactions }),
        ...(showPaymentMethods !== undefined && { showPaymentMethods }),
        ...(showChurnMetrics !== undefined && { showChurnMetrics }),
        ...(showSubscriptionMetrics !== undefined && { showSubscriptionMetrics }),
        ...(showAiRevenuePanel !== undefined && { showAiRevenuePanel }),
        ...(showAiUsageBreakdown !== undefined && { showAiUsageBreakdown }),
        ...(showAiTopConsumers !== undefined && { showAiTopConsumers }),
        ...(showIncludedCreditsUsage !== undefined && { showIncludedCreditsUsage }),
        ...(showPlanPerformance !== undefined && { showPlanPerformance }),
        ...(showIntervalBreakdown !== undefined && { showIntervalBreakdown }),
        ...(showTrialConversions !== undefined && { showTrialConversions }),
        ...(showCreditPackageSales !== undefined && { showCreditPackageSales }),
        ...(showCouponRedemptions !== undefined && { showCouponRedemptions }),
        ...(showCouponRevenueLoss !== undefined && { showCouponRevenueLoss }),
        ...(showReferralRevenue !== undefined && { showReferralRevenue }),
        ...(showStripeBalance !== undefined && { showStripeBalance }),
        ...(showStripeFees !== undefined && { showStripeFees }),
        ...(showStripeDisputes !== undefined && { showStripeDisputes }),
        ...(panelOrder !== undefined && { panelOrder }),
        ...(defaultPeriod !== undefined && { defaultPeriod }),
        ...(autoRefreshEnabled !== undefined && { autoRefreshEnabled }),
        ...(autoRefreshSeconds !== undefined && { autoRefreshSeconds }),
      },
      create: {
        id: 'default',
        ...defaultConfig,
        ...(showOverviewStats !== undefined && { showOverviewStats }),
        ...(showRevenueChart !== undefined && { showRevenueChart }),
        ...(showRevenueByPlan !== undefined && { showRevenueByPlan }),
        ...(showTransactions !== undefined && { showTransactions }),
        ...(showPaymentMethods !== undefined && { showPaymentMethods }),
        ...(showChurnMetrics !== undefined && { showChurnMetrics }),
        ...(showSubscriptionMetrics !== undefined && { showSubscriptionMetrics }),
        ...(showAiRevenuePanel !== undefined && { showAiRevenuePanel }),
        ...(showAiUsageBreakdown !== undefined && { showAiUsageBreakdown }),
        ...(showAiTopConsumers !== undefined && { showAiTopConsumers }),
        ...(showIncludedCreditsUsage !== undefined && { showIncludedCreditsUsage }),
        ...(showPlanPerformance !== undefined && { showPlanPerformance }),
        ...(showIntervalBreakdown !== undefined && { showIntervalBreakdown }),
        ...(showTrialConversions !== undefined && { showTrialConversions }),
        ...(showCreditPackageSales !== undefined && { showCreditPackageSales }),
        ...(showCouponRedemptions !== undefined && { showCouponRedemptions }),
        ...(showCouponRevenueLoss !== undefined && { showCouponRevenueLoss }),
        ...(showReferralRevenue !== undefined && { showReferralRevenue }),
        ...(showStripeBalance !== undefined && { showStripeBalance }),
        ...(showStripeFees !== undefined && { showStripeFees }),
        ...(showStripeDisputes !== undefined && { showStripeDisputes }),
        ...(panelOrder !== undefined && { panelOrder }),
        ...(defaultPeriod !== undefined && { defaultPeriod }),
        ...(autoRefreshEnabled !== undefined && { autoRefreshEnabled }),
        ...(autoRefreshSeconds !== undefined && { autoRefreshSeconds }),
      }
    })

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error updating revenue dashboard config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Konfiguration' },
      { status: 500 }
    )
  }
}

