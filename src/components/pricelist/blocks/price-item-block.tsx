'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { PriceBlockClient, PriceVariantClient } from '@/lib/pricelist/types'
import { PRICE_TYPE_CONFIGS, formatPrice } from '@/lib/pricelist/types'
import type { PriceType, PricingModel } from '@prisma/client'
import { TextAlignSelector, getTextAlignClass } from './text-align-selector'

interface PriceItemBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  pricingModel: PricingModel
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function PriceItemBlock({ block, isEditing, pricingModel, onChange }: PriceItemBlockProps) {
  const hasVariants = block.variants.length > 0

  const updateVariant = (index: number, updates: Partial<PriceVariantClient>) => {
    const newVariants = [...block.variants]
    newVariants[index] = { ...newVariants[index], ...updates }
    onChange({ variants: newVariants })
  }

  if (isEditing) {
    return (
      <div className="space-y-4 p-3 bg-muted/30 rounded-lg">
        {/* Name */}
        <div>
          <Label htmlFor={`name-${block.id}`} className="text-xs">
            Dienstleistung
          </Label>
          <Input
            id={`name-${block.id}`}
            value={block.itemName || ''}
            onChange={(e) => onChange({ itemName: e.target.value })}
            placeholder="z.B. Waschen & Schneiden"
            className="mt-1"
          />
        </div>

        {/* Beschreibung */}
        <div>
          <Label htmlFor={`desc-${block.id}`} className="text-xs">
            Beschreibung (optional)
          </Label>
          <Textarea
            id={`desc-${block.id}`}
            value={block.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Zusätzliche Info..."
            rows={2}
            className="mt-1 text-sm"
          />
        </div>

        {/* Qualifier */}
        <div>
          <Label htmlFor={`qualifier-${block.id}`} className="text-xs">
            Qualifier (optional)
          </Label>
          <Input
            id={`qualifier-${block.id}`}
            value={block.qualifier || ''}
            onChange={(e) => onChange({ qualifier: e.target.value })}
            placeholder="z.B. 'pro Strähnchen', 'inkl. Pflege'"
            className="mt-1"
          />
        </div>

        {/* Preis-Typ */}
        <div>
          <Label className="text-xs">Preis-Typ</Label>
          <Select
            value={block.priceType || 'FIXED'}
            onValueChange={(value) => onChange({ priceType: value as PriceType })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PRICE_TYPE_CONFIGS).map((config) => (
                <SelectItem key={config.type} value={config.type}>
                  <div className="flex flex-col">
                    <span>{config.label}</span>
                    <span className="text-xs text-muted-foreground">{config.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Varianten oder Einzelpreis */}
        {hasVariants ? (
          <div className="space-y-2">
            <Label className="text-xs">Preise nach {pricingModel === 'BY_HAIR_LENGTH' ? 'Haarlänge' : 'Geschlecht'}</Label>
            {block.variants.map((variant, index) => (
              <div key={variant.id} className="flex items-center gap-2">
                <span className="text-sm w-20 text-muted-foreground">{variant.label}</span>
                <Input
                  type="number"
                  value={variant.price || 0}
                  onChange={(e) => updateVariant(index, { price: parseFloat(e.target.value) || 0 })}
                  className="w-24"
                  step="0.50"
                  min="0"
                />
                <span className="text-sm text-muted-foreground">€</span>
              </div>
            ))}
          </div>
        ) : block.priceType === 'TEXT' ? (
          // Nur Text-Feld bei TEXT-Typ
          <div>
            <Label htmlFor={`priceText-${block.id}`} className="text-xs">
              Preis-Text
            </Label>
            <Input
              id={`priceText-${block.id}`}
              value={block.priceText || ''}
              onChange={(e) => onChange({ priceText: e.target.value })}
              placeholder="z.B. 'auf Anfrage', 'Preis auf Anfrage'"
              className="mt-1"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Preis (Von bei RANGE) */}
            <div>
              <Label htmlFor={`price-${block.id}`} className="text-xs">
                {block.priceType === 'RANGE' ? 'Von' : 
                 block.priceType === 'FROM' ? 'Ab' :
                 block.priceType === 'SURCHARGE' ? 'Aufpreis' : 'Preis'}
              </Label>
              <div className="flex items-center gap-1 mt-1">
                {block.priceType === 'FROM' && <span className="text-sm text-muted-foreground">ab</span>}
                {block.priceType === 'SURCHARGE' && <span className="text-sm text-muted-foreground">+</span>}
                <Input
                  id={`price-${block.id}`}
                  type="number"
                  value={block.price || ''}
                  onChange={(e) => onChange({ price: parseFloat(e.target.value) || 0 })}
                  step="0.50"
                  min="0"
                />
                <span className="text-sm text-muted-foreground">€</span>
              </div>
            </div>
            
            {/* Bis-Feld nur bei RANGE */}
            {block.priceType === 'RANGE' && (
              <div>
                <Label htmlFor={`priceMax-${block.id}`} className="text-xs">
                  Bis
                </Label>
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    id={`priceMax-${block.id}`}
                    type="number"
                    value={block.priceMax || ''}
                    onChange={(e) => onChange({ priceMax: parseFloat(e.target.value) || 0 })}
                    step="0.50"
                    min="0"
                  />
                  <span className="text-sm text-muted-foreground">€</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ausrichtung */}
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

  // Kompakte Ansicht
  return (
    <div className={cn('py-1', alignClass)}>
      <div className={cn(
        'flex items-center gap-2',
        block.textAlign === 'center' ? 'justify-center' : 'justify-between',
        block.textAlign === 'right' && 'flex-row-reverse'
      )}>
        <span className="text-sm">{block.itemName || 'Neue Dienstleistung'}</span>
        {hasVariants ? (
          <span className="text-xs text-muted-foreground">
            {block.variants.map(v => `${v.label}: ${v.price}€`).join(' | ')}
          </span>
        ) : (
          <span className="text-sm font-medium">{formatPrice(block)}</span>
        )}
      </div>
      {block.description && (
        <p className={cn('text-xs text-muted-foreground mt-0.5', alignClass)}>{block.description}</p>
      )}
      {block.qualifier && (
        <p className={cn('text-xs text-primary/70 mt-0.5', alignClass)}>{block.qualifier}</p>
      )}
    </div>
  )
}
