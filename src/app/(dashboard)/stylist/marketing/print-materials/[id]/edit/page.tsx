'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { createNewBlock, getSafeZone } from '@/lib/print-materials/types'
import type { PrintMaterialClient, PrintBlockClient } from '@/lib/print-materials/types'
import type { PrintBlockType, PrintSide } from '@prisma/client'
import {
  PrintCanvas,
  BlockPropertiesPanel,
  BlockToolbar,
  SideSwitcher,
  MaterialSettingsPanel,
} from '@/components/print-materials'
import {
  ArrowLeft,
  Save,
  Settings,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Loader2,
  Undo2,
  Redo2,
  Printer,
} from 'lucide-react'

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const DEFAULT_ZOOM = 1

export default function EditPrintMaterialPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [material, setMaterial] = useState<PrintMaterialClient | null>(null)
  const [blocks, setBlocks] = useState<PrintBlockClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [side, setSide] = useState<PrintSide>('FRONT')
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<'blocks' | 'settings'>('blocks')

  // Material und Blöcke laden
  const fetchMaterial = useCallback(async () => {
    try {
      const res = await fetch(`/api/print-materials/${id}`)
      if (!res.ok) throw new Error('Nicht gefunden')
      const data = await res.json()
      setMaterial(data.material)
      setBlocks(data.material.blocks || [])
    } catch (error) {
      toast.error('Drucksache nicht gefunden')
      router.push('/stylist/marketing/print-materials')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchMaterial()
  }, [fetchMaterial])

  // Ausgewählter Block
  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null

  // Block auswählen
  const handleBlockSelect = useCallback((blockId: string | null) => {
    setSelectedBlockId(blockId)
  }, [])

  // Block hinzufügen
  const handleAddBlock = useCallback(async (type: PrintBlockType) => {
    if (!material) return

    const sortOrder = blocks.filter(b => b.side === side).length

    try {
      const res = await fetch(`/api/print-materials/${id}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          side,
          sortOrder,
        }),
      })

      if (!res.ok) throw new Error('Fehler')

      const { block } = await res.json()
      setBlocks(prev => [...prev, block])
      setSelectedBlockId(block.id)
      toast.success('Element hinzugefügt')
    } catch (error) {
      toast.error('Fehler beim Hinzufügen')
    }
  }, [material, id, side, blocks])

  // Block aktualisieren
  const handleBlockUpdate = useCallback(async (updates: Partial<PrintBlockClient>) => {
    if (!selectedBlockId) return

    // Optimistisch aktualisieren
    setBlocks(prev =>
      prev.map(b =>
        b.id === selectedBlockId ? { ...b, ...updates } : b
      )
    )
    setHasUnsavedChanges(true)
  }, [selectedBlockId])

  // Block speichern
  const handleBlockSave = useCallback(async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    try {
      const res = await fetch(`/api/print-materials/${id}/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block),
      })

      if (!res.ok) throw new Error('Fehler')
    } catch (error) {
      toast.error('Fehler beim Speichern')
    }
  }, [id, blocks])

  // Block-Drag beenden
  const handleBlockDragEnd = useCallback(async (blockId: string, x: number, y: number) => {
    setBlocks(prev =>
      prev.map(b =>
        b.id === blockId ? { ...b, x, y } : b
      )
    )
    setHasUnsavedChanges(true)
  }, [])

  // Block löschen
  const handleBlockDelete = useCallback(async () => {
    if (!selectedBlockId) return

    try {
      const res = await fetch(`/api/print-materials/${id}/blocks/${selectedBlockId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Fehler')

      setBlocks(prev => prev.filter(b => b.id !== selectedBlockId))
      setSelectedBlockId(null)
      toast.success('Element gelöscht')
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }, [id, selectedBlockId])

  // Block duplizieren
  const handleBlockDuplicate = useCallback(async () => {
    if (!selectedBlockId || !material) return

    const block = blocks.find(b => b.id === selectedBlockId)
    if (!block) return

    try {
      const res = await fetch(`/api/print-materials/${id}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...block,
          id: undefined,
          x: block.x + 5,
          y: block.y + 5,
          sortOrder: blocks.filter(b => b.side === side).length,
        }),
      })

      if (!res.ok) throw new Error('Fehler')

      const { block: newBlock } = await res.json()
      setBlocks(prev => [...prev, newBlock])
      setSelectedBlockId(newBlock.id)
      toast.success('Element dupliziert')
    } catch (error) {
      toast.error('Fehler beim Duplizieren')
    }
  }, [id, selectedBlockId, blocks, material, side])

  // Material aktualisieren
  const handleMaterialUpdate = useCallback(async (updates: Partial<PrintMaterialClient>) => {
    if (!material) return

    setMaterial(prev => prev ? { ...prev, ...updates } : null)
    setHasUnsavedChanges(true)
  }, [material])

  // Alles speichern
  const handleSave = useCallback(async () => {
    if (!material) return

    setIsSaving(true)

    try {
      // Material speichern
      const materialRes = await fetch(`/api/print-materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: material.name,
          type: material.type,
          width: material.width,
          height: material.height,
          bleed: material.bleed,
          theme: material.theme,
          fontFamily: material.fontFamily,
          primaryColor: material.primaryColor,
          secondaryColor: material.secondaryColor,
          backgroundColor: material.backgroundColor,
          frontBackgroundUrl: material.frontBackgroundUrl,
          backBackgroundUrl: material.backBackgroundUrl,
        }),
      })

      if (!materialRes.ok) throw new Error('Fehler beim Speichern')

      // Alle Blöcke speichern
      for (const block of blocks) {
        if (block.isNew) continue // Neue Blöcke wurden schon erstellt

        await fetch(`/api/print-materials/${id}/blocks/${block.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(block),
        })
      }

      setHasUnsavedChanges(false)
      toast.success('Änderungen gespeichert')
    } catch (error) {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }, [id, material, blocks])

  // Zoom
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom)
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1])
    }
  }

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom)
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1])
    }
  }

  const handleZoomReset = () => {
    setZoom(DEFAULT_ZOOM)
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!material) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Toolbar */}
        <div className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/stylist/marketing/print-materials">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-purple-500" />
              <Input
                value={material.name}
                onChange={(e) => handleMaterialUpdate({ name: e.target.value })}
                className="h-8 w-48 bg-transparent border-none focus-visible:ring-1"
              />
            </div>

            {hasUnsavedChanges && (
              <span className="text-xs text-muted-foreground">Ungespeichert</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom */}
            <div className="flex items-center gap-1 border rounded-md px-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Verkleinern</TooltipContent>
              </Tooltip>

              <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vergrößern</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zurücksetzen</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Settings Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-96 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Einstellungen</SheetTitle>
                </SheetHeader>
                <MaterialSettingsPanel
                  material={material}
                  onMaterialUpdate={handleMaterialUpdate}
                />
              </SheetContent>
            </Sheet>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>

            <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Side Switcher & Block Toolbar */}
            <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/30">
              <SideSwitcher
                side={side}
                onSideChange={setSide}
              />
              <BlockToolbar
                onAddBlock={handleAddBlock}
              />
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto p-8 bg-muted/50 flex items-start justify-center">
              <div className="shadow-2xl rounded-lg overflow-hidden">
                <PrintCanvas
                  material={material}
                  blocks={blocks}
                  side={side}
                  zoom={zoom}
                  selectedBlockId={selectedBlockId}
                  onBlockSelect={handleBlockSelect}
                  onBlockUpdate={(blockId, updates) => {
                    setBlocks(prev =>
                      prev.map(b =>
                        b.id === blockId ? { ...b, ...updates } : b
                      )
                    )
                    setHasUnsavedChanges(true)
                  }}
                  onBlockDragEnd={handleBlockDragEnd}
                />
              </div>
            </div>

            {/* Info Footer */}
            <div className="h-8 border-t bg-muted/30 flex items-center justify-between px-4 text-xs text-muted-foreground">
              <span>
                {material.width} × {material.height} mm • Beschnitt: {material.bleed} mm
              </span>
              <span>
                {blocks.filter(b => b.side === side).length} Elemente auf dieser Seite
              </span>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 border-l bg-background flex flex-col">
            <div className="h-12 border-b flex items-center px-4">
              <span className="font-medium text-sm">
                {selectedBlock ? 'Element bearbeiten' : 'Eigenschaften'}
              </span>
            </div>
            <BlockPropertiesPanel
              block={selectedBlock}
              material={material}
              onBlockUpdate={handleBlockUpdate}
              onBlockDelete={handleBlockDelete}
              onBlockDuplicate={handleBlockDuplicate}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

