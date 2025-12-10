'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Palette,
  RefreshCw,
  Save,
  Check,
  Loader2,
  Sparkles,
  Paintbrush,
  Wand2,
  Eye,
  Type,
  Square,
  Layers,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { 
  DESIGN_PRESETS, 
  getPreset, 
  hslStringToHex, 
  hexToHslString,
  type DesignTokens 
} from '@/lib/design-presets'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}

function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const hexValue = hslStringToHex(value)
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <code className="text-xs text-muted-foreground font-mono">{hexValue}</code>
      </div>
      <div className="flex items-center gap-2">
        <div 
          className="h-10 w-10 rounded-lg border shadow-sm"
          style={{ backgroundColor: `hsl(${value})` }}
        />
        <input
          type="color"
          value={hexValue}
          onChange={(e) => onChange(hexToHslString(e.target.value))}
          className="h-10 w-16 rounded cursor-pointer"
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

interface PresetCardProps {
  preset: typeof DESIGN_PRESETS[string]
  isSelected: boolean
  onSelect: () => void
}

function PresetCard({ preset, isSelected, onSelect }: PresetCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="h-5 w-5 text-primary" />
        </div>
      )}
      
      {/* Farbvorschau */}
      <div className="flex gap-1 mb-3">
        <div 
          className="h-8 w-8 rounded-lg"
          style={{ backgroundColor: `hsl(${preset.tokens.brand.primary})` }}
        />
        <div 
          className="h-8 w-8 rounded-lg"
          style={{ backgroundColor: `hsl(${preset.tokens.brand.secondary})` }}
        />
        <div 
          className="h-8 w-8 rounded-lg"
          style={{ backgroundColor: `hsl(${preset.tokens.brand.accent})` }}
        />
      </div>
      
      {/* Gradient-Vorschau */}
      <div 
        className="h-2 w-full rounded-full mb-3"
        style={{
          background: `linear-gradient(to right, hsl(${preset.tokens.gradient.from}), hsl(${preset.tokens.gradient.via}), hsl(${preset.tokens.gradient.to}))`
        }}
      />
      
      <h4 className="font-semibold text-sm">{preset.name}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
    </motion.button>
  )
}

function LivePreview({ tokens }: { tokens: DesignTokens }) {
  return (
    <div 
      className="rounded-xl overflow-hidden border shadow-lg"
      style={{ backgroundColor: `hsl(${tokens.surface.background})` }}
    >
      {/* Header Preview */}
      <div 
        className="h-16 px-4 flex items-center justify-between"
        style={{ 
          background: `linear-gradient(135deg, hsl(${tokens.gradient.from}) 0%, hsl(${tokens.gradient.via}) 50%, hsl(${tokens.gradient.to}) 100%)` 
        }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20" />
          <span className="text-white font-semibold text-sm">NICNOA</span>
        </div>
        <div className="flex gap-2">
          <div className="h-3 w-12 rounded bg-white/30" />
          <div className="h-3 w-12 rounded bg-white/30" />
        </div>
      </div>
      
      {/* Content Preview */}
      <div className="p-4 space-y-4">
        {/* Hero-ähnlicher Bereich */}
        <div className="text-center py-6">
          <h3 
            className="text-xl font-bold mb-2"
            style={{ color: `hsl(${tokens.brand.primary})` }}
          >
            Willkommen
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: `hsl(${tokens.text.onSecondary})` }}
          >
            Beispieltext für die Vorschau
          </p>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: `hsl(${tokens.brand.accent})`,
              color: `hsl(${tokens.text.onAccent})`
            }}
          >
            Call to Action
          </button>
        </div>
        
        {/* Card Preview */}
        <div 
          className="p-4 rounded-lg"
          style={{ backgroundColor: `hsl(${tokens.surface.card})` }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="h-10 w-10 rounded-full"
              style={{ backgroundColor: `hsl(${tokens.brand.primary})` }}
            />
            <div>
              <div className="h-3 w-24 rounded" style={{ backgroundColor: `hsl(${tokens.brand.primary})` }} />
              <div className="h-2 w-16 rounded mt-1" style={{ backgroundColor: `hsl(${tokens.surface.muted})` }} />
            </div>
          </div>
          <div className="h-2 w-full rounded mb-1" style={{ backgroundColor: `hsl(${tokens.surface.muted})` }} />
          <div className="h-2 w-3/4 rounded" style={{ backgroundColor: `hsl(${tokens.surface.muted})` }} />
        </div>
        
        {/* Glow/Animation Preview */}
        <div className="flex justify-center gap-4 py-4">
          <div 
            className="h-4 w-4 rounded-full animate-pulse"
            style={{ 
              backgroundColor: `hsl(${tokens.glow.primary})`,
              boxShadow: `0 0 20px hsl(${tokens.glow.primary})`
            }}
          />
          <div 
            className="h-4 w-4 rounded-full animate-pulse"
            style={{ 
              backgroundColor: `hsl(${tokens.glow.secondary})`,
              boxShadow: `0 0 20px hsl(${tokens.glow.secondary})`,
              animationDelay: '0.5s'
            }}
          />
          <div 
            className="h-4 w-4 rounded-full animate-pulse"
            style={{ 
              backgroundColor: `hsl(${tokens.animation.particle})`,
              boxShadow: `0 0 20px hsl(${tokens.animation.particle})`,
              animationDelay: '1s'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export function DesignSystemSection() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPreset, setCurrentPreset] = useState<string>('nicnoa-classic')
  const [hasCustomTokens, setHasCustomTokens] = useState(false)
  const [tokens, setTokens] = useState<DesignTokens>(getPreset('nicnoa-classic').tokens)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchDesignTokens()
  }, [])

  const fetchDesignTokens = async () => {
    try {
      const res = await fetch('/api/admin/design-tokens')
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      setCurrentPreset(data.currentPreset)
      setHasCustomTokens(data.hasCustomTokens)
      setTokens(data.activeTokens)
    } catch (error) {
      console.error('Error fetching design tokens:', error)
      toast.error('Fehler beim Laden des Design-Systems')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePresetSelect = (presetId: string) => {
    const preset = DESIGN_PRESETS[presetId]
    if (preset) {
      setCurrentPreset(presetId)
      setTokens(preset.tokens)
      setHasCustomTokens(false)
      setHasChanges(true)
    }
  }

  const handleColorChange = (path: string, value: string) => {
    const [group, key] = path.split('.')
    setTokens(prev => ({
      ...prev,
      [group]: {
        ...prev[group as keyof DesignTokens],
        [key]: value
      }
    } as DesignTokens))
    setHasCustomTokens(true)
    setHasChanges(true)
  }

  // Generische Funktion für alle Token-Änderungen (typography, radius, shadows, etc.)
  const handleTokenChange = (path: string, value: string) => {
    const [group, key] = path.split('.')
    setTokens(prev => {
      // Stelle sicher, dass die Gruppe existiert
      const existingGroup = prev[group as keyof DesignTokens] || {}
      return {
        ...prev,
        [group]: {
          ...existingGroup,
          [key]: value
        }
      } as DesignTokens
    })
    setHasCustomTokens(true)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/design-tokens', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: hasCustomTokens ? 'custom' : currentPreset,
          tokens: hasCustomTokens ? tokens : undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast.success('Design-System gespeichert! Seite wird neu geladen...')
      
      // Alle Design-Token Caches löschen
      localStorage.removeItem('design-tokens')
      localStorage.removeItem('design-tokens-timestamp')
      
      // Hartes Reload mit Cache-Bust
      setTimeout(() => {
        // Force reload ohne Cache
        window.location.href = window.location.href.split('?')[0] + '?_refresh=' + Date.now()
      }, 1000)
    } catch (error) {
      console.error('Error saving design tokens:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
      setHasChanges(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Design-System auf NICNOA Classic zurücksetzen?')) return
    
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/design-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })

      if (!res.ok) throw new Error('Failed to reset')

      toast.success('Design-System zurückgesetzt!')
      
      localStorage.removeItem('design-tokens')
      localStorage.removeItem('design-tokens-timestamp')
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Error resetting design tokens:', error)
      toast.error('Fehler beim Zurücksetzen')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header mit Save-Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-amber-500" />
            <span className="font-medium">Ungespeicherte Änderungen</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchDesignTokens}>
              Verwerfen
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Speichern
            </Button>
          </div>
        </motion.div>
      )}

      {/* Preset-Auswahl */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design-System
              </CardTitle>
              <CardDescription>
                Wähle ein vorkonfiguriertes Farbschema oder passe Farben individuell an
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasCustomTokens && (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                  Benutzerdefiniert
                </Badge>
              )}
              <Badge variant="secondary">
                {DESIGN_PRESETS[currentPreset]?.name || 'Custom'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(DESIGN_PRESETS).map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isSelected={currentPreset === preset.id && !hasCustomTokens}
                onSelect={() => handlePresetSelect(preset.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zwei-Spalten-Layout: Editor + Preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor mit Tabs */}
        <div className="space-y-6">
          <Tabs defaultValue="colors" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Farben</span>
              </TabsTrigger>
              <TabsTrigger value="typography" className="flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Schrift</span>
              </TabsTrigger>
              <TabsTrigger value="radius" className="flex items-center gap-1.5">
                <Square className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ecken</span>
              </TabsTrigger>
              <TabsTrigger value="shadows" className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Schatten</span>
              </TabsTrigger>
            </TabsList>

            {/* Farben Tab */}
            <TabsContent value="colors" className="space-y-4">
              {/* Brand Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Paintbrush className="h-4 w-4" />
                    Markenfarben
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <ColorPicker
                    label="Primär"
                    value={tokens.brand.primary}
                    onChange={(v) => handleColorChange('brand.primary', v)}
                    description="Hauptfarbe"
                  />
                  <ColorPicker
                    label="Sekundär"
                    value={tokens.brand.secondary}
                    onChange={(v) => handleColorChange('brand.secondary', v)}
                    description="Hintergrund"
                  />
                  <ColorPicker
                    label="Akzent"
                    value={tokens.brand.accent}
                    onChange={(v) => handleColorChange('brand.accent', v)}
                    description="CTAs"
                  />
                </CardContent>
              </Card>

              {/* Gradient Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Verlaufsfarben
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Gradient Preview */}
                  <div 
                    className="h-6 w-full rounded-lg mb-4"
                    style={{
                      background: `linear-gradient(to right, hsl(${tokens.gradient.from}), hsl(${tokens.gradient.via}), hsl(${tokens.gradient.to}))`
                    }}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <ColorPicker
                      label="Start"
                      value={tokens.gradient.from}
                      onChange={(v) => handleColorChange('gradient.from', v)}
                    />
                    <ColorPicker
                      label="Mitte"
                      value={tokens.gradient.via}
                      onChange={(v) => handleColorChange('gradient.via', v)}
                    />
                    <ColorPicker
                      label="Ende"
                      value={tokens.gradient.to}
                      onChange={(v) => handleColorChange('gradient.to', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Glow Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Leucht- & Animationsfarben
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label="Primärer Glow"
                      value={tokens.glow.primary}
                      onChange={(v) => handleColorChange('glow.primary', v)}
                    />
                    <ColorPicker
                      label="Sekundärer Glow"
                      value={tokens.glow.secondary}
                      onChange={(v) => handleColorChange('glow.secondary', v)}
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4">
                    <ColorPicker
                      label="Partikel"
                      value={tokens.animation.particle}
                      onChange={(v) => handleColorChange('animation.particle', v)}
                    />
                    <ColorPicker
                      label="Orbit"
                      value={tokens.animation.orbit}
                      onChange={(v) => handleColorChange('animation.orbit', v)}
                    />
                    <ColorPicker
                      label="Puls"
                      value={tokens.animation.pulse}
                      onChange={(v) => handleColorChange('animation.pulse', v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Typografie
                  </CardTitle>
                  <CardDescription>
                    Schriftarten und Texteinstellungen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Schriftart (Text)</Label>
                      <Select 
                        value={tokens.typography?.fontFamily || 'Inter, system-ui, sans-serif'}
                        onValueChange={(v) => handleTokenChange('typography.fontFamily', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                          <SelectItem value="Geist, Inter, system-ui, sans-serif">Geist</SelectItem>
                          <SelectItem value="system-ui, -apple-system, sans-serif">System</SelectItem>
                          <SelectItem value="Georgia, serif">Georgia (Serif)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontFamilyHeading">Schriftart (Überschriften)</Label>
                      <Select 
                        value={tokens.typography?.fontFamilyHeading || 'Inter, system-ui, sans-serif'}
                        onValueChange={(v) => handleTokenChange('typography.fontFamilyHeading', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                          <SelectItem value="Geist, Inter, system-ui, sans-serif">Geist</SelectItem>
                          <SelectItem value="system-ui, -apple-system, sans-serif">System</SelectItem>
                          <SelectItem value="Georgia, serif">Georgia (Serif)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseSize">Basisgröße</Label>
                      <Select 
                        value={tokens.typography?.baseSize || '16px'}
                        onValueChange={(v) => handleTokenChange('typography.baseSize', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14px">14px (Klein)</SelectItem>
                          <SelectItem value="15px">15px (Mittel)</SelectItem>
                          <SelectItem value="16px">16px (Standard)</SelectItem>
                          <SelectItem value="17px">17px (Groß)</SelectItem>
                          <SelectItem value="18px">18px (Extra Groß)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lineHeight">Zeilenhöhe</Label>
                      <Select 
                        value={tokens.typography?.lineHeight || '1.6'}
                        onValueChange={(v) => handleTokenChange('typography.lineHeight', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.4">1.4 (Kompakt)</SelectItem>
                          <SelectItem value="1.5">1.5 (Normal)</SelectItem>
                          <SelectItem value="1.6">1.6 (Entspannt)</SelectItem>
                          <SelectItem value="1.7">1.7 (Luftig)</SelectItem>
                          <SelectItem value="1.8">1.8 (Sehr luftig)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="letterSpacing">Zeichenabstand</Label>
                      <Select 
                        value={tokens.typography?.letterSpacing || '-0.01em'}
                        onValueChange={(v) => handleTokenChange('typography.letterSpacing', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-0.02em">-0.02em (Eng)</SelectItem>
                          <SelectItem value="-0.01em">-0.01em (Leicht eng)</SelectItem>
                          <SelectItem value="0">0 (Normal)</SelectItem>
                          <SelectItem value="0.01em">0.01em (Leicht weit)</SelectItem>
                          <SelectItem value="0.02em">0.02em (Weit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Typography Preview */}
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground mb-2">Vorschau:</p>
                    <h3 
                      className="text-xl font-bold mb-2"
                      style={{ 
                        fontFamily: tokens.typography?.fontFamilyHeading || 'Inter, system-ui, sans-serif',
                        letterSpacing: tokens.typography?.letterSpacing || '-0.01em'
                      }}
                    >
                      Überschrift
                    </h3>
                    <p 
                      style={{ 
                        fontFamily: tokens.typography?.fontFamily || 'Inter, system-ui, sans-serif',
                        fontSize: tokens.typography?.baseSize || '16px',
                        lineHeight: tokens.typography?.lineHeight || '1.6',
                        letterSpacing: tokens.typography?.letterSpacing || '-0.01em'
                      }}
                    >
                      Dies ist ein Beispieltext zur Vorschau der Typografie-Einstellungen. 
                      Die Schrift, Größe und Abstände werden hier live angezeigt.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Radius Tab */}
            <TabsContent value="radius" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Eckenradius
                  </CardTitle>
                  <CardDescription>
                    Abrundung von Elementen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { key: 'sm', label: 'Klein (SM)', defaultValue: '0.375rem' },
                      { key: 'md', label: 'Mittel (MD)', defaultValue: '0.5rem' },
                      { key: 'lg', label: 'Groß (LG)', defaultValue: '0.75rem' },
                      { key: 'xl', label: 'Extra Groß (XL)', defaultValue: '1rem' },
                    ].map(({ key, label, defaultValue }) => (
                      <div key={key} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>{label}</Label>
                          <code className="text-xs text-muted-foreground">
                            {tokens.radius?.[key as keyof typeof tokens.radius] || defaultValue}
                          </code>
                        </div>
                        <Select 
                          value={tokens.radius?.[key as keyof typeof tokens.radius] || defaultValue}
                          onValueChange={(v) => handleTokenChange(`radius.${key}`, v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 (Eckig)</SelectItem>
                            <SelectItem value="0.125rem">0.125rem</SelectItem>
                            <SelectItem value="0.25rem">0.25rem</SelectItem>
                            <SelectItem value="0.375rem">0.375rem</SelectItem>
                            <SelectItem value="0.5rem">0.5rem</SelectItem>
                            <SelectItem value="0.75rem">0.75rem</SelectItem>
                            <SelectItem value="1rem">1rem</SelectItem>
                            <SelectItem value="1.5rem">1.5rem</SelectItem>
                            <SelectItem value="2rem">2rem</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Preview */}
                        <div 
                          className="h-12 bg-primary/20 border border-primary/40"
                          style={{ 
                            borderRadius: tokens.radius?.[key as keyof typeof tokens.radius] || defaultValue 
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shadows Tab */}
            <TabsContent value="shadows" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Schatten
                  </CardTitle>
                  <CardDescription>
                    Box-Schatten für Tiefeneffekte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { 
                      key: 'sm', 
                      label: 'Klein (SM)', 
                      description: 'Subtiler Schatten für kleine Elemente',
                      defaultValue: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    },
                    { 
                      key: 'md', 
                      label: 'Mittel (MD)', 
                      description: 'Standard-Schatten für Karten',
                      defaultValue: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    },
                    { 
                      key: 'lg', 
                      label: 'Groß (LG)', 
                      description: 'Auffälliger Schatten für Modals',
                      defaultValue: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                    },
                    { 
                      key: 'glow', 
                      label: 'Glow', 
                      description: 'Leuchteffekt für Akzente',
                      defaultValue: '0 0 20px hsl(151 40% 50% / 0.3)'
                    },
                  ].map(({ key, label, description, defaultValue }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>{label}</Label>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </div>
                      {/* Preview */}
                      <div 
                        className="h-16 bg-card rounded-lg flex items-center justify-center text-sm text-muted-foreground"
                        style={{ 
                          boxShadow: tokens.shadows?.[key as keyof typeof tokens.shadows] || defaultValue 
                        }}
                      >
                        Schatten-Vorschau
                      </div>
                      <Input
                        value={tokens.shadows?.[key as keyof typeof tokens.shadows] || defaultValue}
                        onChange={(e) => handleTokenChange(`shadows.${key}`, e.target.value)}
                        placeholder={defaultValue}
                        className="font-mono text-xs"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Reset Button */}
          <Button variant="outline" onClick={handleReset} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Auf NICNOA Classic zurücksetzen
          </Button>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Live-Vorschau
            </h3>
            <Badge variant="outline">Echtzeit</Badge>
          </div>
          <LivePreview tokens={tokens} />
          
          {/* Surface Colors (kleinere Anzeige) */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Oberflächen</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-2">
              {[
                { key: 'background', label: 'Hintergrund' },
                { key: 'card', label: 'Karte' },
                { key: 'muted', label: 'Gedämpft' },
                { key: 'warm', label: 'Warm' },
              ].map(({ key, label }) => (
                <div key={key} className="text-center">
                  <div 
                    className="h-10 w-full rounded border mb-1"
                    style={{ backgroundColor: `hsl(${tokens.surface[key as keyof typeof tokens.surface]})` }}
                  />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

