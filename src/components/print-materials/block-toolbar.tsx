'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BLOCK_TYPE_CONFIGS } from '@/lib/print-materials/types'
import type { PrintBlockType } from '@prisma/client'
import {
  Plus,
  Type,
  User,
  Quote,
  Image as ImageIcon,
  QrCode,
  Contact,
  Shapes,
  Share2,
} from 'lucide-react'

interface BlockToolbarProps {
  onAddBlock: (type: PrintBlockType) => void
  disabled?: boolean
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  User,
  Quote,
  Image: ImageIcon,
  ImageIcon,
  QrCode,
  Contact,
  Shapes,
  Share2,
}

// Gruppierte Block-Typen
const BLOCK_GROUPS = [
  {
    label: 'Text',
    types: ['NAME', 'TAGLINE', 'TEXT'] as PrintBlockType[],
  },
  {
    label: 'Medien',
    types: ['LOGO', 'IMAGE', 'QR_CODE'] as PrintBlockType[],
  },
  {
    label: 'Information',
    types: ['CONTACT_INFO', 'SOCIAL_LINKS'] as PrintBlockType[],
  },
  {
    label: 'Dekoration',
    types: ['SHAPE'] as PrintBlockType[],
  },
]

export function BlockToolbar({ onAddBlock, disabled }: BlockToolbarProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          Element hinzufügen
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {BLOCK_GROUPS.map((group, groupIndex) => (
          <div key={group.label}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
            {group.types.map((type) => {
              const config = BLOCK_TYPE_CONFIGS[type]
              const Icon = ICON_MAP[config.icon] || Type

              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => onAddBlock(type)}
                  className="cursor-pointer"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>{config.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {config.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

