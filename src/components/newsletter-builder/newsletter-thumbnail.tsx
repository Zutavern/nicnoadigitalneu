'use client'

import { useMemo } from 'react'
import type { NewsletterBlock, NewsletterBranding, HeadingLevel, SpacerSize } from '@/lib/newsletter-builder/types'
import { Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsletterThumbnailProps {
  blocks: NewsletterBlock[]
  branding: NewsletterBranding
  className?: string
}

/**
 * Kleine Vorschau eines Newsletters für die Übersichtsseite
 * Zeigt die Blöcke als vereinfachte Darstellung
 */
export function NewsletterThumbnail({ blocks, branding, className }: NewsletterThumbnailProps) {
  const primaryColor = branding.primaryColor || '#10b981'

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks]
  )

  // Leerer Zustand
  if (blocks.length === 0) {
    return (
      <div
        className={cn(
          'aspect-[3/4] bg-gray-100 rounded-lg flex flex-col items-center justify-center text-muted-foreground overflow-hidden',
          className
        )}
      >
        <Mail className="h-8 w-8 mb-2 opacity-50" />
        <span className="text-xs opacity-70">Leer</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'aspect-[3/4] rounded-lg overflow-hidden border shadow-sm',
        className
      )}
    >
      {/* Mini Header */}
      <div
        className="h-6 flex items-center justify-center"
        style={{ backgroundColor: primaryColor }}
      >
        {branding.logoUrl ? (
          <div className="h-3 w-8 bg-white/80 rounded" />
        ) : (
          <div className="flex items-center gap-0.5">
            <div className="h-2 w-6 bg-white rounded-sm" />
            <div className="h-2 w-4 bg-white/60 rounded-sm" />
          </div>
        )}
      </div>

      {/* Mini Content */}
      <div className="bg-white p-2 flex-1 overflow-hidden">
        {/* Zeige max 8 Blöcke */}
        {sortedBlocks.slice(0, 8).map((block) => (
          <MiniBlock key={block.id} block={block} primaryColor={primaryColor} />
        ))}
        {sortedBlocks.length > 8 && (
          <div className="text-center py-0.5">
            <span className="text-[6px] text-gray-400">
              +{sortedBlocks.length - 8} weitere
            </span>
          </div>
        )}
      </div>

      {/* Mini Footer with Unsubscribe */}
      <div className="bg-gray-50 border-t px-2 py-1">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          {[12, 14, 10, 12].map((w, i) => (
            <div
              key={i}
              className="h-0.5 rounded-full bg-gray-200"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <div className="text-center">
          <span className="text-[5px] text-gray-400">Hier abmelden</span>
        </div>
      </div>
    </div>
  )
}

interface MiniBlockProps {
  block: NewsletterBlock
  primaryColor: string
}

function MiniBlock({ block, primaryColor }: MiniBlockProps) {
  switch (block.type) {
    case 'HEADING':
      return <MiniHeading block={block} />
    case 'PARAGRAPH':
      return <MiniParagraph block={block} />
    case 'BUTTON':
      return <MiniButton block={block} primaryColor={primaryColor} />
    case 'IMAGE':
      return <MiniImage />
    case 'DIVIDER':
      return <MiniDivider />
    case 'SPACER':
      return <MiniSpacer block={block} />
    case 'TWO_COLUMN':
      return <MiniTwoColumn block={block} />
    case 'THREE_COLUMN':
      return <MiniThreeColumn block={block} />
    case 'SOCIAL_LINKS':
      return <MiniSocialLinks primaryColor={primaryColor} />
    case 'QUOTE':
      return <MiniQuote primaryColor={primaryColor} />
    case 'LIST':
      return <MiniList />
    case 'VIDEO':
      return <MiniVideo primaryColor={primaryColor} />
    case 'PRODUCT_CARD':
      return <MiniProductCard primaryColor={primaryColor} />
    case 'COUPON':
      return <MiniCoupon primaryColor={primaryColor} />
    case 'PROFILE':
      return <MiniProfile primaryColor={primaryColor} />
    default:
      return null
  }
}

function MiniHeading({ block }: { block: NewsletterBlock }) {
  const level = block.level || 1
  const align = block.align || 'left'

  const widths: Record<HeadingLevel, string> = {
    1: '70%',
    2: '55%',
    3: '45%',
  }

  const heights: Record<HeadingLevel, string> = {
    1: 'h-2',
    2: 'h-1.5',
    3: 'h-1.5',
  }

  return (
    <div className="mb-1" style={{ textAlign: align }}>
      <div
        className={cn('rounded-sm bg-gray-800', heights[level])}
        style={{
          width: widths[level],
          marginLeft: align === 'center' ? 'auto' : align === 'right' ? 'auto' : 0,
          marginRight: align === 'center' ? 'auto' : align === 'right' ? 0 : 'auto',
        }}
      />
    </div>
  )
}

function MiniParagraph({ block }: { block: NewsletterBlock }) {
  const align = block.align || 'left'

  return (
    <div className="mb-1 space-y-0.5" style={{ textAlign: align }}>
      <div className="h-1 rounded-sm bg-gray-300" style={{ width: '90%' }} />
      <div className="h-1 rounded-sm bg-gray-300" style={{ width: '75%' }} />
    </div>
  )
}

function MiniButton({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const align = block.align || 'center'

  return (
    <div className="mb-1 flex" style={{ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
      <div
        className="h-2 w-8 rounded-sm"
        style={{ backgroundColor: primaryColor }}
      />
    </div>
  )
}

function MiniImage() {
  return (
    <div className="mb-1 flex justify-center">
      <div className="h-6 w-10 rounded-sm bg-gray-200" />
    </div>
  )
}

function MiniDivider() {
  return <hr className="my-1 border-gray-200" />
}

function MiniSpacer({ block }: { block: NewsletterBlock }) {
  const size = block.spacerSize || 'MEDIUM'
  const heights: Record<SpacerSize, number> = {
    SMALL: 2,
    MEDIUM: 4,
    LARGE: 6,
  }

  return <div style={{ height: `${heights[size]}px` }} />
}

function MiniTwoColumn({ block }: { block: NewsletterBlock }) {
  const widths = block.columnWidths || [50, 50]

  return (
    <div className="mb-1 flex gap-0.5">
      <div
        className="h-4 rounded-sm bg-gray-100"
        style={{ width: `${widths[0]}%` }}
      />
      <div
        className="h-4 rounded-sm bg-gray-100"
        style={{ width: `${widths[1]}%` }}
      />
    </div>
  )
}

function MiniThreeColumn({ block }: { block: NewsletterBlock }) {
  const widths = block.columnWidths || [33, 34, 33]

  return (
    <div className="mb-1 flex gap-0.5">
      <div className="h-4 rounded-sm bg-gray-100" style={{ width: `${widths[0]}%` }} />
      <div className="h-4 rounded-sm bg-gray-100" style={{ width: `${widths[1]}%` }} />
      <div className="h-4 rounded-sm bg-gray-100" style={{ width: `${widths[2]}%` }} />
    </div>
  )
}

function MiniSocialLinks({ primaryColor }: { primaryColor: string }) {
  return (
    <div className="mb-1 flex justify-center gap-0.5">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: primaryColor }}
        />
      ))}
    </div>
  )
}

function MiniQuote({ primaryColor }: { primaryColor: string }) {
  return (
    <div className="mb-1 flex gap-0.5">
      <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: primaryColor }} />
      <div className="flex-1 space-y-0.5">
        <div className="h-1 rounded-sm bg-gray-200" style={{ width: '85%' }} />
        <div className="h-1 rounded-sm bg-gray-300" style={{ width: '40%' }} />
      </div>
    </div>
  )
}

function MiniList() {
  return (
    <div className="mb-1 space-y-0.5 pl-2">
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 rounded-full bg-gray-400" />
        <div className="h-1 rounded-sm bg-gray-300" style={{ width: '70%' }} />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 rounded-full bg-gray-400" />
        <div className="h-1 rounded-sm bg-gray-300" style={{ width: '55%' }} />
      </div>
    </div>
  )
}

function MiniVideo({ primaryColor }: { primaryColor: string }) {
  return (
    <div className="mb-1 flex justify-center">
      <div className="relative h-6 w-10 rounded-sm bg-gray-200 flex items-center justify-center">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: primaryColor }}
        />
      </div>
    </div>
  )
}

function MiniProductCard({ primaryColor }: { primaryColor: string }) {
  return (
    <div className="mb-1 flex justify-center">
      <div className="w-12 border rounded-sm overflow-hidden">
        <div className="h-4 bg-gray-200" />
        <div className="p-0.5 space-y-0.5">
          <div className="h-1 rounded-sm bg-gray-400" style={{ width: '80%' }} />
          <div className="h-1 rounded-sm" style={{ width: '50%', backgroundColor: primaryColor }} />
        </div>
      </div>
    </div>
  )
}

function MiniCoupon({ primaryColor }: { primaryColor: string }) {
  return (
    <div className="mb-1 flex justify-center">
      <div
        className="h-4 w-14 rounded-sm border border-dashed flex items-center justify-center"
        style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}15` }}
      >
        <div className="h-1.5 w-6 rounded-sm bg-white" />
      </div>
    </div>
  )
}

function MiniProfile({ primaryColor }: { primaryColor: string }) {
  return (
    <div className="mb-1 flex justify-center">
      <div className="flex flex-col items-center">
        <div
          className="w-3 h-3 rounded-full mb-0.5"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="h-1 w-4 rounded-sm bg-gray-400" />
      </div>
    </div>
  )
}
