'use client'

import type { PriceBlockClient } from '@/lib/pricelist/types'
import { FileStack } from 'lucide-react'

interface PageBreakBlockProps {
  block: PriceBlockClient
  isEditing: boolean
}

export function PageBreakBlock({ isEditing }: PageBreakBlockProps) {
  return (
    <div className="relative py-4">
      {/* Visuelle Darstellung des Seitenumbruchs */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border border-dashed border-b" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
          <FileStack className="h-3.5 w-3.5" />
          <span>Seitenumbruch</span>
        </div>
        <div className="flex-1 h-px bg-border border-dashed border-b" />
      </div>
      
      {/* Info bei Bearbeitung */}
      {isEditing && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Der Inhalt nach diesem Block erscheint auf einer neuen Seite im PDF
        </p>
      )}
    </div>
  )
}

