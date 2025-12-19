'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Type, 
  AlignLeft, 
  MousePointerClick, 
  Image, 
  Minus, 
  Space, 
  Columns2,
  Columns3,
  Share2,
  Quote,
  List,
  Play,
  ShoppingBag,
  Ticket,
  User,
  UserMinus,
  Heading,
} from 'lucide-react'
import type { NewsletterBlockType } from '@/lib/newsletter-builder/types'
import { NEWSLETTER_BLOCK_CONFIGS, BLOCK_CATEGORIES } from '@/lib/newsletter-builder/types'

interface BlockToolbarProps {
  onAddBlock: (type: NewsletterBlockType) => void
}

// Icon mapping für Block-Typen
const BLOCK_ICONS: Record<string, React.ReactNode> = {
  Type: <Type className="h-4 w-4" />,
  Heading: <Heading className="h-4 w-4" />,
  AlignLeft: <AlignLeft className="h-4 w-4" />,
  MousePointerClick: <MousePointerClick className="h-4 w-4" />,
  Image: <Image className="h-4 w-4" />,
  Minus: <Minus className="h-4 w-4" />,
  Space: <Space className="h-4 w-4" />,
  Columns2: <Columns2 className="h-4 w-4" />,
  Columns3: <Columns3 className="h-4 w-4" />,
  Share2: <Share2 className="h-4 w-4" />,
  Quote: <Quote className="h-4 w-4" />,
  List: <List className="h-4 w-4" />,
  Play: <Play className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  Ticket: <Ticket className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
  UserMinus: <UserMinus className="h-4 w-4" />,
}

export function BlockToolbar({ onAddBlock }: BlockToolbarProps) {
  const renderBlockItem = (type: NewsletterBlockType) => {
    const config = NEWSLETTER_BLOCK_CONFIGS[type]
    return (
      <DropdownMenuItem
        key={type}
        onClick={() => onAddBlock(type)}
        className="cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {BLOCK_ICONS[config.icon] || <Type className="h-4 w-4" />}
          <div>
            <div className="font-medium text-sm">{config.label}</div>
            <div className="text-xs text-muted-foreground">{config.description}</div>
          </div>
        </div>
      </DropdownMenuItem>
    )
  }

  const renderCategory = (categoryKey: keyof typeof BLOCK_CATEGORIES) => {
    const category = BLOCK_CATEGORIES[categoryKey]
    return (
      <>
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground">{category.label}</p>
        </div>
        {category.types.map(renderBlockItem)}
      </>
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
      <DropdownMenuContent align="start" className="w-64 max-h-[400px] overflow-y-auto">
        {/* Text */}
        {renderCategory('text')}
        
        <DropdownMenuSeparator />
        
        {/* Media */}
        {renderCategory('media')}
        
        <DropdownMenuSeparator />
        
        {/* Interaktiv */}
        {renderCategory('interactive')}
        
        <DropdownMenuSeparator />
        
        {/* Layout */}
        {renderCategory('layout')}
        
        {/* Hinweis: Unsubscribe-Link ist automatisch im Footer (DSGVO) */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
