'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { useUploadProgress } from '@/hooks/use-upload-progress'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
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
  Video,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Gauge,
  Trash2,
  Eye,
} from 'lucide-react'

export interface VideoSettings {
  autoplay: boolean
  loop: boolean
  muted: boolean
  playbackSpeed: number
  overlay: number
}

const defaultSettings: VideoSettings = {
  autoplay: true,
  loop: true,
  muted: true,
  playbackSpeed: 1,
  overlay: 40,
}

interface VideoUploaderProps {
  /** Video-URL (wenn bereits hochgeladen) */
  value?: string | null
  /** Poster-Bild URL */
  posterUrl?: string | null
  /** Video-Einstellungen */
  settings?: Partial<VideoSettings>
  /** Callback wenn Video hochgeladen wird */
  onUpload: (url: string) => void
  /** Callback wenn Video entfernt wird */
  onRemove?: () => void
  /** Callback wenn Einstellungen geändert werden */
  onSettingsChange?: (settings: VideoSettings) => void
  /** API-Endpoint für den Upload */
  uploadEndpoint: string
  /** Zusätzliche Daten für den Upload */
  uploadData?: Record<string, string>
  /** Akzeptierte Dateitypen */
  accept?: Record<string, string[]>
  /** Maximale Dateigröße in Bytes (default: 100MB) */
  maxSize?: number
  /** CSS-Klasse für Container */
  className?: string
  /** Platzhalter-Text */
  placeholder?: string
  /** Beschreibungstext */
  description?: string
  /** Zeige Einstellungen */
  showSettings?: boolean
}

export function VideoUploader({
  value,
  posterUrl,
  settings: externalSettings,
  onUpload,
  onRemove,
  onSettingsChange,
  uploadEndpoint,
  uploadData,
  accept = {
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'video/quicktime': ['.mov'],
  },
  maxSize = 100 * 1024 * 1024, // 100MB
  className,
  placeholder = 'Video hochladen',
  description = 'MP4, WebM, MOV (max. 100MB)',
  showSettings = true,
}: VideoUploaderProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [settings, setSettings] = useState<VideoSettings>({
    ...defaultSettings,
    ...externalSettings,
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const { upload, progress, isUploading, error, reset } = useUploadProgress()

  // Sync external settings
  useEffect(() => {
    if (externalSettings) {
      setSettings((prev) => ({ ...prev, ...externalSettings }))
    }
  }, [externalSettings])

  // Notify parent of settings changes
  const updateSetting = useCallback(
    <K extends keyof VideoSettings>(key: K, value: VideoSettings[K]) => {
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)
      onSettingsChange?.(newSettings)
    },
    [settings, onSettingsChange]
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      try {
        const response = await upload({
          endpoint: uploadEndpoint,
          file,
          additionalData: uploadData,
        })

        if (response && typeof response === 'object' && 'url' in response) {
          const url = response.url as string
          onUpload(url)
        }
      } catch {
        // Error wird im Hook behandelt
      }
    },
    [upload, uploadEndpoint, uploadData, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple: false,
      disabled: isUploading,
    })

  // Toggle play/pause in preview
  const togglePlay = useCallback(() => {
    if (previewVideoRef.current) {
      if (isPlaying) {
        previewVideoRef.current.pause()
      } else {
        previewVideoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  // Apply playback speed
  useEffect(() => {
    if (previewVideoRef.current) {
      previewVideoRef.current.playbackRate = settings.playbackSpeed
    }
  }, [settings.playbackSpeed])

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Video Preview (wenn hochgeladen) */}
        {value && (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black group">
              <video
                ref={videoRef}
                src={value}
                poster={posterUrl || undefined}
                muted={settings.muted}
                loop={settings.loop}
                playsInline
                className="w-full h-full object-cover"
                onMouseEnter={() => {
                  if (settings.autoplay && videoRef.current) {
                    videoRef.current.play()
                  }
                }}
                onMouseLeave={() => {
                  if (videoRef.current) {
                    videoRef.current.pause()
                    videoRef.current.currentTime = 0
                  }
                }}
              />

              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black pointer-events-none"
                style={{ opacity: settings.overlay / 100 }}
              />

              {/* Hover Overlay mit Aktionen */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setShowPreview(true)}
                  title="Vorschau"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {onRemove && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={onRemove}
                    title="Video entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Video Icon Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs flex items-center gap-1">
                <Video className="h-3 w-3" />
                Video
              </div>

              {/* Play Indicator */}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-xs flex items-center gap-1">
                {settings.loop && <Repeat className="h-3 w-3" />}
                {settings.muted && <VolumeX className="h-3 w-3" />}
                {settings.autoplay && <Play className="h-3 w-3" />}
              </div>
            </div>

            {/* Einstellungen */}
            {showSettings && (
              <div className="p-4 rounded-lg border bg-muted/50 space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Video-Einstellungen
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="autoplay" className="text-sm flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5" />
                      Autoplay
                    </Label>
                    <Switch
                      id="autoplay"
                      checked={settings.autoplay}
                      onCheckedChange={(v) => updateSetting('autoplay', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="loop" className="text-sm flex items-center gap-1.5">
                      <Repeat className="h-3.5 w-3.5" />
                      Loop
                    </Label>
                    <Switch
                      id="loop"
                      checked={settings.loop}
                      onCheckedChange={(v) => updateSetting('loop', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="muted" className="text-sm flex items-center gap-1.5">
                      <VolumeX className="h-3.5 w-3.5" />
                      Stumm
                    </Label>
                    <Switch
                      id="muted"
                      checked={settings.muted}
                      onCheckedChange={(v) => updateSetting('muted', v)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5" />
                      Geschwindigkeit
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.playbackSpeed}x
                    </span>
                  </div>
                  <Slider
                    value={[settings.playbackSpeed]}
                    onValueChange={([v]) => updateSetting('playbackSpeed', v)}
                    min={0.5}
                    max={2}
                    step={0.25}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Abdunklung</Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.overlay}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.overlay]}
                    onValueChange={([v]) => updateSetting('overlay', v)}
                    min={0}
                    max={95}
                    step={5}
                  />
                </div>
              </div>
            )}

            {/* Neues Video hochladen */}
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50',
                isUploading && 'pointer-events-none opacity-60'
              )}
            >
              <input {...getInputProps()} />
              <p className="text-sm text-muted-foreground">
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Video wird hochgeladen... {progress}%
                  </span>
                ) : (
                  'Anderes Video hochladen (Drag & Drop oder klicken)'
                )}
              </p>
            </div>
          </div>
        )}

        {/* Dropzone (wenn kein Video) */}
        {!value && (
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
                  <p className="text-sm font-medium">Video wird hochgeladen...</p>
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
                      Video hier ablegen...
                    </p>
                  </>
                ) : (
                  <>
                    <Video className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{placeholder}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ziehen & Ablegen oder klicken
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
                  ? `Video zu groß (max. ${formatSize(maxSize)})`
                  : e.code === 'file-invalid-type'
                    ? 'Ungültiger Dateityp (nur MP4, WebM, MOV)'
                    : e.message}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Vollbild-Vorschau Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video-Vorschau
            </DialogTitle>
          </DialogHeader>

          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {value && (
              <video
                ref={previewVideoRef}
                src={value}
                poster={posterUrl || undefined}
                muted={settings.muted}
                loop={settings.loop}
                playsInline
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => !settings.loop && setIsPlaying(false)}
              />
            )}

            {/* Overlay Preview */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: `rgba(0,0,0,${settings.overlay / 100})`,
              }}
            />
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={togglePlay}>
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-1" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {isPlaying ? 'Pause' : 'Abspielen'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (previewVideoRef.current) {
                    previewVideoRef.current.currentTime = 0
                    previewVideoRef.current.play()
                    setIsPlaying(true)
                  }
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Neu starten
              </Button>
            </div>
            <Button variant="secondary" onClick={() => setShowPreview(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
