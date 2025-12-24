'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BLOCK_TYPE_CONFIGS, getSafeZone } from '@/lib/print-materials/types'
import type { PrintMaterialClient, PrintBlockClient } from '@/lib/print-materials/types'
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  Image as ImageIcon,
  Palette,
  Move,
  Maximize2,
  UploadCloud,
  X,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface BlockPropertiesPanelProps {
  block: PrintBlockClient | null
  material: PrintMaterialClient
  onBlockUpdate: (updates: Partial<PrintBlockClient>) => void
  onBlockDelete: () => void
  onBlockDuplicate: () => void
  className?: string
}

export function BlockPropertiesPanel({
  block,
  material,
  onBlockUpdate,
  onBlockDelete,
  onBlockDuplicate,
  className,
}: BlockPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('content')
  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = useCallback(async (file: File) => {
    setIsUploading(true)

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

      onBlockUpdate({ imageUrl: data.url })
      toast.success('Bild hochgeladen!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Hochladen')
    } finally {
      setIsUploading(false)
    }
  }, [onBlockUpdate])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadImage(acceptedFiles[0])
    }
  }, [uploadImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: isUploading,
  })

  if (!block) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        <p className="text-sm">Wähle einen Block aus, um ihn zu bearbeiten</p>
      </div>
    )
  }

  const blockConfig = BLOCK_TYPE_CONFIGS[block.type]
  const safeZone = getSafeZone(material)

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4 space-y-4">
        {/* Block-Typ Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Type className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{blockConfig.label}</h3>
              <p className="text-xs text-muted-foreground">{blockConfig.description}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBlockDuplicate}
              title="Duplizieren"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBlockDelete}
              title="Löschen"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Inhalt</TabsTrigger>
            <TabsTrigger value="style">Stil</TabsTrigger>
            <TabsTrigger value="position">Position</TabsTrigger>
          </TabsList>

          {/* Inhalt Tab */}
          <TabsContent value="content" className="space-y-4 mt-4">
            {/* Text-Inhalt */}
            {['TEXT', 'NAME', 'TAGLINE'].includes(block.type) && (
              <div className="space-y-2">
                <Label>Text</Label>
                <Textarea
                  value={block.content || ''}
                  onChange={(e) => onBlockUpdate({ content: e.target.value })}
                  placeholder={
                    block.type === 'NAME'
                      ? 'Ihr Name'
                      : block.type === 'TAGLINE'
                      ? 'Ihr Slogan'
                      : 'Text eingeben...'
                  }
                  rows={3}
                />
              </div>
            )}

            {/* Bild/Logo Upload */}
            {['LOGO', 'IMAGE'].includes(block.type) && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Bild
                </Label>

                {block.imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <div className="relative w-full h-24">
                      <Image
                        src={block.imageUrl}
                        alt="Block-Bild"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 rounded-full"
                      onClick={() => onBlockUpdate({ imageUrl: null })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={cn(
                      'flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                      'bg-muted/20 hover:bg-muted/30',
                      isDragActive ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <input {...getInputProps()} />
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <UploadCloud className="h-6 w-6 text-muted-foreground" />
                    )}
                    <p className="mt-1 text-xs text-muted-foreground text-center">
                      {isDragActive ? 'Hier ablegen...' : 'Bild hochladen oder reinziehen'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, WebP, SVG (max. 5MB)
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs">Oder URL eingeben</Label>
                  <Input
                    value={block.imageUrl || ''}
                    onChange={(e) => onBlockUpdate({ imageUrl: e.target.value || null })}
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

            {/* QR-Code */}
            {block.type === 'QR_CODE' && (
              <>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={block.qrCodeUrl || ''}
                    onChange={(e) => onBlockUpdate({ qrCodeUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label (optional)</Label>
                  <Input
                    value={block.qrCodeLabel || ''}
                    onChange={(e) => onBlockUpdate({ qrCodeLabel: e.target.value })}
                    placeholder="z.B. Jetzt buchen"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Größe: {block.qrCodeSize}mm</Label>
                  <Slider
                    value={[block.qrCodeSize]}
                    onValueChange={([v]) => onBlockUpdate({ qrCodeSize: v })}
                    min={10}
                    max={30}
                    step={1}
                  />
                </div>
              </>
            )}

            {/* Kontaktdaten */}
            {block.type === 'CONTACT_INFO' && (
              <>
                <div className="space-y-2">
                  <Label>Kontaktdaten</Label>
                  <Textarea
                    value={block.content || ''}
                    onChange={(e) => onBlockUpdate({ content: e.target.value })}
                    placeholder="Telefon\nE-Mail\nAdresse\nWebsite"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Eine Zeile pro Information
                  </p>
                </div>
                <div className="space-y-3">
                  <Label>Anzeigen</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Telefon</span>
                      <Switch
                        checked={block.showPhone}
                        onCheckedChange={(v) => onBlockUpdate({ showPhone: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">E-Mail</span>
                      <Switch
                        checked={block.showEmail}
                        onCheckedChange={(v) => onBlockUpdate({ showEmail: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Adresse</span>
                      <Switch
                        checked={block.showAddress}
                        onCheckedChange={(v) => onBlockUpdate({ showAddress: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Website</span>
                      <Switch
                        checked={block.showWebsite}
                        onCheckedChange={(v) => onBlockUpdate({ showWebsite: v })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Stil Tab */}
          <TabsContent value="style" className="space-y-4 mt-4">
            {/* Textausrichtung */}
            {['TEXT', 'NAME', 'TAGLINE', 'CONTACT_INFO'].includes(block.type) && (
              <div className="space-y-2">
                <Label>Ausrichtung</Label>
                <div className="flex gap-1">
                  {[
                    { value: 'left', icon: AlignLeft },
                    { value: 'center', icon: AlignCenter },
                    { value: 'right', icon: AlignRight },
                  ].map(({ value, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={block.textAlign === value ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => onBlockUpdate({ textAlign: value as any })}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Schriftgröße */}
            {['TEXT', 'NAME', 'TAGLINE'].includes(block.type) && (
              <div className="space-y-2">
                <Label>Schriftgröße: {block.fontSize}pt</Label>
                <Slider
                  value={[block.fontSize]}
                  onValueChange={([v]) => onBlockUpdate({ fontSize: v })}
                  min={6}
                  max={72}
                  step={1}
                />
              </div>
            )}

            {/* Schriftgewicht */}
            {['TEXT', 'NAME', 'TAGLINE'].includes(block.type) && (
              <div className="space-y-2">
                <Label>Schriftgewicht</Label>
                <Select
                  value={block.fontWeight}
                  onValueChange={(v) => onBlockUpdate({ fontWeight: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="semibold">Semibold</SelectItem>
                    <SelectItem value="bold">Fett</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Farbe */}
            <div className="space-y-2">
              <Label>Farbe</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={block.color}
                  onChange={(e) => onBlockUpdate({ color: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={block.color}
                  onChange={(e) => onBlockUpdate({ color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              {/* Schnellauswahl */}
              <div className="flex gap-1 mt-2">
                <button
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: material.primaryColor }}
                  onClick={() => onBlockUpdate({ color: material.primaryColor })}
                  title="Primärfarbe"
                />
                <button
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: material.secondaryColor }}
                  onClick={() => onBlockUpdate({ color: material.secondaryColor })}
                  title="Sekundärfarbe"
                />
                <button
                  className="w-6 h-6 rounded border bg-black"
                  onClick={() => onBlockUpdate({ color: '#000000' })}
                  title="Schwarz"
                />
                <button
                  className="w-6 h-6 rounded border bg-white"
                  onClick={() => onBlockUpdate({ color: '#ffffff' })}
                  title="Weiß"
                />
              </div>
            </div>

            {/* Bild-Optionen */}
            {['LOGO', 'IMAGE'].includes(block.type) && (
              <>
                <div className="space-y-2">
                  <Label>Einpassung</Label>
                  <Select
                    value={block.objectFit}
                    onValueChange={(v) => onBlockUpdate({ objectFit: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Einpassen</SelectItem>
                      <SelectItem value="cover">Ausfüllen</SelectItem>
                      <SelectItem value="fill">Strecken</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Eckenradius: {block.borderRadius}mm</Label>
                  <Slider
                    value={[block.borderRadius]}
                    onValueChange={([v]) => onBlockUpdate({ borderRadius: v })}
                    min={0}
                    max={20}
                    step={0.5}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Position Tab */}
          <TabsContent value="position" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>X (mm)</Label>
                <Input
                  type="number"
                  value={block.x.toFixed(1)}
                  onChange={(e) => {
                    const x = parseFloat(e.target.value)
                    if (!isNaN(x)) {
                      onBlockUpdate({
                        x: Math.max(0, Math.min(x, safeZone.width - block.width)),
                      })
                    }
                  }}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>Y (mm)</Label>
                <Input
                  type="number"
                  value={block.y.toFixed(1)}
                  onChange={(e) => {
                    const y = parseFloat(e.target.value)
                    if (!isNaN(y)) {
                      onBlockUpdate({
                        y: Math.max(0, Math.min(y, safeZone.height - block.height)),
                      })
                    }
                  }}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>Breite (mm)</Label>
                <Input
                  type="number"
                  value={block.width.toFixed(1)}
                  onChange={(e) => {
                    const width = parseFloat(e.target.value)
                    if (!isNaN(width) && width > 0) {
                      onBlockUpdate({
                        width: Math.min(width, safeZone.width - block.x),
                      })
                    }
                  }}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>Höhe (mm)</Label>
                <Input
                  type="number"
                  value={block.height.toFixed(1)}
                  onChange={(e) => {
                    const height = parseFloat(e.target.value)
                    if (!isNaN(height) && height > 0) {
                      onBlockUpdate({
                        height: Math.min(height, safeZone.height - block.y),
                      })
                    }
                  }}
                  step={0.5}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Drehung: {block.rotation}°</Label>
              <Slider
                value={[block.rotation]}
                onValueChange={([v]) => onBlockUpdate({ rotation: v })}
                min={-180}
                max={180}
                step={1}
              />
            </div>

            {/* Position-Schnellauswahl */}
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Schnell-Positionierung</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: '↖', x: 0, y: 0 },
                    { label: '↑', x: (safeZone.width - block.width) / 2, y: 0 },
                    { label: '↗', x: safeZone.width - block.width, y: 0 },
                    { label: '←', x: 0, y: (safeZone.height - block.height) / 2 },
                    { label: '⬤', x: (safeZone.width - block.width) / 2, y: (safeZone.height - block.height) / 2 },
                    { label: '→', x: safeZone.width - block.width, y: (safeZone.height - block.height) / 2 },
                    { label: '↙', x: 0, y: safeZone.height - block.height },
                    { label: '↓', x: (safeZone.width - block.width) / 2, y: safeZone.height - block.height },
                    { label: '↘', x: safeZone.width - block.width, y: safeZone.height - block.height },
                  ].map((pos) => (
                    <Button
                      key={pos.label}
                      variant="outline"
                      size="sm"
                      onClick={() => onBlockUpdate({ x: pos.x, y: pos.y })}
                    >
                      {pos.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}

