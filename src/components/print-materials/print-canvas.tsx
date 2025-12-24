'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { mmToPixel, getSafeZone, constrainToSafeZone } from '@/lib/print-materials/types'
import type { PrintMaterialClient, PrintBlockClient } from '@/lib/print-materials/types'
import { PrintBlockRenderer } from './print-block-renderer'

interface PrintCanvasProps {
  material: PrintMaterialClient
  blocks: PrintBlockClient[]
  side: 'FRONT' | 'BACK'
  zoom: number
  selectedBlockId: string | null
  onBlockSelect: (blockId: string | null) => void
  onBlockUpdate: (blockId: string, updates: Partial<PrintBlockClient>) => void
  onBlockDragEnd: (blockId: string, x: number, y: number) => void
  isEditing?: boolean
  className?: string
}

// DPI für Canvas-Darstellung
const CANVAS_DPI = 96

export function PrintCanvas({
  material,
  blocks,
  side,
  zoom,
  selectedBlockId,
  onBlockSelect,
  onBlockUpdate,
  onBlockDragEnd,
  isEditing = true,
  className,
}: PrintCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Dimensionen in Pixel berechnen
  const totalWidth = mmToPixel(material.width, CANVAS_DPI)
  const totalHeight = mmToPixel(material.height, CANVAS_DPI)
  const bleedPx = mmToPixel(material.bleed, CANVAS_DPI)
  const safeZone = getSafeZone(material)
  const safeZonePx = {
    width: mmToPixel(safeZone.width, CANVAS_DPI),
    height: mmToPixel(safeZone.height, CANVAS_DPI),
  }

  // Hintergrundbild für aktuelle Seite
  const backgroundUrl = side === 'FRONT' 
    ? material.frontBackgroundUrl 
    : material.backBackgroundUrl

  // Blöcke für aktuelle Seite filtern
  const sideBlocks = blocks.filter(b => b.side === side)

  // Click auf Canvas (außerhalb von Blöcken) -> Deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === e.currentTarget) {
      onBlockSelect(null)
    }
  }, [onBlockSelect])

  // Block-Drag starten
  const handleBlockDragStart = useCallback((
    blockId: string,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (!isEditing) return

    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    setIsDragging(true)
    onBlockSelect(blockId)

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    setDragStart({ x: clientX, y: clientY })
    setDragOffset({ x: 0, y: 0 })
  }, [blocks, isEditing, onBlockSelect])

  // Block-Drag bewegen
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !selectedBlockId) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const deltaX = (clientX - dragStart.x) / zoom
    const deltaY = (clientY - dragStart.y) / zoom

    setDragOffset({ x: deltaX, y: deltaY })
  }, [isDragging, selectedBlockId, dragStart, zoom])

  // Block-Drag beenden
  const handleMouseUp = useCallback(() => {
    if (!isDragging || !selectedBlockId) {
      setIsDragging(false)
      return
    }

    const block = blocks.find(b => b.id === selectedBlockId)
    if (!block) {
      setIsDragging(false)
      return
    }

    // Berechne neue Position in mm
    const deltaXMm = dragOffset.x / (CANVAS_DPI / 25.4)
    const deltaYMm = dragOffset.y / (CANVAS_DPI / 25.4)

    let newX = block.x + deltaXMm
    let newY = block.y + deltaYMm

    // Beschränke auf Safe-Zone
    const safeZone = getSafeZone(material)
    newX = Math.max(0, Math.min(newX, safeZone.width - block.width))
    newY = Math.max(0, Math.min(newY, safeZone.height - block.height))

    onBlockDragEnd(selectedBlockId, newX, newY)
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }, [isDragging, selectedBlockId, blocks, material, dragOffset, onBlockDragEnd])

  // Event Listeners für Drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMouseMove)
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      className={cn(
        'relative select-none',
        className
      )}
      style={{
        width: totalWidth * zoom,
        height: totalHeight * zoom,
      }}
    >
      {/* Gesamter Canvas mit Beschnitt */}
      <div
        ref={canvasRef}
        className="absolute inset-0 overflow-hidden"
        style={{
          backgroundColor: material.backgroundColor,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: totalWidth,
          height: totalHeight,
        }}
        onClick={handleCanvasClick}
      >
        {/* Hintergrundbild (geht über Beschnitt hinaus) */}
        {backgroundUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundUrl})`,
            }}
          />
        )}

        {/* Beschnitt-Bereich (Gefahrenzone) - Oben */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: bleedPx,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,0,0,0.1) 4px, rgba(255,0,0,0.1) 8px)',
          }}
        />
        {/* Beschnitt-Bereich (Gefahrenzone) - Unten */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: bleedPx,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,0,0,0.1) 4px, rgba(255,0,0,0.1) 8px)',
          }}
        />
        {/* Beschnitt-Bereich (Gefahrenzone) - Links */}
        <div
          className="absolute top-0 bottom-0 left-0 pointer-events-none"
          style={{
            width: bleedPx,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,0,0,0.1) 4px, rgba(255,0,0,0.1) 8px)',
          }}
        />
        {/* Beschnitt-Bereich (Gefahrenzone) - Rechts */}
        <div
          className="absolute top-0 bottom-0 right-0 pointer-events-none"
          style={{
            width: bleedPx,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,0,0,0.1) 4px, rgba(255,0,0,0.1) 8px)',
          }}
        />

        {/* Beschnittlinien */}
        <div
          className="absolute pointer-events-none border border-dashed border-red-400/60"
          style={{
            top: bleedPx,
            left: bleedPx,
            width: safeZonePx.width,
            height: safeZonePx.height,
          }}
        />

        {/* Safe Zone (Inhaltsbereich) */}
        <div
          className="absolute"
          style={{
            top: bleedPx,
            left: bleedPx,
            width: safeZonePx.width,
            height: safeZonePx.height,
          }}
        >
          {/* Blöcke rendern */}
          {sideBlocks.map((block) => {
            const blockX = mmToPixel(block.x, CANVAS_DPI)
            const blockY = mmToPixel(block.y, CANVAS_DPI)
            const blockWidth = mmToPixel(block.width, CANVAS_DPI)
            const blockHeight = mmToPixel(block.height, CANVAS_DPI)

            const isSelected = selectedBlockId === block.id
            const isDraggingThis = isDragging && isSelected

            // Position mit Drag-Offset
            const displayX = isDraggingThis ? blockX + dragOffset.x : blockX
            const displayY = isDraggingThis ? blockY + dragOffset.y : blockY

            return (
              <div
                key={block.id}
                className={cn(
                  'absolute cursor-move transition-shadow',
                  isSelected && 'ring-2 ring-primary ring-offset-1',
                  isDraggingThis && 'opacity-80'
                )}
                style={{
                  left: displayX,
                  top: displayY,
                  width: blockWidth,
                  height: blockHeight,
                  transform: block.rotation ? `rotate(${block.rotation}deg)` : undefined,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onBlockSelect(block.id)
                }}
                onMouseDown={(e) => handleBlockDragStart(block.id, e)}
                onTouchStart={(e) => handleBlockDragStart(block.id, e)}
              >
                <PrintBlockRenderer
                  block={block}
                  material={material}
                  isSelected={isSelected}
                />

                {/* Resize Handles (nur wenn ausgewählt und bearbeitbar) */}
                {isEditing && isSelected && !isDraggingThis && (
                  <>
                    {/* Ecke rechts unten */}
                    <div
                      className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary rounded-full cursor-se-resize border-2 border-background"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        // TODO: Resize-Logik implementieren
                      }}
                    />
                    {/* Ecke links unten */}
                    <div
                      className="absolute -left-1 -bottom-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize border-2 border-background"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        // TODO: Resize-Logik implementieren
                      }}
                    />
                    {/* Ecke rechts oben */}
                    <div
                      className="absolute -right-1 -top-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize border-2 border-background"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        // TODO: Resize-Logik implementieren
                      }}
                    />
                    {/* Ecke links oben */}
                    <div
                      className="absolute -left-1 -top-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize border-2 border-background"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        // TODO: Resize-Logik implementieren
                      }}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Eck-Markierungen (Crop Marks) */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={totalWidth}
          height={totalHeight}
        >
          {/* Oben links */}
          <line x1={0} y1={bleedPx} x2={bleedPx - 2} y2={bleedPx} stroke="#666" strokeWidth="0.5" />
          <line x1={bleedPx} y1={0} x2={bleedPx} y2={bleedPx - 2} stroke="#666" strokeWidth="0.5" />
          {/* Oben rechts */}
          <line x1={totalWidth - bleedPx + 2} y1={bleedPx} x2={totalWidth} y2={bleedPx} stroke="#666" strokeWidth="0.5" />
          <line x1={totalWidth - bleedPx} y1={0} x2={totalWidth - bleedPx} y2={bleedPx - 2} stroke="#666" strokeWidth="0.5" />
          {/* Unten links */}
          <line x1={0} y1={totalHeight - bleedPx} x2={bleedPx - 2} y2={totalHeight - bleedPx} stroke="#666" strokeWidth="0.5" />
          <line x1={bleedPx} y1={totalHeight} x2={bleedPx} y2={totalHeight - bleedPx + 2} stroke="#666" strokeWidth="0.5" />
          {/* Unten rechts */}
          <line x1={totalWidth - bleedPx + 2} y1={totalHeight - bleedPx} x2={totalWidth} y2={totalHeight - bleedPx} stroke="#666" strokeWidth="0.5" />
          <line x1={totalWidth - bleedPx} y1={totalHeight} x2={totalWidth - bleedPx} y2={totalHeight - bleedPx + 2} stroke="#666" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  )
}

