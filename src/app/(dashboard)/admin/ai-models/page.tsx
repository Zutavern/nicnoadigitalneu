'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  ImageIcon,
  Video,
  Settings2,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Search,
  MoreVertical,
  Check,
  X,
  Percent,
  Sparkles,
  Zap,
  Code,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface AIModel {
  id: string
  provider: 'OPENROUTER' | 'REPLICATE'
  modelId: string
  modelKey: string
  name: string
  description: string | null
  category: 'TEXT' | 'IMAGE' | 'VIDEO'
  subcategory: string | null
  costPerInputToken: number | null
  costPerOutputToken: number | null
  costPerRun: number | null
  marginPercent: number
  pricePerInputToken: number | null
  pricePerOutputToken: number | null
  pricePerRun: number | null
  avgDurationMs: number | null
  isFree: boolean
  isActive: boolean
  sortOrder: number
  stats: {
    totalRequests: number
    totalTokens: number
    totalCostUsd: number
    totalRevenueUsd: number
    profit: number
  } | null
}

interface Stats {
  totalModels: number
  activeModels: number
  byCategory: {
    text: number
    image: number
    video: number
  }
  totalProfit: number
  totalRequests: number
}

const categoryIcons = {
  TEXT: MessageSquare,
  IMAGE: ImageIcon,
  VIDEO: Video,
}

const subcategoryConfig: Record<string, { label: string; icon: typeof Sparkles; color: string }> = {
  recommended: { label: 'Empfohlen', icon: Sparkles, color: 'text-yellow-500' },
  pro: { label: 'Pro', icon: TrendingUp, color: 'text-purple-500' },
  reasoning: { label: 'Reasoning', icon: Brain, color: 'text-blue-500' },
  fast: { label: 'Schnell', icon: Zap, color: 'text-green-500' },
  coding: { label: 'Coding', icon: Code, color: 'text-orange-500' },
}

export default function AIModelsPage() {
  const [models, setModels] = useState<AIModel[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'video'>('text')
  const [bulkMarginOpen, setBulkMarginOpen] = useState(false)
  const [bulkMargin, setBulkMargin] = useState(40)
  const [editingModel, setEditingModel] = useState<AIModel | null>(null)
  const [editMargin, setEditMargin] = useState(40)

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ai-models?includeStats=true&days=30')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setModels(data.models)
      setStats(data.stats)
    } catch (error) {
      toast.error('Modelle konnten nicht geladen werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/ai-models/sync', { method: 'POST' })
      if (!res.ok) throw new Error('Sync fehlgeschlagen')
      const data = await res.json()
      toast.success(data.message)
      fetchModels()
    } catch (error) {
      toast.error('Synchronisation fehlgeschlagen')
      console.error(error)
    } finally {
      setSyncing(false)
    }
  }

  const handleBulkMargin = async () => {
    try {
      const res = await fetch('/api/admin/ai-models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk-margin',
          category: activeTab.toUpperCase(),
          marginPercent: bulkMargin,
        }),
      })
      if (!res.ok) throw new Error('Update fehlgeschlagen')
      const data = await res.json()
      toast.success(data.message)
      setBulkMarginOpen(false)
      fetchModels()
    } catch (error) {
      toast.error('Bulk-Update fehlgeschlagen')
      console.error(error)
    }
  }

  const handleUpdateModel = async (id: string, updates: Partial<AIModel>) => {
    try {
      const res = await fetch(`/api/admin/ai-models/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Update fehlgeschlagen')
      const data = await res.json()
      toast.success(data.message)
      setEditingModel(null)
      fetchModels()
    } catch (error) {
      toast.error('Aktualisierung fehlgeschlagen')
      console.error(error)
    }
  }

  const handleToggleActive = async (model: AIModel) => {
    await handleUpdateModel(model.id, { isActive: !model.isActive })
  }

  const filteredModels = models.filter(model => {
    const matchesSearch = searchQuery === '' ||
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.modelId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = model.category === activeTab.toUpperCase()
    return matchesSearch && matchesCategory
  })

  // Gruppiere nach Subcategory
  const groupedModels = filteredModels.reduce((acc, model) => {
    const key = model.subcategory || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(model)
    return acc
  }, {} as Record<string, AIModel[]>)

  const formatPrice = (value: number | null, isPerRun = false) => {
    if (value === null) return '-'
    if (isPerRun) return `$${value.toFixed(4)}`
    return `$${value.toFixed(2)}/1M`
  }

  const formatProfit = (value: number) => {
    return `€${value.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Modelle
            </h1>
            <p className="text-muted-foreground mt-1">
              Verwalte Modelle, Margen und Preise für alle AI-Features
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSync} disabled={syncing}>
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Modelle synchronisieren
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Aktive Modelle</p>
                      <p className="text-2xl font-bold">{stats.activeModels} / {stats.totalModels}</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Anfragen (30d)</p>
                      <p className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gewinn (30d)</p>
                      <p className="text-2xl font-bold">{formatProfit(stats.totalProfit)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Nach Kategorie</p>
                      <p className="text-sm">
                        <span className="font-medium">{stats.byCategory.text}</span> Text · 
                        <span className="font-medium"> {stats.byCategory.image}</span> Bild · 
                        <span className="font-medium"> {stats.byCategory.video}</span> Video
                      </p>
                    </div>
                    <Settings2 className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Main Content */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList>
                  <TabsTrigger value="text" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Text ({stats?.byCategory.text || 0})
                  </TabsTrigger>
                  <TabsTrigger value="image" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Bilder ({stats?.byCategory.image || 0})
                  </TabsTrigger>
                  <TabsTrigger value="video" className="gap-2">
                    <Video className="h-4 w-4" />
                    Video ({stats?.byCategory.video || 0})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Modell suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" onClick={() => setBulkMarginOpen(true)}>
                  <Percent className="h-4 w-4 mr-2" />
                  Alle Margen anpassen
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedModels).map(([subcategory, models]) => {
                const config = subcategoryConfig[subcategory] || { label: 'Weitere', icon: Brain, color: 'text-gray-500' }
                const Icon = config.icon

                return (
                  <Collapsible key={subcategory} defaultOpen>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                      <Icon className={cn('h-4 w-4', config.color)} />
                      <span className="font-medium">{config.label}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {models.length}
                      </Badge>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid gap-3 pt-2">
                        <AnimatePresence>
                          {models.map((model, index) => (
                            <motion.div
                              key={model.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.02 }}
                            >
                              <Card className={cn(
                                'transition-all duration-200',
                                !model.isActive && 'opacity-50'
                              )}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                      {/* Model Info */}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{model.name}</span>
                                          {model.isFree && (
                                            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                                              FREE
                                            </Badge>
                                          )}
                                          {!model.isActive && (
                                            <Badge variant="destructive" className="text-xs">
                                              Deaktiviert
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {model.provider === 'OPENROUTER' ? 'OpenRouter' : 'Replicate'} · {model.modelId}
                                        </p>
                                      </div>

                                      {/* Pricing */}
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground mb-1">Einkauf → Verkauf</p>
                                        {model.category === 'TEXT' ? (
                                          <p className="text-sm font-mono">
                                            {formatPrice(model.costPerInputToken)}/{formatPrice(model.costPerOutputToken)} →{' '}
                                            <span className="text-green-500">
                                              {formatPrice(model.pricePerInputToken)}/{formatPrice(model.pricePerOutputToken)}
                                            </span>
                                          </p>
                                        ) : (
                                          <p className="text-sm font-mono">
                                            {formatPrice(model.costPerRun, true)} →{' '}
                                            <span className="text-green-500">
                                              {formatPrice(model.pricePerRun, true)}
                                            </span>
                                          </p>
                                        )}
                                      </div>

                                      {/* Margin */}
                                      <div className="w-32">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs text-muted-foreground">Marge</span>
                                          <span className="text-sm font-medium">{model.marginPercent}%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                            style={{ width: `${Math.min(model.marginPercent, 100)}%` }}
                                          />
                                        </div>
                                      </div>

                                      {/* Stats */}
                                      {model.stats && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="text-right px-4 border-l">
                                              <p className="text-xs text-muted-foreground">30d Gewinn</p>
                                              <p className="text-sm font-medium text-green-500">
                                                {formatProfit(model.stats.profit)}
                                              </p>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{model.stats.totalRequests.toLocaleString()} Anfragen</p>
                                            <p>Kosten: ${model.stats.totalCostUsd.toFixed(4)}</p>
                                            <p>Umsatz: ${model.stats.totalRevenueUsd.toFixed(4)}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                      <Switch
                                        checked={model.isActive}
                                        onCheckedChange={() => handleToggleActive(model)}
                                      />
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => {
                                            setEditingModel(model)
                                            setEditMargin(model.marginPercent)
                                          }}>
                                            <Percent className="h-4 w-4 mr-2" />
                                            Marge anpassen
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleToggleActive(model)}
                                          >
                                            {model.isActive ? (
                                              <>
                                                <X className="h-4 w-4 mr-2" />
                                                Deaktivieren
                                              </>
                                            ) : (
                                              <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Aktivieren
                                              </>
                                            )}
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}

              {filteredModels.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Modelle gefunden</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Margin Dialog */}
        <Dialog open={bulkMarginOpen} onOpenChange={setBulkMarginOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alle Margen anpassen</DialogTitle>
              <DialogDescription>
                Setze die Marge für alle {activeTab === 'text' ? 'Text' : activeTab === 'image' ? 'Bild' : 'Video'}-Modelle auf einmal.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Neue Marge</Label>
                  <span className="text-2xl font-bold">{bulkMargin}%</span>
                </div>
                <Slider
                  value={[bulkMargin]}
                  onValueChange={([v]) => setBulkMargin(v)}
                  min={0}
                  max={100}
                  step={5}
                />
                <p className="text-sm text-muted-foreground">
                  Beispiel: Bei 40% Marge und $1.00 Kosten → $1.40 Verkaufspreis
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkMarginOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleBulkMargin}>
                <Check className="h-4 w-4 mr-2" />
                Alle anpassen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Model Dialog */}
        <Dialog open={!!editingModel} onOpenChange={(open) => !open && setEditingModel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marge anpassen: {editingModel?.name}</DialogTitle>
              <DialogDescription>
                Passe die Marge für dieses Modell an. Der Verkaufspreis wird automatisch berechnet.
              </DialogDescription>
            </DialogHeader>
            {editingModel && (
              <div className="py-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Marge</Label>
                    <span className="text-2xl font-bold">{editMargin}%</span>
                  </div>
                  <Slider
                    value={[editMargin]}
                    onValueChange={([v]) => setEditMargin(v)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Preisvorschau:</p>
                  {editingModel.category === 'TEXT' ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Input:</span>
                        <span>
                          {formatPrice(editingModel.costPerInputToken)} → 
                          <span className="text-green-500 ml-1">
                            {formatPrice(editingModel.costPerInputToken! * (1 + editMargin / 100))}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Output:</span>
                        <span>
                          {formatPrice(editingModel.costPerOutputToken)} → 
                          <span className="text-green-500 ml-1">
                            {formatPrice(editingModel.costPerOutputToken! * (1 + editMargin / 100))}
                          </span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span>Pro Generierung:</span>
                      <span>
                        {formatPrice(editingModel.costPerRun, true)} → 
                        <span className="text-green-500 ml-1">
                          {formatPrice(editingModel.costPerRun! * (1 + editMargin / 100), true)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingModel(null)}>
                Abbrechen
              </Button>
              <Button onClick={() => editingModel && handleUpdateModel(editingModel.id, { marginPercent: editMargin })}>
                <Check className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

