'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  Sparkles, 
  Zap, 
  Star,
  Check,
  Settings2,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Vereinfachte Modell-Definition
interface AIModel {
  id: string
  name: string
  description: string
  price: string
  speed: 'fast' | 'medium' | 'slow'
  quality: 'standard' | 'high' | 'premium'
  provider: 'replicate' | 'openrouter'
  recommended?: boolean
}

// Kuratierte, vereinfachte Modell-Liste
const AI_MODELS: AIModel[] = [
  // Empfohlen & Schnell
  {
    id: 'flux-schnell',
    name: 'Flux Schnell',
    description: 'Schnellstes Modell - ideal für Social Media',
    price: '~0,003€',
    speed: 'fast',
    quality: 'standard',
    provider: 'replicate',
    recommended: true,
  },
  // Schnell
  {
    id: 'imagen-4-fast',
    name: 'Imagen 4 Fast',
    description: 'Google AI - hohe Qualität, schnell',
    price: '~0,02€',
    speed: 'fast',
    quality: 'high',
    provider: 'replicate',
  },
  {
    id: 'ideogram-v3-turbo',
    name: 'Ideogram V3',
    description: 'Beste Text-Rendering in Bildern',
    price: '~0,03€',
    speed: 'fast',
    quality: 'high',
    provider: 'replicate',
  },
  // Premium
  {
    id: 'flux-pro-11',
    name: 'Flux Pro 1.1',
    description: 'Premium Qualität für wichtige Posts',
    price: '~0,04€',
    speed: 'medium',
    quality: 'premium',
    provider: 'replicate',
  },
  {
    id: 'imagen-4',
    name: 'Imagen 4',
    description: 'Google Flaggschiff - beste Qualität',
    price: '~0,04€',
    speed: 'medium',
    quality: 'premium',
    provider: 'replicate',
  },
  {
    id: 'seedream-4',
    name: 'Seedream 4',
    description: 'ByteDance - bis zu 4K Auflösung',
    price: '~0,035€',
    speed: 'medium',
    quality: 'premium',
    provider: 'replicate',
  },
]

// Default Modell
const DEFAULT_MODEL = 'flux-schnell'

interface AIModelSelectorProps {
  value: string
  onChange: (modelId: string) => void
  className?: string
}

export function AIModelSelector({ value, onChange, className }: AIModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(value || DEFAULT_MODEL)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Lade gespeichertes Modell aus der Datenbank beim Mount
  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch('/api/user/ai-preferences')
      if (res.ok) {
        const data = await res.json()
        if (data.preferredAiImageModel && AI_MODELS.find(m => m.id === data.preferredAiImageModel)) {
          setSelectedModel(data.preferredAiImageModel)
          onChange(data.preferredAiImageModel)
        }
      }
    } catch (error) {
      console.error('Error fetching AI preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onChange])
  
  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])
  
  // Aktuelles Modell finden
  const currentModel = AI_MODELS.find(m => m.id === value) || AI_MODELS[0]
  
  // Modell auswählen (nur lokaler State im Dialog)
  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId)
  }
  
  // Bestätigen und in Datenbank speichern
  const handleConfirm = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/ai-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredAiImageModel: selectedModel })
      })
      
      if (res.ok) {
        onChange(selectedModel)
        setIsOpen(false)
        toast.success('KI-Modell gespeichert')
      } else {
        toast.error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving AI preferences:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Speed Badge Farbe
  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'slow': return 'bg-red-500/10 text-red-600 border-red-500/20'
      default: return ''
    }
  }
  
  // Quality Badge Farbe
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'standard': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'high': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      case 'premium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      default: return ''
    }
  }
  
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">KI-Modell</Label>
      
      {/* Kompakte Anzeige mit Ändern-Button */}
      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium truncate">{currentModel.name}</span>
            {currentModel.recommended && (
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                Empfohlen
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {currentModel.description}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsOpen(true)}
          className="shrink-0"
        >
          <Settings2 className="h-3.5 w-3.5 mr-1.5" />
          Ändern
        </Button>
      </div>
      
      {/* Modell-Auswahl Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              KI-Modell wählen
            </DialogTitle>
            <DialogDescription>
              Wähle das Modell für deine Bildgenerierung. Deine Auswahl wird gespeichert.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={selectedModel} onValueChange={handleSelect} className="space-y-3">
              {/* Schnelle Modelle */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  Schnell & Günstig
                </div>
                {AI_MODELS.filter(m => m.speed === 'fast').map(model => (
                  <ModelOption 
                    key={model.id} 
                    model={model} 
                    isSelected={selectedModel === model.id}
                    getSpeedColor={getSpeedColor}
                    getQualityColor={getQualityColor}
                  />
                ))}
              </div>
              
              {/* Premium Modelle */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Star className="h-4 w-4" />
                  Premium Qualität
                </div>
                {AI_MODELS.filter(m => m.quality === 'premium').map(model => (
                  <ModelOption 
                    key={model.id} 
                    model={model} 
                    isSelected={selectedModel === model.id}
                    getSpeedColor={getSpeedColor}
                    getQualityColor={getQualityColor}
                  />
                ))}
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Auswählen
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Einzelne Modell-Option
function ModelOption({ 
  model, 
  isSelected, 
  getSpeedColor, 
  getQualityColor 
}: { 
  model: AIModel
  isSelected: boolean
  getSpeedColor: (speed: string) => string
  getQualityColor: (quality: string) => string
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
        isSelected 
          ? "border-primary bg-primary/5 ring-1 ring-primary" 
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <RadioGroupItem value={model.id} className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{model.name}</span>
          {model.recommended && (
            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
              ⭐ Empfohlen
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {model.description}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="outline" className={cn("text-xs", getSpeedColor(model.speed))}>
            {model.speed === 'fast' ? '⚡ Schnell' : model.speed === 'medium' ? '⏱️ Mittel' : '🐢 Langsam'}
          </Badge>
          <Badge variant="outline" className={cn("text-xs", getQualityColor(model.quality))}>
            {model.quality === 'premium' ? '✨ Premium' : model.quality === 'high' ? '👍 Hoch' : '📷 Standard'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {model.price}/Bild
          </span>
        </div>
      </div>
      {isSelected && (
        <Check className="h-5 w-5 text-primary shrink-0" />
      )}
    </label>
  )
}

// Export für Nutzung in anderen Komponenten
export { AI_MODELS, DEFAULT_MODEL }
export type { AIModel }

