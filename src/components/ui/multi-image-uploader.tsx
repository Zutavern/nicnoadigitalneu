'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useUploadProgress } from '@/hooks/use-upload-progress'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  AlertCircle,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Check,
  Pencil,
  Sun,
  Contrast,
  Palette,
  RotateCcwIcon,
  Plus,
  Trash2,
} from 'lucide-react'

interface MultiImageUploaderProps {
  /** Array von Bild-URLs */
  value?: string[]
  /** Callback wenn sich die Bilder ändern */
  onChange: (urls: string[]) => void
  /** API-Endpoint für den Upload */
  uploadEndpoint: string
  /** Zusätzliche Daten für den Upload */
  uploadData?: Record<string, string>
  /** Akzeptierte Dateitypen */
  accept?: Record<string, string[]>
  /** Maximale Dateigröße in Bytes */
  maxSize?: number
  /** Maximale Anzahl an Bildern */
  maxImages?: number
  /** Aspekt-Ratio für Crop (z.B. 16/9) */
  aspectRatio?: number
  /** Filter anzeigen (Helligkeit, Kontrast, Sättigung) */
  showFilters?: boolean
  /** CSS-Klasse für Container */
  className?: string
  /** Platzhalter-Text */
  placeholder?: string
  /** Beschreibungstext */
  description?: string
}

interface Filters {
  brightness: number
  contrast: number
  saturation: number
}

const defaultFilters: Filters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export function MultiImageUploader({
  value = [],
  onChange,
  uploadEndpoint,
  uploadData,
  accept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxImages = 10,
  aspectRatio,
  showFilters = true,
  className,
  placeholder = 'Bilder hochladen',
  description = 'PNG, JPG, WebP (max. 10MB)',
}: MultiImageUploaderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const imgRef = useRef<HTMLImageElement>(null)
  const { upload, progress, isUploading, error, reset } = useUploadProgress()

  // Cleanup temp URL on unmount
  useEffect(() => {
    return () => {
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl)
      }
    }
  }, [tempImageUrl])

  // Aktiven Index anpassen wenn Bilder entfernt werden
  useEffect(() => {
    if (activeIndex >= value.length && value.length > 0) {
      setActiveIndex(value.length - 1)
    }
  }, [value.length, activeIndex])

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget
      const aspect = aspectRatio || 16 / 9
      setCrop(centerAspectCrop(width, height, aspect))
    },
    [aspectRatio]
  )

  const resetEditorState = useCallback(() => {
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setFilters(defaultFilters)
    setCrop(undefined)
  }, [])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      if (value.length >= maxImages) {
        return // Maximum erreicht
      }

      // Erstelle temporäre URL für Vorschau/Editor
      const objectUrl = URL.createObjectURL(file)
      setTempImageUrl(objectUrl)
      setEditingIndex(null) // Neues Bild
      resetEditorState()
      setShowEditor(true)
    },
    [value.length, maxImages, resetEditorState]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple: false,
      disabled: isUploading || value.length >= maxImages,
    })

  // Bestehendes Bild bearbeiten
  const handleEditImage = useCallback(async (index: number) => {
    const url = value[index]
    if (!url) return

    setEditingIndex(index)
    resetEditorState()

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      setTempImageUrl(objectUrl)
      setShowEditor(true)
    } catch (err) {
      console.error('Fehler beim Laden des Bildes:', err)
    }
  }, [value, resetEditorState])

  // Bild entfernen
  const handleRemoveImage = useCallback((index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
  }, [value, onChange])

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    if (!imgRef.current || !crop) return null

    const image = imgRef.current
    
    const pixelCrop = {
      x: (crop.x / 100) * image.naturalWidth,
      y: (crop.y / 100) * image.naturalHeight,
      width: (crop.width / 100) * image.naturalWidth,
      height: (crop.height / 100) * image.naturalHeight,
    }

    // Schritt 1: Erst das Bild croppen und transformieren
    const transformCanvas = document.createElement('canvas')
    const transformCtx = transformCanvas.getContext('2d')
    if (!transformCtx) return null

    transformCanvas.width = pixelCrop.width
    transformCanvas.height = pixelCrop.height

    transformCtx.save()
    transformCtx.translate(transformCanvas.width / 2, transformCanvas.height / 2)
    transformCtx.rotate((rotation * Math.PI) / 180)
    transformCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    transformCtx.translate(-transformCanvas.width / 2, -transformCanvas.height / 2)

    transformCtx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )
    transformCtx.restore()

    // Schritt 2: Filter anwenden
    const filterCanvas = document.createElement('canvas')
    const filterCtx = filterCanvas.getContext('2d')
    if (!filterCtx) return null

    filterCanvas.width = pixelCrop.width
    filterCanvas.height = pixelCrop.height

    filterCtx.filter = `brightness(${filters.brightness / 100}) contrast(${filters.contrast / 100}) saturate(${filters.saturation / 100})`
    filterCtx.drawImage(transformCanvas, 0, 0)

    return new Promise((resolve) => {
      filterCanvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        'image/jpeg',
        0.95
      )
    })
  }, [crop, rotation, flipH, flipV, filters])

  const handleEditorSave = useCallback(async () => {
    const blob = await getCroppedImg()
    if (!blob) return

    setShowEditor(false)

    const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' })

    try {
      const uploadResponse = await upload({
        endpoint: uploadEndpoint,
        file,
        additionalData: uploadData,
      })

      if (
        uploadResponse &&
        typeof uploadResponse === 'object' &&
        'url' in uploadResponse
      ) {
        const url = uploadResponse.url as string
        
        if (editingIndex !== null) {
          // Bestehendes Bild ersetzen
          const newUrls = [...value]
          newUrls[editingIndex] = url
          onChange(newUrls)
        } else {
          // Neues Bild hinzufügen
          onChange([...value, url])
          setActiveIndex(value.length) // Zum neuen Bild wechseln
        }
      }
    } catch {
      // Error wird im Hook behandelt
    }

    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl)
      setTempImageUrl(null)
    }
    setEditingIndex(null)
  }, [getCroppedImg, upload, uploadEndpoint, uploadData, onChange, value, editingIndex, tempImageUrl])

  const handleEditorClose = useCallback(() => {
    setShowEditor(false)
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl)
      setTempImageUrl(null)
    }
    setEditingIndex(null)
    reset()
  }, [tempImageUrl, reset])

  // Filter-Stil für Live-Vorschau
  const filterStyle = {
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`,
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Bild-Galerie */}
        {value.length > 0 && (
          <div className="space-y-3">
            {/* Hauptbild mit Navigation */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={value[activeIndex]}
                alt={`Bild ${activeIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              
              {/* Overlay mit Aktionen */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group">
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditImage(activeIndex)}
                    title="Bild bearbeiten"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemoveImage(activeIndex)}
                    title="Bild entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bild-Zähler */}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-xs">
                {activeIndex + 1} / {value.length}
              </div>
            </div>

            {/* Dot-Navigation */}
            {value.length > 1 && (
              <div className="flex items-center justify-center gap-2">
                {value.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all',
                      index === activeIndex
                        ? 'bg-primary w-6'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail-Leiste */}
            <div className="flex gap-2 flex-wrap">
              {value.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    index === activeIndex
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-muted-foreground/50'
                  )}
                >
                  <Image
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}

              {/* Neues Bild hinzufügen Button */}
              {value.length < maxImages && (
                <div
                  {...getRootProps()}
                  className={cn(
                    'w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all',
                    isDragActive
                      ? 'border-primary bg-primary/10'
                      : 'border-muted-foreground/30 hover:border-primary/50',
                    isUploading && 'pointer-events-none opacity-60'
                  )}
                >
                  <input {...getInputProps()} />
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leerer Zustand - Dropzone */}
        {value.length === 0 && (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
              isUploading && 'pointer-events-none opacity-60',
              error && 'border-destructive/50 bg-destructive/5'
            )}
          >
            <input {...getInputProps()} />

            {isUploading ? (
              <div className="space-y-3">
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Wird hochgeladen...</p>
                  <Progress value={progress} className="h-2 max-w-xs mx-auto" />
                  <p className="text-xs text-muted-foreground">{progress}%</p>
                </div>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <AlertCircle className="h-10 w-10 mx-auto text-destructive" />
                <p className="text-sm font-medium text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={reset}>
                  Erneut versuchen
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {isDragActive ? (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-primary animate-bounce" />
                    <p className="text-sm font-medium text-primary">
                      Datei hier ablegen...
                    </p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{placeholder}</p>
                      <p className="text-xs text-muted-foreground mt-1">{description}</p>
                      <p className="text-xs text-muted-foreground">
                        Ziehen & Ablegen oder klicken • Max. {maxImages} Bilder
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

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

      {/* Image Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={(open) => !open && handleEditorClose()}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Bild bearbeiten' : 'Neues Bild bearbeiten'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="crop" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="crop" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Zuschneiden & Drehen
              </TabsTrigger>
              {showFilters && (
                <TabsTrigger value="filters" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Filter & Anpassungen
                </TabsTrigger>
              )}
            </TabsList>

            {/* Crop Tab */}
            <TabsContent value="crop" className="space-y-4 mt-4">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => r - 90)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Links
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => r + 90)}
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  Rechts
                </Button>
                <Button
                  variant={flipH ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlipH((f) => !f)}
                >
                  <FlipHorizontal className="h-4 w-4 mr-1" />
                  Spiegeln H
                </Button>
                <Button
                  variant={flipV ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFlipV((f) => !f)}
                >
                  <FlipVertical className="h-4 w-4 mr-1" />
                  Spiegeln V
                </Button>
              </div>

              {tempImageUrl && (
                <div className="flex justify-center bg-muted/50 rounded-lg p-4">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    aspect={aspectRatio}
                    className="max-h-[50vh]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={tempImageUrl}
                      alt="Zu bearbeitendes Bild"
                      onLoad={onImageLoad}
                      style={{
                        transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                        maxHeight: '50vh',
                        width: 'auto',
                        ...filterStyle,
                      }}
                    />
                  </ReactCrop>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Ziehe die Ecken um den Bildausschnitt anzupassen
              </p>
            </TabsContent>

            {/* Filters Tab */}
            {showFilters && (
              <TabsContent value="filters" className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vorschau</Label>
                    {tempImageUrl && (
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tempImageUrl}
                          alt="Vorschau"
                          className="w-full h-full object-contain"
                          style={{
                            transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                            ...filterStyle,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Helligkeit
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {filters.brightness}%
                        </span>
                      </div>
                      <Slider
                        value={[filters.brightness]}
                        onValueChange={([v]) =>
                          setFilters((f) => ({ ...f, brightness: v }))
                        }
                        min={50}
                        max={150}
                        step={1}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Contrast className="h-4 w-4" />
                          Kontrast
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {filters.contrast}%
                        </span>
                      </div>
                      <Slider
                        value={[filters.contrast]}
                        onValueChange={([v]) =>
                          setFilters((f) => ({ ...f, contrast: v }))
                        }
                        min={50}
                        max={150}
                        step={1}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Sättigung
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {filters.saturation}%
                        </span>
                      </div>
                      <Slider
                        value={[filters.saturation]}
                        onValueChange={([v]) =>
                          setFilters((f) => ({ ...f, saturation: v }))
                        }
                        min={0}
                        max={200}
                        step={1}
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(defaultFilters)}
                      className="w-full"
                    >
                      <RotateCcwIcon className="h-4 w-4 mr-2" />
                      Filter zurücksetzen
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleEditorClose}>
              Abbrechen
            </Button>
            <Button onClick={handleEditorSave} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird hochgeladen...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Speichern & Hochladen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
