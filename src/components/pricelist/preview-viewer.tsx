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
  Square,
  Minus,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  LocateFixed,
} from 'lucide-react'
import { PriceListPreview } from './pricelist-preview'
import { PaddingHandles } from './padding-handles'
import type { PriceListClient, PriceBlockClient } from '@/lib/pricelist/types'

interface PreviewViewerProps {
  priceList: PriceListClient
  blocks: PriceBlockClient[]
  className?: string
  onPaddingChange?: (padding: {
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
  }) => void
  onContentScaleChange?: (scale: number) => void
  onContentOffsetChange?: (offset: { x: number; y: number }) => void
}

// Zoom-Stufen
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]
const DEFAULT_ZOOM_INDEX = 2 // 0.75

// Inhaltsskalierungs-Stufen
const CONTENT_SCALE_MIN = 0.5
const CONTENT_SCALE_MAX = 1.5
const CONTENT_SCALE_STEP = 0.1

// A4 in Pixeln bei 96 DPI
const A4_WIDTH = 794
const A4_HEIGHT = 1123

export function PreviewViewer({ 
  priceList, 
  blocks, 
  className, 
  onPaddingChange,
  onContentScaleChange,
  onContentOffsetChange,
}: PreviewViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isPanMode, setIsPanMode] = useState(false)
  const [isPaddingMode, setIsPaddingMode] = useState(false)

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

  // Inhalt vergrößern (mehr Scale)
  const handleContentIncrease = useCallback(() => {
    if (!onContentScaleChange) return
    const currentScale = priceList.contentScale ?? 1.0
    const newScale = Math.min(CONTENT_SCALE_MAX, currentScale + CONTENT_SCALE_STEP)
    onContentScaleChange(Math.round(newScale * 10) / 10) // Runden auf 1 Dezimalstelle
  }, [onContentScaleChange, priceList.contentScale])

  // Inhalt verkleinern (weniger Scale)
  const handleContentDecrease = useCallback(() => {
    if (!onContentScaleChange) return
    const currentScale = priceList.contentScale ?? 1.0
    const newScale = Math.max(CONTENT_SCALE_MIN, currentScale - CONTENT_SCALE_STEP)
    onContentScaleChange(Math.round(newScale * 10) / 10) // Runden auf 1 Dezimalstelle
  }, [onContentScaleChange, priceList.contentScale])

  // Offset-Schritt in mm
  const OFFSET_STEP = 2

  // Inhalt nach oben verschieben
  const handleMoveUp = useCallback(() => {
    if (!onContentOffsetChange) return
    const currentY = priceList.contentOffsetY ?? 0
    onContentOffsetChange({ 
      x: priceList.contentOffsetX ?? 0, 
      y: currentY - OFFSET_STEP 
    })
  }, [onContentOffsetChange, priceList.contentOffsetX, priceList.contentOffsetY])

  // Inhalt nach unten verschieben
  const handleMoveDown = useCallback(() => {
    if (!onContentOffsetChange) return
    const currentY = priceList.contentOffsetY ?? 0
    onContentOffsetChange({ 
      x: priceList.contentOffsetX ?? 0, 
      y: currentY + OFFSET_STEP 
    })
  }, [onContentOffsetChange, priceList.contentOffsetX, priceList.contentOffsetY])

  // Inhalt nach links verschieben
  const handleMoveLeft = useCallback(() => {
    if (!onContentOffsetChange) return
    const currentX = priceList.contentOffsetX ?? 0
    onContentOffsetChange({ 
      x: currentX - OFFSET_STEP, 
      y: priceList.contentOffsetY ?? 0 
    })
  }, [onContentOffsetChange, priceList.contentOffsetX, priceList.contentOffsetY])

  // Inhalt nach rechts verschieben
  const handleMoveRight = useCallback(() => {
    if (!onContentOffsetChange) return
    const currentX = priceList.contentOffsetX ?? 0
    onContentOffsetChange({ 
      x: currentX + OFFSET_STEP, 
      y: priceList.contentOffsetY ?? 0 
    })
  }, [onContentOffsetChange, priceList.contentOffsetX, priceList.contentOffsetY])

  // Position zurücksetzen
  const handleResetPosition = useCallback(() => {
    if (!onContentOffsetChange) return
    onContentOffsetChange({ x: 0, y: 0 })
  }, [onContentOffsetChange])

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

  // Scaled dimensions
  const scaledWidth = A4_WIDTH * zoom
  const scaledHeight = A4_HEIGHT * zoom

  const canInteract = !isPanMode && !isDragging

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
                disabled={isPaddingMode}
              >
                <Hand className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Verschieben (Leertaste)</p>
            </TooltipContent>
          </Tooltip>

          {/* Inhalt skalieren */}
          {onContentScaleChange && (
            <>
              <Separator orientation="vertical" className="h-5 mx-2" />

              {/* Inhalt verkleinern */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleContentDecrease}
                    disabled={(priceList.contentScale ?? 1) <= CONTENT_SCALE_MIN}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Inhalt verkleinern</p>
                </TooltipContent>
              </Tooltip>

              {/* Scale Anzeige */}
              <div className="flex items-center gap-1 px-1 min-w-[60px] justify-center">
                <span className="text-xs font-medium tabular-nums">
                  {Math.round((priceList.contentScale ?? 1) * 100)}%
                </span>
              </div>

              {/* Inhalt vergrößern */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleContentIncrease}
                    disabled={(priceList.contentScale ?? 1) >= CONTENT_SCALE_MAX}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Inhalt vergrößern</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Inhalt verschieben */}
          {onContentOffsetChange && (
            <>
              <Separator orientation="vertical" className="h-5 mx-2" />

              {/* Nach links */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleMoveLeft}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Inhalt nach links</p>
                </TooltipContent>
              </Tooltip>

              {/* Vertikale Buttons (oben/unten) */}
              <div className="flex flex-col -my-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-8"
                      onClick={handleMoveUp}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Inhalt nach oben</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-8"
                      onClick={handleMoveDown}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Inhalt nach unten</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Nach rechts */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleMoveRight}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Inhalt nach rechts</p>
                </TooltipContent>
              </Tooltip>

              {/* Position zurücksetzen */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleResetPosition}
                    disabled={(priceList.contentOffsetX ?? 0) === 0 && (priceList.contentOffsetY ?? 0) === 0}
                  >
                    <LocateFixed className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Position zurücksetzen</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Padding/Ränder */}
          {onPaddingChange && (
            <>
              {/* Padding Mode Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isPaddingMode ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5",
                      isPaddingMode && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      setIsPaddingMode(!isPaddingMode)
                      if (!isPaddingMode) {
                        setIsEditMode(false)
                        setIsPanMode(false)
                      }
                    }}
                  >
                    <Square className="h-4 w-4" />
                    <span className="text-xs font-medium">Ränder</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Seitenränder durch Ziehen anpassen</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </TooltipProvider>
      </div>

      {/* Preview Container */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-hidden bg-muted/50',
          !isPaddingMode && isPanMode ? 'cursor-grab' : 'cursor-default',
          !isPaddingMode && isDragging && 'cursor-grabbing'
        )}
        onMouseDown={!isPaddingMode ? handleMouseDown : undefined}
        onMouseMove={!isPaddingMode ? handleMouseMove : undefined}
        onMouseUp={!isPaddingMode ? handleMouseUp : undefined}
        onMouseLeave={!isPaddingMode ? handleMouseUp : undefined}
        onWheel={!isPaddingMode ? handleWheel : undefined}
      >
        {/* Centered Preview */}
        <div
          ref={contentRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transform: !isPaddingMode ? `translate(${position.x}px, ${position.y}px)` : undefined,
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
            {isPaddingMode && onPaddingChange ? (
              <PaddingHandles
                paddingTop={priceList.paddingTop ?? 20}
                paddingBottom={priceList.paddingBottom ?? 20}
                paddingLeft={priceList.paddingLeft ?? 15}
                paddingRight={priceList.paddingRight ?? 15}
                onChange={onPaddingChange}
                scale={zoom}
                containerWidth={scaledWidth}
                containerHeight={scaledHeight}
              >
                <PriceListPreview
                  priceList={priceList}
                  blocks={blocks}
                  scale={zoom}
                />
              </PaddingHandles>
            ) : (
              <PriceListPreview
                priceList={priceList}
                blocks={blocks}
                scale={zoom}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between py-1.5 px-4 border-t bg-muted/30 text-xs text-muted-foreground">
        <span>A4 • 210 × 297 mm</span>
        {isPaddingMode ? (
          <span className="flex items-center gap-2 text-primary">
            <Square className="h-3 w-3" />
            <span>Ziehe die Ränder zum Anpassen</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-muted-foreground">
              T: {priceList.paddingTop ?? 20}mm | 
              B: {priceList.paddingBottom ?? 20}mm | 
              L: {priceList.paddingLeft ?? 15}mm | 
              R: {priceList.paddingRight ?? 15}mm
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Move className="h-3 w-3" />
            <span>Leertaste + Ziehen zum Verschieben</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Strg/Cmd + Scrollen zum Zoomen</span>
          </span>
        )}
      </div>
    </div>
  )
}
