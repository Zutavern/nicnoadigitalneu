'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'
import { TextAlignSelector, getTextAlignClass } from './text-align-selector'

interface IconTextBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

// Häufig verwendete Icons für Preislisten
const AVAILABLE_ICONS = [
  { name: 'Check', label: 'Häkchen' },
  { name: 'Star', label: 'Stern' },
  { name: 'Heart', label: 'Herz' },
  { name: 'Sparkles', label: 'Funkeln' },
  { name: 'Award', label: 'Auszeichnung' },
  { name: 'Crown', label: 'Krone' },
  { name: 'Gem', label: 'Juwel' },
  { name: 'Zap', label: 'Blitz' },
  { name: 'Clock', label: 'Uhr' },
  { name: 'Calendar', label: 'Kalender' },
  { name: 'MapPin', label: 'Standort' },
  { name: 'Phone', label: 'Telefon' },
  { name: 'Mail', label: 'E-Mail' },
  { name: 'Gift', label: 'Geschenk' },
  { name: 'Percent', label: 'Prozent' },
  { name: 'Scissors', label: 'Schere' },
  { name: 'Palette', label: 'Palette' },
  { name: 'Droplets', label: 'Tropfen' },
  { name: 'Sun', label: 'Sonne' },
  { name: 'Moon', label: 'Mond' },
] as const

export function IconTextBlock({ block, isEditing, onChange }: IconTextBlockProps) {
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[block.iconName || 'Check'] || LucideIcons.Check

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <div>
          <Label className="text-xs">Icon</Label>
          <Select
            value={block.iconName || 'Check'}
            onValueChange={(value) => onChange({ iconName: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ICONS.map(icon => {
                const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[icon.name]
                return (
                  <SelectItem key={icon.name} value={icon.name}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{icon.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`icon-text-${block.id}`} className="text-xs">
            Text
          </Label>
          <Input
            id={`icon-text-${block.id}`}
            value={block.content || ''}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Text mit Icon..."
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Ausrichtung</Label>
          <TextAlignSelector
            value={block.textAlign}
            onChange={(textAlign) => onChange({ textAlign })}
          />
        </div>
      </div>
    )
  }

  const alignClass = getTextAlignClass(block.textAlign)

  return (
    <div className={cn(
      'py-1.5 flex items-start gap-3',
      block.textAlign === 'center' && 'justify-center',
      block.textAlign === 'right' && 'flex-row-reverse',
      alignClass
    )}>
      <IconComponent className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
      <span className="text-sm">{block.content || 'Text'}</span>
    </div>
  )
}
