'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  Loader2,
  Palette,
  Sparkles,
  ImageIcon,
  Share2,
  Download,
  Eye,
  Building2,
  MapPin,
  Phone,
  Globe,
} from 'lucide-react'
import { LogoUploader } from '@/components/branding/logo-uploader'

interface SalonBranding {
  brandingLogoUrl: string | null
  brandingColor: string | null
}

export default function SalonMarketingPage() {
  const [branding, setBranding] = useState<SalonBranding | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Editierbare Felder
  const [brandingColor, setBrandingColor] = useState('#3b82f6') // Blau als Default
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Branding laden
  const loadBranding = useCallback(async () => {
    try {
      const res = await fetch('/api/user/branding')
      
      // Nicht authentifiziert oder ungültige Rolle - nicht als Fehler behandeln
      if (res.status === 401 || res.status === 403) {
        setIsLoading(false)
        return
      }
      
      if (!res.ok) {
        console.warn('Branding konnte nicht geladen werden:', res.status)
        setIsLoading(false)
        return
      }
      
      const data = await res.json()
      
      setBranding(data)
      if (data.brandingColor) setBrandingColor(data.brandingColor)
      if (data.brandingLogoUrl) setLogoUrl(data.brandingLogoUrl)
    } catch (error) {
      console.error('Error loading branding:', error)
      // Fehler ignorieren, Standard-Werte werden verwendet
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBranding()
  }, [loadBranding])

  // Speichern
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandingColor,
          brandingLogoUrl: logoUrl,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')
      
      toast.success('Salon-Branding gespeichert')
      loadBranding()
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Salon Branding
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestalte das Erscheinungsbild deines Salons
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-500 hover:bg-blue-600">
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Speichern
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Seite - Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                Salon-Logo
              </CardTitle>
              <CardDescription>
                Dein Salon-Logo für alle Plattformen und Werbematerialien
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoUploader
                type="salon"
                currentLogoUrl={logoUrl}
                onUploadComplete={(url) => setLogoUrl(url)}
                onDeleteComplete={() => setLogoUrl(null)}
                label=""
                description="PNG, JPG, SVG oder WebP (max. 2MB)"
              />
            </CardContent>
          </Card>

          {/* Farbe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-500" />
                Akzentfarbe
              </CardTitle>
              <CardDescription>
                Die Hauptfarbe für deinen Salon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={brandingColor}
                  onChange={(e) => setBrandingColor(e.target.value)}
                  className="h-12 w-16 rounded-lg cursor-pointer border-2"
                />
                <Input
                  value={brandingColor}
                  onChange={(e) => setBrandingColor(e.target.value)}
                  className="w-28 font-mono text-sm"
                  placeholder="#3b82f6"
                />
                <div className="flex gap-2">
                  {['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBrandingColor(color)}
                      className="h-10 w-10 rounded-lg border-2 transition-all hover:scale-110"
                      style={{ 
                        backgroundColor: color,
                        borderColor: brandingColor === color ? '#18181b' : 'transparent'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verwendungstipps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                So nutzt du dein Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Online-Präsenz</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Einheitliches Branding auf deinem NICNOA-Profil und anderen Plattformen.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Share2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Social Media</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Professioneller Auftritt auf Instagram, Facebook & Google.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Download className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Werbematerialien</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nutze dein Logo für Flyer, Schaufensterbeschriftung und mehr.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Stuhlmieter-Akquise</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Attraktives Salon-Profil für potenzielle Stuhlmieter.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rechte Seite - Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4" />
                Vorschau
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Salon-Profil-Karte Preview */}
              <div className="rounded-xl overflow-hidden shadow-lg border">
                <div 
                  className="h-24 flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${brandingColor} 0%, ${adjustColor(brandingColor, -30)} 100%)` 
                  }}
                >
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Salon Logo" 
                      className="h-14 w-auto object-contain"
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-white" />
                  )}
                </div>
                <div className="p-4 bg-card">
                  <h3 className="font-bold text-lg">Dein Salon</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Musterstraße 1, 12345 Stadt</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge 
                      variant="secondary" 
                      style={{ backgroundColor: `${brandingColor}20`, color: brandingColor }}
                    >
                      5 Stühle
                    </Badge>
                    <Badge variant="outline">Verifiziert</Badge>
                  </div>
                </div>
              </div>

              {/* Google Maps Style Preview */}
              <div className="border rounded-xl p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-3">Google Business Profil</p>
                <div className="flex items-start gap-3">
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: brandingColor }}
                  >
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="h-8 w-8 object-contain"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">Dein Salon</h4>
                    <p className="text-xs text-muted-foreground">★★★★★ 4.9 (128 Bewertungen)</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" />
                      <span>+49 123 456789</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Farb-Badge */}
              <div className="flex items-center justify-center gap-2">
                <Badge 
                  variant="outline" 
                  className="border-2"
                  style={{ borderColor: brandingColor, color: brandingColor }}
                >
                  Salon-Farbe
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Hilfsfunktion: Farbe abdunkeln/aufhellen
function adjustColor(hex: string, percent: number): string {
  hex = hex.replace('#', '')
  
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)

  r = Math.min(255, Math.max(0, r + (r * percent) / 100))
  g = Math.min(255, Math.max(0, g + (g * percent) / 100))
  b = Math.min(255, Math.max(0, b + (b * percent) / 100))

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

