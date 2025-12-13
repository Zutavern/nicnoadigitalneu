'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { useUploadProgress } from '@/hooks/use-upload-progress'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DocumentViewerDialog } from '@/components/ui/document-viewer-dialog'
import {
  Upload,
  X,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
  File,
  Eye,
  RefreshCw,
  ImageIcon,
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
  /** Automatisch hochladen wenn uploadEndpoint gesetzt ist */
  autoUpload?: boolean
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
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  placeholder = 'Datei hochladen',
  description = 'PDF, JPG, PNG oder Word (max. 10MB)',
  disabled = false,
  autoUpload = true,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(value || null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { upload, progress, isUploading, error, reset } = useUploadProgress()

  // Sync with external value
  useEffect(() => {
    if (value !== undefined) {
      setSelectedFile(value)
    }
  }, [value])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setSelectedFile(file)
      setUploadComplete(false)
      onFileSelect?.(file)

      // Wenn ein Endpoint angegeben ist und autoUpload aktiv, direkt hochladen
      if (uploadEndpoint && autoUpload) {
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
      } else {
        // Ohne uploadEndpoint gilt die Datei als "hochgeladen" (lokal gespeichert)
        setUploadComplete(true)
      }
    },
    [upload, uploadEndpoint, uploadData, onFileSelect, onUpload, autoUpload]
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

  const handleReplace = useCallback(() => {
    // Reset file and trigger file picker
    setSelectedFile(null)
    setUploadComplete(false)
    reset()
  }, [reset])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    const name = file.name.toLowerCase()
    
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return <FileText className="h-10 w-10 text-red-500" />
    }
    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/.test(name)) {
      return <ImageIcon className="h-10 w-10 text-green-500" />
    }
    if (type === 'application/msword' || 
        type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        name.endsWith('.doc') || name.endsWith('.docx')) {
      return <FileText className="h-10 w-10 text-blue-500" />
    }
    return <File className="h-10 w-10 text-muted-foreground" />
  }

  const getFileTypeLabel = (file: File): string => {
    const type = file.type
    const name = file.name.toLowerCase()
    
    if (type === 'application/pdf' || name.endsWith('.pdf')) return 'PDF'
    if (type === 'image/jpeg' || name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'JPEG'
    if (type === 'image/png' || name.endsWith('.png')) return 'PNG'
    if (name.endsWith('.docx')) return 'DOCX'
    if (name.endsWith('.doc')) return 'DOC'
    return 'Datei'
  }

  // Während des Uploads
  if (isUploading) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="p-5 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {selectedFile?.name}
              </p>
              <div className="mt-2 space-y-1">
                <Progress 
                  value={progress} 
                  className="h-2 bg-white/10"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400">Wird hochgeladen...</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fehler beim Upload
  if (error) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="p-5 rounded-xl border-2 border-dashed border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400">Upload fehlgeschlagen</p>
              <p className="text-xs text-red-400/70 mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Erneut
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Wenn eine Datei ausgewählt und hochgeladen ist
  if (selectedFile && uploadComplete) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-4">
            {/* File Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                {getFileIcon(selectedFile)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {selectedFile.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                  {getFileTypeLabel(selectedFile)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                onClick={() => setShowPreview(true)}
                title="Vorschau"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                onClick={handleRemove}
                title="Löschen"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Document Viewer Dialog */}
        <DocumentViewerDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          file={selectedFile}
          title={selectedFile.name}
        />
      </div>
    )
  }

  // Dropzone für neue Dateien
  return (
    <div className={cn('space-y-2', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-white/20 hover:border-emerald-500/50 hover:bg-white/5',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />

        <div className="space-y-3">
          {isDragActive ? (
            <>
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Upload className="h-6 w-6 text-emerald-400 animate-bounce" />
              </div>
              <p className="text-sm font-medium text-emerald-400">
                Datei hier ablegen...
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{placeholder}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Ziehen & Ablegen oder <span className="text-emerald-400 underline">klicken</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
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
