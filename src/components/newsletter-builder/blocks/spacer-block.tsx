'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { NewsletterBlock, SpacerSize } from '@/lib/newsletter-builder/types'
import { SPACER_SIZE_CONFIGS } from '@/lib/newsletter-builder/types'

interface SpacerBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
}

export function SpacerBlock({ block, isEditing, onChange }: SpacerBlockProps) {
  const size = block.spacerSize || 'MEDIUM'
  const height = SPACER_SIZE_CONFIGS[size].heightPx

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Abstandsgröße</Label>
          <Select
            value={size}
            onValueChange={(v) => onChange({ spacerSize: v as SpacerSize })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SPACER_SIZE_CONFIGS) as SpacerSize[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SPACER_SIZE_CONFIGS[s].label} ({SPACER_SIZE_CONFIGS[s].heightPx}px)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div 
          className="flex items-center justify-center border border-dashed border-muted-foreground/30 rounded"
          style={{ height: `${height}px` }}
        >
          <span className="text-xs text-muted-foreground">Abstand: {height}px</span>
        </div>
      </div>
    )
  }

  // Preview Mode
  return (
    <div 
      className="flex items-center justify-center border border-dashed border-muted-foreground/20 rounded"
      style={{ height: `${Math.min(height, 24)}px` }}
    >
      <span className="text-[10px] text-muted-foreground">{height}px</span>
    </div>
  )
}



