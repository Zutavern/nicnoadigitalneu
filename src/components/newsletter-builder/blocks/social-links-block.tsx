'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'
import type { NewsletterBlock, SocialLink, TextAlign } from '@/lib/newsletter-builder/types'
import { SOCIAL_PLATFORM_CONFIGS } from '@/lib/newsletter-builder/types'
import { cn } from '@/lib/utils'

interface SocialLinksBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  primaryColor?: string
}

const PLATFORM_ICONS: Record<SocialLink['platform'], React.ReactNode> = {
  facebook: <Facebook className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  tiktok: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
}

export function SocialLinksBlock({ block, isEditing, onChange, primaryColor = '#10b981' }: SocialLinksBlockProps) {
  const socialLinks = block.socialLinks || []
  const align = block.align || 'center'
  const iconSize = block.socialIconSize || 'medium'

  const addLink = () => {
    const platforms: SocialLink['platform'][] = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok']
    const usedPlatforms = socialLinks.map(l => l.platform)
    const availablePlatform = platforms.find(p => !usedPlatforms.includes(p)) || 'instagram'
    
    onChange({
      socialLinks: [...socialLinks, { platform: availablePlatform, url: '' }],
    })
  }

  const updateLink = (index: number, updates: Partial<SocialLink>) => {
    const newLinks = socialLinks.map((link, i) => 
      i === index ? { ...link, ...updates } : link
    )
    onChange({ socialLinks: newLinks })
  }

  const removeLink = (index: number) => {
    onChange({ socialLinks: socialLinks.filter((_, i) => i !== index) })
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Icon-Größe</Label>
            <Select
              value={iconSize}
              onValueChange={(v) => onChange({ socialIconSize: v as 'small' | 'medium' | 'large' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Klein</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="large">Groß</SelectItem>
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
        
        <div className="space-y-2">
          <Label className="text-xs">Social Links</Label>
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={link.platform}
                onValueChange={(v) => updateLink(index, { platform: v as SocialLink['platform'] })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SOCIAL_PLATFORM_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={link.url}
                onChange={(e) => updateLink(index, { url: e.target.value })}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => removeLink(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLink} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Link hinzufügen
          </Button>
        </div>
      </div>
    )
  }

  // Preview Mode
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-10 w-10',
  }

  return (
    <div
      className={cn(
        'flex gap-3',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end'
      )}
    >
      {socialLinks.length === 0 ? (
        <span className="text-muted-foreground text-xs">Keine Social Links</span>
      ) : (
        socialLinks.map((link, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center justify-center rounded-full',
              sizeClasses[iconSize]
            )}
            style={{ backgroundColor: primaryColor, color: 'white' }}
          >
            {PLATFORM_ICONS[link.platform]}
          </div>
        ))
      )}
    </div>
  )
}



