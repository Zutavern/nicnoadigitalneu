'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { useUploadProgress } from '@/hooks/use-upload-progress'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Upload,
  X,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
  File,
} from 'lucide-react'

interface FileUploaderProps {
  /** Aktuell gespeicherte Datei (Name für Anzeige) */
  value?: File | null
  /** Callback wenn eine Datei ausgewählt wurde (vor Upload) */
  onFileSelect?: (file: File) => void
  /** Callback wenn eine Datei hochgeladen wurde */
  onUpload?: (response: unknown) => void
  /** Callback wenn die Datei entfernt wird */
  onRemove?: () => void
  /** API-Endpoint für den Upload (optional - wenn nicht gesetzt, wird nur onFileSelect aufgerufen) */
  uploadEndpoint?: string
  /** Zusätzliche Daten für den Upload */
  uploadData?: Record<string, string>
  /** Akzeptierte Dateitypen */
  accept?: Record<string, string[]>
  /** Maximale Dateigröße in Bytes */
  maxSize?: number
  /** CSS-Klasse für Container */
  className?: string
  /** Platzhalter-Text */
  placeholder?: string
  /** Beschreibungstext */
  description?: string
  /** Deaktiviert die Komponente */
  disabled?: boolean
}

export function FileUploader({
  value,
  onFileSelect,
  onUpload,
  onRemove,
  uploadEndpoint,
  uploadData,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx',
    ],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  placeholder = 'Datei hochladen',
  description = 'PDF oder Word (max. 10MB)',
  disabled = false,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(value || null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const { upload, progress, isUploading, error, reset } = useUploadProgress()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setSelectedFile(file)
      setUploadComplete(false)
      onFileSelect?.(file)

      // Wenn ein Endpoint angegeben ist, direkt hochladen
      if (uploadEndpoint) {
        try {
          const response = await upload({
            endpoint: uploadEndpoint,
            file,
            additionalData: uploadData,
          })

          onUpload?.(response)
          setUploadComplete(true)
        } catch {
          // Error wird im Hook behandelt
        }
      }
    },
    [upload, uploadEndpoint, uploadData, onFileSelect, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple: false,
      disabled: disabled || isUploading,
    })

  const handleRemove = useCallback(() => {
    setSelectedFile(null)
    setUploadComplete(false)
    reset()
    onRemove?.()
  }, [reset, onRemove])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    if (
      file.type === 'application/msword' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return <FileText className="h-8 w-8 text-blue-500" />
    }
    return <File className="h-8 w-8 text-muted-foreground" />
  }

  // Wenn eine Datei ausgewählt ist und nicht gerade hochgeladen wird
  if (selectedFile && !isUploading && !error) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
          {getFileIcon(selectedFile)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
              {uploadComplete && (
                <span className="ml-2 text-green-600">
                  <CheckCircle2 className="h-3 w-3 inline mr-1" />
                  Hochgeladen
                </span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          (disabled || isUploading) && 'pointer-events-none opacity-60',
          error && 'border-destructive/50 bg-destructive/5'
        )}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Wird hochgeladen...</p>
              <Progress value={progress} className="h-2 max-w-xs mx-auto" />
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={reset}>
              Erneut versuchen
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {isDragActive ? (
              <>
                <Upload className="h-8 w-8 mx-auto text-primary animate-bounce" />
                <p className="text-sm font-medium text-primary">
                  Datei hier ablegen...
                </p>
              </>
            ) : (
              <>
                <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
                <p className="text-xs text-muted-foreground">
                  Ziehen & Ablegen oder klicken zum Auswählen
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="text-sm text-destructive">
          {fileRejections[0].errors.map((e) => (
            <p key={e.code}>
              {e.code === 'file-too-large'
                ? `Datei zu groß (max. ${Math.round(maxSize / 1024 / 1024)}MB)`
                : e.code === 'file-invalid-type'
                  ? 'Ungültiger Dateityp'
                  : e.message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}



