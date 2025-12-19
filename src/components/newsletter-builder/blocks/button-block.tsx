'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { NewsletterBlock, TextAlign, ButtonVariant } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface ButtonBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  primaryColor?: string
}

export function ButtonBlock({ block, isEditing, onChange, primaryColor = '#10b981' }: ButtonBlockProps) {
  const align = block.align || 'center'
  const buttonText = block.buttonText || 'Button'
  const href = block.href || ''
  const variant = block.buttonVariant || 'primary'

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="button-text" className="text-xs">Button-Text</Label>
            <Input
              id="button-text"
              value={buttonText}
              onChange={(e) => onChange({ buttonText: e.target.value })}
              placeholder="Button-Text..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="button-href" className="text-xs">Link (URL)</Label>
            <Input
              id="button-href"
              value={href}
              onChange={(e) => onChange({ href: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Variante</Label>
            <Select
              value={variant}
              onValueChange={(v) => onChange({ buttonVariant: v as ButtonVariant })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primär</SelectItem>
                <SelectItem value="secondary">Sekundär</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
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
  const buttonStyles: Record<ButtonVariant, string> = {
    primary: 'text-white',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border-2 bg-transparent',
  }

  return (
    <div
      className={cn(
        'flex',
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end'
      )}
    >
      <Button
        size="sm"
        className={cn(buttonStyles[variant])}
        style={variant === 'primary' ? { backgroundColor: primaryColor } : variant === 'outline' ? { borderColor: primaryColor, color: primaryColor } : undefined}
      >
        {buttonText}
      </Button>
    </div>
  )
}



