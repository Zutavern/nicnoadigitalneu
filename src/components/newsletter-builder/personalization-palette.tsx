'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Building, Calendar, Copy, Check, Sparkles } from 'lucide-react'
import { PERSONALIZATION_PLACEHOLDERS } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface PersonalizationPaletteProps {
  onInsert: (placeholder: string) => void
  className?: string
}

// Icon-Mapping für Platzhalter
const PLACEHOLDER_ICONS: Record<string, React.ReactNode> = {
  '{{name}}': <User className="h-3.5 w-3.5" />,
  '{{firstName}}': <User className="h-3.5 w-3.5" />,
  '{{email}}': <Mail className="h-3.5 w-3.5" />,
  '{{company}}': <Building className="h-3.5 w-3.5" />,
  '{{date}}': <Calendar className="h-3.5 w-3.5" />,
  '{{year}}': <Calendar className="h-3.5 w-3.5" />,
}

export function PersonalizationPalette({ onInsert, className }: PersonalizationPaletteProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleInsert = (key: string) => {
    onInsert(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const handleCopy = async (key: string) => {
    await navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn('gap-2', className)}
        >
          <Sparkles className="h-4 w-4" />
          Personalisierung
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="px-3 py-2 border-b">
          <h4 className="font-medium text-sm">Platzhalter einfügen</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Klicke auf einen Platzhalter, um ihn einzufügen
          </p>
        </div>
        
        <div className="p-2 space-y-1">
          {PERSONALIZATION_PLACEHOLDERS.map((placeholder) => (
            <div
              key={placeholder.key}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group cursor-pointer"
              onClick={() => handleInsert(placeholder.key)}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded bg-primary/10 text-primary">
                  {PLACEHOLDER_ICONS[placeholder.key] || <Sparkles className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <div className="text-sm font-medium">{placeholder.label}</div>
                  <div className="text-xs text-muted-foreground">{placeholder.description}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5">
                  {placeholder.key}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(placeholder.key)
                      }}
                    >
                      {copiedKey === placeholder.key ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Kopieren</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-3 py-2 border-t bg-muted/50">
          <p className="text-[11px] text-muted-foreground">
            <strong>Tipp:</strong> Platzhalter werden beim Versand automatisch mit den Empfängerdaten ersetzt.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}



