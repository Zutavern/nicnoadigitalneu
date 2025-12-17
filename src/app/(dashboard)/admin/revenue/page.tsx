'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Calendar,
  Zap,
  Target,
  Users,
  Bot,
  Percent,
  Gift,
  Tag,
  Settings,
  Eye,
  EyeOff,
  Activity,
  PieChart,
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Types
interface DashboardConfig {
  showOverviewStats: boolean
  showRevenueChart: boolean
  showRevenueByPlan: boolean
  showTransactions: boolean
  showPaymentMethods: boolean
  showChurnMetrics: boolean
  showSubscriptionMetrics: boolean
  showAiRevenuePanel: boolean
  showAiUsageBreakdown: boolean
  showAiTopConsumers: boolean
  showIncludedCreditsUsage: boolean
  showPlanPerformance: boolean
  showIntervalBreakdown: boolean
  showTrialConversions: boolean
  showCreditPackageSales: boolean
  showCouponRedemptions: boolean
  showCouponRevenueLoss: boolean
  showReferralRevenue: boolean
  showStripeBalance: boolean
  showStripeFees: boolean
  showStripeDisputes: boolean
  defaultPeriod: string
  autoRefreshEnabled: boolean
  autoRefreshSeconds: number
}

interface RevenueData {
  overview: {
    totalRevenue: number
    monthlyRevenue: number
    mrr: number
    arr: number
    activeSubscriptions: number
    trialingSubscriptions: number
    churnRate: number
    ltv: number
    arpu: number
    netRevenue: number
    stripeFees: number
  }
  revenueByPlan: Array<{
    planId: string
    planName: string
    planType?: string
    count: number
    mrr: number
    arr?: number
    percentage: number
    avgMonthsActive?: number
    churnRate?: number
    trialConversions?: number
    color?: string
  }>
  revenueByInterval: Array<{
    interval: string
    label: string
    count: number
    revenue: number
    percentage: number
  }>
  monthlyTrend: Array<{
    month?: string
    date?: string
    revenue: number
    subscriptions?: number
    newSubs?: number
    churned?: number
    netGrowth?: number
  }>
  trialMetrics: {
    activeTrials: number
    trialsStartedThisMonth: number
    trialsConvertedThisMonth: number
    trialConversionRate: number
    avgTrialDuration: number
    trialsByPlan: Array<{ plan: string; active: number; converted: number; rate: number }>
  }
  aiRevenue: {
    totalRevenueEur: number
    totalCostEur: number
    profitEur: number
    marginPercent: number
    totalRequests: number
    uniqueUsers: number
    avgRevenuePerUser: number
    includedCreditsUsed: number
    overage: number
    dailyTrend: Array<{ date: string; revenue: number; cost: number; requests: number }>
    byFeature: Array<{ feature: string; label: string; revenue: number; cost: number; requests: number; avgCost: number }>
    topConsumers: Array<{ userId: string; name: string; email: string; spent: number; requests: number; plan: string }>
  }
  creditPackageSales: {
    totalSales: number
    totalPackages: number
    avgPackageValue: number
    packages: Array<{ name: string; price: number; sold: number; revenue: number }>
    monthlySales: Array<{ month: string; count: number; revenue: number }>
  }
  couponAnalytics: {
    totalRedemptions: number
    totalDiscount: number
    avgDiscountPerUse: number
    activeCoupons: number
    topCoupons: Array<{ code: string; redemptions: number; discount: number; type: string; value: number }>
    monthlyRedemptions: Array<{ month: string; count: number; discount: number }>
  }
  referralRevenue: {
    totalReferrals: number
    successfulConversions: number
    conversionRate: number
    revenueFromReferrals: number
    rewardsGiven: number
    netReferralRevenue: number
    avgReferralValue: number
    topReferrers: Array<{ name: string; email: string; referrals: number; conversions: number; revenue: number }>
  }
  stripeMetrics: {
    balance: { available: number; pending: number; total: number }
    fees: { thisMonth: number; lastMonth: number; avgPerTransaction: number; feeRate: number }
    disputes: { open: number; won: number; lost: number; totalAmountDisputed: number; disputeRate: number }
    paymentMethods: Array<{ method: string; percentage: number; transactions?: number }>
  }
  churnMetrics: {
    currentChurnRate: number
    lastMonthChurnRate: number
    churnedThisMonth: number
    churnedMrr: number
    churnReasons: Array<{ reason: string; count: number }>
    atRiskSubscriptions: number
  }
  recentTransactions: Array<{
    id: string
    stripeId?: string
    customerName: string
    email: string
    amount: number
    fee?: number
    net?: number
    plan: string
    interval?: string | null
    type?: string
    status: string
    date: string | Date
  }>
  source: string
  _message?: string
}

const defaultConfig: DashboardConfig = {
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
  showCreditPackageSales: false, // Deaktiviert - Metered Pricing statt Credit-Paketen
  showCouponRedemptions: true,
  showCouponRevenueLoss: true,
  showReferralRevenue: true,
  showStripeBalance: true,
  showStripeFees: true,
  showStripeDisputes: false,
  defaultPeriod: '30d',
  autoRefreshEnabled: false,
  autoRefreshSeconds: 60,
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [config, setConfig] = useState<DashboardConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [configLoading, setConfigLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [configOpen, setConfigOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    subscriptions: true,
    ai: true,
    sales: false,
    stripe: false,
  })

  // Fetch dashboard config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/revenue-dashboard-config')
      if (res.ok) {
        const json = await res.json()
        if (json.config) {
          setConfig(json.config)
          setTimeRange(json.config.defaultPeriod || '30d')
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setConfigLoading(false)
    }
  }, [])

  // Fetch revenue data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/revenue-analytics?period=${timeRange}`)
      if (!res.ok) throw new Error('Fehler beim Laden')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      toast.error('Fehler beim Laden der Revenue-Daten')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto refresh
  useEffect(() => {
    if (!config.autoRefreshEnabled) return
    const interval = setInterval(fetchData, config.autoRefreshSeconds * 1000)
    return () => clearInterval(interval)
  }, [config.autoRefreshEnabled, config.autoRefreshSeconds, fetchData])

  // Save config
  const saveConfig = async (newConfig: Partial<DashboardConfig>) => {
    const updated = { ...config, ...newConfig }
    setConfig(updated)
    
    try {
      const res = await fetch('/api/admin/revenue-dashboard-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      if (!res.ok) throw new Error()
      toast.success('Konfiguration gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Erfolgreich</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Ausstehend</Badge>
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Fehlgeschlagen</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading || configLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!data) return null

  const maxChartValue = Math.max(...(data.monthlyTrend || []).map(d => d.revenue), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            Revenue Analytics
          </h1>
          <p className="text-muted-foreground">
            Umfassende Finanzübersicht & Stripe-Metriken
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => { setTimeRange(v); saveConfig({ defaultPeriod: v }) }}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              <SelectItem value="30d">Letzte 30 Tage</SelectItem>
              <SelectItem value="90d">Letzte 3 Monate</SelectItem>
              <SelectItem value="1y">Letztes Jahr</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </Button>
          <Dialog open={configOpen} onOpenChange={setConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Konfigurieren
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Dashboard Konfigurieren</DialogTitle>
                <DialogDescription>
                  Wähle aus, welche Panels angezeigt werden sollen
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Overview Section */}
                <div>
                  <h4 className="font-medium mb-3">Übersicht</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <ConfigSwitch
                      label="Kennzahlen"
                      checked={config.showOverviewStats}
                      onChange={(v) => saveConfig({ showOverviewStats: v })}
                    />
                    <ConfigSwitch
                      label="Umsatz-Chart"
                      checked={config.showRevenueChart}
                      onChange={(v) => saveConfig({ showRevenueChart: v })}
                    />
                    <ConfigSwitch
                      label="Umsatz nach Plan"
                      checked={config.showRevenueByPlan}
                      onChange={(v) => saveConfig({ showRevenueByPlan: v })}
                    />
                    <ConfigSwitch
                      label="Transaktionen"
                      checked={config.showTransactions}
                      onChange={(v) => saveConfig({ showTransactions: v })}
                    />
                  </div>
                </div>
                
                <Separator />

                {/* Subscriptions */}
                <div>
                  <h4 className="font-medium mb-3">Abonnements</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <ConfigSwitch
                      label="Plan Performance"
                      checked={config.showPlanPerformance}
                      onChange={(v) => saveConfig({ showPlanPerformance: v })}
                    />
                    <ConfigSwitch
                      label="Intervall-Aufteilung"
                      checked={config.showIntervalBreakdown}
                      onChange={(v) => saveConfig({ showIntervalBreakdown: v })}
                    />
                    <ConfigSwitch
                      label="Trial-Conversions"
                      checked={config.showTrialConversions}
                      onChange={(v) => saveConfig({ showTrialConversions: v })}
                    />
                    <ConfigSwitch
                      label="Churn-Metriken"
                      checked={config.showChurnMetrics}
                      onChange={(v) => saveConfig({ showChurnMetrics: v })}
                    />
                  </div>
                </div>

                <Separator />

                {/* AI/Metered Billing */}
                <div>
                  <h4 className="font-medium mb-3">AI & Metered Billing</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <ConfigSwitch
                      label="AI Revenue Panel"
                      checked={config.showAiRevenuePanel}
                      onChange={(v) => saveConfig({ showAiRevenuePanel: v })}
                    />
                    <ConfigSwitch
                      label="Feature-Aufschlüsselung"
                      checked={config.showAiUsageBreakdown}
                      onChange={(v) => saveConfig({ showAiUsageBreakdown: v })}
                    />
                    <ConfigSwitch
                      label="Top AI-Nutzer"
                      checked={config.showAiTopConsumers}
                      onChange={(v) => saveConfig({ showAiTopConsumers: v })}
                    />
                    <ConfigSwitch
                      label="Inkl. Credits Nutzung"
                      checked={config.showIncludedCreditsUsage}
                      onChange={(v) => saveConfig({ showIncludedCreditsUsage: v })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Sales & Marketing */}
                <div>
                  <h4 className="font-medium mb-3">Verkäufe & Marketing</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <ConfigSwitch
                      label="Credit-Pakete"
                      checked={config.showCreditPackageSales}
                      onChange={(v) => saveConfig({ showCreditPackageSales: v })}
                    />
                    <ConfigSwitch
                      label="Coupon-Einlösungen"
                      checked={config.showCouponRedemptions}
                      onChange={(v) => saveConfig({ showCouponRedemptions: v })}
                    />
                    <ConfigSwitch
                      label="Referral-Revenue"
                      checked={config.showReferralRevenue}
                      onChange={(v) => saveConfig({ showReferralRevenue: v })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Stripe */}
                <div>
                  <h4 className="font-medium mb-3">Stripe</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <ConfigSwitch
                      label="Stripe Balance"
                      checked={config.showStripeBalance}
                      onChange={(v) => saveConfig({ showStripeBalance: v })}
                    />
                    <ConfigSwitch
                      label="Stripe Gebühren"
                      checked={config.showStripeFees}
                      onChange={(v) => saveConfig({ showStripeFees: v })}
                    />
                    <ConfigSwitch
                      label="Zahlungsmethoden"
                      checked={config.showPaymentMethods}
                      onChange={(v) => saveConfig({ showPaymentMethods: v })}
                    />
                    <ConfigSwitch
                      label="Streitfälle"
                      checked={config.showStripeDisputes}
                      onChange={(v) => saveConfig({ showStripeDisputes: v })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Auto Refresh */}
                <div>
                  <h4 className="font-medium mb-3">Auto-Refresh</h4>
                  <div className="flex items-center gap-4">
                    <ConfigSwitch
                      label="Aktiviert"
                      checked={config.autoRefreshEnabled}
                      onChange={(v) => saveConfig({ autoRefreshEnabled: v })}
                    />
                    <Select 
                      value={String(config.autoRefreshSeconds)} 
                      onValueChange={(v) => saveConfig({ autoRefreshSeconds: parseInt(v) })}
                      disabled={!config.autoRefreshEnabled}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Sek</SelectItem>
                        <SelectItem value="60">1 Min</SelectItem>
                        <SelectItem value="300">5 Min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Demo Mode Notice */}
      {data.source === 'demo' && (
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <Zap className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-600">
            <strong>Demo-Modus aktiv</strong> - Es werden Beispieldaten angezeigt. 
            Verbinde Stripe für echte Daten.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      {config.showOverviewStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="MRR"
            value={data.overview.mrr}
            prefix="€"
            change={12.5}
            trend="up"
            icon={TrendingUp}
            color="emerald"
          />
          <MetricCard
            label="ARR"
            value={data.overview.arr}
            prefix="€"
            change={18.2}
            trend="up"
            icon={Target}
            color="blue"
          />
          <MetricCard
            label="ARPU"
            value={data.overview.arpu}
            prefix="€"
            change={5.3}
            trend="up"
            icon={DollarSign}
            color="violet"
          />
          <MetricCard
            label="Churn Rate"
            value={data.overview.churnRate}
            suffix="%"
            change={-0.5}
            trend="down"
            icon={TrendingDown}
            color="pink"
            invertTrend
          />
        </div>
      )}

      {/* Subscription Metrics Row */}
      {config.showSubscriptionMetrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aktive Abos</p>
                  <p className="text-2xl font-bold">{data.overview.activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trials</p>
                  <p className="text-2xl font-bold">{data.overview.trialingSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Netto-Umsatz</p>
                  <p className="text-2xl font-bold">€{data.overview.netRevenue.toLocaleString('de-DE')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stripe Gebühren</p>
                  <p className="text-2xl font-bold">€{data.overview.stripeFees.toLocaleString('de-DE')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        {config.showRevenueChart && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Umsatzentwicklung</CardTitle>
              <CardDescription>Tägliche/Monatliche Einnahmen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2">
                {(data.monthlyTrend || []).slice(-12).map((d, index) => (
                  <div key={d.month || d.date || index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.revenue / maxChartValue) * 100}%` }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="w-full relative group cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500 to-green-400 rounded-t-sm hover:from-emerald-400 hover:to-green-300 transition-colors" />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                        €{d.revenue.toLocaleString('de-DE')}
                      </div>
                    </motion.div>
                    <span className="text-xs text-muted-foreground">
                      {d.month || (d.date ? new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : '')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue by Plan */}
        {config.showRevenueByPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Umsatz nach Plan</CardTitle>
              <CardDescription>Verteilung der Einnahmen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data.revenueByPlan || []).slice(0, 5).map((plan, index) => (
                  <div key={plan.planId || index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-3 w-3 rounded-full",
                          plan.color || (plan.planType === 'STYLIST' ? 'bg-violet-500' : 'bg-emerald-500')
                        )} />
                        <span className="font-medium truncate max-w-[120px]">{plan.planName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">€{plan.mrr.toLocaleString('de-DE')}</span>
                        <span className="text-xs text-muted-foreground ml-1">({plan.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={plan.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Revenue Section */}
      {(config.showAiRevenuePanel || config.showAiUsageBreakdown || config.showAiTopConsumers) && (
        <CollapsibleSection
          title="AI & Metered Billing"
          icon={Bot}
          expanded={expandedSections.ai}
          onToggle={() => toggleSection('ai')}
          badge={`€${data.aiRevenue.totalRevenueEur.toLocaleString('de-DE')}`}
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {/* AI Overview */}
            {config.showAiRevenuePanel && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-violet-500" />
                    AI Revenue Übersicht
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-500">€{data.aiRevenue.totalRevenueEur.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Umsatz</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-red-500">€{data.aiRevenue.totalCostEur.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Kosten</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-500">€{data.aiRevenue.profitEur.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Profit</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-violet-500">{data.aiRevenue.marginPercent}%</p>
                      <p className="text-xs text-muted-foreground">Marge</p>
                    </div>
                  </div>

                  {/* AI Usage by Feature */}
                  {config.showAiUsageBreakdown && data.aiRevenue.byFeature.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Nach Feature</h4>
                      {data.aiRevenue.byFeature.map((f, i) => (
                        <div key={f.feature} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <FeatureIcon feature={f.feature} />
                            <span className="text-sm">{f.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">€{f.revenue.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground ml-2">{f.requests.toLocaleString()} Req</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Top AI Consumers */}
            {config.showAiTopConsumers && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top AI-Nutzer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.aiRevenue.topConsumers.slice(0, 5).map((user, i) => (
                      <div key={user.userId} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                          i === 0 ? "bg-amber-500/20 text-amber-600" :
                          i === 1 ? "bg-slate-300/30 text-slate-600" :
                          i === 2 ? "bg-orange-500/20 text-orange-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.requests.toLocaleString()} Requests</p>
                        </div>
                        <p className="font-bold text-emerald-600">€{user.spent.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Sales & Marketing Section */}
      {(config.showCreditPackageSales || config.showCouponRedemptions || config.showReferralRevenue) && (
        <CollapsibleSection
          title="Verkäufe & Marketing"
          icon={Tag}
          expanded={expandedSections.sales}
          onToggle={() => toggleSection('sales')}
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Credit Package Sales */}
            {config.showCreditPackageSales && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-500" />
                    Credit-Pakete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Gesamt</span>
                      <span className="text-xl font-bold">€{data.creditPackageSales.totalSales.toLocaleString('de-DE')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Verkäufe</span>
                      <span>{data.creditPackageSales.totalPackages}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {data.creditPackageSales.packages.slice(0, 4).map(pkg => (
                        <div key={pkg.name} className="flex justify-between text-sm">
                          <span>{pkg.name}</span>
                          <span className="font-medium">{pkg.sold}x (€{pkg.revenue.toFixed(2)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Coupon Analytics */}
            {config.showCouponRedemptions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5 text-pink-500" />
                    Coupons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rabatt gewährt</span>
                      <span className="text-xl font-bold text-red-500">-€{data.couponAnalytics.totalDiscount.toLocaleString('de-DE')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Einlösungen</span>
                      <span>{data.couponAnalytics.totalRedemptions}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {data.couponAnalytics.topCoupons.slice(0, 4).map(c => (
                        <div key={c.code} className="flex justify-between text-sm">
                          <code className="bg-muted px-1 rounded">{c.code}</code>
                          <span>{c.redemptions}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referral Revenue */}
            {config.showReferralRevenue && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="h-5 w-5 text-emerald-500" />
                    Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Netto-Revenue</span>
                      <span className="text-xl font-bold text-emerald-500">€{data.referralRevenue.netReferralRevenue.toLocaleString('de-DE')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="font-bold">{data.referralRevenue.totalReferrals}</p>
                        <p className="text-xs text-muted-foreground">Empfehlungen</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="font-bold">{data.referralRevenue.conversionRate}%</p>
                        <p className="text-xs text-muted-foreground">Conversion</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {data.referralRevenue.topReferrers.slice(0, 3).map(r => (
                        <div key={r.email} className="flex justify-between text-sm">
                          <span className="truncate max-w-[120px]">{r.name}</span>
                          <span className="font-medium">{r.conversions} Conv.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Stripe Section */}
      {(config.showStripeBalance || config.showStripeFees || config.showPaymentMethods) && (
        <CollapsibleSection
          title="Stripe Details"
          icon={CreditCard}
          expanded={expandedSections.stripe}
          onToggle={() => toggleSection('stripe')}
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Stripe Balance */}
            {config.showStripeBalance && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stripe Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Verfügbar</span>
                      <span className="text-xl font-bold text-emerald-500">€{data.stripeMetrics.balance.available.toLocaleString('de-DE')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Ausstehend</span>
                      <span>€{data.stripeMetrics.balance.pending.toLocaleString('de-DE')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Gesamt</span>
                      <span className="font-bold">€{data.stripeMetrics.balance.total.toLocaleString('de-DE')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stripe Fees */}
            {config.showStripeFees && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gebühren</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Diesen Monat</span>
                      <span className="text-xl font-bold text-red-500">€{data.stripeMetrics.fees.thisMonth.toLocaleString('de-DE')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Durchschn. pro Transaktion</span>
                      <span>€{data.stripeMetrics.fees.avgPerTransaction.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Gebührenrate</span>
                      <span>{data.stripeMetrics.fees.feeRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Methods */}
            {config.showPaymentMethods && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Zahlungsmethoden</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(data.stripeMetrics.paymentMethods || []).map((method) => (
                      <div key={method.method} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{method.method}</span>
                          <span className="font-medium">{method.percentage}%</span>
                        </div>
                        <Progress value={method.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Recent Transactions */}
      {config.showTransactions && (
        <Card>
          <CardHeader>
            <CardTitle>Letzte Transaktionen</CardTitle>
            <CardDescription>Aktuelle Zahlungen via Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.recentTransactions || []).slice(0, 8).map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      tx.status === 'succeeded' ? 'bg-green-500/10' : 
                      tx.status === 'pending' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                    )}>
                      <Receipt className={cn(
                        "h-5 w-5",
                        tx.status === 'succeeded' ? 'text-green-500' : 
                        tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">{tx.customerName}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString('de-DE')}
                        </p>
                        {tx.type && (
                          <Badge variant="outline" className="text-xs">
                            {tx.type === 'subscription' ? 'Abo' : 
                             tx.type === 'credit_package' ? 'Credits' : 
                             tx.type === 'metered_billing' ? 'AI' : tx.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(tx.status)}
                    <span className="font-medium w-24 text-right">
                      €{tx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper Components

function ConfigSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function MetricCard({ 
  label, 
  value, 
  prefix = '', 
  suffix = '', 
  change, 
  trend, 
  icon: Icon, 
  color,
  invertTrend = false 
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  change: number
  trend: 'up' | 'down'
  icon: typeof TrendingUp
  color: string
  invertTrend?: boolean
}) {
  const isPositive = invertTrend ? trend === 'down' : trend === 'up'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <h3 className="text-2xl font-bold mt-1">
                {prefix}{typeof value === 'number' ? value.toLocaleString('de-DE') : value}{suffix}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {change > 0 ? (
                  <ArrowUpRight className={cn("h-4 w-4", isPositive ? "text-green-500" : "text-red-500")} />
                ) : (
                  <ArrowDownRight className={cn("h-4 w-4", isPositive ? "text-green-500" : "text-red-500")} />
                )}
                <span className={cn("text-sm", isPositive ? "text-green-500" : "text-red-500")}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            </div>
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", `bg-${color}-500/10`)}>
              <Icon className={cn("h-6 w-6", `text-${color}-500`)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  expanded, 
  onToggle, 
  children,
  badge 
}: {
  title: string
  icon: typeof Bot
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  badge?: string
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-semibold">{title}</span>
          {badge && (
            <Badge variant="secondary">{badge}</Badge>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FeatureIcon({ feature }: { feature: string }) {
  const iconMap: Record<string, { icon: typeof Activity; color: string }> = {
    social_post: { icon: Activity, color: 'text-pink-500' },
    image_gen: { icon: Sparkles, color: 'text-blue-500' },
    video_gen: { icon: Activity, color: 'text-purple-500' },
    translation: { icon: Activity, color: 'text-emerald-500' },
    chat: { icon: Activity, color: 'text-sky-500' },
    hashtags: { icon: Tag, color: 'text-orange-500' },
    other: { icon: Activity, color: 'text-gray-500' },
  }
  
  const config = iconMap[feature] || iconMap.other
  const Icon = config.icon
  
  return <Icon className={cn("h-4 w-4", config.color)} />
}
