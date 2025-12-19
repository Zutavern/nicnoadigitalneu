'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  FileText, 
  Check, 
  Clock, 
  MoreVertical, 
  RefreshCw,
  Home,
  User,
  Users,
  Scissors,
  ImageIcon,
  Mail,
  FileWarning,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HomepagePage } from '@/lib/homepage-builder'

interface PageListProps {
  pages: HomepagePage[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
  onRegenerate: (slug: string) => void
  isGenerating: boolean
}

// Icons für verschiedene Seiten-Typen
const PAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'home': Home,
  'ueber-mich': User,
  'ueber-uns': Users,
  'team': Users,
  'portfolio': ImageIcon,
  'galerie': ImageIcon,
  'leistungen': Scissors,
  'services': Scissors,
  'preise': FileText,
  'kontakt': Mail,
  'impressum': FileWarning,
}

export function PageList({ pages, selectedSlug, onSelect, onRegenerate, isGenerating }: PageListProps) {

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Seiten
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {pages.filter(p => p.isGenerated).length} von {pages.length} generiert
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {pages.map((page) => {
            const isSelected = selectedSlug === page.slug
            const Icon = PAGE_ICONS[page.slug] || FileText
            
            return (
              <div
                key={page.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
                onClick={() => onSelect(page.slug)}
              >
                <Icon className={cn(
                  "h-4 w-4 shrink-0",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{page.title}</p>
                  <p className={cn(
                    "text-xs truncate",
                    isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    /{page.slug}
                  </p>
                </div>

                {/* Status */}
                {page.isGenerated ? (
                  <Check className={cn(
                    "h-4 w-4 shrink-0",
                    isSelected ? "text-primary-foreground" : "text-green-500"
                  )} />
                ) : isGenerating ? (
                  <Loader2 className={cn(
                    "h-4 w-4 shrink-0 animate-spin",
                    isSelected ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                ) : (
                  <Clock className={cn(
                    "h-4 w-4 shrink-0",
                    isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                  )} />
                )}

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                        isSelected && "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        onRegenerate(page.slug)
                      }}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Neu generieren
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="p-4 border-t space-y-2">
        <p className="text-xs text-muted-foreground">Legende:</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            Generiert
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            Ausstehend
          </span>
        </div>
      </div>
    </div>
  )
}

