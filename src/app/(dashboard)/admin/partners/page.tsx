'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HandshakeIcon,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  RefreshCw,
  Upload,
  X,
  Image as ImageIcon,
  Scissors,
  Calendar,
  Calculator,
  Sparkles,
  ExternalLink,
  FileText,
  Eye,
  Shield,
  Gift,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Partner {
  id: string
  name: string
  slug: string
  category: 'tools' | 'booking' | 'finance'
  description: string
  offer: string
  code: string | null
  instructions: string[]
  link: string
  logoUrl: string | null
  isHighlight: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface PartnerPageConfig {
  id?: string
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  heroFeature1Text: string
  heroFeature2Text: string
  heroFeature3Text: string
  cardCtaText: string
  cardCtaLink: string
  cardCtaButtonText: string
  ctaTitle: string
  ctaDescription: string
  ctaButton1Text: string
  ctaButton1Link: string
  ctaButton2Text: string
  ctaButton2Link: string
}

const emptyPartner: Partial<Partner> = {
  name: '',
  slug: '',
  category: 'tools',
  description: '',
  offer: '',
  code: null,
  instructions: [],
  link: '',
  logoUrl: null,
  isHighlight: false,
  isActive: true,
  sortOrder: 0,
}

const categories = [
  { value: 'tools', label: 'Tools & Produkte', icon: Scissors },
  { value: 'booking', label: 'Buchung & Kassensysteme', icon: Calendar },
  { value: 'finance', label: 'Finanzen & Versicherungen', icon: Calculator },
]

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentPartner, setCurrentPartner] = useState<Partial<Partner>>(emptyPartner)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [instructionInput, setInstructionInput] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)
  
  // Page Config States
  const [mainTab, setMainTab] = useState<'partners' | 'config'>('partners')
  const [pageConfig, setPageConfig] = useState<PartnerPageConfig>({
    heroBadgeText: '',
    heroTitle: '',
    heroDescription: '',
    heroFeature1Text: '',
    heroFeature2Text: '',
    heroFeature3Text: '',
    cardCtaText: '',
    cardCtaLink: '/registrieren',
    cardCtaButtonText: 'Jetzt Mitglied werden',
    ctaTitle: '',
    ctaDescription: '',
    ctaButton1Text: 'Jetzt registrieren',
    ctaButton1Link: '/registrieren',
    ctaButton2Text: 'Preise ansehen',
    ctaButton2Link: '/preise',
  })
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchPartners()
    if (mainTab === 'config') {
      fetchPageConfig()
    }
  }, [showInactive, mainTab])

  const fetchPartners = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/partners?includeInactive=true')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch`)
      }
      const data = await res.json()
      console.log('Fetched partners:', data)
      if (Array.isArray(data)) {
        setPartners(data)
      } else {
        console.error('Invalid response format:', data)
        setPartners([])
        toast.error('Ungültiges Datenformat erhalten')
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
      toast.error(`Fehler beim Laden der Partner: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setPartners([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePartner = async () => {
    if (!currentPartner.name || !currentPartner.slug || !currentPartner.category || 
        !currentPartner.description || !currentPartner.offer || !currentPartner.link) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    setIsSaving(true)
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/partners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPartner),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success(isEditing ? 'Partner aktualisiert!' : 'Partner erstellt!')
      setEditDialogOpen(false)
      setCurrentPartner(emptyPartner)
      fetchPartners()
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Möchten Sie diesen Partner wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return

    try {
      const res = await fetch(`/api/admin/partners?id=${partnerId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete partner')

      toast.success('Partner gelöscht')
      fetchPartners()
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }

  const openEditDialog = (partner?: Partner) => {
    if (partner) {
      setCurrentPartner(partner)
      setIsEditing(true)
    } else {
      setCurrentPartner(emptyPartner)
      setIsEditing(false)
    }
    setEditDialogOpen(true)
  }

  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (currentPartner.id) {
        formData.append('partnerId', currentPartner.id)
      }

      const res = await fetch('/api/admin/partners/upload-logo', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Upload')
      }

      const data = await res.json()
      setCurrentPartner({ ...currentPartner, logoUrl: data.url })
      toast.success('Logo erfolgreich hochgeladen!')
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Upload')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const addInstruction = () => {
    if (!instructionInput.trim()) return
    setCurrentPartner({
      ...currentPartner,
      instructions: [...(currentPartner.instructions || []), instructionInput.trim()]
    })
    setInstructionInput('')
  }

  const removeInstruction = (index: number) => {
    setCurrentPartner({
      ...currentPartner,
      instructions: currentPartner.instructions?.filter((_, i) => i !== index) || []
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const fetchPageConfig = async () => {
    setIsLoadingConfig(true)
    try {
      const res = await fetch('/api/admin/partner-page-config')
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
      const res = await fetch('/api/admin/partner-page-config', {
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

  const filteredPartners = partners.filter((partner) => {
    if (filterCategory !== 'all' && partner.category !== filterCategory) return false
    if (!showInactive && !partner.isActive) return false
    return true
  })

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.isActive).length,
    tools: partners.filter(p => p.category === 'tools').length,
    booking: partners.filter(p => p.category === 'booking').length,
    finance: partners.filter(p => p.category === 'finance').length,
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
            <HandshakeIcon className="h-8 w-8 text-primary" />
            Partner & Vorteile
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Partner und die Partner-Seiten-Konfiguration
          </p>
        </div>
        {mainTab === 'partners' && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchPartners}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Aktualisieren
            </Button>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openEditDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Neuer Partner
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? 'Partner bearbeiten' : 'Neuen Partner erstellen'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Bearbeiten Sie die Partner-Informationen' : 'Erstellen Sie einen neuen Partner mit allen Details'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    {currentPartner.logoUrl ? (
                      <div className="relative">
                        <img 
                          src={currentPartner.logoUrl} 
                          alt="Logo" 
                          className="h-20 w-20 object-contain border rounded-lg p-2"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => setCurrentPartner({ ...currentPartner, logoUrl: null })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 border-2 border-dashed rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleLogoUpload(file)
                        }}
                        disabled={isUploadingLogo}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        SVG, PNG, JPG oder WebP (max. 5MB)
                      </p>
                    </div>
                  </div>
                  {isUploadingLogo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logo wird hochgeladen...
                    </div>
                  )}
                </div>

                {/* Name & Slug */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={currentPartner.name || ''}
                      onChange={(e) => {
                        const name = e.target.value
                        setCurrentPartner({
                          ...currentPartner,
                          name,
                          slug: !isEditing ? generateSlug(name) : currentPartner.slug,
                        })
                      }}
                      placeholder="z.B. WELLA DEAL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={currentPartner.slug || ''}
                      onChange={(e) => setCurrentPartner({ ...currentPartner, slug: e.target.value })}
                      placeholder="z.B. wella-deal"
                    />
                  </div>
                </div>

                {/* Kategorie */}
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select
                    value={currentPartner.category}
                    onValueChange={(value: 'tools' | 'booking' | 'finance') => 
                      setCurrentPartner({ ...currentPartner, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => {
                        const Icon = cat.icon
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Beschreibung */}
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung (öffentlich) *</Label>
                  <Textarea
                    id="description"
                    value={currentPartner.description || ''}
                    onChange={(e) => setCurrentPartner({ ...currentPartner, description: e.target.value })}
                    placeholder="Kurze Beschreibung des Partners..."
                    rows={3}
                  />
                </div>

                {/* Angebot */}
                <div className="space-y-2">
                  <Label htmlFor="offer">Angebot/Vorteil (öffentlich) *</Label>
                  <Textarea
                    id="offer"
                    value={currentPartner.offer || ''}
                    onChange={(e) => setCurrentPartner({ ...currentPartner, offer: e.target.value })}
                    placeholder="z.B. 40% Rabatt + 4% Bonus..."
                    rows={2}
                  />
                </div>

                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">Code (optional)</Label>
                  <Input
                    id="code"
                    value={currentPartner.code || ''}
                    onChange={(e) => setCurrentPartner({ ...currentPartner, code: e.target.value || null })}
                    placeholder="z.B. NICNOA10"
                  />
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label htmlFor="link">Partner-Link *</Label>
                  <Input
                    id="link"
                    type="url"
                    value={currentPartner.link || ''}
                    onChange={(e) => setCurrentPartner({ ...currentPartner, link: e.target.value })}
                    placeholder="https://partner-website.com"
                  />
                </div>

                {/* Anleitungen (nur intern) */}
                <div className="space-y-2">
                  <Label>Anleitungen (nur intern sichtbar)</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={instructionInput}
                        onChange={(e) => setInstructionInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addInstruction()
                          }
                        }}
                        placeholder="Schritt hinzufügen..."
                      />
                      <Button type="button" onClick={addInstruction} size="sm">
                        Hinzufügen
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {currentPartner.instructions?.map((instruction, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="flex-1 text-sm">{instruction}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInstruction(idx)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sortierung & Status */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sortierung</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={currentPartner.sortOrder || 0}
                      onChange={(e) => setCurrentPartner({ ...currentPartner, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch
                      id="isHighlight"
                      checked={currentPartner.isHighlight || false}
                      onCheckedChange={(checked) => setCurrentPartner({ ...currentPartner, isHighlight: checked })}
                    />
                    <Label htmlFor="isHighlight" className="cursor-pointer">
                      Exklusiv hervorheben
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <Switch
                      id="isActive"
                      checked={currentPartner.isActive !== false}
                      onCheckedChange={(checked) => setCurrentPartner({ ...currentPartner, isActive: checked })}
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
                <Button onClick={handleSavePartner} disabled={isSaving}>
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
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'partners' | 'config')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="partners">
            <HandshakeIcon className="mr-2 h-4 w-4" />
            Partner verwalten
          </TabsTrigger>
          <TabsTrigger value="config">
            <FileText className="mr-2 h-4 w-4" />
            Seiten-Konfiguration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-6 mt-6">
          {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
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
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tools}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.booking}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Finance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.finance}</div>
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
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    )
                  })}
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

      {/* Partners List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPartners.map((partner) => {
          const category = categories.find(c => c.value === partner.category)
          const CategoryIcon = category?.icon || Scissors
          return (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`h-full flex flex-col ${!partner.isActive ? 'opacity-60' : ''} ${
                partner.isHighlight ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-background' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {partner.logoUrl ? (
                        <img 
                          src={partner.logoUrl} 
                          alt={partner.name}
                          className="h-12 w-12 object-contain border rounded-lg p-1 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <div className="text-lg font-bold text-primary">
                            {partner.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-1">{partner.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            <CategoryIcon className="mr-1 h-3 w-3" />
                            {category?.label}
                          </Badge>
                          {partner.isHighlight && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                              <Sparkles className="mr-1 h-3 w-3" />
                              Exklusiv
                            </Badge>
                          )}
                          {!partner.isActive && (
                            <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {partner.description}
                  </p>
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Angebot:</span>
                      <span className="font-medium line-clamp-1">{partner.offer}</span>
                    </div>
                    {partner.code && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Code:</span>
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {partner.code}
                        </code>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Anleitungen:</span>
                      <Badge variant="outline">{partner.instructions?.length || 0}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(partner)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={partner.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePartner(partner.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredPartners.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Keine Partner gefunden.</p>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="config" className="space-y-6 mt-6">
          {isLoadingConfig ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Config Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hero-Bereich</CardTitle>
                    <CardDescription>Konfigurieren Sie den Hero-Bereich der Partner-Seite</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Badge-Text</Label>
                      <Input
                        value={pageConfig.heroBadgeText || ''}
                        onChange={(e) => setPageConfig({ ...pageConfig, heroBadgeText: e.target.value })}
                        placeholder="z.B. Starke Partnerschaften"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Titel *</Label>
                      <Input
                        value={pageConfig.heroTitle || ''}
                        onChange={(e) => setPageConfig({ ...pageConfig, heroTitle: e.target.value })}
                        placeholder="z.B. Unsere Partner für deinen Erfolg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Beschreibung</Label>
                      <Textarea
                        value={pageConfig.heroDescription || ''}
                        onChange={(e) => setPageConfig({ ...pageConfig, heroDescription: e.target.value })}
                        placeholder="Beschreibungstext..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Feature 1</Label>
                        <Input
                          value={pageConfig.heroFeature1Text || ''}
                          onChange={(e) => setPageConfig({ ...pageConfig, heroFeature1Text: e.target.value })}
                          placeholder="z.B. Verifizierte Partner"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Feature 2</Label>
                        <Input
                          value={pageConfig.heroFeature2Text || ''}
                          onChange={(e) => setPageConfig({ ...pageConfig, heroFeature2Text: e.target.value })}
                          placeholder="z.B. Exklusive Vorteile"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Feature 3</Label>
                        <Input
                          value={pageConfig.heroFeature3Text || ''}
                          onChange={(e) => setPageConfig({ ...pageConfig, heroFeature3Text: e.target.value })}
                          placeholder="z.B. Nur für Mitglieder"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Partner-Karten CTA</CardTitle>
                    <CardDescription>Text und Link für die CTA auf Partner-Karten</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>CTA-Text</Label>
                      <Input
                        value={pageConfig.cardCtaText || ''}
                        onChange={(e) => setPageConfig({ ...pageConfig, cardCtaText: e.target.value })}
                        placeholder="z.B. Exklusive Vorteile für NICNOA Mitglieder"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Button-Text</Label>
                        <Input
                          value={pageConfig.cardCtaButtonText || ''}
                          onChange={(e) => setPageConfig({ ...pageConfig, cardCtaButtonText: e.target.value })}
                          placeholder="z.B. Jetzt Mitglied werden"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Link</Label>
                        <Input
                          value={pageConfig.cardCtaLink || ''}
                          onChange={(e) => setPageConfig({ ...pageConfig, cardCtaLink: e.target.value })}
                          placeholder="/registrieren"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>CTA-Bereich</CardTitle>
                    <CardDescription>Konfigurieren Sie den CTA-Bereich am Ende der Seite</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Titel</Label>
                      <Input
                        value={pageConfig.ctaTitle || ''}
                        onChange={(e) => setPageConfig({ ...pageConfig, ctaTitle: e.target.value })}
                        placeholder="z.B. Werde Teil unserer Community"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Beschreibung</Label>
                      <Textarea
                        value={pageConfig.ctaDescription || ''}
                        onChange={(e) => setPageConfig({ ...pageConfig, ctaDescription: e.target.value })}
                        placeholder="Beschreibungstext..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Button 1 Text</Label>
                        <Input
                          value={pageConfig.ctaButton1Text || ''}
                          onChange={(e) => setPageConfig({ ...pageConfig, ctaButton1Text: e.target.value })}
                          placeholder="z.B. Jetzt registrieren"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button 1 Link</Label>
                        <Input
                          value={pageConfig.ctaButton1Link || ''}
                          onChange={(e) => setPageConfig({ ...pageConfig, ctaButton1Link: e.target.value })}
                          placeholder="/registrieren"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Button 2 Text</Label>
                        <Input
                          value={pageConfig.ctaButton2Text || ''}
                          onChange={(e) => setPageConfig({ ...pageConfig, ctaButton2Text: e.target.value })}
                          placeholder="z.B. Preise ansehen"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button 2 Link</Label>
                        <Input
                          value={pageConfig.ctaButton2Link || ''}
                          onChange={(e) => setPageConfig({ ...pageConfig, ctaButton2Link: e.target.value })}
                          placeholder="/preise"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button onClick={handleSavePageConfig} disabled={isSavingConfig} className="flex-1">
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
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
                  </Button>
                </div>
              </div>

              {/* Live Preview */}
              {showPreview && (
                <div className="lg:sticky lg:top-6 h-fit">
                  <Card>
                    <CardHeader>
                      <CardTitle>Live-Vorschau</CardTitle>
                      <CardDescription>So wird die Seite aussehen</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6 border rounded-lg p-6 bg-background">
                        {/* Hero Preview */}
                        <div className="space-y-4">
                          {pageConfig.heroBadgeText && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                              <HandshakeIcon className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">{pageConfig.heroBadgeText}</span>
                            </div>
                          )}
                          <h2 className="text-2xl font-bold">{pageConfig.heroTitle || 'Titel'}</h2>
                          {pageConfig.heroDescription && (
                            <p className="text-sm text-muted-foreground">{pageConfig.heroDescription}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs">
                            {pageConfig.heroFeature1Text && (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-card border">
                                <Shield className="h-3 w-3 text-primary" />
                                <span>{pageConfig.heroFeature1Text}</span>
                              </div>
                            )}
                            {pageConfig.heroFeature2Text && (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-card border">
                                <Gift className="h-3 w-3 text-primary" />
                                <span>{pageConfig.heroFeature2Text}</span>
                              </div>
                            )}
                            {pageConfig.heroFeature3Text && (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-card border">
                                <Sparkles className="h-3 w-3 text-primary" />
                                <span>{pageConfig.heroFeature3Text}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card CTA Preview */}
                        <div className="border-t pt-4 space-y-2">
                          {pageConfig.cardCtaText && (
                            <p className="text-xs text-center text-muted-foreground">{pageConfig.cardCtaText}</p>
                          )}
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            {pageConfig.cardCtaButtonText || 'Button-Text'}
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        </div>

                        {/* CTA Section Preview */}
                        {(pageConfig.ctaTitle || pageConfig.ctaDescription) && (
                          <div className="border-t pt-4 space-y-4">
                            {pageConfig.ctaTitle && (
                              <h3 className="text-lg font-bold">{pageConfig.ctaTitle}</h3>
                            )}
                            {pageConfig.ctaDescription && (
                              <p className="text-sm text-muted-foreground">{pageConfig.ctaDescription}</p>
                            )}
                            <div className="flex gap-2">
                              {pageConfig.ctaButton1Text && (
                                <Button size="sm" disabled className="flex-1">
                                  {pageConfig.ctaButton1Text}
                                </Button>
                              )}
                              {pageConfig.ctaButton2Text && (
                                <Button size="sm" variant="outline" disabled className="flex-1">
                                  {pageConfig.ctaButton2Text}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

