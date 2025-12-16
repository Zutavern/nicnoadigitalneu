'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Paintbrush, X } from 'lucide-react'

interface BackgroundColorSelectorProps {
  value: string | null | undefined
  onChange: (color: string | null) => void
  className?: string
}

// Vordefinierte Farben
const PRESET_COLORS = [
  // Transparent/Keine
  { name: 'Keine', value: null, class: 'bg-transparent border-2 border-dashed' },
  // Neutral
  { name: 'Weiß', value: '#ffffff', class: 'bg-white' },
  { name: 'Hellgrau', value: '#f3f4f6', class: 'bg-gray-100' },
  { name: 'Grau', value: '#e5e7eb', class: 'bg-gray-200' },
  // Akzentfarben (Pastelltöne)
  { name: 'Blau', value: '#dbeafe', class: 'bg-blue-100' },
  { name: 'Grün', value: '#dcfce7', class: 'bg-green-100' },
  { name: 'Gelb', value: '#fef9c3', class: 'bg-yellow-100' },
  { name: 'Orange', value: '#ffedd5', class: 'bg-orange-100' },
  { name: 'Rot', value: '#fee2e2', class: 'bg-red-100' },
  { name: 'Pink', value: '#fce7f3', class: 'bg-pink-100' },
  { name: 'Lila', value: '#f3e8ff', class: 'bg-purple-100' },
  { name: 'Türkis', value: '#ccfbf1', class: 'bg-teal-100' },
  // Intensivere Farben
  { name: 'Blau dunkel', value: '#bfdbfe', class: 'bg-blue-200' },
  { name: 'Grün dunkel', value: '#bbf7d0', class: 'bg-green-200' },
  { name: 'Gelb dunkel', value: '#fef08a', class: 'bg-yellow-200' },
  { name: 'Gold', value: '#fde68a', class: 'bg-amber-200' },
]

export function BackgroundColorSelector({
  value,
  onChange,
  className,
}: BackgroundColorSelectorProps) {
  const selectedColor = PRESET_COLORS.find(c => c.value === value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-8 gap-2', className)}
        >
          <div
            className={cn(
              'h-4 w-4 rounded border',
              selectedColor?.class || 'bg-transparent border-dashed'
            )}
            style={value && !selectedColor ? { backgroundColor: value } : undefined}
          />
          <Paintbrush className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hintergrundfarbe</span>
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onChange(null)}
              >
                <X className="h-3 w-3 mr-1" />
                Entfernen
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => onChange(color.value)}
                className={cn(
                  'h-8 w-full rounded border-2 transition-all hover:scale-105',
                  color.class,
                  value === color.value
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'border-transparent hover:border-primary/30'
                )}
                title={color.name}
              />
            ))}
          </div>

          {/* Custom Color Input */}
          <div className="pt-2 border-t">
            <label className="text-xs text-muted-foreground">Eigene Farbe (Hex)</label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={value || '#ffffff'}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border"
              />
              <input
                type="text"
                value={value || ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '' || /^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                    onChange(val || null)
                  }
                }}
                placeholder="#ffffff"
                className="flex-1 h-8 px-2 text-sm border rounded bg-background"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Helper-Funktion für Style-Objekt
export function getBackgroundColorStyle(color: string | null | undefined): React.CSSProperties {
  if (!color) return {}
  return { backgroundColor: color }
}

