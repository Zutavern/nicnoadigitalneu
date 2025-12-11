'use client'

import { useState } from 'react'
import { Search, Globe, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ImageUploader } from '@/components/ui/image-uploader'
import { ReactNode } from 'react'
import { SEOAudit } from './seo-audit'

interface SEOPreviewProps {
  metaTitle: string | null
  metaDescription: string | null
  fallbackTitle?: string
  fallbackDescription?: string
  url: string // z.B. "nicnoa.de › uber-uns"
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  // Optional: OG Image Support
  ogImageUrl?: string | null
  onOgImageUpload?: (url: string) => void
  onOgImageRemove?: () => void
  ogImageUploadEndpoint?: string
  ogImageUploadData?: Record<string, string>
  // Optional: Extra children (z.B. zusätzliche Felder)
  children?: ReactNode
  // Optional: Content für Keyword-Analyse
  content?: string | null
  // Optional: Focus-Keyword
  focusKeyword?: string
  onFocusKeywordChange?: (keyword: string) => void
  // Optional: SEO-Audit ausblenden
  hideAudit?: boolean
}

export function SEOPreview({
  metaTitle,
  metaDescription,
  fallbackTitle = 'Seitentitel',
  fallbackDescription = 'Seitenbeschreibung...',
  url,
  onTitleChange,
  onDescriptionChange,
  ogImageUrl,
  onOgImageUpload,
  onOgImageRemove,
  ogImageUploadEndpoint,
  ogImageUploadData,
  children,
  content,
  focusKeyword,
  onFocusKeywordChange,
  hideAudit = false,
}: SEOPreviewProps) {
  const titleLength = (metaTitle || '').length
  const descriptionLength = (metaDescription || '').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          SEO & Meta-Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meta Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Meta-Titel</Label>
            <span className={`text-xs ${titleLength > 60 ? 'text-amber-500' : titleLength > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
              {titleLength}/70
            </span>
          </div>
          <Input
            value={metaTitle || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={fallbackTitle}
            maxLength={70}
          />
          <p className="text-xs text-muted-foreground">
            Ideal sind 50-60 Zeichen für optimale Darstellung in Google
          </p>
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Meta-Beschreibung</Label>
            <span className={`text-xs ${descriptionLength > 155 ? 'text-amber-500' : descriptionLength >= 120 ? 'text-green-500' : 'text-muted-foreground'}`}>
              {descriptionLength}/160
            </span>
          </div>
          <Textarea
            value={metaDescription || ''}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={fallbackDescription}
            maxLength={160}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Ideal sind 120-160 Zeichen. Beschreibe den Seiteninhalt prägnant.
          </p>
        </div>

        {/* Google Preview - Weißer Hintergrund */}
        <div className="mt-6 p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">Google-Vorschau</p>
          </div>
          <div className="space-y-1 font-sans">
            {/* Title */}
            <p className="text-[#1a0dab] text-xl hover:underline cursor-pointer leading-tight truncate">
              {metaTitle || fallbackTitle}
            </p>
            {/* URL */}
            <div className="flex items-center gap-1 text-sm">
              <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Globe className="h-2.5 w-2.5 text-gray-500" />
              </div>
              <p className="text-[#202124]">
                {url}
              </p>
            </div>
            {/* Description */}
            <p className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
              {metaDescription || fallbackDescription}
            </p>
          </div>
        </div>

        {/* OG Image (optional) */}
        {onOgImageUpload && ogImageUploadEndpoint && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Open Graph Bild (Social Media)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Wird bei Teilen auf Facebook, Twitter, LinkedIn etc. angezeigt. Empfohlen: 1200x630px
              </p>
              <ImageUploader
                value={ogImageUrl}
                onUpload={onOgImageUpload}
                onRemove={onOgImageRemove}
                uploadEndpoint={ogImageUploadEndpoint}
                uploadData={ogImageUploadData}
                aspectRatio={1200/630}
                placeholder="OG-Bild hochladen"
                description="JPEG, PNG, WebP • Empfohlen: 1200x630px"
                previewHeight="aspect-[1200/630] max-w-md"
              />
            </div>
          </>
        )}

        {/* Extra children */}
        {children}

        {/* SEO Audit */}
        {!hideAudit && (
          <>
            <Separator />
            <SEOAudit
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              content={content}
              focusKeyword={focusKeyword}
              onFocusKeywordChange={onFocusKeywordChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Kompakte Version für Tabs
interface SEOSectionProps {
  metaTitle: string | null
  metaDescription: string | null
  fallbackTitle?: string
  fallbackDescription?: string
  url: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  // Optional: OG Image Support
  ogImageUrl?: string | null
  onOgImageUpload?: (url: string) => void
  onOgImageRemove?: () => void
  ogImageUploadEndpoint?: string
  ogImageUploadData?: Record<string, string>
  // Optional: Extra children
  children?: ReactNode
  // Optional: Content für Keyword-Analyse
  content?: string | null
  // Optional: Focus-Keyword
  focusKeyword?: string
  onFocusKeywordChange?: (keyword: string) => void
  // Optional: SEO-Audit ausblenden
  hideAudit?: boolean
}

export function SEOSection({
  metaTitle,
  metaDescription,
  fallbackTitle = 'Seitentitel',
  fallbackDescription = 'Seitenbeschreibung...',
  url,
  onTitleChange,
  onDescriptionChange,
  ogImageUrl,
  onOgImageUpload,
  onOgImageRemove,
  ogImageUploadEndpoint,
  ogImageUploadData,
  children,
  content,
  focusKeyword,
  onFocusKeywordChange,
  hideAudit = false,
}: SEOSectionProps) {
  const titleLength = (metaTitle || '').length
  const descriptionLength = (metaDescription || '').length

  return (
    <div className="space-y-6">
      {/* Meta Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Meta-Titel</Label>
          <span className={`text-xs ${titleLength > 60 ? 'text-amber-500' : titleLength > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
            {titleLength}/70
          </span>
        </div>
        <Input
          value={metaTitle || ''}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={fallbackTitle}
          maxLength={70}
        />
      </div>

      {/* Meta Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Meta-Beschreibung</Label>
          <span className={`text-xs ${descriptionLength > 155 ? 'text-amber-500' : descriptionLength >= 120 ? 'text-green-500' : 'text-muted-foreground'}`}>
            {descriptionLength}/160
          </span>
        </div>
        <Textarea
          value={metaDescription || ''}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={fallbackDescription}
          maxLength={160}
          rows={3}
        />
      </div>

      {/* Google Preview - Weißer Hintergrund */}
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-gray-500" />
          <p className="text-sm font-medium text-gray-700">Google-Vorschau</p>
        </div>
        <div className="space-y-1 font-sans">
          <p className="text-[#1a0dab] text-xl hover:underline cursor-pointer leading-tight truncate">
            {metaTitle || fallbackTitle}
          </p>
          <div className="flex items-center gap-1 text-sm">
            <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Globe className="h-2.5 w-2.5 text-gray-500" />
            </div>
            <p className="text-[#202124]">{url}</p>
          </div>
          <p className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
            {metaDescription || fallbackDescription}
          </p>
        </div>
      </div>

      {/* OG Image (optional) */}
      {onOgImageUpload && ogImageUploadEndpoint && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Open Graph Bild (Social Media)
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Wird bei Teilen auf Facebook, Twitter, LinkedIn etc. angezeigt. Empfohlen: 1200x630px
          </p>
          <ImageUploader
            value={ogImageUrl}
            onUpload={onOgImageUpload}
            onRemove={onOgImageRemove}
            uploadEndpoint={ogImageUploadEndpoint}
            uploadData={ogImageUploadData}
            aspectRatio={1200/630}
            placeholder="OG-Bild hochladen"
            description="JPEG, PNG, WebP • Empfohlen: 1200x630px"
            previewHeight="aspect-[1200/630] max-w-md"
          />
        </div>
      )}

      {/* Extra children */}
      {children}

      {/* SEO Audit */}
      {!hideAudit && (
        <>
          <Separator className="my-6" />
          <SEOAudit
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            content={content}
            focusKeyword={focusKeyword}
            onFocusKeywordChange={onFocusKeywordChange}
          />
        </>
      )}
    </div>
  )
}
