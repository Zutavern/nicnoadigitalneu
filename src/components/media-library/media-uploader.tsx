'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { MediaCategory } from '@prisma/client'
import type { MediaFileWithUsage } from '@/lib/media'
import { UploadCloud, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  result?: MediaFileWithUsage
}

interface MediaUploaderProps {
  category?: MediaCategory
  context?: string
  onUploadComplete?: (files: MediaFileWithUsage[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  accept?: string[]
  className?: string
}

export function MediaUploader({
  category,
  context,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10,
  accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'],
  className,
}: MediaUploaderProps) {
  const [uploads, setUploads] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File): Promise<MediaFileWithUsage | null> => {
    const formData = new FormData()
    formData.append('file', file)
    if (category) formData.append('category', category)
    if (context) formData.append('context', context)

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload fehlgeschlagen')
      }

      return data.file
    } catch (error) {
      throw error
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      // Limit files
      const filesToUpload = acceptedFiles.slice(0, maxFiles)

      // Initialize upload state
      const initialUploads: UploadingFile[] = filesToUpload.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }))
      setUploads(initialUploads)
      setIsUploading(true)

      const uploadedFiles: MediaFileWithUsage[] = []

      // Upload files sequentially
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]

        // Update progress
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i ? { ...u, progress: 30 } : u
          )
        )

        try {
          const result = await uploadFile(file)

          setUploads((prev) =>
            prev.map((u, idx) =>
              idx === i
                ? { ...u, progress: 100, status: 'success', result: result! }
                : u
            )
          )

          if (result) {
            uploadedFiles.push(result)
          }
        } catch (error) {
          setUploads((prev) =>
            prev.map((u, idx) =>
              idx === i
                ? {
                    ...u,
                    progress: 100,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unbekannter Fehler',
                  }
                : u
            )
          )
        }
      }

      setIsUploading(false)

      if (uploadedFiles.length > 0) {
        toast.success(`${uploadedFiles.length} Datei${uploadedFiles.length > 1 ? 'en' : ''} hochgeladen`)
        onUploadComplete?.(uploadedFiles)
      }

      // Clear uploads after 3 seconds
      setTimeout(() => {
        setUploads([])
      }, 3000)
    },
    [category, context, maxFiles, onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxSize * 1024 * 1024,
    maxFiles,
    disabled: isUploading,
  })

  const clearUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all',
          'bg-muted/20 hover:bg-muted/30',
          isDragActive && 'border-primary bg-primary/5',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium">
            {isDragActive ? 'Dateien hier ablegen...' : 'Dateien hochladen'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Ziehe Dateien hierher oder klicke zum Auswählen
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Max. {maxSize}MB pro Datei • Bis zu {maxFiles} Dateien
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                upload.status === 'error' && 'bg-destructive/10',
                upload.status === 'success' && 'bg-green-500/10',
                upload.status === 'uploading' && 'bg-muted/30'
              )}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {upload.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                )}
                {upload.status === 'success' && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
                {upload.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                {upload.status === 'uploading' && (
                  <Progress value={upload.progress} className="h-1 mt-1" />
                )}
                {upload.status === 'error' && (
                  <p className="text-xs text-destructive mt-1">{upload.error}</p>
                )}
              </div>

              {/* Clear Button */}
              {upload.status !== 'uploading' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => clearUpload(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

