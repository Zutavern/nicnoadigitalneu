'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Globe, 
  Search, 
  FileText, 
  Settings, 
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface SeoSettings {
  siteTitle: string
  siteDescription: string
  siteKeywords: string
  ogImage: string
  twitterHandle: string
  googleSiteVerification: string
  robotsTxt: string
}

export default function AdminSeoPage() {
  const [settings, setSettings] = useState<SeoSettings>({
    siteTitle: 'NICNOA - Die Plattform für Stylisten',
    siteDescription: 'NICNOA verbindet Stylisten mit Salonbesitzern. Finde den perfekten Stuhl oder das ideale Team.',
    siteKeywords: 'Friseur, Stylist, Salon, Stuhlmiete, Beauty, Hair',
    ogImage: '',
    twitterHandle: '@nicnoa',
    googleSiteVerification: '',
    robotsTxt: `User-agent: *
Allow: /

Sitemap: https://www.nicnoa.online/sitemap.xml`
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/seo')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setSettings(prev => ({ ...prev, ...data }))
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der SEO-Einstellungen:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (res.ok) {
        toast.success('SEO-Einstellungen gespeichert')
      } else {
        throw new Error('Fehler beim Speichern')
      }
    } catch (error) {
      toast.error('Fehler beim Speichern der SEO-Einstellungen')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO-Einstellungen</h1>
          <p className="text-muted-foreground mt-1">
            Optimiere die Suchmaschinenoptimierung deiner Plattform
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Speichern
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Allgemeine Meta-Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Allgemeine Meta-Tags
            </CardTitle>
            <CardDescription>
              Diese Informationen erscheinen in Suchergebnissen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteTitle">Website-Titel</Label>
              <Input
                id="siteTitle"
                value={settings.siteTitle}
                onChange={(e) => setSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
                placeholder="NICNOA - Die Plattform für Stylisten"
              />
              <p className="text-xs text-muted-foreground">
                {settings.siteTitle.length}/60 Zeichen empfohlen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Meta-Beschreibung</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                placeholder="Kurze Beschreibung der Website..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {settings.siteDescription.length}/160 Zeichen empfohlen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteKeywords">Keywords</Label>
              <Input
                id="siteKeywords"
                value={settings.siteKeywords}
                onChange={(e) => setSettings(prev => ({ ...prev, siteKeywords: e.target.value }))}
                placeholder="Friseur, Stylist, Salon..."
              />
              <p className="text-xs text-muted-foreground">
                Kommagetrennte Keywords
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Social Media & Open Graph
            </CardTitle>
            <CardDescription>
              Wie deine Seite in Social Media geteilt wird
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ogImage">Open Graph Bild (URL)</Label>
              <Input
                id="ogImage"
                value={settings.ogImage}
                onChange={(e) => setSettings(prev => ({ ...prev, ogImage: e.target.value }))}
                placeholder="https://www.nicnoa.online/og-image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Empfohlen: 1200x630 Pixel
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterHandle">Twitter/X Handle</Label>
              <Input
                id="twitterHandle"
                value={settings.twitterHandle}
                onChange={(e) => setSettings(prev => ({ ...prev, twitterHandle: e.target.value }))}
                placeholder="@nicnoa"
              />
            </div>
          </CardContent>
        </Card>

        {/* Verifizierung */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Suchmaschinen-Verifizierung
            </CardTitle>
            <CardDescription>
              Verifiziere deine Website bei Suchmaschinen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleVerification">Google Search Console</Label>
              <Input
                id="googleVerification"
                value={settings.googleSiteVerification}
                onChange={(e) => setSettings(prev => ({ ...prev, googleSiteVerification: e.target.value }))}
                placeholder="Verifizierungscode"
              />
              <p className="text-xs text-muted-foreground">
                Den Code findest du in der Google Search Console
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <h4 className="font-medium">Status</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Sitemap vorhanden
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {settings.googleSiteVerification ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                  Google Verifizierung
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* robots.txt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              robots.txt
            </CardTitle>
            <CardDescription>
              Steuere, wie Suchmaschinen deine Seite crawlen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={settings.robotsTxt}
                onChange={(e) => setSettings(prev => ({ ...prev, robotsTxt: e.target.value }))}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.nicnoa.online/robots.txt" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                robots.txt ansehen
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Vorschau */}
      <Card>
        <CardHeader>
          <CardTitle>Suchergebnis-Vorschau</CardTitle>
          <CardDescription>
            So könnte deine Website in Google erscheinen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border max-w-2xl">
            <div className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">
              {settings.siteTitle || 'Website-Titel'}
            </div>
            <div className="text-green-700 dark:text-green-400 text-sm">
              https://www.nicnoa.online
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {settings.siteDescription || 'Meta-Beschreibung...'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
