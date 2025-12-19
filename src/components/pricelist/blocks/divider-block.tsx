'use client'

import { Separator } from '@/components/ui/separator'
import type { PriceBlockClient } from '@/lib/pricelist/types'

interface DividerBlockProps {
  block: PriceBlockClient
  isEditing: boolean
}

export function DividerBlock({ block, isEditing }: DividerBlockProps) {
  return (
    <div className="py-2">
      <Separator className={isEditing ? 'bg-primary/30' : ''} />
    </div>
  )
}





