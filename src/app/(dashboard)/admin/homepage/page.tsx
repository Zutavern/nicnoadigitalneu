'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  Save,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Video,
  Sparkles,
  Type,
  MousePointer,
  Settings,
  Layout,
  Upload,
  X,
  Check,
  AlertCircle,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Palette,
  Monitor,
  Smartphone,
  Globe,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import Image from 'next/image'

interface HomePageConfig {
  id?: string
  heroType: 'animated' | 'image' | 'video'
  heroLayout: 'split' | 'centered' | 'fullscreen'
  heroImageUrl: string | null
  heroImageAlt: string | null
  heroImageOverlay: number
  heroImagePosition: string
  heroVideoUrl: string | null
  heroVideoPoster: string | null
  heroBadgeText: string | null
  heroBadgeIcon: string
  heroTitleLine1: string
  heroTitleLine2: string
  heroTitleHighlight: string
  heroDescription: string | null
  ctaPrimaryText: string
  ctaPrimaryLink: string
  ctaPrimaryIcon: string | null
  ctaSecondaryText: string | null
  ctaSecondaryLink: string | null
  showSecondaryCta: boolean
  showTrustIndicators: boolean
  trustIndicator1: string | null
  trustIndicator2: string | null
  trustIndicator3: string | null
  showDashboardPreview: boolean
  dashboardTitle: string | null
  dashboardSubtitle: string | null
  animationEnabled: boolean
  particlesEnabled: boolean
  gradientColors: string
  showScrollIndicator: boolean
  scrollTargetId: string | null
  metaTitle: string | null
  metaDescription: string | null
  ogImageUrl: string | null
  showTestimonials: boolean
  showPartners: boolean
  showPricing: boolean
  showFaq: boolean
  showCta: boolean
}

const defaultConfig: HomePageConfig = {
  heroType: 'animated',
  heroLayout: 'split',
  heroImageUrl: null,
  heroImageAlt: null,
  heroImageOverlay: 40,
  heroImagePosition: 'center',
  heroVideoUrl: null,
  heroVideoPoster: null,
  heroBadgeText: 'Jetzt im Beta-Programm verfügbar',
  heroBadgeIcon: 'sparkles',
  heroTitleLine1: 'Revolutionieren',
  heroTitleLine2: 'Sie Ihren',
  heroTitleHighlight: 'Salon-Space',
  heroDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces.',
  ctaPrimaryText: 'Jetzt kostenlos starten',
  ctaPrimaryLink: '/registrieren',
  ctaPrimaryIcon: 'arrow-right',
  ctaSecondaryText: 'Produkt entdecken',
  ctaSecondaryLink: '/produkt',
  showSecondaryCta: true,
  showTrustIndicators: true,
  trustIndicator1: '14 Tage kostenlos testen',
  trustIndicator2: 'Keine Kreditkarte erforderlich',
  trustIndicator3: 'DSGVO-konform',
  showDashboardPreview: true,
  dashboardTitle: 'NICNOA Dashboard',
  dashboardSubtitle: 'Salon Overview',
  animationEnabled: true,
  particlesEnabled: true,
  gradientColors: 'purple,pink,blue',
  showScrollIndicator: true,
  scrollTargetId: 'testimonials',
  metaTitle: null,
  metaDescription: null,
  ogImageUrl: null,
  showTestimonials: true,
  showPartners: true,
  showPricing: true,
  showFaq: true,
  showCta: true,
}

export default function HomePageCMS() {
  const [config, setConfig] = useState<HomePageConfig>(defaultConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/homepage-config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      toast.error('Fehler beim Laden der Konfiguration')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success('Homepage-Konfiguration gespeichert!')
      setHasChanges(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = <K extends keyof HomePageConfig>(key: K, value: HomePageConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'og') => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/admin/homepage-config/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload fehlgeschlagen')
      }

      const data = await res.json()
      
      if (type === 'hero') {
        updateConfig('heroImageUrl', data.url)
      } else {
        updateConfig('ogImageUrl', data.url)
      }
      
      toast.success('Bild hochgeladen!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload fehlgeschlagen')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = async (type: 'hero' | 'og') => {
    const url = type === 'hero' ? config.heroImageUrl : config.ogImageUrl
    if (!url) return

    try {
      await fetch(`/api/admin/homepage-config/upload?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
      })
      
      if (type === 'hero') {
        updateConfig('heroImageUrl', null)
      } else {
        updateConfig('ogImageUrl', null)
      }
      
      toast.success('Bild entfernt')
    } catch {
      toast.error('Fehler beim Entfernen')
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
            <Home className="h-8 w-8 text-primary" />
            Homepage
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie den Hero-Bereich und alle Inhalte der Startseite
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              Ungespeicherte Änderungen
            </Badge>
          )}
          <Button variant="outline" onClick={fetchConfig}>
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
              <TabsTrigger value="content" className="text-xs sm:text-sm">
                <Type className="mr-1 h-4 w-4 hidden sm:inline" />
                Texte
              </TabsTrigger>
              <TabsTrigger value="cta" className="text-xs sm:text-sm">
                <MousePointer className="mr-1 h-4 w-4 hidden sm:inline" />
                CTA
              </TabsTrigger>
              <TabsTrigger value="design" className="text-xs sm:text-sm">
                <Palette className="mr-1 h-4 w-4 hidden sm:inline" />
                Design
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
                    Hero-Typ
                  </CardTitle>
                  <CardDescription>
                    Wählen Sie den Stil des Hero-Bereichs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'animated', label: 'Animiert', icon: Sparkles, desc: 'Mit Dashboard-Vorschau' },
                      { value: 'image', label: 'Bild', icon: ImageIcon, desc: 'Vollflächiges Bild' },
                      { value: 'video', label: 'Video', icon: Video, desc: 'Hintergrund-Video' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => updateConfig('heroType', type.value as HomePageConfig['heroType'])}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          config.heroType === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <type.icon className={`h-6 w-6 mb-2 ${config.heroType === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Image Upload (wenn heroType === 'image') */}
                  {config.heroType === 'image' && (
                    <div className="space-y-4 border-t pt-6">
                      <Label>Hero-Bild</Label>
                      {config.heroImageUrl ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={config.heroImageUrl}
                            alt={config.heroImageAlt || 'Hero'}
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage('hero')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          {isUploading ? (
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                          ) : (
                            <>
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Klicken zum Hochladen</p>
                              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP • Max. 10MB</p>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'hero')}
                      />

                      {config.heroImageUrl && (
                        <>
                          <div className="space-y-2">
                            <Label>Alt-Text</Label>
                            <Input
                              value={config.heroImageAlt || ''}
                              onChange={(e) => updateConfig('heroImageAlt', e.target.value)}
                              placeholder="Beschreibung des Bildes"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Overlay-Stärke: {config.heroImageOverlay}%</Label>
                            <Slider
                              value={[config.heroImageOverlay]}
                              onValueChange={([v]) => updateConfig('heroImageOverlay', v)}
                              min={0}
                              max={80}
                              step={5}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Bildposition</Label>
                            <Select
                              value={config.heroImagePosition}
                              onValueChange={(v) => updateConfig('heroImagePosition', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="top">Oben</SelectItem>
                                <SelectItem value="center">Mitte</SelectItem>
                                <SelectItem value="bottom">Unten</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Video Settings */}
                  {config.heroType === 'video' && (
                    <div className="space-y-4 border-t pt-6">
                      <div className="space-y-2">
                        <Label>Video-URL</Label>
                        <Input
                          value={config.heroVideoUrl || ''}
                          onChange={(e) => updateConfig('heroVideoUrl', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Layout */}
                  <div className="space-y-2">
                    <Label>Layout</Label>
                    <Select
                      value={config.heroLayout}
                      onValueChange={(v) => updateConfig('heroLayout', v as HomePageConfig['heroLayout'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="split">Split (Text + Preview)</SelectItem>
                        <SelectItem value="centered">Zentriert</SelectItem>
                        <SelectItem value="fullscreen">Vollbild</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-primary" />
                    Hero-Texte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Badge */}
                  <div className="space-y-2">
                    <Label>Badge-Text</Label>
                    <Input
                      value={config.heroBadgeText || ''}
                      onChange={(e) => updateConfig('heroBadgeText', e.target.value)}
                      placeholder="z.B. Jetzt im Beta-Programm"
                    />
                  </div>

                  {/* Title */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Titel Zeile 1</Label>
                      <Input
                        value={config.heroTitleLine1}
                        onChange={(e) => updateConfig('heroTitleLine1', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Titel Zeile 2</Label>
                      <Input
                        value={config.heroTitleLine2}
                        onChange={(e) => updateConfig('heroTitleLine2', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Highlight (farbig)</Label>
                      <Input
                        value={config.heroTitleHighlight}
                        onChange={(e) => updateConfig('heroTitleHighlight', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={config.heroDescription || ''}
                      onChange={(e) => updateConfig('heroDescription', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Separator />

                  {/* Trust Indicators */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Trust-Indikatoren</Label>
                      <Switch
                        checked={config.showTrustIndicators}
                        onCheckedChange={(v) => updateConfig('showTrustIndicators', v)}
                      />
                    </div>
                    {config.showTrustIndicators && (
                      <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            <Input
                              value={(config as Record<string, string | null>)[`trustIndicator${i}`] || ''}
                              onChange={(e) => updateConfig(`trustIndicator${i}` as keyof HomePageConfig, e.target.value)}
                              placeholder={`Trust-Indikator ${i}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard Preview Settings */}
              {config.heroType === 'animated' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Dashboard-Vorschau</CardTitle>
                        <CardDescription>Die animierte Vorschau rechts im Hero</CardDescription>
                      </div>
                      <Switch
                        checked={config.showDashboardPreview}
                        onCheckedChange={(v) => updateConfig('showDashboardPreview', v)}
                      />
                    </div>
                  </CardHeader>
                  {config.showDashboardPreview && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={config.dashboardTitle || ''}
                            onChange={(e) => updateConfig('dashboardTitle', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Untertitel</Label>
                          <Input
                            value={config.dashboardSubtitle || ''}
                            onChange={(e) => updateConfig('dashboardSubtitle', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
            </TabsContent>

            {/* CTA Tab */}
            <TabsContent value="cta" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointer className="h-5 w-5 text-primary" />
                    Call-to-Action Buttons
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Primary CTA */}
                  <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <Label className="text-base font-semibold">Primärer Button</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Text</Label>
                        <Input
                          value={config.ctaPrimaryText}
                          onChange={(e) => updateConfig('ctaPrimaryText', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Link</Label>
                        <Input
                          value={config.ctaPrimaryLink}
                          onChange={(e) => updateConfig('ctaPrimaryLink', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <div className="space-y-4 p-4 rounded-lg bg-muted">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Sekundärer Button</Label>
                      <Switch
                        checked={config.showSecondaryCta}
                        onCheckedChange={(v) => updateConfig('showSecondaryCta', v)}
                      />
                    </div>
                    {config.showSecondaryCta && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Text</Label>
                          <Input
                            value={config.ctaSecondaryText || ''}
                            onChange={(e) => updateConfig('ctaSecondaryText', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link</Label>
                          <Input
                            value={config.ctaSecondaryLink || ''}
                            onChange={(e) => updateConfig('ctaSecondaryLink', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Scroll Indicator */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Scroll-Indikator anzeigen</Label>
                      <p className="text-xs text-muted-foreground">Animierter Pfeil am unteren Rand</p>
                    </div>
                    <Switch
                      checked={config.showScrollIndicator}
                      onCheckedChange={(v) => updateConfig('showScrollIndicator', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sections Visibility */}
              <Card>
                <CardHeader>
                  <CardTitle>Sektionen anzeigen</CardTitle>
                  <CardDescription>Welche Bereiche sollen auf der Homepage sichtbar sein?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'showTestimonials', label: 'Testimonials' },
                    { key: 'showPartners', label: 'Partner' },
                    { key: 'showPricing', label: 'Preise' },
                    { key: 'showFaq', label: 'FAQ' },
                    { key: 'showCta', label: 'CTA-Bereich' },
                  ].map((section) => (
                    <div key={section.key} className="flex items-center justify-between">
                      <Label>{section.label}</Label>
                      <Switch
                        checked={config[section.key as keyof HomePageConfig] as boolean}
                        onCheckedChange={(v) => updateConfig(section.key as keyof HomePageConfig, v)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Animationen & Effekte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Animationen aktivieren</Label>
                      <p className="text-xs text-muted-foreground">Bewegungen und Übergänge</p>
                    </div>
                    <Switch
                      checked={config.animationEnabled}
                      onCheckedChange={(v) => updateConfig('animationEnabled', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Partikel-Effekt</Label>
                      <p className="text-xs text-muted-foreground">Schwebende Punkte im Hintergrund</p>
                    </div>
                    <Switch
                      checked={config.particlesEnabled}
                      onCheckedChange={(v) => updateConfig('particlesEnabled', v)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Gradient-Farben</Label>
                    <Select
                      value={config.gradientColors}
                      onValueChange={(v) => updateConfig('gradientColors', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purple,pink,blue">Purple → Pink → Blue</SelectItem>
                        <SelectItem value="blue,cyan,teal">Blue → Cyan → Teal</SelectItem>
                        <SelectItem value="orange,red,pink">Orange → Red → Pink</SelectItem>
                        <SelectItem value="green,teal,blue">Green → Teal → Blue</SelectItem>
                        <SelectItem value="slate,gray,zinc">Slate → Gray (Neutral)</SelectItem>
                      </SelectContent>
                    </Select>
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
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Meta-Titel</Label>
                      <span className="text-xs text-muted-foreground">{(config.metaTitle || '').length}/70</span>
                    </div>
                    <Input
                      value={config.metaTitle || ''}
                      onChange={(e) => updateConfig('metaTitle', e.target.value)}
                      placeholder="NICNOA&CO.online - Die All-in-One Salon-Lösung"
                      maxLength={70}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Meta-Beschreibung</Label>
                      <span className="text-xs text-muted-foreground">{(config.metaDescription || '').length}/160</span>
                    </div>
                    <Textarea
                      value={config.metaDescription || ''}
                      onChange={(e) => updateConfig('metaDescription', e.target.value)}
                      placeholder="Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces..."
                      maxLength={160}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {/* OG Image */}
                  <div className="space-y-2">
                    <Label>Open Graph Bild (für Social Media)</Label>
                    <p className="text-xs text-muted-foreground mb-2">Empfohlen: 1200x630px</p>
                    {config.ogImageUrl ? (
                      <div className="relative aspect-[1200/630] max-w-md rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={config.ogImageUrl}
                          alt="OG Image"
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage('og')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <label className="cursor-pointer">
                          <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Bild hochladen</p>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'og')}
                          />
                        </label>
                      </div>
                    )}
                  </div>
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
                <div
                  className={`mx-auto transition-all duration-300 ${
                    previewDevice === 'mobile' ? 'max-w-[375px] px-4 pb-4' : 'w-full'
                  }`}
                >
                  {/* Realistic Hero Preview */}
                  <div className={`border rounded-xl overflow-hidden bg-slate-950 relative ${
                    previewDevice === 'mobile' ? 'aspect-[9/16]' : 'aspect-[16/9]'
                  }`}>
                    {/* Background Layer */}
                    <div className="absolute inset-0 overflow-hidden">
                      {config.heroType === 'image' && config.heroImageUrl ? (
                        /* Image Hero Background */
                        <>
                          <Image
                            src={config.heroImageUrl}
                            alt={config.heroImageAlt || 'Hero'}
                            fill
                            className="object-cover transition-all duration-500"
                            style={{ objectPosition: config.heroImagePosition }}
                            priority
                          />
                          {/* Overlay */}
                          <div
                            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] transition-opacity duration-300"
                            style={{ opacity: config.heroImageOverlay / 100 }}
                          />
                          {/* Gradient Overlay für Lesbarkeit */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-70" />
                        </>
                      ) : config.heroType === 'video' && config.heroVideoUrl ? (
                        /* Video Hero Background */
                        <>
                          <video
                            src={config.heroVideoUrl}
                            poster={config.heroVideoPoster || undefined}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
                        </>
                      ) : (
                        /* Animated Hero Background */
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/50">
                          {/* Animated Grid Pattern */}
                          <div
                            className="absolute inset-0 opacity-30"
                            style={{
                              backgroundImage: `
                                linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
                              `,
                              backgroundSize: '40px 40px',
                            }}
                          />
                          
                          {/* Animated Particles */}
                          {config.particlesEnabled && config.animationEnabled && (
                            <>
                              {Array.from({ length: 20 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
                                  style={{
                                    left: `${(i * 5) % 100}%`,
                                    top: `${(i * 7) % 100}%`,
                                  }}
                                  animate={{
                                    opacity: [0.2, 0.8, 0.2],
                                    scale: [1, 1.5, 1],
                                    y: [0, -10, 0],
                                  }}
                                  transition={{
                                    duration: 3 + (i % 3),
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                  }}
                                />
                              ))}
                            </>
                          )}
                          
                          {/* Gradient Orbs */}
                          <motion.div
                            className="absolute top-1/4 left-1/4 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"
                            animate={config.animationEnabled ? {
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.5, 0.3],
                            } : {}}
                            transition={{ duration: 4, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-pink-500/25 rounded-full blur-3xl"
                            animate={config.animationEnabled ? {
                              scale: [1, 1.3, 1],
                              opacity: [0.25, 0.4, 0.25],
                            } : {}}
                            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                          />
                          <motion.div
                            className="absolute top-1/2 right-1/3 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"
                            animate={config.animationEnabled ? {
                              scale: [1, 1.4, 1],
                              opacity: [0.2, 0.35, 0.2],
                            } : {}}
                            transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content Layer */}
                    <div className={`relative z-10 h-full flex ${
                      config.heroLayout === 'centered' ? 'items-center justify-center' :
                      config.heroLayout === 'fullscreen' ? 'items-center' : 'items-center'
                    }`}>
                      <div className={`p-6 ${
                        config.heroLayout === 'split' && config.heroType === 'animated' ? 'w-3/5' : 'w-full text-center'
                      } ${previewDevice === 'mobile' ? 'text-center w-full' : ''}`}>
                        
                        {/* Badge */}
                        {config.heroBadgeText && (
                          <motion.div
                            initial={config.animationEnabled ? { opacity: 0, y: 10 } : {}}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs mb-4 ${
                              previewDevice === 'mobile' || config.heroLayout !== 'split' ? 'mx-auto' : ''
                            }`}
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>{config.heroBadgeText}</span>
                          </motion.div>
                        )}
                        
                        {/* Title */}
                        <motion.h1
                          initial={config.animationEnabled ? { opacity: 0, y: 20 } : {}}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className={`font-bold text-white leading-tight mb-3 ${
                            previewDevice === 'mobile' ? 'text-xl' : 'text-2xl'
                          }`}
                        >
                          {config.heroTitleLine1}{' '}
                          {config.heroTitleLine2}{' '}
                          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                            {config.heroTitleHighlight}
                          </span>
                        </motion.h1>
                        
                        {/* Description */}
                        {config.heroDescription && (
                          <motion.p
                            initial={config.animationEnabled ? { opacity: 0, y: 20 } : {}}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className={`text-slate-300/90 mb-4 ${
                              previewDevice === 'mobile' ? 'text-xs' : 'text-sm'
                            } ${config.heroLayout === 'split' ? 'max-w-md' : 'max-w-2xl mx-auto'}`}
                          >
                            {config.heroDescription}
                          </motion.p>
                        )}
                        
                        {/* CTA Buttons */}
                        <motion.div
                          initial={config.animationEnabled ? { opacity: 0, y: 20 } : {}}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className={`flex gap-2 ${
                            previewDevice === 'mobile' || config.heroLayout !== 'split' ? 'justify-center' : ''
                          } ${previewDevice === 'mobile' ? 'flex-col' : ''}`}
                        >
                          <button className={`px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 ${
                            previewDevice === 'mobile' ? 'text-sm justify-center' : 'text-xs'
                          }`}>
                            {config.ctaPrimaryText}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                          {config.showSecondaryCta && config.ctaSecondaryText && (
                            <button className={`px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-500 text-white font-medium transition-all ${
                              previewDevice === 'mobile' ? 'text-sm justify-center' : 'text-xs'
                            }`}>
                              {config.ctaSecondaryText}
                            </button>
                          )}
                        </motion.div>
                        
                        {/* Trust Indicators */}
                        {config.showTrustIndicators && (
                          <motion.div
                            initial={config.animationEnabled ? { opacity: 0 } : {}}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className={`flex gap-4 mt-4 ${
                              previewDevice === 'mobile' ? 'flex-col gap-2 items-center' : ''
                            } ${config.heroLayout !== 'split' ? 'justify-center' : ''}`}
                          >
                            {[config.trustIndicator1, config.trustIndicator2, config.trustIndicator3]
                              .filter(Boolean)
                              .map((indicator, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                                  <span>{indicator}</span>
                                </div>
                              ))}
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Dashboard Preview (nur bei animated + split) */}
                      {config.heroType === 'animated' && 
                       config.showDashboardPreview && 
                       config.heroLayout === 'split' && 
                       previewDevice === 'desktop' && (
                        <motion.div
                          initial={config.animationEnabled ? { opacity: 0, x: 50, rotateY: 15 } : {}}
                          animate={{ opacity: 1, x: 0, rotateY: 0 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="w-2/5 pr-4"
                        >
                          <div className="relative">
                            {/* Glow Effect */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-60" />
                            
                            {/* Mock Dashboard */}
                            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                              {/* Header */}
                              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-800/50">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-red-500" />
                                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                </div>
                                <div className="text-[8px] text-slate-400 font-medium">
                                  {config.dashboardTitle || 'NICNOA Dashboard'}
                                </div>
                              </div>
                              
                              {/* Content */}
                              <div className="p-3 space-y-2">
                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-1.5">
                                  {[
                                    { label: 'Buchungen', value: '24', trend: '+12%' },
                                    { label: 'Umsatz', value: '€2.4k', trend: '+8%' },
                                    { label: 'Auslastung', value: '87%', trend: '+5%' },
                                  ].map((stat, i) => (
                                    <motion.div
                                      key={i}
                                      initial={config.animationEnabled ? { opacity: 0, y: 10 } : {}}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.6 + i * 0.1 }}
                                      className="bg-slate-800/50 rounded-lg p-2"
                                    >
                                      <p className="text-[6px] text-slate-400">{stat.label}</p>
                                      <p className="text-xs font-bold text-white">{stat.value}</p>
                                      <p className="text-[6px] text-green-400">{stat.trend}</p>
                                    </motion.div>
                                  ))}
                                </div>
                                
                                {/* Chart Placeholder */}
                                <motion.div
                                  initial={config.animationEnabled ? { opacity: 0 } : {}}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.9 }}
                                  className="bg-slate-800/30 rounded-lg p-2 h-16"
                                >
                                  <div className="flex items-end justify-between h-full gap-1">
                                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                                      <motion.div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                                      />
                                    ))}
                                  </div>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Scroll Indicator */}
                    {config.showScrollIndicator && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 8, 0] }}
                        transition={{ 
                          opacity: { delay: 1 },
                          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
                      >
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </motion.div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground py-3">
                  Echtzeit-Vorschau mit Animationen
                </p>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-500">Tipp</p>
                    <p className="text-muted-foreground mt-1">
                      {config.heroType === 'image' 
                        ? 'Für beste Qualität: WebP-Format, mind. 1920px breit'
                        : config.heroType === 'video'
                        ? 'Videos sollten kurz, geloopt und ohne Ton sein'
                        : 'Der animierte Hero bietet die beste User-Experience'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

