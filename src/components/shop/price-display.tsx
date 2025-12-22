'use client'

import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  price: number
  originalPrice?: number | null
  currency?: string
  size?: 'sm' | 'default' | 'lg'
  showSavings?: boolean
  className?: string
}

export function PriceDisplay({
  price,
  originalPrice,
  currency = '€',
  size = 'default',
  showSavings = true,
  className,
}: PriceDisplayProps) {
  const hasDiscount = originalPrice && originalPrice > price
  const savings = hasDiscount ? originalPrice - price : 0
  const savingsPercent = hasDiscount
    ? Math.round((savings / originalPrice) * 100)
    : 0

  const formatPrice = (value: number) => {
    return value.toFixed(2).replace('.', ',')
  }

  return (
    <div className={cn('flex items-end gap-2 flex-wrap', className)}>
      <span
        className={cn(
          'font-bold',
          size === 'sm' && 'text-base',
          size === 'default' && 'text-lg',
          size === 'lg' && 'text-2xl'
        )}
      >
        {formatPrice(price)} {currency}
      </span>

      {hasDiscount && (
        <>
          <span
            className={cn(
              'text-muted-foreground line-through',
              size === 'sm' && 'text-xs',
              size === 'default' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {formatPrice(originalPrice)} {currency}
          </span>

          {showSavings && savingsPercent > 0 && (
            <span
              className={cn(
                'text-emerald-500 font-medium',
                size === 'sm' && 'text-xs',
                size === 'default' && 'text-sm',
                size === 'lg' && 'text-base'
              )}
            >
              -{savingsPercent}%
            </span>
          )}
        </>
      )}
    </div>
  )
}

