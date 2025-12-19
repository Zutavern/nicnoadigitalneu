'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, Ban, ImageIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Background {
  id: string
  url: string
  filename: string
  type: string
}

interface BackgroundSelectorProps {
  selectedBackgroundId: string | null
  onBackgroundChange: (backgroundId: string | null, backgroundUrl: string | null) => void
  className?: string
}

export function BackgroundSelector({
  selectedBackgroundId,
  onBackgroundChange,
  className,
}: BackgroundSelectorProps) {
  const [backgrounds, setBackgrounds] = useState<Background[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchBackgrounds = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/pricelist/available-backgrounds')
      if (res.ok) {
        const data = await res.json()
        setBackgrounds(data.backgrounds || [])
      }
    } catch (error) {
      console.error('Error fetching backgrounds:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBackgrounds()
  }, [])

  const handleSelect = (background: Background | null) => {
    if (background) {
      onBackgroundChange(background.id, background.url)
    } else {
      onBackgroundChange(null, null)
    }
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Hintergrund</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[210/297] rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Hintergrund</h4>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={fetchBackgrounds}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {/* Kein Hintergrund */}
        <button
          onClick={() => handleSelect(null)}
          className={cn(
            'relative aspect-[210/297] rounded-md border-2 cursor-pointer transition-all overflow-hidden',
            'hover:border-primary/50',
            selectedBackgroundId === null 
              ? 'border-primary ring-1 ring-primary/30' 
              : 'border-border'
          )}
        >
          <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-1">
            <Ban className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground">Keiner</span>
          </div>
          {selectedBackgroundId === null && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
          )}
        </button>
        
        {/* Verfügbare Hintergründe */}
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => handleSelect(bg)}
            className={cn(
              'relative aspect-[210/297] rounded-md border-2 cursor-pointer transition-all overflow-hidden',
              'hover:border-primary/50',
              selectedBackgroundId === bg.id 
                ? 'border-primary ring-1 ring-primary/30' 
                : 'border-border'
            )}
          >
            <img
              src={bg.url}
              alt={bg.filename}
              className="w-full h-full object-cover"
            />
            {selectedBackgroundId === bg.id && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
      
      {backgrounds.length === 0 && (
        <div className="text-center py-4 border border-dashed rounded-md">
          <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">
            Keine Hintergründe verfügbar
          </p>
        </div>
      )}
    </div>
  )
}




