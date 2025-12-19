'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Video as VideoIcon } from 'lucide-react'
import type { NewsletterBlock, TextAlign } from '@/lib/newsletter-builder/types'
import { ImageUpload } from '../image-upload'
import { cn } from '@/lib/utils'

interface VideoBlockProps {
  block: NewsletterBlock
  isEditing: boolean
  onChange: (updates: Partial<NewsletterBlock>) => void
  primaryColor?: string
}

export function VideoBlock({ block, isEditing, onChange, primaryColor = '#10b981' }: VideoBlockProps) {
  const thumbnailUrl = block.videoThumbnailUrl || ''
  const videoUrl = block.videoUrl || ''
  const videoTitle = block.videoTitle || ''
  const align = block.align || 'center'
  const [imageError, setImageError] = useState(false)

  if (isEditing) {
    return (
      <div className="space-y-3">
        {/* Thumbnail-Upload */}
        <ImageUpload
          value={thumbnailUrl}
          onChange={(url) => {
            onChange({ videoThumbnailUrl: url })
            setImageError(false)
          }}
          type="thumbnail"
          label="Video-Thumbnail (Vorschaubild)"
          placeholder="https://beispiel.de/thumbnail.jpg"
          previewClassName="h-32"
        />
        
        <div className="space-y-1.5">
          <Label htmlFor="video-url" className="text-xs">Video-URL (Link zum Video)</Label>
          <Input
            id="video-url"
            value={videoUrl}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=... oder https://vimeo.com/..."
          />
          <p className="text-[10px] text-muted-foreground">
            YouTube, Vimeo oder andere Video-Links - Video wird im Browser geöffnet
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="video-title" className="text-xs">Button-Text</Label>
            <Input
              id="video-title"
              value={videoTitle}
              onChange={(e) => onChange({ videoTitle: e.target.value })}
              placeholder="Video ansehen"
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
        
        {/* Info-Box */}
        <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          <strong>Hinweis:</strong> Videos können nicht direkt in E-Mails eingebettet werden. 
          Stattdessen wird das Thumbnail mit einem Play-Button angezeigt, der zum Video verlinkt.
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
      {thumbnailUrl && !imageError ? (
        <div className="relative rounded-lg overflow-hidden w-full max-w-[200px]">
          <img
            src={thumbnailUrl}
            alt="Video"
            className="w-full h-24 object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Play className="h-5 w-5 text-white ml-0.5" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground">
          <VideoIcon className="h-6 w-6" />
          <span className="text-xs">{videoTitle || 'Video'}</span>
        </div>
      )}
    </div>
  )
}
