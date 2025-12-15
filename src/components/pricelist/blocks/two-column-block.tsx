'use client'

import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'

interface TwoColumnBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  renderChildBlock?: (block: PriceBlockClient) => React.ReactNode
}

export function TwoColumnBlock({ block, isEditing, renderChildBlock }: TwoColumnBlockProps) {
  const leftBlocks = block.childBlocks?.filter(b => b.columnIndex === 0) || []
  const rightBlocks = block.childBlocks?.filter(b => b.columnIndex === 1) || []

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground mb-2">Zweispaltiges Layout</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="min-h-[100px] border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 flex items-center justify-center">
            {leftBlocks.length > 0 ? (
              <div className="w-full space-y-2">
                {leftBlocks.map(childBlock => (
                  <div key={childBlock.id} className="text-xs bg-background p-2 rounded">
                    {renderChildBlock ? renderChildBlock(childBlock) : childBlock.type}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Spalte 1</span>
            )}
          </div>
          <div className="min-h-[100px] border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 flex items-center justify-center">
            {rightBlocks.length > 0 ? (
              <div className="w-full space-y-2">
                {rightBlocks.map(childBlock => (
                  <div key={childBlock.id} className="text-xs bg-background p-2 rounded">
                    {renderChildBlock ? renderChildBlock(childBlock) : childBlock.type}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Spalte 2</span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Blöcke per Drag & Drop in die Spalten ziehen
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className={cn('space-y-2', leftBlocks.length === 0 && 'min-h-[50px]')}>
        {leftBlocks.map(childBlock => (
          <div key={childBlock.id}>
            {renderChildBlock?.(childBlock)}
          </div>
        ))}
      </div>
      <div className={cn('space-y-2', rightBlocks.length === 0 && 'min-h-[50px]')}>
        {rightBlocks.map(childBlock => (
          <div key={childBlock.id}>
            {renderChildBlock?.(childBlock)}
          </div>
        ))}
      </div>
    </div>
  )
}

