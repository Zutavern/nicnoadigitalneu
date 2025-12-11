'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Layout,
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
import { ImageUploader } from '@/components/ui/image-uploader'
import { MultiImageUploader } from '@/components/ui/multi-image-uploader'
import { VideoUploader, type VideoSettings } from '@/components/ui/video-uploader'
import { SEOSection } from '@/components/admin/seo-preview'

// Helper: Parse heroImageUrl (kann einzelne URL oder JSON-Array sein)
function parseHeroImages(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
    return [value]
  } catch {
    return value ? [value] : []
  }
}

// Helper: Serialize heroImages zu JSON-String
function serializeHeroImages(urls: string[]): string | null {
  if (urls.length === 0) return null
  if (urls.length === 1) return urls[0]
  return JSON.stringify(urls)
}

// Carousel Preview für CMS
function ImageCarouselPreview({ 
  images, 
  imageAlt, 
  imagePosition, 
  overlay 
}: { 
  images: string[]
  imageAlt: string | null
  imagePosition: string
  overlay: number
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [images.length])

  if (images.length === 0) return null

  return (
    <>
      {images.map((url, index) => (
        <motion.div
          key={url}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: index === activeIndex ? 1 : 0,
            scale: index === activeIndex ? 1 : 1.05,
          }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={url}
            alt={imageAlt || `Bild ${index + 1}`}
            fill
            className="object-cover"
            style={{ objectPosition: imagePosition }}
            priority={index === 0}
          />
        </motion.div>
      ))}
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: overlay / 100 }}
      />
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      {/* Dot Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </>
  )
}

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
  const [activeTab, setActiveTab] = useState('hero')
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [hasChanges, setHasChanges] = useState(false)

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
                      { value: 'image', label: 'Bild(er)', icon: ImageIcon, desc: 'Carousel möglich' },
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

                  {/* Zurücksetzen Button wenn nicht animiert */}
                  {config.heroType !== 'animated' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateConfig('heroType', 'animated')
                        updateConfig('heroImageUrl', null)
                        updateConfig('heroVideoUrl', null)
                        toast.success('Hero auf animiert zurückgesetzt')
                      }}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Zum animierten Hero zurücksetzen
                    </Button>
                  )}

                  {/* Image Upload (wenn heroType === 'image') */}
                  {config.heroType === 'image' && (
                    <div className="space-y-4 border-t pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Hero-Bilder</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Mehrere Bilder werden als animiertes Carousel angezeigt
                          </p>
                        </div>
                        {parseHeroImages(config.heroImageUrl).length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateConfig('heroImageUrl', null)
                              toast.success('Alle Bilder entfernt')
                            }}
                          >
                            Alle entfernen
                          </Button>
                        )}
                      </div>
                      
                      <MultiImageUploader
                        value={parseHeroImages(config.heroImageUrl)}
                        onChange={(urls) => {
                          updateConfig('heroImageUrl', serializeHeroImages(urls))
                          if (urls.length > 0) {
                            toast.success(urls.length === 1 ? 'Bild gespeichert!' : `${urls.length} Bilder gespeichert!`)
                          }
                        }}
                        uploadEndpoint="/api/admin/homepage-config/upload"
                        uploadData={{ type: 'hero' }}
                        aspectRatio={16/9}
                        maxImages={10}
                        placeholder="Hero-Bilder hochladen"
                        description="JPEG, PNG, WebP • Max. 10MB • Empfohlen: 1920x1080px"
                      />

                      {parseHeroImages(config.heroImageUrl).length > 0 && (
                        <>
                          <div className="space-y-2">
                            <Label>Alt-Text (für alle Bilder)</Label>
                            <Input
                              value={config.heroImageAlt || ''}
                              onChange={(e) => updateConfig('heroImageAlt', e.target.value)}
                              placeholder="Beschreibung der Bilder"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Abdunklung: {config.heroImageOverlay}%</Label>
                            <Slider
                              value={[config.heroImageOverlay]}
                              onValueChange={([v]) => updateConfig('heroImageOverlay', v)}
                              min={0}
                              max={95}
                              step={5}
                            />
                            <p className="text-xs text-muted-foreground">
                              Je höher der Wert, desto dunkler werden die Bilder (für bessere Lesbarkeit)
                            </p>
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

                          {parseHeroImages(config.heroImageUrl).length > 1 && (
                            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                              <p className="text-sm text-primary font-medium flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Carousel aktiviert
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {parseHeroImages(config.heroImageUrl).length} Bilder werden automatisch durchgewechselt
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Video Upload & Settings */}
                  {config.heroType === 'video' && (
                    <div className="space-y-4 border-t pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Hero-Video</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Videos starten automatisch und laufen im Loop
                          </p>
                        </div>
                        {config.heroVideoUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateConfig('heroVideoUrl', null)
                              updateConfig('heroVideoPoster', null)
                              toast.success('Video entfernt')
                            }}
                          >
                            Video entfernen
                          </Button>
                        )}
                      </div>

                      <VideoUploader
                        value={config.heroVideoUrl}
                        posterUrl={config.heroVideoPoster}
                        settings={{
                          autoplay: true,
                          loop: true,
                          muted: true,
                          playbackSpeed: 1,
                          overlay: config.heroImageOverlay,
                        }}
                        onUpload={(url) => {
                          updateConfig('heroVideoUrl', url)
                          toast.success('Video hochgeladen!')
                        }}
                        onRemove={() => {
                          updateConfig('heroVideoUrl', null)
                          updateConfig('heroVideoPoster', null)
                        }}
                        onSettingsChange={(settings) => {
                          updateConfig('heroImageOverlay', settings.overlay)
                        }}
                        uploadEndpoint="/api/admin/homepage-config/upload"
                        uploadData={{ type: 'video' }}
                        placeholder="Hero-Video hochladen"
                        description="MP4, WebM, MOV • Max. 100MB • Empfohlen: 1920x1080px"
                      />

                      {/* Poster-Bild Upload */}
                      {config.heroVideoUrl && (
                        <div className="space-y-2">
                          <Label>Poster-Bild (Ladevorschau)</Label>
                          <p className="text-xs text-muted-foreground">
                            Wird angezeigt, bevor das Video geladen ist
                          </p>
                          <ImageUploader
                            value={config.heroVideoPoster}
                            onUpload={(url) => {
                              updateConfig('heroVideoPoster', url)
                              toast.success('Poster-Bild gespeichert!')
                            }}
                            onRemove={() => updateConfig('heroVideoPoster', null)}
                            uploadEndpoint="/api/admin/homepage-config/upload"
                            uploadData={{ type: 'video-poster' }}
                            aspectRatio={16/9}
                            placeholder="Poster-Bild hochladen"
                            description="Wird während des Ladens angezeigt"
                          />
                        </div>
                      )}
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

                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">
                      <strong>Farben</strong> werden automatisch aus den{' '}
                      <span className="text-primary font-medium">Design-System Einstellungen</span>{' '}
                      übernommen. Ändern Sie die Brand-Farben unter{' '}
                      <span className="font-medium">Einstellungen → Design</span>.
                    </p>
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
                <CardContent>
                  <SEOSection
                    metaTitle={config.metaTitle}
                    metaDescription={config.metaDescription}
                    fallbackTitle="NICNOA&CO.online - Die All-in-One Salon-Lösung"
                    fallbackDescription="Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces..."
                    url="nicnoa.de"
                    onTitleChange={(value) => updateConfig('metaTitle', value)}
                    onDescriptionChange={(value) => updateConfig('metaDescription', value)}
                    ogImageUrl={config.ogImageUrl}
                    onOgImageUpload={(url) => {
                      updateConfig('ogImageUrl', url)
                      toast.success('OG-Bild hochgeladen!')
                    }}
                    onOgImageRemove={() => removeImage('og')}
                    ogImageUploadEndpoint="/api/admin/homepage-config/upload"
                    ogImageUploadData={{ type: 'og' }}
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
                <div
                  className={`mx-auto transition-all duration-300 ${
                    previewDevice === 'mobile' ? 'max-w-[375px] px-4 pb-4' : 'w-full'
                  }`}
                >
                  {/* Realistic Hero Preview */}
                  <div className={`border rounded-xl overflow-hidden bg-slate-950 relative ${
                    previewDevice === 'mobile' ? 'aspect-[9/16]' : 'aspect-[16/9]'
                  }`}>
                    {/* Background Layer - Identisch mit Live-Seite */}
                    <div className="absolute inset-0 overflow-hidden">
                      {config.heroType === 'image' && config.heroImageUrl ? (
                        /* Image Hero Background - mit Carousel-Unterstützung */
                        <ImageCarouselPreview
                          images={parseHeroImages(config.heroImageUrl)}
                          imageAlt={config.heroImageAlt}
                          imagePosition={config.heroImagePosition}
                          overlay={config.heroImageOverlay}
                        />
                      ) : config.heroType === 'video' && config.heroVideoUrl ? (
                        /* Video Hero Background - wie auf Live-Seite */
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
                          {/* Abdunklungs-Overlay */}
                          <div
                            className="absolute inset-0 bg-black transition-opacity duration-300"
                            style={{ opacity: config.heroImageOverlay / 100 }}
                          />
                          {/* Gradient Overlay (wie Live-Seite) */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                        </>
                      ) : (
                        /* Animated Hero Background - Design-System Farben */
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to bottom right, 
                              hsl(224 71% 4%), 
                              hsl(224 50% 8%), 
                              hsl(var(--gradient-from) / 0.3)
                            )`
                          }}
                        >
                          {/* Animated Grid Pattern */}
                          <div
                            className="absolute inset-0 opacity-30"
                            style={{
                              backgroundImage: `
                                linear-gradient(hsl(var(--brand-primary) / 0.15) 1px, transparent 1px),
                                linear-gradient(90deg, hsl(var(--brand-primary) / 0.15) 1px, transparent 1px)
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
                                  className="absolute w-1 h-1 rounded-full"
                                  style={{
                                    left: `${(i * 5) % 100}%`,
                                    top: `${(i * 7) % 100}%`,
                                    backgroundColor: 'hsl(var(--brand-primary) / 0.4)',
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
                          
                          {/* Gradient Orbs - Design-System Farben */}
                          <motion.div
                            className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full blur-3xl"
                            style={{ backgroundColor: 'hsl(var(--glow-primary) / 0.3)' }}
                            animate={config.animationEnabled ? {
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.5, 0.3],
                            } : {}}
                            transition={{ duration: 4, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute bottom-1/3 right-1/4 w-32 h-32 rounded-full blur-3xl"
                            style={{ backgroundColor: 'hsl(var(--glow-secondary) / 0.25)' }}
                            animate={config.animationEnabled ? {
                              scale: [1, 1.3, 1],
                              opacity: [0.25, 0.4, 0.25],
                            } : {}}
                            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                          />
                          <motion.div
                            className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full blur-2xl"
                            style={{ backgroundColor: 'hsl(var(--gradient-via) / 0.2)' }}
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
                        
                        {/* Badge - Design-System Farben */}
                        {config.heroBadgeText && (
                          <motion.div
                            initial={config.animationEnabled ? { opacity: 0, y: 10 } : {}}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs mb-4 ${
                              previewDevice === 'mobile' || config.heroLayout !== 'split' ? 'mx-auto' : ''
                            }`}
                            style={{
                              backgroundColor: 'hsl(var(--brand-primary) / 0.2)',
                              borderWidth: '1px',
                              borderColor: 'hsl(var(--brand-primary) / 0.3)',
                              color: 'hsl(var(--brand-primary))',
                            }}
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>{config.heroBadgeText}</span>
                          </motion.div>
                        )}
                        
                        {/* Title - Design-System Gradient */}
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
                          <span 
                            className="bg-clip-text text-transparent"
                            style={{
                              backgroundImage: `linear-gradient(to right, 
                                hsl(var(--gradient-from)), 
                                hsl(var(--gradient-via)), 
                                hsl(var(--gradient-to))
                              )`
                            }}
                          >
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
                        
                        {/* CTA Buttons - Design-System Farben */}
                        <motion.div
                          initial={config.animationEnabled ? { opacity: 0, y: 20 } : {}}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className={`flex gap-2 ${
                            previewDevice === 'mobile' || config.heroLayout !== 'split' ? 'justify-center' : ''
                          } ${previewDevice === 'mobile' ? 'flex-col' : ''}`}
                        >
                          <button 
                            className={`px-4 py-2 rounded-lg text-white font-medium transition-all shadow-lg flex items-center gap-2 ${
                              previewDevice === 'mobile' ? 'text-sm justify-center' : 'text-xs'
                            }`}
                            style={{
                              backgroundImage: `linear-gradient(to right, 
                                hsl(var(--gradient-from)), 
                                hsl(var(--gradient-to))
                              )`,
                              boxShadow: '0 10px 15px -3px hsl(var(--glow-primary) / 0.25)',
                            }}
                          >
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
                            {/* Glow Effect - Design-System Farben */}
                            <div 
                              className="absolute -inset-2 rounded-2xl blur-xl opacity-60"
                              style={{
                                backgroundImage: `linear-gradient(to right, 
                                  hsl(var(--glow-primary) / 0.2), 
                                  hsl(var(--glow-secondary) / 0.2), 
                                  hsl(var(--glow-primary) / 0.2)
                                )`
                              }}
                            />
                            
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
                                        className="flex-1 rounded-t"
                                        style={{
                                          backgroundImage: `linear-gradient(to top, 
                                            hsl(var(--gradient-from)), 
                                            hsl(var(--gradient-to))
                                          )`
                                        }}
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

