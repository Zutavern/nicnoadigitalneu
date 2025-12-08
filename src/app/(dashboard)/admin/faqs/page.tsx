'use client'

import { useState, useEffect } from 'react'
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
  Users,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toast } from 'sonner'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  role: 'STYLIST' | 'SALON_OWNER'
  isActive: boolean
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
}

const emptyFAQ: Partial<FAQ> = {
  question: '',
  answer: '',
  category: null,
  role: 'STYLIST',
  isActive: true,
  sortOrder: 0,
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
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentFAQ, setCurrentFAQ] = useState<Partial<FAQ>>(emptyFAQ)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'STYLIST' | 'SALON_OWNER'>('STYLIST')
  const [showInactive, setShowInactive] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  
  // Page Config States
  const [mainTab, setMainTab] = useState<'faqs' | 'config'>('faqs')
  const [pageConfig, setPageConfig] = useState<FAQPageConfig>({
    heroBadgeText: '',
    heroTitle: '',
    heroDescription: '',
    sectionTitle: '',
    sectionDescription: '',
    salonTabLabel: 'Für Salon-Space Betreiber',
    stylistTabLabel: 'Für Stuhlmieter',
    contactText: '',
    contactLinkText: 'Support-Team',
    contactLinkUrl: '/support',
  })
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchFAQs()
    if (mainTab === 'config') {
      fetchPageConfig()
    }
  }, [showInactive, mainTab])

  const fetchFAQs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/faqs?includeInactive=true')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch`)
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setFaqs(data)
      } else {
        setFaqs([])
        toast.error('Ungültiges Datenformat erhalten')
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
      toast.error(`Fehler beim Laden der FAQs: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setFaqs([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveFAQ = async () => {
    if (!currentFAQ.question || !currentFAQ.answer || !currentFAQ.role) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    setIsSaving(true)
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
      console.log('Saved FAQ:', savedFAQ)
      
      toast.success(isEditing ? 'FAQ aktualisiert!' : 'FAQ erstellt!')
      setEditDialogOpen(false)
      setCurrentFAQ(emptyFAQ)
      setIsEditing(false)
      
      // Sofort aktualisieren
      await fetchFAQs()
      
      // Wenn wir im falschen Tab sind, wechsle zum richtigen Tab
      if (savedFAQ?.role && savedFAQ.role !== activeTab) {
        setActiveTab(savedFAQ.role)
      }
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFAQ = async (faqId: string) => {
    if (!confirm('Möchten Sie dieses FAQ wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return

    try {
      const res = await fetch(`/api/admin/faqs?id=${faqId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete FAQ')

      toast.success('FAQ gelöscht')
      fetchFAQs()
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }

  const openEditDialog = (faq?: FAQ) => {
    if (faq) {
      setCurrentFAQ({ ...faq })
      setIsEditing(true)
    } else {
      setCurrentFAQ({ ...emptyFAQ, role: activeTab })
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
      
      fetchFAQs()
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Reihenfolge')
    }
  }

  const fetchPageConfig = async () => {
    setIsLoadingConfig(true)
    try {
      const res = await fetch('/api/admin/faq-page-config')
      if (res.ok) {
        const data = await res.json()
        setPageConfig(data)
      }
    } catch (error) {
      console.error('Error fetching page config:', error)
      toast.error('Fehler beim Laden der Konfiguration')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const handleSavePageConfig = async () => {
    if (!pageConfig.heroTitle) {
      toast.error('Hero-Titel ist erforderlich')
      return
    }

    setIsSavingConfig(true)
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

      toast.success('Seiten-Konfiguration gespeichert!')
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Speichern')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const filteredFAQs = faqs.filter((faq) => {
    if (faq.role !== activeTab) return false
    if (!showInactive && !faq.isActive) return false
    if (filterCategory !== 'all' && faq.category !== filterCategory) return false
    return true
  }).sort((a, b) => a.sortOrder - b.sortOrder)

  const stats = {
    total: faqs.filter(f => f.role === activeTab).length,
    active: faqs.filter(f => f.role === activeTab && f.isActive).length,
    categories: Array.from(new Set(faqs.filter(f => f.role === activeTab && f.category).map(f => f.category))),
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
        {mainTab === 'faqs' && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchFAQs}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Aktualisieren
            </Button>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openEditDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Neues FAQ
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? 'FAQ bearbeiten' : 'Neues FAQ erstellen'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Bearbeiten Sie die FAQ-Informationen' : 'Erstellen Sie ein neues FAQ'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Rolle *</Label>
                  <Select
                    value={currentFAQ.role}
                    onValueChange={(value: 'STYLIST' | 'SALON_OWNER') => 
                      setCurrentFAQ({ ...currentFAQ, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STYLIST">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4" />
                          Stuhlmietern
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
                  <Label htmlFor="category">Kategorie (optional)</Label>
                  <Select
                    value={currentFAQ.category || 'none'}
                    onValueChange={(value) => 
                      setCurrentFAQ({ ...currentFAQ, category: value === 'none' ? null : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine Kategorie</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Question */}
                <div className="space-y-2">
                  <Label htmlFor="question">Frage *</Label>
                  <Input
                    id="question"
                    value={currentFAQ.question || ''}
                    onChange={(e) => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
                    placeholder="z.B. Wie kann ich eine neue Buchung erstellen?"
                  />
                </div>

                {/* Answer */}
                <div className="space-y-2">
                  <Label htmlFor="answer">Antwort *</Label>
                  <Textarea
                    id="answer"
                    value={currentFAQ.answer || ''}
                    onChange={(e) => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
                    placeholder="Die ausführliche Antwort auf die Frage..."
                    rows={6}
                  />
                </div>

                {/* Sortierung & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sortierung</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={currentFAQ.sortOrder || 0}
                      onChange={(e) => setCurrentFAQ({ ...currentFAQ, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch
                      id="isActive"
                      checked={currentFAQ.isActive !== false}
                      onCheckedChange={(checked) => setCurrentFAQ({ ...currentFAQ, isActive: checked })}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Aktiv
                    </Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSaveFAQ} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Speichern
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'faqs' | 'config')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="faqs">
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQs verwalten
          </TabsTrigger>
          <TabsTrigger value="config">
            <FileText className="mr-2 h-4 w-4" />
            Seiten-Konfiguration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="space-y-6 mt-6">
          {/* Inner Tabs for STYLIST/SALON_OWNER */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'STYLIST' | 'SALON_OWNER')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="STYLIST" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Stuhlmietern
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium">
                  {faqs.filter(f => f.role === 'STYLIST').length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="SALON_OWNER" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Salonbesitzer
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium">
                  {faqs.filter(f => f.role === 'SALON_OWNER').length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Kategorien</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.categories.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Kategorie:</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      {stats.categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="showInactive"
                    checked={showInactive}
                    onCheckedChange={setShowInactive}
                  />
                  <Label htmlFor="showInactive" className="cursor-pointer">
                    Inaktive anzeigen
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQs List */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`h-full flex flex-col ${!faq.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Drag Handle */}
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <span className="text-xs text-muted-foreground font-mono">
                          {faq.sortOrder}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{faq.question}</h3>
                              {faq.category && (
                                <Badge variant="outline" className="text-xs">
                                  {faq.category}
                                </Badge>
                              )}
                              {!faq.isActive && (
                                <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(faq)}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSortOrder(faq.id, faq.sortOrder - 1)}
                            disabled={faq.sortOrder === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSortOrder(faq.id, faq.sortOrder + 1)}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFAQ(faq.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Keine FAQs gefunden.</p>
              </CardContent>
            </Card>
          )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Page Config Tab */}
        <TabsContent value="config" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Config Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>FAQ-Seiten-Konfiguration</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Verwalten Sie alle statischen Inhalte der FAQ-Seite
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoadingConfig ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* Hero Section */}
                      <div className="space-y-4 border-b pb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-primary" />
                          Hero-Bereich
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="heroBadgeText">Badge-Text</Label>
                          <Input
                            id="heroBadgeText"
                            value={pageConfig.heroBadgeText}
                            onChange={(e) => setPageConfig({ ...pageConfig, heroBadgeText: e.target.value })}
                            placeholder="z.B. Häufig gestellte Fragen"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heroTitle">Titel *</Label>
                          <Input
                            id="heroTitle"
                            value={pageConfig.heroTitle}
                            onChange={(e) => setPageConfig({ ...pageConfig, heroTitle: e.target.value })}
                            placeholder="z.B. Ihre Fragen beantwortet"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heroDescription">Beschreibung</Label>
                          <Textarea
                            id="heroDescription"
                            value={pageConfig.heroDescription}
                            onChange={(e) => setPageConfig({ ...pageConfig, heroDescription: e.target.value })}
                            placeholder="Beschreibungstext für den Hero-Bereich"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Section Header */}
                      <div className="space-y-4 border-b pb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          FAQ-Bereich Header
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="sectionTitle">Titel</Label>
                          <Input
                            id="sectionTitle"
                            value={pageConfig.sectionTitle}
                            onChange={(e) => setPageConfig({ ...pageConfig, sectionTitle: e.target.value })}
                            placeholder="z.B. Frequently Asked Questions"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sectionDescription">Beschreibung</Label>
                          <Textarea
                            id="sectionDescription"
                            value={pageConfig.sectionDescription}
                            onChange={(e) => setPageConfig({ ...pageConfig, sectionDescription: e.target.value })}
                            placeholder="Beschreibungstext für den FAQ-Bereich"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Tab Labels */}
                      <div className="space-y-4 border-b pb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Tab-Labels
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="salonTabLabel">Salon-Tab Label</Label>
                            <Input
                              id="salonTabLabel"
                              value={pageConfig.salonTabLabel}
                              onChange={(e) => setPageConfig({ ...pageConfig, salonTabLabel: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stylistTabLabel">Stylist-Tab Label</Label>
                            <Input
                              id="stylistTabLabel"
                              value={pageConfig.stylistTabLabel}
                              onChange={(e) => setPageConfig({ ...pageConfig, stylistTabLabel: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-primary" />
                          Kontakt-Bereich
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="contactText">Kontakt-Text</Label>
                          <Textarea
                            id="contactText"
                            value={pageConfig.contactText}
                            onChange={(e) => setPageConfig({ ...pageConfig, contactText: e.target.value })}
                            placeholder="z.B. Können Sie nicht finden, wonach Sie suchen? Kontaktieren Sie unser"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactLinkText">Link-Text</Label>
                            <Input
                              id="contactLinkText"
                              value={pageConfig.contactLinkText}
                              onChange={(e) => setPageConfig({ ...pageConfig, contactLinkText: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactLinkUrl">Link-URL</Label>
                            <Input
                              id="contactLinkUrl"
                              value={pageConfig.contactLinkUrl}
                              onChange={(e) => setPageConfig({ ...pageConfig, contactLinkUrl: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={fetchPageConfig}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Zurücksetzen
                        </Button>
                        <Button
                          onClick={handleSavePageConfig}
                          disabled={isSavingConfig || !pageConfig.heroTitle}
                        >
                          {isSavingConfig ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Speichern...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Konfiguration speichern
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="lg:sticky lg:top-6 h-fit">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Live-Vorschau
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      So wird die FAQ-Seite für Besucher angezeigt
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg bg-background p-6 space-y-6 max-h-[800px] overflow-y-auto">
                      {/* Hero Preview */}
                      <div className="text-center space-y-4 border-b pb-6">
                        {pageConfig.heroBadgeText && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">{pageConfig.heroBadgeText}</span>
                          </div>
                        )}
                        <h1 className="text-3xl font-bold tracking-tight">
                          {pageConfig.heroTitle || 'Ihre Fragen beantwortet'}
                        </h1>
                        {pageConfig.heroDescription && (
                          <p className="text-muted-foreground">
                            {pageConfig.heroDescription}
                          </p>
                        )}
                      </div>

                      {/* Section Header Preview */}
                      {(pageConfig.sectionTitle || pageConfig.sectionDescription) && (
                        <div className="text-center space-y-2">
                          {pageConfig.sectionTitle && (
                            <h2 className="text-2xl font-semibold">
                              {pageConfig.sectionTitle}
                            </h2>
                          )}
                          {pageConfig.sectionDescription && (
                            <p className="text-muted-foreground text-sm">
                              {pageConfig.sectionDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Tabs Preview with FAQs */}
                      <Tabs defaultValue="SALON_OWNER" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="SALON_OWNER" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {pageConfig.salonTabLabel}
                          </TabsTrigger>
                          <TabsTrigger value="STYLIST" className="flex items-center gap-2">
                            <Scissors className="h-4 w-4" />
                            {pageConfig.stylistTabLabel}
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="SALON_OWNER" className="mt-4">
                          <Accordion type="single" collapsible className="w-full space-y-2">
                            {faqs
                              .filter(f => f.role === 'SALON_OWNER' && f.isActive)
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((faq) => (
                                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                                  <AccordionTrigger className="text-left font-semibold">
                                    {faq.question}
                                  </AccordionTrigger>
                                  <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            {faqs.filter(f => f.role === 'SALON_OWNER' && f.isActive).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Keine FAQs für Salonbesitzer vorhanden
                              </p>
                            )}
                          </Accordion>
                        </TabsContent>

                        <TabsContent value="STYLIST" className="mt-4">
                          <Accordion type="single" collapsible className="w-full space-y-2">
                            {faqs
                              .filter(f => f.role === 'STYLIST' && f.isActive)
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((faq) => (
                                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                                  <AccordionTrigger className="text-left font-semibold">
                                    {faq.question}
                                  </AccordionTrigger>
                                  <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            {faqs.filter(f => f.role === 'STYLIST' && f.isActive).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Keine FAQs für Stuhlmieter vorhanden
                              </p>
                            )}
                          </Accordion>
                        </TabsContent>
                      </Tabs>

                      {/* Contact Preview */}
                      {pageConfig.contactText && (
                        <div className="text-center text-sm text-muted-foreground border-t pt-4">
                          {pageConfig.contactText}{' '}
                          <span className="text-primary font-medium">
                            {pageConfig.contactLinkText}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

