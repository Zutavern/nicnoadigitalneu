'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { NewsletterBlock, HeadingLevel, TextAlign } from '@/lib/newsletter-builder/types'
import { HEADING_LEVEL_CONFIGS } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface HeadingBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
}

export function HeadingBlock({ block, isEditing, onChange }: HeadingBlockProps) {
  const level = block.level || 1
  const align = block.align || 'left'
  const text = block.text || ''

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="heading-text" className="text-xs">Text</Label>
          <Input
            id="heading-text"
            value={text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Überschrift eingeben..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Größe</Label>
            <Select
              value={String(level)}
              onValueChange={(v) => onChange({ level: parseInt(v) as HeadingLevel })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {([1, 2, 3] as HeadingLevel[]).map((lvl) => (
                  <SelectItem key={lvl} value={String(lvl)}>
                    {HEADING_LEVEL_CONFIGS[lvl].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ausrichtung</Label>
            <Select
              value={align}
              onValueChange={(v) => onChange({ align: v as TextAlign })}
            >
              <SelectTrigger>
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
      </div>
    )
  }

  // Preview Mode
  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3'
  const fontSizes: Record<HeadingLevel, string> = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-semibold',
    3: 'text-lg font-semibold',
  }

  return (
    <HeadingTag
      className={cn(
        fontSizes[level],
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        'truncate'
      )}
    >
      {text || <span className="text-muted-foreground italic">Überschrift</span>}
    </HeadingTag>
  )
}



