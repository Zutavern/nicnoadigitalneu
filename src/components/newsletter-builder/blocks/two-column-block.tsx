'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus, Columns2 } from 'lucide-react'
import type { NewsletterBlock, NewsletterBlockType } from '@/lib/newsletter-builder/types'
import { NEWSLETTER_BLOCK_CONFIGS, createNewBlock } from '@/lib/newsletter-builder/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface TwoColumnBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  onAddChildBlock?: (columnIndex: number, blockType: NewsletterBlockType) => void
  onUpdateChildBlock?: (childBlockId: string, updates: Partial<NewsletterBlock>) => void
  onDeleteChildBlock?: (childBlockId: string) => void
  renderChildBlock?: (childBlock: NewsletterBlock) => React.ReactNode
}

const COLUMN_WIDTH_OPTIONS = [
  { label: '50% / 50%', value: '50,50' },
  { label: '33% / 67%', value: '33,67' },
  { label: '67% / 33%', value: '67,33' },
  { label: '25% / 75%', value: '25,75' },
  { label: '75% / 25%', value: '75,25' },
]

// Block-Typen, die in Spalten verwendet werden können (keine verschachtelten Spalten)
const ALLOWED_CHILD_BLOCK_TYPES: NewsletterBlockType[] = [
  'HEADING',
  'PARAGRAPH',
  'BUTTON',
  'IMAGE',
  'DIVIDER',
  'SPACER',
]

export function TwoColumnBlock({ 
  block, 
  isEditing, 
  onChange, 
  onAddChildBlock,
  renderChildBlock,
}: TwoColumnBlockProps) {
  const widths = block.columnWidths || [50, 50]
  const childBlocks = block.childBlocks || []
  
  const widthValue = `${widths[0]},${widths[1]}`

  const leftBlocks = childBlocks.filter(b => b.columnIndex === 0).sort((a, b) => a.sortOrder - b.sortOrder)
  const rightBlocks = childBlocks.filter(b => b.columnIndex === 1).sort((a, b) => a.sortOrder - b.sortOrder)

  const handleWidthChange = (value: string) => {
    const [left, right] = value.split(',').map(Number) as [number, number]
    onChange({ columnWidths: [left, right] })
  }

  const renderAddBlockButton = (columnIndex: number) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full h-8 border border-dashed">
          <Plus className="h-3 w-3 mr-1" />
          <span className="text-xs">Block</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {ALLOWED_CHILD_BLOCK_TYPES.map((type) => {
          const config = NEWSLETTER_BLOCK_CONFIGS[type]
          return (
            <DropdownMenuItem
              key={type}
              onClick={() => onAddChildBlock?.(columnIndex, type)}
            >
              <span className="text-sm">{config.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Spaltenbreiten</Label>
          <Select value={widthValue} onValueChange={handleWidthChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLUMN_WIDTH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: `${widths[0]}fr ${widths[1]}fr` }}>
          <div className="border rounded p-2 bg-muted/30 min-h-[80px] space-y-2">
            <p className="text-[10px] text-muted-foreground font-medium">Spalte 1 ({widths[0]}%)</p>
            {leftBlocks.map((childBlock) => (
              <div key={childBlock.id} className="text-xs">
                {renderChildBlock ? renderChildBlock(childBlock) : (
                  <span className="text-muted-foreground">{NEWSLETTER_BLOCK_CONFIGS[childBlock.type].label}</span>
                )}
              </div>
            ))}
            {renderAddBlockButton(0)}
          </div>
          <div className="border rounded p-2 bg-muted/30 min-h-[80px] space-y-2">
            <p className="text-[10px] text-muted-foreground font-medium">Spalte 2 ({widths[1]}%)</p>
            {rightBlocks.map((childBlock) => (
              <div key={childBlock.id} className="text-xs">
                {renderChildBlock ? renderChildBlock(childBlock) : (
                  <span className="text-muted-foreground">{NEWSLETTER_BLOCK_CONFIGS[childBlock.type].label}</span>
                )}
              </div>
            ))}
            {renderAddBlockButton(1)}
          </div>
        </div>
      </div>
    )
  }

  // Preview Mode
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Columns2 className="h-4 w-4" />
      <span className="text-xs">
        2 Spalten ({widths[0]}% / {widths[1]}%)
        {childBlocks.length > 0 && ` • ${childBlocks.length} Blöcke`}
      </span>
    </div>
  )
}



