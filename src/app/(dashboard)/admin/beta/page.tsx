'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  Save,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Rocket,
  Users,
  MessageSquare,
  Gift,
  Zap,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Globe,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'
import { SortableList } from '@/components/ui/sortable-list'
import * as LucideIcons from 'lucide-react'

interface BetaPageConfig {
  id: string
  heroBadgeText: string | null
  heroTitle: string
  heroTitleHighlight: string | null
  heroDescription: string | null
  heroCtaPrimaryText: string | null
  heroCtaPrimaryLink: string | null
  heroCtaSecondaryText: string | null
  heroCtaSecondaryLink: string | null
  requirementsTitle: string | null
  requirementsDescription: string | null
  timelineTitle: string | null
  timelineDescription: string | null
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  ctaButtonLink: string | null
  metaTitle: string | null
  metaDescription: string | null
}

interface BetaBenefit {
  id: string
  icon: string
  title: string
  description: string
  sortOrder: number
  isActive: boolean
}

interface BetaRequirement {
  id: string
  text: string
  sortOrder: number
  isActive: boolean
}

interface BetaTimelineItem {
  id: string
  date: string
  title: string
  description: string
  sortOrder: number
  isActive: boolean
}

const iconOptions = [
  { value: 'rocket', label: 'Rocket' },
  { value: 'users', label: 'Users' },
  { value: 'message-square', label: 'Message' },
  { value: 'gift', label: 'Gift' },
  { value: 'zap', label: 'Zap' },
  { value: 'star', label: 'Star' },
  { value: 'shield', label: 'Shield' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'check-circle', label: 'Check' },
  { value: 'award', label: 'Award' },
]

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'rocket': Rocket,
    'users': Users,
    'message-square': MessageSquare,
    'gift': Gift,
    'zap': Zap,
    'star': LucideIcons.Star,
    'shield': LucideIcons.Shield,
    'sparkles': LucideIcons.Sparkles,
    'check-circle': CheckCircle,
    'award': LucideIcons.Award,
  }
  return iconMap[iconName] || Rocket
}

export default function BetaAdminPage() {
  const [config, setConfig] = useState<BetaPageConfig>({
    id: 'default',
    heroBadgeText: '',
    heroTitle: '',
    heroTitleHighlight: '',
    heroDescription: '',
    heroCtaPrimaryText: '',
    heroCtaPrimaryLink: '',
    heroCtaSecondaryText: '',
    heroCtaSecondaryLink: '',
    requirementsTitle: '',
    requirementsDescription: '',
    timelineTitle: '',
    timelineDescription: '',
    ctaTitle: '',
    ctaDescription: '',
    ctaButtonText: '',
    ctaButtonLink: '',
    metaTitle: '',
    metaDescription: '',
  })
  const [benefits, setBenefits] = useState<BetaBenefit[]>([])
  const [requirements, setRequirements] = useState<BetaRequirement[]>([])
  const [timelineItems, setTimelineItems] = useState<BetaTimelineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Dialog states
  const [benefitDialogOpen, setBenefitDialogOpen] = useState(false)
  const [requirementDialogOpen, setRequirementDialogOpen] = useState(false)
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false)
  const [currentBenefit, setCurrentBenefit] = useState<Partial<BetaBenefit>>({})
  const [currentRequirement, setCurrentRequirement] = useState<Partial<BetaRequirement>>({})
  const [currentTimeline, setCurrentTimeline] = useState<Partial<BetaTimelineItem>>({})
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/beta-page-config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
        setBenefits(data.benefits || [])
        setRequirements(data.requirements || [])
        setTimelineItems(data.timelineItems || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Fehler beim Laden der Daten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/beta-page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        toast.success('Konfiguration gespeichert')
      } else {
        toast.error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  // Benefits handlers
  const handleSaveBenefit = async () => {
    try {
      const url = isEditing && currentBenefit.id
        ? `/api/admin/beta-benefits/${currentBenefit.id}`
        : '/api/admin/beta-benefits'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentBenefit,
          sortOrder: currentBenefit.sortOrder ?? benefits.length,
        }),
      })

      if (res.ok) {
        toast.success(isEditing ? 'Vorteil aktualisiert' : 'Vorteil erstellt')
        setBenefitDialogOpen(false)
        setCurrentBenefit({})
        setIsEditing(false)
        await fetchData()
      } else {
        toast.error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving benefit:', error)
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDeleteBenefit = async (id: string) => {
    if (!confirm('Möchten Sie diesen Vorteil wirklich löschen?')) return
    try {
      const res = await fetch(`/api/admin/beta-benefits/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Vorteil gelöscht')
        await fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const handleReorderBenefits = async (items: BetaBenefit[]) => {
    setBenefits(items)
    try {
      await fetch('/api/admin/beta-benefits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((item, i) => ({ id: item.id, sortOrder: i })) }),
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Requirements handlers
  const handleSaveRequirement = async () => {
    try {
      const url = isEditing && currentRequirement.id
        ? `/api/admin/beta-requirements/${currentRequirement.id}`
        : '/api/admin/beta-requirements'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentRequirement,
          sortOrder: currentRequirement.sortOrder ?? requirements.length,
        }),
      })

      if (res.ok) {
        toast.success(isEditing ? 'Anforderung aktualisiert' : 'Anforderung erstellt')
        setRequirementDialogOpen(false)
        setCurrentRequirement({})
        setIsEditing(false)
        await fetchData()
      } else {
        toast.error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDeleteRequirement = async (id: string) => {
    if (!confirm('Möchten Sie diese Anforderung wirklich löschen?')) return
    try {
      const res = await fetch(`/api/admin/beta-requirements/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Anforderung gelöscht')
        await fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const handleReorderRequirements = async (items: BetaRequirement[]) => {
    setRequirements(items)
    try {
      await fetch('/api/admin/beta-requirements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((item, i) => ({ id: item.id, sortOrder: i })) }),
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Timeline handlers
  const handleSaveTimeline = async () => {
    try {
      const url = isEditing && currentTimeline.id
        ? `/api/admin/beta-timeline/${currentTimeline.id}`
        : '/api/admin/beta-timeline'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentTimeline,
          sortOrder: currentTimeline.sortOrder ?? timelineItems.length,
        }),
      })

      if (res.ok) {
        toast.success(isEditing ? 'Timeline aktualisiert' : 'Timeline erstellt')
        setTimelineDialogOpen(false)
        setCurrentTimeline({})
        setIsEditing(false)
        await fetchData()
      } else {
        toast.error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return
    try {
      const res = await fetch(`/api/admin/beta-timeline/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Eintrag gelöscht')
        await fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const handleReorderTimeline = async (items: BetaTimelineItem[]) => {
    setTimelineItems(items)
    try {
      await fetch('/api/admin/beta-timeline', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((item, i) => ({ id: item.id, sortOrder: i })) }),
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const activeBenefits = benefits.filter(b => b.isActive)
  const activeRequirements = requirements.filter(r => r.isActive)
  const activeTimeline = timelineItems.filter(t => t.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beta-Programm</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie die Beta-Programm Seite für Lead-Generierung
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/beta-programm" target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Seite ansehen
            <ExternalLink className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config">Konfiguration</TabsTrigger>
          <TabsTrigger value="benefits">Vorteile ({benefits.length})</TabsTrigger>
          <TabsTrigger value="requirements">Anforderungen ({requirements.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({timelineItems.length})</TabsTrigger>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
        </TabsList>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero-Bereich</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Badge-Text</Label>
                  <Input
                    value={config.heroBadgeText || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, heroBadgeText: e.target.value }))}
                    placeholder="z.B. Start in Q2 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Highlight-Text</Label>
                  <Input
                    value={config.heroTitleHighlight || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, heroTitleHighlight: e.target.value }))}
                    placeholder="z.B. Salon-Managements"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Titel</Label>
                <Input
                  value={config.heroTitle}
                  onChange={(e) => setConfig(prev => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="Haupttitel"
                />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={config.heroDescription || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, heroDescription: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primärer Button Text</Label>
                  <Input
                    value={config.heroCtaPrimaryText || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, heroCtaPrimaryText: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primärer Button Link</Label>
                  <Input
                    value={config.heroCtaPrimaryLink || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, heroCtaPrimaryLink: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sekundärer Button Text</Label>
                  <Input
                    value={config.heroCtaSecondaryText || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, heroCtaSecondaryText: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sekundärer Button Link</Label>
                  <Input
                    value={config.heroCtaSecondaryLink || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, heroCtaSecondaryLink: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Abschnitts-Titel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Anforderungen Titel</Label>
                  <Input
                    value={config.requirementsTitle || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, requirementsTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeline Titel</Label>
                  <Input
                    value={config.timelineTitle || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, timelineTitle: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Anforderungen Beschreibung</Label>
                  <Textarea
                    value={config.requirementsDescription || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, requirementsDescription: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeline Beschreibung</Label>
                  <Textarea
                    value={config.timelineDescription || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, timelineDescription: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CTA-Bereich</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CTA Titel</Label>
                <Input
                  value={config.ctaTitle || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, ctaTitle: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Beschreibung</Label>
                <Textarea
                  value={config.ctaDescription || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, ctaDescription: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={config.ctaButtonText || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={config.ctaButtonLink || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, ctaButtonLink: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO-Einstellungen
              </CardTitle>
              <CardDescription>
                Optimieren Sie die Sichtbarkeit in Suchmaschinen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta-Titel</Label>
                <Input
                  value={config.metaTitle || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder={config.heroTitle || 'Titel für Suchmaschinen'}
                  maxLength={70}
                />
                <div className="flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    Leer lassen für automatischen Titel
                  </p>
                  <p className={`text-xs ${(config.metaTitle || '').length > 60 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    {(config.metaTitle || '').length}/70
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meta-Beschreibung</Label>
                <Textarea
                  value={config.metaDescription || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder={config.heroDescription || 'Beschreibung für Suchmaschinen'}
                  maxLength={160}
                  rows={2}
                />
                <div className="flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    Ideal sind 120-160 Zeichen
                  </p>
                  <p className={`text-xs ${(config.metaDescription || '').length > 150 ? 'text-amber-500' : (config.metaDescription || '').length < 120 ? 'text-muted-foreground' : 'text-green-500'}`}>
                    {(config.metaDescription || '').length}/160
                  </p>
                </div>
              </div>

              {/* Google Preview */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Google-Vorschau</p>
                </div>
                <div className="space-y-1 font-sans">
                  <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                    {config.metaTitle || config.heroTitle || 'Beta-Programm | NICNOA'}
                  </p>
                  <p className="text-[#006621] text-sm">
                    nicnoa.online › beta-programm
                  </p>
                  <p className="text-sm text-[#545454] line-clamp-2">
                    {config.metaDescription || config.heroDescription || 'Werden Sie Beta-Tester und gestalten Sie die Zukunft des Salon-Managements mit.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Konfiguration speichern
            </Button>
          </div>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vorteile</CardTitle>
                  <CardDescription>Die Vorteile des Beta-Programms</CardDescription>
                </div>
                <Button onClick={() => { setCurrentBenefit({ icon: 'rocket', isActive: true }); setIsEditing(false); setBenefitDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Neuer Vorteil
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {benefits.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Noch keine Vorteile vorhanden
                </div>
              ) : (
                <SortableList
                  items={benefits}
                  onReorder={handleReorderBenefits}
                  renderItem={(benefit) => {
                    const IconComponent = getIconComponent(benefit.icon)
                    return (
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{benefit.title}</h3>
                            <Badge variant={benefit.isActive ? 'default' : 'secondary'}>
                              {benefit.isActive ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setCurrentBenefit(benefit); setIsEditing(true); setBenefitDialogOpen(true); }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteBenefit(benefit.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Anforderungen</CardTitle>
                  <CardDescription>Voraussetzungen für Beta-Tester</CardDescription>
                </div>
                <Button onClick={() => { setCurrentRequirement({ isActive: true }); setIsEditing(false); setRequirementDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Neue Anforderung
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {requirements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Noch keine Anforderungen vorhanden
                </div>
              ) : (
                <SortableList
                  items={requirements}
                  onReorder={handleReorderRequirements}
                  renderItem={(req) => (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{req.text}</span>
                          <Badge variant={req.isActive ? 'default' : 'secondary'}>
                            {req.isActive ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setCurrentRequirement(req); setIsEditing(true); setRequirementDialogOpen(true); }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRequirement(req.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Timeline</CardTitle>
                  <CardDescription>Meilensteine des Beta-Programms</CardDescription>
                </div>
                <Button onClick={() => { setCurrentTimeline({ isActive: true }); setIsEditing(false); setTimelineDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Neuer Meilenstein
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {timelineItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Noch keine Timeline-Einträge vorhanden
                </div>
              ) : (
                <SortableList
                  items={timelineItems}
                  onReorder={handleReorderTimeline}
                  renderItem={(item) => (
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{item.date}</Badge>
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant={item.isActive ? 'default' : 'secondary'}>
                            {item.isActive ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setCurrentTimeline(item); setIsEditing(true); setTimelineDialogOpen(true); }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTimeline(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Live-Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-background max-h-[800px] overflow-y-auto">
                {/* Hero */}
                <section className="py-12 text-center">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {config.heroBadgeText && (
                      <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm mb-4">
                        <Rocket className="mr-1 h-3.5 w-3.5 text-primary" />
                        <span className="text-muted-foreground">{config.heroBadgeText}</span>
                      </span>
                    )}
                    <h1 className="text-3xl font-bold tracking-tight mb-4">
                      {config.heroTitle.includes(config.heroTitleHighlight || '') 
                        ? config.heroTitle.split(config.heroTitleHighlight || '').map((part, i, arr) => (
                            <span key={i}>
                              {part}
                              {i < arr.length - 1 && <span className="text-primary">{config.heroTitleHighlight}</span>}
                            </span>
                          ))
                        : config.heroTitle}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-6">{config.heroDescription}</p>
                    <div className="flex justify-center gap-4">
                      {config.heroCtaPrimaryText && (
                        <Button size="lg">
                          {config.heroCtaPrimaryText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                      {config.heroCtaSecondaryText && (
                        <Button size="lg" variant="outline">{config.heroCtaSecondaryText}</Button>
                      )}
                    </div>
                  </motion.div>
                </section>

                {/* Benefits */}
                {activeBenefits.length > 0 && (
                  <section className="py-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {activeBenefits.map((benefit) => {
                        const IconComponent = getIconComponent(benefit.icon)
                        return (
                          <div key={benefit.id} className="rounded-xl border bg-card p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="rounded-lg bg-primary/10 p-2">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <h3 className="font-semibold">{benefit.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{benefit.description}</p>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* Requirements */}
                {activeRequirements.length > 0 && (
                  <section className="py-8 bg-muted/50 -mx-6 px-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-2 text-center">{config.requirementsTitle}</h2>
                    <p className="text-muted-foreground text-center mb-6">{config.requirementsDescription}</p>
                    <div className="max-w-xl mx-auto space-y-3">
                      {activeRequirements.map((req) => (
                        <div key={req.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Timeline */}
                {activeTimeline.length > 0 && (
                  <section className="py-8">
                    <h2 className="text-xl font-bold mb-2 text-center">{config.timelineTitle}</h2>
                    <p className="text-muted-foreground text-center mb-6">{config.timelineDescription}</p>
                    <div className="max-w-xl mx-auto space-y-4">
                      {activeTimeline.map((item) => (
                        <div key={item.id} className="rounded-xl border bg-card p-4">
                          <span className="text-sm font-medium text-primary">{item.date}</span>
                          <h3 className="font-semibold mt-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* CTA */}
                {config.ctaTitle && (
                  <section className="py-8 bg-muted/50 -mx-6 px-6 rounded-lg text-center">
                    <h2 className="text-xl font-bold mb-2">{config.ctaTitle}</h2>
                    <p className="text-muted-foreground mb-6">{config.ctaDescription}</p>
                    {config.ctaButtonText && (
                      <Button size="lg">
                        {config.ctaButtonText}
                        <Zap className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </section>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Benefit Dialog */}
      <Dialog open={benefitDialogOpen} onOpenChange={setBenefitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Vorteil bearbeiten' : 'Neuer Vorteil'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={currentBenefit.icon || 'rocket'} onValueChange={(v) => setCurrentBenefit(prev => ({ ...prev, icon: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {iconOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input value={currentBenefit.title || ''} onChange={(e) => setCurrentBenefit(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea value={currentBenefit.description || ''} onChange={(e) => setCurrentBenefit(prev => ({ ...prev, description: e.target.value }))} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={currentBenefit.isActive !== false} onCheckedChange={(c) => setCurrentBenefit(prev => ({ ...prev, isActive: c }))} />
              <Label>Aktiv</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBenefitDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveBenefit}><Save className="mr-2 h-4 w-4" /> Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Requirement Dialog */}
      <Dialog open={requirementDialogOpen} onOpenChange={setRequirementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Anforderung bearbeiten' : 'Neue Anforderung'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Text</Label>
              <Textarea value={currentRequirement.text || ''} onChange={(e) => setCurrentRequirement(prev => ({ ...prev, text: e.target.value }))} rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={currentRequirement.isActive !== false} onCheckedChange={(c) => setCurrentRequirement(prev => ({ ...prev, isActive: c }))} />
              <Label>Aktiv</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequirementDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveRequirement}><Save className="mr-2 h-4 w-4" /> Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog open={timelineDialogOpen} onOpenChange={setTimelineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Meilenstein bearbeiten' : 'Neuer Meilenstein'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Datum</Label>
              <Input value={currentTimeline.date || ''} onChange={(e) => setCurrentTimeline(prev => ({ ...prev, date: e.target.value }))} placeholder="z.B. Q2 2025" />
            </div>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input value={currentTimeline.title || ''} onChange={(e) => setCurrentTimeline(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea value={currentTimeline.description || ''} onChange={(e) => setCurrentTimeline(prev => ({ ...prev, description: e.target.value }))} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={currentTimeline.isActive !== false} onCheckedChange={(c) => setCurrentTimeline(prev => ({ ...prev, isActive: c }))} />
              <Label>Aktiv</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimelineDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveTimeline}><Save className="mr-2 h-4 w-4" /> Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
