'use client'

import {
  Clock,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'READY'
  | 'PICKED_UP'
  | 'CANCELLED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'REFUNDED'

interface OrderStatusBadgeProps {
  status: OrderStatus | string
  size?: 'sm' | 'default'
  className?: string
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string
    icon: React.ElementType
    className: string
  }
> = {
  PENDING: {
    label: 'Ausstehend',
    icon: Clock,
    className: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  },
  PAID: {
    label: 'Bezahlt',
    icon: CreditCard,
    className: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  },
  READY: {
    label: 'Bereit',
    icon: Package,
    className: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  },
  PICKED_UP: {
    label: 'Abgeholt',
    icon: CheckCircle,
    className: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  },
  CANCELLED: {
    label: 'Storniert',
    icon: XCircle,
    className: 'bg-red-500/20 text-red-500 border-red-500/30',
  },
  SHIPPED: {
    label: 'Versendet',
    icon: Truck,
    className: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  },
  DELIVERED: {
    label: 'Zugestellt',
    icon: CheckCircle,
    className: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  },
  REFUNDED: {
    label: 'Erstattet',
    icon: XCircle,
    className: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
  },
}

export function OrderStatusBadge({
  status,
  size = 'default',
  className,
}: OrderStatusBadgeProps) {
  const config = statusConfig[status as OrderStatus] || {
    label: status,
    icon: Clock,
    className: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
  }

  const Icon = config.icon
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1',
        config.className,
        size === 'sm' && 'text-xs px-2 py-0.5',
        className
      )}
    >
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  )
}

