'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { getTheme, getThemeCSS } from '@/lib/pricelist/themes'
import { getFont } from '@/lib/pricelist/fonts'
import type { PriceListClient, PriceBlockClient } from '@/lib/pricelist/types'
import { LayoutTemplate } from 'lucide-react'

interface PriceListThumbnailProps {
  priceList: PriceListClient
  className?: string
}

/**
 * Kleine Vorschau einer Preisliste für die Übersichtsseite
 * Zeigt die Blöcke als vereinfachte Darstellung
 */
export function PriceListThumbnail({ priceList, className }: PriceListThumbnailProps) {
  const theme = useMemo(() => getTheme(priceList.theme), [priceList.theme])
  const font = useMemo(() => getFont(priceList.fontFamily), [priceList.fontFamily])
  const cssVars = useMemo(() => getThemeCSS(theme), [theme])

  const blocks = priceList.blocks || []

  // CSS-Variablen als Objekt
  const styleVars = useMemo(() => {
    return Object.fromEntries(
      cssVars.split(';').filter(Boolean).map(s => {
        const [key, value] = s.split(':').map(s => s.trim())
        return [key, value]
      })
    )
  }, [cssVars])

  // Vereinfachte Block-Darstellung
  const renderMiniBlock = (block: PriceBlockClient, index: number) => {
    const baseStyle = { fontFamily: font?.family || 'inherit' }

    switch (block.type) {
      case 'SECTION_HEADER':
        return (
          <div key={block.id} className="mb-1.5 mt-2 first:mt-0">
            <div
              className="h-2.5 rounded-sm"
              style={{ 
                ...baseStyle,
                backgroundColor: 'var(--pl-primary)',
                width: `${Math.min(60 + (block.title?.length || 0) * 2, 90)}%`,
              }}
            />
            {block.subtitle && (
              <div
                className="h-1.5 mt-0.5 rounded-sm opacity-50"
                style={{ 
                  backgroundColor: 'var(--pl-muted)',
                  width: '50%',
                }}
              />
            )}
          </div>
        )

      case 'PRICE_ITEM':
        return (
          <div key={block.id} className="flex justify-between items-center py-0.5">
            <div
              className="h-1.5 rounded-sm flex-1"
              style={{ 
                backgroundColor: 'var(--pl-text)',
                maxWidth: '65%',
              }}
            />
            <div
              className="h-1.5 rounded-sm ml-2"
              style={{ 
                backgroundColor: 'var(--pl-primary)',
                width: '15%',
              }}
            />
          </div>
        )

      case 'TEXT':
        return (
          <div key={block.id} className="py-0.5">
            <div
              className="h-1 rounded-sm"
              style={{ 
                backgroundColor: 'var(--pl-muted)',
                width: '80%',
              }}
            />
          </div>
        )

      case 'DIVIDER':
        return (
          <div key={block.id} className="py-1">
            <div
              className="h-px"
              style={{ backgroundColor: 'var(--pl-divider)' }}
            />
          </div>
        )

      case 'SPACER':
        const height = block.spacerSize === 'SMALL' ? 4 : block.spacerSize === 'LARGE' ? 12 : 8
        return <div key={block.id} style={{ height }} />

      case 'IMAGE':
        return (
          <div key={block.id} className="py-1 flex justify-center">
            <div
              className="h-8 w-full rounded bg-muted/50"
              style={{ backgroundColor: 'var(--pl-muted)', opacity: 0.3 }}
            />
          </div>
        )

      case 'INFO_BOX':
        return (
          <div key={block.id} className="py-0.5">
            <div
              className="h-4 rounded-sm border-l-2"
              style={{ 
                backgroundColor: 'var(--pl-muted)',
                opacity: 0.2,
                borderColor: 'var(--pl-accent)',
              }}
            />
          </div>
        )

      case 'BADGE':
        return (
          <div key={block.id} className="py-0.5 flex justify-center">
            <div
              className="h-2 w-8 rounded-full"
              style={{ backgroundColor: 'var(--pl-accent)' }}
            />
          </div>
        )

      case 'QUOTE':
        return (
          <div key={block.id} className="py-0.5">
            <div
              className="h-3 rounded-sm border-l-2 pl-2"
              style={{ 
                backgroundColor: 'var(--pl-muted)',
                opacity: 0.15,
                borderColor: 'var(--pl-accent)',
              }}
            />
          </div>
        )

      case 'TWO_COLUMN':
      case 'THREE_COLUMN':
        const colCount = block.type === 'TWO_COLUMN' ? 2 : 3
        return (
          <div key={block.id} className="py-0.5 flex gap-1">
            {Array.from({ length: colCount }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-6 rounded-sm"
                style={{ 
                  backgroundColor: 'var(--pl-muted)',
                  opacity: 0.15,
                }}
              />
            ))}
          </div>
        )

      case 'CONTACT_INFO':
        return (
          <div key={block.id} className="py-0.5 space-y-0.5">
            {[40, 55, 35].map((w, i) => (
              <div
                key={i}
                className="h-1 rounded-sm"
                style={{ 
                  backgroundColor: 'var(--pl-muted)',
                  width: `${w}%`,
                }}
              />
            ))}
          </div>
        )

      case 'FOOTER':
        return (
          <div key={block.id} className="pt-1 mt-auto border-t" style={{ borderColor: 'var(--pl-divider)' }}>
            <div
              className="h-1 mx-auto rounded-sm"
              style={{ 
                backgroundColor: 'var(--pl-muted)',
                width: '60%',
              }}
            />
          </div>
        )

      default:
        return (
          <div key={block.id} className="py-0.5">
            <div
              className="h-1.5 rounded-sm"
              style={{ 
                backgroundColor: 'var(--pl-muted)',
                opacity: 0.3,
                width: '70%',
              }}
            />
          </div>
        )
    }
  }

  // Leerer Zustand
  if (blocks.length === 0) {
    return (
      <div 
        className={cn(
          'aspect-[210/297] bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground overflow-hidden',
          className
        )}
      >
        {priceList.backgroundUrl ? (
          <img
            src={priceList.backgroundUrl}
            alt={priceList.name}
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <>
            <LayoutTemplate className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs opacity-70">Keine Blöcke</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'aspect-[210/297] rounded-lg overflow-hidden relative',
        className
      )}
      style={styleVars}
    >
      {/* Hintergrundbild */}
      {priceList.backgroundUrl && (
        <img
          src={priceList.backgroundUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Content */}
      <div 
        className="relative z-10 p-3 h-full flex flex-col"
        style={{ 
          backgroundColor: priceList.backgroundUrl ? 'transparent' : 'var(--pl-background, white)',
        }}
      >
        {/* Titel */}
        {priceList.showLogo && (
          <div className="mb-2 text-center">
            <div
              className="h-3 mx-auto rounded-sm"
              style={{ 
                backgroundColor: 'var(--pl-primary)',
                width: '60%',
              }}
            />
          </div>
        )}

        {/* Blöcke (max 15 anzeigen für Performance) */}
        <div className="flex-1 overflow-hidden">
          {blocks.slice(0, 15).map((block, index) => renderMiniBlock(block, index))}
          {blocks.length > 15 && (
            <div className="text-center py-1">
              <span 
                className="text-[6px]"
                style={{ color: 'var(--pl-muted)' }}
              >
                +{blocks.length - 15} weitere
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

