'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Activity,
  MessageSquare,
  ImageIcon,
  Video,
  Languages,
  Hash,
  Sparkles,
  Settings2,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Gift,
  Zap,
  Check,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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

// Feature Konfiguration - lesbare Labels und Icons
const featureConfig: Record<string, { label: string; icon: typeof MessageSquare; color: string; bgColor: string }> = {
  social_post: { 
    label: 'Social Media', 
    icon: MessageSquare, 
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  },
  video_gen: { 
    label: 'Videos', 
    icon: Video, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  image_gen: { 
    label: 'Bilder', 
    icon: ImageIcon, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  translation: { 
    label: 'Übersetzungen', 
    icon: Languages, 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  chat: { 
    label: 'Chat', 
    icon: MessageSquare, 
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10'
  },
  hashtags: { 
    label: 'Hashtags', 
    icon: Hash, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  content_improvement: { 
    label: 'Verbesserungen', 
    icon: Sparkles, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
}

interface UsageDashboardProps {
  onOpenOnboarding?: () => void
  showOnboarding?: boolean
}

export function UsageDashboard({ onOpenOnboarding, showOnboarding }: UsageDashboardProps) {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
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
      
      if (usageData.isDemo) {
        throw new Error('Demo-Modus')
      }
      
      if (limitRes.ok) {
        const limitData = await limitRes.json()
        usageData.spendingLimit = limitData.usage
        usageData.includedCredits = limitData.includedCredits
        usageData.extraUsage = limitData.extraUsage
        setMonthlyLimit(limitData.limit?.monthlyLimitEur || 50)
        setAlertThreshold(limitData.limit?.alertThreshold || 80)
        setHardLimit(limitData.limit?.hardLimit || false)
      }

      setData(usageData)
    } catch {
      // Demo-Daten
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
    } catch {
      toast.success('Einstellungen gespeichert (Demo)')
      setSettingsOpen(false)
    } finally {
      setSavingSettings(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 max-w-3xl mx-auto">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Keine Daten verfügbar</p>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          Erneut versuchen
        </Button>
      </div>
    )
  }

  const hasIncludedCredits = data.includedCredits && data.includedCredits.totalEur > 0
  const creditsRemaining = data.includedCredits?.remainingEur || 0
  const creditsUsed = data.includedCredits?.usedEur || 0
  const creditsTotal = data.includedCredits?.totalEur || 0

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dein AI-Guthaben</h1>
          <p className="text-muted-foreground text-sm">
            Alles auf einen Blick
          </p>
        </div>
        <div className="flex gap-2">
          {showOnboarding && (
            <Button variant="ghost" size="sm" onClick={onOpenOnboarding}>
              <Info className="h-4 w-4" />
            </Button>
          )}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Einstellungen</DialogTitle>
                <DialogDescription>
                  Setze dein monatliches Limit
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
                    max={200}
                    step={10}
                  />
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
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Stopp bei Limit</Label>
                    <p className="text-sm text-muted-foreground">
                      AI-Features pausieren
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

      {/* Hauptkarte - Guthaben */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600">
          <CardContent className="p-6 text-white">
            {/* Guthaben Anzeige */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 text-sm mb-4">
                <Gift className="h-4 w-4" />
                {hasIncludedCredits ? 'Inklusiv-Guthaben' : 'Verbrauch'}
              </div>
              
              {hasIncludedCredits ? (
                <>
                  <div className="text-6xl font-bold mb-2">
                    €{creditsRemaining.toFixed(2)}
                  </div>
                  <p className="text-white/80">
                    von €{creditsTotal.toFixed(2)} übrig
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl font-bold mb-2">
                    €{data.summary.currentMonthCostEur.toFixed(2)}
                  </div>
                  <p className="text-white/80">
                    diesen Monat verbraucht
                  </p>
                </>
              )}
            </div>

            {/* Fortschrittsbalken */}
            {hasIncludedCredits && (
              <div className="mb-6">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - (data.includedCredits?.percentageUsed || 0)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <div className="flex justify-between text-sm text-white/70 mt-2">
                  <span>€{creditsUsed.toFixed(2)} verbraucht</span>
                  <span>{(100 - (data.includedCredits?.percentageUsed || 0)).toFixed(0)}% übrig</span>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex justify-center">
              {creditsRemaining > 0 ? (
                <div className="flex items-center gap-2 bg-emerald-500/30 rounded-full px-4 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-medium">Guthaben verfügbar</span>
                </div>
              ) : hasIncludedCredits ? (
                <div className="flex items-center gap-2 bg-amber-500/30 rounded-full px-4 py-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium">Guthaben aufgebraucht</span>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info-Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                  So funktioniert&apos;s
                </p>
                <p className="text-emerald-700 dark:text-emerald-300 mt-1">
                  {hasIncludedCredits 
                    ? `Jeden Monat bekommst du €${creditsTotal.toFixed(0)} AI-Guthaben geschenkt. Erst wenn das aufgebraucht ist, zahlst du extra.`
                    : 'Du zahlst nur für das, was du nutzt. Transparent und fair.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Übersicht - aufklappbar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Wofür nutzt du AI?</p>
                    <p className="text-sm text-muted-foreground">
                      {data.byFeature.length} Features aktiv
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  detailsOpen && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3">
                {data.byFeature.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Noch keine AI-Nutzung
                  </p>
                ) : (
                  data.byFeature.map((feature, index) => {
                    const config = featureConfig[feature.feature] || {
                      label: feature.label,
                      icon: Sparkles,
                      color: 'text-gray-500',
                      bgColor: 'bg-gray-500/10'
                    }
                    const Icon = config.icon
                    
                    return (
                      <motion.div
                        key={feature.feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          config.bgColor
                        )}>
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{config.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {feature.requests}x genutzt
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">€{feature.costEur.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {feature.percentage.toFixed(0)}%
                          </p>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* Letzte Aktivitäten - aufklappbar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Collapsible open={activityOpen} onOpenChange={setActivityOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Letzte Aktivitäten</p>
                    <p className="text-sm text-muted-foreground">
                      Deine letzten AI-Anfragen
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  activityOpen && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-2">
                {data.recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Noch keine Aktivitäten
                  </p>
                ) : (
                  data.recentActivity.map((activity, index) => {
                    const config = featureConfig[activity.feature] || {
                      label: activity.featureLabel,
                      icon: Sparkles,
                      color: 'text-gray-500',
                      bgColor: 'bg-gray-500/10'
                    }
                    const Icon = config.icon
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          config.bgColor
                        )}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: de })}
                          </p>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          €{activity.costEur.toFixed(2)}
                        </Badge>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* Quick Stats - kompakt am Ende */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{data.summary.totalRequests}</p>
          <p className="text-xs text-muted-foreground">Anfragen</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">€{data.summary.totalCostEur.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">30 Tage</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">€{monthlyLimit}</p>
          <p className="text-xs text-muted-foreground">Limit/Monat</p>
        </Card>
      </motion.div>
    </div>
  )
}
