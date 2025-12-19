'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mail } from 'lucide-react'
import type { NewsletterBlock, NewsletterBlockType } from '@/lib/newsletter-builder/types'
import { createNewBlock, generateBlockId, NEWSLETTER_BLOCK_CONFIGS } from '@/lib/newsletter-builder/types'
import { BlockToolbar } from './block-toolbar'
import { BlockItem } from './block-item'

interface BlockEditorProps {
  blocks: NewsletterBlock[]
  primaryColor?: string
  onBlocksChange: (blocks: NewsletterBlock[]) => void
}

export function BlockEditor({ blocks, primaryColor = '#10b981', onBlocksChange }: BlockEditorProps) {
  const [activeBlock, setActiveBlock] = useState<NewsletterBlock | null>(null)

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Add new block
  const handleAddBlock = useCallback((type: NewsletterBlockType) => {
    const newBlock = createNewBlock(type, blocks.length)
    onBlocksChange([...blocks, newBlock])
  }, [blocks, onBlocksChange])

  // Update block
  const handleUpdateBlock = useCallback((updatedBlock: NewsletterBlock) => {
    const newBlocks = blocks.map(b => 
      b.id === updatedBlock.id ? updatedBlock : b
    )
    onBlocksChange(newBlocks)
  }, [blocks, onBlocksChange])

  // Delete block
  const handleDeleteBlock = useCallback((blockId: string) => {
    const newBlocks = blocks
      .filter(b => b.id !== blockId)
      .map((b, i) => ({ ...b, sortOrder: i }))
    onBlocksChange(newBlocks)
  }, [blocks, onBlocksChange])

  // Save block (remove isNew/isEditing flags)
  const handleSaveBlock = useCallback((blockId: string) => {
    const newBlocks = blocks.map(b =>
      b.id === blockId ? { ...b, isNew: false, isEditing: false } : b
    )
    onBlocksChange(newBlocks)
  }, [blocks, onBlocksChange])

  // Duplicate block
  const handleDuplicateBlock = useCallback((block: NewsletterBlock) => {
    const duplicatedBlock: NewsletterBlock = {
      ...block,
      id: generateBlockId(),
      sortOrder: block.sortOrder + 1,
      isNew: true,
      isEditing: true,
      childBlocks: block.childBlocks?.map(child => ({
        ...child,
        id: generateBlockId(),
        parentBlockId: undefined,
      })),
    }

    // Update sortOrder for blocks after the duplicated one
    const newBlocks = blocks.flatMap((b, i) => {
      if (b.id === block.id) {
        return [b, duplicatedBlock]
      }
      if (b.sortOrder > block.sortOrder) {
        return [{ ...b, sortOrder: b.sortOrder + 1 }]
      }
      return [b]
    })

    onBlocksChange(newBlocks)
  }, [blocks, onBlocksChange])

  // Add child block (for TWO_COLUMN)
  const handleAddChildBlock = useCallback((parentBlockId: string, columnIndex: number, blockType: NewsletterBlockType) => {
    const parentBlock = blocks.find(b => b.id === parentBlockId)
    if (!parentBlock) return

    const existingChildBlocks = parentBlock.childBlocks || []
    const childrenInColumn = existingChildBlocks.filter(b => b.columnIndex === columnIndex)
    
    const newChildBlock: NewsletterBlock = {
      ...createNewBlock(blockType, childrenInColumn.length),
      columnIndex,
      parentBlockId,
    }

    const updatedParent: NewsletterBlock = {
      ...parentBlock,
      childBlocks: [...existingChildBlocks, newChildBlock],
    }

    handleUpdateBlock(updatedParent)
  }, [blocks, handleUpdateBlock])

  // Update child block
  const handleUpdateChildBlock = useCallback((parentBlockId: string, childBlockId: string, updates: Partial<NewsletterBlock>) => {
    const parentBlock = blocks.find(b => b.id === parentBlockId)
    if (!parentBlock) return

    const updatedChildBlocks = (parentBlock.childBlocks || []).map(child =>
      child.id === childBlockId ? { ...child, ...updates } : child
    )

    const updatedParent: NewsletterBlock = {
      ...parentBlock,
      childBlocks: updatedChildBlocks,
    }

    handleUpdateBlock(updatedParent)
  }, [blocks, handleUpdateBlock])

  // Delete child block
  const handleDeleteChildBlock = useCallback((parentBlockId: string, childBlockId: string) => {
    const parentBlock = blocks.find(b => b.id === parentBlockId)
    if (!parentBlock) return

    const updatedChildBlocks = (parentBlock.childBlocks || []).filter(
      child => child.id !== childBlockId
    )

    const updatedParent: NewsletterBlock = {
      ...parentBlock,
      childBlocks: updatedChildBlocks,
    }

    handleUpdateBlock(updatedParent)
  }, [blocks, handleUpdateBlock])

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const block = blocks.find(b => b.id === event.active.id)
    setActiveBlock(block || null)
  }, [blocks])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveBlock(null)

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)

      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({
        ...b,
        sortOrder: i,
      }))

      onBlocksChange(newBlocks)
    }
  }, [blocks, onBlocksChange])

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <BlockToolbar onAddBlock={handleAddBlock} />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Noch keine Blöcke
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Klicke auf &quot;Block hinzufügen&quot; um zu starten
                  </p>
                </div>
              ) : (
                blocks.map(block => (
                  <BlockItem
                    key={block.id}
                    block={block}
                    primaryColor={primaryColor}
                    onUpdate={handleUpdateBlock}
                    onDelete={handleDeleteBlock}
                    onSave={handleSaveBlock}
                    onDuplicate={handleDuplicateBlock}
                    onAddChildBlock={handleAddChildBlock}
                    onUpdateChildBlock={handleUpdateChildBlock}
                    onDeleteChildBlock={handleDeleteChildBlock}
                  />
                ))
              )}
            </SortableContext>
            <DragOverlay>
              {activeBlock ? (
                <div className="opacity-80 rotate-2 scale-105">
                  <BlockItem
                    block={activeBlock}
                    primaryColor={primaryColor}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    onSave={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  )
}



