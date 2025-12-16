'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { GripVertical, Trash2, Pencil, Check, X, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PriceBlockClient, BlockType } from '@/lib/pricelist/types'
import type { PricingModel } from '@prisma/client'
import {
  SectionHeaderBlock,
  PriceItemBlock,
  TextBlock,
  DividerBlock,
  SpacerBlock,
  ImageBlock,
  InfoBoxBlock,
  BadgeBlock,
  QuoteBlock,
  IconTextBlock,
  ContactInfoBlock,
  SocialLinksBlock,
  QrCodeBlock,
  LogoBlock,
  FooterBlock,
  PageBreakBlock,
} from './blocks'
import { ColumnContainerBlock } from './blocks/column-container-block'

interface BlockItemProps {
  block: PriceBlockClient
  pricingModel: PricingModel
  priceListId?: string
  onUpdate: (blockId: string, updates: Partial<PriceBlockClient>) => void
  onDelete: (blockId: string) => void
  onSave: (blockId: string) => void
  onDuplicate?: (blockId: string) => void
  // Funktionen für verschachtelte Blöcke in Spalten-Containern
  onAddChildBlock?: (parentBlockId: string, columnIndex: number, type: BlockType) => void
  onUpdateChildBlock?: (parentBlockId: string, childBlockId: string, updates: Partial<PriceBlockClient>) => void
  onDeleteChildBlock?: (parentBlockId: string, childBlockId: string) => void
  onSaveChildBlock?: (parentBlockId: string, childBlockId: string) => void
  // Für verschachtelte Blöcke in Spalten (ohne Drag-Handle)
  isChildBlock?: boolean
}

export function BlockItem({ 
  block, 
  pricingModel, 
  priceListId,
  onUpdate, 
  onDelete, 
  onSave,
  onDuplicate,
  onAddChildBlock,
  onUpdateChildBlock,
  onDeleteChildBlock,
  onSaveChildBlock,
  isChildBlock = false,
}: BlockItemProps) {
  const [isEditing, setIsEditing] = useState(block.isNew || false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: isChildBlock })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleChange = (updates: Partial<PriceBlockClient>) => {
    onUpdate(block.id, updates)
  }

  const handleSave = () => {
    onSave(block.id)
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (block.isNew) {
      onDelete(block.id)
    } else {
      setIsEditing(false)
    }
  }

  // Rendert einen verschachtelten Block innerhalb einer Spalte
  const renderChildBlock = (childBlock: PriceBlockClient, _isInColumn: boolean) => {
    return (
      <BlockItem
        key={childBlock.id}
        block={childBlock}
        pricingModel={pricingModel}
        priceListId={priceListId}
        isChildBlock={true}
        onUpdate={(_, updates) => onUpdateChildBlock?.(block.id, childBlock.id, updates)}
        onDelete={() => onDeleteChildBlock?.(block.id, childBlock.id)}
        onSave={() => onSaveChildBlock?.(block.id, childBlock.id)}
      />
    )
  }

  const renderBlock = () => {
    switch (block.type) {
      case 'SECTION_HEADER':
        return <SectionHeaderBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'PRICE_ITEM':
        return <PriceItemBlock block={block} isEditing={isEditing} pricingModel={pricingModel} onChange={handleChange} />
      case 'TEXT':
        return <TextBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'DIVIDER':
        return <DividerBlock block={block} isEditing={isEditing} />
      case 'SPACER':
        return <SpacerBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'IMAGE':
        return <ImageBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'INFO_BOX':
        return <InfoBoxBlock block={block} isEditing={isEditing} onChange={handleChange} />
      // Layout Container
      case 'TWO_COLUMN':
        return (
          <ColumnContainerBlock
            block={block}
            columnCount={2}
            isEditing={isEditing}
            priceListId={priceListId || ''}
            pricingModel={pricingModel}
            onUpdate={handleChange}
            renderChildBlock={renderChildBlock}
            onAddChildBlock={onAddChildBlock}
            onDeleteChildBlock={(childBlockId) => onDeleteChildBlock?.(block.id, childBlockId)}
          />
        )
      case 'THREE_COLUMN':
        return (
          <ColumnContainerBlock
            block={block}
            columnCount={3}
            isEditing={isEditing}
            priceListId={priceListId || ''}
            pricingModel={pricingModel}
            onUpdate={handleChange}
            renderChildBlock={renderChildBlock}
            onAddChildBlock={onAddChildBlock}
            onDeleteChildBlock={(childBlockId) => onDeleteChildBlock?.(block.id, childBlockId)}
          />
        )
      // Neue Blockelemente
      case 'BADGE':
        return <BadgeBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'QUOTE':
        return <QuoteBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'ICON_TEXT':
        return <IconTextBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'CONTACT_INFO':
        return <ContactInfoBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'SOCIAL_LINKS':
        return <SocialLinksBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'QR_CODE':
        return <QrCodeBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'LOGO':
        return <LogoBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'FOOTER':
        return <FooterBlock block={block} isEditing={isEditing} onChange={handleChange} />
      case 'PAGE_BREAK':
        return <PageBreakBlock block={block} isEditing={isEditing} />
      default:
        return <div className="text-sm text-muted-foreground">Unbekannter Block-Typ</div>
    }
  }

  // Für Child-Blöcke: Vereinfachtes Layout ohne Sortable
  if (isChildBlock) {
    return (
      <div
        className={cn(
          'group relative rounded-lg border bg-card transition-all p-2',
          isEditing && 'ring-1 ring-primary',
          block.isNew && 'border-primary/50 bg-primary/5'
        )}
      >
        <div className="flex-1 min-w-0">
          {renderBlock()}
        </div>
        
        {/* Kompakte Actions für Child-Blöcke */}
        <div className={cn(
          'absolute top-1 right-1 flex items-center gap-0.5',
          !isEditing && 'opacity-0 group-hover:opacity-100 transition-opacity'
        )}>
          {isEditing ? (
            <>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleSave}>
                <Check className="h-3 w-3 text-green-600" />
              </Button>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCancel}>
                <X className="h-3 w-3 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsEditing(true)}>
                <Pencil className="h-2.5 w-2.5 text-muted-foreground" />
              </Button>
              {onDuplicate && (
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onDuplicate(block.id)}>
                  <Copy className="h-2.5 w-2.5 text-muted-foreground" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onDelete(block.id)}>
                <Trash2 className="h-2.5 w-2.5 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-start gap-2 rounded-lg border bg-card transition-all',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary',
        isEditing ? 'p-3' : 'p-2',
        block.isNew && 'border-primary/50 bg-primary/5'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          'flex-shrink-0 p-1 rounded cursor-grab active:cursor-grabbing',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-muted'
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Block Content */}
      <div className="flex-1 min-w-0">
        {renderBlock()}
      </div>

      {/* Actions */}
      <div className={cn(
        'flex items-center gap-1 flex-shrink-0',
        !isEditing && 'opacity-0 group-hover:opacity-100 transition-opacity'
      )}>
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSave}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsEditing(true)}
              title="Bearbeiten"
            >
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </Button>
            {onDuplicate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onDuplicate(block.id)}
                title="Duplizieren"
              >
                <Copy className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onDelete(block.id)}
              title="Löschen"
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
