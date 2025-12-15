'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'
import { TextAlignSelector, getTextAlignClass } from './text-align-selector'

interface SectionHeaderBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function SectionHeaderBlock({ block, isEditing, onChange }: SectionHeaderBlockProps) {
  if (isEditing) {
    return (
      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
        <div>
          <Label htmlFor={`title-${block.id}`} className="text-xs">
            Überschrift
          </Label>
          <Input
            id={`title-${block.id}`}
            value={block.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Section-Titel"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`subtitle-${block.id}`} className="text-xs">
            Untertitel (optional)
          </Label>
          <Input
            id={`subtitle-${block.id}`}
            value={block.subtitle || ''}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Optional: Beschreibung"
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
    <div className={cn('py-1', alignClass)}>
      <div className={cn(
        'flex items-center gap-2',
        block.textAlign === 'center' && 'justify-center',
        block.textAlign === 'right' && 'justify-end'
      )}>
        <div className="h-4 w-1 rounded-full bg-primary" />
        <span className="font-semibold text-sm">{block.title || 'Neue Section'}</span>
      </div>
      {block.subtitle && (
        <p className={cn('text-xs text-muted-foreground mt-0.5', alignClass)}>{block.subtitle}</p>
      )}
    </div>
  )
}
