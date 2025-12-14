'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Upload,
  Loader2,
  Trash2,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FileImage,
  LayoutTemplate,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface PricelistBackground {
  id: string
  url: string
  filename: string
  sortOrder: number
  isActive: boolean
  type: string
  createdAt: string
}

export default function PricelistBackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<PricelistBackground[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PricelistBackground | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_ACTIVE = 6

  // Daten laden
  const fetchBackgrounds = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pricelist-backgrounds')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setBackgrounds(data.backgrounds)
      setActiveCount(data.activeCount)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Laden der Hintergründe')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBackgrounds()
  }, [fetchBackgrounds])

  // Drag & Drop Handler
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
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(f => 
      ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type)
    )
    
    if (imageFiles.length === 0) {
      toast.error('Bitte nur Bilddateien (PNG, JPG, WebP) hochladen')
      return
    }

    for (const file of imageFiles) {
      await uploadFile(file)
    }
  }, [])

  // File Upload
  const uploadFile = async (file: File) => {
    // Validierung
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Nur PNG, JPG und WebP Dateien erlaubt')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('Datei darf maximal 5MB groß sein')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simuliere Progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 100)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/pricelist-backgrounds', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload fehlgeschlagen')
      }

      toast.success(`"${file.name}" erfolgreich hochgeladen`)
      await fetchBackgrounds()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Hochladen')
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => uploadFile(file))
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Toggle Aktivierung
  const toggleActive = async (bg: PricelistBackground) => {
    // Prüfe Limit
    if (!bg.isActive && activeCount >= MAX_ACTIVE) {
      toast.error(`Maximal ${MAX_ACTIVE} Hintergründe können gleichzeitig aktiv sein`)
      return
    }

    setTogglingId(bg.id)

    try {
      const res = await fetch(`/api/admin/pricelist-backgrounds/${bg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !bg.isActive }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler')
      }

      await fetchBackgrounds()
      toast.success(bg.isActive ? 'Hintergrund deaktiviert' : 'Hintergrund aktiviert')
    } catch (error) {
      console.error('Toggle error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Ändern')
    } finally {
      setTogglingId(null)
    }
  }

  // Löschen
  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      const res = await fetch(`/api/admin/pricelist-backgrounds/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler')
      }

      toast.success('Hintergrund gelöscht')
      await fetchBackgrounds()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-primary" />
            Preislisten-Hintergründe
          </h1>
          <p className="text-muted-foreground">
            Verwalte die Hintergrund-Templates für Preislisten (A4 Hochformat)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBackgrounds}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Status-Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileImage className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Aktive Hintergründe</p>
                <p className="text-sm text-muted-foreground">
                  {activeCount} von {MAX_ACTIVE} aktiv
                </p>
              </div>
            </div>
            <div className="w-32">
              <Progress value={(activeCount / MAX_ACTIVE) * 100} className="h-2" />
            </div>
          </div>
          {activeCount >= MAX_ACTIVE && (
            <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Maximum erreicht. Deaktiviere einen Hintergrund, um einen neuen zu aktivieren.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload-Zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Card
        className={cn(
          'cursor-pointer border-2 border-dashed transition-all',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
        )}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="w-full">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">Wird hochgeladen...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {isDragging ? (
                  <Upload className="h-7 w-7 text-primary animate-bounce" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-primary" />
                )}
              </div>
              <p className="font-medium text-lg mb-1">
                {isDragging ? 'Dateien hier ablegen' : 'Hintergründe hochladen'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                PNG, JPG oder WebP • Max. 5MB • A4 Hochformat empfohlen (2480 × 3508 px)
              </p>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
                <Upload className="h-4 w-4 mr-2" />
                Dateien auswählen
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Hintergrund-Grid */}
      {backgrounds.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Noch keine Hintergründe</p>
            <p className="text-muted-foreground">
              Lade Hintergrund-Bilder hoch, um Preislisten-Templates zu erstellen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {backgrounds.map((bg, index) => (
              <motion.div
                key={bg.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className={cn(
                  'group relative overflow-hidden transition-all',
                  bg.isActive && 'ring-2 ring-primary ring-offset-2'
                )}>
                  {/* A4 Vorschau (Hochformat) */}
                  <div className="relative aspect-[210/297] bg-muted">
                    <img
                      src={bg.url}
                      alt={bg.filename}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Aktiv Badge */}
                    {bg.isActive && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-primary text-primary-foreground shadow-lg">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Aktiv
                        </Badge>
                      </div>
                    )}

                    {/* Overlay mit Aktionen */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setDeleteTarget(bg)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Info & Toggle */}
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={bg.filename}>
                          {bg.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(bg.createdAt), { addSuffix: true, locale: de })}
                        </p>
                      </div>
                      <Switch
                        checked={bg.isActive}
                        onCheckedChange={() => toggleActive(bg)}
                        disabled={togglingId === bg.id || (!bg.isActive && activeCount >= MAX_ACTIVE)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hintergrund löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du &quot;{deleteTarget?.filename}&quot; wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

