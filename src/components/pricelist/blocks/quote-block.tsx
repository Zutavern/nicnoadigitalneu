'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'
import { TextAlignSelector, getTextAlignClass } from './text-align-selector'

interface QuoteBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function QuoteBlock({ block, isEditing, onChange }: QuoteBlockProps) {
  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <div>
          <Label htmlFor={`quote-content-${block.id}`} className="text-xs">
            Zitat / Bewertung
          </Label>
          <Textarea
            id={`quote-content-${block.id}`}
            value={block.content || ''}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Ein tolles Zitat oder eine Kundenbewertung..."
            rows={3}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`quote-author-${block.id}`} className="text-xs">
            Autor / Name (optional)
          </Label>
          <Input
            id={`quote-author-${block.id}`}
            value={block.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Maria M."
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
    <div className={cn('py-3', alignClass)}>
      <div className={cn(
        'relative pl-6 border-l-4 border-primary/30',
        block.textAlign === 'center' && 'border-l-0 border-t-4 pt-4 pl-0',
        block.textAlign === 'right' && 'pl-0 pr-6 border-l-0 border-r-4'
      )}>
        <Quote className={cn(
          'absolute -top-1 h-6 w-6 text-primary/40',
          block.textAlign === 'left' && '-left-3',
          block.textAlign === 'center' && 'left-1/2 -translate-x-1/2 -top-3',
          block.textAlign === 'right' && '-right-3'
        )} />
        <blockquote className="text-sm italic text-muted-foreground">
          "{block.content || 'Zitat'}"
        </blockquote>
        {block.title && (
          <cite className={cn('block mt-2 text-xs font-medium text-foreground not-italic', alignClass)}>
            — {block.title}
          </cite>
        )}
      </div>
    </div>
  )
}
