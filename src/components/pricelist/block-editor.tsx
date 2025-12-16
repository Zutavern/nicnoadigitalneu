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
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { BlockItem } from './block-item'
import { BlockToolbar } from './block-toolbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { PriceBlockClient, PriceListClient, BlockType } from '@/lib/pricelist/types'
import { createNewBlock } from '@/lib/pricelist/types'

// Helper für temporäre IDs
const generateTempId = () => `temp-${crypto.randomUUID()}`

interface BlockEditorProps {
  priceList: PriceListClient
  blocks: PriceBlockClient[]
  onBlocksChange: (blocks: PriceBlockClient[]) => void
  onBlockSave: (block: PriceBlockClient) => Promise<void>
  onBlockDelete: (blockId: string) => Promise<void>
  onBlocksReorder: (blocks: { id: string; sortOrder: number }[]) => Promise<void>
  onBlockDuplicate?: (blockId: string) => Promise<void>
}

export function BlockEditor({
  priceList,
  blocks,
  onBlocksChange,
  onBlockSave,
  onBlockDelete,
  onBlocksReorder,
  onBlockDuplicate,
}: BlockEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)

      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        sortOrder: index,
      }))

      onBlocksChange(newBlocks)

      // Server synchronisieren (nur bereits gespeicherte Blöcke)
      const savedBlocks = newBlocks
        .filter((b) => !b.isNew)
        .map((b) => ({ id: b.id, sortOrder: b.sortOrder }))

      if (savedBlocks.length > 0) {
        await onBlocksReorder(savedBlocks)
      }
    }
  }

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createNewBlock(
      type,
      priceList.id,
      blocks.length,
      priceList.pricingModel
    )
    onBlocksChange([...blocks, newBlock])
  }

  const handleUpdateBlock = (blockId: string, updates: Partial<PriceBlockClient>) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, ...updates } : block
    )
    onBlocksChange(newBlocks)
  }

  const handleSaveBlock = async (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId)
    if (block) {
      await onBlockSave(block)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId)
    if (block?.isNew) {
      // Noch nicht gespeichert - nur lokal entfernen
      const newBlocks = blocks
        .filter((b) => b.id !== blockId)
        .map((b, index) => ({ ...b, sortOrder: index }))
      onBlocksChange(newBlocks)
    } else {
      await onBlockDelete(blockId)
    }
  }

  // ============================================
  // Funktionen für verschachtelte Blöcke (in Spalten-Containern)
  // ============================================

  const handleAddChildBlock = (parentBlockId: string, columnIndex: number, type: BlockType) => {
    const parentBlock = blocks.find(b => b.id === parentBlockId)
    if (!parentBlock) return

    // Erstelle neuen Child-Block
    const existingChildBlocks = parentBlock.childBlocks || []
    const blocksInColumn = existingChildBlocks.filter(b => b.columnIndex === columnIndex)
    const newSortOrder = blocksInColumn.length

    const newChildBlock: PriceBlockClient = {
      ...createNewBlock(type, priceList.id, newSortOrder, priceList.pricingModel),
      id: generateTempId(),
      parentBlockId: parentBlockId,
      columnIndex: columnIndex,
      isNew: true,
      isEditing: true,
    }

    // Update den Parent-Block mit dem neuen Child
    const updatedBlocks = blocks.map(block => {
      if (block.id === parentBlockId) {
        return {
          ...block,
          childBlocks: [...(block.childBlocks || []), newChildBlock],
        }
      }
      return block
    })

    onBlocksChange(updatedBlocks)
  }

  const handleUpdateChildBlock = (parentBlockId: string, childBlockId: string, updates: Partial<PriceBlockClient>) => {
    const updatedBlocks = blocks.map(block => {
      if (block.id === parentBlockId && block.childBlocks) {
        return {
          ...block,
          childBlocks: block.childBlocks.map(child =>
            child.id === childBlockId ? { ...child, ...updates } : child
          ),
        }
      }
      return block
    })
    onBlocksChange(updatedBlocks)
  }

  const handleDeleteChildBlock = (parentBlockId: string, childBlockId: string) => {
    const updatedBlocks = blocks.map(block => {
      if (block.id === parentBlockId && block.childBlocks) {
        const filteredChildren = block.childBlocks.filter(child => child.id !== childBlockId)
        // Re-sortiere die Blöcke in jeder Spalte
        const reorderedChildren = filteredChildren.map((child, _) => {
          const sameColumnChildren = filteredChildren.filter(c => c.columnIndex === child.columnIndex)
          const newSortOrder = sameColumnChildren.findIndex(c => c.id === child.id)
          return { ...child, sortOrder: newSortOrder }
        })
        return {
          ...block,
          childBlocks: reorderedChildren,
        }
      }
      return block
    })
    onBlocksChange(updatedBlocks)
  }

  const handleSaveChildBlock = async (parentBlockId: string, childBlockId: string) => {
    const parentBlock = blocks.find(b => b.id === parentBlockId)
    const childBlock = parentBlock?.childBlocks?.find(c => c.id === childBlockId)
    if (parentBlock && childBlock) {
      // Speichere den Child-Block (API-Aufruf würde hier erfolgen)
      await onBlockSave({ ...childBlock, parentBlockId })
    }
  }

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-3 border-b">
        <BlockToolbar onAddBlock={handleAddBlock} />
      </div>

      {/* Block List */}
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
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">Keine Blöcke vorhanden</p>
                  <p className="text-xs mt-1">
                    Klicke auf &quot;Block hinzufügen&quot; um zu starten
                  </p>
                </div>
              ) : (
                blocks.map((block) => (
                  <BlockItem
                    key={block.id}
                    block={block}
                    pricingModel={priceList.pricingModel}
                    priceListId={priceList.id}
                    onUpdate={handleUpdateBlock}
                    onDelete={handleDeleteBlock}
                    onSave={handleSaveBlock}
                    onDuplicate={onBlockDuplicate}
                    onAddChildBlock={handleAddChildBlock}
                    onUpdateChildBlock={handleUpdateChildBlock}
                    onDeleteChildBlock={handleDeleteChildBlock}
                    onSaveChildBlock={handleSaveChildBlock}
                  />
                ))
              )}
            </SortableContext>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeBlock ? (
                <div className="opacity-80 rotate-2 scale-105">
                  <BlockItem
                    block={activeBlock}
                    pricingModel={priceList.pricingModel}
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


