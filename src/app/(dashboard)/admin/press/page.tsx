'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  RefreshCw,
  ExternalLink,
  Star,
  Eye,
  EyeOff,
  Calendar,
  FileText,
  Building2,
  Settings,
  Mail,
  Phone,
  User,
  Download,
  TrendingUp,
  Award,
  Globe,
  ChevronRight,
  Sparkles,
  Quote,
  ArrowRight,
  BookOpen,
  Mic,
  Megaphone,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface PressArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  source: string
  sourceUrl: string
  sourceLogo: string | null
  coverImage: string | null
  publishedAt: string
  category: string
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
}

interface PressPageConfig {
  heroBadgeText: string | null
  heroTitle: string
  heroDescription: string | null
  showStats: boolean
  stat1Label: string | null
  stat1Value: string | null
  stat2Label: string | null
  stat2Value: string | null
  stat3Label: string | null
  stat3Value: string | null
  showPressKit: boolean
  pressKitTitle: string | null
  pressKitDescription: string | null
  pressKitDownloadUrl: string | null
  contactTitle: string | null
  contactDescription: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactPerson: string | null
  metaTitle: string | null
  metaDescription: string | null
}

interface Stats {
  total: number
  active: number
  featured: number
  byCategory: {
    news: number
    feature: number
    interview: number
    announcement: number
  }
}

const emptyArticle: Partial<PressArticle> = {
  title: '',
  excerpt: '',
  source: '',
  sourceUrl: '',
  sourceLogo: '',
  coverImage: '',
  publishedAt: new Date().toISOString().split('T')[0],
  category: 'news',
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
}

const categories = [
  { value: 'news', label: 'Nachrichten', icon: Newspaper, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { value: 'feature', label: 'Feature', icon: BookOpen, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { value: 'interview', label: 'Interview', icon: Mic, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { value: 'announcement', label: 'Ankündigung', icon: Megaphone, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
]

export default function PressAdminPage() {
  const [articles, setArticles] = useState<PressArticle[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pageConfig, setPageConfig] = useState<PressPageConfig>({
    heroBadgeText: 'Presse & Medien',
    heroTitle: 'NICNOA in den Medien',
    heroDescription: '',
    showStats: true,
    stat1Label: 'Presse-Artikel',
    stat1Value: '50+',
    stat2Label: 'Medienreichweite',
    stat2Value: '10M+',
    stat3Label: 'Auszeichnungen',
    stat3Value: '5',
    showPressKit: true,
    pressKitTitle: 'Presse-Kit',
    pressKitDescription: '',
    pressKitDownloadUrl: '',
    contactTitle: 'Presse-Kontakt',
    contactDescription: '',
    contactEmail: 'presse@nicnoa.online',
    contactPhone: '',
    contactPerson: '',
    metaTitle: '',
    metaDescription: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentArticle, setCurrentArticle] = useState<Partial<PressArticle>>(emptyArticle)
  const [isEditing, setIsEditing] = useState(false)
  const [mainTab, setMainTab] = useState<'articles' | 'config'>('articles')
  const [showPreview, setShowPreview] = useState(true)
  const [hasConfigChanges, setHasConfigChanges] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    fetchArticles()
    fetchPageConfig()
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/press?includeInactive=true')
      if (!res.ok) throw new Error('Failed to fetch articles')
      const data = await res.json()
      setArticles(data.articles)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error('Fehler beim Laden der Artikel')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPageConfig = async () => {
    setIsLoadingConfig(true)
    try {
      const res = await fetch('/api/admin/press-page-config')
      if (res.ok) {
        const data = await res.json()
        setPageConfig(data)
      }
    } catch (error) {
      console.error('Error fetching page config:', error)
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const updateConfig = useCallback(<K extends keyof PressPageConfig>(key: K, value: PressPageConfig[K]) => {
    setPageConfig((prev) => ({ ...prev, [key]: value }))
    setHasConfigChanges(true)
  }, [])

  const handleSaveConfig = async () => {
    setIsSavingConfig(true)
    try {
      const res = await fetch('/api/admin/press-page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageConfig),
      })

      if (!res.ok) throw new Error('Failed to save config')

      toast.success('Seiten-Konfiguration gespeichert!')
      setHasConfigChanges(false)
    } catch (error) {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleSaveArticle = async () => {
    if (!currentArticle.title || !currentArticle.source || !currentArticle.sourceUrl) {
      toast.error('Titel, Quelle und Quell-URL sind erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/press', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentArticle),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success(isEditing ? 'Artikel aktualisiert!' : 'Artikel erstellt!')
      setEditDialogOpen(false)
      setCurrentArticle(emptyArticle)
      fetchArticles()
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Möchten Sie diesen Artikel wirklich löschen?')) return

    try {
      const res = await fetch(`/api/admin/press?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      toast.success('Artikel gelöscht')
      fetchArticles()
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }

  const openEditDialog = (article?: PressArticle) => {
    if (article) {
      setCurrentArticle({
        ...article,
        publishedAt: article.publishedAt.split('T')[0],
      })
      setIsEditing(true)
    } else {
      setCurrentArticle(emptyArticle)
      setIsEditing(false)
    }
    setEditDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredArticles =
    filterCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === filterCategory)

  const featuredArticles = articles.filter((a) => a.isFeatured && a.isActive)
  const activeStats = [
    { label: pageConfig.stat1Label, value: pageConfig.stat1Value, icon: Newspaper },
    { label: pageConfig.stat2Label, value: pageConfig.stat2Value, icon: TrendingUp },
    { label: pageConfig.stat3Label, value: pageConfig.stat3Value, icon: Award },
  ].filter((s) => s.label && s.value)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Newspaper className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Presse & Medien</h1>
          {hasConfigChanges && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              Ungespeicherte Änderungen
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau'}
          </Button>
          <Button onClick={handleSaveConfig} disabled={isSavingConfig || !hasConfigChanges}>
            {isSavingConfig ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Speichern
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Settings */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} overflow-y-auto p-6`}>
          <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'articles' | 'config')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="articles">
                <Newspaper className="mr-2 h-4 w-4" />
                Artikel verwalten
              </TabsTrigger>
              <TabsTrigger value="config">
                <Settings className="mr-2 h-4 w-4" />
                Seiten-Konfiguration
              </TabsTrigger>
            </TabsList>

            {/* Articles Tab */}
            <TabsContent value="articles" className="space-y-6 mt-6">
              {/* Stats */}
              {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    { label: 'Gesamt', value: stats.total, icon: Newspaper },
                    { label: 'Aktiv', value: stats.active, icon: Eye },
                    { label: 'Featured', value: stats.featured, icon: Star },
                    { label: 'Kategorien', value: Object.values(stats.byCategory).filter(v => v > 0).length, icon: FileText },
                  ].map((stat) => (
                    <Card key={stat.label}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                          </div>
                          <stat.icon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Alle Kategorien" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchArticles}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Aktualisieren
                  </Button>
                  <Button onClick={() => openEditDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Neuer Artikel
                  </Button>
                </div>
              </div>

              {/* Articles List */}
              <div className="space-y-4">
                {filteredArticles.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Newspaper className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Keine Artikel vorhanden</p>
                    <Button className="mt-4" onClick={() => openEditDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ersten Artikel erstellen
                    </Button>
                  </Card>
                ) : (
                  filteredArticles.map((article, index) => {
                    const catConfig = categories.find(c => c.value === article.category) || categories[0]
                    return (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`${!article.isActive ? 'opacity-60' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge variant={article.isActive ? 'default' : 'secondary'}>
                                    {article.isActive ? 'Aktiv' : 'Inaktiv'}
                                  </Badge>
                                  <Badge variant="outline" className={catConfig.color}>
                                    <catConfig.icon className="w-3 h-3 mr-1" />
                                    {catConfig.label}
                                  </Badge>
                                  {article.isFeatured && (
                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>

                                <h3 className="font-semibold mb-1 truncate">{article.title}</h3>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Globe className="w-3.5 h-3.5" />
                                    {article.source}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(article.publishedAt)}
                                  </span>
                                  <a
                                    href={article.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Quelle
                                  </a>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(article)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteArticle(article.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </TabsContent>

            {/* Config Tab */}
            <TabsContent value="config" className="space-y-6 mt-6">
              {isLoadingConfig ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Hero Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero-Bereich</CardTitle>
                      <CardDescription>Konfigurieren Sie den Kopfbereich der Presse-Seite</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Badge-Text</Label>
                        <Input
                          value={pageConfig.heroBadgeText || ''}
                          onChange={(e) => updateConfig('heroBadgeText', e.target.value)}
                          placeholder="z.B. Presse & Medien"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Titel *</Label>
                        <Input
                          value={pageConfig.heroTitle}
                          onChange={(e) => updateConfig('heroTitle', e.target.value)}
                          placeholder="z.B. NICNOA in den Medien"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={pageConfig.heroDescription || ''}
                          onChange={(e) => updateConfig('heroDescription', e.target.value)}
                          placeholder="Kurze Beschreibung..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Statistiken</CardTitle>
                          <CardDescription>Zeigen Sie beeindruckende Zahlen</CardDescription>
                        </div>
                        <Switch
                          checked={pageConfig.showStats}
                          onCheckedChange={(checked) => updateConfig('showStats', checked)}
                        />
                      </div>
                    </CardHeader>
                    {pageConfig.showStats && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Statistik 1 - Label</Label>
                            <Input
                              value={pageConfig.stat1Label || ''}
                              onChange={(e) => updateConfig('stat1Label', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Statistik 1 - Wert</Label>
                            <Input
                              value={pageConfig.stat1Value || ''}
                              onChange={(e) => updateConfig('stat1Value', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Statistik 2 - Label</Label>
                            <Input
                              value={pageConfig.stat2Label || ''}
                              onChange={(e) => updateConfig('stat2Label', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Statistik 2 - Wert</Label>
                            <Input
                              value={pageConfig.stat2Value || ''}
                              onChange={(e) => updateConfig('stat2Value', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Statistik 3 - Label</Label>
                            <Input
                              value={pageConfig.stat3Label || ''}
                              onChange={(e) => updateConfig('stat3Label', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Statistik 3 - Wert</Label>
                            <Input
                              value={pageConfig.stat3Value || ''}
                              onChange={(e) => updateConfig('stat3Value', e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Press Kit Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Presse-Kit</CardTitle>
                          <CardDescription>Download-Bereich für Medienvertreter</CardDescription>
                        </div>
                        <Switch
                          checked={pageConfig.showPressKit}
                          onCheckedChange={(checked) => updateConfig('showPressKit', checked)}
                        />
                      </div>
                    </CardHeader>
                    {pageConfig.showPressKit && (
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={pageConfig.pressKitTitle || ''}
                            onChange={(e) => updateConfig('pressKitTitle', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Beschreibung</Label>
                          <Textarea
                            value={pageConfig.pressKitDescription || ''}
                            onChange={(e) => updateConfig('pressKitDescription', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Download-URL</Label>
                          <Input
                            value={pageConfig.pressKitDownloadUrl || ''}
                            onChange={(e) => updateConfig('pressKitDownloadUrl', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Contact Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Presse-Kontakt</CardTitle>
                      <CardDescription>Kontaktinformationen für Medienvertreter</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Titel</Label>
                        <Input
                          value={pageConfig.contactTitle || ''}
                          onChange={(e) => updateConfig('contactTitle', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={pageConfig.contactDescription || ''}
                          onChange={(e) => updateConfig('contactDescription', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Ansprechpartner</Label>
                          <Input
                            value={pageConfig.contactPerson || ''}
                            onChange={(e) => updateConfig('contactPerson', e.target.value)}
                            placeholder="z.B. Max Mustermann, PR Manager"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>E-Mail</Label>
                          <Input
                            type="email"
                            value={pageConfig.contactEmail || ''}
                            onChange={(e) => updateConfig('contactEmail', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefon</Label>
                          <Input
                            value={pageConfig.contactPhone || ''}
                            onChange={(e) => updateConfig('contactPhone', e.target.value)}
                            placeholder="+49 ..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SEO Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO-Einstellungen</CardTitle>
                      <CardDescription>Optimierung für Suchmaschinen</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Meta-Titel (max. 70 Zeichen)</Label>
                        <Input
                          value={pageConfig.metaTitle || ''}
                          onChange={(e) => updateConfig('metaTitle', e.target.value)}
                          maxLength={70}
                        />
                        <p className="text-xs text-muted-foreground">
                          {(pageConfig.metaTitle || '').length}/70 Zeichen
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Meta-Beschreibung (max. 160 Zeichen)</Label>
                        <Textarea
                          value={pageConfig.metaDescription || ''}
                          onChange={(e) => updateConfig('metaDescription', e.target.value)}
                          maxLength={160}
                          rows={2}
                        />
                        <p className="text-xs text-muted-foreground">
                          {(pageConfig.metaDescription || '').length}/160 Zeichen
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Live Preview */}
        {showPreview && (
          <div className="w-1/2 border-l bg-slate-950 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 p-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Live-Vorschau</span>
              </div>
            </div>

            <div className="min-h-full">
              {/* Hero Preview */}
              <div className="relative py-16 px-6 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950/50 to-slate-950" />
                  <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
                      `,
                      backgroundSize: '30px 30px',
                    }}
                  />
                  <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px]" />
                  <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] bg-pink-600/15 rounded-full blur-[60px]" />
                </div>

                <div className="relative z-10 text-center max-w-xl mx-auto">
                  {pageConfig.heroBadgeText && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      <span className="text-xs font-medium text-purple-200">{pageConfig.heroBadgeText}</span>
                    </div>
                  )}

                  <h1 className="text-2xl font-bold mb-3 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
                    {pageConfig.heroTitle || 'NICNOA in den Medien'}
                  </h1>

                  {pageConfig.heroDescription && (
                    <p className="text-sm text-slate-300/90 mb-6 leading-relaxed">
                      {pageConfig.heroDescription}
                    </p>
                  )}

                  {/* Stats */}
                  {pageConfig.showStats && activeStats.length > 0 && (
                    <div className="flex justify-center gap-8">
                      {activeStats.map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className="mb-2 mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                            <stat.icon className="h-4 w-4 text-purple-300" />
                          </div>
                          <p className="text-xl font-bold text-white">{stat.value}</p>
                          <p className="text-[10px] text-slate-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Articles Preview */}
              {featuredArticles.length > 0 && (
                <div className="p-6 bg-slate-900/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded bg-amber-500/20">
                      <Star className="h-3 w-3 text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Highlights</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {featuredArticles.slice(0, 2).map((article) => {
                      const catConfig = categories.find(c => c.value === article.category) || categories[0]
                      return (
                        <div key={article.id} className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50">
                          <div className="h-20 bg-gradient-to-br from-purple-900/50 to-slate-900 flex items-center justify-center">
                            <Newspaper className="h-6 w-6 text-purple-500/30" />
                          </div>
                          <div className="p-3">
                            <Badge variant="outline" className={`${catConfig.color} text-[8px] mb-2`}>
                              {catConfig.label}
                            </Badge>
                            <p className="text-xs font-medium text-white line-clamp-2 mb-2">
                              {article.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <Globe className="w-3 h-3" />
                              {article.source}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Press Kit & Contact Preview */}
              {(pageConfig.showPressKit || pageConfig.contactEmail || pageConfig.contactPhone || pageConfig.contactPerson) && (
                <div className="p-6 bg-slate-900/30">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-3">
                      <Mail className="h-3 w-3 text-purple-400" />
                      <span className="text-[10px] font-medium text-purple-300">Für Medienvertreter</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Ressourcen & Kontakt</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Press Kit */}
                    {pageConfig.showPressKit && (
                      <div className="bg-gradient-to-br from-purple-500/5 to-slate-800/50 rounded-lg p-4 border border-purple-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Download className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="text-xs font-semibold text-white">
                            {pageConfig.pressKitTitle || 'Presse-Kit'}
                          </h4>
                        </div>
                        {pageConfig.pressKitDescription && (
                          <p className="text-[10px] text-slate-400 mb-3 line-clamp-2">
                            {pageConfig.pressKitDescription}
                          </p>
                        )}
                        <div className="space-y-1.5">
                          {['Logos', 'Produktbilder', 'Factsheet'].map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[9px] text-slate-500">
                              <ChevronRight className="w-2.5 h-2.5 text-purple-400" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {(pageConfig.contactEmail || pageConfig.contactPhone || pageConfig.contactPerson) && (
                      <div className="bg-gradient-to-br from-pink-500/5 to-slate-800/50 rounded-lg p-4 border border-pink-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="text-xs font-semibold text-white">
                            {pageConfig.contactTitle || 'Presse-Kontakt'}
                          </h4>
                        </div>
                        {pageConfig.contactDescription && (
                          <p className="text-[10px] text-slate-400 mb-3 line-clamp-2">
                            {pageConfig.contactDescription}
                          </p>
                        )}
                        <div className="space-y-2">
                          {pageConfig.contactPerson && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-pink-400" />
                              <span className="text-[10px] text-slate-300">{pageConfig.contactPerson}</span>
                            </div>
                          )}
                          {pageConfig.contactEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-pink-400" />
                              <span className="text-[10px] text-pink-400">{pageConfig.contactEmail}</span>
                            </div>
                          )}
                          {pageConfig.contactPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-pink-400" />
                              <span className="text-[10px] text-pink-400">{pageConfig.contactPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CTA Preview */}
              <div className="relative py-12 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600" />
                <div className="relative z-10 text-center text-white">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 mb-4">
                    <Quote className="h-3 w-3" />
                    <span className="text-[10px] font-medium">Medienpartnerschaften</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Sie möchten über NICNOA berichten?</h3>
                  <p className="text-xs text-white/80 mb-4 max-w-sm mx-auto">
                    Wir freuen uns über Ihr Interesse und unterstützen Sie gerne.
                  </p>
                  <div className="flex justify-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-white text-purple-600 text-[10px] font-medium">
                      Kontakt aufnehmen
                    </div>
                    <div className="px-3 py-1.5 rounded-lg border border-white/30 text-white text-[10px] font-medium flex items-center gap-1">
                      Mehr über NICNOA
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Artikel bearbeiten' : 'Neuen Artikel erstellen'}</DialogTitle>
            <DialogDescription>
              Fügen Sie einen externen Presse-Artikel über NICNOA hinzu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={currentArticle.title || ''}
                onChange={(e) => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                placeholder="Artikelüberschrift"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Kurzbeschreibung</Label>
              <Textarea
                id="excerpt"
                value={currentArticle.excerpt || ''}
                onChange={(e) => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })}
                placeholder="Kurze Zusammenfassung des Artikels..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Quelle *</Label>
                <Input
                  id="source"
                  value={currentArticle.source || ''}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, source: e.target.value })}
                  placeholder="z.B. TechCrunch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select
                  value={currentArticle.category || 'news'}
                  onValueChange={(value) => setCurrentArticle({ ...currentArticle, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Artikel-URL *</Label>
              <Input
                id="sourceUrl"
                value={currentArticle.sourceUrl || ''}
                onChange={(e) => setCurrentArticle({ ...currentArticle, sourceUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceLogo">Quell-Logo URL</Label>
                <Input
                  id="sourceLogo"
                  value={currentArticle.sourceLogo || ''}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, sourceLogo: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover-Bild URL</Label>
                <Input
                  id="coverImage"
                  value={currentArticle.coverImage || ''}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishedAt">Veröffentlichungsdatum</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={currentArticle.publishedAt || ''}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, publishedAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sortierung</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={currentArticle.sortOrder || 0}
                  onChange={(e) =>
                    setCurrentArticle({ ...currentArticle, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={currentArticle.isActive ?? true}
                  onCheckedChange={(checked) => setCurrentArticle({ ...currentArticle, isActive: checked })}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Artikel aktiv
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isFeatured"
                  checked={currentArticle.isFeatured ?? false}
                  onCheckedChange={(checked) => setCurrentArticle({ ...currentArticle, isFeatured: checked })}
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Als Featured markieren
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveArticle} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
