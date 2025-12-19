'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { NewsletterBlock, TextAlign } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface ParagraphBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
}

export function ParagraphBlock({ block, isEditing, onChange }: ParagraphBlockProps) {
  const align = block.align || 'left'
  const content = block.content || ''

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="paragraph-content" className="text-xs">Text</Label>
          <Textarea
            id="paragraph-content"
            value={content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Text eingeben..."
            rows={4}
            className="resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Ausrichtung</Label>
          <Select
            value={align}
            onValueChange={(v) => onChange({ align: v as TextAlign })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Links</SelectItem>
              <SelectItem value="center">Zentriert</SelectItem>
              <SelectItem value="right">Rechts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  // Preview Mode
  return (
    <p
      className={cn(
        'text-sm text-muted-foreground line-clamp-3',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right'
      )}
    >
      {content || <span className="italic">Textabsatz</span>}
    </p>
  )
}



