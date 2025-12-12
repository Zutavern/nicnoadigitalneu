'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LogIn,
  Save,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Type,
  Settings2,
  Globe,
  Search,
  Monitor,
  Smartphone,
  UserPlus,
  Mail,
  Lock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
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
import Link from 'next/link'
import { ImageUploader } from '@/components/ui/image-uploader'

// Icon-Optionen für Features
const iconOptions = [
  { value: 'scissors', label: 'Schere' },
  { value: 'briefcase', label: 'Koffer' },
  { value: 'bar-chart-3', label: 'Diagramm' },
  { value: 'users', label: 'Benutzer' },
  { value: 'calendar', label: 'Kalender' },
  { value: 'credit-card', label: 'Kreditkarte' },
  { value: 'shield', label: 'Schild' },
  { value: 'check-circle', label: 'Haken' },
  { value: 'star', label: 'Stern' },
  { value: 'zap', label: 'Blitz' },
  { value: 'heart', label: 'Herz' },
  { value: 'clock', label: 'Uhr' },
  { value: 'sparkles', label: 'Funken' },
  { value: 'trending-up', label: 'Trend hoch' },
  { value: 'lock', label: 'Schloss' },
]

// Icon-Komponente Helper
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'scissors': LucideIcons.Scissors,
    'briefcase': LucideIcons.Briefcase,
    'bar-chart-3': LucideIcons.BarChart3,
    'users': LucideIcons.Users,
    'calendar': LucideIcons.Calendar,
    'credit-card': LucideIcons.CreditCard,
    'shield': LucideIcons.Shield,
    'check-circle': LucideIcons.CheckCircle,
    'star': LucideIcons.Star,
    'zap': LucideIcons.Zap,
    'heart': LucideIcons.Heart,
    'clock': LucideIcons.Clock,
    'sparkles': LucideIcons.Sparkles,
    'trending-up': LucideIcons.TrendingUp,
    'lock': LucideIcons.Lock,
  }
  return iconMap[iconName] || LucideIcons.CheckCircle
}

interface AuthPageConfig {
  id: string
  layout: string
  formPosition: string
  backgroundColor: string
  
  loginImageUrl: string | null
  loginImageAlt: string | null
  loginImageOverlay: number
  loginTitle: string
  loginSubtitle: string | null
  loginCtaText: string | null
  loginCtaLink: string | null
  
  showLoginFeatures: boolean
  loginFeature1Icon: string | null
  loginFeature1Text: string | null
  loginFeature2Icon: string | null
  loginFeature2Text: string | null
  loginFeature3Icon: string | null
  loginFeature3Text: string | null
  
  registerImageUrl: string | null
  registerImageAlt: string | null
  registerImageOverlay: number
  registerTitle: string
  registerSubtitle: string | null
  registerCtaText: string | null
  registerCtaLink: string | null
  
  showRegisterBenefits: boolean
  registerBenefit1Icon: string | null
  registerBenefit1Text: string | null
  registerBenefit2Icon: string | null
  registerBenefit2Text: string | null
  registerBenefit3Icon: string | null
  registerBenefit3Text: string | null
  
  showGoogleLogin: boolean
  showAppleLogin: boolean
  showLinkedInLogin: boolean
  showFacebookLogin: boolean
  
  showLogo: boolean
  logoPosition: string
  
  loginMetaTitle: string | null
  loginMetaDescription: string | null
  registerMetaTitle: string | null
  registerMetaDescription: string | null
}

const defaultConfig: AuthPageConfig = {
  id: 'default',
  layout: 'split',
  formPosition: 'left',
  backgroundColor: 'dark',
  
  loginImageUrl: null,
  loginImageAlt: null,
  loginImageOverlay: 0,
  loginTitle: 'Anmelden',
  loginSubtitle: 'Willkommen zurück! Melden Sie sich an, um fortzufahren.',
  loginCtaText: 'Noch kein Konto?',
  loginCtaLink: 'Jetzt registrieren',
  
  showLoginFeatures: true,
  loginFeature1Icon: 'scissors',
  loginFeature1Text: 'Termine verwalten',
  loginFeature2Icon: 'briefcase',
  loginFeature2Text: 'Stuhlvermietung optimieren',
  loginFeature3Icon: 'bar-chart-3',
  loginFeature3Text: 'Umsätze analysieren',
  
  registerImageUrl: null,
  registerImageAlt: null,
  registerImageOverlay: 0,
  registerTitle: 'Konto erstellen',
  registerSubtitle: 'Starten Sie jetzt und revolutionieren Sie Ihr Salon-Management.',
  registerCtaText: 'Bereits ein Konto?',
  registerCtaLink: 'Jetzt anmelden',
  
  showRegisterBenefits: true,
  registerBenefit1Icon: 'check-circle',
  registerBenefit1Text: '14 Tage kostenlos testen',
  registerBenefit2Icon: 'credit-card',
  registerBenefit2Text: 'Keine Kreditkarte erforderlich',
  registerBenefit3Icon: 'shield',
  registerBenefit3Text: 'DSGVO-konform & sicher',
  
  showGoogleLogin: true,
  showAppleLogin: false,
  showLinkedInLogin: true,
  showFacebookLogin: true,
  
  showLogo: true,
  logoPosition: 'form',
  
  loginMetaTitle: null,
  loginMetaDescription: null,
  registerMetaTitle: null,
  registerMetaDescription: null,
}

export default function AuthPageCMS() {
  const [config, setConfig] = useState<AuthPageConfig>(defaultConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [previewPage, setPreviewPage] = useState<'login' | 'register'>('login')
  const [hasChanges, setHasChanges] = useState(false)

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/auth-page-config')
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
      const res = await fetch('/api/admin/auth-page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success('Login/Registrierung Konfiguration gespeichert!')
      setHasChanges(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = <K extends keyof AuthPageConfig>(key: K, value: AuthPageConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
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
            <LogIn className="h-8 w-8 text-primary" />
            Login & Registrierung
          </h1>
          <p className="text-muted-foreground">
            Gestalten Sie die Login- und Registrierungsseiten im Epidemic Sound-Stil
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              Ungespeicherte Änderungen
            </Badge>
          )}
          <Button variant="outline" asChild>
            <Link href="/login" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Login ansehen
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="login" className="text-xs sm:text-sm">
                <LogIn className="mr-1 h-4 w-4 hidden sm:inline" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="text-xs sm:text-sm">
                <UserPlus className="mr-1 h-4 w-4 hidden sm:inline" />
                Registrierung
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">
                <Settings2 className="mr-1 h-4 w-4 hidden sm:inline" />
                Einstellungen
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs sm:text-sm">
                <Search className="mr-1 h-4 w-4 hidden sm:inline" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Login-Bild
                  </CardTitle>
                  <CardDescription>
                    Das Bild wird rechts neben dem Login-Formular angezeigt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploader
                    value={config.loginImageUrl}
                    onUpload={(url) => {
                      updateConfig('loginImageUrl', url)
                      toast.success('Login-Bild hochgeladen!')
                    }}
                    onRemove={() => updateConfig('loginImageUrl', null)}
                    uploadEndpoint="/api/admin/auth-page-config/upload-image"
                    uploadData={{ type: 'login' }}
                    aspectRatio={9/16}
                    placeholder="Login-Bild hochladen"
                    description="JPEG, PNG, WebP • Max. 10MB • Empfohlen: 900x1600px (Portrait)"
                  />

                  {config.loginImageUrl && (
                    <>
                      <div className="space-y-2">
                        <Label>Alt-Text</Label>
                        <Input
                          value={config.loginImageAlt || ''}
                          onChange={(e) => updateConfig('loginImageAlt', e.target.value)}
                          placeholder="Beschreibung des Bildes"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Abdunklung: {config.loginImageOverlay}%</Label>
                        <Slider
                          value={[config.loginImageOverlay]}
                          onValueChange={([v]) => updateConfig('loginImageOverlay', v)}
                          min={0}
                          max={80}
                          step={5}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-primary" />
                    Login-Texte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input
                      value={config.loginTitle}
                      onChange={(e) => updateConfig('loginTitle', e.target.value)}
                      placeholder="z.B. Anmelden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Untertitel</Label>
                    <Textarea
                      value={config.loginSubtitle || ''}
                      onChange={(e) => updateConfig('loginSubtitle', e.target.value)}
                      placeholder="z.B. Willkommen zurück!"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CTA-Text</Label>
                      <Input
                        value={config.loginCtaText || ''}
                        onChange={(e) => updateConfig('loginCtaText', e.target.value)}
                        placeholder="z.B. Noch kein Konto?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA-Link Text</Label>
                      <Input
                        value={config.loginCtaLink || ''}
                        onChange={(e) => updateConfig('loginCtaLink', e.target.value)}
                        placeholder="z.B. Jetzt registrieren"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Features anzeigen</CardTitle>
                      <CardDescription>Punkte unter dem Logo (auf Desktop)</CardDescription>
                    </div>
                    <Switch
                      checked={config.showLoginFeatures}
                      onCheckedChange={(v) => updateConfig('showLoginFeatures', v)}
                    />
                  </div>
                </CardHeader>
                {config.showLoginFeatures && (
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => {
                      const iconKey = `loginFeature${i}Icon` as keyof AuthPageConfig
                      const textKey = `loginFeature${i}Text` as keyof AuthPageConfig
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <Select
                            value={(config[iconKey] as string) || 'check-circle'}
                            onValueChange={(v) => updateConfig(iconKey, v)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {iconOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={(config[textKey] as string) || ''}
                            onChange={(e) => updateConfig(textKey, e.target.value)}
                            placeholder={`Feature ${i}`}
                            className="flex-1"
                          />
                        </div>
                      )
                    })}
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Registrierung-Bild
                  </CardTitle>
                  <CardDescription>
                    Das Bild wird rechts neben dem Registrierungs-Formular angezeigt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUploader
                    value={config.registerImageUrl}
                    onUpload={(url) => {
                      updateConfig('registerImageUrl', url)
                      toast.success('Registrierung-Bild hochgeladen!')
                    }}
                    onRemove={() => updateConfig('registerImageUrl', null)}
                    uploadEndpoint="/api/admin/auth-page-config/upload-image"
                    uploadData={{ type: 'register' }}
                    aspectRatio={9/16}
                    placeholder="Registrierung-Bild hochladen"
                    description="JPEG, PNG, WebP • Max. 10MB • Empfohlen: 900x1600px (Portrait)"
                  />

                  {config.registerImageUrl && (
                    <>
                      <div className="space-y-2">
                        <Label>Alt-Text</Label>
                        <Input
                          value={config.registerImageAlt || ''}
                          onChange={(e) => updateConfig('registerImageAlt', e.target.value)}
                          placeholder="Beschreibung des Bildes"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Abdunklung: {config.registerImageOverlay}%</Label>
                        <Slider
                          value={[config.registerImageOverlay]}
                          onValueChange={([v]) => updateConfig('registerImageOverlay', v)}
                          min={0}
                          max={80}
                          step={5}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-primary" />
                    Registrierung-Texte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input
                      value={config.registerTitle}
                      onChange={(e) => updateConfig('registerTitle', e.target.value)}
                      placeholder="z.B. Konto erstellen"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Untertitel</Label>
                    <Textarea
                      value={config.registerSubtitle || ''}
                      onChange={(e) => updateConfig('registerSubtitle', e.target.value)}
                      placeholder="z.B. Starten Sie jetzt..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CTA-Text</Label>
                      <Input
                        value={config.registerCtaText || ''}
                        onChange={(e) => updateConfig('registerCtaText', e.target.value)}
                        placeholder="z.B. Bereits ein Konto?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA-Link Text</Label>
                      <Input
                        value={config.registerCtaLink || ''}
                        onChange={(e) => updateConfig('registerCtaLink', e.target.value)}
                        placeholder="z.B. Jetzt anmelden"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Benefits anzeigen</CardTitle>
                      <CardDescription>Trust-Indikatoren unter dem Formular</CardDescription>
                    </div>
                    <Switch
                      checked={config.showRegisterBenefits}
                      onCheckedChange={(v) => updateConfig('showRegisterBenefits', v)}
                    />
                  </div>
                </CardHeader>
                {config.showRegisterBenefits && (
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => {
                      const iconKey = `registerBenefit${i}Icon` as keyof AuthPageConfig
                      const textKey = `registerBenefit${i}Text` as keyof AuthPageConfig
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <Select
                            value={(config[iconKey] as string) || 'check-circle'}
                            onValueChange={(v) => updateConfig(iconKey, v)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {iconOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={(config[textKey] as string) || ''}
                            onChange={(e) => updateConfig(textKey, e.target.value)}
                            placeholder={`Benefit ${i}`}
                            className="flex-1"
                          />
                        </div>
                      )
                    })}
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Login</CardTitle>
                  <CardDescription>Welche OAuth-Provider sollen angezeigt werden?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white border flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <span>Google</span>
                    </div>
                    <Switch
                      checked={config.showGoogleLogin}
                      onCheckedChange={(v) => updateConfig('showGoogleLogin', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                      </div>
                      <span>Apple</span>
                    </div>
                    <Switch
                      checked={config.showAppleLogin}
                      onCheckedChange={(v) => updateConfig('showAppleLogin', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A66C2] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      <span>LinkedIn</span>
                    </div>
                    <Switch
                      checked={config.showLinkedInLogin}
                      onCheckedChange={(v) => updateConfig('showLinkedInLogin', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#1877F2] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <span>Facebook</span>
                    </div>
                    <Switch
                      checked={config.showFacebookLogin}
                      onCheckedChange={(v) => updateConfig('showFacebookLogin', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Logo anzeigen</Label>
                    <Switch
                      checked={config.showLogo}
                      onCheckedChange={(v) => updateConfig('showLogo', v)}
                    />
                  </div>

                  {config.showLogo && (
                    <div className="space-y-2">
                      <Label>Logo-Position</Label>
                      <Select
                        value={config.logoPosition}
                        onValueChange={(v) => updateConfig('logoPosition', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="form">Im Formular-Bereich</SelectItem>
                          <SelectItem value="image">Im Bild-Bereich</SelectItem>
                          <SelectItem value="both">Beidseitig</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                    SEO - Login-Seite
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meta-Titel</Label>
                    <Input
                      value={config.loginMetaTitle || ''}
                      onChange={(e) => updateConfig('loginMetaTitle', e.target.value)}
                      placeholder="Anmelden | NICNOA"
                      maxLength={70}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {(config.loginMetaTitle || '').length}/70
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Meta-Beschreibung</Label>
                    <Textarea
                      value={config.loginMetaDescription || ''}
                      onChange={(e) => updateConfig('loginMetaDescription', e.target.value)}
                      placeholder="Melden Sie sich bei NICNOA an..."
                      maxLength={160}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {(config.loginMetaDescription || '').length}/160
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    SEO - Registrierung-Seite
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meta-Titel</Label>
                    <Input
                      value={config.registerMetaTitle || ''}
                      onChange={(e) => updateConfig('registerMetaTitle', e.target.value)}
                      placeholder="Registrieren | NICNOA"
                      maxLength={70}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {(config.registerMetaTitle || '').length}/70
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Meta-Beschreibung</Label>
                    <Textarea
                      value={config.registerMetaDescription || ''}
                      onChange={(e) => updateConfig('registerMetaDescription', e.target.value)}
                      placeholder="Erstellen Sie jetzt Ihr NICNOA-Konto..."
                      maxLength={160}
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {(config.registerMetaDescription || '').length}/160
                    </p>
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
                      variant={previewPage === 'login' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewPage('login')}
                    >
                      <LogIn className="h-4 w-4 mr-1" />
                      Login
                    </Button>
                    <Button
                      variant={previewPage === 'register' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewPage('register')}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Register
                    </Button>
                    <Separator orientation="vertical" className="mx-2 h-8" />
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
                  <div className={`border rounded-xl overflow-hidden bg-slate-950 relative ${
                    previewDevice === 'mobile' ? 'aspect-[9/16]' : 'aspect-video'
                  }`}>
                    <div className="absolute inset-0 flex">
                      {/* Form Side (Links) */}
                      <div className={`bg-slate-950 p-6 flex flex-col ${
                        previewDevice === 'mobile' ? 'w-full' : 'w-1/2'
                      }`}>
                        {/* Logo */}
                        {config.showLogo && (
                          <div className="mb-4">
                            <span className="text-sm font-bold text-white">
                              NICNOA<span className="text-primary">&CO</span>
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h2 className="text-xl font-bold text-white mb-1">
                          {previewPage === 'login' ? config.loginTitle : config.registerTitle}
                        </h2>
                        <p className="text-xs text-slate-400 mb-4">
                          {previewPage === 'login' ? config.loginSubtitle : config.registerSubtitle}
                        </p>

                        {/* OAuth Buttons */}
                        <div className="space-y-2 mb-4">
                          {config.showGoogleLogin && (
                            <button className="w-full h-8 text-xs bg-white text-black rounded flex items-center justify-center gap-2">
                              <span className="font-medium">Mit Google fortfahren</span>
                            </button>
                          )}
                          {config.showAppleLogin && (
                            <button className="w-full h-8 text-xs bg-white text-black rounded flex items-center justify-center gap-2">
                              <span className="font-medium">Mit Apple fortfahren</span>
                            </button>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="relative my-3">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-slate-950 px-2 text-[10px] text-slate-500">ODER</span>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-3 flex-1">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400">Email</span>
                            <div className="h-8 bg-slate-800 rounded border border-slate-700 px-2 flex items-center text-xs text-slate-400">
                              beispiel@email.de
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400">Password</span>
                            <div className="h-8 bg-slate-800 rounded border border-slate-700 px-2 flex items-center text-xs text-slate-400">
                              ••••••••••••
                            </div>
                          </div>
                          <button className="w-full h-8 bg-white text-black rounded text-xs font-medium">
                            {previewPage === 'login' ? 'Anmelden' : 'Registrieren'}
                          </button>
                        </div>

                        {/* Features / Benefits */}
                        {previewDevice === 'desktop' && (
                          <div className="mt-4 space-y-2">
                            {previewPage === 'login' && config.showLoginFeatures && (
                              <>
                                {[1, 2, 3].map((i) => {
                                  const iconKey = `loginFeature${i}Icon` as keyof AuthPageConfig
                                  const textKey = `loginFeature${i}Text` as keyof AuthPageConfig
                                  const IconComp = getIconComponent((config[iconKey] as string) || 'check-circle')
                                  return config[textKey] ? (
                                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-400">
                                      <IconComp className="h-3 w-3 text-primary" />
                                      <span>{config[textKey] as string}</span>
                                    </div>
                                  ) : null
                                })}
                              </>
                            )}
                            {previewPage === 'register' && config.showRegisterBenefits && (
                              <>
                                {[1, 2, 3].map((i) => {
                                  const iconKey = `registerBenefit${i}Icon` as keyof AuthPageConfig
                                  const textKey = `registerBenefit${i}Text` as keyof AuthPageConfig
                                  const IconComp = getIconComponent((config[iconKey] as string) || 'check-circle')
                                  return config[textKey] ? (
                                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-400">
                                      <IconComp className="h-3 w-3 text-green-400" />
                                      <span>{config[textKey] as string}</span>
                                    </div>
                                  ) : null
                                })}
                              </>
                            )}
                          </div>
                        )}

                        {/* CTA Link */}
                        <div className="mt-3 text-[10px] text-slate-400">
                          {previewPage === 'login' ? config.loginCtaText : config.registerCtaText}{' '}
                          <span className="text-primary underline">
                            {previewPage === 'login' ? config.loginCtaLink : config.registerCtaLink}
                          </span>
                        </div>
                      </div>

                      {/* Image Side (Rechts) - nur Desktop */}
                      {previewDevice === 'desktop' && (
                        <div className="w-1/2 relative">
                          {(previewPage === 'login' ? config.loginImageUrl : config.registerImageUrl) ? (
                            <>
                              <Image
                                src={(previewPage === 'login' ? config.loginImageUrl : config.registerImageUrl) || ''}
                                alt={(previewPage === 'login' ? config.loginImageAlt : config.registerImageAlt) || 'Auth Image'}
                                fill
                                className="object-cover"
                              />
                              <div
                                className="absolute inset-0 bg-black"
                                style={{ opacity: (previewPage === 'login' ? config.loginImageOverlay : config.registerImageOverlay) / 100 }}
                              />
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                              <div className="text-center text-slate-500">
                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-xs">Bild hochladen</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground py-3">
                  Epidemic Sound-Stil Vorschau
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
