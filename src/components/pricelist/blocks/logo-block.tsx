'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Trash2, Hexagon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'

interface LogoBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

const LOGO_SIZES = [
  { value: 'small', label: 'Klein', size: 'h-16' },
  { value: 'medium', label: 'Mittel', size: 'h-24' },
  { value: 'large', label: 'Groß', size: 'h-32' },
]

export function LogoBlock({ block, isEditing, onChange }: LogoBlockProps) {
  const [isUploading, setIsUploading] = useState(false)
  const logoSize = block.spacerSize || 'MEDIUM' // Reuse spacerSize for logo size

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const { url } = await res.json()
      onChange({ imageUrl: url })
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const getSizeClass = () => {
    switch (logoSize) {
      case 'SMALL': return 'h-16'
      case 'LARGE': return 'h-32'
      default: return 'h-24'
    }
  }

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        {block.imageUrl ? (
          <div className="space-y-3">
            <div className="flex justify-center p-4 bg-white rounded">
              <img
                src={block.imageUrl}
                alt="Logo"
                className={cn('object-contain', getSizeClass())}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex-1 mr-3">
                <Label className="text-xs">Größe</Label>
                <Select
                  value={logoSize}
                  onValueChange={(value) => onChange({ spacerSize: value as 'SMALL' | 'MEDIUM' | 'LARGE' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMALL">Klein</SelectItem>
                    <SelectItem value="MEDIUM">Mittel</SelectItem>
                    <SelectItem value="LARGE">Groß</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onChange({ imageUrl: null })}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Entfernen
              </Button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="text-sm text-muted-foreground">Wird hochgeladen...</div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Logo hierher ziehen oder klicken
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, SVG (max. 5MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!block.imageUrl) {
    return (
      <div className="py-4 flex justify-center">
        <Hexagon className="h-16 w-16 text-muted-foreground/30" />
      </div>
    )
  }

  return (
    <div className="py-4 flex justify-center">
      <img
        src={block.imageUrl}
        alt="Logo"
        className={cn('object-contain', getSizeClass())}
      />
    </div>
  )
}

