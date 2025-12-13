'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Map,
  Save,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  GripVertical,
  ChevronRight,
  Monitor,
  Smartphone,
  Search,
  Sparkles,
  Smartphone as SmartphoneIcon,
  Brain,
  Share2,
  Layout,
  Calendar,
  Rocket,
  Target,
  Zap,
  Shield,
  Users,
  BarChart,
  Globe,
  Settings,
  Bell,
  Megaphone,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { SortableList, arrayMove } from '@/components/ui/sortable-list'

// Icon-Mapping für Auswahl
const iconOptions = [
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'smartphone', label: 'Smartphone', icon: SmartphoneIcon },
  { value: 'brain', label: 'Brain (KI)', icon: Brain },
  { value: 'share2', label: 'Share', icon: Share2 },
  { value: 'layout', label: 'Layout', icon: Layout },
  { value: 'calendar', label: 'Kalender', icon: Calendar },
  { value: 'rocket', label: 'Rocket', icon: Rocket },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'barChart', label: 'Chart', icon: BarChart },
  { value: 'globe', label: 'Globe', icon: Globe },
  { value: 'settings', label: 'Settings', icon: Settings },
  { value: 'bell', label: 'Bell', icon: Bell },
  { value: 'megaphone', label: 'Megaphone', icon: Megaphone },
]

const statusOptions = [
  { value: 'Planung', color: 'blue' },
  { value: 'Konzeption', color: 'purple' },
  { value: 'In Entwicklung', color: 'yellow' },
  { value: 'Beta', color: 'orange' },
  { value: 'Abgeschlossen', color: 'green' },
  { value: 'Ideenfindung', color: 'gray' },
]

interface RoadmapConfig {
  id?: string
  heroBadgeText: string | null
  heroTitle: string
  heroTitleHighlight: string | null
  heroDescription: string | null
  timelineSectionTitle: string | null
  timelineSectionDescription: string | null
  showCta: boolean
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  ctaButtonLink: string | null
  showStatusFilter: boolean
  metaTitle: string | null
  metaDescription: string | null
}

interface RoadmapItem {
  id: string
  quarter: string
  title: string
  description: string
  icon: string
  status: string
  statusColor: string | null
  sortOrder: number
  isActive: boolean
}

const defaultConfig: RoadmapConfig = {
  heroBadgeText: 'Roadmap',
  heroTitle: 'Unsere Vision für die Zukunft des Salon-Managements',
  heroTitleHighlight: 'Zukunft des Salon-Managements',
  heroDescription: 'Gemeinsam mit unseren Kunden entwickeln wir die Zukunft der Salon-Coworking-Branche.',
  timelineSectionTitle: 'Geplante Features',
  timelineSectionDescription: null,
  showCta: true,
  ctaTitle: 'Gestalten Sie die Zukunft mit',
  ctaDescription: 'Werden Sie Teil unseres Beta-Programms und helfen Sie uns, die perfekte Lösung für Ihren Salon-Space zu entwickeln.',
  ctaButtonText: 'Beta-Programm anfragen',
  ctaButtonLink: '/beta-programm',
  showStatusFilter: true,
  metaTitle: null,
  metaDescription: null,
}

const emptyItem: Omit<RoadmapItem, 'id' | 'sortOrder'> = {
  quarter: 'Q1 2025',
  title: '',
  description: '',
  icon: 'sparkles',
  status: 'Planung',
  statusColor: null,
  isActive: true,
}

export default function RoadmapCMS() {
  const [config, setConfig] = useState<RoadmapConfig>(defaultConfig)
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('items')
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [hasChanges, setHasChanges] = useState(false)
  
  // Item Dialog State
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<RoadmapItem> | null>(null)
  const [isEditingItem, setIsEditingItem] = useState(false)
  
  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<RoadmapItem | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [configRes, itemsRes] = await Promise.all([
        fetch('/api/admin/roadmap-config'),
        fetch('/api/admin/roadmap-items'),
      ])
      
      if (configRes.ok) {
        const configData = await configRes.json()
        setConfig(configData)
      }
      
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        setItems(itemsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Fehler beim Laden der Daten')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/roadmap-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!res.ok) throw new Error('Fehler beim Speichern')
      
      toast.success('Konfiguration gespeichert!')
      setHasChanges(false)
    } catch (error) {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = <K extends keyof RoadmapConfig>(key: K, value: RoadmapConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Item CRUD
  const openItemDialog = (item?: RoadmapItem) => {
    if (item) {
      setCurrentItem(item)
      setIsEditingItem(true)
    } else {
      setCurrentItem({ ...emptyItem })
      setIsEditingItem(false)
    }
    setItemDialogOpen(true)
  }

  const handleSaveItem = async () => {
    if (!currentItem?.title || !currentItem?.quarter || !currentItem?.description) {
      toast.error('Bitte alle Pflichtfelder ausfüllen')
      return
    }

    try {
      const url = isEditingItem 
        ? `/api/admin/roadmap-items/${currentItem.id}`
        : '/api/admin/roadmap-items'
      
      const res = await fetch(url, {
        method: isEditingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentItem),
      })

      if (!res.ok) throw new Error('Fehler beim Speichern')

      toast.success(isEditingItem ? 'Item aktualisiert!' : 'Item erstellt!')
      setItemDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      const res = await fetch(`/api/admin/roadmap-items/${itemToDelete.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Fehler beim Löschen')

      toast.success('Item gelöscht!')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      fetchData()
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }

  const toggleItemActive = async (item: RoadmapItem) => {
    try {
      const res = await fetch(`/api/admin/roadmap-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isActive: !item.isActive }),
      })

      if (!res.ok) throw new Error('Fehler')
      
      fetchData()
      toast.success(item.isActive ? 'Item deaktiviert' : 'Item aktiviert')
    } catch (error) {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  // Icon Component Helper
  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName)
    return iconOption?.icon || Sparkles
  }

  // Reorder Items
  const handleReorderItems = async (reorderedItems: RoadmapItem[]) => {
    // Optimistisches Update
    setItems(reorderedItems)
    
    try {
      // Reihenfolge an API senden
      const itemsWithOrder = reorderedItems.map((item, index) => ({
        id: item.id,
        sortOrder: index
      }))
      
      const res = await fetch('/api/admin/roadmap-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsWithOrder }),
      })

      if (!res.ok) throw new Error('Fehler beim Speichern der Reihenfolge')
      
      toast.success('Reihenfolge aktualisiert')
    } catch (error) {
      // Bei Fehler: Daten neu laden
      fetchData()
      toast.error('Fehler beim Speichern der Reihenfolge')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Map className="h-8 w-8 text-primary" />
            Roadmap
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Roadmap-Seite und geplante Features
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              Ungespeicherte Änderungen
            </Badge>
          )}
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau'}
          </Button>
          <Button onClick={handleSaveConfig} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Speichern</>
            )}
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="items">
                <Rocket className="mr-2 h-4 w-4" />
                Items
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                Einstellungen
              </TabsTrigger>
              <TabsTrigger value="seo">
                <Search className="mr-2 h-4 w-4" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* Items Tab */}
            <TabsContent value="items" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Roadmap-Items</CardTitle>
                      <CardDescription>
                        Verwalten Sie die geplanten Features und Meilensteine
                      </CardDescription>
                    </div>
                    <Button onClick={() => openItemDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Neues Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Noch keine Roadmap-Items vorhanden</p>
                      <Button variant="outline" className="mt-4" onClick={() => openItemDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Erstes Item erstellen
                      </Button>
                    </div>
                  ) : (
                    <SortableList
                      items={items}
                      onReorder={handleReorderItems}
                      renderItem={(item) => {
                        const IconComponent = getIconComponent(item.icon)
                        return (
                          <div
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                              item.isActive ? 'bg-card' : 'bg-muted/50 opacity-60'
                            }`}
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{item.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {item.quarter}
                                </Badge>
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {item.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={() => toggleItemActive(item)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openItemDialog(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setItemToDelete(item)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hero-Bereich</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge-Text</Label>
                    <Input
                      value={config.heroBadgeText || ''}
                      onChange={(e) => updateConfig('heroBadgeText', e.target.value)}
                      placeholder="z.B. Roadmap"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input
                      value={config.heroTitle}
                      onChange={(e) => updateConfig('heroTitle', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Highlight-Text (farbig)</Label>
                    <Input
                      value={config.heroTitleHighlight || ''}
                      onChange={(e) => updateConfig('heroTitleHighlight', e.target.value)}
                      placeholder="Teil des Titels der hervorgehoben wird"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.heroDescription || ''}
                      onChange={(e) => updateConfig('heroDescription', e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>CTA-Bereich</CardTitle>
                    <Switch
                      checked={config.showCta}
                      onCheckedChange={(v) => updateConfig('showCta', v)}
                    />
                  </div>
                </CardHeader>
                {config.showCta && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Titel</Label>
                      <Input
                        value={config.ctaTitle || ''}
                        onChange={(e) => updateConfig('ctaTitle', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Beschreibung</Label>
                      <Textarea
                        value={config.ctaDescription || ''}
                        onChange={(e) => updateConfig('ctaDescription', e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Button-Text</Label>
                        <Input
                          value={config.ctaButtonText || ''}
                          onChange={(e) => updateConfig('ctaButtonText', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button-Link</Label>
                        <Input
                          value={config.ctaButtonLink || ''}
                          onChange={(e) => updateConfig('ctaButtonLink', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    SEO & Meta-Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Meta-Titel</Label>
                      <span className="text-xs text-muted-foreground">
                        {(config.metaTitle || '').length}/70
                      </span>
                    </div>
                    <Input
                      value={config.metaTitle || ''}
                      onChange={(e) => updateConfig('metaTitle', e.target.value)}
                      placeholder="Roadmap | nicnoa"
                      maxLength={70}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Meta-Beschreibung</Label>
                      <span className="text-xs text-muted-foreground">
                        {(config.metaDescription || '').length}/160
                      </span>
                    </div>
                    <Textarea
                      value={config.metaDescription || ''}
                      onChange={(e) => updateConfig('metaDescription', e.target.value)}
                      placeholder="Entdecken Sie die Zukunft des Salon-Managements..."
                      maxLength={160}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live-Vorschau
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className={`mx-auto transition-all duration-300 ${
                    previewDevice === 'mobile' ? 'max-w-[375px] px-4 pb-4' : 'w-full'
                  }`}
                >
                  {/* Preview Container */}
                  <div className={`border rounded-xl overflow-hidden bg-slate-950 ${
                    previewDevice === 'mobile' ? 'aspect-[9/16]' : 'aspect-[16/10]'
                  }`}>
                    <div className="h-full overflow-y-auto">
                      {/* Hero */}
                      <div className="p-6 text-center">
                        {config.heroBadgeText && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs mb-4">
                            <Sparkles className="h-3 w-3" />
                            {config.heroBadgeText}
                          </span>
                        )}
                        
                        <h1 className={`font-bold text-white leading-tight mb-3 ${
                          previewDevice === 'mobile' ? 'text-lg' : 'text-xl'
                        }`}>
                          {config.heroTitleHighlight ? (
                            <>
                              {config.heroTitle.split(config.heroTitleHighlight)[0]}
                              <span className="text-primary">{config.heroTitleHighlight}</span>
                              {config.heroTitle.split(config.heroTitleHighlight)[1]}
                            </>
                          ) : config.heroTitle}
                        </h1>
                        
                        {config.heroDescription && (
                          <p className="text-slate-400 text-xs max-w-md mx-auto">
                            {config.heroDescription}
                          </p>
                        )}
                      </div>

                      {/* Timeline */}
                      <div className="px-4 pb-4">
                        <div className="relative pl-6">
                          {/* Timeline Line */}
                          <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700" />
                          
                          {/* Items */}
                          <div className="space-y-4">
                            {items.filter(i => i.isActive).slice(0, 4).map((item, idx) => {
                              const IconComponent = getIconComponent(item.icon)
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="relative"
                                >
                                  {/* Timeline Point */}
                                  <div className="absolute -left-4 top-3 w-3 h-3 rounded-full bg-primary border-2 border-slate-950" />
                                  
                                  {/* Card */}
                                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] text-primary font-medium">
                                        {item.quarter}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {item.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                        <IconComponent className="h-3 w-3 text-primary" />
                                      </div>
                                      <span className="text-xs font-medium text-white">
                                        {item.title}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                                      {item.description}
                                    </p>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      {config.showCta && (
                        <div className="border-t border-slate-800 bg-slate-900/50 p-4 text-center">
                          <p className="text-xs font-medium text-white mb-1">
                            {config.ctaTitle}
                          </p>
                          <p className="text-[10px] text-slate-400 mb-3">
                            {config.ctaDescription}
                          </p>
                          <button className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-colors flex items-center gap-1 mx-auto">
                            {config.ctaButtonText}
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground py-3">
                  {items.filter(i => i.isActive).length} von {items.length} Items aktiv
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditingItem ? 'Item bearbeiten' : 'Neues Roadmap-Item'}
            </DialogTitle>
            <DialogDescription>
              Definieren Sie ein Feature oder einen Meilenstein für Ihre Roadmap
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quartal *</Label>
                <Select
                  value={currentItem?.quarter || 'Q1 2025'}
                  onValueChange={(v) => setCurrentItem(prev => ({ ...prev, quarter: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'].map(q => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={currentItem?.status || 'Planung'}
                  onValueChange={(v) => setCurrentItem(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input
                value={currentItem?.title || ''}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. Mobile App"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Beschreibung *</Label>
              <Textarea
                value={currentItem?.description || ''}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kurze Beschreibung des Features..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={currentItem?.icon || 'sparkles'}
                onValueChange={(v) => setCurrentItem(prev => ({ ...prev, icon: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveItem}>
              {isEditingItem ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Item löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Item "{itemToDelete?.title}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


