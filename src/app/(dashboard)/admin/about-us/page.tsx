'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Users,
  Lightbulb,
  Target,
  ArrowRight,
  Linkedin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Globe,
  Monitor,
  Smartphone,
  Type,
  Image as ImageIcon,
  Layout,
  MousePointer,
} from 'lucide-react'
import { getIconComponent, iconNames } from '@/lib/icon-mapping'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
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
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { SortableList } from '@/components/ui/sortable-list'
import { ImageUploader } from '@/components/ui/image-uploader'
import { SEOSection } from '@/components/admin/seo-preview'

interface AboutUsPageConfig {
  id?: string
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  team1Name: string
  team1Role: string
  team1Description: string
  team1ImageUrl: string | null
  team1LinkedInUrl: string
  team2Name: string
  team2Role: string
  team2Description: string
  team2ImageUrl: string | null
  team2LinkedInUrl: string
  visionBadgeText: string
  visionTitle: string
  visionDescription: string
  missionBadgeText: string
  missionTitle: string
  missionDescription: string
  approachTitle: string
  approachDescription: string
  whyTitle: string
  whyDescription: string
  whyButtonText: string
  whyButtonLink: string
  metaTitle: string | null
  metaDescription: string | null
}

interface ApproachCard {
  id: string
  title: string
  description: string
  iconName: string | null
  sortOrder: number
  isActive: boolean
}

const defaultConfig: AboutUsPageConfig = {
  heroBadgeText: 'Das Team hinter NICNOA&CO.online',
  heroTitle: 'Experten für moderne Salon-Spaces',
  heroDescription: 'Wir revolutionieren die Salon-Branche mit innovativer Technologie.',
  team1Name: '',
  team1Role: '',
  team1Description: '',
  team1ImageUrl: null,
  team1LinkedInUrl: '',
  team2Name: '',
  team2Role: '',
  team2Description: '',
  team2ImageUrl: null,
  team2LinkedInUrl: '',
  visionBadgeText: 'Unsere Vision',
  visionTitle: 'Die Zukunft der Salon-Branche gestalten',
  visionDescription: '',
  missionBadgeText: 'Unsere Mission',
  missionTitle: 'Innovativ & Effizient',
  missionDescription: '',
  approachTitle: 'Unser Ansatz',
  approachDescription: 'Wie wir arbeiten und was uns auszeichnet',
  whyTitle: 'Warum wir tun, was wir tun',
  whyDescription: '',
  whyButtonText: 'Jetzt durchstarten',
  whyButtonLink: '/registrieren',
  metaTitle: null,
  metaDescription: null,
}

export default function AboutUsAdminPage() {
  const [config, setConfig] = useState<AboutUsPageConfig>(defaultConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [hasChanges, setHasChanges] = useState(false)
  
  const [approachCards, setApproachCards] = useState<ApproachCard[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [editCardDialogOpen, setEditCardDialogOpen] = useState(false)
  const [currentCard, setCurrentCard] = useState<Partial<ApproachCard>>({
    title: '',
    description: '',
    iconName: 'Target',
    sortOrder: 0,
    isActive: true,
  })
  const [isEditingCard, setIsEditingCard] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [configRes, cardsRes] = await Promise.all([
        fetch('/api/admin/about-us-page-config'),
        fetch('/api/admin/approach-cards'),
      ])
      
      if (configRes.ok) {
        const data = await configRes.json()
        setConfig({
          ...defaultConfig,
          ...data,
        })
      }
      
      if (cardsRes.ok) {
        const cardsData = await cardsRes.json()
        setApproachCards(Array.isArray(cardsData) ? cardsData : [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Fehler beim Laden der Konfiguration')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/about-us-page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success('Konfiguration erfolgreich gespeichert!')
      setHasChanges(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = <K extends keyof AboutUsPageConfig>(key: K, value: AboutUsPageConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSaveCard = async () => {
    try {
      if (!currentCard.title || !currentCard.description) {
        toast.error('Titel und Beschreibung sind erforderlich')
        return
      }

      if (isEditingCard && currentCard.id) {
        const res = await fetch(`/api/admin/approach-cards/${currentCard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentCard),
        })

        if (res.ok) {
          toast.success('Kachel erfolgreich aktualisiert')
          setEditCardDialogOpen(false)
          setCurrentCard({ title: '', description: '', iconName: 'Target', sortOrder: 0, isActive: true })
          setIsEditingCard(false)
          const cardsRes = await fetch('/api/admin/approach-cards')
          if (cardsRes.ok) {
            const cardsData = await cardsRes.json()
            setApproachCards(Array.isArray(cardsData) ? cardsData : [])
          }
        } else {
          const error = await res.json()
          toast.error(error.error || 'Fehler beim Aktualisieren')
        }
      } else {
        const maxSortOrder = approachCards.length > 0 
          ? Math.max(...approachCards.map(c => c.sortOrder)) + 1 
          : 0
        
        const res = await fetch('/api/admin/approach-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentCard,
            sortOrder: maxSortOrder,
          }),
        })

        if (res.ok) {
          toast.success('Kachel erfolgreich erstellt')
          setEditCardDialogOpen(false)
          setCurrentCard({ title: '', description: '', iconName: 'Target', sortOrder: 0, isActive: true })
          const cardsRes = await fetch('/api/admin/approach-cards')
          if (cardsRes.ok) {
            const cardsData = await cardsRes.json()
            setApproachCards(Array.isArray(cardsData) ? cardsData : [])
          }
        } else {
          const error = await res.json()
          toast.error(error.error || 'Fehler beim Erstellen')
        }
      }
    } catch (error) {
      console.error('Error saving card:', error)
      toast.error('Fehler beim Speichern der Kachel')
    }
  }

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Möchten Sie diese Kachel wirklich löschen?')) return

    try {
      const res = await fetch(`/api/admin/approach-cards/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Kachel erfolgreich gelöscht')
        setApproachCards(prev => prev.filter(c => c.id !== id))
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Error deleting card:', error)
      toast.error('Fehler beim Löschen der Kachel')
    }
  }

  const handleReorderCards = async (reorderedCards: ApproachCard[]) => {
    const updatedCards = reorderedCards.map((card, index) => ({ ...card, sortOrder: index }))
    setApproachCards(updatedCards)

    try {
      const res = await fetch('/api/admin/approach-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: updatedCards }),
      })

      if (!res.ok) {
        toast.error('Fehler beim Speichern der Reihenfolge')
        const cardsRes = await fetch('/api/admin/approach-cards')
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json()
          setApproachCards(Array.isArray(cardsData) ? cardsData : [])
        }
      }
    } catch (error) {
      console.error('Error reordering cards:', error)
    }
  }

  const approaches = approachCards
    .filter((card) => card.isActive)
    .map((card) => ({
      icon: getIconComponent(card.iconName),
      title: card.title,
      description: card.description,
    }))

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
            <Users className="h-8 w-8 text-primary" />
            Über uns
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle Inhalte der Über-uns-Seite
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
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="hero" className="text-xs sm:text-sm">
                <Layout className="mr-1 h-4 w-4 hidden sm:inline" />
                Hero
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs sm:text-sm">
                <Users className="mr-1 h-4 w-4 hidden sm:inline" />
                Team
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm">
                <Type className="mr-1 h-4 w-4 hidden sm:inline" />
                Inhalte
              </TabsTrigger>
              <TabsTrigger value="cards" className="text-xs sm:text-sm">
                <MousePointer className="mr-1 h-4 w-4 hidden sm:inline" />
                Kacheln
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm">
                <Search className="mr-1 h-4 w-4 hidden sm:inline" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* Hero Tab */}
            <TabsContent value="hero" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-primary" />
                    Hero-Bereich
                  </CardTitle>
                  <CardDescription>Hauptbereich am Anfang der Seite</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge-Text</Label>
                    <Input
                      value={config.heroBadgeText}
                      onChange={(e) => updateConfig('heroBadgeText', e.target.value)}
                      placeholder="z.B. Das Team hinter NICNOA&CO.online"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input
                      value={config.heroTitle}
                      onChange={(e) => updateConfig('heroTitle', e.target.value)}
                      placeholder="z.B. Experten für moderne Salon-Spaces"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.heroDescription}
                      onChange={(e) => updateConfig('heroDescription', e.target.value)}
                      placeholder="Beschreibung des Teams..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6 mt-6">
              {/* Team Member 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team-Mitglied 1
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={config.team1Name}
                        onChange={(e) => updateConfig('team1Name', e.target.value)}
                        placeholder="z.B. Daniel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rolle</Label>
                      <Input
                        value={config.team1Role}
                        onChange={(e) => updateConfig('team1Role', e.target.value)}
                        placeholder="z.B. Co-Founder"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.team1Description}
                      onChange={(e) => updateConfig('team1Description', e.target.value)}
                      placeholder="Beschreibung des Team-Mitglieds..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={config.team1LinkedInUrl}
                      onChange={(e) => updateConfig('team1LinkedInUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bild</Label>
                    <ImageUploader
                      value={config.team1ImageUrl}
                      onUpload={(url) => {
                        updateConfig('team1ImageUrl', url)
                        toast.success('Bild erfolgreich hochgeladen')
                      }}
                      onRemove={() => updateConfig('team1ImageUrl', null)}
                      uploadEndpoint="/api/admin/about-us-page-config/upload-image"
                      aspectRatio={1}
                      placeholder="Team-Bild hochladen"
                      description="JPG, PNG, WebP • Quadratisches Format"
                      previewHeight="h-32"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Team Member 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team-Mitglied 2
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={config.team2Name}
                        onChange={(e) => updateConfig('team2Name', e.target.value)}
                        placeholder="z.B. Nico"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rolle</Label>
                      <Input
                        value={config.team2Role}
                        onChange={(e) => updateConfig('team2Role', e.target.value)}
                        placeholder="z.B. Co-Founder"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.team2Description}
                      onChange={(e) => updateConfig('team2Description', e.target.value)}
                      placeholder="Beschreibung des Team-Mitglieds..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={config.team2LinkedInUrl}
                      onChange={(e) => updateConfig('team2LinkedInUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bild</Label>
                    <ImageUploader
                      value={config.team2ImageUrl}
                      onUpload={(url) => {
                        updateConfig('team2ImageUrl', url)
                        toast.success('Bild erfolgreich hochgeladen')
                      }}
                      onRemove={() => updateConfig('team2ImageUrl', null)}
                      uploadEndpoint="/api/admin/about-us-page-config/upload-image"
                      aspectRatio={1}
                      placeholder="Team-Bild hochladen"
                      description="JPG, PNG, WebP • Quadratisches Format"
                      previewHeight="h-32"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              {/* Vision */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Vision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge-Text</Label>
                    <Input
                      value={config.visionBadgeText}
                      onChange={(e) => updateConfig('visionBadgeText', e.target.value)}
                      placeholder="z.B. Unsere Vision"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input
                      value={config.visionTitle}
                      onChange={(e) => updateConfig('visionTitle', e.target.value)}
                      placeholder="z.B. Die Zukunft der Salon-Branche gestalten"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.visionDescription}
                      onChange={(e) => updateConfig('visionDescription', e.target.value)}
                      placeholder="Beschreibung der Vision..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mission */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge-Text</Label>
                    <Input
                      value={config.missionBadgeText}
                      onChange={(e) => updateConfig('missionBadgeText', e.target.value)}
                      placeholder="z.B. Unsere Mission"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input
                      value={config.missionTitle}
                      onChange={(e) => updateConfig('missionTitle', e.target.value)}
                      placeholder="z.B. Innovativ & Effizient"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.missionDescription}
                      onChange={(e) => updateConfig('missionDescription', e.target.value)}
                      placeholder="Beschreibung der Mission..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Why & CTA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    Warum-Bereich (CTA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input
                      value={config.whyTitle}
                      onChange={(e) => updateConfig('whyTitle', e.target.value)}
                      placeholder="z.B. Warum wir tun, was wir tun"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.whyDescription}
                      onChange={(e) => updateConfig('whyDescription', e.target.value)}
                      placeholder="Beschreibung..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button-Text</Label>
                      <Input
                        value={config.whyButtonText}
                        onChange={(e) => updateConfig('whyButtonText', e.target.value)}
                        placeholder="z.B. Jetzt durchstarten"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button-Link</Label>
                      <Input
                        value={config.whyButtonLink}
                        onChange={(e) => updateConfig('whyButtonLink', e.target.value)}
                        placeholder="z.B. /registrieren"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cards Tab */}
            <TabsContent value="cards" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MousePointer className="h-5 w-5 text-primary" />
                        Ansatz-Kacheln
                      </CardTitle>
                      <CardDescription>
                        Kacheln können per Drag & Drop sortiert werden
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        setCurrentCard({ title: '', description: '', iconName: 'Target', sortOrder: 0, isActive: true })
                        setIsEditingCard(false)
                        setEditCardDialogOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Neue Kachel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Section Header */}
                  <div className="space-y-4 mb-6 pb-6 border-b">
                    <div className="space-y-2">
                      <Label>Bereichs-Titel</Label>
                      <Input
                        value={config.approachTitle}
                        onChange={(e) => updateConfig('approachTitle', e.target.value)}
                        placeholder="z.B. Unser Ansatz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bereichs-Beschreibung</Label>
                      <Textarea
                        value={config.approachDescription}
                        onChange={(e) => updateConfig('approachDescription', e.target.value)}
                        placeholder="z.B. Wie wir arbeiten..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Cards List */}
                  {isLoadingCards ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : approachCards.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="mb-4">Noch keine Kacheln vorhanden</p>
                      <Button
                        onClick={() => {
                          setCurrentCard({ title: '', description: '', iconName: 'Target', sortOrder: 0, isActive: true })
                          setIsEditingCard(false)
                          setEditCardDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Erste Kachel erstellen
                      </Button>
                    </div>
                  ) : (
                    <SortableList
                      items={approachCards}
                      onReorder={handleReorderCards}
                      renderItem={(card) => {
                        const Icon = getIconComponent(card.iconName)
                        return (
                          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{card.title}</h3>
                                    <Badge variant={card.isActive ? 'default' : 'secondary'}>
                                      {card.isActive ? 'Aktiv' : 'Inaktiv'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentCard(card)
                                  setIsEditingCard(true)
                                  setEditCardDialogOpen(true)
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCard(card.id)}
                              >
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

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    SEO & Meta-Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SEOSection
                    metaTitle={config.metaTitle}
                    metaDescription={config.metaDescription}
                    fallbackTitle="Über uns | NICNOA"
                    fallbackDescription="Lernen Sie das Team hinter NICNOA kennen. Unsere Vision, Mission und warum wir die beste Lösung für Salon-Spaces entwickeln."
                    url="nicnoa.de › uber-uns"
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
                  <div className={`border rounded-xl overflow-hidden bg-slate-950 ${
                    previewDevice === 'mobile' ? 'aspect-[9/16]' : 'aspect-[16/10]'
                  } overflow-y-auto max-h-[600px]`}>
                    {/* Preview Content */}
                    <div className="p-4 space-y-6 text-white">
                      {/* Hero */}
                      <div className="text-center space-y-3">
                        {config.heroBadgeText && (
                          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs">
                            <Users className="mr-1 h-3 w-3 text-primary" />
                            {config.heroBadgeText}
                          </span>
                        )}
                        <h1 className={`font-bold ${previewDevice === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                          {config.heroTitle || 'Titel'}
                        </h1>
                        {config.heroDescription && (
                          <p className="text-slate-400 text-sm">{config.heroDescription}</p>
                        )}
                      </div>

                      {/* Team */}
                      <div className={`grid gap-4 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {[
                          { name: config.team1Name, role: config.team1Role, img: config.team1ImageUrl },
                          { name: config.team2Name, role: config.team2Role, img: config.team2ImageUrl },
                        ].map((member, i) => (
                          <div key={i} className="bg-slate-900 rounded-lg p-3">
                            <div className="aspect-square rounded-lg bg-slate-800 mb-2 flex items-center justify-center overflow-hidden">
                              {member.img ? (
                                <Image
                                  src={member.img}
                                  alt={member.name || 'Team'}
                                  width={150}
                                  height={150}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users className="h-8 w-8 text-slate-600" />
                              )}
                            </div>
                            <p className="font-semibold text-sm">{member.name || `Team ${i + 1}`}</p>
                            <p className="text-primary text-xs">{member.role || 'Rolle'}</p>
                          </div>
                        ))}
                      </div>

                      {/* Vision & Mission */}
                      <div className="grid gap-4 grid-cols-2">
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <span className="text-xs text-primary">{config.visionBadgeText || 'Vision'}</span>
                          </div>
                          <p className="text-xs font-medium">{config.visionTitle || 'Titel'}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-xs text-primary">{config.missionBadgeText || 'Mission'}</span>
                          </div>
                          <p className="text-xs font-medium">{config.missionTitle || 'Titel'}</p>
                        </div>
                      </div>

                      {/* Approach Cards */}
                      {approaches.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-400">{config.approachTitle}</p>
                          <div className={`grid gap-2 ${previewDevice === 'mobile' ? 'grid-cols-2' : 'grid-cols-2'}`}>
                            {approaches.slice(0, 4).map((approach, i) => {
                              const Icon = approach.icon
                              return (
                                <div key={i} className="bg-slate-900/50 rounded-lg p-2">
                                  <Icon className="h-3 w-3 text-primary mb-1" />
                                  <p className="text-[10px] font-medium truncate">{approach.title}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="text-center bg-slate-900/50 rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">{config.whyTitle || 'CTA Titel'}</p>
                        <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium">
                          {config.whyButtonText || 'Button'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground py-3">
                  Echtzeit-Vorschau
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Card Dialog */}
      <Dialog open={editCardDialogOpen} onOpenChange={setEditCardDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingCard ? 'Kachel bearbeiten' : 'Neue Kachel erstellen'}
            </DialogTitle>
            <DialogDescription>
              Erstellen oder bearbeiten Sie eine Ansatz-Kachel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={currentCard.title}
                onChange={(e) =>
                  setCurrentCard((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="z.B. Praxisnah validiert"
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={currentCard.description}
                onChange={(e) =>
                  setCurrentCard((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Beschreibung der Kachel..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={currentCard.iconName || 'Target'}
                onValueChange={(value) =>
                  setCurrentCard((prev) => ({ ...prev, iconName: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconNames.map((iconName) => {
                    const Icon = getIconComponent(iconName)
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={currentCard.isActive !== false}
                onCheckedChange={(checked) =>
                  setCurrentCard((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label>Aktiv</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCardDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveCard}>
              <Save className="mr-2 h-4 w-4" />
              {isEditingCard ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
