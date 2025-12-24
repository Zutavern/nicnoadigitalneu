'use client'

import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'
import { FONT_CONFIGS } from '@/lib/print-materials/types'
import type { PrintMaterialClient, PrintBlockClient } from '@/lib/print-materials/types'
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Facebook,
} from 'lucide-react'

interface PrintBlockRendererProps {
  block: PrintBlockClient
  material: PrintMaterialClient
  isSelected?: boolean
  className?: string
}

export function PrintBlockRenderer({
  block,
  material,
  isSelected,
  className,
}: PrintBlockRendererProps) {
  const fontConfig = FONT_CONFIGS.find(f => f.id === material.fontFamily)
  const fontFamily = fontConfig?.family || 'Inter, sans-serif'

  const getFontWeight = () => {
    switch (block.fontWeight) {
      case 'medium': return 500
      case 'semibold': return 600
      case 'bold': return 700
      default: return 400
    }
  }

  const baseStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${block.fontSize}pt`,
    fontWeight: getFontWeight(),
    color: block.color,
    textAlign: block.textAlign as any,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  }

  switch (block.type) {
    case 'TEXT':
    case 'NAME':
    case 'TAGLINE':
      return (
        <div
          className={cn('flex items-center justify-center', className)}
          style={baseStyle}
        >
          <span className="whitespace-pre-wrap break-words">
            {block.content || (block.type === 'NAME' ? 'Ihr Name' : block.type === 'TAGLINE' ? 'Ihr Slogan' : 'Text eingeben...')}
          </span>
        </div>
      )

    case 'LOGO':
      return (
        <div
          className={cn('flex items-center justify-center', className)}
          style={{ width: '100%', height: '100%' }}
        >
          {block.imageUrl ? (
            <img
              src={block.imageUrl}
              alt="Logo"
              className="max-w-full max-h-full"
              style={{
                objectFit: block.objectFit as any,
                borderRadius: `${block.borderRadius}mm`,
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full border-2 border-dashed border-muted-foreground/30 rounded text-muted-foreground text-xs">
              Logo
            </div>
          )}
        </div>
      )

    case 'IMAGE':
      return (
        <div
          className={cn('flex items-center justify-center', className)}
          style={{ width: '100%', height: '100%' }}
        >
          {block.imageUrl ? (
            <img
              src={block.imageUrl}
              alt="Bild"
              className="w-full h-full"
              style={{
                objectFit: block.objectFit as any,
                borderRadius: `${block.borderRadius}mm`,
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full border-2 border-dashed border-muted-foreground/30 rounded text-muted-foreground text-xs">
              Bild
            </div>
          )}
        </div>
      )

    case 'QR_CODE':
      return (
        <div
          className={cn('flex flex-col items-center justify-center gap-1', className)}
          style={{ width: '100%', height: '100%' }}
        >
          {block.qrCodeUrl ? (
            <>
              <QRCodeSVG
                value={block.qrCodeUrl}
                size={Math.min(block.qrCodeSize * 3.78, 100)} // mm to px approximation
                level="M"
                includeMargin={false}
                bgColor="transparent"
                fgColor={block.color}
              />
              {block.qrCodeLabel && (
                <span
                  style={{
                    fontFamily,
                    fontSize: '6pt',
                    color: block.color,
                  }}
                >
                  {block.qrCodeLabel}
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full border-2 border-dashed border-muted-foreground/30 rounded text-muted-foreground text-xs">
              QR-Code
            </div>
          )}
        </div>
      )

    case 'CONTACT_INFO':
      return (
        <div
          className={cn('flex flex-col gap-1', className)}
          style={{
            ...baseStyle,
            fontSize: '8pt',
          }}
        >
          {block.showPhone && (
            <div className="flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 flex-shrink-0" style={{ color: block.color }} />
              <span>{block.content?.split('\n')[0] || '+49 123 456789'}</span>
            </div>
          )}
          {block.showEmail && (
            <div className="flex items-center gap-1">
              <Mail className="w-2.5 h-2.5 flex-shrink-0" style={{ color: block.color }} />
              <span>{block.content?.split('\n')[1] || 'mail@example.com'}</span>
            </div>
          )}
          {block.showAddress && (
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" style={{ color: block.color }} />
              <span>{block.content?.split('\n')[2] || 'Musterstraße 1, 12345 Berlin'}</span>
            </div>
          )}
          {block.showWebsite && (
            <div className="flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 flex-shrink-0" style={{ color: block.color }} />
              <span>{block.content?.split('\n')[3] || 'www.example.com'}</span>
            </div>
          )}
        </div>
      )

    case 'SOCIAL_LINKS':
      return (
        <div
          className={cn('flex items-center justify-center gap-2', className)}
          style={{ width: '100%', height: '100%' }}
        >
          <Instagram className="w-4 h-4" style={{ color: block.color }} />
          <Facebook className="w-4 h-4" style={{ color: block.color }} />
        </div>
      )

    case 'SHAPE':
      return (
        <div
          className={className}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: block.color,
            borderRadius: `${block.borderRadius}mm`,
          }}
        />
      )

    default:
      return (
        <div
          className={cn(
            'flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded text-muted-foreground text-xs',
            className
          )}
          style={{ width: '100%', height: '100%' }}
        >
          {block.type}
        </div>
      )
  }
}

