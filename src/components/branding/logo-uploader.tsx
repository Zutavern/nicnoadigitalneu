'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Upload,
  X,
  ImageIcon,
  Loader2,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoUploaderProps {
  type: 'platform' | 'salon' | 'stylist'
  currentLogoUrl?: string | null
  onUploadComplete?: (url: string) => void
  onDeleteComplete?: () => void
  className?: string
  label?: string
  description?: string
  maxSizeMB?: number
  aspectRatio?: 'square' | 'wide' | 'auto'
}

export function LogoUploader({
  type,
  currentLogoUrl,
  onUploadComplete,
  onDeleteComplete,
  className,
  label = 'Logo hochladen',
  description = 'PNG, JPG, SVG oder WebP (max. 2MB)',
  maxSizeMB = 2,
  aspectRatio = 'auto',
}: LogoUploaderProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      await uploadFile(files[0])
    }
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await uploadFile(files[0])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const uploadFile = async (file: File) => {
    // Validierung
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Nur SVG, PNG, JPG und WebP Dateien erlaubt')
      return
    }

    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`Datei darf maximal ${maxSizeMB}MB groß sein`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (logoUrl) {
        formData.append('oldUrl', logoUrl)
      }

      const response = await fetch('/api/upload/branding-logo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload fehlgeschlagen')
      }

      setLogoUrl(data.url)
      toast.success('Logo erfolgreich hochgeladen')
      onUploadComplete?.(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Hochladen')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!logoUrl) return

    setIsDeleting(true)

    try {
      const response = await fetch(
        `/api/upload/branding-logo?type=${type}&url=${encodeURIComponent(logoUrl)}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Löschen fehlgeschlagen')
      }

      setLogoUrl(null)
      toast.success('Logo gelöscht')
      onDeleteComplete?.()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
    }
  }

  const aspectClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    auto: '',
  }

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          {logoUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="ml-1.5">Entfernen</span>
            </Button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {logoUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <Card className="overflow-hidden">
              <CardContent className={cn(
                'p-4 flex items-center justify-center bg-muted/30 min-h-[120px]',
                aspectClasses[aspectRatio]
              )}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="max-h-24 max-w-full object-contain"
                />
              </CardContent>
            </Card>
            
            {/* Overlay for actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-1.5">Ersetzen</span>
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card
              className={cn(
                'cursor-pointer border-2 border-dashed transition-all',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className={cn(
                'flex flex-col items-center justify-center p-8 text-center min-h-[160px]',
                aspectClasses[aspectRatio]
              )}>
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Wird hochgeladen...</p>
                  </div>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      {isDragging ? (
                        <Upload className="h-6 w-6 text-primary animate-bounce" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <p className="font-medium text-sm mb-1">
                      {isDragging ? 'Datei hier ablegen' : 'Logo hochladen'}
                    </p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Datei auswählen
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

