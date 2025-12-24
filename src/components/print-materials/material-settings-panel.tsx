'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  MATERIAL_TYPE_CONFIGS,
  THEME_CONFIGS,
  FONT_CONFIGS,
  BLEED_OPTIONS,
} from '@/lib/print-materials/types'
import type { PrintMaterialClient } from '@/lib/print-materials/types'
import type { PrintMaterialType } from '@prisma/client'
import {
  Palette,
  Type,
  Ruler,
  Image as ImageIcon,
  Upload,
  UploadCloud,
  X,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface MaterialSettingsPanelProps {
  material: PrintMaterialClient
  onMaterialUpdate: (updates: Partial<PrintMaterialClient>) => void
  onBackgroundUpload?: (side: 'FRONT' | 'BACK', file: File) => Promise<string>
  className?: string
}

export function MaterialSettingsPanel({
  material,
  onMaterialUpdate,
  onBackgroundUpload,
  className,
}: MaterialSettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('theme')
  const [isUploadingFront, setIsUploadingFront] = useState(false)
  const [isUploadingBack, setIsUploadingBack] = useState(false)

  const uploadImage = useCallback(async (file: File, side: 'FRONT' | 'BACK') => {
    const setSide = side === 'FRONT' ? setIsUploadingFront : setIsUploadingBack
    setSide(true)

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

      if (side === 'FRONT') {
        onMaterialUpdate({ frontBackgroundUrl: data.url })
      } else {
        onMaterialUpdate({ backBackgroundUrl: data.url })
      }
      toast.success('Hintergrundbild hochgeladen!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Hochladen')
    } finally {
      setSide(false)
    }
  }, [onMaterialUpdate])

  const onDropFront = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadImage(acceptedFiles[0], 'FRONT')
    }
  }, [uploadImage])

  const onDropBack = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadImage(acceptedFiles[0], 'BACK')
    }
  }, [uploadImage])

  const frontDropzone = useDropzone({
    onDrop: onDropFront,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: isUploadingFront,
  })

  const backDropzone = useDropzone({
    onDrop: onDropBack,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: isUploadingBack,
  })

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={material.name}
            onChange={(e) => onMaterialUpdate({ name: e.target.value })}
            placeholder="Meine Visitenkarte"
          />
        </div>

        <Separator />

        {/* Material-Typ */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Format
          </Label>
          <Select
            value={material.type}
            onValueChange={(v) => {
              const config = MATERIAL_TYPE_CONFIGS[v as PrintMaterialType]
              onMaterialUpdate({
                type: v as PrintMaterialType,
                width: config.width,
                height: config.height,
              })
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(MATERIAL_TYPE_CONFIGS).map((config) => (
                <SelectItem key={config.type} value={config.type}>
                  <div className="flex flex-col">
                    <span>{config.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {config.width} × {config.height} mm
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Benutzerdefinierte Größe */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Breite (mm)</Label>
              <Input
                type="number"
                value={material.width}
                onChange={(e) => {
                  const width = parseFloat(e.target.value)
                  if (!isNaN(width) && width > 0) {
                    onMaterialUpdate({ width })
                  }
                }}
                step={1}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Höhe (mm)</Label>
              <Input
                type="number"
                value={material.height}
                onChange={(e) => {
                  const height = parseFloat(e.target.value)
                  if (!isNaN(height) && height > 0) {
                    onMaterialUpdate({ height })
                  }
                }}
                step={1}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Beschnitt */}
        <div className="space-y-3">
          <Label>Beschnitt</Label>
          <RadioGroup
            value={String(material.bleed)}
            onValueChange={(v) => onMaterialUpdate({ bleed: parseFloat(v) })}
            className="flex gap-4"
          >
            {BLEED_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={String(option.value)} id={`bleed-${option.value}`} />
                <Label htmlFor={`bleed-${option.value}`} className="text-sm cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Der Beschnitt ist der Bereich außerhalb der Schnittlinie, der bei der Druckproduktion abgeschnitten wird.
          </p>
        </div>

        <Separator />

        {/* Theme */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Farbschema
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {THEME_CONFIGS.map((theme) => (
              <Card
                key={theme.id}
                className={cn(
                  'cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
                  material.theme === theme.id && 'ring-2 ring-primary'
                )}
                onClick={() =>
                  onMaterialUpdate({
                    theme: theme.id,
                    fontFamily: theme.fontFamily,
                    primaryColor: theme.primaryColor,
                    secondaryColor: theme.secondaryColor,
                    backgroundColor: theme.backgroundColor,
                  })
                }
              >
                <CardContent className="p-2">
                  <div
                    className="h-12 rounded-md mb-2"
                    style={{ background: theme.preview }}
                  />
                  <p className="text-xs font-medium text-center">{theme.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Farben */}
        <div className="space-y-3">
          <Label>Farben anpassen</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={material.primaryColor}
                onChange={(e) => onMaterialUpdate({ primaryColor: e.target.value })}
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <div className="flex-1">
                <Label className="text-xs">Primärfarbe</Label>
                <Input
                  value={material.primaryColor}
                  onChange={(e) => onMaterialUpdate({ primaryColor: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={material.secondaryColor}
                onChange={(e) => onMaterialUpdate({ secondaryColor: e.target.value })}
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <div className="flex-1">
                <Label className="text-xs">Sekundärfarbe</Label>
                <Input
                  value={material.secondaryColor}
                  onChange={(e) => onMaterialUpdate({ secondaryColor: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={material.backgroundColor}
                onChange={(e) => onMaterialUpdate({ backgroundColor: e.target.value })}
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <div className="flex-1">
                <Label className="text-xs">Hintergrundfarbe</Label>
                <Input
                  value={material.backgroundColor}
                  onChange={(e) => onMaterialUpdate({ backgroundColor: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Schriftart */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Schriftart
          </Label>
          <Select
            value={material.fontFamily}
            onValueChange={(v) => onMaterialUpdate({ fontFamily: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_CONFIGS.map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  <span style={{ fontFamily: font.family }}>{font.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Hintergrundbilder */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Hintergrundbilder
          </Label>

          {/* Vorderseite */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Vorderseite</Label>
            {material.frontBackgroundUrl ? (
              <div className="relative rounded-lg overflow-hidden border">
                <div className="relative w-full h-24">
                  <Image
                    src={material.frontBackgroundUrl}
                    alt="Vorderseite Hintergrund"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full"
                  onClick={() => onMaterialUpdate({ frontBackgroundUrl: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                {...frontDropzone.getRootProps()}
                className={cn(
                  'flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                  'bg-muted/20 hover:bg-muted/30',
                  frontDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <input {...frontDropzone.getInputProps()} />
                {isUploadingFront ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                )}
                <p className="mt-1 text-xs text-muted-foreground text-center">
                  {frontDropzone.isDragActive ? 'Hier ablegen...' : 'Bild hochladen'}
                </p>
              </div>
            )}
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
                <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="mt-2">
                <Input
                  value={material.frontBackgroundUrl || ''}
                  onChange={(e) => onMaterialUpdate({ frontBackgroundUrl: e.target.value || null })}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Rückseite */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Rückseite</Label>
            {material.backBackgroundUrl ? (
              <div className="relative rounded-lg overflow-hidden border">
                <div className="relative w-full h-24">
                  <Image
                    src={material.backBackgroundUrl}
                    alt="Rückseite Hintergrund"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full"
                  onClick={() => onMaterialUpdate({ backBackgroundUrl: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                {...backDropzone.getRootProps()}
                className={cn(
                  'flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                  'bg-muted/20 hover:bg-muted/30',
                  backDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <input {...backDropzone.getInputProps()} />
                {isUploadingBack ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                )}
                <p className="mt-1 text-xs text-muted-foreground text-center">
                  {backDropzone.isDragActive ? 'Hier ablegen...' : 'Bild hochladen'}
                </p>
              </div>
            )}
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
                <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="mt-2">
                <Input
                  value={material.backBackgroundUrl || ''}
                  onChange={(e) => onMaterialUpdate({ backBackgroundUrl: e.target.value || null })}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-xs text-muted-foreground">
            Hintergrundbilder werden über den Beschnitt hinaus platziert, um beim Druck keine weißen Ränder zu haben.
          </p>
        </div>
      </div>
    </ScrollArea>
  )
}

