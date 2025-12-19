'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Quote as QuoteIcon } from 'lucide-react'
import type { NewsletterBlock, TextAlign } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface QuoteBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  primaryColor?: string
}

export function QuoteBlock({ block, isEditing, onChange, primaryColor = '#10b981' }: QuoteBlockProps) {
  const quoteText = block.quoteText || ''
  const quoteAuthor = block.quoteAuthor || ''
  const quoteRole = block.quoteRole || ''
  const align = block.align || 'center'

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="quote-text" className="text-xs">Zitat</Label>
          <Textarea
            id="quote-text"
            value={quoteText}
            onChange={(e) => onChange({ quoteText: e.target.value })}
            placeholder="Das Zitat eingeben..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="quote-author" className="text-xs">Autor</Label>
            <Input
              id="quote-author"
              value={quoteAuthor}
              onChange={(e) => onChange({ quoteAuthor: e.target.value })}
              placeholder="Max Mustermann"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quote-role" className="text-xs">Position/Rolle</Label>
            <Input
              id="quote-role"
              value={quoteRole}
              onChange={(e) => onChange({ quoteRole: e.target.value })}
              placeholder="Kunde, CEO, etc."
            />
          </div>
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
    <div
      className={cn(
        'p-4 bg-muted/50 rounded-r-lg border-l-4',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right'
      )}
      style={{ borderLeftColor: primaryColor }}
    >
      <QuoteIcon className="h-5 w-5 text-muted-foreground mb-2 inline-block" />
      <p className="text-sm italic text-muted-foreground mb-2">
        {quoteText || 'Zitat hier...'}
      </p>
      {(quoteAuthor || quoteRole) && (
        <div className="text-xs">
          {quoteAuthor && <span className="font-semibold">{quoteAuthor}</span>}
          {quoteAuthor && quoteRole && ' • '}
          {quoteRole && <span className="text-muted-foreground">{quoteRole}</span>}
        </div>
      )}
    </div>
  )
}



