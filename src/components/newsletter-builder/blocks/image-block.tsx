'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ImageIcon } from 'lucide-react'
import type { NewsletterBlock, TextAlign } from '@/lib/newsletter-builder/types'
import { ImageUpload } from '../image-upload'
import { cn } from '@/lib/utils'

interface ImageBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
}

export function ImageBlock({ block, isEditing, onChange }: ImageBlockProps) {
  const align = block.align || 'center'
  const src = block.src || ''
  const alt = block.alt || ''
  const imageWidth = block.imageWidth || 100
  const [imageError, setImageError] = useState(false)

  if (isEditing) {
    return (
      <div className="space-y-3">
        {/* Bild-Upload mit Vercel Blob Integration */}
        <ImageUpload
          value={src}
          onChange={(url) => {
            onChange({ src: url })
            setImageError(false)
          }}
          type="content"
          label="Bild"
          previewClassName="h-40"
        />
        
        <div className="space-y-1.5">
          <Label htmlFor="image-alt" className="text-xs">Alt-Text (Beschreibung für Barrierefreiheit)</Label>
          <Input
            id="image-alt"
            value={alt}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Bildbeschreibung für Screenreader..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Breite: {imageWidth}%</Label>
            <Slider
              value={[imageWidth]}
              onValueChange={(v) => onChange({ imageWidth: v[0] })}
              min={25}
              max={100}
              step={5}
            />
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
  if (!src) {
    return (
      <div
        className={cn(
          'flex',
          align === 'left' && 'justify-start',
          align === 'center' && 'justify-center',
          align === 'right' && 'justify-end'
        )}
      >
        <div className="flex items-center justify-center h-16 w-24 bg-muted rounded">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex',
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end'
      )}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-20 object-contain rounded"
        style={{ width: `${imageWidth}%`, maxWidth: '100%' }}
        onError={() => setImageError(true)}
      />
    </div>
  )
}
