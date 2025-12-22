'use client'

import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface InventoryBadgeProps {
  quantity: number
  threshold?: number
  showCount?: boolean
  size?: 'sm' | 'default'
  className?: string
}

export function InventoryBadge({
  quantity,
  threshold = 5,
  showCount = true,
  size = 'default',
  className,
}: InventoryBadgeProps) {
  const isOutOfStock = quantity <= 0
  const isLowStock = quantity > 0 && quantity <= threshold
  const isInStock = quantity > threshold

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  if (isOutOfStock) {
    return (
      <Badge
        variant="destructive"
        className={cn(
          'gap-1',
          size === 'sm' && 'text-xs px-2 py-0.5',
          className
        )}
      >
        <XCircle className={iconSize} />
        {showCount ? 'Ausverkauft' : null}
      </Badge>
    )
  }

  if (isLowStock) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          'gap-1 bg-amber-500/20 text-amber-500 border-amber-500/30 hover:bg-amber-500/30',
          size === 'sm' && 'text-xs px-2 py-0.5',
          className
        )}
      >
        <AlertTriangle className={iconSize} />
        {showCount ? `Noch ${quantity}` : 'Wenig'}
      </Badge>
    )
  }

  if (isInStock) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          'gap-1 bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/30',
          size === 'sm' && 'text-xs px-2 py-0.5',
          className
        )}
      >
        <CheckCircle className={iconSize} />
        {showCount ? `${quantity} verfügbar` : 'Verfügbar'}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn('gap-1', size === 'sm' && 'text-xs px-2 py-0.5', className)}
    >
      <Package className={iconSize} />
      {showCount ? quantity : 'Lager'}
    </Badge>
  )
}

