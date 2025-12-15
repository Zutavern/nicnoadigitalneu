'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { PriceBlockClient, SocialLink } from '@/lib/pricelist/types'

interface SocialLinksBlockProps {
  block: PriceBlockClient
  isEditing: boolean
  onChange: (updates: Partial<PriceBlockClient>) => void
}

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📸', color: '#E4405F' },
  { value: 'facebook', label: 'Facebook', icon: '👤', color: '#1877F2' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000' },
  { value: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000' },
  { value: 'twitter', label: 'X/Twitter', icon: '🐦', color: '#1DA1F2' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { value: 'pinterest', label: 'Pinterest', icon: '📌', color: '#E60023' },
] as const

export function SocialLinksBlock({ block, isEditing, onChange }: SocialLinksBlockProps) {
  const links = block.socialLinks || []
  const [newPlatform, setNewPlatform] = useState<SocialLink['platform']>('instagram')
  const [newUrl, setNewUrl] = useState('')

  const addLink = () => {
    if (!newUrl) return
    const newLinks = [...links, { platform: newPlatform, url: newUrl }]
    onChange({ socialLinks: newLinks })
    setNewUrl('')
  }

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    onChange({ socialLinks: newLinks })
  }

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg space-y-3">
        <Label className="text-xs">Social Media Links</Label>
        
        {/* Bestehende Links */}
        {links.length > 0 && (
          <div className="space-y-2">
            {links.map((link, index) => {
              const platform = SOCIAL_PLATFORMS.find(p => p.value === link.platform)
              return (
                <div key={index} className="flex items-center gap-2 bg-background p-2 rounded">
                  <span className="text-lg">{platform?.icon}</span>
                  <span className="text-sm flex-1 truncate">{link.url}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeLink(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Neuen Link hinzufügen */}
        <div className="flex gap-2">
          <Select
            value={newPlatform}
            onValueChange={(value) => setNewPlatform(value as SocialLink['platform'])}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_PLATFORMS.map(platform => (
                <SelectItem key={platform.value} value={platform.value}>
                  <span className="flex items-center gap-2">
                    <span>{platform.icon}</span>
                    <span>{platform.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL eingeben..."
            className="flex-1"
          />
          <Button size="icon" onClick={addLink} disabled={!newUrl}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="py-2 text-sm text-muted-foreground">
        Keine Social Media Links
      </div>
    )
  }

  return (
    <div className="py-3 flex flex-wrap gap-3 justify-center">
      {links.map((link, index) => {
        const platform = SOCIAL_PLATFORMS.find(p => p.value === link.platform)
        return (
          <div
            key={index}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
            style={{ backgroundColor: platform?.color }}
          >
            {platform?.icon}
          </div>
        )
      })}
    </div>
  )
}

