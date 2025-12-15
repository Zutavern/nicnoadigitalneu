'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Plus, X } from 'lucide-react'
import type { PriceBlockClient, BlockType } from '@/lib/pricelist/types'
import { BLOCK_TYPE_CONFIGS } from '@/lib/pricelist/types'

// Blöcke die in Spalten eingefügt werden können (keine Container)
const ALLOWED_CHILD_BLOCKS: BlockType[] = [
  'SECTION_HEADER',
  'PRICE_ITEM',
  'TEXT',
  'DIVIDER',
  'SPACER',
  'IMAGE',
  'INFO_BOX',
  'BADGE',
  'QUOTE',
  'ICON_TEXT',
  'CONTACT_INFO',
  'SOCIAL_LINKS',
  'QR_CODE',
  'LOGO',
  'FOOTER',
]

interface ColumnContainerBlockProps {
  block: PriceBlockClient
  columnCount: 2 | 3
  isEditing: boolean
  priceListId: string
  pricingModel: string
  onUpdate: (updates: Partial<PriceBlockClient>) => void
  renderChildBlock?: (block: PriceBlockClient, isInColumn: boolean) => React.ReactNode
  onAddChildBlock?: (parentId: string, columnIndex: number, type: BlockType) => void
  onDeleteChildBlock?: (childBlockId: string) => void
  onReorderChildBlock?: (childBlockId: string, newColumnIndex: number, newSortOrder: number) => void
}

export function ColumnContainerBlock({
  block,
  columnCount,
  isEditing,
  priceListId,
  pricingModel,
  onUpdate,
  renderChildBlock,
  onAddChildBlock,
  onDeleteChildBlock,
  onReorderChildBlock,
}: ColumnContainerBlockProps) {
  // Spaltenbreiten als Prozent (default: gleichmäßig verteilt)
  const defaultWidths = columnCount === 2 ? [50, 50] : [33.33, 33.33, 33.34]
  const [columnWidths, setColumnWidths] = useState<number[]>(
    block.columnWidths || defaultWidths
  )
  const [isResizing, setIsResizing] = useState(false)
  const [resizeIndex, setResizeIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Blöcke nach Spalten gruppieren
  const getBlocksForColumn = (colIndex: number) => {
    return (block.childBlocks || [])
      .filter(b => b.columnIndex === colIndex)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  // Resize Handler
  const handleResizeStart = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeIndex(index)
  }

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || resizeIndex === null || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const mouseX = e.clientX - containerRect.left
    const percentage = (mouseX / containerWidth) * 100

    const newWidths = [...columnWidths]
    const minWidth = 20 // Minimale Spaltenbreite in %

    if (columnCount === 2) {
      // Für 2 Spalten: Nur ein Resize-Handle zwischen den Spalten
      const leftWidth = Math.max(minWidth, Math.min(100 - minWidth, percentage))
      newWidths[0] = leftWidth
      newWidths[1] = 100 - leftWidth
    } else {
      // Für 3 Spalten
      if (resizeIndex === 0) {
        // Resize zwischen Spalte 1 und 2
        const newLeftWidth = Math.max(minWidth, Math.min(100 - 2 * minWidth, percentage))
        const diff = newLeftWidth - newWidths[0]
        newWidths[0] = newLeftWidth
        newWidths[1] = Math.max(minWidth, newWidths[1] - diff)
      } else {
        // Resize zwischen Spalte 2 und 3
        const combinedWidth = newWidths[0] + newWidths[1]
        const newCombinedWidth = Math.max(newWidths[0] + minWidth, Math.min(100 - minWidth, percentage))
        newWidths[1] = newCombinedWidth - newWidths[0]
        newWidths[2] = 100 - newCombinedWidth
      }
    }

    setColumnWidths(newWidths)
  }, [isResizing, resizeIndex, columnWidths, columnCount])

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
    setResizeIndex(null)
    // Speichere die neuen Spaltenbreiten
    onUpdate({ columnWidths })
  }, [columnWidths, onUpdate])

  // Event Listener für Resize
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove)
      window.addEventListener('mouseup', handleResizeEnd)
      return () => {
        window.removeEventListener('mousemove', handleResizeMove)
        window.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  // Block zu einer Spalte hinzufügen
  const handleAddBlockToColumn = (columnIndex: number, type: BlockType) => {
    if (onAddChildBlock) {
      onAddChildBlock(block.id, columnIndex, type)
    }
  }

  // Render einer einzelnen Spalte
  const renderColumn = (columnIndex: number, width: number) => {
    const columnBlocks = getBlocksForColumn(columnIndex)

    return (
      <div
        key={columnIndex}
        className={cn(
          'relative flex flex-col',
          isEditing && 'min-h-[120px] border-2 border-dashed rounded-lg p-2 transition-colors',
          isEditing && columnBlocks.length === 0 && 'border-muted-foreground/30 bg-muted/20',
          isEditing && columnBlocks.length > 0 && 'border-primary/30 bg-primary/5'
        )}
        style={{ width: `${width}%` }}
      >
        {/* Spalten-Header (nur im Editor) */}
        {isEditing && (
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-muted-foreground/20">
            <span className="text-xs font-medium text-muted-foreground">
              Spalte {columnIndex + 1}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Block hinzufügen
                </div>
                <DropdownMenuSeparator />
                {ALLOWED_CHILD_BLOCKS.map((type) => {
                  const config = BLOCK_TYPE_CONFIGS[type]
                  return (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleAddBlockToColumn(columnIndex, type)}
                      className="cursor-pointer"
                    >
                      <span className="text-sm">{config.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Blöcke in der Spalte */}
        <div className="flex-1 space-y-2">
          {columnBlocks.length === 0 && isEditing && (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              Klicke + um Block hinzuzufügen
            </div>
          )}
          {columnBlocks.map((childBlock) => (
            <div key={childBlock.id} className="relative group">
              {isEditing && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => onDeleteChildBlock?.(childBlock.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {renderChildBlock ? renderChildBlock(childBlock, true) : (
                <div className="p-2 bg-background rounded text-xs">
                  {childBlock.type}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render Resize-Handle
  const renderResizeHandle = (index: number) => (
    <div
      key={`resize-${index}`}
      className={cn(
        'relative w-2 cursor-col-resize group flex items-center justify-center',
        'hover:bg-primary/20 transition-colors',
        isResizing && resizeIndex === index && 'bg-primary/30'
      )}
      onMouseDown={(e) => handleResizeStart(index, e)}
    >
      <div className={cn(
        'w-1 h-8 rounded-full bg-muted-foreground/30 group-hover:bg-primary/50 transition-colors',
        isResizing && resizeIndex === index && 'bg-primary'
      )} />
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full',
        isEditing && 'p-3 bg-muted/10 rounded-lg border border-muted-foreground/20'
      )}
    >
      {/* Header (nur im Editor) */}
      {isEditing && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b">
          <span className="text-sm font-medium text-muted-foreground">
            {columnCount === 2 ? 'Zweispaltiges' : 'Dreispaltiges'} Layout
          </span>
          <span className="text-xs text-muted-foreground">
            Ziehe die Trennlinien um Spaltenbreiten anzupassen
          </span>
        </div>
      )}

      {/* Spalten-Container */}
      <div className="flex w-full" style={{ userSelect: isResizing ? 'none' : 'auto' }}>
        {Array.from({ length: columnCount }).map((_, index) => (
          <React.Fragment key={`column-${index}`}>
            {renderColumn(index, columnWidths[index])}
            {index < columnCount - 1 && isEditing && renderResizeHandle(index)}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

