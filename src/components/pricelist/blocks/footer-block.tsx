'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'
import { TextAlignSelector, getTextAlignClass } from './text-align-selector'

interface FooterBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function FooterBlock({ block, isEditing, onChange }: FooterBlockProps) {
  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <div>
          <Label htmlFor={`footer-text-${block.id}`} className="text-xs">
            Footer-Text (Impressum, Öffnungszeiten, etc.)
          </Label>
          <Textarea
            id={`footer-text-${block.id}`}
            value={block.footerText || ''}
            onChange={(e) => onChange({ footerText: e.target.value })}
            placeholder={`Öffnungszeiten:
Mo-Fr: 9:00 - 18:00 Uhr
Sa: 9:00 - 14:00 Uhr

Alle Preise inkl. MwSt.`}
            rows={5}
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
        <p className="text-xs text-muted-foreground">
          Tipp: Verwende Zeilenumbrüche für bessere Formatierung
        </p>
      </div>
    )
  }

  const alignClass = getTextAlignClass(block.textAlign)

  if (!block.footerText) {
    return (
      <div className={cn('py-2 text-sm text-muted-foreground', alignClass)}>
        Kein Footer-Text
      </div>
    )
  }

  return (
    <div className="py-4 border-t mt-4">
      <p className={cn('text-xs text-muted-foreground whitespace-pre-line', alignClass)}>
        {block.footerText}
      </p>
    </div>
  )
}
