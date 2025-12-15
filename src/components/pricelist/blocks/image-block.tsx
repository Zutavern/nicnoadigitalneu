'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ImageIcon, Upload, X } from 'lucide-react'
import Image from 'next/image'
import type { PriceBlockClient } from '@/lib/pricelist/types'

interface ImageBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function ImageBlock({ block, isEditing, onChange }: ImageBlockProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const { url } = await res.json()
        onChange({ imageUrl: url })
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <Label className="text-xs">Bild</Label>
        
        {block.imageUrl ? (
          <div className="relative">
            <img
              src={block.imageUrl}
              alt="Block image"
              className="w-full h-32 object-contain rounded bg-white"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => onChange({ imageUrl: null })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id={`image-upload-${block.id}`}
            />
            <label
              htmlFor={`image-upload-${block.id}`}
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {isUploading ? 'Lädt...' : 'Bild hochladen'}
              </span>
            </label>
          </div>
        )}

        <div>
          <Label htmlFor={`imageUrl-${block.id}`} className="text-xs">
            Oder URL eingeben
          </Label>
          <Input
            id={`imageUrl-${block.id}`}
            value={block.imageUrl || ''}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            placeholder="https://..."
            className="mt-1"
          />
        </div>
      </div>
    )
  }

  if (!block.imageUrl) {
    return (
      <div className="py-2 flex items-center gap-2 text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
        <span className="text-xs">Kein Bild</span>
      </div>
    )
  }

  return (
    <div className="py-2">
      <img
        src={block.imageUrl}
        alt="Block image"
        className="max-h-24 object-contain"
      />
    </div>
  )
}


