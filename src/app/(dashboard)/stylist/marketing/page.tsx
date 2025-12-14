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
  Scissors,
} from 'lucide-react'
import { LogoUploader } from '@/components/branding/logo-uploader'

interface StylistBranding {
  brandingLogoUrl: string | null
  brandingColor: string | null
}

export default function StylistMarketingPage() {
  const [branding, setBranding] = useState<StylistBranding | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Editierbare Felder
  const [brandingColor, setBrandingColor] = useState('#ec4899') // Pink als Default
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
      
      toast.success('Branding gespeichert')
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
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Mein Branding
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestalte dein persönliches Erscheinungsbild
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-pink-500 hover:bg-pink-600">
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
                <ImageIcon className="h-5 w-5 text-pink-500" />
                Persönliches Logo
              </CardTitle>
              <CardDescription>
                Dein Logo für Visitenkarten, Werbematerialien und mehr
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoUploader
                type="stylist"
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
                <Palette className="h-5 w-5 text-pink-500" />
                Akzentfarbe
              </CardTitle>
              <CardDescription>
                Deine persönliche Markenfarbe
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
                  placeholder="#ec4899"
                />
                <div className="flex gap-2">
                  {['#ec4899', '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'].map((color) => (
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
                <Sparkles className="h-5 w-5 text-pink-500" />
                So nutzt du dein Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                    <Share2 className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Social Media</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nutze dein Logo für einheitliche Profile auf Instagram, TikTok & Co.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                    <Download className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Visitenkarten</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lade dein Logo herunter für professionelle Visitenkarten.
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
              {/* Visitenkarten-Preview */}
              <div 
                className="aspect-[1.75/1] rounded-xl p-6 flex flex-col justify-between shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${brandingColor} 0%, ${adjustColor(brandingColor, -30)} 100%)` 
                }}
              >
                <div>
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="h-10 w-auto object-contain"
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Scissors className="h-6 w-6 text-white" />
                      <span className="text-white font-bold text-lg">Dein Name</span>
                    </div>
                  )}
                </div>
                <div className="text-white/80 text-xs">
                  <p className="font-medium text-white">Hair Stylist</p>
                  <p>deine@email.de</p>
                </div>
              </div>

              {/* Social Media Preview */}
              <div className="border rounded-xl p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-3">Social Media Profilbild</p>
                <div className="flex justify-center">
                  <div 
                    className="h-20 w-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: brandingColor }}
                  >
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="h-12 w-12 object-contain"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    ) : (
                      <Scissors className="h-10 w-10 text-white" />
                    )}
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
                  Deine Markenfarbe
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

