'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  FileText,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: File | null
  url?: string
  title?: string
}

export function DocumentViewerDialog({ 
  open, 
  onOpenChange, 
  file, 
  url,
  title 
}: DocumentViewerDialogProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [docxContent, setDocxContent] = useState<string | null>(null)

  // Create object URL for file
  useEffect(() => {
    if (file) {
      const newUrl = URL.createObjectURL(file)
      setObjectUrl(newUrl)
      setIsLoading(true)
      setDocxContent(null)
      
      // DOCX handling - convert to HTML
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.endsWith('.docx')) {
        convertDocxToHtml(file)
      }
      
      return () => URL.revokeObjectURL(newUrl)
    } else if (url) {
      setObjectUrl(url)
      setIsLoading(true)
    }
  }, [file, url])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setZoom(100)
      setRotation(0)
      setIsLoading(true)
    }
  }, [open])

  const convertDocxToHtml = async (file: File) => {
    try {
      // Dynamically import mammoth
      const mammoth = await import('mammoth')
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      setDocxContent(result.value)
      setIsLoading(false)
    } catch (error) {
      console.error('DOCX conversion error:', error)
      setDocxContent('<p class="text-red-500">Fehler beim Laden des Dokuments</p>')
      setIsLoading(false)
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  const handleDownload = () => {
    if (file) {
      const link = document.createElement('a')
      link.href = objectUrl || ''
      link.download = file.name
      link.click()
    } else if (url) {
      window.open(url, '_blank')
    }
  }

  const getFileType = (): 'pdf' | 'image' | 'docx' | 'unknown' => {
    if (!file && !url) return 'unknown'
    
    const fileName = file?.name || url || ''
    const mimeType = file?.type || ''
    
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'pdf'
    }
    if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      return 'image'
    }
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return 'docx'
    }
    return 'unknown'
  }

  const fileType = getFileType()

  const renderContent = () => {
    if (!objectUrl && !docxContent) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    switch (fileType) {
      case 'pdf':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-black/5">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <iframe
              src={`${objectUrl}#view=FitH`}
              className="w-full h-full border-0"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
              onLoad={() => setIsLoading(false)}
              title="PDF Viewer"
            />
          </div>
        )

      case 'image':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-auto bg-black/5 p-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <img
              src={objectUrl || ''}
              alt={title || 'Dokument'}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )

      case 'docx':
        return (
          <div className="relative w-full h-full overflow-auto bg-white p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Dokument wird konvertiert...</p>
              </div>
            ) : docxContent ? (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left'
                }}
                dangerouslySetInnerHTML={{ __html: docxContent }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Vorschau nicht verfügbar
                </p>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Dokument herunterladen
                </Button>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">
              Vorschau für diesen Dateityp nicht verfügbar
            </p>
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Dokument herunterladen
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 bg-background">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-base font-medium truncate flex-1 mr-4">
            {title || file?.name || 'Dokument'}
          </DialogTitle>
          
          {/* Controls */}
          <div className="flex items-center gap-1">
            {(fileType === 'pdf' || fileType === 'image') && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground w-12 text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRotate}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

