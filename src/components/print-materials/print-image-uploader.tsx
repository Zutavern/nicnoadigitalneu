'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Image as ImageIcon, UploadCloud, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PrintImageUploaderProps {
  value?: string | null
  onUpload: (url: string) => void
  onRemove: () => void
  label?: string
  aspectRatio?: number
  placeholder?: string
  description?: string
  className?: string
  allowSvg?: boolean
}

export function PrintImageUploader({
  value,
  onUpload,
  onRemove,
  label = 'Bild',
  aspectRatio,
  placeholder = 'Bild hochladen oder reinziehen',
  description = 'JPEG, PNG, WebP (max. 5MB)',
  className,
  allowSvg = false,
}: PrintImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast.error('Keine Datei ausgewählt.')
        return
      }

      const file = acceptedFiles[0]
      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/print-materials/upload-image', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Fehler beim Upload')
        }

        onUpload(data.url)
        setUrlInput('')
        toast.success('Bild erfolgreich hochgeladen!')
      } catch (error) {
        console.error('Upload error:', error)
        toast.error(error instanceof Error ? error.message : 'Fehler beim Hochladen des Bildes.')
      } finally {
        setIsUploading(false)
      }
    },
    [onUpload]
  )

  const accept: Record<string, string[]> = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
  }
  
  if (allowSvg) {
    accept['image/svg+xml'] = ['.svg']
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: isUploading,
  })

  const handleUrlSave = () => {
    if (urlInput && urlInput.trim()) {
      onUpload(urlInput.trim())
      setUrlInput('')
      toast.success('Bild-URL gesetzt!')
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <Label className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          {label}
        </Label>
      )}

      {value ? (
        <div className="relative rounded-lg overflow-hidden border">
          <div 
            className="relative w-full h-32"
            style={aspectRatio ? { aspectRatio } : undefined}
          >
            <Image
              src={value}
              alt="Vorschau"
              fill
              className="object-contain bg-muted/20"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 rounded-full"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="upload" className="text-xs">Hochladen</TabsTrigger>
            <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-2">
            <div
              {...getRootProps()}
              className={cn(
                'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                'bg-muted/20 hover:bg-muted/30',
                isDragActive ? 'border-primary bg-primary/5' : 'border-border'
              )}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="mt-2 text-sm text-muted-foreground text-center">
                {isDragActive ? 'Hier ablegen...' : placeholder}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="mt-2 space-y-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button 
              onClick={handleUrlSave} 
              disabled={!urlInput.trim() || isUploading}
              className="w-full"
              size="sm"
            >
              URL verwenden
            </Button>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
