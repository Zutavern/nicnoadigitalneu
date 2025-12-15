'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { 
  Crop as CropIcon, 
  Check, 
  X, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Plattform-Formate
const PLATFORM_FORMATS = {
  INSTAGRAM: [
    { key: 'feed_square', label: 'Feed 1:1', ratio: 1 },
    { key: 'feed_portrait', label: 'Feed 4:5', ratio: 4/5 },
    { key: 'feed_landscape', label: 'Feed 1.91:1', ratio: 1.91 },
    { key: 'story', label: 'Story 9:16', ratio: 9/16 },
  ],
  FACEBOOK: [
    { key: 'feed', label: 'Feed 1.91:1', ratio: 1.91 },
    { key: 'square', label: 'Quadrat 1:1', ratio: 1 },
    { key: 'story', label: 'Story 9:16', ratio: 9/16 },
  ],
  LINKEDIN: [
    { key: 'post', label: 'Post 1.91:1', ratio: 1.91 },
    { key: 'square', label: 'Quadrat 1:1', ratio: 1 },
  ],
  TWITTER: [
    { key: 'post', label: 'Tweet 16:9', ratio: 16/9 },
    { key: 'post_wide', label: 'Tweet 2:1', ratio: 2 },
    { key: 'square', label: 'Quadrat 1:1', ratio: 1 },
  ],
  TIKTOK: [
    { key: 'post', label: 'Post 9:16', ratio: 9/16 },
  ],
  YOUTUBE: [
    { key: 'community', label: 'Community 16:9', ratio: 16/9 },
    { key: 'thumbnail', label: 'Thumbnail 16:9', ratio: 16/9 },
  ],
}

interface ImageCropperProps {
  imageUrl: string
  platforms: string[]
  onCropComplete: (croppedUrl: string, platform: string, format: string) => void
  onCancel?: () => void
  className?: string
}

export function ImageCropper({
  imageUrl,
  platforms,
  onCropComplete,
  onCancel,
  className,
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0] || 'INSTAGRAM')
  const [selectedFormat, setSelectedFormat] = useState('feed_square')
  const [scale, setScale] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Verfügbare Formate für aktuelle Plattform
  const availableFormats = PLATFORM_FORMATS[selectedPlatform as keyof typeof PLATFORM_FORMATS] || []
  const currentFormat = availableFormats.find(f => f.key === selectedFormat) || availableFormats[0]
  
  // Initial Crop setzen wenn Bild geladen
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    
    const cropConfig = makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      currentFormat?.ratio || 1,
      width,
      height
    )
    
    setCrop(centerCrop(cropConfig, width, height))
  }, [currentFormat?.ratio])
  
  // Format wechseln
  const handleFormatChange = (formatKey: string) => {
    setSelectedFormat(formatKey)
    const newFormat = availableFormats.find(f => f.key === formatKey)
    
    if (imgRef.current && newFormat) {
      const { width, height } = imgRef.current
      const cropConfig = makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        newFormat.ratio,
        width,
        height
      )
      setCrop(centerCrop(cropConfig, width, height))
    }
  }
  
  // Plattform wechseln
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform)
    const formats = PLATFORM_FORMATS[platform as keyof typeof PLATFORM_FORMATS]
    if (formats?.length) {
      setSelectedFormat(formats[0].key)
      handleFormatChange(formats[0].key)
    }
  }
  
  // Crop zurücksetzen
  const resetCrop = () => {
    if (imgRef.current && currentFormat) {
      const { width, height } = imgRef.current
      const cropConfig = makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        currentFormat.ratio,
        width,
        height
      )
      setCrop(centerCrop(cropConfig, width, height))
    }
    setScale(1)
  }
  
  // Crop anwenden
  const applyCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error('Bitte wähle einen Bereich aus')
      return
    }
    
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/social/media/crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          platform: selectedPlatform,
          format: selectedFormat,
          cropArea: {
            x: completedCrop.x,
            y: completedCrop.y,
            width: completedCrop.width,
            height: completedCrop.height,
          },
        }),
      })
      
      if (!response.ok) {
        throw new Error('Crop fehlgeschlagen')
      }
      
      const data = await response.json()
      
      onCropComplete(data.result.url, selectedPlatform, selectedFormat)
      toast.success('Bild zugeschnitten!')
    } catch (error) {
      console.error('Crop error:', error)
      toast.error('Fehler beim Zuschneiden')
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CropIcon className="h-4 w-4" />
            Bild zuschneiden
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Plattform & Format Auswahl */}
        <div className="flex gap-2">
          {platforms.length > 1 && (
            <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Select value={selectedFormat} onValueChange={handleFormatChange}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableFormats.map(f => (
                <SelectItem key={f.key} value={f.key}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Crop Area */}
        <div className="relative bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
          {imageUrl ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={currentFormat?.ratio}
              className="max-h-[400px]"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop"
                style={{ transform: `scale(${scale})` }}
                onLoad={onImageLoad}
                className="max-w-full max-h-[400px] object-contain"
              />
            </ReactCrop>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8" />
              <span>Kein Bild ausgewählt</span>
            </div>
          )}
        </div>
        
        {/* Zoom Control */}
        <div className="flex items-center gap-3">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[scale]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([v]) => setScale(v)}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary">{Math.round(scale * 100)}%</Badge>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetCrop} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
          <Button 
            onClick={applyCrop} 
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            disabled={isProcessing || !imageUrl}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Anwenden
          </Button>
        </div>
        
        {/* Format Info */}
        {currentFormat && (
          <p className="text-xs text-muted-foreground text-center">
            Zielgröße: {currentFormat.label} ({currentFormat.ratio.toFixed(2)})
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default ImageCropper

