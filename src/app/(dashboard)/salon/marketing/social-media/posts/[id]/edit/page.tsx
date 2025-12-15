'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Calendar } from '@/components/ui/calendar'
import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  Loader2,
  Sparkles,
  Hash,
  Image as ImageIcon,
  CalendarIcon,
  RefreshCw,
  X,
  Upload,
  Trash2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Share2,
  Check,
  Plus,
  Wand2,
  Film,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PostPreview } from '@/components/social/post-preview'

// Plattform-Konfiguration
const platforms = [
  { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500', maxLength: 2200 },
  { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-500', maxLength: 63206 },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-600', maxLength: 3000 },
  { id: 'TWITTER', name: 'X/Twitter', icon: Twitter, color: 'from-gray-800 to-black', maxLength: 280 },
  { id: 'TIKTOK', name: 'TikTok', icon: Share2, color: 'from-pink-500 to-cyan-500', maxLength: 2200 },
  { id: 'YOUTUBE', name: 'YouTube', icon: Youtube, color: 'from-red-600 to-red-500', maxLength: 5000 },
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

// AI-Bild-Modelle
const imageModels = [
  { id: 'flux-schnell', name: 'Flux Schnell ⚡', description: 'Schnell & kostenlos', free: true, credits: 1, recommended: true },
  { id: 'sdxl', name: 'Stable Diffusion XL', description: 'Klassische Qualität', free: false, credits: 3 },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5', description: 'Beste Qualität', free: false, credits: 5 },
]

interface Post {
  id: string
  content: string
  mediaUrls: string[]
  mediaTypes: string[]
  hashtags: string[]
  mentions: string[]
  linkUrl: string | null
  platforms: string[]
  status: string
  scheduledFor: string | null
  platformSettings: Record<string, unknown>
  aiGenerated: boolean
  aiPrompt: string | null
}

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false)
  
  // Form State
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>()
  const [scheduledTime, setScheduledTime] = useState('12:00')
  const [linkUrl, setLinkUrl] = useState('')
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiTone, setAiTone] = useState('friendly')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  
  // Original post reference
  const [originalPost, setOriginalPost] = useState<Post | null>(null)
  
  // Unsaved changes check
  const [hasChanges, setHasChanges] = useState(false)
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false)

  // Load post data
  useEffect(() => {
    loadPost()
  }, [resolvedParams.id])

  const loadPost = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/social/posts/${resolvedParams.id}`)
      
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Post nicht gefunden')
          router.push('/salon/marketing/social-media/posts')
          return
        }
        throw new Error('Fehler beim Laden')
      }
      
      const post: Post = await res.json()
      
      // Check if editable
      if (!['DRAFT', 'SCHEDULED'].includes(post.status)) {
        toast.error('Dieser Post kann nicht bearbeitet werden')
        router.push(`/salon/marketing/social-media/posts/${post.id}`)
        return
      }
      
      // Set form state from post
      setOriginalPost(post)
      setContent(post.content)
      setSelectedPlatforms(post.platforms)
      setHashtags(post.hashtags)
      setLinkUrl(post.linkUrl || '')
      setMediaItems(post.mediaUrls.map((url, i) => ({
        id: `media-${i}`,
        url,
        type: (post.mediaTypes[i] === 'video' ? 'video' : 'image') as 'image' | 'video',
      })))
      
      if (post.scheduledFor) {
        const date = new Date(post.scheduledFor)
        setScheduledDate(date)
        setScheduledTime(format(date, 'HH:mm'))
      }
      
      if (post.aiPrompt) {
        setAiPrompt(post.aiPrompt)
      }
    } catch (error) {
      console.error('Error loading post:', error)
      toast.error('Post konnte nicht geladen werden')
    } finally {
      setIsLoading(false)
    }
  }

  // Track changes
  useEffect(() => {
    if (!originalPost) return
    
    const changed = 
      content !== originalPost.content ||
      JSON.stringify(selectedPlatforms.sort()) !== JSON.stringify(originalPost.platforms.sort()) ||
      JSON.stringify(hashtags.sort()) !== JSON.stringify(originalPost.hashtags.sort()) ||
      linkUrl !== (originalPost.linkUrl || '') ||
      mediaItems.length !== originalPost.mediaUrls.length
    
    setHasChanges(changed)
  }, [content, selectedPlatforms, hashtags, linkUrl, mediaItems, originalPost])

  // Calculate character count
  const maxLength = Math.min(...selectedPlatforms.map(p => 
    platforms.find(pl => pl.id === p)?.maxLength || 2200
  ))
  const charCount = content.length
  const charPercentage = Math.min((charCount / maxLength) * 100, 100)

  // Platform toggle
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  // Hashtag management
  const addHashtag = () => {
    if (!hashtagInput.trim()) return
    const tag = hashtagInput.trim().replace(/^#/, '')
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag])
    }
    setHashtagInput('')
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag))
  }

  // Generate AI content
  const generateAIContent = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Bitte beschreibe, was du posten möchtest')
      return
    }
    
    setIsGenerating(true)
    try {
      const res = await fetch('/api/social/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          tone: aiTone,
          platforms: selectedPlatforms,
          includeHashtags,
          includeEmojis,
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Generierung fehlgeschlagen')
      }
      
      const data = await res.json()
      setContent(data.content)
      if (data.hashtags?.length > 0) {
        setHashtags(data.hashtags)
      }
      setAiDialogOpen(false)
      toast.success('Inhalt generiert!')
    } catch (error) {
      console.error('AI Error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler bei der Generierung')
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate hashtags
  const generateHashtags = async () => {
    if (!content.trim()) {
      toast.error('Schreibe zuerst einen Text')
      return
    }
    
    setIsGeneratingHashtags(true)
    try {
      const res = await fetch('/api/social/ai/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          count: 10,
        }),
      })
      
      if (!res.ok) throw new Error('Fehler')
      
      const data = await res.json()
      if (data.hashtags?.length > 0) {
        setHashtags(prev => [...new Set([...prev, ...data.hashtags])])
        toast.success(`${data.hashtags.length} Hashtags hinzugefügt`)
      }
    } catch (error) {
      toast.error('Hashtag-Generierung fehlgeschlagen')
    } finally {
      setIsGeneratingHashtags(false)
    }
  }

  // File upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return
    
    setIsUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', file.type.startsWith('video') ? 'video' : 'image')
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!res.ok) throw new Error('Upload fehlgeschlagen')
        
        const data = await res.json()
        
        setMediaItems(prev => [...prev, {
          id: `media-${Date.now()}`,
          url: data.url,
          type: file.type.startsWith('video') ? 'video' : 'image',
        }])
      }
      
      toast.success('Upload erfolgreich')
    } catch (error) {
      toast.error('Upload fehlgeschlagen')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeMedia = (id: string) => {
    setMediaItems(prev => prev.filter(m => m.id !== id))
  }

  // Save post
  const savePost = async (newStatus?: 'DRAFT' | 'SCHEDULED') => {
    if (selectedPlatforms.length === 0) {
      toast.error('Wähle mindestens eine Plattform')
      return
    }
    
    setIsSaving(true)
    
    try {
      let scheduledFor: string | null = null
      
      if (newStatus === 'SCHEDULED' && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number)
        const dateTime = new Date(scheduledDate)
        dateTime.setHours(hours, minutes, 0, 0)
        
        if (dateTime <= new Date()) {
          toast.error('Zeitpunkt muss in der Zukunft liegen')
          setIsSaving(false)
          return
        }
        
        scheduledFor = dateTime.toISOString()
      }
      
      const res = await fetch(`/api/social/posts/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          hashtags,
          mediaUrls: mediaItems.map(m => m.url),
          mediaTypes: mediaItems.map(m => m.type),
          linkUrl: linkUrl || null,
          scheduledFor,
          status: newStatus || 'DRAFT',
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Speichern fehlgeschlagen')
      }
      
      toast.success(newStatus === 'SCHEDULED' ? 'Post geplant!' : 'Änderungen gespeichert')
      setHasChanges(false)
      
      // Reload post data
      loadPost()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (hasChanges) {
                setConfirmLeaveOpen(true)
              } else {
                router.push(`/salon/marketing/social-media/posts/${resolvedParams.id}`)
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Post bearbeiten</h1>
            <p className="text-sm text-muted-foreground">
              Ändere deinen Post und speichere oder plane ihn
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => savePost('DRAFT')}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Speichern
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Clock className="h-4 w-4 mr-2" />
                Planen
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  locale={de}
                  disabled={(date) => date < new Date()}
                />
                <div>
                  <Label>Uhrzeit</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => savePost('SCHEDULED')}
                  disabled={!scheduledDate || isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {scheduledDate 
                    ? `Planen für ${format(scheduledDate, 'dd.MM.yyyy', { locale: de })}`
                    : 'Datum wählen'
                  }
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Platform Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Plattformen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const Icon = platform.icon
                  const isSelected = selectedPlatforms.includes(platform.id)
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                        isSelected
                          ? `bg-gradient-to-r ${platform.color} text-white border-transparent`
                          : 'hover:border-gray-400'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{platform.name}</span>
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Inhalt</CardTitle>
                <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      Mit KI verbessern
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>KI-Assistent</DialogTitle>
                      <DialogDescription>
                        Beschreibe, was du posten möchtest
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Thema / Idee</Label>
                        <Textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="z.B. Sommerstyling-Tipps für krauses Haar..."
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Tonalität</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tones.map((tone) => (
                            <Button
                              key={tone.id}
                              variant={aiTone === tone.id ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setAiTone(tone.id)}
                            >
                              {tone.emoji} {tone.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={includeHashtags}
                            onCheckedChange={setIncludeHashtags}
                          />
                          <Label>Hashtags</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={includeEmojis}
                            onCheckedChange={setIncludeEmojis}
                          />
                          <Label>Emojis</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button onClick={generateAIContent} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Generieren
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Was möchtest du teilen?"
                className="min-h-[200px] resize-none"
              />
              <div className="flex items-center justify-between text-sm">
                <span className={cn(
                  'text-muted-foreground',
                  charCount > maxLength && 'text-destructive'
                )}>
                  {charCount} / {maxLength} Zeichen
                </span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full transition-all',
                      charPercentage > 90 ? 'bg-red-500' : charPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    )}
                    style={{ width: `${charPercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hashtags */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Hashtags
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateHashtags}
                  disabled={isGeneratingHashtags || !content.trim()}
                >
                  {isGeneratingHashtags ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Auto-generieren
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  placeholder="#hashtag eingeben"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                />
                <Button onClick={addHashtag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      #{tag}
                      <button
                        onClick={() => removeHashtag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Medien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                        <div className="relative w-full h-full">
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            loop
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                          <Badge className="absolute bottom-2 right-2 bg-cyan-500">
                            <Film className="h-3 w-3 mr-1" />
                            Video
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeMedia(media.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-black/70">{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? 'Wird hochgeladen...' : 'Medien hinzufügen'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPlatforms.length > 0 ? (
                  <PostPreview
                    content={content}
                    hashtags={hashtags}
                    mediaUrls={mediaItems.map(m => m.url)}
                    platforms={selectedPlatforms}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Wähle eine Plattform für die Vorschau
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plattformen</span>
                    <span className="font-medium">{selectedPlatforms.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zeichen</span>
                    <span className={cn('font-medium', charCount > maxLength && 'text-destructive')}>
                      {charCount}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hashtags</span>
                    <span className="font-medium">{hashtags.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medien</span>
                    <span className="font-medium">{mediaItems.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Leave Dialog */}
      <AlertDialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ungespeicherte Änderungen</AlertDialogTitle>
            <AlertDialogDescription>
              Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => router.push(`/salon/marketing/social-media/posts/${resolvedParams.id}`)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ohne Speichern verlassen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

