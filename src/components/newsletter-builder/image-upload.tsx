'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link as LinkIcon, Loader2, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  type?: 'content' | 'thumbnail' | 'product' | 'profile'
  className?: string
  label?: string
  placeholder?: string
  previewClassName?: string
}

/**
 * Wiederverwendbare Upload-Komponente für Newsletter-Bilder
 * - Tab 1: Bild hochladen zu Vercel Blob
 * - Tab 2: Externe URL eingeben
 */
export function ImageUpload({
  value,
  onChange,
  type = 'content',
  className,
  label = 'Bild',
  placeholder = 'https://beispiel.de/bild.jpg',
  previewClassName = 'h-32',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value || '')
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validierung
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Ungültiges Format. Erlaubt: JPEG, PNG, GIF, WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bild zu groß (max. 5MB)')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/admin/newsletter/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload fehlgeschlagen')
      }

      const { url } = await response.json()
      onChange(url)
      setUrlInput(url)
      setImageError(false)
      toast.success('Bild hochgeladen')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload fehlgeschlagen')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setImageError(false)
    }
  }

  const handleClear = async () => {
    // Optional: Altes Bild von Vercel Blob löschen
    if (value && value.includes('vercel-storage.com') && value.includes('/newsletter/')) {
      try {
        await fetch(`/api/admin/newsletter/upload?url=${encodeURIComponent(value)}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
    onChange('')
    setUrlInput('')
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-xs">{label}</Label>

      {value && !imageError ? (
        // Bildvorschau
        <div className="relative group">
          <img
            src={value}
            alt="Vorschau"
            className={cn('w-full object-cover rounded-lg', previewClassName)}
            onError={() => setImageError(true)}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        // Upload/URL Eingabe
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="upload" className="text-xs">
              <Upload className="h-3 w-3 mr-1" />
              Hochladen
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs">
              <LinkIcon className="h-3 w-3 mr-1" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-2">
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                'hover:border-primary hover:bg-primary/5',
                isUploading && 'pointer-events-none opacity-50'
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Wird hochgeladen...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Klicken zum Hochladen
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    JPEG, PNG, GIF, WebP • Max. 5MB
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-2">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Button
                size="sm"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
              >
                OK
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Externe URL zu einem Bild eingeben
            </p>
          </TabsContent>
        </Tabs>
      )}

      {imageError && (
        <p className="text-xs text-destructive">
          Bild konnte nicht geladen werden
        </p>
      )}
    </div>
  )
}



