'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Type,
  DollarSign,
  AlignLeft,
  Minus,
  Space,
  Image,
  Info,
  Columns2,
  Columns3,
  Tag,
  Quote,
  Star,
  Contact,
  Share2,
  QrCode,
  Hexagon,
  PanelBottom,
} from 'lucide-react'
import type { BlockType } from '@prisma/client'
import { BLOCK_TYPE_CONFIGS } from '@/lib/pricelist/types'

interface BlockToolbarProps {
  onAddBlock: (type: BlockType) => void
}

const BLOCK_ICONS: Record<string, React.ReactNode> = {
  Type: <Type className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
  AlignLeft: <AlignLeft className="h-4 w-4" />,
  Minus: <Minus className="h-4 w-4" />,
  Space: <Space className="h-4 w-4" />,
  Image: <Image className="h-4 w-4" />,
  Info: <Info className="h-4 w-4" />,
  Columns2: <Columns2 className="h-4 w-4" />,
  Columns3: <Columns3 className="h-4 w-4" />,
  Tag: <Tag className="h-4 w-4" />,
  Quote: <Quote className="h-4 w-4" />,
  Star: <Star className="h-4 w-4" />,
  Contact: <Contact className="h-4 w-4" />,
  Share2: <Share2 className="h-4 w-4" />,
  QrCode: <QrCode className="h-4 w-4" />,
  Hexagon: <Hexagon className="h-4 w-4" />,
  PanelBottom: <PanelBottom className="h-4 w-4" />,
}

export function BlockToolbar({ onAddBlock }: BlockToolbarProps) {
  const contentBlocks: BlockType[] = ['SECTION_HEADER', 'PRICE_ITEM', 'TEXT', 'INFO_BOX']
  const layoutBlocks: BlockType[] = ['TWO_COLUMN', 'THREE_COLUMN', 'DIVIDER', 'SPACER']
  const mediaBlocks: BlockType[] = ['IMAGE', 'LOGO', 'QR_CODE']
  const extraBlocks: BlockType[] = ['BADGE', 'QUOTE', 'ICON_TEXT', 'CONTACT_INFO', 'SOCIAL_LINKS', 'FOOTER']

  const renderBlockItem = (type: BlockType) => {
    const config = BLOCK_TYPE_CONFIGS[type]
    return (
      <DropdownMenuItem
        key={type}
        onClick={() => onAddBlock(type)}
        className="cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {BLOCK_ICONS[config.icon]}
          <div>
            <div className="font-medium">{config.label}</div>
            <div className="text-xs text-muted-foreground">{config.description}</div>
          </div>
        </div>
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          Block hinzufügen
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {/* Inhalt */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Inhalt
        </div>
        {contentBlocks.map(renderBlockItem)}
        
        <DropdownMenuSeparator />
        
        {/* Layout */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Layout
        </div>
        {layoutBlocks.map(renderBlockItem)}
        
        <DropdownMenuSeparator />
        
        {/* Medien */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Medien
        </div>
        {mediaBlocks.map(renderBlockItem)}
        
        <DropdownMenuSeparator />
        
        {/* Extras */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Weitere Elemente
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {extraBlocks.map(renderBlockItem)}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


