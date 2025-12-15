'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Move,
  Hand,
} from 'lucide-react'
import { PriceListPreview } from './pricelist-preview'
import type { PriceListClient, PriceBlockClient } from '@/lib/pricelist/types'

interface PreviewViewerProps {
  priceList: PriceListClient
  blocks: PriceBlockClient[]
  className?: string
}

// Zoom-Stufen
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
const DEFAULT_ZOOM_INDEX = 2 // 0.75

export function PreviewViewer({ priceList, blocks, className }: PreviewViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isPanMode, setIsPanMode] = useState(false)

  const zoom = ZOOM_LEVELS[zoomIndex]
  const zoomPercent = Math.round(zoom * 100)

  // Zoom In
  const handleZoomIn = useCallback(() => {
    setZoomIndex(prev => Math.min(prev + 1, ZOOM_LEVELS.length - 1))
  }, [])

  // Zoom Out
  const handleZoomOut = useCallback(() => {
    setZoomIndex(prev => Math.max(prev - 1, 0))
  }, [])

  // Reset View
  const handleReset = useCallback(() => {
    setZoomIndex(DEFAULT_ZOOM_INDEX)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Fit to Window
  const handleFitToWindow = useCallback(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const containerWidth = container.clientWidth - 48 // Padding
    const containerHeight = container.clientHeight - 48
    
    // A4 Größe
    const A4_WIDTH = 794
    const A4_HEIGHT = 1123
    
    const scaleX = containerWidth / A4_WIDTH
    const scaleY = containerHeight / A4_HEIGHT
    const fitScale = Math.min(scaleX, scaleY)
    
    // Finde nächsten Zoom-Level
    const closestIndex = ZOOM_LEVELS.reduce((closest, level, index) => {
      return Math.abs(level - fitScale) < Math.abs(ZOOM_LEVELS[closest] - fitScale) ? index : closest
    }, 0)
    
    setZoomIndex(closestIndex)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Pan Start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPanMode || e.button === 1) { // Middle mouse button or pan mode
      e.preventDefault()
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [isPanMode, position])

  // Pan Move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  // Pan End
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Wheel Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      if (e.deltaY < 0) {
        handleZoomIn()
      } else {
        handleZoomOut()
      }
    }
  }, [handleZoomIn, handleZoomOut])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        handleReset()
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPanMode(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsPanMode(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleZoomIn, handleZoomOut, handleReset])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-center gap-1 py-2 px-4 border-b bg-muted/30 backdrop-blur-sm">
        <TooltipProvider delayDuration={300}>
          {/* Zoom Out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
                disabled={zoomIndex === 0}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Verkleinern (−)</p>
            </TooltipContent>
          </Tooltip>

          {/* Zoom Level */}
          <div className="flex items-center gap-1 px-2 min-w-[80px] justify-center">
            <span className="text-sm font-medium tabular-nums">{zoomPercent}%</span>
          </div>

          {/* Zoom In */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomIn}
                disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Vergrößern (+)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-2" />

          {/* Fit to Window */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleFitToWindow}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>An Fenster anpassen</p>
            </TooltipContent>
          </Tooltip>

          {/* Reset */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Zurücksetzen (0)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-2" />

          {/* Pan Mode Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isPanMode ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsPanMode(!isPanMode)}
              >
                <Hand className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Verschieben (Leertaste halten)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Preview Container */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-hidden bg-muted/50',
          isPanMode ? 'cursor-grab' : 'cursor-default',
          isDragging && 'cursor-grabbing'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Centered Preview */}
        <div
          ref={contentRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {/* Drop Shadow Container */}
          <div
            className="relative"
            style={{
              filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.15)) drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
            }}
          >
            <PriceListPreview
              priceList={priceList}
              blocks={blocks}
              scale={zoom}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between py-1.5 px-4 border-t bg-muted/30 text-xs text-muted-foreground">
        <span>A4 • 210 × 297 mm</span>
        <span className="flex items-center gap-2">
          <Move className="h-3 w-3" />
          <span>Leertaste + Ziehen zum Verschieben</span>
          <span className="text-muted-foreground/50">•</span>
          <span>Strg/Cmd + Scrollen zum Zoomen</span>
        </span>
      </div>
    </div>
  )
}

