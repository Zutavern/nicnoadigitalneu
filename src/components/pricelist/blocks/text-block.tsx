'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'
import { TextAlignSelector, getTextAlignClass } from './text-align-selector'

interface TextBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function TextBlock({ block, isEditing, onChange }: TextBlockProps) {
  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <div>
          <Label htmlFor={`text-${block.id}`} className="text-xs">
            Text
          </Label>
          <Textarea
            id={`text-${block.id}`}
            value={block.content || ''}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Text eingeben..."
            rows={3}
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

  return (
    <div className={cn('py-1', getTextAlignClass(block.textAlign))}>
      <p className="text-sm text-muted-foreground">
        {block.content || 'Kein Text'}
      </p>
    </div>
  )
}
