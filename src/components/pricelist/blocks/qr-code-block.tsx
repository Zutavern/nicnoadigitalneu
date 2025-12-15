'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode } from 'lucide-react'
import type { PriceBlockClient } from '@/lib/pricelist/types'

interface QrCodeBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

export function QrCodeBlock({ block, isEditing, onChange }: QrCodeBlockProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  // QR-Code generieren wenn URL vorhanden
  useEffect(() => {
    if (block.qrCodeUrl) {
      // Verwende eine externe API für QR-Code Generierung
      // In der Produktion kann man auch die qrcode Bibliothek direkt nutzen
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(block.qrCodeUrl)}`
      setQrDataUrl(qrApiUrl)
    } else {
      setQrDataUrl(null)
    }
  }, [block.qrCodeUrl])

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <div>
          <Label htmlFor={`qr-url-${block.id}`} className="text-xs">
            URL für QR-Code
          </Label>
          <Input
            id={`qr-url-${block.id}`}
            value={block.qrCodeUrl || ''}
            onChange={(e) => onChange({ qrCodeUrl: e.target.value })}
            placeholder="https://mein-salon.de/buchen"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`qr-label-${block.id}`} className="text-xs">
            Beschriftung (optional)
          </Label>
          <Input
            id={`qr-label-${block.id}`}
            value={block.qrCodeLabel || ''}
            onChange={(e) => onChange({ qrCodeLabel: e.target.value })}
            placeholder="Jetzt online buchen"
            className="mt-1"
          />
        </div>
        
        {/* Vorschau */}
        {qrDataUrl && (
          <div className="pt-2">
            <div className="text-xs text-muted-foreground mb-1">Vorschau:</div>
            <div className="flex flex-col items-center gap-2 p-3 bg-white rounded">
              <img
                src={qrDataUrl}
                alt="QR Code Preview"
                className="w-24 h-24"
              />
              {block.qrCodeLabel && (
                <span className="text-xs text-muted-foreground text-center">
                  {block.qrCodeLabel}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!block.qrCodeUrl) {
    return (
      <div className="py-2 flex flex-col items-center gap-2 text-muted-foreground">
        <QrCode className="h-12 w-12 opacity-50" />
        <span className="text-sm">Keine URL</span>
      </div>
    )
  }

  return (
    <div className="py-3 flex flex-col items-center gap-2">
      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt="QR Code"
          className="w-32 h-32"
          crossOrigin="anonymous"
        />
      )}
      {block.qrCodeLabel && (
        <span className="text-sm text-muted-foreground text-center">
          {block.qrCodeLabel}
        </span>
      )}
    </div>
  )
}

