'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { MATERIAL_TYPE_CONFIGS, THEME_CONFIGS } from '@/lib/print-materials/types'
import type { PrintMaterialType } from '@prisma/client'
import {
  CreditCard,
  Square,
  FileText,
  File,
  Mail,
  Gift,
  Check,
  Sparkles,
} from 'lucide-react'

interface TemplateSelectorProps {
  onSelect: (config: {
    name: string
    type: PrintMaterialType
    templateId: string
    templateBlocks: TemplateBlock[]
  }) => void
  className?: string
}

export interface TemplateBlock {
  type: string
  side: 'FRONT' | 'BACK'
  x: number
  y: number
  width: number
  height: number
  content?: string
  fontSize?: number
  fontWeight?: string
  textAlign?: string
  color?: string
  qrCodeUrl?: string
  qrCodeLabel?: string
  qrCodeSize?: number
  showPhone?: boolean
  showEmail?: boolean
  showAddress?: boolean
  showWebsite?: boolean
}

// Vordefinierte Visitenkarten-Templates
const BUSINESS_CARD_TEMPLATES = [
  {
    id: 'minimal-classic',
    name: 'Minimal Klassisch',
    description: 'Zeitloses, cleanes Design',
    theme: 'minimal',
    preview: {
      front: 'bg-white',
      back: 'bg-white',
    },
    blocks: [
      // Vorderseite
      { type: 'NAME', side: 'FRONT' as const, x: 10, y: 20, width: 63, height: 10, fontSize: 16, fontWeight: 'bold', textAlign: 'center', content: '' },
      { type: 'TAGLINE', side: 'FRONT' as const, x: 10, y: 32, width: 63, height: 6, fontSize: 9, textAlign: 'center', content: '' },
      // Rückseite
      { type: 'LOGO', side: 'BACK' as const, x: 30, y: 8, width: 23, height: 15 },
      { type: 'CONTACT_INFO', side: 'BACK' as const, x: 10, y: 28, width: 63, height: 18, showPhone: true, showEmail: true, showAddress: true, showWebsite: false },
      { type: 'QR_CODE', side: 'BACK' as const, x: 62, y: 5, width: 15, height: 15, qrCodeSize: 12, qrCodeLabel: '' },
    ],
  },
  {
    id: 'modern-dark',
    name: 'Modern Dunkel',
    description: 'Elegantes dunkles Design',
    theme: 'modern',
    preview: {
      front: 'bg-slate-900',
      back: 'bg-slate-900',
    },
    blocks: [
      // Vorderseite
      { type: 'NAME', side: 'FRONT' as const, x: 5, y: 18, width: 73, height: 12, fontSize: 18, fontWeight: 'bold', textAlign: 'left', content: '', color: '#ffffff' },
      { type: 'TAGLINE', side: 'FRONT' as const, x: 5, y: 32, width: 73, height: 6, fontSize: 10, textAlign: 'left', content: '', color: '#a0aec0' },
      { type: 'SHAPE', side: 'FRONT' as const, x: 5, y: 42, width: 30, height: 1, color: '#6366f1' },
      // Rückseite
      { type: 'LOGO', side: 'BACK' as const, x: 5, y: 5, width: 20, height: 12 },
      { type: 'CONTACT_INFO', side: 'BACK' as const, x: 5, y: 22, width: 50, height: 22, showPhone: true, showEmail: true, showAddress: true, color: '#e2e8f0' },
      { type: 'QR_CODE', side: 'BACK' as const, x: 58, y: 28, width: 18, height: 18, qrCodeSize: 15, color: '#ffffff' },
    ],
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'Klassisch und edel',
    theme: 'elegant',
    preview: {
      front: 'bg-stone-100',
      back: 'bg-stone-100',
    },
    blocks: [
      // Vorderseite
      { type: 'NAME', side: 'FRONT' as const, x: 10, y: 15, width: 63, height: 12, fontSize: 20, fontWeight: 'normal', textAlign: 'center', content: '' },
      { type: 'SHAPE', side: 'FRONT' as const, x: 30, y: 28, width: 23, height: 0.5, color: '#8b7355' },
      { type: 'TAGLINE', side: 'FRONT' as const, x: 10, y: 32, width: 63, height: 6, fontSize: 9, textAlign: 'center', content: '', color: '#8b7355' },
      // Rückseite
      { type: 'LOGO', side: 'BACK' as const, x: 32, y: 5, width: 19, height: 12 },
      { type: 'CONTACT_INFO', side: 'BACK' as const, x: 10, y: 22, width: 63, height: 20, textAlign: 'center', showPhone: true, showEmail: true, showAddress: true },
      { type: 'QR_CODE', side: 'BACK' as const, x: 32, y: 42, width: 10, height: 10, qrCodeSize: 8 },
    ],
  },
  {
    id: 'bold-color',
    name: 'Bold & Bunt',
    description: 'Auffällig und mutig',
    theme: 'bold',
    preview: {
      front: 'bg-gradient-to-br from-orange-500 to-pink-500',
      back: 'bg-white',
    },
    blocks: [
      // Vorderseite
      { type: 'NAME', side: 'FRONT' as const, x: 5, y: 15, width: 73, height: 14, fontSize: 22, fontWeight: 'bold', textAlign: 'left', content: '', color: '#ffffff' },
      { type: 'TAGLINE', side: 'FRONT' as const, x: 5, y: 32, width: 50, height: 8, fontSize: 11, textAlign: 'left', content: '', color: '#ffffff' },
      // Rückseite
      { type: 'LOGO', side: 'BACK' as const, x: 5, y: 5, width: 18, height: 12 },
      { type: 'CONTACT_INFO', side: 'BACK' as const, x: 5, y: 22, width: 45, height: 22, showPhone: true, showEmail: true, showAddress: true },
      { type: 'QR_CODE', side: 'BACK' as const, x: 55, y: 5, width: 23, height: 23, qrCodeSize: 18 },
    ],
  },
  {
    id: 'nature-organic',
    name: 'Natur & Organisch',
    description: 'Natürlich und frisch',
    theme: 'nature',
    preview: {
      front: 'bg-green-50',
      back: 'bg-green-50',
    },
    blocks: [
      // Vorderseite
      { type: 'LOGO', side: 'FRONT' as const, x: 30, y: 8, width: 23, height: 15 },
      { type: 'NAME', side: 'FRONT' as const, x: 10, y: 28, width: 63, height: 10, fontSize: 14, fontWeight: 'semibold', textAlign: 'center', content: '', color: '#2e7d32' },
      { type: 'TAGLINE', side: 'FRONT' as const, x: 10, y: 40, width: 63, height: 6, fontSize: 9, textAlign: 'center', content: '', color: '#558b2f' },
      // Rückseite
      { type: 'CONTACT_INFO', side: 'BACK' as const, x: 5, y: 10, width: 50, height: 28, showPhone: true, showEmail: true, showAddress: true, color: '#2e7d32' },
      { type: 'QR_CODE', side: 'BACK' as const, x: 58, y: 15, width: 18, height: 18, qrCodeSize: 14, color: '#2e7d32' },
    ],
  },
  {
    id: 'luxury-gold',
    name: 'Luxus Gold',
    description: 'Premium und exklusiv',
    theme: 'luxury',
    preview: {
      front: 'bg-black',
      back: 'bg-black',
    },
    blocks: [
      // Vorderseite
      { type: 'LOGO', side: 'FRONT' as const, x: 32, y: 10, width: 19, height: 12, color: '#d4af37' },
      { type: 'NAME', side: 'FRONT' as const, x: 10, y: 28, width: 63, height: 10, fontSize: 16, fontWeight: 'normal', textAlign: 'center', content: '', color: '#d4af37' },
      { type: 'SHAPE', side: 'FRONT' as const, x: 25, y: 40, width: 33, height: 0.5, color: '#d4af37' },
      // Rückseite
      { type: 'CONTACT_INFO', side: 'BACK' as const, x: 10, y: 10, width: 63, height: 25, textAlign: 'center', showPhone: true, showEmail: true, showAddress: false, color: '#d4af37' },
      { type: 'QR_CODE', side: 'BACK' as const, x: 32, y: 38, width: 12, height: 12, qrCodeSize: 10, color: '#d4af37' },
    ],
  },
]

const MATERIAL_ICONS: Record<PrintMaterialType, React.ComponentType<{ className?: string }>> = {
  BUSINESS_CARD: CreditCard,
  BUSINESS_CARD_SQUARE: Square,
  FLYER_A6: FileText,
  FLYER_A5: File,
  POSTCARD: Mail,
  GIFT_CARD: Gift,
}

export function TemplateSelector({ onSelect, className }: TemplateSelectorProps) {
  const [selectedType, setSelectedType] = useState<PrintMaterialType>('BUSINESS_CARD')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [name, setName] = useState('')

  const handleCreate = () => {
    if (!selectedTemplate || !name.trim()) return

    const template = BUSINESS_CARD_TEMPLATES.find(t => t.id === selectedTemplate)
    if (!template) return

    onSelect({
      name: name.trim(),
      type: selectedType,
      templateId: template.theme,
      templateBlocks: template.blocks.map(b => ({
        ...b,
        side: b.side as 'FRONT' | 'BACK',
      })),
    })
  }

  const materialConfig = MATERIAL_TYPE_CONFIGS[selectedType]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Name eingeben */}
      <div className="space-y-2">
        <Label htmlFor="name">Name der Drucksache</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Visitenkarte Hauptgeschäft"
        />
      </div>

      {/* Material-Typ auswählen */}
      <div className="space-y-3">
        <Label>Format wählen</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(MATERIAL_TYPE_CONFIGS).map(([type, config]) => {
            const Icon = MATERIAL_ICONS[type as PrintMaterialType]
            const isSelected = selectedType === type

            return (
              <Card
                key={type}
                className={cn(
                  'cursor-pointer transition-all hover:border-primary/50',
                  isSelected && 'border-primary ring-2 ring-primary/20'
                )}
                onClick={() => setSelectedType(type as PrintMaterialType)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Icon className={cn('h-8 w-8 mb-2', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  <p className="font-medium text-sm">{config.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.width} × {config.height} mm
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Template auswählen */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Design-Vorlage wählen
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BUSINESS_CARD_TEMPLATES.map((template) => {
            const isSelected = selectedTemplate === template.id
            const theme = THEME_CONFIGS.find(t => t.id === template.theme)

            return (
              <Card
                key={template.id}
                className={cn(
                  'cursor-pointer transition-all overflow-hidden hover:shadow-lg',
                  isSelected && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="relative">
                  {/* Preview */}
                  <div className="flex gap-1 p-3 bg-muted/30">
                    {/* Vorderseite Mini-Preview */}
                    <div
                      className={cn(
                        'flex-1 aspect-[89/59] rounded shadow-sm',
                        template.preview.front
                      )}
                      style={
                        template.preview.front.startsWith('bg-')
                          ? undefined
                          : { background: theme?.preview || '#fff' }
                      }
                    />
                    {/* Rückseite Mini-Preview */}
                    <div
                      className={cn(
                        'flex-1 aspect-[89/59] rounded shadow-sm',
                        template.preview.back
                      )}
                    />
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary">
                        <Check className="h-3 w-3 mr-1" />
                        Ausgewählt
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Erstellen Button */}
      <Button
        onClick={handleCreate}
        disabled={!selectedTemplate || !name.trim()}
        className="w-full"
        size="lg"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Drucksache erstellen
      </Button>
    </div>
  )
}

export { BUSINESS_CARD_TEMPLATES }

