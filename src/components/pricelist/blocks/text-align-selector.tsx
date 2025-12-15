'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TextAlignSelectorProps {
  value?: 'left' | 'center' | 'right' | null
  onChange: (value: 'left' | 'center' | 'right') => void
  className?: string
}

export function TextAlignSelector({ value, onChange, className }: TextAlignSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value || 'left'}
      onValueChange={(v) => v && onChange(v as 'left' | 'center' | 'right')}
      className={cn('justify-start', className)}
    >
      <ToggleGroupItem value="left" aria-label="Linksbündig" className="h-8 w-8 p-0">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Zentriert" className="h-8 w-8 p-0">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Rechtsbündig" className="h-8 w-8 p-0">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

// Helper für Inline-Styles
export function getTextAlignStyle(align?: 'left' | 'center' | 'right' | null): React.CSSProperties {
  return {
    textAlign: align || 'left',
  }
}

// Tailwind-Klasse für Ausrichtung
export function getTextAlignClass(align?: 'left' | 'center' | 'right' | null): string {
  switch (align) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    default:
      return 'text-left'
  }
}

