'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  Clock,
  CreditCard,
  MessageSquare,
  Settings,
  Sparkles,
  Zap,
  Target,
  Lock,
  Bell,
  FileText,
  Globe,
  Layers,
  CheckCircle2,
  ArrowUpDown,
  Layout,
  Type,
  MousePointer,
  Palette,
  Search,
  Image as ImageIcon,
  Video,
  Code,
  Upload,
  X,
  ArrowRight,
  ChevronDown,
  Monitor,
  AlertCircle,
  Play,
  GripVertical,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
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
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { ImageUploader } from '@/components/ui/image-uploader'
import { SEOSection } from '@/components/admin/seo-preview'

// Icon Mapping - alle verfügbaren Icons
const iconMap: Record<string, React.ElementType> = {
  Calendar,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  Clock,
  CreditCard,
  MessageSquare,
  Settings,
  Sparkles,
  Zap,
  Target,
  Lock,
  Bell,
  FileText,
  Globe,
  Layers,
  Package,
  CheckCircle2,
  Star,
}

const availableIcons = Object.keys(iconMap).sort()

const categories = [
  { value: 'core', label: 'Kernfunktionen' },
  { value: 'communication', label: 'Kommunikation' },
  { value: 'analytics', label: 'Analytics & Berichte' },
  { value: 'security', label: 'Sicherheit & Compliance' },
  { value: 'automation', label: 'Automatisierung' },
]

interface ProductFeature {
  id: string
  title: string
  description: string
  iconName: string
  category: string
  isActive: boolean
  isHighlight: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface ProductPageConfig {
  id?: string
  heroType: 'animated' | 'image' | 'video' | 'code'
  heroLayout: 'split' | 'centered' | 'fullscreen'
  heroImageUrl: string | null
  heroImageAlt: string | null
  heroImageOverlay: number
  heroImagePosition: string
  heroVideoUrl: string | null
  heroVideoPoster: string | null
  heroAnimationCode: string | null
  heroBadgeText: string | null
  heroBadgeIcon: string
  heroTitle: string
  heroTitleHighlight: string | null
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
  animationEnabled: boolean
  particlesEnabled: boolean
  showDashboardPreview: boolean
  useDesignSystemColors: boolean
  animationPrimaryColor: string | null
  animationSecondaryColor: string | null
  animationAccentColor: string | null
  gradientColors: string
  dashboardTitle: string | null
  dashboardSubtitle: string | null
  showScrollIndicator: boolean
  scrollTargetId: string | null
  featuresSectionTitle: string | null
  featuresSectionDescription: string | null
  showFeatureCategories: boolean
  showStats: boolean
  stat1Label: string | null
  stat1Value: string | null
  stat2Label: string | null
  stat2Value: string | null
  stat3Label: string | null
  stat3Value: string | null
  bottomCtaTitle: string | null
  bottomCtaDescription: string | null
  bottomCtaButtonText: string | null
  bottomCtaButtonLink: string | null
  metaTitle: string | null
  metaDescription: string | null
  ogImage: string | null
  // Category Showcase
  showCategoryShowcase?: boolean
  categoryShowcaseTitle?: string | null
  categoryShowcaseSubtitle?: string | null
  autoPlayEnabled?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  // Glow Effect Settings
  glowEffectEnabled?: boolean
  glowEffectSpread?: number
  glowEffectProximity?: number
  glowEffectBorderWidth?: number
  glowUseDesignSystem?: boolean
  glowUseGradient?: boolean
  glowCustomPrimary?: string | null
  glowCustomSecondary?: string | null
}

interface CategoryAnimation {
  id: string
  categoryKey: string
  title: string
  subtitle: string | null
  description: string
  badgeText: string | null
  features: string[]
  animationType: string
  presetAnimation: string | null
  customAnimationCode: string | null
  lottieUrl: string | null
  animationPosition: string
  animationSize: string
  animationSpeed: number
  useDesignSystemColors: boolean
  customPrimaryColor: string | null
  customSecondaryColor: string | null
  customAccentColor: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const emptyCategoryAnimation: Partial<CategoryAnimation> = {
  categoryKey: '',
  title: '',
  subtitle: '',
  description: '',
  badgeText: '',
  features: [],
  animationType: 'preset',
  presetAnimation: 'calendar',
  customAnimationCode: null,
  lottieUrl: null,
  animationPosition: 'right',
  animationSize: 'medium',
  animationSpeed: 1.0,
  useDesignSystemColors: true,
  customPrimaryColor: null,
  customSecondaryColor: null,
  customAccentColor: null,
  isActive: true,
  sortOrder: 0,
}

const presetAnimations = [
  { value: 'calendar', label: 'Kalender', description: 'Buchungskalender mit Slots' },
  { value: 'chat', label: 'Chat', description: 'Smartphone mit Chat-Konversation' },
  { value: 'chart', label: 'Dashboard', description: 'Analytics mit Diagrammen' },
  { value: 'shield', label: 'Sicherheit', description: 'Schild mit Checkmarks' },
  { value: 'workflow', label: 'Workflow', description: 'Automatisierungs-Flow' },
]

const defaultConfig: ProductPageConfig = {
  heroType: 'animated',
  heroLayout: 'split',
  heroImageUrl: null,
  heroImageAlt: null,
  heroImageOverlay: 40,
  heroImagePosition: 'center',
  heroVideoUrl: null,
  heroVideoPoster: null,
  heroAnimationCode: null,
  heroBadgeText: 'Die All-in-One Plattform',
  heroBadgeIcon: 'sparkles',
  heroTitle: 'Alles was Ihr Salon-Space braucht',
  heroTitleHighlight: 'Salon-Space',
  heroDescription: 'Eine Plattform für Terminbuchung, Stuhlvermietung, Kundenverwaltung und Analytics.',
  ctaPrimaryText: 'Kostenlos starten',
  ctaPrimaryLink: '/registrieren',
  ctaPrimaryIcon: 'arrow-right',
  ctaSecondaryText: 'Preise ansehen',
  ctaSecondaryLink: '/preise',
  showSecondaryCta: true,
  showTrustIndicators: true,
  trustIndicator1: '14 Tage kostenlos testen',
  trustIndicator2: 'Keine Kreditkarte erforderlich',
  trustIndicator3: 'DSGVO-konform',
  animationEnabled: true,
  particlesEnabled: true,
  showDashboardPreview: true,
  useDesignSystemColors: true,
  animationPrimaryColor: null,
  animationSecondaryColor: null,
  animationAccentColor: null,
  gradientColors: 'primary,secondary,accent',
  dashboardTitle: 'NICNOA Dashboard',
  dashboardSubtitle: 'Produkt Overview',
  showScrollIndicator: true,
  scrollTargetId: 'features',
  featuresSectionTitle: 'Unsere Features',
  featuresSectionDescription: 'Entdecken Sie alle Funktionen, die NICNOA zu Ihrer idealen Lösung machen.',
  showFeatureCategories: true,
  showStats: false,
  stat1Label: null,
  stat1Value: null,
  stat2Label: null,
  stat2Value: null,
  stat3Label: null,
  stat3Value: null,
  bottomCtaTitle: 'Bereit für die Zukunft Ihres Salons?',
  bottomCtaDescription: 'Starten Sie noch heute und erleben Sie, wie NICNOA Ihren Arbeitsalltag revolutioniert.',
  bottomCtaButtonText: 'Jetzt kostenlos testen',
  bottomCtaButtonLink: '/registrieren',
  metaTitle: null,
  metaDescription: null,
  ogImage: null,
}

const emptyFeature: Partial<ProductFeature> = {
  title: '',
  description: '',
  iconName: 'Package',
  category: 'core',
  isActive: true,
  isHighlight: false,
  sortOrder: 0,
}

export default function ProductCMSPage() {
  // Features State
  const [features, setFeatures] = useState<ProductFeature[]>([])
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentFeature, setCurrentFeature] = useState<Partial<ProductFeature>>(emptyFeature)
  const [isEditing, setIsEditing] = useState(false)
  const [isSavingFeature, setIsSavingFeature] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)
  
  // Page Config State
  const [config, setConfig] = useState<ProductPageConfig>(defaultConfig)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Category Animations State
  const [categoryAnimations, setCategoryAnimations] = useState<CategoryAnimation[]>([])
  const [isLoadingAnimations, setIsLoadingAnimations] = useState(true)
  const [animationDialogOpen, setAnimationDialogOpen] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState<Partial<CategoryAnimation>>(emptyCategoryAnimation)
  const [isEditingAnimation, setIsEditingAnimation] = useState(false)
  const [isSavingAnimation, setIsSavingAnimation] = useState(false)
  const [newFeatureInput, setNewFeatureInput] = useState('')
  
  // UI State
  const [mainTab, setMainTab] = useState<'page' | 'features' | 'animations'>('page')
  const [configTab, setConfigTab] = useState('hero')
  const [showPreview, setShowPreview] = useState(true)

  // Fetch Functions
  const fetchFeatures = useCallback(async () => {
    try {
      setIsLoadingFeatures(true)
      const response = await fetch('/api/product-features/admin')
      if (response.ok) {
        const data = await response.json()
        setFeatures(data)
      }
    } catch (error) {
      console.error('Error fetching features:', error)
      toast.error('Fehler beim Laden der Features')
    } finally {
      setIsLoadingFeatures(false)
    }
  }, [])

  const fetchConfig = useCallback(async () => {
    setIsLoadingConfig(true)
    try {
      const res = await fetch('/api/admin/product-config')
      if (res.ok) {
        const data = await res.json()
        setConfig({ ...defaultConfig, ...data })
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      toast.error('Fehler beim Laden der Konfiguration')
    } finally {
      setIsLoadingConfig(false)
    }
  }, [])

  const fetchCategoryAnimations = useCallback(async () => {
    try {
      setIsLoadingAnimations(true)
      const response = await fetch('/api/admin/category-animations')
      if (response.ok) {
        const data = await response.json()
        setCategoryAnimations(data)
      }
    } catch (error) {
      console.error('Error fetching category animations:', error)
      toast.error('Fehler beim Laden der Kategorie-Animationen')
    } finally {
      setIsLoadingAnimations(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatures()
    fetchConfig()
    fetchCategoryAnimations()
  }, [fetchFeatures, fetchConfig, fetchCategoryAnimations])

  // Config Handlers
  const updateConfig = <K extends keyof ProductPageConfig>(key: K, value: ProductPageConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSaveConfig = async () => {
    setIsSavingConfig(true)
    try {
      const res = await fetch('/api/admin/product-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success('Produkt-Seite gespeichert!')
      setHasChanges(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const removeImage = async (type: 'hero' | 'og') => {
    const url = type === 'hero' ? config.heroImageUrl : config.ogImage
    if (!url) return

    try {
      await fetch(`/api/admin/product-config/upload?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
      })
      
      if (type === 'hero') {
        updateConfig('heroImageUrl', null)
      } else {
        updateConfig('ogImage', null)
      }
      
      toast.success('Bild entfernt')
    } catch {
      toast.error('Fehler beim Entfernen')
    }
  }

  // Feature Handlers
  const handleSaveFeature = async () => {
    if (!currentFeature.title || !currentFeature.description) {
      toast.error('Titel und Beschreibung sind erforderlich')
      return
    }

    setIsSavingFeature(true)
    try {
      const url = isEditing
        ? `/api/product-features/${currentFeature.id}`
        : '/api/product-features'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFeature),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Feature aktualisiert' : 'Feature erstellt')
        setEditDialogOpen(false)
        setCurrentFeature(emptyFeature)
        fetchFeatures()
      } else {
        toast.error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving feature:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSavingFeature(false)
    }
  }

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Feature wirklich löschen?')) return

    try {
      const response = await fetch(`/api/product-features/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Feature gelöscht')
        fetchFeatures()
      } else {
        toast.error('Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Error deleting feature:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const handleToggleActive = async (feature: ProductFeature) => {
    try {
      const response = await fetch(`/api/product-features/${feature.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feature, isActive: !feature.isActive }),
      })

      if (response.ok) {
        toast.success(feature.isActive ? 'Feature deaktiviert' : 'Feature aktiviert')
        fetchFeatures()
      }
    } catch (error) {
      console.error('Error toggling feature:', error)
    }
  }

  const openEditDialog = (feature?: ProductFeature) => {
    if (feature) {
      setCurrentFeature(feature)
      setIsEditing(true)
    } else {
      setCurrentFeature(emptyFeature)
      setIsEditing(false)
    }
    setEditDialogOpen(true)
  }

  const filteredFeatures = features.filter((feature) => {
    if (filterCategory !== 'all' && feature.category !== filterCategory) return false
    if (!showInactive && !feature.isActive) return false
    return true
  })

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Package
  }

  // Category Animation Handlers
  const handleSaveAnimation = async () => {
    if (!currentAnimation.categoryKey || !currentAnimation.title || !currentAnimation.description) {
      toast.error('Kategorie, Titel und Beschreibung sind erforderlich')
      return
    }

    setIsSavingAnimation(true)
    try {
      const url = isEditingAnimation
        ? `/api/admin/category-animations/${currentAnimation.id}`
        : '/api/admin/category-animations'
      const method = isEditingAnimation ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentAnimation),
      })

      if (response.ok) {
        toast.success(isEditingAnimation ? 'Animation aktualisiert' : 'Animation erstellt')
        setAnimationDialogOpen(false)
        setCurrentAnimation(emptyCategoryAnimation)
        fetchCategoryAnimations()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving animation:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSavingAnimation(false)
    }
  }

  const handleDeleteAnimation = async (id: string) => {
    if (!confirm('Animation wirklich löschen?')) return

    try {
      const response = await fetch(`/api/admin/category-animations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Animation gelöscht')
        fetchCategoryAnimations()
      } else {
        toast.error('Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Error deleting animation:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const handleToggleAnimationActive = async (animation: CategoryAnimation) => {
    try {
      const response = await fetch(`/api/admin/category-animations/${animation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...animation, isActive: !animation.isActive }),
      })

      if (response.ok) {
        toast.success(animation.isActive ? 'Animation deaktiviert' : 'Animation aktiviert')
        fetchCategoryAnimations()
      }
    } catch (error) {
      console.error('Error toggling animation:', error)
    }
  }

  const openAnimationDialog = (animation?: CategoryAnimation) => {
    if (animation) {
      setCurrentAnimation(animation)
      setIsEditingAnimation(true)
    } else {
      setCurrentAnimation(emptyCategoryAnimation)
      setIsEditingAnimation(false)
    }
    setAnimationDialogOpen(true)
  }

  const addFeatureToAnimation = () => {
    if (!newFeatureInput.trim()) return
    setCurrentAnimation(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeatureInput.trim()]
    }))
    setNewFeatureInput('')
  }

  const removeFeatureFromAnimation = (index: number) => {
    setCurrentAnimation(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }))
  }

  if (isLoadingConfig || isLoadingFeatures || isLoadingAnimations) {
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
            <Package className="h-8 w-8 text-primary" />
            Produkt-Seite
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Produkt-Seite und alle Features
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              Ungespeicherte Änderungen
            </Badge>
          )}
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? 'Vorschau aus' : 'Vorschau an'}
          </Button>
          {mainTab === 'page' && (
            <Button onClick={handleSaveConfig} disabled={isSavingConfig || !hasChanges}>
              {isSavingConfig ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Speichern</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'page' | 'features' | 'animations')}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="page" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Seiten-Konfiguration
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Features ({features.filter(f => f.isActive).length})
          </TabsTrigger>
          <TabsTrigger value="animations" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Animationen ({categoryAnimations.filter(a => a.isActive).length})
          </TabsTrigger>
        </TabsList>

        {/* Page Config Tab */}
        <TabsContent value="page" className="mt-6">
          <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Editor */}
            <div className="space-y-6">
              <Tabs value={configTab} onValueChange={setConfigTab}>
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { value: 'animated', label: 'Animiert', icon: Sparkles, desc: 'Mit Dashboard-Vorschau' },
                          { value: 'image', label: 'Bild', icon: ImageIcon, desc: 'Vollflächiges Bild' },
                          { value: 'video', label: 'Video', icon: Video, desc: 'Hintergrund-Video' },
                          { value: 'code', label: 'Code', icon: Code, desc: 'Custom Animation' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => updateConfig('heroType', type.value as ProductPageConfig['heroType'])}
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
                          <ImageUploader
                            value={config.heroImageUrl}
                            onUpload={(url) => {
                              updateConfig('heroImageUrl', url)
                              toast.success('Hero-Bild hochgeladen!')
                            }}
                            onRemove={() => removeImage('hero')}
                            uploadEndpoint="/api/admin/product-config/upload"
                            uploadData={{ type: 'hero' }}
                            aspectRatio={16/9}
                            placeholder="Hero-Bild hochladen"
                            description="JPEG, PNG, WebP • Max. 10MB • Empfohlen: 1920x1080px"
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

                      {/* Code Animation Settings */}
                      {config.heroType === 'code' && (
                        <div className="space-y-4 border-t pt-6">
                          <div className="space-y-2">
                            <Label>Custom Animation Code (CSS/JS)</Label>
                            <Textarea
                              value={config.heroAnimationCode || ''}
                              onChange={(e) => updateConfig('heroAnimationCode', e.target.value)}
                              placeholder="// Custom animation code..."
                              rows={8}
                              className="font-mono text-sm"
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
                          onValueChange={(v) => updateConfig('heroLayout', v as ProductPageConfig['heroLayout'])}
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
                      <div className="space-y-2">
                        <Label>Badge-Text</Label>
                        <Input
                          value={config.heroBadgeText || ''}
                          onChange={(e) => updateConfig('heroBadgeText', e.target.value)}
                          placeholder="z.B. Die All-in-One Plattform"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={config.heroTitle}
                            onChange={(e) => updateConfig('heroTitle', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Highlight-Wort (farbig)</Label>
                          <Input
                            value={config.heroTitleHighlight || ''}
                            onChange={(e) => updateConfig('heroTitleHighlight', e.target.value)}
                          />
                        </div>
                      </div>

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
                                  onChange={(e) => updateConfig(`trustIndicator${i}` as keyof ProductPageConfig, e.target.value)}
                                  placeholder={`Trust-Indikator ${i}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Features Section Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Features-Bereich</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Abschnitts-Titel</Label>
                        <Input
                          value={config.featuresSectionTitle || ''}
                          onChange={(e) => updateConfig('featuresSectionTitle', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Abschnitts-Beschreibung</Label>
                        <Textarea
                          value={config.featuresSectionDescription || ''}
                          onChange={(e) => updateConfig('featuresSectionDescription', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.showFeatureCategories}
                          onCheckedChange={(checked) => updateConfig('showFeatureCategories', checked)}
                        />
                        <Label>Kategorien-Filter anzeigen</Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bottom CTA */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Unterer CTA-Bereich</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Titel</Label>
                        <Input
                          value={config.bottomCtaTitle || ''}
                          onChange={(e) => updateConfig('bottomCtaTitle', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={config.bottomCtaDescription || ''}
                          onChange={(e) => updateConfig('bottomCtaDescription', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Button Text</Label>
                          <Input
                            value={config.bottomCtaButtonText || ''}
                            onChange={(e) => updateConfig('bottomCtaButtonText', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Button Link</Label>
                          <Input
                            value={config.bottomCtaButtonLink || ''}
                            onChange={(e) => updateConfig('bottomCtaButtonLink', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* CTA Tab */}
                <TabsContent value="cta" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MousePointer className="h-5 w-5 text-primary" />
                        Hero Call-to-Action Buttons
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                </TabsContent>

                {/* Design Tab */}
                <TabsContent value="design" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        Animationen & Farben
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

                      {config.heroType === 'animated' && (
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Dashboard-Vorschau</Label>
                            <p className="text-xs text-muted-foreground">Animiertes Dashboard rechts</p>
                          </div>
                          <Switch
                            checked={config.showDashboardPreview}
                            onCheckedChange={(v) => updateConfig('showDashboardPreview', v)}
                          />
                        </div>
                      )}

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-semibold">Design-System Farben verwenden</Label>
                          <p className="text-xs text-muted-foreground">Automatisch Primary, Secondary, Accent aus dem Design-System</p>
                        </div>
                        <Switch
                          checked={config.useDesignSystemColors}
                          onCheckedChange={(v) => updateConfig('useDesignSystemColors', v)}
                        />
                      </div>

                      {!config.useDesignSystemColors && (
                        <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
                          <Label className="text-sm font-medium">Custom Animation-Farben</Label>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Primär</Label>
                              <Input
                                type="color"
                                value={config.animationPrimaryColor || '#8b5cf6'}
                                onChange={(e) => updateConfig('animationPrimaryColor', e.target.value)}
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Sekundär</Label>
                              <Input
                                type="color"
                                value={config.animationSecondaryColor || '#ec4899'}
                                onChange={(e) => updateConfig('animationSecondaryColor', e.target.value)}
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Akzent</Label>
                              <Input
                                type="color"
                                value={config.animationAccentColor || '#3b82f6'}
                                onChange={(e) => updateConfig('animationAccentColor', e.target.value)}
                                className="h-10"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Glow Effect Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Glow-Effekt auf Feature-Kacheln
                      </CardTitle>
                      <CardDescription>
                        Ein leuchtender Rahmeneffekt, der dem Mauszeiger folgt
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Glow-Effekt aktivieren</Label>
                          <p className="text-xs text-muted-foreground">Leuchtender Rahmen folgt dem Mauszeiger</p>
                        </div>
                        <Switch
                          checked={config.glowEffectEnabled ?? true}
                          onCheckedChange={(v) => updateConfig('glowEffectEnabled', v)}
                        />
                      </div>

                      {config.glowEffectEnabled !== false && (
                        <>
                          <Separator />

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Spread (Ausbreitung): {config.glowEffectSpread ?? 40}%</Label>
                              </div>
                              <Slider
                                value={[config.glowEffectSpread ?? 40]}
                                onValueChange={([v]) => updateConfig('glowEffectSpread', v)}
                                min={20}
                                max={80}
                                step={5}
                              />
                              <p className="text-xs text-muted-foreground">Größe des leuchtenden Bereichs</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Proximity (Nähe): {config.glowEffectProximity ?? 64}px</Label>
                              </div>
                              <Slider
                                value={[config.glowEffectProximity ?? 64]}
                                onValueChange={([v]) => updateConfig('glowEffectProximity', v)}
                                min={32}
                                max={128}
                                step={8}
                              />
                              <p className="text-xs text-muted-foreground">Wie nah die Maus sein muss, um den Effekt auszulösen</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Border-Breite: {config.glowEffectBorderWidth ?? 3}px</Label>
                              </div>
                              <Slider
                                value={[config.glowEffectBorderWidth ?? 3]}
                                onValueChange={([v]) => updateConfig('glowEffectBorderWidth', v)}
                                min={1}
                                max={6}
                                step={1}
                              />
                              <p className="text-xs text-muted-foreground">Breite des leuchtenden Rahmens</p>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Gradient-Effekt verwenden</Label>
                              <p className="text-xs text-muted-foreground">Farbverlauf statt einzelner Farbe</p>
                            </div>
                            <Switch
                              checked={config.glowUseGradient ?? true}
                              onCheckedChange={(v) => updateConfig('glowUseGradient', v)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Design-System Farben für Glow</Label>
                              <p className="text-xs text-muted-foreground">Verwendet --glow-primary und --glow-secondary aus dem Design-System</p>
                            </div>
                            <Switch
                              checked={config.glowUseDesignSystem ?? true}
                              onCheckedChange={(v) => updateConfig('glowUseDesignSystem', v)}
                            />
                          </div>

                          {!config.glowUseDesignSystem && (
                            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
                              <Label className="text-sm font-medium">Custom Glow-Farben</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs">Primäre Glow-Farbe</Label>
                                  <Input
                                    type="color"
                                    value={config.glowCustomPrimary || '#3d9970'}
                                    onChange={(e) => updateConfig('glowCustomPrimary', e.target.value)}
                                    className="h-10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Sekundäre Glow-Farbe</Label>
                                  <Input
                                    type="color"
                                    value={config.glowCustomSecondary || '#e08c52'}
                                    onChange={(e) => updateConfig('glowCustomSecondary', e.target.value)}
                                    className="h-10"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
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
                        fallbackTitle="NICNOA Produkt - Features & Funktionen"
                        fallbackDescription="Alle Features und Funktionen der NICNOA Plattform..."
                        url="nicnoa.de › produkt"
                        onTitleChange={(value) => updateConfig('metaTitle', value)}
                        onDescriptionChange={(value) => updateConfig('metaDescription', value)}
                        ogImageUrl={config.ogImage}
                        onOgImageUpload={(url) => {
                          updateConfig('ogImage', url)
                          toast.success('OG-Bild hochgeladen!')
                        }}
                        onOgImageRemove={() => removeImage('og')}
                        ogImageUploadEndpoint="/api/admin/product-config/upload"
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
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Live-Vorschau
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="w-full">
                      {/* Hero Preview */}
                      <div className="border rounded-xl overflow-hidden bg-slate-950 relative aspect-[16/9]">
                        {/* Background */}
                        <div className="absolute inset-0 overflow-hidden">
                          {config.heroType === 'image' && config.heroImageUrl ? (
                            <>
                              <Image
                                src={config.heroImageUrl}
                                alt={config.heroImageAlt || 'Hero'}
                                fill
                                className="object-cover"
                              />
                              <div
                                className="absolute inset-0 bg-slate-950/50"
                                style={{ opacity: config.heroImageOverlay / 100 }}
                              />
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/50">
                              {config.particlesEnabled && config.animationEnabled && (
                                <>
                                  {Array.from({ length: 15 }).map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute w-1 h-1 rounded-full"
                                      style={{
                                        left: `${(i * 7) % 100}%`,
                                        top: `${(i * 11) % 100}%`,
                                        backgroundColor: 'hsl(var(--primary) / 0.4)',
                                      }}
                                      animate={{
                                        opacity: [0.2, 0.8, 0.2],
                                        scale: [1, 1.5, 1],
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
                              <motion.div
                                className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl"
                                style={{ backgroundColor: 'hsl(var(--primary) / 0.3)' }}
                                animate={config.animationEnabled ? {
                                  scale: [1, 1.2, 1],
                                  opacity: [0.3, 0.5, 0.3],
                                } : {}}
                                transition={{ duration: 4, repeat: Infinity }}
                              />
                              <motion.div
                                className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full blur-3xl"
                                style={{ backgroundColor: 'hsl(var(--secondary) / 0.25)' }}
                                animate={config.animationEnabled ? {
                                  scale: [1, 1.3, 1],
                                  opacity: [0.25, 0.4, 0.25],
                                } : {}}
                                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex items-center p-6">
                          <div className={`${config.heroLayout === 'split' && config.heroType === 'animated' ? 'w-3/5' : 'w-full text-center'}`}>
                            {config.heroBadgeText && (
                              <div
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs mb-3"
                                style={{
                                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                                  borderColor: 'hsl(var(--primary) / 0.3)',
                                  color: 'hsl(var(--primary))',
                                  border: '1px solid',
                                }}
                              >
                                <Sparkles className="h-3 w-3" />
                                <span>{config.heroBadgeText}</span>
                              </div>
                            )}
                            
                            <h1 className="font-bold text-white leading-tight mb-2 text-xl">
                              {config.heroTitle.replace(config.heroTitleHighlight || '', '')}
                              <span style={{ color: 'hsl(var(--primary))' }}>
                                {config.heroTitleHighlight}
                              </span>
                            </h1>
                            
                            {config.heroDescription && (
                              <p className="text-slate-300/90 mb-3 text-xs">
                                {config.heroDescription}
                              </p>
                            )}
                            
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1.5 rounded-lg text-white font-medium text-xs flex items-center gap-1"
                                style={{ backgroundColor: 'hsl(var(--primary))' }}
                              >
                                {config.ctaPrimaryText}
                                <ArrowRight className="h-3 w-3" />
                              </button>
                              {config.showSecondaryCta && config.ctaSecondaryText && (
                                <button className="px-3 py-1.5 rounded-lg border border-slate-600 text-white font-medium text-xs">
                                  {config.ctaSecondaryText}
                                </button>
                              )}
                            </div>
                            
                            {config.showTrustIndicators && (
                              <div className="flex gap-3 mt-3">
                                {[config.trustIndicator1, config.trustIndicator2, config.trustIndicator3]
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((indicator, i) => (
                                    <div key={i} className="flex items-center gap-1 text-[10px] text-slate-400">
                                      <CheckCircle2 className="h-2.5 w-2.5 text-green-400" />
                                      <span>{indicator}</span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          
                          {config.heroType === 'animated' && config.showDashboardPreview && config.heroLayout === 'split' && (
                            <div className="w-2/5 pl-4">
                              <div className="relative">
                                <div
                                  className="absolute -inset-1 rounded-xl blur-lg opacity-60"
                                  style={{ backgroundColor: 'hsl(var(--primary) / 0.2)' }}
                                />
                                <div className="relative bg-slate-900/90 rounded-lg border border-slate-700/50 overflow-hidden">
                                  <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-700/50 bg-slate-800/50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[6px] text-slate-400 ml-1">{config.dashboardTitle}</span>
                                  </div>
                                  <div className="p-2 space-y-1.5">
                                    <div className="grid grid-cols-3 gap-1">
                                      {['€2.4k', '24', '87%'].map((val, i) => (
                                        <div key={i} className="bg-slate-800/50 rounded p-1.5">
                                          <p className="text-[8px] font-bold text-white">{val}</p>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="bg-slate-800/30 rounded p-1.5 h-10 flex items-end gap-0.5">
                                      {[40, 65, 45, 80, 55, 90].map((h, i) => (
                                        <div
                                          key={i}
                                          className="flex-1 rounded-t"
                                          style={{
                                            height: `${h}%`,
                                            background: `linear-gradient(to top, hsl(var(--primary)), hsl(var(--secondary)))`,
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {config.showScrollIndicator && (
                          <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute bottom-3 left-1/2 -translate-x-1/2"
                          >
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground py-3">
                      Echtzeit-Vorschau mit Design-System Farben
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/5 border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-500">Tipp</p>
                        <p className="text-muted-foreground mt-1">
                          {config.useDesignSystemColors 
                            ? 'Die Animationen nutzen automatisch die Farben aus dem Design-System (Primary, Secondary, Accent).'
                            : 'Custom Farben aktiv. Wechseln Sie zu Design-System Farben für konsistentes Branding.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6 mt-6">
          {/* Actions Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Kategorie filtern" />
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
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showInactive}
                      onCheckedChange={setShowInactive}
                      id="show-inactive"
                    />
                    <Label htmlFor="show-inactive" className="text-sm">
                      Inaktive anzeigen
                    </Label>
                  </div>
                </div>
                <Button onClick={() => openEditDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Feature
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          {filteredFeatures.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Keine Features gefunden</p>
                <Button onClick={() => openEditDialog()} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Feature erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFeatures.map((feature, index) => {
                const IconComponent = getIconComponent(feature.iconName)
                const categoryLabel = categories.find(c => c.value === feature.category)?.label || feature.category

                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${!feature.isActive ? 'opacity-60' : ''}`}>
                      {feature.isHighlight && (
                        <div className="absolute top-0 right-0">
                          <Badge className="rounded-none rounded-bl-lg bg-primary">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Highlight
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{feature.title}</CardTitle>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {categoryLabel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {feature.description}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(feature)}
                            >
                              {feature.isActive ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <ArrowUpDown className="h-3 w-3" />
                              {feature.sortOrder}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(feature)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteFeature(feature.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations" className="space-y-6 mt-6">
          {/* Actions Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Kategorie-Animationen</h3>
                  <p className="text-sm text-muted-foreground">
                    Hero-Flächen mit Animationen für jede Feature-Kategorie
                  </p>
                </div>
                <Button onClick={() => openAnimationDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Animation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Animations Grid */}
          {categoryAnimations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Play className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Keine Animationen gefunden</p>
                <Button onClick={() => openAnimationDialog()} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Animation erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryAnimations
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((animation, index) => {
                  const categoryLabel = categories.find(c => c.value === animation.categoryKey)?.label || animation.categoryKey
                  const presetLabel = presetAnimations.find(p => p.value === animation.presetAnimation)?.label || animation.presetAnimation

                  return (
                    <motion.div
                      key={animation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`relative overflow-hidden transition-all hover:shadow-md ${!animation.isActive ? 'opacity-60' : ''}`}>
                        <div 
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ 
                            background: animation.useDesignSystemColors 
                              ? 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))' 
                              : `linear-gradient(to right, ${animation.customPrimaryColor || '#8b5cf6'}, ${animation.customAccentColor || '#ec4899'})`
                          }}
                        />
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2 text-xs">
                                {categoryLabel}
                              </Badge>
                              <CardTitle className="text-lg">{animation.title}</CardTitle>
                              {animation.subtitle && (
                                <p className="text-sm text-muted-foreground mt-1">{animation.subtitle}</p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {animation.description}
                          </p>
                          
                          {/* Animation Info */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs">
                              <Play className="h-3 w-3 mr-1" />
                              {presetLabel || animation.animationType}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {animation.animationPosition}
                            </Badge>
                            {animation.features.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {animation.features.length} Features
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleAnimationActive(animation)}
                              >
                                {animation.isActive ? (
                                  <Eye className="h-4 w-4 text-green-500" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <GripVertical className="h-3 w-3" />
                                {animation.sortOrder}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openAnimationDialog(animation)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAnimation(animation.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
            </div>
          )}

          {/* Category Showcase Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Showcase-Einstellungen</CardTitle>
              <CardDescription>
                Globale Einstellungen für die Kategorie-Showcase Sektion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Category Showcase anzeigen</Label>
                  <p className="text-xs text-muted-foreground">Zeigt die animierten Kategorie-Hero-Flächen</p>
                </div>
                <Switch
                  checked={config.showCategoryShowcase ?? true}
                  onCheckedChange={(v) => updateConfig('showCategoryShowcase', v)}
                />
              </div>
              
              {config.showCategoryShowcase && (
                <>
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Abschnitts-Titel</Label>
                      <Input
                        value={config.categoryShowcaseTitle || ''}
                        onChange={(e) => updateConfig('categoryShowcaseTitle', e.target.value)}
                        placeholder="Entdecken Sie unsere Funktionen"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Auto-Play Intervall (ms)</Label>
                      <Input
                        type="number"
                        value={config.autoPlayInterval || 5000}
                        onChange={(e) => updateConfig('autoPlayInterval', parseInt(e.target.value) || 5000)}
                        min={2000}
                        max={15000}
                        step={500}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Abschnitts-Untertitel</Label>
                    <Textarea
                      value={config.categoryShowcaseSubtitle || ''}
                      onChange={(e) => updateConfig('categoryShowcaseSubtitle', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.autoPlayEnabled ?? true}
                        onCheckedChange={(v) => updateConfig('autoPlayEnabled', v)}
                      />
                      <Label>Auto-Play aktivieren</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.showDots ?? true}
                        onCheckedChange={(v) => updateConfig('showDots', v)}
                      />
                      <Label>Punkte-Navigation</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.showArrows ?? true}
                        onCheckedChange={(v) => updateConfig('showArrows', v)}
                      />
                      <Label>Pfeile anzeigen</Label>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Feature Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Feature bearbeiten' : 'Neues Feature erstellen'}
            </DialogTitle>
            <DialogDescription>
              Fügen Sie ein neues Produkt-Feature hinzu oder bearbeiten Sie ein bestehendes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Titel *</Label>
                <Input
                  value={currentFeature.title}
                  onChange={(e) => setCurrentFeature({ ...currentFeature, title: e.target.value })}
                  placeholder="z.B. Digitale Terminbuchung"
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={currentFeature.iconName}
                  onValueChange={(value) => setCurrentFeature({ ...currentFeature, iconName: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIcons.map((icon) => {
                      const IconComp = iconMap[icon]
                      return (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <IconComp className="h-4 w-4" />
                            {icon}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Beschreibung *</Label>
              <Textarea
                value={currentFeature.description}
                onChange={(e) => setCurrentFeature({ ...currentFeature, description: e.target.value })}
                placeholder="Beschreiben Sie das Feature..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select
                  value={currentFeature.category}
                  onValueChange={(value) => setCurrentFeature({ ...currentFeature, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sortierung</Label>
                <Input
                  type="number"
                  value={currentFeature.sortOrder}
                  onChange={(e) => setCurrentFeature({ ...currentFeature, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={currentFeature.isActive}
                  onCheckedChange={(checked) => setCurrentFeature({ ...currentFeature, isActive: checked })}
                />
                <Label>Aktiv</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={currentFeature.isHighlight}
                  onCheckedChange={(checked) => setCurrentFeature({ ...currentFeature, isHighlight: checked })}
                />
                <Label>Als Highlight markieren</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveFeature} disabled={isSavingFeature}>
              {isSavingFeature ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Animation Dialog */}
      <Dialog open={animationDialogOpen} onOpenChange={setAnimationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingAnimation ? 'Animation bearbeiten' : 'Neue Animation erstellen'}
            </DialogTitle>
            <DialogDescription>
              Erstellen Sie eine animierte Hero-Fläche für eine Feature-Kategorie.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategorie *</Label>
                <Select
                  value={currentAnimation.categoryKey}
                  onValueChange={(value) => setCurrentAnimation({ ...currentAnimation, categoryKey: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sortierung</Label>
                <Input
                  type="number"
                  value={currentAnimation.sortOrder}
                  onChange={(e) => setCurrentAnimation({ ...currentAnimation, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Texts */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titel *</Label>
                <Input
                  value={currentAnimation.title || ''}
                  onChange={(e) => setCurrentAnimation({ ...currentAnimation, title: e.target.value })}
                  placeholder="z.B. Kernfunktionen"
                />
              </div>
              <div className="space-y-2">
                <Label>Untertitel</Label>
                <Input
                  value={currentAnimation.subtitle || ''}
                  onChange={(e) => setCurrentAnimation({ ...currentAnimation, subtitle: e.target.value })}
                  placeholder="z.B. Das Fundament Ihres Erfolgs"
                />
              </div>
              <div className="space-y-2">
                <Label>Badge-Text</Label>
                <Input
                  value={currentAnimation.badgeText || ''}
                  onChange={(e) => setCurrentAnimation({ ...currentAnimation, badgeText: e.target.value })}
                  placeholder="z.B. Alles in einem"
                />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung *</Label>
                <Textarea
                  value={currentAnimation.description || ''}
                  onChange={(e) => setCurrentAnimation({ ...currentAnimation, description: e.target.value })}
                  placeholder="Beschreiben Sie die Kategorie..."
                  rows={3}
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <Label>Features / Merkmale</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  placeholder="Feature hinzufügen..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeatureToAnimation())}
                />
                <Button type="button" onClick={addFeatureToAnimation} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {(currentAnimation.features || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(currentAnimation.features || []).map((feature, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeatureFromAnimation(i)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Animation Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold">Animation-Einstellungen</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Animation-Typ</Label>
                  <Select
                    value={currentAnimation.animationType}
                    onValueChange={(value) => setCurrentAnimation({ ...currentAnimation, animationType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preset">Preset-Animation</SelectItem>
                      <SelectItem value="custom">Custom Code</SelectItem>
                      <SelectItem value="lottie">Lottie URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {currentAnimation.animationType === 'preset' && (
                  <div className="space-y-2">
                    <Label>Preset wählen</Label>
                    <Select
                      value={currentAnimation.presetAnimation || 'calendar'}
                      onValueChange={(value) => setCurrentAnimation({ ...currentAnimation, presetAnimation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {presetAnimations.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            <div className="flex flex-col">
                              <span>{preset.label}</span>
                              <span className="text-xs text-muted-foreground">{preset.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {currentAnimation.animationType === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Animation Code (HTML/CSS)</Label>
                  <Textarea
                    value={currentAnimation.customAnimationCode || ''}
                    onChange={(e) => setCurrentAnimation({ ...currentAnimation, customAnimationCode: e.target.value })}
                    placeholder="<div class='my-animation'>...</div>"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {currentAnimation.animationType === 'lottie' && (
                <div className="space-y-2">
                  <Label>Lottie JSON URL</Label>
                  <Input
                    value={currentAnimation.lottieUrl || ''}
                    onChange={(e) => setCurrentAnimation({ ...currentAnimation, lottieUrl: e.target.value })}
                    placeholder="https://assets.lottiefiles.com/..."
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={currentAnimation.animationPosition}
                    onValueChange={(value) => setCurrentAnimation({ ...currentAnimation, animationPosition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Links</SelectItem>
                      <SelectItem value="right">Rechts</SelectItem>
                      <SelectItem value="center">Zentriert</SelectItem>
                      <SelectItem value="background">Hintergrund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Größe</Label>
                  <Select
                    value={currentAnimation.animationSize}
                    onValueChange={(value) => setCurrentAnimation({ ...currentAnimation, animationSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Klein</SelectItem>
                      <SelectItem value="medium">Mittel</SelectItem>
                      <SelectItem value="large">Groß</SelectItem>
                      <SelectItem value="full">Vollständig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Geschwindigkeit: {currentAnimation.animationSpeed?.toFixed(1)}x</Label>
                  <Slider
                    value={[currentAnimation.animationSpeed || 1]}
                    onValueChange={([v]) => setCurrentAnimation({ ...currentAnimation, animationSpeed: v })}
                    min={0.5}
                    max={2}
                    step={0.1}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Color Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Design-System Farben verwenden</Label>
                  <p className="text-xs text-muted-foreground">Automatisch Primary, Secondary, Accent</p>
                </div>
                <Switch
                  checked={currentAnimation.useDesignSystemColors ?? true}
                  onCheckedChange={(v) => setCurrentAnimation({ ...currentAnimation, useDesignSystemColors: v })}
                />
              </div>

              {!currentAnimation.useDesignSystemColors && (
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg border bg-muted/50">
                  <div className="space-y-2">
                    <Label className="text-xs">Primär</Label>
                    <Input
                      type="color"
                      value={currentAnimation.customPrimaryColor || '#8b5cf6'}
                      onChange={(e) => setCurrentAnimation({ ...currentAnimation, customPrimaryColor: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Sekundär</Label>
                    <Input
                      type="color"
                      value={currentAnimation.customSecondaryColor || '#f1f5f9'}
                      onChange={(e) => setCurrentAnimation({ ...currentAnimation, customSecondaryColor: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Akzent</Label>
                    <Input
                      type="color"
                      value={currentAnimation.customAccentColor || '#ec4899'}
                      onChange={(e) => setCurrentAnimation({ ...currentAnimation, customAccentColor: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Switch
                checked={currentAnimation.isActive ?? true}
                onCheckedChange={(v) => setCurrentAnimation({ ...currentAnimation, isActive: v })}
              />
              <Label>Animation aktiv</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAnimationDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveAnimation} disabled={isSavingAnimation}>
              {isSavingAnimation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

