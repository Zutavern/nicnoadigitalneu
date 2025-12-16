'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  RefreshCw,
  MessageSquare,
  ImageIcon,
  Video,
  Languages,
  Hash,
  Sparkles,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Bot,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Types
interface StatsData {
  todayRequests: number
  todayRequestsTrend: number
  todayCostEur: number
  activeUsers24h: number
  topFeature: { name: string; count: number }
}

interface DailyUsage {
  date: string
  requests: number
  costEur: number
}

interface TopUser {
  user: { id: string; name: string | null; email: string; role: string }
  totalCostEur: number
  requestCount: number
}

interface FeatureStat {
  feature: string
  label: string
  requests: number
  costEur: number
  avgCost: number
  topModels: string[]
}

interface AnalyticsData {
  stats: StatsData
  dailyUsage: DailyUsage[]
  topUsers: TopUser[]
  byFeature: FeatureStat[]
  period: { days: number; start: string; end: string }
}

interface LiveActivity {
  id: string
  timestamp: string
  feature: string
  featureLabel: string
  featureColor: string
  model: string
  provider: string
  tokens: number
  costEur: number
  responseTimeMs: number | null
  user: { name: string; email: string }
}

// Feature Icons & Colors
const featureConfig: Record<string, { icon: typeof MessageSquare; color: string; bg: string }> = {
  social_post: { icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  video_gen: { icon: Video, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  image_gen: { icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  translation: { icon: Languages, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  chat: { icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  hashtags: { icon: Hash, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  content_improvement: { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  other: { icon: Bot, color: 'text-gray-500', bg: 'bg-gray-500/10' },
}

export default function AdminAIAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [liveData, setLiveData] = useState<LiveActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [liveLoading, setLiveLoading] = useState(false)
  const [period, setPeriod] = useState('30')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch Analytics Data
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/ai-analytics?days=${period}`)
      if (!res.ok) throw new Error('Fehler beim Laden')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Analytics fetch error:', error)
      // Demo-Daten
      setData({
        stats: {
          todayRequests: 127,
          todayRequestsTrend: 15,
          todayCostEur: 3.45,
          activeUsers24h: 23,
          topFeature: { name: 'Social Media', count: 45 },
        },
        dailyUsage: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          requests: Math.floor(Math.random() * 100) + 50,
          costEur: Math.random() * 5 + 1,
        })),
        topUsers: [
          { user: { id: '1', name: 'Max Mustermann', email: 'max@salon.de', role: 'SALON_OWNER' }, totalCostEur: 12.50, requestCount: 156 },
          { user: { id: '2', name: 'Anna Schmidt', email: 'anna@style.de', role: 'STYLIST' }, totalCostEur: 8.30, requestCount: 89 },
          { user: { id: '3', name: 'Lisa Weber', email: 'lisa@hair.de', role: 'STYLIST' }, totalCostEur: 5.20, requestCount: 67 },
        ],
        byFeature: [
          { feature: 'social_post', label: 'Social Media', requests: 450, costEur: 15.30, avgCost: 0.034, topModels: ['gpt-4o-mini'] },
          { feature: 'image_gen', label: 'Bilder', requests: 120, costEur: 8.50, avgCost: 0.071, topModels: ['flux-pro'] },
          { feature: 'translation', label: 'Übersetzungen', requests: 89, costEur: 2.10, avgCost: 0.024, topModels: ['gpt-4o-mini'] },
        ],
        period: { days: 30, start: '', end: '' },
      })
    } finally {
      setLoading(false)
    }
  }, [period])

  // Fetch Live Data
  const fetchLive = useCallback(async () => {
    setLiveLoading(true)
    try {
      const res = await fetch('/api/admin/ai-analytics/live?limit=20')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const json = await res.json()
      setLiveData(json.activities || [])
    } catch (error) {
      console.error('Live fetch error:', error)
      // Demo Live Data
      setLiveData([
        { id: '1', timestamp: new Date().toISOString(), feature: 'social_post', featureLabel: 'Social Media', featureColor: 'pink', model: 'gpt-4o-mini', provider: 'openrouter', tokens: 1200, costEur: 0.05, responseTimeMs: 850, user: { name: 'Max M.', email: 'max@salon.de' } },
        { id: '2', timestamp: new Date(Date.now() - 60000).toISOString(), feature: 'image_gen', featureLabel: 'Bilder', featureColor: 'blue', model: 'flux-pro', provider: 'replicate', tokens: 0, costEur: 0.15, responseTimeMs: 12000, user: { name: 'Anna S.', email: 'anna@style.de' } },
        { id: '3', timestamp: new Date(Date.now() - 120000).toISOString(), feature: 'hashtags', featureLabel: 'Hashtags', featureColor: 'orange', model: 'gpt-4o-mini', provider: 'openrouter', tokens: 500, costEur: 0.02, responseTimeMs: 450, user: { name: 'Lisa W.', email: 'lisa@hair.de' } },
      ])
    } finally {
      setLiveLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
    fetchLive()
  }, [fetchAnalytics, fetchLive])

  // Auto-Refresh Live Feed
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchLive, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchLive])

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data }: { data: DailyUsage[] }) => {
    const maxRequests = Math.max(...data.map(d => d.requests), 1)
    return (
      <div className="flex items-end gap-1 h-32">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full bg-gradient-to-t from-violet-500 to-pink-500 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${(d.requests / maxRequests) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            />
            <span className="text-[10px] text-muted-foreground">
              {new Date(d.date).toLocaleDateString('de-DE', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!data) return null

  const totalRequests = data.byFeature.reduce((sum, f) => sum + f.requests, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            AI Analytics
          </h1>
          <p className="text-muted-foreground">
            Übersicht aller AI-Aktivitäten im System
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Letzte 7 Tage</SelectItem>
              <SelectItem value="30">Letzte 30 Tage</SelectItem>
              <SelectItem value="90">Letzte 90 Tage</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { fetchAnalytics(); fetchLive(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Requests Today */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full -mr-10 -mt-10" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Requests heute</p>
                  <p className="text-3xl font-bold">{data.stats.todayRequests.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-violet-500" />
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                data.stats.todayRequestsTrend >= 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {data.stats.todayRequestsTrend >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {Math.abs(data.stats.todayRequestsTrend)}% vs. gestern
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Costs Today */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full -mr-10 -mt-10" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kosten heute</p>
                  <p className="text-3xl font-bold">€{data.stats.todayCostEur.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                ~€{(data.stats.todayCostEur / Math.max(data.stats.todayRequests, 1) * 1000).toFixed(1)}/1k Requests
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -mr-10 -mt-10" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktive Nutzer</p>
                  <p className="text-3xl font-bold">{data.stats.activeUsers24h}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                in den letzten 24h
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Feature */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full -mr-10 -mt-10" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Feature</p>
                  <p className="text-2xl font-bold">{data.stats.topFeature.name}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-pink-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {data.stats.topFeature.count} Requests heute
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Charts & Features */}
        <div className="col-span-2 space-y-6">
          {/* Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nutzungsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              {data.dailyUsage.length > 0 ? (
                <SimpleBarChart data={data.dailyUsage.slice(-7)} />
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Keine Daten vorhanden
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feature Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feature-Übersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.byFeature.map((feature, index) => {
                const config = featureConfig[feature.feature] || featureConfig.other
                const Icon = config.icon
                const percentage = totalRequests > 0 ? (feature.requests / totalRequests) * 100 : 0

                return (
                  <motion.div
                    key={feature.feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.bg)}>
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div>
                          <p className="font-medium">{feature.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {feature.topModels[0] || 'Diverse Modelle'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{feature.costEur.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{feature.requests.toLocaleString()} Requests</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Top Users & Live Feed */}
        <div className="space-y-6">
          {/* Top Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Top Nutzer</CardTitle>
              <Badge variant="secondary">Monat</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.topUsers.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item.user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                    index === 0 ? "bg-amber-500/20 text-amber-600" :
                    index === 1 ? "bg-slate-300/30 text-slate-600" :
                    index === 2 ? "bg-orange-500/20 text-orange-600" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.user.name || 'Unbekannt'}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.requestCount} Requests
                    </p>
                  </div>
                  <p className="font-bold text-emerald-600">€{item.totalCostEur.toFixed(2)}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Live Feed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                )} />
                Live Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Pause' : 'Start'}
              </Button>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="popLayout">
                {liveData.slice(0, 8).map((activity, index) => {
                  const config = featureConfig[activity.feature] || featureConfig.other
                  const Icon = config.icon

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-3 py-2 border-b last:border-0"
                    >
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", config.bg)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.user.name}</p>
                        <p className="text-xs text-muted-foreground">{activity.featureLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono">€{activity.costEur.toFixed(4)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: de })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {liveData.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Keine Aktivitäten</p>
                </div>
              )}

              {liveLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
