'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Settings,
  ExternalLink,
  Loader2,
  Eye,
  UserPlus,
  LogIn,
  Activity,
  Radio,
  Play,
  Download,
  FileText,
  Share2,
  Target,
  Repeat,
  MousePointerClick,
  Route,
  Video,
  Timer,
  Percent,
  ArrowDown,
  ArrowUp,
  Calendar,
  Filter,
  Zap,
  DollarSign,
  CreditCard,
  TrendingDown,
  Layers,
  MousePointer,
  Flame,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Sankey,
  Layer,
  Rectangle,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts'

// ============== TYPES ==============

interface OverviewData {
  pageviews: number
  uniqueUsers: number
  signups: number
  logins: number
  totalEvents: number
  avgSessionDuration: number
  pagesPerSession: number
  bounceRate: number
}

interface TrendData {
  date: string
  value: number
}

interface TopPage {
  url: string
  views: number
}

interface DeviceData {
  device: string
  users: number
}

interface BrowserData {
  browser: string
  users: number
}

interface CountryData {
  country: string
  users: number
}

interface RecentEvent {
  event: string
  timestamp: string
  person?: string
  url?: string
}

interface FunnelStep {
  step: string
  count: number
  percentage: number
  dropoff?: number
}

interface SessionData {
  id: string
  duration: number
  startTime: string
  pageCount: number
  country?: string
  device?: string
  browser?: string
  startUrl?: string
}

interface RetentionCohort {
  date: string
  size: number
  retention: number[]
}

interface ReferrerData {
  referrer: string
  visits: number
  percentage: number
}

interface UtmData {
  name: string
  visits: number
  percentage: number
}

interface PathNode {
  name: string
  value: number
}

interface PathLink {
  source: string
  target: string
  value: number
}

interface HourlyData {
  hour: number
  users: number
}

interface WeeklyData {
  day: string
  users: number
}

// Revenue Analytics Types
interface RevenueOverview {
  totalRevenue: number
  mrr: number
  arr: number
  activeSubscriptions: number
  trialUsers: number
  churnRate: number
  avgRevenuePerUser: number
  lifetimeValue: number
}

interface RevenueTrend {
  date: string
  revenue: number
  subscriptions: number
}

interface PlanData {
  plan: string
  revenue: number
  count: number
  percentage: number
}

interface ChannelData {
  channel: string
  revenue: number
  conversions: number
  percentage: number
}

interface Transaction {
  id: string
  amount: number
  currency: string
  status: string
  customer: string
  email?: string
  created: string
  description?: string
}

// Heatmap Types
interface ClickData {
  element: string
  clicks: number
}

interface RageClick {
  url: string
  count: number
}

interface InteractionData {
  type: string
  count: number
}

// ============== CONSTANTS ==============

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const deviceIcons: Record<string, React.ElementType> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
  Unknown: Monitor,
}

// ============== COMPONENT ==============

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState('overview')

  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [topPages, setTopPages] = useState<TopPage[]>([])
  const [devices, setDevices] = useState<DeviceData[]>([])
  const [browsers, setBrowsers] = useState<BrowserData[]>([])
  const [countries, setCountries] = useState<CountryData[]>([])
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [funnel, setFunnel] = useState<FunnelStep[]>([])
  
  // New data states
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [sessionStats, setSessionStats] = useState<{ totalSessions: number; avgDuration: number; avgClicks: number; errorSessions: number } | null>(null)
  const [retention, setRetention] = useState<{ cohorts: RetentionCohort[] }>({ cohorts: [] })
  const [stickiness, setStickiness] = useState<{ stickiness: number[]; labels: string[] }>({ stickiness: [], labels: [] })
  const [referrers, setReferrers] = useState<ReferrerData[]>([])
  const [utmSources, setUtmSources] = useState<UtmData[]>([])
  const [utmCampaigns, setUtmCampaigns] = useState<UtmData[]>([])
  const [paths, setPaths] = useState<{ nodes: PathNode[]; links: PathLink[] }>({ nodes: [], links: [] })
  const [entryPages, setEntryPages] = useState<TopPage[]>([])
  const [exitPages, setExitPages] = useState<TopPage[]>([])
  const [bounceRate, setBounceRate] = useState<{ bounceRate: number; singlePageSessions: number; totalSessions: number } | null>(null)
  const [newVsReturning, setNewVsReturning] = useState<{ newUsers: number; returningUsers: number } | null>(null)
  const [hourlyActivity, setHourlyActivity] = useState<HourlyData[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyData[]>([])
  const [liveEvents, setLiveEvents] = useState<RecentEvent[]>([])
  const [activeUsers, setActiveUsers] = useState<Array<{ id: string; lastSeen: string; currentUrl?: string }>>([])
  const [realtimeData, setRealtimeData] = useState<{ activeUsers: number; recentPageviews: number; recentEvents: number } | null>(null)

  // Revenue Analytics States
  const [revenueOverview, setRevenueOverview] = useState<RevenueOverview | null>(null)
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([])
  const [revenueByPlan, setRevenueByPlan] = useState<PlanData[]>([])
  const [revenueByChannel, setRevenueByChannel] = useState<ChannelData[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [revenueFunnel, setRevenueFunnel] = useState<FunnelStep[]>([])
  const [isStripeConfigured, setIsStripeConfigured] = useState(true)

  // Heatmap States
  const [heatmapConfig, setHeatmapConfig] = useState<{ toolbarUrl: string; heatmapUrl: string; launchToolbarUrl: string } | null>(null)
  const [clickData, setClickData] = useState<ClickData[]>([])
  const [rageClicks, setRageClicks] = useState<RageClick[]>([])
  const [interactionData, setInteractionData] = useState<InteractionData[]>([])
  const [selectedPage, setSelectedPage] = useState('/')

  const dateRangeMap: Record<string, string> = {
    '24h': '-1d',
    '7d': '-7d',
    '30d': '-30d',
    '90d': '-90d',
  }

  const fetchData = useCallback(async (type: string, additionalParams?: string) => {
    const dateFrom = dateRangeMap[timeRange] || '-7d'
    const url = `/api/admin/analytics/posthog?type=${type}&dateFrom=${dateFrom}${additionalParams || ''}`
    const res = await fetch(url)
    return res.json()
  }, [timeRange])

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel based on active tab
      const baseData = await Promise.all([
        fetchData('overview'),
        fetchData('trends'),
        fetchData('recent-events'),
      ])

      // Process base data
      const [overviewData, trendsData, eventsData] = baseData

      if (!overviewData.configured) {
        setIsConfigured(false)
        setIsLoading(false)
        return
      }
      setIsConfigured(true)
      setOverview(overviewData.data)
      setTrends(trendsData.data || [])
      setRecentEvents(eventsData.data || [])

      // Fetch additional data based on active tab
      if (activeTab === 'overview' || activeTab === 'traffic') {
        const [topPagesData, devicesData, browsersData, countriesData] = await Promise.all([
          fetchData('top-pages'),
          fetchData('devices'),
          fetchData('browsers'),
          fetchData('countries'),
        ])
        setTopPages(topPagesData.data || [])
        setDevices(devicesData.data || [])
        setBrowsers(browsersData.data || [])
        setCountries(countriesData.data || [])
      }

      if (activeTab === 'realtime') {
        const [realtimeRes, liveEventsRes, activeUsersRes] = await Promise.all([
          fetchData('realtime'),
          fetchData('live-events'),
          fetchData('active-users'),
        ])
        setRealtimeData(realtimeRes.data)
        setLiveEvents(liveEventsRes.data || [])
        setActiveUsers(activeUsersRes.data || [])
      }

      if (activeTab === 'retention') {
        const [retentionRes, stickinessRes, newVsReturningRes] = await Promise.all([
          fetchData('retention'),
          fetchData('stickiness'),
          fetchData('new-vs-returning'),
        ])
        setRetention(retentionRes.data || { cohorts: [] })
        setStickiness(stickinessRes.data || { stickiness: [], labels: [] })
        setNewVsReturning(newVsReturningRes.data)
      }

      if (activeTab === 'paths') {
        const [pathsRes, entryRes, exitRes] = await Promise.all([
          fetchData('paths'),
          fetchData('entry-pages'),
          fetchData('exit-pages'),
        ])
        setPaths(pathsRes.data || { nodes: [], links: [] })
        setEntryPages(entryRes.data || [])
        setExitPages(exitRes.data || [])
      }

      if (activeTab === 'sessions') {
        const [sessionsRes, sessionStatsRes] = await Promise.all([
          fetchData('sessions'),
          fetchData('session-stats'),
        ])
        setSessions(sessionsRes.data || [])
        setSessionStats(sessionStatsRes.data)
      }

      if (activeTab === 'funnel') {
        const funnelRes = await fetchData('auth-funnel')
        setFunnel(funnelRes.data || [])
      }

      if (activeTab === 'attribution') {
        const [referrersRes, utmSourcesRes, utmCampaignsRes] = await Promise.all([
          fetchData('referrers'),
          fetchData('utm-sources'),
          fetchData('utm-campaigns'),
        ])
        setReferrers(referrersRes.data || [])
        setUtmSources(utmSourcesRes.data || [])
        setUtmCampaigns(utmCampaignsRes.data || [])
      }

      if (activeTab === 'behavior') {
        const [bounceRes, hourlyRes, weeklyRes] = await Promise.all([
          fetchData('bounce-rate'),
          fetchData('hourly-activity'),
          fetchData('weekly-activity'),
        ])
        setBounceRate(bounceRes.data)
        setHourlyActivity(hourlyRes.data || [])
        setWeeklyActivity(weeklyRes.data || [])
      }

      // Revenue Analytics Tab
      if (activeTab === 'revenue') {
        const dateFrom = dateRangeMap[timeRange] || '-30d'
        try {
          const [overviewRes, trendsRes, byPlanRes, byChannelRes, transactionsRes, funnelRes] = await Promise.all([
            fetch(`/api/admin/analytics/revenue?type=overview&dateFrom=${dateFrom}`).then(r => r.json()),
            fetch(`/api/admin/analytics/revenue?type=trends&dateFrom=${dateFrom}`).then(r => r.json()),
            fetch(`/api/admin/analytics/revenue?type=by-plan&dateFrom=${dateFrom}`).then(r => r.json()),
            fetch(`/api/admin/analytics/revenue?type=by-channel&dateFrom=${dateFrom}`).then(r => r.json()),
            fetch(`/api/admin/analytics/revenue?type=transactions&dateFrom=${dateFrom}`).then(r => r.json()),
            fetch(`/api/admin/analytics/revenue?type=conversion-funnel&dateFrom=${dateFrom}`).then(r => r.json()),
          ])
          
          if (overviewRes.configured === false) {
            setIsStripeConfigured(false)
          } else {
            setIsStripeConfigured(true)
            setRevenueOverview(overviewRes.data || null)
            setRevenueTrends(trendsRes.data || [])
            setRevenueByPlan(byPlanRes.data || [])
            setRevenueByChannel(byChannelRes.data || [])
            setTransactions(transactionsRes.data || [])
            setRevenueFunnel(funnelRes.data || [])
          }
        } catch (err) {
          console.error('Revenue fetch error:', err)
          setIsStripeConfigured(false)
        }
      }

      // Heatmaps Tab
      if (activeTab === 'heatmaps') {
        const dateFrom = dateRangeMap[timeRange] || '-7d'
        try {
          const [configRes, clickRes, rageRes, interactionRes] = await Promise.all([
            fetch(`/api/admin/analytics/heatmaps?type=config`).then(r => r.json()),
            fetch(`/api/admin/analytics/heatmaps?type=click-data&page=${encodeURIComponent(selectedPage)}&dateFrom=${dateFrom}`).then(r => r.json()),
            fetch(`/api/admin/analytics/heatmaps?type=rage-clicks&dateFrom=${dateFrom}`).then(r => r.json()),
            fetch(`/api/admin/analytics/heatmaps?type=top-interactions&dateFrom=${dateFrom}`).then(r => r.json()),
          ])
          
          if (configRes.configured) {
            setHeatmapConfig(configRes.data)
            setClickData(clickRes.data || [])
            setRageClicks(rageRes.data || [])
            setInteractionData(interactionRes.data || [])
          }
        } catch (err) {
          console.error('Heatmaps fetch error:', err)
        }
      }

      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Fehler beim Laden der Analytics-Daten')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, fetchData])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Real-time refresh for realtime tab
  useEffect(() => {
    if (activeTab === 'realtime' && isConfigured) {
      const interval = setInterval(() => {
        fetchData('live-events').then(res => setLiveEvents(res.data || []))
        fetchData('realtime').then(res => setRealtimeData(res.data))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [activeTab, isConfigured, fetchData])

  // Export functions
  const exportToCSV = (data: unknown[], filename: string) => {
    if (!data.length) return
    const headers = Object.keys(data[0] as Record<string, unknown>)
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Not configured state
  if (!isLoading && !isConfigured) {
    return (
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-500/30 bg-amber-500/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <CardTitle>PostHog nicht konfiguriert</CardTitle>
                  <CardDescription>
                    Bitte konfiguriere PostHog in den Einstellungen, um Analytics-Daten anzuzeigen.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Link href="/admin/settings">
                  <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    Zu den Einstellungen
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://posthog.com', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  PostHog Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <BarChart3 className="h-4 w-4" />
            Powered by PostHog
            {lastRefresh && (
              <span className="text-xs" suppressHydrationWarning>
                • Letzte Aktualisierung: {lastRefresh.toLocaleTimeString('de-DE')}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Letzte 24 Stunden</SelectItem>
              <SelectItem value="7d">Letzte 7 Tage</SelectItem>
              <SelectItem value="30d">Letzte 30 Tage</SelectItem>
              <SelectItem value="90d">Letzte 90 Tage</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportToCSV(topPages, 'top-pages')}>
                <FileText className="mr-2 h-4 w-4" />
                Top Pages (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(countries, 'countries')}>
                <Globe className="mr-2 h-4 w-4" />
                Länder (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(referrers, 'referrers')}>
                <Share2 className="mr-2 h-4 w-4" />
                Referrer (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(sessions, 'sessions')}>
                <Video className="mr-2 h-4 w-4" />
                Sessions (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Seitenaufrufe</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overview?.pageviews.toLocaleString('de-DE') || '0'}
            </div>
            <p className="text-xs text-muted-foreground">im ausgewählten Zeitraum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eindeutige Besucher</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overview?.uniqueUsers.toLocaleString('de-DE') || '0'}
            </div>
            <p className="text-xs text-muted-foreground">aktive Nutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Registrierungen</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overview?.signups.toLocaleString('de-DE') || '0'}
            </div>
            <p className="text-xs text-muted-foreground">neue Nutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Logins</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overview?.logins.toLocaleString('de-DE') || '0'}
            </div>
            <p className="text-xs text-muted-foreground">erfolgreiche Anmeldungen</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4 hidden sm:inline" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="realtime" className="gap-2">
            <Radio className="h-4 w-4 hidden sm:inline" />
            Echtzeit
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <DollarSign className="h-4 w-4 hidden sm:inline" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="retention" className="gap-2">
            <Repeat className="h-4 w-4 hidden sm:inline" />
            Retention
          </TabsTrigger>
          <TabsTrigger value="funnel" className="gap-2">
            <Target className="h-4 w-4 hidden sm:inline" />
            Funnel
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Video className="h-4 w-4 hidden sm:inline" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="heatmaps" className="gap-2">
            <Flame className="h-4 w-4 hidden sm:inline" />
            Heatmaps
          </TabsTrigger>
          <TabsTrigger value="paths" className="gap-2">
            <Route className="h-4 w-4 hidden sm:inline" />
            Pfade
          </TabsTrigger>
          <TabsTrigger value="attribution" className="gap-2">
            <Share2 className="h-4 w-4 hidden sm:inline" />
            Attribution
          </TabsTrigger>
          <TabsTrigger value="behavior" className="gap-2">
            <Activity className="h-4 w-4 hidden sm:inline" />
            Verhalten
          </TabsTrigger>
        </TabsList>

        {/* ============== OVERVIEW TAB ============== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Seitenaufrufe über Zeit</CardTitle>
                <CardDescription>Tägliche Pageviews im ausgewählten Zeitraum</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trends}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Keine Daten verfügbar</div>
                )}
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Seiten</CardTitle>
                <CardDescription>Meistbesuchte Seiten</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPages.slice(0, 5).map((page, index) => {
                    const maxViews = topPages[0]?.views || 1
                    return (
                      <div key={page.url} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="truncate max-w-[200px]" title={page.url}>
                            {(() => { try { return new URL(page.url).pathname || '/' } catch { return page.url } })()}
                          </span>
                          <span className="font-medium">{page.views.toLocaleString('de-DE')}</span>
                        </div>
                        <Progress value={(page.views / maxViews) * 100} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Countries */}
            <Card>
              <CardHeader>
                <CardTitle>Länder</CardTitle>
                <CardDescription>Besucher nach Land</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {countries.slice(0, 5).map((country, index) => {
                    const total = countries.reduce((sum, c) => sum + c.users, 0)
                    const percentage = total > 0 ? (country.users / total) * 100 : 0
                    return (
                      <div key={country.country} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span>{country.country}</span>
                            <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-1 mt-1" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Devices & Browsers */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Geräte</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={devices} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="users" nameKey="device">
                      {devices.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {devices.map((device, index) => {
                    const Icon = deviceIcons[device.device] || Monitor
                    return (
                      <div key={device.device} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <Icon className="h-4 w-4" />
                        <span>{device.device}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {browsers.slice(0, 5).map((browser, index) => {
                    const total = browsers.reduce((sum, b) => sum + b.users, 0)
                    const percentage = total > 0 ? (browser.users / total) * 100 : 0
                    return (
                      <div key={browser.browser} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{browser.browser}</span>
                          <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============== REALTIME TAB ============== */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Radio className="h-4 w-4 text-green-500 animate-pulse" />
                  Aktive Nutzer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-500">{realtimeData?.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">in den letzten 5 Minuten</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pageviews (Live)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{realtimeData?.recentPageviews || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">letzte 5 Minuten</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Events (Live)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{realtimeData?.recentEvents || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">letzte 5 Minuten</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Live Event Stream */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Live Events
                  </CardTitle>
                  <Badge variant="outline" className="animate-pulse">Live</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {liveEvents.slice(0, 15).map((event, index) => (
                      <motion.div
                        key={`${event.timestamp}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <Badge variant="secondary">{event.event}</Badge>
                        <span className="text-xs text-muted-foreground truncate flex-1">
                          {event.url && new URL(event.url).pathname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString('de-DE')}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Active Users List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Aktive Besucher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Aktuelle Seite</TableHead>
                      <TableHead>Zuletzt gesehen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
                        <TableCell className="text-xs truncate max-w-[150px]">
                          {user.currentUrl && (() => { try { return new URL(user.currentUrl).pathname } catch { return user.currentUrl } })()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(user.lastSeen).toLocaleTimeString('de-DE')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============== RETENTION TAB ============== */}
        <TabsContent value="retention" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Neue Nutzer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{newVsReturning?.newUsers || 0}</div>
                <p className="text-xs text-muted-foreground">im Zeitraum</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Wiederkehrende Nutzer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{newVsReturning?.returningUsers || 0}</div>
                <p className="text-xs text-muted-foreground">im Zeitraum</p>
              </CardContent>
            </Card>
          </div>

          {/* Retention Table */}
          <Card>
            <CardHeader>
              <CardTitle>Retention Kohorten</CardTitle>
              <CardDescription>Wie viele Nutzer kommen nach X Tagen zurück?</CardDescription>
            </CardHeader>
            <CardContent>
              {retention.cohorts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kohorte</TableHead>
                        <TableHead>Nutzer</TableHead>
                        {[...Array(7)].map((_, i) => (
                          <TableHead key={i} className="text-center">Tag {i}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retention.cohorts.slice(0, 7).map((cohort) => (
                        <TableRow key={cohort.date}>
                          <TableCell className="font-medium">{cohort.date}</TableCell>
                          <TableCell>{cohort.size}</TableCell>
                          {cohort.retention.map((value, i) => (
                            <TableCell key={i} className="text-center">
                              <div
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `hsl(var(--primary) / ${value / 100})`,
                                  color: value > 50 ? 'white' : 'inherit',
                                }}
                              >
                                {value}%
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Keine Retention-Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stickiness Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Stickiness (DAU/MAU)</CardTitle>
              <CardDescription>Wie oft nutzen aktive Nutzer die Plattform?</CardDescription>
            </CardHeader>
            <CardContent>
              {stickiness.stickiness.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stickiness.labels.map((label, i) => ({ day: label, users: stickiness.stickiness[i] || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Keine Stickiness-Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== FUNNEL TAB ============== */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registrierungs-Funnel</CardTitle>
              <CardDescription>Conversion von Registrierung zu erstem Login</CardDescription>
            </CardHeader>
            <CardContent>
              {funnel.length > 0 ? (
                <div className="space-y-6">
                  {funnel.map((step, index) => (
                    <div key={step.step} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <span className="font-medium">{step.step}</span>
                            {index > 0 && step.dropoff !== undefined && (
                              <span className="ml-2 text-xs text-red-500">
                                <ArrowDown className="h-3 w-3 inline" /> {step.dropoff.toFixed(1)}% Drop-off
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold">{step.count.toLocaleString('de-DE')}</span>
                          <span className="text-muted-foreground ml-2">({step.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${step.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                      {index < funnel.length - 1 && (
                        <div className="absolute left-5 top-16 h-8 border-l-2 border-dashed border-muted-foreground/30" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-4">
                  <Target className="h-12 w-12 opacity-50" />
                  <p>Noch keine Funnel-Daten verfügbar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== SESSIONS TAB ============== */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Aufnahmen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sessionStats?.totalSessions || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ø Dauer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {sessionStats?.avgDuration ? `${Math.round(sessionStats.avgDuration / 60)}min` : '0min'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ø Klicks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sessionStats?.avgClicks || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Mit Fehlern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{sessionStats?.errorSessions || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Session Recordings
              </CardTitle>
              <CardDescription>Klicke auf PostHog öffnen um Recordings anzusehen</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>Dauer</TableHead>
                    <TableHead>Gerät</TableHead>
                    <TableHead>Land</TableHead>
                    <TableHead>Seite</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-xs">{session.id.substring(0, 8)}...</TableCell>
                      <TableCell>{new Date(session.startTime).toLocaleString('de-DE')}</TableCell>
                      <TableCell>{Math.round(session.duration / 60)}min</TableCell>
                      <TableCell><Badge variant="outline">{session.device || 'Unknown'}</Badge></TableCell>
                      <TableCell>{session.country || '-'}</TableCell>
                      <TableCell className="truncate max-w-[150px]">{session.startUrl || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button variant="outline" onClick={() => window.open('https://eu.posthog.com/recordings', '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  In PostHog öffnen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== PATHS TAB ============== */}
        <TabsContent value="paths" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDown className="h-5 w-5 text-green-500" />
                  Entry Pages
                </CardTitle>
                <CardDescription>Wo Nutzer einsteigen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entryPages.slice(0, 8).map((page, index) => (
                    <div key={page.url} className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="truncate max-w-[200px] text-sm">
                            {(() => { try { return new URL(page.url).pathname || '/' } catch { return page.url } })()}
                          </span>
                          <span className="font-medium">{page.views.toLocaleString('de-DE')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-red-500" />
                  Exit Pages
                </CardTitle>
                <CardDescription>Wo Nutzer aussteigen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exitPages.slice(0, 8).map((page, index) => (
                    <div key={page.url} className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="truncate max-w-[200px] text-sm">
                            {(() => { try { return new URL(page.url).pathname || '/' } catch { return page.url } })()}
                          </span>
                          <span className="font-medium">{page.views.toLocaleString('de-DE')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Paths</CardTitle>
              <CardDescription>Wie navigieren Nutzer durch die Seite?</CardDescription>
            </CardHeader>
            <CardContent>
              {paths.nodes.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Top {paths.nodes.length} Pfade mit {paths.links.length} Verbindungen
                  </p>
                  <div className="grid gap-2">
                    {paths.links.slice(0, 10).map((link, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <Badge variant="outline">{link.source}</Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{link.target}</Badge>
                        <span className="ml-auto text-sm text-muted-foreground">{link.value} Nutzer</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Keine Pfad-Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============== ATTRIBUTION TAB ============== */}
        <TabsContent value="attribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic-Quellen (Referrer)</CardTitle>
              <CardDescription>Woher kommen die Besucher?</CardDescription>
            </CardHeader>
            <CardContent>
              {referrers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={referrers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis dataKey="referrer" type="category" width={150} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Keine Referrer-Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>UTM Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {utmSources.length > 0 ? utmSources.map((utm, index) => (
                    <div key={utm.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{utm.name || '(none)'}</span>
                        <span className="text-muted-foreground">{utm.percentage}%</span>
                      </div>
                      <Progress value={utm.percentage} className="h-2" />
                    </div>
                  )) : (
                    <div className="text-center text-muted-foreground py-8">Keine UTM Source Daten</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>UTM Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {utmCampaigns.length > 0 ? utmCampaigns.map((utm, index) => (
                    <div key={utm.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{utm.name || '(none)'}</span>
                        <span className="text-muted-foreground">{utm.percentage}%</span>
                      </div>
                      <Progress value={utm.percentage} className="h-2" />
                    </div>
                  )) : (
                    <div className="text-center text-muted-foreground py-8">Keine UTM Campaign Daten</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============== BEHAVIOR TAB ============== */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{bounceRate?.bounceRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {bounceRate?.singlePageSessions || 0} von {bounceRate?.totalSessions || 0} Sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ø Seiten/Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overview?.pagesPerSession?.toFixed(1) || '1.0'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ø Session-Dauer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {overview?.avgSessionDuration ? `${Math.round(overview.avgSessionDuration / 60)}min` : '-'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Aktivität nach Tageszeit</CardTitle>
              </CardHeader>
              <CardContent>
                {hourlyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={hourlyActivity}>
                      <defs>
                        <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip labelFormatter={(h) => `${h}:00 Uhr`} />
                      <Area type="monotone" dataKey="users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorHourly)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Keine Daten verfügbar
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktivität nach Wochentag</CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Keine Daten verfügbar
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============== REVENUE TAB ============== */}
        <TabsContent value="revenue" className="space-y-6">
          {!isStripeConfigured ? (
            <Card className="border-amber-500/30 bg-amber-500/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-amber-500/20">
                    <CreditCard className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle>Stripe nicht konfiguriert</CardTitle>
                    <CardDescription>
                      Bitte konfiguriere Stripe, um Revenue-Daten anzuzeigen.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ) : (
            <>
              {/* Revenue KPIs */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">
                      €{revenueOverview?.totalRevenue?.toLocaleString('de-DE') || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">im Zeitraum</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">MRR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      €{revenueOverview?.mrr?.toLocaleString('de-DE') || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">ARR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      €{revenueOverview?.arr?.toLocaleString('de-DE') || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">Annual Recurring Revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-500">
                      {revenueOverview?.churnRate || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Abwanderungsrate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Aktive Abos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{revenueOverview?.activeSubscriptions || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Trial-Nutzer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-500">{revenueOverview?.trialUsers || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ø Umsatz/Nutzer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      €{revenueOverview?.avgRevenuePerUser?.toFixed(2) || '0'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Umsatz-Entwicklung</CardTitle>
                  <CardDescription>Täglicher Umsatz im Zeitraum</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueTrends}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
                        <Tooltip formatter={(value) => [`€${value}`, 'Umsatz']} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Keine Umsatzdaten verfügbar
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue by Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>Umsatz nach Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {revenueByPlan.length > 0 ? (
                      <div className="space-y-4">
                        {revenueByPlan.map((plan, index) => (
                          <div key={plan.plan} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                {plan.plan}
                              </span>
                              <span className="font-medium">€{plan.revenue.toLocaleString('de-DE')} ({plan.percentage}%)</span>
                            </div>
                            <Progress value={plan.percentage} className="h-2" />
                            <p className="text-xs text-muted-foreground">{plan.count} Abonnements</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Keine Plan-Daten verfügbar
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Revenue by Channel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Conversions nach Kanal</CardTitle>
                    <CardDescription>UTM-Source Attribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueByChannel.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={revenueByChannel} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="conversions" nameKey="channel">
                            {revenueByChannel.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        Keine Kanal-Daten verfügbar
                      </div>
                    )}
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {revenueByChannel.slice(0, 5).map((channel, index) => (
                        <div key={channel.channel} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span>{channel.channel}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Letzte Transaktionen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kunde</TableHead>
                        <TableHead>Betrag</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Datum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 10).map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{tx.customer}</div>
                              {tx.email && <div className="text-xs text-muted-foreground">{tx.email}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {tx.currency} {tx.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={tx.status === 'succeeded' ? 'default' : 'secondary'}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(tx.created).toLocaleDateString('de-DE')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ============== HEATMAPS TAB ============== */}
        <TabsContent value="heatmaps" className="space-y-6">
          {/* Heatmap Info Card */}
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-500/20">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle>Heatmaps & Klick-Analyse</CardTitle>
                    <CardDescription>
                      Analysiere Nutzerinteraktionen und finde UX-Probleme
                    </CardDescription>
                  </div>
                </div>
                {heatmapConfig && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(heatmapConfig.heatmapUrl, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      PostHog Heatmaps
                    </Button>
                    <Button
                      onClick={() => window.open(heatmapConfig.toolbarUrl, '_blank')}
                    >
                      <Layers className="mr-2 h-4 w-4" />
                      Toolbar starten
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Click Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  Meistgeklickte Elemente
                </CardTitle>
                <CardDescription>Top Klick-Interaktionen</CardDescription>
              </CardHeader>
              <CardContent>
                {clickData.length > 0 ? (
                  <div className="space-y-3">
                    {clickData.slice(0, 10).map((item, index) => {
                      const maxClicks = clickData[0]?.clicks || 1
                      return (
                        <div key={item.element} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="truncate max-w-[250px]" title={item.element}>
                              {item.element || '(Kein Text)'}
                            </span>
                            <span className="font-medium">{item.clicks.toLocaleString('de-DE')}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${(item.clicks / maxClicks) * 100}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <MousePointerClick className="h-12 w-12 opacity-50" />
                    <p>Keine Klick-Daten verfügbar</p>
                    <p className="text-xs">Aktiviere Autocapture in PostHog</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rage Clicks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Rage Clicks
                </CardTitle>
                <CardDescription>Seiten mit frustrierten Klicks (schnelle Wiederholungen)</CardDescription>
              </CardHeader>
              <CardContent>
                {rageClicks.length > 0 ? (
                  <div className="space-y-3">
                    {rageClicks.map((item) => (
                      <div key={item.url} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="truncate max-w-[250px]">
                          <span className="text-sm">{(() => { try { return new URL(item.url).pathname } catch { return item.url } })()}</span>
                        </div>
                        <Badge variant="destructive">{item.count} Rage Clicks</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <CheckCircle2 className="h-12 w-12 text-green-500 opacity-50" />
                    <p>Keine Rage Clicks gefunden</p>
                    <p className="text-xs text-green-600">Super! Nutzer sind nicht frustriert</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Interaction Types */}
          <Card>
            <CardHeader>
              <CardTitle>Interaktionstypen</CardTitle>
              <CardDescription>Verteilung der Nutzer-Interaktionen</CardDescription>
            </CardHeader>
            <CardContent>
              {interactionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={interactionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Keine Interaktionsdaten verfügbar
                </div>
              )}
            </CardContent>
          </Card>

          {/* PostHog Toolbar Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>So nutzt du Heatmaps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>1</Badge>
                    <span className="font-medium">Toolbar starten</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Klicke auf &quot;Toolbar starten&quot; um die PostHog Toolbar auf deiner Live-Seite zu öffnen.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>2</Badge>
                    <span className="font-medium">Heatmap aktivieren</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wähle &quot;Heatmap&quot; in der Toolbar aus und sieh wo Nutzer klicken.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>3</Badge>
                    <span className="font-medium">Probleme finden</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Identifiziere tote Klickzonen und frustrierte Nutzer für UX-Verbesserungen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
