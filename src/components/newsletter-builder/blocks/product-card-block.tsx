'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ImageIcon } from 'lucide-react'
import type { NewsletterBlock, TextAlign } from '@/lib/newsletter-builder/types'
import { ImageUpload } from '../image-upload'
import { cn } from '@/lib/utils'

interface ProductCardBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  primaryColor?: string
}

export function ProductCardBlock({ block, isEditing, onChange, primaryColor = '#10b981' }: ProductCardBlockProps) {
  const productName = block.productName || ''
  const productDescription = block.productDescription || ''
  const productPrice = block.productPrice || ''
  const productImageUrl = block.productImageUrl || ''
  const productButtonText = block.productButtonText || 'Jetzt kaufen'
  const productButtonUrl = block.productButtonUrl || ''
  const align = block.align || 'center'
  const [imageError, setImageError] = useState(false)

  if (isEditing) {
    return (
      <div className="space-y-3">
        {/* Produkt-Bild Upload */}
        <ImageUpload
          value={productImageUrl}
          onChange={(url) => {
            onChange({ productImageUrl: url })
            setImageError(false)
          }}
          type="product"
          label="Produkt-Bild"
          previewClassName="h-32"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="product-name" className="text-xs">Produktname</Label>
            <Input
              id="product-name"
              value={productName}
              onChange={(e) => onChange({ productName: e.target.value })}
              placeholder="Produktname"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-price" className="text-xs">Preis</Label>
            <Input
              id="product-price"
              value={productPrice}
              onChange={(e) => onChange({ productPrice: e.target.value })}
              placeholder="€ 29,99"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="product-description" className="text-xs">Beschreibung</Label>
          <Textarea
            id="product-description"
            value={productDescription}
            onChange={(e) => onChange({ productDescription: e.target.value })}
            placeholder="Kurze Produktbeschreibung..."
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="product-button-text" className="text-xs">Button-Text</Label>
            <Input
              id="product-button-text"
              value={productButtonText}
              onChange={(e) => onChange({ productButtonText: e.target.value })}
              placeholder="Jetzt kaufen"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-button-url" className="text-xs">Button-Link</Label>
            <Input
              id="product-button-url"
              value={productButtonUrl}
              onChange={(e) => onChange({ productButtonUrl: e.target.value })}
              placeholder="https://..."
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
        'flex',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end'
      )}
    >
      <div className="border rounded-lg overflow-hidden max-w-[180px] w-full">
        {productImageUrl && !imageError ? (
          <img
            src={productImageUrl}
            alt={productName}
            className="w-full h-24 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-24 bg-muted flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="p-3">
          <h4 className="font-semibold text-sm truncate">{productName || 'Produktname'}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {productDescription || 'Beschreibung'}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm" style={{ color: primaryColor }}>
              {productPrice || '€ --'}
            </span>
            <Button size="sm" className="h-6 text-xs px-2" style={{ backgroundColor: primaryColor }}>
              {productButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
