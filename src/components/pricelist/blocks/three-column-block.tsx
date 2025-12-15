'use client'

import { cn } from '@/lib/utils'
import type { PriceBlockClient } from '@/lib/pricelist/types'

interface ThreeColumnBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  renderChildBlock?: (block: PriceBlockClient) => React.ReactNode
}

export function ThreeColumnBlock({ block, isEditing, renderChildBlock }: ThreeColumnBlockProps) {
  const col1Blocks = block.childBlocks?.filter(b => b.columnIndex === 0) || []
  const col2Blocks = block.childBlocks?.filter(b => b.columnIndex === 1) || []
  const col3Blocks = block.childBlocks?.filter(b => b.columnIndex === 2) || []

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground mb-2">Dreispaltiges Layout</div>
        <div className="grid grid-cols-3 gap-3">
          {[col1Blocks, col2Blocks, col3Blocks].map((blocks, index) => (
            <div 
              key={index}
              className="min-h-[80px] border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 flex items-center justify-center"
            >
              {blocks.length > 0 ? (
                <div className="w-full space-y-2">
                  {blocks.map(childBlock => (
                    <div key={childBlock.id} className="text-xs bg-background p-2 rounded">
                      {renderChildBlock ? renderChildBlock(childBlock) : childBlock.type}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Spalte {index + 1}</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Blöcke per Drag & Drop in die Spalten ziehen
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {[col1Blocks, col2Blocks, col3Blocks].map((blocks, index) => (
        <div key={index} className={cn('space-y-2', blocks.length === 0 && 'min-h-[30px]')}>
          {blocks.map(childBlock => (
            <div key={childBlock.id}>
              {renderChildBlock?.(childBlock)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

