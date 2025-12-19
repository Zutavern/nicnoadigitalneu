'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Check, Palette, Paintbrush } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DESIGN_STYLE_CONFIGS } from '@/lib/homepage-builder'
import type { HomepageDesignStyle } from '@/lib/homepage-builder'

interface StepDesignStyleProps {
  value: HomepageDesignStyle | null
  onChange: (value: HomepageDesignStyle) => void
  brandingColor: string
  onBrandingColorChange: (color: string) => void
}

const PRESET_COLORS = [
  { color: '#10b981', name: 'Smaragd' },
  { color: '#6366f1', name: 'Indigo' },
  { color: '#ec4899', name: 'Pink' },
  { color: '#f97316', name: 'Orange' },
  { color: '#8b5cf6', name: 'Violett' },
  { color: '#14b8a6', name: 'Türkis' },
  { color: '#ef4444', name: 'Rot' },
  { color: '#0ea5e9', name: 'Himmelblau' },
]

export function StepDesignStyle({ value, onChange, brandingColor, onBrandingColorChange }: StepDesignStyleProps) {
  const styles = Object.values(DESIGN_STYLE_CONFIGS)

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Paintbrush className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Welcher Design-Stil passt zu dir?</h2>
        <p className="text-muted-foreground mt-2">
          Wähle einen Stil, der deine Persönlichkeit widerspiegelt.
        </p>
      </div>

      {/* Design-Styles */}
      <div className="grid gap-4 md:grid-cols-2">
        {styles.map((style) => {
          const isSelected = value === style.value
          
          return (
            <Card
              key={style.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md overflow-hidden",
                isSelected && "ring-2 ring-primary shadow-md"
              )}
              onClick={() => onChange(style.value)}
            >
              {/* Style Preview */}
              <div 
                className="h-24 relative"
                style={{ 
                  background: style.value === 'MINIMALIST' 
                    ? '#f8f9fa' 
                    : style.value === 'CREATIVE'
                    ? `linear-gradient(135deg, ${brandingColor}30 0%, ${brandingColor}60 100%)`
                    : style.value === 'CLASSIC'
                    ? `linear-gradient(to bottom, ${brandingColor}10, ${brandingColor}20)`
                    : `linear-gradient(135deg, ${brandingColor}10 0%, ${brandingColor}30 100%)`
                }}
              >
                {/* Mini-Elemente zur Darstellung des Styles */}
                <div className="absolute inset-4 flex items-center justify-center">
                  <div 
                    className="bg-white shadow-lg p-3 flex gap-2"
                    style={{ 
                      borderRadius: style.cssVariables.borderRadius,
                      boxShadow: style.cssVariables.shadow
                    }}
                  >
                    <div 
                      className="w-8 h-8"
                      style={{ 
                        backgroundColor: brandingColor,
                        borderRadius: style.value === 'MINIMALIST' ? '0' : '8px'
                      }}
                    />
                    <div className="space-y-1">
                      <div className="w-16 h-2 bg-gray-300 rounded" />
                      <div className="w-12 h-2 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{style.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {style.description}
                </p>
                <div className="flex gap-2 mt-3 text-xs text-muted-foreground">
                  <span className="bg-muted px-2 py-0.5 rounded">
                    {style.cssVariables.fontHeading}
                  </span>
                  <span className="bg-muted px-2 py-0.5 rounded">
                    {style.cssVariables.borderRadius === '0px' ? 'Keine Rundung' : 'Abgerundet'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Farbauswahl */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Primärfarbe</Label>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.color}
              onClick={() => onBrandingColorChange(preset.color)}
              className={cn(
                "w-10 h-10 rounded-full transition-all hover:scale-110",
                brandingColor === preset.color && "ring-2 ring-offset-2 ring-primary"
              )}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            />
          ))}
          
          <div className="flex items-center gap-2 ml-2">
            <Label htmlFor="customColor" className="text-sm text-muted-foreground">
              Eigene Farbe:
            </Label>
            <Input
              id="customColor"
              type="color"
              value={brandingColor}
              onChange={(e) => onBrandingColorChange(e.target.value)}
              className="w-10 h-10 p-1 cursor-pointer"
            />
            <Input
              value={brandingColor}
              onChange={(e) => onBrandingColorChange(e.target.value)}
              placeholder="#10b981"
              className="w-24 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}



