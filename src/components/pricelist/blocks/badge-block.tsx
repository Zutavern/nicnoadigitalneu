'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'
import { TextAlignSelector, getTextAlignClass } from './text-align-selector'

interface BadgeBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

const BADGE_COLORS = [
  { value: 'primary', label: 'Primär', class: 'bg-primary text-primary-foreground' },
  { value: 'secondary', label: 'Sekundär', class: 'bg-secondary text-secondary-foreground' },
  { value: 'accent', label: 'Akzent', class: 'bg-amber-500 text-white' },
  { value: 'success', label: 'Erfolg', class: 'bg-emerald-500 text-white' },
  { value: 'danger', label: 'Rot', class: 'bg-rose-500 text-white' },
  { value: 'gold', label: 'Gold', class: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white' },
]

const BADGE_STYLES = [
  { value: 'filled', label: 'Gefüllt' },
  { value: 'outline', label: 'Umrandet' },
  { value: 'gradient', label: 'Verlauf' },
]

export function BadgeBlock({ block, isEditing, onChange }: BadgeBlockProps) {
  const colorConfig = BADGE_COLORS.find(c => c.value === block.badgeColor) || BADGE_COLORS[0]
  
  const getBadgeClasses = () => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold'
    
    if (block.badgeStyle === 'outline') {
      return cn(baseClasses, 'border-2 border-current bg-transparent', 
        block.badgeColor === 'primary' && 'text-primary',
        block.badgeColor === 'secondary' && 'text-secondary',
        block.badgeColor === 'accent' && 'text-amber-500',
        block.badgeColor === 'success' && 'text-emerald-500',
        block.badgeColor === 'danger' && 'text-rose-500',
        block.badgeColor === 'gold' && 'text-amber-500'
      )
    }
    
    if (block.badgeStyle === 'gradient') {
      return cn(baseClasses, 'bg-gradient-to-r text-white',
        block.badgeColor === 'primary' && 'from-primary to-primary/80',
        block.badgeColor === 'secondary' && 'from-secondary to-secondary/80',
        block.badgeColor === 'accent' && 'from-amber-400 to-orange-500',
        block.badgeColor === 'success' && 'from-emerald-400 to-green-500',
        block.badgeColor === 'danger' && 'from-rose-400 to-red-500',
        block.badgeColor === 'gold' && 'from-amber-300 via-yellow-400 to-amber-500'
      )
    }
    
    return cn(baseClasses, colorConfig.class)
  }

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <div>
          <Label htmlFor={`badge-text-${block.id}`} className="text-xs">
            Badge Text
          </Label>
          <Input
            id={`badge-text-${block.id}`}
            value={block.badgeText || ''}
            onChange={(e) => onChange({ badgeText: e.target.value })}
            placeholder="NEU, SALE, -20%..."
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Stil</Label>
            <Select
              value={block.badgeStyle || 'filled'}
              onValueChange={(value) => onChange({ badgeStyle: value as 'filled' | 'outline' | 'gradient' })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BADGE_STYLES.map(style => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Farbe</Label>
            <Select
              value={block.badgeColor || 'primary'}
              onValueChange={(value) => onChange({ badgeColor: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BADGE_COLORS.map(color => (
                  <SelectItem key={color.value} value={color.value}>
                    {color.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Ausrichtung</Label>
          <TextAlignSelector
            value={block.textAlign}
            onChange={(textAlign) => onChange({ textAlign })}
          />
        </div>
        {/* Preview */}
        <div className="pt-2">
          <div className="text-xs text-muted-foreground mb-1">Vorschau:</div>
          <span className={getBadgeClasses()}>
            {block.badgeText || 'Badge'}
          </span>
        </div>
      </div>
    )
  }

  const alignClass = getTextAlignClass(block.textAlign)

  return (
    <div className={cn('py-2', alignClass)}>
      <span className={getBadgeClasses()}>
        {block.badgeText || 'Badge'}
      </span>
    </div>
  )
}
