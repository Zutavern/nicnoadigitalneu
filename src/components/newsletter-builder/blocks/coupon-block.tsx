'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Ticket, Copy } from 'lucide-react'
import type { NewsletterBlock, TextAlign } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface CouponBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  primaryColor?: string
}

export function CouponBlock({ block, isEditing, onChange, primaryColor = '#10b981' }: CouponBlockProps) {
  const couponCode = block.couponCode || ''
  const couponDescription = block.couponDescription || ''
  const couponExpiry = block.couponExpiry || ''
  const align = block.align || 'center'

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="coupon-code" className="text-xs">Gutscheincode</Label>
          <Input
            id="coupon-code"
            value={couponCode}
            onChange={(e) => onChange({ couponCode: e.target.value.toUpperCase() })}
            placeholder="RABATT20"
            className="font-mono uppercase"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coupon-description" className="text-xs">Beschreibung</Label>
          <Input
            id="coupon-description"
            value={couponDescription}
            onChange={(e) => onChange({ couponDescription: e.target.value })}
            placeholder="20% Rabatt auf deine nächste Bestellung"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="coupon-expiry" className="text-xs">Gültig bis (optional)</Label>
            <Input
              id="coupon-expiry"
              value={couponExpiry}
              onChange={(e) => onChange({ couponExpiry: e.target.value })}
              placeholder="31.12.2025"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ausrichtung</Label>
            <Select
              value={align}
              onValueChange={(v) => onChange({ align: v as TextAlign })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Links</SelectItem>
                <SelectItem value="center">Zentriert</SelectItem>
                <SelectItem value="right">Rechts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  // Preview Mode
  // Lightened version of primary color for background
  const bgColor = `${primaryColor}15`
  
  return (
    <div
      className={cn(
        'flex',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end'
      )}
    >
      <div
        className="border-2 border-dashed rounded-lg p-4 text-center max-w-[250px] w-full"
        style={{ borderColor: primaryColor, backgroundColor: bgColor }}
      >
        <Ticket className="h-6 w-6 mx-auto mb-2" style={{ color: primaryColor }} />
        <div
          className="font-mono font-bold text-lg tracking-wider bg-white px-3 py-1 rounded inline-flex items-center gap-2 mb-2"
          style={{ color: primaryColor }}
        >
          {couponCode || 'CODE'}
          <Copy className="h-4 w-4 opacity-50" />
        </div>
        {couponDescription && (
          <p className="text-xs text-muted-foreground mb-1">{couponDescription}</p>
        )}
        {couponExpiry && (
          <p className="text-[10px] text-muted-foreground">Gültig bis: {couponExpiry}</p>
        )}
      </div>
    </div>
  )
}



