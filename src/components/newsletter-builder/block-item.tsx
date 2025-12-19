'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { GripVertical, Trash2, Pencil, Check, X, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NewsletterBlock, NewsletterBlockType } from '@/lib/newsletter-builder/types'
import { NEWSLETTER_BLOCK_CONFIGS } from '@/lib/newsletter-builder/types'
import {
  HeadingBlock,
  ParagraphBlock,
  ButtonBlock,
  ImageBlock,
  DividerBlock,
  SpacerBlock,
  TwoColumnBlock,
  ThreeColumnBlock,
  SocialLinksBlock,
  QuoteBlock,
  ListBlock,
  VideoBlock,
  ProductCardBlock,
  CouponBlock,
  ProfileBlock,
  UnsubscribeBlock,
} from './blocks'

interface BlockItemProps {
  block: NewsletterBlock
  primaryColor?: string
  onUpdate: (block: NewsletterBlock) => void
  onDelete: (blockId: string) => void
  onSave: (blockId: string) => void
  onDuplicate?: (block: NewsletterBlock) => void
  onAddChildBlock?: (parentBlockId: string, columnIndex: number, blockType: NewsletterBlockType) => void
  onUpdateChildBlock?: (parentBlockId: string, childBlockId: string, updates: Partial<NewsletterBlock>) => void
  onDeleteChildBlock?: (parentBlockId: string, childBlockId: string) => void
  isChildBlock?: boolean
}

export function BlockItem({
  block,
  primaryColor = '#10b981',
  onUpdate,
  onDelete,
  onSave,
  onDuplicate,
  onAddChildBlock,
  onUpdateChildBlock,
  onDeleteChildBlock,
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

  const config = NEWSLETTER_BLOCK_CONFIGS[block.type]

  const handleChange = (updates: Partial<NewsletterBlock>) => {
    onUpdate({ ...block, ...updates })
  }

  const handleSave = () => {
    setIsEditing(false)
    onSave(block.id)
  }

  const handleCancel = () => {
    if (block.isNew) {
      onDelete(block.id)
    } else {
      setIsEditing(false)
    }
  }

  const handleAddChildBlock = (columnIndex: number, blockType: NewsletterBlockType) => {
    onAddChildBlock?.(block.id, columnIndex, blockType)
  }

  const handleUpdateChildBlock = (childBlockId: string, updates: Partial<NewsletterBlock>) => {
    onUpdateChildBlock?.(block.id, childBlockId, updates)
  }

  const handleDeleteChildBlock = (childBlockId: string) => {
    onDeleteChildBlock?.(block.id, childBlockId)
  }

  const renderChildBlock = (childBlock: NewsletterBlock) => {
    const childConfig = NEWSLETTER_BLOCK_CONFIGS[childBlock.type]
    return (
      <div key={childBlock.id} className="p-2 border rounded bg-background relative group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">{childConfig.label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100"
            onClick={() => handleDeleteChildBlock(childBlock.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        {renderBlockContent(childBlock, true)}
      </div>
    )
  }

  const renderBlockContent = (blockToRender: NewsletterBlock, isChild: boolean = false) => {
    const commonProps = {
      block: blockToRender,
      isEditing: isChild ? true : isEditing,
      onChange: isChild 
        ? (updates: Partial<NewsletterBlock>) => handleUpdateChildBlock(blockToRender.id, updates)
        : handleChange,
      primaryColor,
    }

    switch (blockToRender.type) {
      case 'HEADING':
        return <HeadingBlock {...commonProps} />
      case 'PARAGRAPH':
        return <ParagraphBlock {...commonProps} />
      case 'BUTTON':
        return <ButtonBlock {...commonProps} />
      case 'IMAGE':
        return <ImageBlock {...commonProps} />
      case 'DIVIDER':
        return <DividerBlock {...commonProps} />
      case 'SPACER':
        return <SpacerBlock {...commonProps} />
      case 'TWO_COLUMN':
        return (
          <TwoColumnBlock
            {...commonProps}
            onAddChildBlock={handleAddChildBlock}
            onUpdateChildBlock={handleUpdateChildBlock}
            onDeleteChildBlock={handleDeleteChildBlock}
            renderChildBlock={renderChildBlock}
          />
        )
      case 'THREE_COLUMN':
        return (
          <ThreeColumnBlock
            {...commonProps}
            onAddChildBlock={handleAddChildBlock}
            onUpdateChildBlock={handleUpdateChildBlock}
            onDeleteChildBlock={handleDeleteChildBlock}
            renderChildBlock={renderChildBlock}
          />
        )
      case 'SOCIAL_LINKS':
        return <SocialLinksBlock {...commonProps} />
      case 'QUOTE':
        return <QuoteBlock {...commonProps} />
      case 'LIST':
        return <ListBlock {...commonProps} />
      case 'VIDEO':
        return <VideoBlock {...commonProps} />
      case 'PRODUCT_CARD':
        return <ProductCardBlock {...commonProps} />
      case 'COUPON':
        return <CouponBlock {...commonProps} />
      case 'PROFILE':
        return <ProfileBlock {...commonProps} />
      case 'UNSUBSCRIBE':
        return <UnsubscribeBlock {...commonProps} />
      default:
        return <div className="text-muted-foreground text-sm">Unbekannter Block</div>
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-lg border bg-card text-card-foreground shadow-sm',
        isDragging && 'z-50 opacity-50',
        isChildBlock ? 'mb-2' : 'mb-3'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
        {/* Drag Handle */}
        {!isChildBlock && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Block Type Label */}
        <span className="text-xs font-medium text-muted-foreground flex-1">
          {config.label}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
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
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDuplicate(block)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(block.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {renderBlockContent(block)}
      </div>
    </div>
  )
}
