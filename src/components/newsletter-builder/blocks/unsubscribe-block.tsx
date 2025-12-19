'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserMinus, ExternalLink } from 'lucide-react'
import type { NewsletterBlock, TextAlign } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface UnsubscribeBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  primaryColor?: string
}

export function UnsubscribeBlock({ block, isEditing, onChange, primaryColor = '#10b981' }: UnsubscribeBlockProps) {
  const unsubscribeText = block.unsubscribeText || 'Du möchtest keine E-Mails mehr von uns erhalten?'
  const unsubscribeLinkText = block.unsubscribeLinkText || 'Hier abmelden'
  const align = block.align || 'center'

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <UserMinus className="h-4 w-4" />
          <span>DSGVO-konformer Abmelde-Link</span>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="unsubscribe-text" className="text-xs">Einleitungstext</Label>
          <Input
            id="unsubscribe-text"
            value={unsubscribeText}
            onChange={(e) => onChange({ unsubscribeText: e.target.value })}
            placeholder="Du möchtest keine E-Mails mehr erhalten?"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="unsubscribe-link-text" className="text-xs">Link-Text</Label>
          <Input
            id="unsubscribe-link-text"
            value={unsubscribeLinkText}
            onChange={(e) => onChange({ unsubscribeLinkText: e.target.value })}
            placeholder="Hier abmelden"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs">Ausrichtung</Label>
          <Select
            value={align}
            onValueChange={(v) => onChange({ align: v as TextAlign })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Links</SelectItem>
              <SelectItem value="center">Zentriert</SelectItem>
              <SelectItem value="right">Rechts</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800">
          <strong>Hinweis:</strong> Der Abmelde-Link wird automatisch mit der Resend Unsubscribe-URL ersetzt: 
          <code className="ml-1 bg-amber-100 px-1 rounded">{'{{{RESEND_UNSUBSCRIBE_URL}}}'}</code>
        </div>
      </div>
    )
  }

  // Preview Mode
  return (
    <div
      className={cn(
        'py-4 text-sm',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right'
      )}
    >
      <p className="text-muted-foreground mb-1">{unsubscribeText}</p>
      <a 
        href="#" 
        className="inline-flex items-center gap-1 underline hover:no-underline"
        style={{ color: primaryColor }}
        onClick={(e) => e.preventDefault()}
      >
        {unsubscribeLinkText}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}



