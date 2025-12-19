'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Maximize2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaddingEditorProps {
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  onChange: (padding: {
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
  }) => void
  className?: string
}

const DEFAULT_PADDING = {
  top: 20,
  bottom: 20,
  left: 15,
  right: 15,
}

export function PaddingEditor({
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  onChange,
  className,
}: PaddingEditorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleReset = useCallback(() => {
    onChange({
      paddingTop: DEFAULT_PADDING.top,
      paddingBottom: DEFAULT_PADDING.bottom,
      paddingLeft: DEFAULT_PADDING.left,
      paddingRight: DEFAULT_PADDING.right,
    })
  }, [onChange])

  const hasCustomPadding = 
    paddingTop !== DEFAULT_PADDING.top ||
    paddingBottom !== DEFAULT_PADDING.bottom ||
    paddingLeft !== DEFAULT_PADDING.left ||
    paddingRight !== DEFAULT_PADDING.right

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2', className, hasCustomPadding && 'border-primary')}
        >
          <Maximize2 className="h-4 w-4" />
          Ränder
          {hasCustomPadding && (
            <span className="text-xs text-muted-foreground">
              ({paddingLeft}/{paddingTop}/{paddingRight}/{paddingBottom})
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Seitenränder (mm)</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2 text-xs"
              disabled={!hasCustomPadding}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Zurücksetzen
            </Button>
          </div>

          {/* Visual Preview */}
          <div className="relative border rounded-lg p-2 bg-muted/30">
            <div className="aspect-[210/297] bg-card border rounded relative">
              {/* Padding Visualization */}
              <div
                className="absolute bg-primary/10 border-2 border-dashed border-primary/30 rounded"
                style={{
                  top: `${(paddingTop / 297) * 100}%`,
                  bottom: `${(paddingBottom / 297) * 100}%`,
                  left: `${(paddingLeft / 210) * 100}%`,
                  right: `${(paddingRight / 210) * 100}%`,
                }}
              />
              
              {/* Labels */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] text-muted-foreground">Inhalt</span>
              </div>
              
              {/* Top Value */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 bg-background px-1 rounded text-[9px] text-muted-foreground">
                {paddingTop}mm
              </div>
              
              {/* Bottom Value */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 bg-background px-1 rounded text-[9px] text-muted-foreground">
                {paddingBottom}mm
              </div>
              
              {/* Left Value */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 bg-background px-1 rounded text-[9px] text-muted-foreground rotate-90">
                {paddingLeft}mm
              </div>
              
              {/* Right Value */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 bg-background px-1 rounded text-[9px] text-muted-foreground -rotate-90">
                {paddingRight}mm
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            {/* Top */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Oben</Label>
                <span className="text-xs text-muted-foreground font-mono">{paddingTop} mm</span>
              </div>
              <Slider
                value={[paddingTop]}
                onValueChange={([value]) => onChange({ paddingTop: value })}
                min={0}
                max={60}
                step={1}
                className="w-full"
              />
            </div>

            {/* Bottom */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Unten</Label>
                <span className="text-xs text-muted-foreground font-mono">{paddingBottom} mm</span>
              </div>
              <Slider
                value={[paddingBottom]}
                onValueChange={([value]) => onChange({ paddingBottom: value })}
                min={0}
                max={60}
                step={1}
                className="w-full"
              />
            </div>

            {/* Left */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Links</Label>
                <span className="text-xs text-muted-foreground font-mono">{paddingLeft} mm</span>
              </div>
              <Slider
                value={[paddingLeft]}
                onValueChange={([value]) => onChange({ paddingLeft: value })}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Right */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Rechts</Label>
                <span className="text-xs text-muted-foreground font-mono">{paddingRight} mm</span>
              </div>
              <Slider
                value={[paddingRight]}
                onValueChange={([value]) => onChange({ paddingRight: value })}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => onChange({ paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10 })}
            >
              Eng
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => onChange({ paddingTop: 20, paddingBottom: 20, paddingLeft: 15, paddingRight: 15 })}
            >
              Normal
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => onChange({ paddingTop: 30, paddingBottom: 30, paddingLeft: 25, paddingRight: 25 })}
            >
              Weit
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}




