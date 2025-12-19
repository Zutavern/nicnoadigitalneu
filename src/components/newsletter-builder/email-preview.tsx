'use client'

import { useMemo } from 'react'
import type { NewsletterBlock, NewsletterBranding, HeadingLevel, SpacerSize, ListStyle } from '@/lib/newsletter-builder/types'
import { SPACER_SIZE_CONFIGS, SOCIAL_PLATFORM_CONFIGS } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'
import { Check, Play, Copy, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'

interface EmailPreviewProps {
  blocks: NewsletterBlock[]
  branding: NewsletterBranding
  className?: string
  previewMode?: 'desktop' | 'mobile'
}

export function EmailPreview({ blocks, branding, className, previewMode = 'desktop' }: EmailPreviewProps) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks]
  )

  const primaryColor = branding.primaryColor || '#10b981'
  const isMobile = previewMode === 'mobile'

  return (
    <div className={cn('bg-gray-100 p-4 overflow-auto h-full', className)}>
      {/* Preview Mode Label */}
      <div className="text-center mb-3">
        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
          {isMobile ? 'Mobile Vorschau (375px)' : 'Desktop Vorschau (600px)'}
        </span>
      </div>
      
      <div 
        className={cn(
          'mx-auto bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300',
          isMobile ? 'max-w-[375px]' : 'max-w-[600px]'
        )}
      >
        {/* Header */}
        <div
          className="px-6 py-5 text-center"
          style={{ backgroundColor: primaryColor }}
        >
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              className="h-12 w-auto mx-auto"
            />
          ) : (
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-white">NICNOA</span>
              <span style={{ color: primaryColor === '#10b981' ? '#ffffff' : '#ffffff80' }}>&amp;CO.online</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-10 py-8">
          {sortedBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Füge Blöcke hinzu, um deinen Newsletter zu erstellen</p>
            </div>
          ) : (
            sortedBlocks.map(block => (
              <PreviewBlock key={block.id} block={block} primaryColor={primaryColor} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-10 py-6 text-center">
          <p className="text-gray-500 text-sm mb-3">
            <a href="#" className="text-gray-700 hover:underline">Datenschutz</a>
            {' | '}
            <a href="#" className="text-gray-700 hover:underline">Impressum</a>
            {' | '}
            <a href="#" className="text-gray-700 hover:underline">AGB</a>
            {' | '}
            <a href="#" className="text-gray-700 hover:underline">Login</a>
          </p>
          <p className="text-gray-400 text-xs mb-3">
            © {new Date().getFullYear()} {branding.companyName || 'NICNOA&CO.online'}. Alle Rechte vorbehalten.
          </p>
          {/* PFLICHT: Unsubscribe Link (DSGVO) */}
          <p className="text-gray-400 text-[11px]">
            Du möchtest keine E-Mails mehr erhalten?{' '}
            <a href="#" className="text-gray-700 underline">
              Hier abmelden
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

interface PreviewBlockProps {
  block: NewsletterBlock
  primaryColor: string
}

function PreviewBlock({ block, primaryColor }: PreviewBlockProps) {
  switch (block.type) {
    case 'HEADING':
      return <PreviewHeading block={block} />
    case 'PARAGRAPH':
      return <PreviewParagraph block={block} />
    case 'BUTTON':
      return <PreviewButton block={block} primaryColor={primaryColor} />
    case 'IMAGE':
      return <PreviewImage block={block} />
    case 'DIVIDER':
      return <PreviewDivider block={block} />
    case 'SPACER':
      return <PreviewSpacer block={block} />
    case 'TWO_COLUMN':
      return <PreviewTwoColumn block={block} primaryColor={primaryColor} />
    case 'THREE_COLUMN':
      return <PreviewThreeColumn block={block} primaryColor={primaryColor} />
    case 'SOCIAL_LINKS':
      return <PreviewSocialLinks block={block} primaryColor={primaryColor} />
    case 'QUOTE':
      return <PreviewQuote block={block} primaryColor={primaryColor} />
    case 'LIST':
      return <PreviewList block={block} primaryColor={primaryColor} />
    case 'VIDEO':
      return <PreviewVideo block={block} primaryColor={primaryColor} />
    case 'PRODUCT_CARD':
      return <PreviewProductCard block={block} primaryColor={primaryColor} />
    case 'COUPON':
      return <PreviewCoupon block={block} primaryColor={primaryColor} />
    case 'PROFILE':
      return <PreviewProfile block={block} primaryColor={primaryColor} />
    case 'UNSUBSCRIBE':
      return <PreviewUnsubscribe block={block} primaryColor={primaryColor} />
    default:
      return null
  }
}

function PreviewHeading({ block }: { block: NewsletterBlock }) {
  const level = block.level || 1
  const align = block.align || 'left'
  const text = block.text || ''

  const sizes: Record<HeadingLevel, string> = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-semibold',
    3: 'text-lg font-semibold',
  }

  const margins: Record<HeadingLevel, string> = {
    1: 'mb-4',
    2: 'mb-3',
    3: 'mb-2',
  }

  return (
    <div
      className={cn(sizes[level], margins[level], 'text-gray-900')}
      style={{ textAlign: align }}
    >
      {text || <span className="text-gray-300 italic">Überschrift</span>}
    </div>
  )
}

function PreviewParagraph({ block }: { block: NewsletterBlock }) {
  const align = block.align || 'left'
  const content = block.content || ''

  return (
    <p
      className="text-base text-gray-600 leading-relaxed mb-4"
      style={{ textAlign: align }}
    >
      {content || <span className="text-gray-300 italic">Textabsatz</span>}
    </p>
  )
}

function PreviewButton({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const align = block.align || 'center'
  const buttonText = block.buttonText || 'Button'
  const variant = block.buttonVariant || 'primary'

  const buttonStyles = {
    primary: {
      backgroundColor: primaryColor,
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
    },
    outline: {
      backgroundColor: 'transparent',
      color: primaryColor,
      border: `2px solid ${primaryColor}`,
    },
  }

  return (
    <div className="my-4" style={{ textAlign: align }}>
      <a
        href={block.href || '#'}
        className="inline-block px-6 py-3 rounded-md font-semibold text-sm no-underline"
        style={buttonStyles[variant]}
      >
        {buttonText}
      </a>
    </div>
  )
}

function PreviewImage({ block }: { block: NewsletterBlock }) {
  const align = block.align || 'center'
  const src = block.src || ''
  const alt = block.alt || ''
  const width = block.imageWidth || 100

  if (!src) {
    return (
      <div className="my-4" style={{ textAlign: align }}>
        <div className="inline-block w-32 h-24 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-400 text-xs">Bild</span>
        </div>
      </div>
    )
  }

  return (
    <div className="my-4" style={{ textAlign: align }}>
      <img
        src={src}
        alt={alt}
        className="inline-block rounded"
        style={{ maxWidth: `${width}%`, height: 'auto' }}
      />
    </div>
  )
}

function PreviewDivider({ block }: { block: NewsletterBlock }) {
  const style = block.dividerStyle || 'solid'

  return (
    <hr
      className="my-4 border-gray-200"
      style={{ borderStyle: style }}
    />
  )
}

function PreviewSpacer({ block }: { block: NewsletterBlock }) {
  const size = block.spacerSize || 'MEDIUM'
  const height = SPACER_SIZE_CONFIGS[size].heightPx

  return <div style={{ height: `${height}px` }} />
}

function PreviewTwoColumn({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const widths = block.columnWidths || [50, 50]
  const childBlocks = block.childBlocks || []

  const leftBlocks = childBlocks
    .filter(b => b.columnIndex === 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const rightBlocks = childBlocks
    .filter(b => b.columnIndex === 1)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="my-4">
      <table className="w-full" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td style={{ width: `${widths[0]}%`, verticalAlign: 'top', paddingRight: '10px' }}>
              {leftBlocks.length === 0 ? (
                <div className="text-gray-300 text-xs text-center py-4">Spalte 1</div>
              ) : (
                leftBlocks.map(child => (
                  <PreviewBlock key={child.id} block={child} primaryColor={primaryColor} />
                ))
              )}
            </td>
            <td style={{ width: `${widths[1]}%`, verticalAlign: 'top', paddingLeft: '10px' }}>
              {rightBlocks.length === 0 ? (
                <div className="text-gray-300 text-xs text-center py-4">Spalte 2</div>
              ) : (
                rightBlocks.map(child => (
                  <PreviewBlock key={child.id} block={child} primaryColor={primaryColor} />
                ))
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function PreviewThreeColumn({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const widths = block.columnWidths || [33, 34, 33]
  const childBlocks = block.childBlocks || []

  const col1 = childBlocks.filter(b => b.columnIndex === 0).sort((a, b) => a.sortOrder - b.sortOrder)
  const col2 = childBlocks.filter(b => b.columnIndex === 1).sort((a, b) => a.sortOrder - b.sortOrder)
  const col3 = childBlocks.filter(b => b.columnIndex === 2).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="my-4">
      <table className="w-full" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            {[col1, col2, col3].map((colBlocks, idx) => (
              <td
                key={idx}
                style={{
                  width: `${widths[idx]}%`,
                  verticalAlign: 'top',
                  paddingLeft: idx > 0 ? '8px' : 0,
                  paddingRight: idx < 2 ? '8px' : 0,
                }}
              >
                {colBlocks.length === 0 ? (
                  <div className="text-gray-300 text-xs text-center py-4">Spalte {idx + 1}</div>
                ) : (
                  colBlocks.map(child => (
                    <PreviewBlock key={child.id} block={child} primaryColor={primaryColor} />
                  ))
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function PreviewSocialLinks({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const socialLinks = block.socialLinks || []
  const align = block.align || 'center'
  const iconSize = block.socialIconSize || 'medium'

  const sizes = { small: 24, medium: 32, large: 40 }
  const size = sizes[iconSize]

  const icons: Record<string, React.ReactNode> = {
    facebook: <Facebook style={{ width: size * 0.5, height: size * 0.5 }} />,
    instagram: <Instagram style={{ width: size * 0.5, height: size * 0.5 }} />,
    twitter: <Twitter style={{ width: size * 0.5, height: size * 0.5 }} />,
    linkedin: <Linkedin style={{ width: size * 0.5, height: size * 0.5 }} />,
    youtube: <Youtube style={{ width: size * 0.5, height: size * 0.5 }} />,
    tiktok: <span style={{ fontSize: size * 0.4, fontWeight: 'bold' }}>TT</span>,
  }

  if (socialLinks.length === 0) {
    return (
      <div className="my-4 text-center text-gray-300 text-sm">
        Keine Social Links
      </div>
    )
  }

  return (
    <div className="my-4 flex gap-2" style={{ justifyContent: align }}>
      {socialLinks.map((link, idx) => (
        <a
          key={idx}
          href={link.url || '#'}
          className="flex items-center justify-center rounded-full text-white"
          style={{ width: size, height: size, backgroundColor: primaryColor }}
        >
          {icons[link.platform]}
        </a>
      ))}
    </div>
  )
}

function PreviewQuote({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const quoteText = block.quoteText || ''
  const quoteAuthor = block.quoteAuthor || ''
  const quoteRole = block.quoteRole || ''
  const align = block.align || 'center'

  return (
    <div
      className="my-4 p-5 bg-gray-50 border-l-4 rounded-r-lg"
      style={{ borderLeftColor: primaryColor, textAlign: align }}
    >
      <p className="text-lg italic text-gray-600 mb-3">
        &ldquo;{quoteText || 'Zitat hier...'}&rdquo;
      </p>
      {(quoteAuthor || quoteRole) && (
        <div className="text-sm">
          {quoteAuthor && <span className="font-semibold text-gray-900">{quoteAuthor}</span>}
          {quoteAuthor && quoteRole && ' • '}
          {quoteRole && <span className="text-gray-500">{quoteRole}</span>}
        </div>
      )}
    </div>
  )
}

function PreviewList({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const listItems = block.listItems || []
  const listStyle = block.listStyle || 'bullet'
  const align = block.align || 'left'

  if (listItems.length === 0) {
    return <div className="my-4 text-gray-300 text-sm">Leere Liste</div>
  }

  const ListTag = listStyle === 'number' ? 'ol' : 'ul'

  return (
    <div className="my-4" style={{ textAlign: align }}>
      <ListTag
        className={cn(
          'text-gray-600',
          listStyle === 'bullet' && 'list-disc pl-5',
          listStyle === 'number' && 'list-decimal pl-5',
          listStyle === 'check' && 'list-none pl-0'
        )}
      >
        {listItems.map((item, idx) => (
          <li key={idx} className={cn('mb-1', listStyle === 'check' && 'flex items-center gap-2')}>
            {listStyle === 'check' && (
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ListTag>
    </div>
  )
}

function PreviewVideo({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const thumbnailUrl = block.videoThumbnailUrl || ''
  const videoTitle = block.videoTitle || 'Video ansehen'
  const align = block.align || 'center'

  return (
    <div className="my-4" style={{ textAlign: align }}>
      {thumbnailUrl ? (
        <div className="inline-block relative rounded-lg overflow-hidden">
          <img src={thumbnailUrl} alt={videoTitle} className="max-w-full h-auto" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 text-gray-400 py-8">
          <Play className="w-6 h-6" />
          <span>{videoTitle}</span>
        </div>
      )}
    </div>
  )
}

function PreviewProductCard({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const productName = block.productName || 'Produktname'
  const productDescription = block.productDescription || ''
  const productPrice = block.productPrice || ''
  const productImageUrl = block.productImageUrl || ''
  const productButtonText = block.productButtonText || 'Jetzt kaufen'
  const align = block.align || 'center'

  return (
    <div className="my-4" style={{ textAlign: align }}>
      <div className="inline-block border rounded-lg overflow-hidden max-w-xs">
        {productImageUrl ? (
          <img src={productImageUrl} alt={productName} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400">
            Bild
          </div>
        )}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-1">{productName}</h4>
          {productDescription && (
            <p className="text-sm text-gray-500 mb-3">{productDescription}</p>
          )}
          {productPrice && (
            <p className="text-xl font-bold mb-3" style={{ color: primaryColor }}>
              {productPrice}
            </p>
          )}
          <a
            href={block.productButtonUrl || '#'}
            className="inline-block px-4 py-2 rounded text-white font-medium text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {productButtonText}
          </a>
        </div>
      </div>
    </div>
  )
}

function PreviewCoupon({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const couponCode = block.couponCode || 'CODE'
  const couponDescription = block.couponDescription || ''
  const couponExpiry = block.couponExpiry || ''
  const align = block.align || 'center'

  return (
    <div className="my-4" style={{ textAlign: align }}>
      <div
        className="inline-block border-2 border-dashed rounded-lg p-5"
        style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}10` }}
      >
        <div
          className="font-mono text-2xl font-bold tracking-widest mb-2 px-3 py-1 bg-white rounded inline-flex items-center gap-2"
          style={{ color: primaryColor }}
        >
          {couponCode}
          <Copy className="w-4 h-4 opacity-50" />
        </div>
        {couponDescription && (
          <p className="text-sm text-gray-600 mb-1">{couponDescription}</p>
        )}
        {couponExpiry && (
          <p className="text-xs text-gray-400">Gültig bis: {couponExpiry}</p>
        )}
      </div>
    </div>
  )
}

function PreviewProfile({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const profileImageUrl = block.profileImageUrl || ''
  const profileName = block.profileName || 'Name'
  const profileRole = block.profileRole || ''
  const profileDescription = block.profileDescription || ''
  const align = block.align || 'center'

  return (
    <div className="my-4" style={{ textAlign: align }}>
      <div className="inline-block">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={profileName}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            {profileName.charAt(0).toUpperCase()}
          </div>
        )}
        <h4 className="font-semibold text-gray-900">{profileName}</h4>
        {profileRole && <p className="text-sm text-gray-500">{profileRole}</p>}
        {profileDescription && (
          <p className="text-sm text-gray-600 mt-2 max-w-xs">{profileDescription}</p>
        )}
      </div>
    </div>
  )
}

function PreviewUnsubscribe({ block, primaryColor }: { block: NewsletterBlock; primaryColor: string }) {
  const unsubscribeText = block.unsubscribeText || 'Du möchtest keine E-Mails mehr von uns erhalten?'
  const unsubscribeLinkText = block.unsubscribeLinkText || 'Hier abmelden'
  const align = block.align || 'center'

  return (
    <div className="my-4 py-4 border-t border-gray-100" style={{ textAlign: align }}>
      <p className="text-sm text-gray-500 mb-1">{unsubscribeText}</p>
      <a
        href="#"
        className="text-sm underline"
        style={{ color: primaryColor }}
      >
        {unsubscribeLinkText}
      </a>
    </div>
  )
}
