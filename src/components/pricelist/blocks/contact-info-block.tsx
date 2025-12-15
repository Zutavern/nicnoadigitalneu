'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Phone, Mail, MapPin, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'
import { TextAlignSelector, getTextAlignClass } from './text-align-selector'

interface ContactInfoBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function ContactInfoBlock({ block, isEditing, onChange }: ContactInfoBlockProps) {
  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`phone-${block.id}`} className="text-xs">
              Telefon
            </Label>
            <Input
              id={`phone-${block.id}`}
              value={block.phone || ''}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+49 123 456789"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`email-${block.id}`} className="text-xs">
              E-Mail
            </Label>
            <Input
              id={`email-${block.id}`}
              value={block.email || ''}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="info@salon.de"
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor={`website-${block.id}`} className="text-xs">
            Website
          </Label>
          <Input
            id={`website-${block.id}`}
            value={block.website || ''}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="www.mein-salon.de"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`address-${block.id}`} className="text-xs">
            Adresse
          </Label>
          <Textarea
            id={`address-${block.id}`}
            value={block.address || ''}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Musterstraße 123&#10;12345 Musterstadt"
            rows={2}
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

  const hasAnyInfo = block.phone || block.email || block.website || block.address
  const alignClass = getTextAlignClass(block.textAlign)

  if (!hasAnyInfo) {
    return (
      <div className={cn('py-2 text-sm text-muted-foreground', alignClass)}>
        Keine Kontaktinformationen
      </div>
    )
  }

  return (
    <div className={cn('py-3 space-y-2', alignClass)}>
      {block.phone && (
        <div className={cn(
          'flex items-center gap-3 text-sm',
          block.textAlign === 'center' && 'justify-center',
          block.textAlign === 'right' && 'flex-row-reverse'
        )}>
          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{block.phone}</span>
        </div>
      )}
      {block.email && (
        <div className={cn(
          'flex items-center gap-3 text-sm',
          block.textAlign === 'center' && 'justify-center',
          block.textAlign === 'right' && 'flex-row-reverse'
        )}>
          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{block.email}</span>
        </div>
      )}
      {block.website && (
        <div className={cn(
          'flex items-center gap-3 text-sm',
          block.textAlign === 'center' && 'justify-center',
          block.textAlign === 'right' && 'flex-row-reverse'
        )}>
          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{block.website}</span>
        </div>
      )}
      {block.address && (
        <div className={cn(
          'flex items-start gap-3 text-sm',
          block.textAlign === 'center' && 'justify-center',
          block.textAlign === 'right' && 'flex-row-reverse'
        )}>
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="whitespace-pre-line">{block.address}</span>
        </div>
      )}
    </div>
  )
}
