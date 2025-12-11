'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  RefreshCw,
  X,
  Scissors,
  Building2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Users,
  FileText,
  Monitor,
  Smartphone,
  Settings,
  List,
  AlertCircle,
  Search,
  Globe,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toast } from 'sonner'
import { SortableList } from '@/components/ui/sortable-list'
import { SEOSection } from '@/components/admin/seo-preview'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  role: 'STYLIST' | 'SALON_OWNER'
  isActive: boolean
  showOnHomepage: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface FAQPageConfig {
  id?: string
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  sectionTitle: string
  sectionDescription: string
  salonTabLabel: string
  stylistTabLabel: string
  contactText: string
  contactLinkText: string
  contactLinkUrl: string
  // SEO
  metaTitle: string | null
  metaDescription: string | null
}

const emptyFAQ: Partial<FAQ> = {
  question: '',
  answer: '',
  category: null,
  role: 'STYLIST',
  isActive: true,
  showOnHomepage: false,
  sortOrder: 0,
}

const defaultConfig: FAQPageConfig = {
  heroBadgeText: 'Häufig gestellte Fragen',
  heroTitle: 'Ihre Fragen beantwortet',
  heroDescription: 'Finden Sie schnell Antworten auf die häufigsten Fragen zu NICNOA.',
  sectionTitle: 'FAQ',
  sectionDescription: 'Wählen Sie Ihre Rolle, um relevante Fragen zu sehen.',
  salonTabLabel: 'Für Salon-Space Betreiber',
  stylistTabLabel: 'Für Stuhlmieter',
  contactText: 'Können Sie nicht finden, wonach Sie suchen? Kontaktieren Sie unser',
  contactLinkText: 'Support-Team',
  contactLinkUrl: '/support',
  metaTitle: null,
  metaDescription: null,
}

const categories = [
  'Buchungen',
  'Verdienst',
  'Finanzen',
  'Salon',
  'Profil',
  'Einstellungen',
  'Kunden',
  'Sicherheit',
  'Compliance',
  'Stylisten',
  'Allgemein',
]

export default function FAQsPage() {
  // Data States
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [pageConfig, setPageConfig] = useState<FAQPageConfig>(defaultConfig)
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // UI States
  const [activeTab, setActiveTab] = useState<'faqs' | 'config' | 'seo'>('faqs')
  const [roleTab, setRoleTab] = useState<'STYLIST' | 'SALON_OWNER'>('STYLIST')
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [hasChanges, setHasChanges] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  
  // Edit Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentFAQ, setCurrentFAQ] = useState<Partial<FAQ>>(emptyFAQ)
  const [isEditing, setIsEditing] = useState(false)
  const [isSavingFAQ, setIsSavingFAQ] = useState(false)

  // Fetch Data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [faqsRes, configRes] = await Promise.all([
        fetch('/api/admin/faqs?includeInactive=true'),
        fetch('/api/admin/faq-page-config'),
      ])

      if (faqsRes.ok) {
        const data = await faqsRes.json()
        if (Array.isArray(data)) {
          setFaqs(data)
        }
      }

      if (configRes.ok) {
        const configData = await configRes.json()
        setPageConfig(configData)
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

  // Config Update Helper
  const updateConfig = <K extends keyof FAQPageConfig>(key: K, value: FAQPageConfig[K]) => {
    setPageConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Save Config
  const handleSaveConfig = async () => {
    if (!pageConfig.heroTitle) {
      toast.error('Hero-Titel ist erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/faq-page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageConfig),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success('Konfiguration gespeichert!')
      setHasChanges(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  // FAQ CRUD Operations
  const handleSaveFAQ = async () => {
    if (!currentFAQ.question || !currentFAQ.answer || !currentFAQ.role) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    setIsSavingFAQ(true)
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFAQ),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      const savedFAQ = await res.json()
      toast.success(isEditing ? 'FAQ aktualisiert!' : 'FAQ erstellt!')
      setEditDialogOpen(false)
      setCurrentFAQ(emptyFAQ)
      setIsEditing(false)
      await fetchData()
      
      if (savedFAQ?.role && savedFAQ.role !== roleTab) {
        setRoleTab(savedFAQ.role)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSavingFAQ(false)
    }
  }

  const handleDeleteFAQ = async (faqId: string) => {
    if (!confirm('Möchten Sie dieses FAQ wirklich löschen?')) return

    try {
      const res = await fetch(`/api/admin/faqs?id=${faqId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete FAQ')
      toast.success('FAQ gelöscht')
      fetchData()
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  const openEditDialog = (faq?: FAQ) => {
    if (faq) {
      setCurrentFAQ({ ...faq })
      setIsEditing(true)
    } else {
      setCurrentFAQ({ ...emptyFAQ, role: roleTab })
      setIsEditing(false)
    }
    setEditDialogOpen(true)
  }

  const updateSortOrder = async (id: string, newSortOrder: number) => {
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, sortOrder: newSortOrder }),
      })
      if (!res.ok) throw new Error('Failed to update sort order')
      fetchData()
    } catch {
      toast.error('Fehler beim Aktualisieren der Reihenfolge')
    }
  }

  // Reorder FAQs via Drag & Drop
  const handleReorderFAQs = async (reorderedItems: FAQ[]) => {
    // Optimistisches Update nur für gefilterte Liste
    const otherFAQs = faqs.filter(f => 
      f.role !== roleTab || 
      (!showInactive && !f.isActive) ||
      (filterCategory !== 'all' && f.category !== filterCategory)
    )
    const updatedFAQs = [
      ...otherFAQs,
      ...reorderedItems.map((item, index) => ({ ...item, sortOrder: index }))
    ]
    setFaqs(updatedFAQs)
    
    try {
      // Alle sortOrder-Änderungen parallel senden
      await Promise.all(
        reorderedItems.map((item, index) =>
          fetch('/api/admin/faqs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, sortOrder: index }),
          })
        )
      )
      toast.success('Reihenfolge aktualisiert')
    } catch {
      // Bei Fehler: Daten neu laden
      fetchData()
      toast.error('Fehler beim Speichern der Reihenfolge')
    }
  }

  // Filtered FAQs
  const filteredFAQs = faqs.filter((faq) => {
    if (faq.role !== roleTab) return false
    if (!showInactive && !faq.isActive) return false
    if (filterCategory !== 'all' && faq.category !== filterCategory) return false
    return true
  }).sort((a, b) => a.sortOrder - b.sortOrder)

  const previewFAQs = faqs.filter(f => f.isActive).sort((a, b) => a.sortOrder - b.sortOrder)

  // Stats
  const stats = {
    total: faqs.filter(f => f.role === roleTab).length,
    active: faqs.filter(f => f.role === roleTab && f.isActive).length,
    homepage: faqs.filter(f => f.role === roleTab && f.showOnHomepage).length,
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
            <HelpCircle className="h-8 w-8 text-primary" />
            FAQs
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie häufig gestellte Fragen und die FAQ-Seiten-Konfiguration
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
            Zurücksetzen
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
          </Button>
          {activeTab === 'config' && (
            <Button onClick={handleSaveConfig} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Speichern</>
              )}
            </Button>
          )}
          {activeTab === 'faqs' && (
            <Button onClick={() => openEditDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Neues FAQ
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'faqs' | 'config' | 'seo')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faqs" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Konfiguration
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* FAQs Tab */}
            <TabsContent value="faqs" className="space-y-6 mt-6">
              {/* Role Tabs */}
              <Tabs value={roleTab} onValueChange={(v) => setRoleTab(v as 'STYLIST' | 'SALON_OWNER')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="STYLIST" className="flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    Stuhlmieter
                    <Badge variant="secondary" className="ml-1">{faqs.filter(f => f.role === 'STYLIST').length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="SALON_OWNER" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Salonbesitzer
                    <Badge variant="secondary" className="ml-1">{faqs.filter(f => f.role === 'SALON_OWNER').length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Gesamt</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <p className="text-xs text-muted-foreground">Aktiv</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-primary">{stats.homepage}</div>
                    <p className="text-xs text-muted-foreground">Homepage</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Kategorie:</Label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="showInactive" checked={showInactive} onCheckedChange={setShowInactive} />
                      <Label htmlFor="showInactive" className="text-sm cursor-pointer">Inaktive anzeigen</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQs List */}
              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Keine FAQs gefunden.</p>
                    <Button variant="outline" className="mt-4" onClick={() => openEditDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Erstes FAQ erstellen
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <SortableList
                  items={filteredFAQs}
                  onReorder={handleReorderFAQs}
                  renderItem={(faq) => (
                    <Card className={`${!faq.isActive ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-sm">{faq.question}</h3>
                              {faq.category && (
                                <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                              )}
                              {faq.showOnHomepage && (
                                <Badge className="text-xs bg-primary/20 text-primary">Homepage</Badge>
                              )}
                              {!faq.isActive && (
                                <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{faq.answer}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(faq)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteFAQ(faq.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                />
              )}
            </TabsContent>

            {/* Config Tab */}
            <TabsContent value="config" className="space-y-6 mt-6">
              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Hero-Bereich
                  </CardTitle>
                  <CardDescription>Der obere Bereich der FAQ-Seite</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge-Text</Label>
                    <Input
                      value={pageConfig.heroBadgeText}
                      onChange={(e) => updateConfig('heroBadgeText', e.target.value)}
                      placeholder="z.B. Häufig gestellte Fragen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titel *</Label>
                    <Input
                      value={pageConfig.heroTitle}
                      onChange={(e) => updateConfig('heroTitle', e.target.value)}
                      placeholder="z.B. Ihre Fragen beantwortet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={pageConfig.heroDescription}
                      onChange={(e) => updateConfig('heroDescription', e.target.value)}
                      placeholder="Beschreibungstext"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    FAQ-Bereich
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input
                      value={pageConfig.sectionTitle}
                      onChange={(e) => updateConfig('sectionTitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={pageConfig.sectionDescription}
                      onChange={(e) => updateConfig('sectionDescription', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tab Labels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Tab-Labels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Salonbesitzer</Label>
                      <Input
                        value={pageConfig.salonTabLabel}
                        onChange={(e) => updateConfig('salonTabLabel', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stuhlmieter</Label>
                      <Input
                        value={pageConfig.stylistTabLabel}
                        onChange={(e) => updateConfig('stylistTabLabel', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Kontakt-Bereich
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <Textarea
                      value={pageConfig.contactText}
                      onChange={(e) => updateConfig('contactText', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Link-Text</Label>
                      <Input
                        value={pageConfig.contactLinkText}
                        onChange={(e) => updateConfig('contactLinkText', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link-URL</Label>
                      <Input
                        value={pageConfig.contactLinkUrl}
                        onChange={(e) => updateConfig('contactLinkUrl', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
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
                  <CardDescription>
                    Optimiere die Sichtbarkeit der FAQ-Seite in Suchmaschinen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SEOSection
                    metaTitle={pageConfig.metaTitle}
                    metaDescription={pageConfig.metaDescription}
                    fallbackTitle="FAQ - Häufige Fragen | NICNOA"
                    fallbackDescription="Antworten auf häufig gestellte Fragen zu NICNOA. Hilfe für Salonbesitzer und Stuhlmieter."
                    url="nicnoa.de › faq"
                    onTitleChange={(value) => updateConfig('metaTitle', value || null)}
                    onDescriptionChange={(value) => updateConfig('metaDescription', value || null)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            {/* Preview Controls */}
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
                <div className={`mx-auto transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-[375px] px-4 pb-4' : 'w-full'}`}>
                  {/* FAQ Page Preview */}
                  <div className={`border rounded-xl overflow-hidden bg-background ${previewDevice === 'mobile' ? 'aspect-[9/16]' : 'aspect-[4/3]'}`}>
                    <div className="h-full overflow-y-auto">
                      {/* Hero */}
                      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-background p-6 text-center space-y-3">
                        {pageConfig.heroBadgeText && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                            <HelpCircle className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium text-primary">{pageConfig.heroBadgeText}</span>
                          </div>
                        )}
                        <h1 className={`font-bold tracking-tight ${previewDevice === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                          {pageConfig.heroTitle || 'Ihre Fragen beantwortet'}
                        </h1>
                        {pageConfig.heroDescription && (
                          <p className="text-muted-foreground text-sm max-w-md mx-auto">
                            {pageConfig.heroDescription}
                          </p>
                        )}
                      </div>

                      {/* Section Header */}
                      {(pageConfig.sectionTitle || pageConfig.sectionDescription) && (
                        <div className="text-center p-4 space-y-1">
                          {pageConfig.sectionTitle && (
                            <h2 className="text-lg font-semibold">{pageConfig.sectionTitle}</h2>
                          )}
                          {pageConfig.sectionDescription && (
                            <p className="text-xs text-muted-foreground">{pageConfig.sectionDescription}</p>
                          )}
                        </div>
                      )}

                      {/* Tabs */}
                      <div className="px-4">
                        <div className="flex gap-2 mb-4">
                          <div className="flex-1 text-center py-2 px-3 rounded-md bg-primary/10 border border-primary/20">
                            <div className="flex items-center justify-center gap-1.5">
                              <Building2 className="h-3 w-3 text-primary" />
                              <span className="text-xs font-medium text-primary">
                                {previewDevice === 'mobile' ? 'Salon' : pageConfig.salonTabLabel}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 text-center py-2 px-3 rounded-md bg-muted">
                            <div className="flex items-center justify-center gap-1.5">
                              <Scissors className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {previewDevice === 'mobile' ? 'Stylist' : pageConfig.stylistTabLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-2 pb-4">
                          {previewFAQs.filter(f => f.role === 'SALON_OWNER').slice(0, 4).map((faq, i) => (
                            <div key={faq.id} className="border rounded-lg p-3 bg-card">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium line-clamp-1">{faq.question}</span>
                                <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                              </div>
                            </div>
                          ))}
                          {previewFAQs.filter(f => f.role === 'SALON_OWNER').length === 0 && (
                            <div className="text-center py-4 text-xs text-muted-foreground">
                              Keine FAQs vorhanden
                            </div>
                          )}
                        </div>

                        {/* Contact */}
                        {pageConfig.contactText && (
                          <div className="text-center text-xs text-muted-foreground py-4 border-t">
                            {pageConfig.contactText}{' '}
                            <span className="text-primary font-medium">{pageConfig.contactLinkText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground py-3">
                  Echtzeit-Vorschau der FAQ-Seite
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-500">Tipp</p>
                    <p className="text-muted-foreground mt-1">
                      {activeTab === 'faqs' 
                        ? 'Markieren Sie wichtige FAQs für die Homepage-Anzeige'
                        : 'Änderungen werden erst nach dem Speichern übernommen'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit FAQ Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'FAQ bearbeiten' : 'Neues FAQ erstellen'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Bearbeiten Sie die FAQ-Informationen' : 'Erstellen Sie ein neues FAQ'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Role */}
            <div className="space-y-2">
              <Label>Rolle *</Label>
              <Select
                value={currentFAQ.role}
                onValueChange={(value: 'STYLIST' | 'SALON_OWNER') => setCurrentFAQ({ ...currentFAQ, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STYLIST">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                      Stuhlmieter
                    </div>
                  </SelectItem>
                  <SelectItem value="SALON_OWNER">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Salonbesitzer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select
                value={currentFAQ.category || 'none'}
                onValueChange={(value) => setCurrentFAQ({ ...currentFAQ, category: value === 'none' ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Kategorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question */}
            <div className="space-y-2">
              <Label>Frage *</Label>
              <Input
                value={currentFAQ.question || ''}
                onChange={(e) => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
                placeholder="z.B. Wie kann ich eine neue Buchung erstellen?"
              />
            </div>

            {/* Answer */}
            <div className="space-y-2">
              <Label>Antwort *</Label>
              <Textarea
                value={currentFAQ.answer || ''}
                onChange={(e) => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
                placeholder="Die ausführliche Antwort..."
                rows={6}
              />
            </div>

            {/* Sort & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sortierung</Label>
                <Input
                  type="number"
                  value={currentFAQ.sortOrder || 0}
                  onChange={(e) => setCurrentFAQ({ ...currentFAQ, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  checked={currentFAQ.isActive !== false}
                  onCheckedChange={(checked) => setCurrentFAQ({ ...currentFAQ, isActive: checked })}
                />
                <Label className="cursor-pointer">Aktiv</Label>
              </div>
            </div>

            {/* Homepage */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Auf Homepage anzeigen</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    FAQ wird in der FAQ-Sektion auf der Startseite angezeigt
                  </p>
                </div>
                <Switch
                  checked={currentFAQ.showOnHomepage === true}
                  onCheckedChange={(checked) => setCurrentFAQ({ ...currentFAQ, showOnHomepage: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveFAQ} disabled={isSavingFAQ}>
              {isSavingFAQ ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Speichern</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
