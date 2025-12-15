'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PriceBlockClient } from '@/lib/pricelist/types'
import { SPACER_SIZE_CONFIGS } from '@/lib/pricelist/types'
import type { SpacerSize } from '@prisma/client'

interface SpacerBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function SpacerBlock({ block, isEditing, onChange }: SpacerBlockProps) {
  const config = SPACER_SIZE_CONFIGS[block.spacerSize || 'MEDIUM']

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg">
        <Label className="text-xs">Abstandsgröße</Label>
        <Select
          value={block.spacerSize || 'MEDIUM'}
          onValueChange={(value) => onChange({ spacerSize: value as SpacerSize })}
        >
          <SelectTrigger className="mt-1 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(SPACER_SIZE_CONFIGS).map((cfg) => (
              <SelectItem key={cfg.size} value={cfg.size}>
                {cfg.label} ({cfg.heightPx}px)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div 
      className="w-full bg-muted/20 rounded"
      style={{ height: config.heightPx }}
    />
  )
}


