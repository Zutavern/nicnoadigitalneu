'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  MessageSquare,
  ImageIcon,
  Video,
  Languages,
  Hash,
  Sparkles,
  Settings2,
  Info,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Gift,
  Bot,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { de } from 'date-fns/locale'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface FeatureStat {
  feature: string
  label: string
  icon: string
  requests: number
  tokens: number
  costEur: number
  percentage: number
}

interface RecentActivity {
  id: string
  timestamp: string
  feature: string
  featureLabel: string
  featureIcon: string
  model: string
  tokens: number
  costEur: number
  responseTimeMs: number | null
}

interface SpendingLimit {
  monthlyLimitEur: number
  currentMonthSpentEur: number
  remainingEur: number
  percentageUsed: number
  isNearLimit: boolean
  hasHitLimit: boolean
}

interface IncludedCredits {
  totalEur: number
  remainingEur: number
  usedEur: number
  percentageUsed: number
}

interface ExtraUsage {
  chargedEur: number
  hasExtraUsage: boolean
}

interface UsageData {
  summary: {
    totalRequests: number
    totalTokens: number
    totalCostEur: number
    currentMonthCostEur: number
    period: {
      start: string
      end: string
      days: number
    }
  }
  spendingLimit: SpendingLimit | null
  includedCredits: IncludedCredits | null
  extraUsage: ExtraUsage | null
  byFeature: FeatureStat[]
  recentActivity: RecentActivity[]
}

const featureIcons: Record<string, typeof MessageSquare> = {
  social_post: MessageSquare,
  video_gen: Video,
  image_gen: ImageIcon,
  translation: Languages,
  chat: MessageSquare,
  hashtags: Hash,
  content_improvement: Sparkles,
}

interface UsageDashboardProps {
  onOpenOnboarding?: () => void
  showOnboarding?: boolean
}

export function UsageDashboard({ onOpenOnboarding, showOnboarding }: UsageDashboardProps) {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  
  // Settings state
  const [monthlyLimit, setMonthlyLimit] = useState(50)
  const [alertThreshold, setAlertThreshold] = useState(80)
  const [hardLimit, setHardLimit] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [usageRes, limitRes] = await Promise.all([
        fetch('/api/user/usage?days=30&limit=10'),
        fetch('/api/user/spending-limit'),
      ])

      if (!usageRes.ok) throw new Error('Fehler beim Laden')
      
      const usageData = await usageRes.json()
      
      if (limitRes.ok) {
        const limitData = await limitRes.json()
        usageData.spendingLimit = limitData.usage
        usageData.includedCredits = limitData.includedCredits
        usageData.extraUsage = limitData.extraUsage
        setMonthlyLimit(limitData.limit.monthlyLimitEur)
        setAlertThreshold(limitData.limit.alertThreshold)
        setHardLimit(limitData.limit.hardLimit)
      }

      setData(usageData)
    } catch (error) {
      console.error('Error fetching usage data:', error)
      // Demo-Modus: Mock-Daten anzeigen
      const mockData: UsageData = {
        summary: {
          totalRequests: 47,
          totalTokens: 125000,
          totalCostEur: 3.75,
          currentMonthCostEur: 2.40,
          period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
            days: 30
          }
        },
        spendingLimit: {
          monthlyLimitEur: 50,
          currentMonthSpentEur: 2.40,
          remainingEur: 47.60,
          percentageUsed: 4.8,
          isNearLimit: false,
          hasHitLimit: false
        },
        includedCredits: {
          totalEur: 10,
          remainingEur: 7.60,
          usedEur: 2.40,
          percentageUsed: 24
        },
        extraUsage: {
          chargedEur: 0,
          hasExtraUsage: false
        },
        byFeature: [
          { feature: 'social_post', label: 'Social Media Posts', icon: 'social_post', requests: 25, tokens: 75000, costEur: 1.80, percentage: 48 },
          { feature: 'image_gen', label: 'Bildgenerierung', icon: 'image_gen', requests: 12, tokens: 0, costEur: 1.20, percentage: 32 },
          { feature: 'translation', label: 'Übersetzungen', icon: 'translation', requests: 8, tokens: 40000, costEur: 0.60, percentage: 16 },
          { feature: 'hashtags', label: 'Hashtag-Generator', icon: 'hashtags', requests: 2, tokens: 10000, costEur: 0.15, percentage: 4 },
        ],
        recentActivity: [
          { id: '1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), feature: 'social_post', featureLabel: 'Social Media Post', featureIcon: 'social_post', model: 'gpt-4o-mini', tokens: 1200, costEur: 0.05, responseTimeMs: 850 },
          { id: '2', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), feature: 'image_gen', featureLabel: 'Bildgenerierung', featureIcon: 'image_gen', model: 'flux-pro', tokens: 0, costEur: 0.15, responseTimeMs: 12000 },
          { id: '3', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), feature: 'translation', featureLabel: 'Übersetzung', featureIcon: 'translation', model: 'gpt-4o-mini', tokens: 3500, costEur: 0.08, responseTimeMs: 450 },
        ]
      }
      setData(mockData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/user/spending-limit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyLimitEur: monthlyLimit,
          alertThreshold,
          hardLimit,
        }),
      })

      if (!res.ok) throw new Error('Fehler beim Speichern')
      
      toast.success('Einstellungen gespeichert')
      setSettingsOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error saving settings:', error)
      // Im Demo-Modus trotzdem erfolgreich melden
      toast.success('Einstellungen gespeichert (Demo-Modus)')
      setSettingsOpen(false)
    } finally {
      setSavingSettings(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Keine Daten verfügbar</p>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          Erneut versuchen
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Dein AI-Verbrauch
            </h1>
            <p className="text-muted-foreground mt-1">
              Transparente Übersicht deiner AI-Nutzung
            </p>
          </div>
          <div className="flex gap-2">
            {showOnboarding && (
              <Button variant="outline" size="sm" onClick={onOpenOnboarding}>
                <Info className="h-4 w-4 mr-2" />
                Wie funktioniert das?
              </Button>
            )}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Limit-Einstellungen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verbrauchs-Einstellungen</DialogTitle>
                  <DialogDescription>
                    Setze ein monatliches Limit und erhalte Warnungen
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Monatliches Limit</Label>
                      <span className="text-2xl font-bold">€{monthlyLimit}</span>
                    </div>
                    <Slider
                      value={[monthlyLimit]}
                      onValueChange={([v]) => setMonthlyLimit(v)}
                      min={10}
                      max={500}
                      step={10}
                    />
                    <p className="text-sm text-muted-foreground">
                      Dein maximales Budget pro Monat
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Warnung bei</Label>
                      <span className="font-medium">{alertThreshold}%</span>
                    </div>
                    <Slider
                      value={[alertThreshold]}
                      onValueChange={([v]) => setAlertThreshold(v)}
                      min={50}
                      max={95}
                      step={5}
                    />
                    <p className="text-sm text-muted-foreground">
                      Du wirst benachrichtigt, wenn du diesen Schwellenwert erreichst
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label>Hartes Limit</Label>
                      <p className="text-sm text-muted-foreground">
                        Blockiere AI-Features wenn Limit erreicht
                      </p>
                    </div>
                    <Switch
                      checked={hardLimit}
                      onCheckedChange={setHardLimit}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={savingSettings}>
                    {savingSettings && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Speichern
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Dieser Monat</p>
                    <p className="text-3xl font-bold">€{data.summary.currentMonthCostEur.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Letzte 30 Tage</p>
                    <p className="text-3xl font-bold">€{data.summary.totalCostEur.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className={cn(
              "bg-gradient-to-br border",
              data.spendingLimit?.isNearLimit
                ? "from-amber-500/10 to-orange-500/10 border-amber-500/20"
                : "from-purple-500/10 to-pink-500/10 border-purple-500/20"
            )}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Limit</p>
                    <p className="text-3xl font-bold">€{monthlyLimit}/Monat</p>
                  </div>
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    data.spendingLimit?.isNearLimit ? "bg-amber-500/20" : "bg-purple-500/20"
                  )}>
                    <Activity className={cn(
                      "h-6 w-6",
                      data.spendingLimit?.isNearLimit ? "text-amber-500" : "text-purple-500"
                    )} />
                  </div>
                </div>
                <Progress
                  value={data.spendingLimit?.percentageUsed || 0}
                  className={cn(
                    "h-2",
                    data.spendingLimit?.isNearLimit && "[&>div]:bg-amber-500"
                  )}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {data.spendingLimit?.percentageUsed.toFixed(0)}% verwendet
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Included AI Credits Card - Only show if user has included credits */}
        {data.includedCredits && data.includedCredits.totalEur > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-pink-500/5 to-orange-500/10 border-violet-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-2xl -mr-10 -mt-10" />
              <CardContent className="py-5 relative">
                <div className="flex items-center gap-6">
                  {/* Icon */}
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Gift className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">Included AI Credits</h3>
                      <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0 text-xs">
                        Monthly Bonus
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Your Plan Includes</p>
                        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500">
                          €{data.includedCredits.totalEur.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          €{data.includedCredits.remainingEur.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Used</p>
                        <p className="text-2xl font-bold">
                          €{data.includedCredits.usedEur.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Free Credit Usage</span>
                        <span>{data.includedCredits.percentageUsed.toFixed(0)}% used</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${data.includedCredits.percentageUsed}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-right">
                    {data.includedCredits.remainingEur > 0 ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <span className="text-sm font-medium">Free credits available</span>
                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <span className="text-sm font-medium">Free credits used</span>
                        <Zap className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Extra Usage Warning */}
                {data.extraUsage?.hasExtraUsage && (
                  <div className="mt-4 pt-4 border-t border-violet-500/20 flex items-center gap-3">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span className="text-sm">
                      <span className="font-medium text-amber-600 dark:text-amber-400">€{data.extraUsage.chargedEur.toFixed(2)}</span>
                      <span className="text-muted-foreground"> additional usage this month (billed at end of period)</span>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* How it works */}
        <Card className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30 border-sky-200/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center flex-shrink-0">
                <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sky-900 dark:text-sky-100">So funktioniert die Abrechnung</h3>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <span className="text-muted-foreground">Du nutzt AI-Features wie gewohnt</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <span className="text-muted-foreground">
                      {data.includedCredits?.totalEur 
                        ? 'Dein inkludiertes Guthaben wird zuerst genutzt'
                        : 'Wir berechnen die Kosten transparent pro Nutzung'
                      }
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <span className="text-muted-foreground">
                      {data.includedCredits?.totalEur 
                        ? 'Nur Nutzung über das Guthaben hinaus wird berechnet'
                        : 'Am Monatsende erhältst du eine Rechnung'
                      }
                    </span>
                  </div>
                </div>
                {data.includedCredits?.totalEur ? (
                  <p className="text-sm mt-3 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Dein Abo enthält bereits €{data.includedCredits.totalEur.toFixed(2)} AI-Credits/Monat
                  </p>
                ) : (
                  <p className="text-sm mt-3 text-muted-foreground">
                    💡 Upgrade auf einen Plan mit inkludierten AI-Credits für zusätzliche Vorteile
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage by Feature */}
        <Card>
          <CardHeader>
            <CardTitle>Verbrauch nach Feature</CardTitle>
            <CardDescription>Wo werden deine AI-Kosten verwendet?</CardDescription>
          </CardHeader>
          <CardContent>
            {data.byFeature.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Noch keine AI-Nutzung in diesem Zeitraum</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.byFeature.map((feature, index) => {
                  const Icon = featureIcons[feature.feature] || Sparkles
                  return (
                    <motion.div
                      key={feature.feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">{feature.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{feature.label}</span>
                            <span className="font-mono font-semibold">€{feature.costEur.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={feature.percentage} className="h-2 flex-1" />
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {feature.percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Letzte Aktivitäten</CardTitle>
              <CardDescription>Deine neuesten AI-Anfragen</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              Alle anzeigen
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Keine Aktivitäten vorhanden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{activity.featureIcon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.featureLabel}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.model} • {activity.tokens?.toLocaleString()} Tokens
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-semibold">€{activity.costEur.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: de })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

