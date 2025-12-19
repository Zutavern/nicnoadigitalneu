'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { NewsletterBlock, DividerStyle } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface DividerBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
}

export function DividerBlock({ block, isEditing, onChange }: DividerBlockProps) {
  const style = block.dividerStyle || 'solid'

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Linienstil</Label>
          <Select
            value={style}
            onValueChange={(v) => onChange({ dividerStyle: v as DividerStyle })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Durchgezogen</SelectItem>
              <SelectItem value="dashed">Gestrichelt</SelectItem>
              <SelectItem value="dotted">Gepunktet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="pt-2">
          <hr className={cn(
            'border-t',
            style === 'solid' && 'border-solid',
            style === 'dashed' && 'border-dashed',
            style === 'dotted' && 'border-dotted'
          )} />
        </div>
      </div>
    )
  }

  // Preview Mode
  return (
    <hr className={cn(
      'border-t border-muted-foreground/30',
      style === 'solid' && 'border-solid',
      style === 'dashed' && 'border-dashed',
      style === 'dotted' && 'border-dotted'
    )} />
  )
}



