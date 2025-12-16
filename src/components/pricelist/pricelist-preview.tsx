'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { getTheme, getThemeCSS } from '@/lib/pricelist/themes'
import { getFont } from '@/lib/pricelist/fonts'
import { formatPrice, SPACER_SIZE_CONFIGS } from '@/lib/pricelist/types'
import type { PriceListClient, PriceBlockClient } from '@/lib/pricelist/types'

// Helper für Textausrichtung
function getTextAlignStyle(align?: 'left' | 'center' | 'right' | null): React.CSSProperties {
  return { textAlign: align || 'left' }
}

interface PriceListPreviewProps {
  priceList: PriceListClient
  blocks: PriceBlockClient[]
  scale?: number
  className?: string
}

export function PriceListPreview({ priceList, blocks, scale = 0.5, className }: PriceListPreviewProps) {
  const theme = useMemo(() => getTheme(priceList.theme), [priceList.theme])
  const font = useMemo(() => getFont(priceList.fontFamily), [priceList.fontFamily])
  const cssVars = useMemo(() => getThemeCSS(theme), [theme])

  // A4 Größe in Pixeln (bei 96 DPI: 210mm x 297mm)
  const A4_WIDTH = 794
  const A4_HEIGHT = 1123

  const renderBlock = (block: PriceBlockClient) => {
    switch (block.type) {
      case 'SECTION_HEADER':
        return (
          <div className="mb-4 mt-6 first:mt-0" style={getTextAlignStyle(block.textAlign)}>
            <h2
              className="font-semibold"
              style={{
                fontFamily: 'var(--pl-header-font)',
                fontSize: 'var(--pl-header-size)',
                fontWeight: 'var(--pl-header-weight)',
                textTransform: theme.headerTransform,
                letterSpacing: 'var(--pl-letter-spacing)',
                color: 'var(--pl-primary)',
              }}
            >
              {block.title}
            </h2>
            {block.subtitle && (
              <p
                className="mt-1"
                style={{
                  fontFamily: 'var(--pl-body-font)',
                  fontSize: 'var(--pl-subheader-size)',
                  color: 'var(--pl-muted)',
                }}
              >
                {block.subtitle}
              </p>
            )}
            {theme.sectionUnderline && (
              <div
                className={cn(
                  "mt-2 h-0.5 w-12",
                  block.textAlign === 'center' && 'mx-auto',
                  block.textAlign === 'right' && 'ml-auto'
                )}
                style={{ backgroundColor: 'var(--pl-accent)' }}
              />
            )}
          </div>
        )

      case 'PRICE_ITEM':
        const hasVariants = block.variants.length > 0
        return (
          <div className="py-1.5" style={getTextAlignStyle(block.textAlign)}>
            {hasVariants ? (
              // Mit Varianten - Tabellen-Layout
              <div>
                <div
                  className="font-medium mb-1"
                  style={{
                    fontFamily: 'var(--pl-body-font)',
                    fontSize: 'var(--pl-body-size)',
                    color: 'var(--pl-text)',
                  }}
                >
                  {block.itemName}
                </div>
                <div className="grid gap-1 ml-4" style={{ gridTemplateColumns: `repeat(${block.variants.length}, 1fr)` }}>
                  {block.variants.map((variant) => (
                    <div key={variant.id} className="text-center">
                      <div
                        className="text-xs mb-0.5"
                        style={{ color: 'var(--pl-muted)', fontFamily: 'var(--pl-body-font)' }}
                      >
                        {variant.label}
                      </div>
                      <div
                        className="font-medium"
                        style={{
                          fontFamily: 'var(--pl-body-font)',
                          fontSize: 'var(--pl-price-size)',
                          color: 'var(--pl-primary)',
                        }}
                      >
                        {variant.price.toFixed(0)} €
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Ohne Varianten
              <div className="flex items-baseline gap-2">
                <span
                  className="flex-1"
                  style={{
                    fontFamily: 'var(--pl-body-font)',
                    fontSize: 'var(--pl-body-size)',
                    color: 'var(--pl-text)',
                  }}
                >
                  {block.itemName}
                  {theme.priceAlignment === 'dotted' && (
                    <span className="mx-1" style={{ color: 'var(--pl-muted)' }}>
                      {'·'.repeat(20)}
                    </span>
                  )}
                </span>
                <span
                  className="font-medium"
                  style={{
                    fontFamily: 'var(--pl-body-font)',
                    fontSize: 'var(--pl-price-size)',
                    color: 'var(--pl-primary)',
                  }}
                >
                  {formatPrice(block)}
                </span>
              </div>
            )}
            {block.description && (
              <p
                className="mt-0.5 ml-4"
                style={{
                  fontFamily: 'var(--pl-body-font)',
                  fontSize: '0.75rem',
                  color: 'var(--pl-muted)',
                }}
              >
                {block.description}
              </p>
            )}
            {block.qualifier && (
              <p
                className="mt-0.5 italic"
                style={{
                  fontFamily: 'var(--pl-body-font)',
                  fontSize: '0.75rem',
                  color: 'var(--pl-accent)',
                }}
              >
                {block.qualifier}
              </p>
            )}
          </div>
        )

      case 'TEXT':
        return (
          <p
            className="py-2"
            style={{
              fontFamily: 'var(--pl-body-font)',
              fontSize: 'var(--pl-body-size)',
              color: 'var(--pl-muted)',
              lineHeight: 'var(--pl-line-height)',
              ...getTextAlignStyle(block.textAlign),
            }}
          >
            {block.content}
          </p>
        )

      case 'DIVIDER':
        return (
          <div className="py-3">
            <div
              className="h-px w-full"
              style={{ backgroundColor: 'var(--pl-divider)' }}
            />
          </div>
        )

      case 'SPACER':
        const spacerConfig = SPACER_SIZE_CONFIGS[block.spacerSize || 'MEDIUM']
        return <div style={{ height: spacerConfig.heightMm * 3.78 }} />

      case 'IMAGE':
        if (!block.imageUrl) return null
        return (
          <div 
            className={cn(
              "py-2 flex",
              (block.textAlign === 'center' || !block.textAlign) && 'justify-center',
              block.textAlign === 'right' && 'justify-end',
              block.textAlign === 'left' && 'justify-start'
            )}
          >
            <img
              src={block.imageUrl}
              alt=""
              className="max-h-24 object-contain"
            />
          </div>
        )

      case 'INFO_BOX':
        return (
          <div
            className={cn(
              'py-2 px-3 my-2 rounded',
              theme.infoBoxStyle === 'filled' && 'bg-black/5',
              theme.infoBoxStyle === 'bordered' && 'border',
              theme.infoBoxStyle === 'subtle' && 'border-l-2'
            )}
            style={{
              borderColor: 'var(--pl-accent)',
              ...getTextAlignStyle(block.textAlign),
            }}
          >
            <p
              style={{
                fontFamily: 'var(--pl-body-font)',
                fontSize: '0.75rem',
                color: 'var(--pl-secondary)',
              }}
            >
              {block.content}
            </p>
          </div>
        )

      // Layout Container
      case 'TWO_COLUMN':
        const twoColWidths = block.columnWidths || [50, 50]
        const leftBlocks = block.childBlocks?.filter(b => b.columnIndex === 0).sort((a, b) => a.sortOrder - b.sortOrder) || []
        const rightBlocks = block.childBlocks?.filter(b => b.columnIndex === 1).sort((a, b) => a.sortOrder - b.sortOrder) || []
        return (
          <div className="flex gap-6 py-2">
            <div className="space-y-1" style={{ width: `${twoColWidths[0]}%` }}>
              {leftBlocks.map(childBlock => (
                <div key={childBlock.id}>{renderBlock(childBlock)}</div>
              ))}
            </div>
            <div className="space-y-1" style={{ width: `${twoColWidths[1]}%` }}>
              {rightBlocks.map(childBlock => (
                <div key={childBlock.id}>{renderBlock(childBlock)}</div>
              ))}
            </div>
          </div>
        )

      case 'THREE_COLUMN':
        const threeColWidths = block.columnWidths || [33.33, 33.33, 33.34]
        const col1 = block.childBlocks?.filter(b => b.columnIndex === 0).sort((a, b) => a.sortOrder - b.sortOrder) || []
        const col2 = block.childBlocks?.filter(b => b.columnIndex === 1).sort((a, b) => a.sortOrder - b.sortOrder) || []
        const col3 = block.childBlocks?.filter(b => b.columnIndex === 2).sort((a, b) => a.sortOrder - b.sortOrder) || []
        return (
          <div className="flex gap-4 py-2">
            {[col1, col2, col3].map((colBlocks, idx) => (
              <div key={idx} className="space-y-1" style={{ width: `${threeColWidths[idx]}%` }}>
                {colBlocks.map(childBlock => (
                  <div key={childBlock.id}>{renderBlock(childBlock)}</div>
                ))}
              </div>
            ))}
          </div>
        )

      // Badge
      case 'BADGE':
        const badgeClasses = cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
          block.badgeStyle === 'outline' && 'border-2 border-current bg-transparent',
          block.badgeStyle === 'gradient' && 'bg-gradient-to-r text-white',
          block.badgeStyle === 'filled' && block.badgeColor === 'primary' && 'bg-black text-white',
          block.badgeStyle === 'filled' && block.badgeColor === 'accent' && 'bg-amber-500 text-white',
          block.badgeStyle === 'filled' && block.badgeColor === 'success' && 'bg-emerald-500 text-white',
          block.badgeStyle === 'filled' && block.badgeColor === 'danger' && 'bg-rose-500 text-white',
          block.badgeStyle === 'filled' && block.badgeColor === 'gold' && 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white'
        )
        return (
          <div className="py-2" style={getTextAlignStyle(block.textAlign)}>
            <span className={badgeClasses} style={{ color: block.badgeStyle === 'outline' ? 'var(--pl-primary)' : undefined }}>
              {block.badgeText || 'Badge'}
            </span>
          </div>
        )

      // Quote
      case 'QUOTE':
        return (
          <div 
            className="py-3 pl-4 border-l-2" 
            style={{ 
              borderColor: 'var(--pl-accent)',
              ...getTextAlignStyle(block.textAlign),
            }}
          >
            <p
              className="italic"
              style={{
                fontFamily: 'var(--pl-body-font)',
                fontSize: '0.875rem',
                color: 'var(--pl-muted)',
              }}
            >
              "{block.content}"
            </p>
            {block.title && (
              <p
                className="mt-1 text-xs font-medium"
                style={{ color: 'var(--pl-text)' }}
              >
                — {block.title}
              </p>
            )}
          </div>
        )

      // Icon Text
      case 'ICON_TEXT':
        return (
          <div 
            className={cn(
              "py-1 flex items-start gap-2",
              block.textAlign === 'center' && 'justify-center',
              block.textAlign === 'right' && 'justify-end'
            )}
          >
            <span style={{ color: 'var(--pl-primary)' }}>✓</span>
            <span
              style={{
                fontFamily: 'var(--pl-body-font)',
                fontSize: 'var(--pl-body-size)',
                color: 'var(--pl-text)',
              }}
            >
              {block.content}
            </span>
          </div>
        )

      // Contact Info
      case 'CONTACT_INFO':
        return (
          <div className="py-2 space-y-1" style={getTextAlignStyle(block.textAlign)}>
            {block.phone && (
              <p style={{ fontFamily: 'var(--pl-body-font)', fontSize: '0.75rem', color: 'var(--pl-text)' }}>
                📞 {block.phone}
              </p>
            )}
            {block.email && (
              <p style={{ fontFamily: 'var(--pl-body-font)', fontSize: '0.75rem', color: 'var(--pl-text)' }}>
                ✉️ {block.email}
              </p>
            )}
            {block.website && (
              <p style={{ fontFamily: 'var(--pl-body-font)', fontSize: '0.75rem', color: 'var(--pl-text)' }}>
                🌐 {block.website}
              </p>
            )}
            {block.address && (
              <p style={{ fontFamily: 'var(--pl-body-font)', fontSize: '0.75rem', color: 'var(--pl-text)', whiteSpace: 'pre-line' }}>
                📍 {block.address}
              </p>
            )}
          </div>
        )

      // Social Links
      case 'SOCIAL_LINKS':
        return (
          <div 
            className={cn(
              "py-2 flex gap-2",
              (block.textAlign === 'center' || !block.textAlign) && 'justify-center',
              block.textAlign === 'right' && 'justify-end',
              block.textAlign === 'left' && 'justify-start'
            )}
          >
            {block.socialLinks?.map((link, idx) => (
              <span key={idx} className="text-lg">
                {link.platform === 'instagram' && '📸'}
                {link.platform === 'facebook' && '👤'}
                {link.platform === 'tiktok' && '🎵'}
                {link.platform === 'youtube' && '▶️'}
                {link.platform === 'twitter' && '🐦'}
                {link.platform === 'linkedin' && '💼'}
                {link.platform === 'pinterest' && '📌'}
              </span>
            ))}
          </div>
        )

      // QR Code
      case 'QR_CODE':
        return (
          <div 
            className={cn(
              "py-3 flex flex-col gap-1",
              (block.textAlign === 'center' || !block.textAlign) && 'items-center',
              block.textAlign === 'right' && 'items-end',
              block.textAlign === 'left' && 'items-start'
            )}
          >
            {block.qrCodeUrl && (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(block.qrCodeUrl)}`}
                alt="QR Code"
                className="w-24 h-24"
                crossOrigin="anonymous"
              />
            )}
            {block.qrCodeLabel && (
              <span
                style={{
                  fontFamily: 'var(--pl-body-font)',
                  fontSize: '0.65rem',
                  color: 'var(--pl-muted)',
                }}
              >
                {block.qrCodeLabel}
              </span>
            )}
          </div>
        )

      // Logo
      case 'LOGO':
        if (!block.imageUrl) return null
        const logoHeight = block.spacerSize === 'SMALL' ? 'h-12' : block.spacerSize === 'LARGE' ? 'h-20' : 'h-16'
        return (
          <div 
            className={cn(
              "py-3 flex",
              (block.textAlign === 'center' || !block.textAlign) && 'justify-center',
              block.textAlign === 'right' && 'justify-end',
              block.textAlign === 'left' && 'justify-start'
            )}
          >
            <img
              src={block.imageUrl}
              alt="Logo"
              className={cn('object-contain', logoHeight)}
            />
          </div>
        )

      // Footer
      case 'FOOTER':
        return (
          <div 
            className="py-3 border-t mt-4" 
            style={{ 
              borderColor: 'var(--pl-divider)',
              ...getTextAlignStyle(block.textAlign || 'center'), // Default center für Footer
            }}
          >
            <p
              className="whitespace-pre-line"
              style={{
                fontFamily: 'var(--pl-body-font)',
                fontSize: '0.65rem',
                color: 'var(--pl-muted)',
              }}
            >
              {block.footerText}
            </p>
          </div>
        )

      case 'PAGE_BREAK':
        // Seitenumbruch in der Vorschau visuell anzeigen
        return (
          <div className="relative my-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-dashed" style={{ borderColor: 'var(--pl-muted)' }} />
              <span 
                className="text-[0.6rem] px-2 py-0.5 rounded bg-muted/50"
                style={{ color: 'var(--pl-muted)' }}
              >
                ↓ Nächste Seite
              </span>
              <div className="flex-1 border-t border-dashed" style={{ borderColor: 'var(--pl-muted)' }} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div 
      className={cn('relative overflow-hidden rounded-lg shadow-2xl', className)}
      style={{
        width: A4_WIDTH * scale,
        height: A4_HEIGHT * scale,
      }}
    >
      {/* A4 Container - skaliert */}
      <div
        className="bg-white origin-top-left absolute top-0 left-0"
        style={{
          width: A4_WIDTH,
          height: A4_HEIGHT,
          transform: `scale(${scale})`,
          ...Object.fromEntries(cssVars.split(';').filter(Boolean).map(s => {
            const [key, value] = s.split(':').map(s => s.trim())
            return [key, value]
          })),
        }}
      >
        {/* Background Image - proportional skaliert ohne Abschnitt */}
        {priceList.backgroundUrl && (
          <img
            src={priceList.backgroundUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            crossOrigin="anonymous"
          />
        )}

        {/* Content Overlay - mit dynamischem Padding und Inhaltsskalierung */}
        <div 
          className="relative z-10 h-full overflow-hidden"
          style={{
            // Padding in mm umrechnen in Pixel (1mm ≈ 3.78px bei 96 DPI)
            paddingTop: (priceList.paddingTop ?? 20) * 3.78,
            paddingBottom: (priceList.paddingBottom ?? 20) * 3.78,
            paddingLeft: (priceList.paddingLeft ?? 15) * 3.78,
            paddingRight: (priceList.paddingRight ?? 15) * 3.78,
          }}
        >
          {/* Skalierter & verschobener Content-Container */}
          <div
            style={{
              // Verschiebung in mm → px (1mm ≈ 3.78px)
              transform: `translate(${(priceList.contentOffsetX ?? 0) * 3.78}px, ${(priceList.contentOffsetY ?? 0) * 3.78}px) scale(${priceList.contentScale ?? 1})`,
              transformOrigin: 'top left',
              width: `${100 / (priceList.contentScale ?? 1)}%`,
            }}
          >
            {/* Header */}
            {(priceList.showLogo || priceList.showContact) && (
              <div className="mb-6 text-center">
                {priceList.showLogo && (
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{
                      fontFamily: 'var(--pl-header-font)',
                      color: 'var(--pl-primary)',
                      letterSpacing: 'var(--pl-letter-spacing)',
                    }}
                  >
                    {priceList.name}
                  </h1>
                )}
              </div>
            )}

            {/* Blocks */}
            <div className={priceList.columns === 2 ? 'columns-2 gap-8' : ''}>
              {blocks.map((block, index) => (
                <div key={block.id || `block-${index}`} className={priceList.columns === 2 ? 'break-inside-avoid' : ''}>
                  {renderBlock(block)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


