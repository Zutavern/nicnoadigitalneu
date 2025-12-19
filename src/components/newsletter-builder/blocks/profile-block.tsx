'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User2, ImageIcon } from 'lucide-react'
import type { NewsletterBlock, TextAlign } from '@/lib/newsletter-builder/types'
import { ImageUpload } from '../image-upload'
import { cn } from '@/lib/utils'

interface ProfileBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  primaryColor?: string
}

export function ProfileBlock({ block, isEditing, onChange, primaryColor = '#10b981' }: ProfileBlockProps) {
  const profileName = block.profileName || ''
  const profileRole = block.profileRole || ''
  const profileDescription = block.profileDescription || ''
  const profileImageUrl = block.profileImageUrl || ''
  const align = block.align || 'center'
  const [imageError, setImageError] = useState(false)

  if (isEditing) {
    return (
      <div className="space-y-3">
        {/* Profil-Bild Upload */}
        <ImageUpload
          value={profileImageUrl}
          onChange={(url) => {
            onChange({ profileImageUrl: url })
            setImageError(false)
          }}
          type="profile"
          label="Profil-Bild"
          previewClassName="h-24 w-24 rounded-full mx-auto"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-xs">Name</Label>
            <Input
              id="profile-name"
              value={profileName}
              onChange={(e) => onChange({ profileName: e.target.value })}
              placeholder="Max Mustermann"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-role" className="text-xs">Rolle / Position</Label>
            <Input
              id="profile-role"
              value={profileRole}
              onChange={(e) => onChange({ profileRole: e.target.value })}
              placeholder="z.B. Friseurmeisterin"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="profile-description" className="text-xs">Beschreibung</Label>
          <Textarea
            id="profile-description"
            value={profileDescription}
            onChange={(e) => onChange({ profileDescription: e.target.value })}
            placeholder="Kurze Beschreibung der Person..."
            rows={2}
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
      </div>
    )
  }

  // Preview Mode
  return (
    <div
      className={cn(
        'flex',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end'
      )}
    >
      <div className="flex flex-col items-center text-center max-w-[200px]">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-muted flex items-center justify-center">
          {profileImageUrl && !imageError ? (
            <img
              src={profileImageUrl}
              alt={profileName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <User2 className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <h4 className="font-semibold text-sm">{profileName || 'Name'}</h4>
        <p className="text-xs" style={{ color: primaryColor }}>{profileRole || 'Rolle'}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {profileDescription || 'Beschreibung'}
        </p>
      </div>
    </div>
  )
}
