'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Globe,
  Save,
  RefreshCw,
  Loader2,
  Search,
  Share2,
  Shield,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface GlobalSeoConfig {
  id?: string
  siteName: string
  titleSuffix: string | null
  defaultMetaDescription: string | null
  defaultOgImage: string | null
  twitterHandle: string | null
  facebookAppId: string | null
  googleSiteVerification: string | null
  bingSiteVerification: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  organizationName: string | null
  organizationLogo: string | null
  organizationAddress: string | null
  organizationPhone: string | null
  organizationEmail: string | null
}

const defaultConfig: GlobalSeoConfig = {
  siteName: 'NICNOA&CO.online',
  titleSuffix: ' | NICNOA&CO.online',
  defaultMetaDescription: 'Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces.',
  defaultOgImage: null,
  twitterHandle: null,
  facebookAppId: null,
  googleSiteVerification: null,
  bingSiteVerification: null,
  robotsIndex: true,
  robotsFollow: true,
  organizationName: 'NICNOA GmbH',
  organizationLogo: null,
  organizationAddress: null,
  organizationPhone: null,
  organizationEmail: 'info@nicnoa.online',
}

export default function GlobalSeoPage() {
  const [config, setConfig] = useState<GlobalSeoConfig>(defaultConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/global-seo-config')
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
      const res = await fetch('/api/admin/global-seo-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success('SEO-Konfiguration gespeichert!')
      setHasChanges(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = <K extends keyof GlobalSeoConfig>(key: K, value: GlobalSeoConfig[K]) => {
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
            <Globe className="h-8 w-8 text-primary" />
            Globale SEO-Einstellungen
          </h1>
          <p className="text-muted-foreground">
            Site-weite SEO-Konfiguration und Structured Data
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
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Speichern</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="text-xs sm:text-sm">
                <Globe className="mr-1 h-4 w-4 hidden sm:inline" />
                Allgemein
              </TabsTrigger>
              <TabsTrigger value="social" className="text-xs sm:text-sm">
                <Share2 className="mr-1 h-4 w-4 hidden sm:inline" />
                Social
              </TabsTrigger>
              <TabsTrigger value="verification" className="text-xs sm:text-sm">
                <Shield className="mr-1 h-4 w-4 hidden sm:inline" />
                Verifizierung
              </TabsTrigger>
              <TabsTrigger value="schema" className="text-xs sm:text-sm">
                <Building2 className="mr-1 h-4 w-4 hidden sm:inline" />
                Schema.org
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Basis-Einstellungen
                  </CardTitle>
                  <CardDescription>
                    Diese Werte werden als Fallback verwendet, wenn Seiten keine eigenen SEO-Einstellungen haben.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Site-Name</Label>
                    <Input
                      value={config.siteName}
                      onChange={(e) => updateConfig('siteName', e.target.value)}
                      placeholder="NICNOA&CO.online"
                    />
                    <p className="text-xs text-muted-foreground">
                      Der Hauptname Ihrer Website
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Titel-Suffix</Label>
                    <Input
                      value={config.titleSuffix || ''}
                      onChange={(e) => updateConfig('titleSuffix', e.target.value)}
                      placeholder=" | NICNOA&CO.online"
                    />
                    <p className="text-xs text-muted-foreground">
                      Wird an alle Seitentitel angehängt: &quot;Seite{config.titleSuffix || ' | NICNOA&CO.online'}&quot;
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Standard Meta-Beschreibung</Label>
                      <span className={`text-xs ${(config.defaultMetaDescription || '').length > 155 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        {(config.defaultMetaDescription || '').length}/160
                      </span>
                    </div>
                    <Textarea
                      value={config.defaultMetaDescription || ''}
                      onChange={(e) => updateConfig('defaultMetaDescription', e.target.value)}
                      placeholder="Die All-in-One SaaS-Lösung für moderne Salon-Coworking-Spaces..."
                      maxLength={160}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {/* Robots */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Indexierung</Label>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Suchmaschinen-Indexierung</p>
                        <p className="text-sm text-muted-foreground">
                          Erlaubt Google & Co., Ihre Seiten zu indexieren
                        </p>
                      </div>
                      <Switch
                        checked={config.robotsIndex}
                        onCheckedChange={(v) => updateConfig('robotsIndex', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Links folgen</p>
                        <p className="text-sm text-muted-foreground">
                          Erlaubt Suchmaschinen, Links auf Ihren Seiten zu folgen
                        </p>
                      </div>
                      <Switch
                        checked={config.robotsFollow}
                        onCheckedChange={(v) => updateConfig('robotsFollow', v)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Social Media
                  </CardTitle>
                  <CardDescription>
                    Einstellungen für das Teilen auf Social Media
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Standard OG-Bild URL</Label>
                    <Input
                      value={config.defaultOgImage || ''}
                      onChange={(e) => updateConfig('defaultOgImage', e.target.value)}
                      placeholder="https://www.nicnoa.online/og-image.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Wird angezeigt, wenn Seiten kein eigenes Bild haben. Empfohlen: 1200x630px
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Twitter Handle</Label>
                    <Input
                      value={config.twitterHandle || ''}
                      onChange={(e) => updateConfig('twitterHandle', e.target.value)}
                      placeholder="@nicnoa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Facebook App ID</Label>
                    <Input
                      value={config.facebookAppId || ''}
                      onChange={(e) => updateConfig('facebookAppId', e.target.value)}
                      placeholder="123456789"
                    />
                    <p className="text-xs text-muted-foreground">
                      Für Facebook Insights und erweiterte Social Features
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Verifizierung
                  </CardTitle>
                  <CardDescription>
                    Verifizierungscodes für Suchmaschinen-Tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Google Search Console</Label>
                    <Input
                      value={config.googleSiteVerification || ''}
                      onChange={(e) => updateConfig('googleSiteVerification', e.target.value)}
                      placeholder="google123abc..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Nur den Verifizierungscode, nicht das ganze Meta-Tag
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Bing Webmaster Tools</Label>
                    <Input
                      value={config.bingSiteVerification || ''}
                      onChange={(e) => updateConfig('bingSiteVerification', e.target.value)}
                      placeholder="bing123abc..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schema.org Tab */}
            <TabsContent value="schema" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Schema.org / Structured Data
                  </CardTitle>
                  <CardDescription>
                    Organisationsdaten für Rich Snippets in Suchergebnissen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Organisationsname</Label>
                    <Input
                      value={config.organizationName || ''}
                      onChange={(e) => updateConfig('organizationName', e.target.value)}
                      placeholder="NICNOA GmbH"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input
                      value={config.organizationLogo || ''}
                      onChange={(e) => updateConfig('organizationLogo', e.target.value)}
                      placeholder="https://www.nicnoa.online/logo.png"
                    />
                    <p className="text-xs text-muted-foreground">
                      Für Knowledge Panel in Google. Empfohlen: Quadratisch, mind. 112x112px
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Textarea
                      value={config.organizationAddress || ''}
                      onChange={(e) => updateConfig('organizationAddress', e.target.value)}
                      placeholder="Musterstraße 1, 80331 München, Deutschland"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefon</Label>
                      <Input
                        value={config.organizationPhone || ''}
                        onChange={(e) => updateConfig('organizationPhone', e.target.value)}
                        placeholder="+49 89 123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-Mail</Label>
                      <Input
                        value={config.organizationEmail || ''}
                        onChange={(e) => updateConfig('organizationEmail', e.target.value)}
                        placeholder="info@nicnoa.online"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Google Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4" />
                Google-Vorschau (Standard)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-white rounded-lg border shadow-sm">
                <div className="space-y-1 font-sans">
                  <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer leading-tight truncate">
                    {config.siteName}
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Globe className="h-2.5 w-2.5 text-gray-500" />
                    </div>
                    <p className="text-[#202124]">nicnoa.online</p>
                  </div>
                  <p className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
                    {config.defaultMetaDescription || 'Seitenbeschreibung...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO-Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {config.robotsIndex ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-sm">
                  {config.robotsIndex ? 'Indexierung aktiv' : 'Indexierung deaktiviert'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {config.defaultMetaDescription ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-sm">
                  {config.defaultMetaDescription ? 'Meta-Beschreibung gesetzt' : 'Meta-Beschreibung fehlt'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {config.googleSiteVerification ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {config.googleSiteVerification ? 'Google verifiziert' : 'Google nicht verifiziert'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {config.organizationName ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {config.organizationName ? 'Schema.org konfiguriert' : 'Schema.org fehlt'}
                </span>
              </div>
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
                    Diese Einstellungen werden als Fallback verwendet. Individuelle Seiten-SEO hat Vorrang.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



