'use client'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Construction } from 'lucide-react'

interface DevelopmentBadgeProps {
  variant?: 'dot' | 'badge' | 'banner'
  className?: string
}

export function DevelopmentBadge({ variant = 'dot', className }: DevelopmentBadgeProps) {
  if (variant === 'dot') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'relative flex h-2 w-2',
                className
              )}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-xs">In Entwicklung</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === 'badge') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs gap-1',
          className
        )}
      >
        <Construction className="h-3 w-3" />
        In Entwicklung
      </Badge>
    )
  }

  // Banner - Dark style für beide Modi
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-700',
        className
      )}
    >
      <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
        <Construction className="h-4 w-4 text-orange-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">Feature in Entwicklung</p>
        <p className="text-xs text-zinc-400">
          Die Google Business Integration wird gerade aufgebaut. Mockdaten werden angezeigt.
        </p>
      </div>
    </div>
  )
}

