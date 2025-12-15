'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'
import { TextAlignSelector, getTextAlignClass } from './text-align-selector'

interface InfoBoxBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function InfoBoxBlock({ block, isEditing, onChange }: InfoBoxBlockProps) {
  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <div>
          <Label htmlFor={`info-${block.id}`} className="text-xs">
            Hinweis-Text
          </Label>
          <Textarea
            id={`info-${block.id}`}
            value={block.content || ''}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="z.B. 'Alle Preise inkl. MwSt.'"
            rows={2}
            className="mt-1 text-sm"
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
    <div className="py-1">
      <div className={cn(
        'flex items-start gap-2 p-2 bg-primary/5 rounded-md border border-primary/10',
        block.textAlign === 'center' && 'justify-center',
        block.textAlign === 'right' && 'flex-row-reverse'
      )}>
        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className={cn('text-xs text-primary/80', alignClass)}>
          {block.content || 'Hinweis eingeben...'}
        </p>
      </div>
    </div>
  )
}
