'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PaddingHandlesProps {
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  onChange: (padding: {
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
  }) => void
  scale: number
  containerWidth: number
  containerHeight: number
  children: React.ReactNode
  className?: string
}

// A4 in mm
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

export function PaddingHandles({
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  onChange,
  scale,
  containerWidth,
  containerHeight,
  children,
  className,
}: PaddingHandlesProps) {
  const [isDragging, setIsDragging] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null)
  const [showHandles, setShowHandles] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startPadding = useRef({ top: 0, bottom: 0, left: 0, right: 0 })

  // Pixel zu mm Konvertierung basierend auf der Skalierung
  const pxToMm = useCallback((px: number) => {
    // Bei scale=1 ist 1mm = 3.78px (96 DPI)
    const pxPerMm = 3.78 * scale
    return Math.round(px / pxPerMm)
  }, [scale])

  // mm zu Pixel Konvertierung
  const mmToPx = useCallback((mm: number) => {
    const pxPerMm = 3.78 * scale
    return mm * pxPerMm
  }, [scale])

  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    edge: 'top' | 'bottom' | 'left' | 'right'
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(edge)
    startPos.current = { x: e.clientX, y: e.clientY }
    startPadding.current = {
      top: paddingTop,
      bottom: paddingBottom,
      left: paddingLeft,
      right: paddingRight,
    }
  }, [paddingTop, paddingBottom, paddingLeft, paddingRight])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - startPos.current.x
    const deltaY = e.clientY - startPos.current.y

    switch (isDragging) {
      case 'top': {
        const deltaMm = pxToMm(deltaY)
        const newPadding = Math.max(0, Math.min(60, startPadding.current.top + deltaMm))
        onChange({ paddingTop: newPadding })
        break
      }
      case 'bottom': {
        const deltaMm = pxToMm(-deltaY)
        const newPadding = Math.max(0, Math.min(60, startPadding.current.bottom + deltaMm))
        onChange({ paddingBottom: newPadding })
        break
      }
      case 'left': {
        const deltaMm = pxToMm(deltaX)
        const newPadding = Math.max(0, Math.min(50, startPadding.current.left + deltaMm))
        onChange({ paddingLeft: newPadding })
        break
      }
      case 'right': {
        const deltaMm = pxToMm(-deltaX)
        const newPadding = Math.max(0, Math.min(50, startPadding.current.right + deltaMm))
        onChange({ paddingRight: newPadding })
        break
      }
    }
  }, [isDragging, onChange, pxToMm])

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Handle-Positionen berechnen
  const topHandleY = mmToPx(paddingTop)
  const bottomHandleY = containerHeight - mmToPx(paddingBottom)
  const leftHandleX = mmToPx(paddingLeft)
  const rightHandleX = containerWidth - mmToPx(paddingRight)

  return (
    <div 
      className={cn('relative', className)}
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => !isDragging && setShowHandles(false)}
    >
      {children}
      
      {/* Padding Visualization Overlay */}
      {(showHandles || isDragging) && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Padding Areas */}
          {/* Top */}
          <div 
            className="absolute left-0 right-0 top-0 bg-primary/10 border-b border-dashed border-primary/40"
            style={{ height: topHandleY }}
          />
          {/* Bottom */}
          <div 
            className="absolute left-0 right-0 bottom-0 bg-primary/10 border-t border-dashed border-primary/40"
            style={{ height: containerHeight - bottomHandleY }}
          />
          {/* Left */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-primary/10 border-r border-dashed border-primary/40"
            style={{ width: leftHandleX }}
          />
          {/* Right */}
          <div 
            className="absolute right-0 top-0 bottom-0 bg-primary/10 border-l border-dashed border-primary/40"
            style={{ width: containerWidth - rightHandleX }}
          />
        </div>
      )}

      {/* Drag Handles */}
      {(showHandles || isDragging) && (
        <>
          {/* Top Handle */}
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-16 h-3 cursor-ns-resize z-20',
              'flex items-center justify-center group',
              isDragging === 'top' && 'z-30'
            )}
            style={{ top: topHandleY - 6 }}
            onMouseDown={(e) => handleMouseDown(e, 'top')}
          >
            <div className={cn(
              'w-10 h-1.5 rounded-full transition-all',
              isDragging === 'top' 
                ? 'bg-primary scale-110' 
                : 'bg-primary/60 group-hover:bg-primary group-hover:scale-110'
            )} />
            <span className={cn(
              'absolute -top-5 text-[10px] font-mono bg-background/90 px-1 rounded',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              isDragging === 'top' && 'opacity-100'
            )}>
              {paddingTop}mm
            </span>
          </div>

          {/* Bottom Handle */}
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-16 h-3 cursor-ns-resize z-20',
              'flex items-center justify-center group',
              isDragging === 'bottom' && 'z-30'
            )}
            style={{ top: bottomHandleY - 6 }}
            onMouseDown={(e) => handleMouseDown(e, 'bottom')}
          >
            <div className={cn(
              'w-10 h-1.5 rounded-full transition-all',
              isDragging === 'bottom' 
                ? 'bg-primary scale-110' 
                : 'bg-primary/60 group-hover:bg-primary group-hover:scale-110'
            )} />
            <span className={cn(
              'absolute -bottom-5 text-[10px] font-mono bg-background/90 px-1 rounded',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              isDragging === 'bottom' && 'opacity-100'
            )}>
              {paddingBottom}mm
            </span>
          </div>

          {/* Left Handle */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-3 h-16 cursor-ew-resize z-20',
              'flex items-center justify-center group',
              isDragging === 'left' && 'z-30'
            )}
            style={{ left: leftHandleX - 6 }}
            onMouseDown={(e) => handleMouseDown(e, 'left')}
          >
            <div className={cn(
              'w-1.5 h-10 rounded-full transition-all',
              isDragging === 'left' 
                ? 'bg-primary scale-110' 
                : 'bg-primary/60 group-hover:bg-primary group-hover:scale-110'
            )} />
            <span className={cn(
              'absolute -left-6 text-[10px] font-mono bg-background/90 px-1 rounded whitespace-nowrap',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              isDragging === 'left' && 'opacity-100'
            )}>
              {paddingLeft}mm
            </span>
          </div>

          {/* Right Handle */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-3 h-16 cursor-ew-resize z-20',
              'flex items-center justify-center group',
              isDragging === 'right' && 'z-30'
            )}
            style={{ left: rightHandleX - 6 }}
            onMouseDown={(e) => handleMouseDown(e, 'right')}
          >
            <div className={cn(
              'w-1.5 h-10 rounded-full transition-all',
              isDragging === 'right' 
                ? 'bg-primary scale-110' 
                : 'bg-primary/60 group-hover:bg-primary group-hover:scale-110'
            )} />
            <span className={cn(
              'absolute -right-6 text-[10px] font-mono bg-background/90 px-1 rounded whitespace-nowrap',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              isDragging === 'right' && 'opacity-100'
            )}>
              {paddingRight}mm
            </span>
          </div>
        </>
      )}
    </div>
  )
}

