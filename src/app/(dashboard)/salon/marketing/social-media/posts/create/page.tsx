'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import {
  ArrowLeft,
  Sparkles,
  Send,
  Clock,
  Save,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Share2,
  Loader2,
  Wand2,
  Hash,
  Image as ImageIcon,
  CalendarIcon,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  X,
  Upload,
  Trash2,
  Crop,
  ImagePlus,
  Film,
  Palette,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { PostPreview } from '@/components/social/post-preview'
import { ImageCropper } from '@/components/social/image-cropper'

// Plattform-Konfiguration
const platforms = [
  { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500', maxLength: 2200, maxImages: 10 },
  { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-500', maxLength: 63206, maxImages: 10 },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-600', maxLength: 3000, maxImages: 9 },
  { id: 'TWITTER', name: 'X/Twitter', icon: Twitter, color: 'from-gray-800 to-black', maxLength: 280, maxImages: 4 },
  { id: 'TIKTOK', name: 'TikTok', icon: Share2, color: 'from-pink-500 to-cyan-500', maxLength: 2200, maxImages: 35 },
  { id: 'YOUTUBE', name: 'YouTube', icon: Youtube, color: 'from-red-600 to-red-500', maxLength: 5000, maxImages: 1 },
]

// Tonalitäten für AI
const tones = [
  { id: 'friendly', name: 'Freundlich', emoji: '😊' },
  { id: 'professional', name: 'Professionell', emoji: '💼' },
  { id: 'casual', name: 'Locker', emoji: '✌️' },
  { id: 'playful', name: 'Verspielt', emoji: '🎉' },
  { id: 'inspirational', name: 'Inspirierend', emoji: '✨' },
  { id: 'promotional', name: 'Werblich', emoji: '📢' },
]

// AI-Bild-Stile
const imageStyles = [
  { id: 'vivid', name: 'Lebendig', description: 'Kräftige, auffällige Farben' },
  { id: 'natural', name: 'Natürlich', description: 'Realistischer Look' },
  { id: 'artistic', name: 'Künstlerisch', description: 'Kreative Interpretation' },
]

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  originalName?: string
  croppedVersions?: Record<string, Record<string, string>>
}

export default function CreatePostPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai')
  
  // Form State
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['INSTAGRAM'])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>()
  const [scheduledTime, setScheduledTime] = useState('12:00')
  const [isScheduling, setIsScheduling] = useState(false)
  
  // Media State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedMediaForCrop, setSelectedMediaForCrop] = useState<MediaItem | null>(null)
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiTone, setAiTone] = useState('friendly')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  
  // AI Image State
  const [aiImagePrompt, setAiImagePrompt] = useState('')
  const [aiImageStyle, setAiImageStyle] = useState('vivid')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [aiImageDialogOpen, setAiImageDialogOpen] = useState(false)
  
  // Submission State
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Berechne Limits
  const getMaxLength = () => {
    const selectedPlatformData = platforms.filter(p => selectedPlatforms.includes(p.id))
    return Math.min(...selectedPlatformData.map(p => p.maxLength))
  }
  
  const getMaxImages = () => {
    const selectedPlatformData = platforms.filter(p => selectedPlatforms.includes(p.id))
    return Math.min(...selectedPlatformData.map(p => p.maxImages))
  }

  const characterCount = content.length
  const maxLength = getMaxLength()
  const isOverLimit = characterCount > maxLength
  const maxImages = getMaxImages()

  // Media Upload Handler
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const remainingSlots = maxImages - mediaItems.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    
    if (filesToUpload.length === 0) {
      toast.error(`Maximum ${maxImages} Medien erlaubt`)
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('platform', selectedPlatforms[0] || 'INSTAGRAM')
        
        const res = await fetch('/api/social/media/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Upload fehlgeschlagen')
        }
        
        const data = await res.json()
        
        const newMedia: MediaItem = {
          id: `${Date.now()}-${i}`,
          url: data.url,
          type: data.mediaType,
          originalName: file.name,
        }
        
        setMediaItems(prev => [...prev, newMedia])
        setUploadProgress(((i + 1) / filesToUpload.length) * 100)
      } catch (error) {
        console.error('Upload error:', error)
        toast.error(error instanceof Error ? error.message : 'Upload fehlgeschlagen')
      }
    }
    
    setIsUploading(false)
    setUploadProgress(0)
    toast.success(`${filesToUpload.length} Datei(en) hochgeladen`)
  }, [maxImages, mediaItems.length, selectedPlatforms])
  
  // Drag & Drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }, [handleFileUpload])
  
  // Media löschen
  const removeMedia = async (mediaId: string) => {
    const media = mediaItems.find(m => m.id === mediaId)
    if (media) {
      try {
        await fetch(`/api/social/media/upload?url=${encodeURIComponent(media.url)}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.warn('Could not delete from blob storage:', error)
      }
    }
    setMediaItems(prev => prev.filter(m => m.id !== mediaId))
  }
  
  // AI Bild generieren
  const generateAIImage = async () => {
    if (!aiImagePrompt.trim()) {
      toast.error('Bitte beschreibe das gewünschte Bild')
      return
    }
    
    setIsGeneratingImage(true)
    
    try {
      const res = await fetch('/api/social/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiImagePrompt,
          platform: selectedPlatforms[0] || 'INSTAGRAM',
          style: aiImageStyle,
          industry: 'Friseur/Beauty/Salon',
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Bildgenerierung fehlgeschlagen')
      }
      
      const data = await res.json()
      
      const newMedia: MediaItem = {
        id: `ai-${Date.now()}`,
        url: data.imageUrl,
        type: 'image',
        originalName: 'AI Generated Image',
      }
      
      setMediaItems(prev => [...prev, newMedia])
      setAiImageDialogOpen(false)
      setAiImagePrompt('')
      toast.success('KI-Bild generiert!')
    } catch (error) {
      console.error('AI Image error:', error)
      toast.error(error instanceof Error ? error.message : 'Bildgenerierung fehlgeschlagen')
    } finally {
      setIsGeneratingImage(false)
    }
  }
  
  // Crop Handler
  const handleCropComplete = (croppedUrl: string, platform: string, formatKey: string) => {
    if (selectedMediaForCrop) {
      setMediaItems(prev => prev.map(item => {
        if (item.id === selectedMediaForCrop.id) {
          return {
            ...item,
            croppedVersions: {
              ...item.croppedVersions,
              [platform]: {
                ...(item.croppedVersions?.[platform] || {}),
                [formatKey]: croppedUrl,
              },
            },
          }
        }
        return item
      }))
    }
    setCropDialogOpen(false)
    setSelectedMediaForCrop(null)
  }

  // AI Content generieren
  const generateContent = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Bitte gib ein Thema oder eine Beschreibung ein')
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/social/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          platforms: selectedPlatforms,
          tone: aiTone,
          includeHashtags,
          includeEmojis,
          maxLength: getMaxLength(),
          industry: 'Friseur/Beauty/Salon',
        }),
      })

      if (!res.ok) throw new Error('Generierung fehlgeschlagen')

      const data = await res.json()
      setContent(data.content)
      if (data.hashtags && data.hashtags.length > 0) {
        setHashtags(data.hashtags)
      }
      toast.success('Content generiert!')
      setActiveTab('manual')
    } catch (error) {
      console.error('Generate error:', error)
      toast.error('Fehler bei der Content-Generierung')
    } finally {
      setIsGenerating(false)
    }
  }

  // Content verbessern
  const improveContent = async (action: string) => {
    if (!content.trim()) {
      toast.error('Bitte erst Content eingeben')
      return
    }

    setIsImproving(true)
    try {
      const res = await fetch('/api/social/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          action,
          platform: selectedPlatforms[0],
        }),
      })

      if (!res.ok) throw new Error('Verbesserung fehlgeschlagen')

      const data = await res.json()
      setContent(data.improved)
      toast.success('Content verbessert!')
    } catch (error) {
      console.error('Improve error:', error)
      toast.error('Fehler bei der Verbesserung')
    } finally {
      setIsImproving(false)
    }
  }

  // Hashtags generieren
  const generateHashtags = async () => {
    if (!content.trim()) {
      toast.error('Bitte erst Content eingeben')
      return
    }

    try {
      const res = await fetch('/api/social/ai/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platform: selectedPlatforms[0] || 'INSTAGRAM',
          count: 10,
        }),
      })

      if (!res.ok) throw new Error('Hashtag-Generierung fehlgeschlagen')

      const data = await res.json()
      setHashtags(prev => [...new Set([...prev, ...data.all])])
      toast.success(`${data.all.length} Hashtags generiert!`)
    } catch (error) {
      console.error('Hashtag error:', error)
      toast.error('Fehler bei der Hashtag-Generierung')
    }
  }

  // Hashtag hinzufügen
  const addHashtag = () => {
    if (!hashtagInput.trim()) return
    const tag = hashtagInput.trim().replace('#', '')
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag])
    }
    setHashtagInput('')
  }

  // Hashtag entfernen
  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag))
  }

  // Plattform togglen
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  // Content kopieren
  const copyContent = () => {
    const fullContent = hashtags.length > 0
      ? `${content}\n\n${hashtags.map(h => `#${h}`).join(' ')}`
      : content
    navigator.clipboard.writeText(fullContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('In Zwischenablage kopiert!')
  }

  // Post speichern
  const savePost = async (status: 'DRAFT' | 'SCHEDULED') => {
    if (!content.trim()) {
      toast.error('Bitte Content eingeben')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Bitte mind. eine Plattform wählen')
      return
    }

    if (status === 'SCHEDULED' && !scheduledDate) {
      toast.error('Bitte Datum für Planung wählen')
      return
    }

    setIsSaving(true)
    try {
      let scheduledFor = null
      if (status === 'SCHEDULED' && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number)
        const scheduled = new Date(scheduledDate)
        scheduled.setHours(hours, minutes, 0, 0)
        scheduledFor = scheduled.toISOString()
      }

      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          hashtags,
          mediaUrls: mediaItems.map(m => m.url),
          platforms: selectedPlatforms,
          status,
          scheduledFor,
          aiGenerated: activeTab === 'ai' || isGenerating,
          aiPrompt: aiPrompt || null,
          croppedMedia: mediaItems.reduce((acc, m) => {
            if (m.croppedVersions) {
              acc[m.id] = m.croppedVersions
            }
            return acc
          }, {} as Record<string, Record<string, Record<string, string>>>),
        }),
      })

      if (!res.ok) throw new Error('Speichern fehlgeschlagen')

      toast.success(status === 'DRAFT' ? 'Entwurf gespeichert!' : 'Post geplant!')
      router.push('/salon/marketing/social-media')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Neuen Post erstellen</h1>
          <p className="text-muted-foreground">
            Erstelle Content mit KI-Unterstützung und automatischer Bildanpassung
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? 'Editor' : 'Vorschau'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Haupt-Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plattform-Auswahl */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Plattformen</CardTitle>
              <CardDescription>Wähle, wo du posten möchtest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const Icon = platform.icon
                  const isSelected = selectedPlatforms.includes(platform.id)
                  return (
                    <Button
                      key={platform.id}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        'transition-all',
                        isSelected && `bg-gradient-to-r ${platform.color} border-0 text-white`
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {platform.name}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Media Upload */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Medien
                  </CardTitle>
                  <CardDescription>
                    Max. {maxImages} Bilder/Videos für gewählte Plattformen
                  </CardDescription>
                </div>
                
                {/* AI Image Button */}
                <Dialog open={aiImageDialogOpen} onOpenChange={setAiImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Wand2 className="h-4 w-4" />
                      KI-Bild
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        KI-Bild generieren
                      </DialogTitle>
                      <DialogDescription>
                        Beschreibe das gewünschte Bild für deinen Post
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Bildbeschreibung</Label>
                        <Textarea
                          value={aiImagePrompt}
                          onChange={(e) => setAiImagePrompt(e.target.value)}
                          placeholder="z.B. 'Eine elegante Balayage-Frisur in goldblonden Tönen, professionelles Salon-Setting'"
                          className="mt-2 min-h-[100px]"
                        />
                      </div>
                      
                      <div>
                        <Label>Stil</Label>
                        <Select value={aiImageStyle} onValueChange={setAiImageStyle}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {imageStyles.map(style => (
                              <SelectItem key={style.id} value={style.id}>
                                <div>
                                  <div className="font-medium">{style.name}</div>
                                  <div className="text-xs text-muted-foreground">{style.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        onClick={generateAIImage}
                        disabled={isGeneratingImage || !aiImagePrompt.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {isGeneratingImage ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generiere...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Bild generieren
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Upload läuft...</p>
                </div>
              )}
              
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  "hover:border-primary hover:bg-primary/5",
                  mediaItems.length >= maxImages && "opacity-50 pointer-events-none"
                )}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Bilder oder Videos hierher ziehen oder klicken
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP, GIF, MP4 (max. 10MB/100MB)
                </p>
              </div>
              
              {/* Media Grid */}
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {mediaItems.map((media, index) => (
                    <div key={media.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                      {media.type === 'image' ? (
                        <Image
                          src={media.url}
                          alt={`Media ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {media.type === 'image' && (
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedMediaForCrop(media)
                              setCropDialogOpen(true)
                            }}
                          >
                            <Crop className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeMedia(media.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Index Badge */}
                      <Badge className="absolute top-2 left-2 bg-black/70">
                        {index + 1}
                      </Badge>
                      
                      {/* Cropped Indicator */}
                      {media.croppedVersions && Object.keys(media.croppedVersions).length > 0 && (
                        <Badge className="absolute top-2 right-2 bg-green-500/90">
                          <Check className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  ))}
                  
                  {/* Add More Button */}
                  {mediaItems.length < maxImages && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content-Erstellung */}
          <Card>
            <CardHeader className="pb-3">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ai' | 'manual')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ai" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    KI-Assistent
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <Send className="h-4 w-4" />
                    Editor
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {activeTab === 'ai' ? (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Was möchtest du posten?</Label>
                      <Textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="z.B. 'Neuer Balayage-Trend für den Sommer' oder 'Tipps für gesundes Haar'"
                        className="min-h-[100px] mt-2"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Tonalität</Label>
                        <Select value={aiTone} onValueChange={setAiTone}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tones.map((tone) => (
                              <SelectItem key={tone.id} value={tone.id}>
                                {tone.emoji} {tone.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Hashtags einschließen</Label>
                          <Switch checked={includeHashtags} onCheckedChange={setIncludeHashtags} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Emojis verwenden</Label>
                          <Switch checked={includeEmojis} onCheckedChange={setIncludeEmojis} />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={generateContent}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Content generieren
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Content</Label>
                        <span className={cn(
                          'text-xs',
                          isOverLimit ? 'text-red-500' : 'text-muted-foreground'
                        )}>
                          {characterCount} / {maxLength}
                        </span>
                      </div>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Schreibe deinen Post..."
                        className={cn(
                          'min-h-[200px]',
                          isOverLimit && 'border-red-500 focus-visible:ring-red-500'
                        )}
                      />
                    </div>

                    {/* AI Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => improveContent('improve')}
                        disabled={isImproving || !content}
                      >
                        {isImproving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                        Verbessern
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => improveContent('shorten')}
                        disabled={isImproving || !content}
                      >
                        Kürzen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => improveContent('engaging')}
                        disabled={isImproving || !content}
                      >
                        Mehr Engagement
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => improveContent('emoji')}
                        disabled={isImproving || !content}
                      >
                        Emojis
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Hashtags */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtags
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={generateHashtags} disabled={!content}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generieren
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  placeholder="Hashtag hinzufügen..."
                  onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                />
                <Button onClick={addHashtag} disabled={!hashtagInput.trim()}>
                  Hinzufügen
                </Button>
              </div>

              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      #{tag}
                      <button onClick={() => removeHashtag(tag)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview oder Mini-Preview */}
          {showPreview && selectedPlatforms.length > 0 ? (
            <PostPreview
              content={content}
              hashtags={hashtags}
              mediaUrls={mediaItems.map(m => m.url)}
              platforms={selectedPlatforms}
            />
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Schnell-Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4 bg-muted/30">
                  {mediaItems.length > 0 && (
                    <div className="aspect-video relative rounded-lg overflow-hidden mb-3 bg-muted">
                      <Image
                        src={mediaItems[0].url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      {mediaItems.length > 1 && (
                        <Badge className="absolute top-2 right-2 bg-black/70">
                          +{mediaItems.length - 1}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {content ? (
                    <>
                      <p className="text-sm whitespace-pre-wrap line-clamp-4">{content}</p>
                      {hashtags.length > 0 && (
                        <p className="text-sm text-blue-500 mt-2 line-clamp-2">
                          {hashtags.map(h => `#${h}`).join(' ')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Dein Post erscheint hier...
                    </p>
                  )}
                </div>

                <Button variant="outline" className="w-full mt-3" onClick={copyContent} disabled={!content}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Kopiert!' : 'Kopieren'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Zeitplanung */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Zeitplanung
                </CardTitle>
                <Switch checked={isScheduling} onCheckedChange={setIsScheduling} />
              </div>
            </CardHeader>
            {isScheduling && (
              <CardContent className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {scheduledDate ? format(scheduledDate, 'PPP', { locale: de }) : 'Datum wählen'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>

                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </CardContent>
            )}
          </Card>

          {/* Aktionen */}
          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => savePost(isScheduling ? 'SCHEDULED' : 'DRAFT')}
              disabled={isSaving || !content || selectedPlatforms.length === 0}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isScheduling ? (
                <Clock className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isScheduling ? 'Planen' : 'Als Entwurf speichern'}
            </Button>

            {isOverLimit && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Text ist zu lang für ausgewählte Plattformen
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bild zuschneiden</DialogTitle>
            <DialogDescription>
              Passe das Bild für verschiedene Plattformen an
            </DialogDescription>
          </DialogHeader>
          
          {selectedMediaForCrop && (
            <ImageCropper
              imageUrl={selectedMediaForCrop.url}
              platforms={selectedPlatforms}
              onCropComplete={handleCropComplete}
              onCancel={() => {
                setCropDialogOpen(false)
                setSelectedMediaForCrop(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
