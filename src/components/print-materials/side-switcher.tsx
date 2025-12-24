'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FlipHorizontal } from 'lucide-react'

interface SideSwitcherProps {
  side: 'FRONT' | 'BACK'
  onSideChange: (side: 'FRONT' | 'BACK') => void
  frontLabel?: string
  backLabel?: string
  className?: string
}

export function SideSwitcher({
  side,
  onSideChange,
  frontLabel = 'Vorderseite',
  backLabel = 'Rückseite',
  className,
}: SideSwitcherProps) {
  return (
    <div className={cn('inline-flex items-center rounded-lg border p-1 bg-muted/30', className)}>
      <Button
        variant={side === 'FRONT' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSideChange('FRONT')}
        className="rounded-md"
      >
        {frontLabel}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onSideChange(side === 'FRONT' ? 'BACK' : 'FRONT')}
        className="mx-1"
        title="Seite wechseln"
      >
        <FlipHorizontal className="h-4 w-4" />
      </Button>
      <Button
        variant={side === 'BACK' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSideChange('BACK')}
        className="rounded-md"
      >
        {backLabel}
      </Button>
    </div>
  )
}

