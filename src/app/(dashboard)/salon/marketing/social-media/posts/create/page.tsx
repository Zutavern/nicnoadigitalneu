'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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
  DialogFooter,
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
  Eye,
  ChevronRight,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { PostPreview } from '@/components/social/post-preview'
import { ImageCropper } from '@/components/social/image-cropper'

// Plattform-Konfiguration mit Video-Support
const platforms = [
  { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500', maxLength: 2200, maxImages: 10, supportsVideo: true, videoRequired: false },
  { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-500', maxLength: 63206, maxImages: 10, supportsVideo: true, videoRequired: false },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-600', maxLength: 3000, maxImages: 9, supportsVideo: true, videoRequired: false },
  { id: 'TWITTER', name: 'X/Twitter', icon: Twitter, color: 'from-gray-800 to-black', maxLength: 280, maxImages: 4, supportsVideo: true, videoRequired: false },
  { id: 'TIKTOK', name: 'TikTok', icon: Share2, color: 'from-pink-500 to-cyan-500', maxLength: 2200, maxImages: 35, supportsVideo: true, videoRequired: true },
  { id: 'YOUTUBE', name: 'YouTube', icon: Youtube, color: 'from-red-600 to-red-500', maxLength: 5000, maxImages: 1, supportsVideo: true, videoRequired: true },
]

// Video-Modelle für Replicate (vereinfacht für Einsteiger)
const videoModels = [
  { 
    id: 'minimax-video-01', 
    name: 'Schnelles Video', 
    description: 'Erstellt ein Video aus deiner Beschreibung',
    type: 'text-to-video' as const,
    credits: 50,
    duration: '~1 Min',
    quality: 'Gut',
  },
  { 
    id: 'cogvideox', 
    name: 'CogVideoX', 
    description: 'Open-Source Alternative für Text-zu-Video',
    type: 'text-to-video' as const,
    credits: 40,
    duration: '~1.5 Min',
    quality: 'Gut',
  },
  { 
    id: 'minimax-video-01-live', 
    name: 'Bild zum Leben erwecken', 
    description: 'Macht ein Bild zu einem kurzen Video',
    type: 'image-to-video' as const,
    credits: 50,
    duration: '~1 Min',
    quality: 'Sehr gut',
  },
  { 
    id: 'animatediff', 
    name: 'AnimateDiff', 
    description: 'Animiert ein Bild mit Bewegungssteuerung',
    type: 'image-animation' as const,
    credits: 10,
    duration: '~45 Sek',
    quality: 'Standard',
  },
  { 
    id: 'stable-video-diffusion', 
    name: 'Bild-Animation', 
    description: 'Klassische Bild-Animation (günstigste Option)',
    type: 'image-animation' as const,
    credits: 10,
    duration: '~30 Sek',
    quality: 'Standard',
  },
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

// AI-Bild-Modelle - OpenRouter (Text-zu-Bild via Chat)
const openRouterImageModels = [
  { id: 'gemini-2-flash', name: 'Gemini 2.0 Flash ⚡', description: 'Schnell, kostenlos & zuverlässig', free: true, credits: 1, recommended: true, provider: 'openrouter' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Neuestes Gemini-Modell', free: false, credits: 3, provider: 'openrouter' },
  { id: 'ideogram-v2', name: 'Ideogram V2', description: 'Beste Qualität, Text auf Bildern', free: false, credits: 5, provider: 'openrouter' },
  { id: 'recraft-v3', name: 'Recraft V3', description: 'Kreativ & stilvoll', free: false, credits: 5, provider: 'openrouter' },
  { id: 'dall-e-3', name: 'DALL-E 3', description: 'OpenAI Standard - bewährt', free: false, credits: 8, provider: 'openrouter' },
]

// AI-Bild-Modelle - Replicate (Spezialisiert auf Bildgenerierung)
const replicateImageModels = [
  { id: 'flux-schnell', name: 'Flux Schnell ⚡', description: 'Ultra-schnell & günstig', free: true, credits: 1, recommended: true, provider: 'replicate' },
  { id: 'flux-dev', name: 'Flux Dev', description: 'Gute Qualität mit Prompt-Treue', free: false, credits: 3, provider: 'replicate' },
  { id: 'sdxl-lightning', name: 'SDXL Lightning ⚡', description: 'Ultra-schnell in 4 Schritten', free: true, credits: 1, provider: 'replicate' },
  { id: 'sd35-turbo', name: 'SD 3.5 Turbo', description: 'Neueste SD Version, schnell', free: false, credits: 2, provider: 'replicate' },
  { id: 'playground-v25', name: 'Playground V2.5', description: 'Ästhetisch für Social Media', free: false, credits: 2, provider: 'replicate' },
  { id: 'realvisxl', name: 'RealVisXL V4', description: 'Fotorealistisch - für Produktbilder', free: false, credits: 2, provider: 'replicate' },
  { id: 'flux-pro-11', name: 'Flux Pro 1.1 ✨', description: 'Premium Qualität', free: false, credits: 5, provider: 'replicate' },
  { id: 'ideogram', name: 'Ideogram V2 Turbo', description: 'Beste Text-auf-Bild Qualität', free: false, credits: 3, provider: 'replicate' },
]

// Kombinierte Liste für Anzeige
const allImageModels = [
  ...replicateImageModels.map(m => ({ ...m, providerName: 'Replicate' })),
  ...openRouterImageModels.map(m => ({ ...m, providerName: 'OpenRouter' })),
]

// Legacy alias für Kompatibilität
const imageModels = allImageModels

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  originalName?: string
  croppedVersions?: Record<string, Record<string, string>>
  isAiGenerated?: boolean
  aiPrompt?: string
}

export default function CreatePostPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Workflow Step: 1 = Content, 2 = Media, 3 = Schedule
  const [currentStep, setCurrentStep] = useState(1)
  
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
  
  // AI Image State - verbessert
  const [aiImagePrompt, setAiImagePrompt] = useState('')
  const [aiImageStyle, setAiImageStyle] = useState('vivid')
  const [aiImageModel, setAiImageModel] = useState('flux-schnell') // Replicate - schnell & günstig
  const [useContentAsPrompt, setUseContentAsPrompt] = useState(true)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [aiImageDialogOpen, setAiImageDialogOpen] = useState(false)
  
  // Video State
  const [mediaMode, setMediaMode] = useState<'image' | 'video'>('image')
  const [videoModel, setVideoModel] = useState('minimax-video-01')
  const [videoPrompt, setVideoPrompt] = useState('')
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [aiVideoDialogOpen, setAiVideoDialogOpen] = useState(false)
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null)
  const [replicateEnabled, setReplicateEnabled] = useState(false)
  
  // Submission State
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  // Auto-Update AI Image Prompt when content changes
  useEffect(() => {
    if (useContentAsPrompt && content.trim()) {
      // Generiere einen sinnvollen Bildprompt aus dem Content
      const cleanContent = content
        .replace(/#\w+/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 200)
      
      if (cleanContent.length > 20) {
        setAiImagePrompt(`Erstelle ein passendes Bild für: "${cleanContent}"`)
        setVideoPrompt(cleanContent) // Auch Video-Prompt aktualisieren
      }
    }
  }, [content, useContentAsPrompt])

  // Prüfe ob Replicate aktiviert ist
  useEffect(() => {
    const checkReplicate = async () => {
      try {
        const res = await fetch('/api/social/ai/video')
        if (res.ok) {
          const data = await res.json()
          setReplicateEnabled(data.enabled)
        }
      } catch {
        setReplicateEnabled(false)
      }
    }
    checkReplicate()
  }, [])

  // Automatisch Video-Modus aktivieren wenn nur Video-Plattformen ausgewählt
  useEffect(() => {
    const selectedPlatformData = platforms.filter(p => selectedPlatforms.includes(p.id))
    const allRequireVideo = selectedPlatformData.every(p => p.videoRequired)
    const anySupportsVideo = selectedPlatformData.some(p => p.supportsVideo)
    
    if (allRequireVideo && anySupportsVideo) {
      setMediaMode('video')
    }
  }, [selectedPlatforms])

  // Hilfsfunktionen für Video
  const supportsVideo = () => {
    const selectedPlatformData = platforms.filter(p => selectedPlatforms.includes(p.id))
    return selectedPlatformData.some(p => p.supportsVideo)
  }

  const requiresVideo = () => {
    const selectedPlatformData = platforms.filter(p => selectedPlatforms.includes(p.id))
    return selectedPlatformData.some(p => p.videoRequired)
  }

  const selectedVideoModel = videoModels.find(m => m.id === videoModel)

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
  
  // AI Bild generieren - verbessert mit auto-Prompt und Provider-Auswahl
  const generateAIImage = async () => {
    // Prüfen ob wir Content haben wenn useContentAsPrompt aktiv ist
    if (useContentAsPrompt && !content.trim()) {
      toast.error('Bitte erst den Post-Text schreiben, damit ein passendes Bild generiert werden kann')
      return
    }
    
    if (!useContentAsPrompt && !aiImagePrompt.trim()) {
      toast.error('Bitte beschreibe das gewünschte Bild')
      return
    }
    
    setIsGeneratingImage(true)
    
    try {
      // Bestimme den Provider basierend auf dem gewählten Modell
      const selectedModelConfig = allImageModels.find(m => m.id === aiImageModel)
      const provider = selectedModelConfig?.provider || 'replicate'
      
      // Wähle die richtige API basierend auf dem Provider
      const apiEndpoint = provider === 'replicate' 
        ? '/api/social/ai/image-replicate'
        : '/api/social/ai/image'
      
      const requestBody = useContentAsPrompt 
        ? {
            postContent: content + (hashtags.length > 0 ? ' ' + hashtags.map(h => `#${h}`).join(' ') : ''),
            prompt: content + (hashtags.length > 0 ? ' ' + hashtags.map(h => `#${h}`).join(' ') : ''), // Auch prompt für Replicate
            platform: selectedPlatforms[0] || 'INSTAGRAM',
            style: aiImageStyle,
            model: aiImageModel,
            industry: 'Friseur/Beauty/Salon',
          }
        : {
            prompt: aiImagePrompt,
            platform: selectedPlatforms[0] || 'INSTAGRAM',
            style: aiImageStyle,
            model: aiImageModel,
            industry: 'Friseur/Beauty/Salon',
          }
      
      console.log(`[AI Image] Using provider: ${provider}, endpoint: ${apiEndpoint}`)
      
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        const errorMsg = data.error || 'Bildgenerierung fehlgeschlagen'
        const hint = data.hint || ''
        throw new Error(hint ? `${errorMsg}\n\n${hint}` : errorMsg)
      }
      
      const newMedia: MediaItem = {
        id: `ai-${Date.now()}`,
        url: data.imageUrl,
        type: 'image',
        originalName: 'KI-generiertes Bild',
        isAiGenerated: true,
        aiPrompt: data.prompt,
      }
      
      setMediaItems(prev => [...prev, newMedia])
      setAiImageDialogOpen(false)
      
      // Zeige welches Modell verwendet wurde
      if (data.model?.usedFallback) {
        toast.success(`KI-Bild generiert! (Fallback: ${data.model.name})`)
      } else {
        toast.success('KI-Bild erfolgreich generiert!')
      }
    } catch (error) {
      console.error('AI Image error:', error)
      toast.error(error instanceof Error ? error.message : 'Bildgenerierung fehlgeschlagen')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // AI Video generieren
  const generateAIVideo = async () => {
    if (!videoPrompt.trim()) {
      toast.error('Bitte beschreibe das gewünschte Video')
      return
    }

    const model = videoModels.find(m => m.id === videoModel)
    if (!model) {
      toast.error('Bitte wähle ein Video-Modell aus')
      return
    }

    // Prüfe ob Bild benötigt wird
    if ((model.type === 'image-to-video' || model.type === 'image-animation') && !videoSourceImage) {
      toast.error('Dieses Modell benötigt ein Bild als Ausgangspunkt')
      return
    }

    setIsGeneratingVideo(true)

    try {
      const res = await fetch('/api/social/ai/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          type: model.type === 'image-animation' ? 'image-to-video' : model.type,
          model: videoModel,
          imageUrl: videoSourceImage,
          optimizePrompt: true,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.hint || 'Video-Generierung fehlgeschlagen')
      }

      const newMedia: MediaItem = {
        id: `video-${Date.now()}`,
        url: data.videoUrl,
        type: 'video',
        originalName: 'KI-generiertes Video',
        isAiGenerated: true,
        aiPrompt: videoPrompt,
      }

      setMediaItems(prev => [...prev, newMedia])
      setAiVideoDialogOpen(false)
      toast.success(`Video generiert! (${data.credits?.used || model.credits} Credits verwendet)`)
    } catch (error) {
      console.error('AI Video error:', error)
      toast.error(error instanceof Error ? error.message : 'Video-Generierung fehlgeschlagen')
    } finally {
      setIsGeneratingVideo(false)
    }
  }

  // Video-Bild aus vorhandenen Medien wählen
  const selectImageForVideo = (imageUrl: string) => {
    setVideoSourceImage(imageUrl)
    // Wechsle zu passendem Modell wenn nötig
    const currentModel = videoModels.find(m => m.id === videoModel)
    if (currentModel?.type === 'text-to-video') {
      setVideoModel('minimax-video-01-live') // Wechsle zu Bild-zu-Video Modell
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
    toast.success('Bild zugeschnitten')
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
          aiGenerated: isGenerating,
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

  // Step Navigation
  const canProceedToStep2 = content.trim().length > 0 && selectedPlatforms.length > 0
  const canProceedToStep3 = canProceedToStep2

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
            Erstelle Content mit KI-Unterstützung
          </p>
        </div>
      </div>
      
      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { step: 1, label: 'Text & Plattformen' },
          { step: 2, label: 'Medien & Bilder' },
          { step: 3, label: 'Planen & Veröffentlichen' },
        ].map((item, index) => (
          <div key={item.step} className="flex items-center">
            <button
              onClick={() => {
                if (item.step === 1 || (item.step === 2 && canProceedToStep2) || (item.step === 3 && canProceedToStep3)) {
                  setCurrentStep(item.step)
                }
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                currentStep === item.step 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                  : currentStep > item.step
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > item.step ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {item.step}
                </span>
              )}
              {item.label}
            </button>
            {index < 2 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Haupt-Editor */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: Content & Plattformen */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
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

                {/* Content-Erstellung */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Content erstellen
                    </CardTitle>
                    <CardDescription>
                      Nutze KI oder schreibe manuell
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* AI Prompt */}
                    <div>
                      <Label>Was möchtest du posten?</Label>
                      <div className="flex gap-2 mt-2">
                        <Textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="z.B. 'Neuer Balayage-Trend' oder 'Tipps für gesundes Haar'"
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                    
                    {/* AI Options */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label>Tonalität</Label>
                        <Select value={aiTone} onValueChange={setAiTone}>
                          <SelectTrigger className="mt-1">
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
                      
                      <div className="flex items-center gap-2 pt-6">
                        <Switch checked={includeHashtags} onCheckedChange={setIncludeHashtags} />
                        <Label className="text-sm">Hashtags</Label>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-6">
                        <Switch checked={includeEmojis} onCheckedChange={setIncludeEmojis} />
                        <Label className="text-sm">Emojis</Label>
                      </div>
                    </div>
                    
                    <Button
                      onClick={generateContent}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Content mit KI generieren
                    </Button>
                    
                    {/* Trennlinie */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          oder manuell bearbeiten
                        </span>
                      </div>
                    </div>
                    
                    {/* Manual Content */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Post-Text</Label>
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
                          'min-h-[150px]',
                          isOverLimit && 'border-red-500'
                        )}
                      />
                    </div>

                    {/* AI Quick Actions */}
                    {content && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => improveContent('improve')}
                          disabled={isImproving}
                        >
                          {isImproving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          Verbessern
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => improveContent('shorten')}
                          disabled={isImproving}
                        >
                          Kürzen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => improveContent('engaging')}
                          disabled={isImproving}
                        >
                          Mehr Engagement
                        </Button>
                      </div>
                    )}
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
                
                {/* Weiter zu Step 2 */}
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep2}
                  className="w-full"
                  size="lg"
                >
                  Weiter zu Medien & Bilder
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
            
            {/* STEP 2: Medien */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Medien hinzufügen
                        </CardTitle>
                        <CardDescription>
                          Max. {maxImages} Bilder/Videos • KI-Bilder basieren auf deinem Text
                        </CardDescription>
                      </div>
                      
                      {/* AI Image Button */}
                      <Dialog open={aiImageDialogOpen} onOpenChange={setAiImageDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500">
                            <Wand2 className="h-4 w-4" />
                            KI-Bild erstellen
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-purple-500" />
                              KI-Bild generieren
                            </DialogTitle>
                            <DialogDescription>
                              {content.trim() 
                                ? 'Basierend auf deinem Post-Text wird ein passendes Bild generiert.'
                                : 'Beschreibe das gewünschte Bild oder gehe zurück und schreibe erst deinen Text.'}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            {/* Auto-Prompt Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                              <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm">Bild aus Post-Text ableiten</Label>
                              </div>
                              <Switch 
                                checked={useContentAsPrompt} 
                                onCheckedChange={setUseContentAsPrompt}
                                disabled={!content.trim()}
                              />
                            </div>
                            
                            {/* Post-Text Vorschau (wenn auto) */}
                            {useContentAsPrompt && content.trim() && (
                              <div className="p-3 rounded-lg border bg-muted/50">
                                <Label className="text-xs text-muted-foreground">Dein Post-Text:</Label>
                                <p className="text-sm mt-1 line-clamp-3">{content}</p>
                              </div>
                            )}
                            
                            {/* Manueller Prompt (wenn nicht auto) */}
                            {!useContentAsPrompt && (
                              <div>
                                <Label>Bildbeschreibung</Label>
                                <Textarea
                                  value={aiImagePrompt}
                                  onChange={(e) => setAiImagePrompt(e.target.value)}
                                  placeholder="z.B. 'Eine elegante Balayage-Frisur in goldblonden Tönen, professionelles Salon-Setting'"
                                  className="mt-2 min-h-[100px]"
                                />
                              </div>
                            )}
                            
                            {/* Stil & Modell */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Stil</Label>
                                <Select value={aiImageStyle} onValueChange={setAiImageStyle}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {imageStyles.map(style => (
                                      <SelectItem key={style.id} value={style.id}>
                                        {style.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label>KI-Modell</Label>
                                <Select value={aiImageModel} onValueChange={setAiImageModel}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-80">
                                    {/* Replicate Modelle - Spezialisiert */}
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                      🚀 Replicate (Spezialisiert)
                                    </div>
                                    {replicateImageModels.map(model => (
                                      <SelectItem key={`replicate-${model.id}`} value={model.id}>
                                        <div className="flex items-center gap-2">
                                          <span>{model.name}</span>
                                          {model.free && (
                                            <Badge variant="secondary" className="text-xs py-0">
                                              Kostenlos
                                            </Badge>
                                          )}
                                          {model.recommended && (
                                            <Badge className="text-xs py-0 bg-green-500">
                                              Empfohlen
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                    
                                    {/* OpenRouter Modelle - Vielseitig */}
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 mt-1">
                                      🌐 OpenRouter (Vielseitig)
                                    </div>
                                    {openRouterImageModels.map(model => (
                                      <SelectItem key={`openrouter-${model.id}`} value={model.id}>
                                        <div className="flex items-center gap-2">
                                          <span>{model.name}</span>
                                          {model.free && (
                                            <Badge variant="secondary" className="text-xs py-0">
                                              Kostenlos
                                            </Badge>
                                          )}
                                          {model.recommended && (
                                            <Badge className="text-xs py-0 bg-green-500">
                                              Empfohlen
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {allImageModels.find(m => m.id === aiImageModel)?.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setAiImageDialogOpen(false)}>
                              Abbrechen
                            </Button>
                            <Button
                              onClick={generateAIImage}
                              disabled={isGeneratingImage || (useContentAsPrompt ? !content.trim() : !aiImagePrompt.trim())}
                              className="bg-gradient-to-r from-purple-500 to-pink-500"
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
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* AI Video Button - nur wenn Video unterstützt */}
                      {supportsVideo() && replicateEnabled && (
                        <Dialog open={aiVideoDialogOpen} onOpenChange={setAiVideoDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="gap-2 border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10"
                            >
                              <Film className="h-4 w-4" />
                              KI-Video erstellen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Film className="h-5 w-5 text-cyan-500" />
                                KI-Video generieren
                              </DialogTitle>
                              <DialogDescription>
                                Erstelle ein kurzes Video für {selectedPlatforms.map(p => platforms.find(pl => pl.id === p)?.name).join(', ')}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              {/* Video-Modell Auswahl */}
                              <div>
                                <Label>Video-Typ wählen</Label>
                                <div className="grid gap-2 mt-2">
                                  {videoModels.map(model => (
                                    <div
                                      key={model.id}
                                      onClick={() => setVideoModel(model.id)}
                                      className={cn(
                                        "p-3 rounded-lg border cursor-pointer transition-all",
                                        videoModel === model.id 
                                          ? "border-cyan-500 bg-cyan-500/10" 
                                          : "border-border hover:border-cyan-500/50"
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium text-sm">{model.name}</p>
                                          <p className="text-xs text-muted-foreground">{model.description}</p>
                                        </div>
                                        <div className="text-right">
                                          <Badge variant="secondary" className="text-xs">
                                            {model.credits} Credits
                                          </Badge>
                                          <p className="text-xs text-muted-foreground mt-1">{model.duration}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Bild-Auswahl für Bild-zu-Video Modelle */}
                              {selectedVideoModel && (selectedVideoModel.type === 'image-to-video' || selectedVideoModel.type === 'image-animation') && (
                                <div>
                                  <Label>Ausgangsbild wählen</Label>
                                  {mediaItems.filter(m => m.type === 'image').length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                      {mediaItems.filter(m => m.type === 'image').map(img => (
                                        <div
                                          key={img.id}
                                          onClick={() => selectImageForVideo(img.url)}
                                          className={cn(
                                            "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                                            videoSourceImage === img.url 
                                              ? "border-cyan-500" 
                                              : "border-transparent hover:border-cyan-500/50"
                                          )}
                                        >
                                          <Image src={img.url} alt="Bild" fill className="object-cover" />
                                          {videoSourceImage === img.url && (
                                            <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                              <Check className="h-6 w-6 text-white" />
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-lg">
                                      Lade erst ein Bild hoch oder generiere ein KI-Bild, um es zu animieren.
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Video-Beschreibung */}
                              <div>
                                <Label>Beschreibe dein Video</Label>
                                <Textarea
                                  value={videoPrompt}
                                  onChange={(e) => setVideoPrompt(e.target.value)}
                                  placeholder={selectedVideoModel?.type === 'text-to-video' 
                                    ? "z.B. 'Eine Stylistin arbeitet an einer eleganten Hochsteckfrisur im modernen Salon'"
                                    : "z.B. 'Sanfte Bewegung, Haare wehen im Wind'"
                                  }
                                  className="mt-2 min-h-[80px]"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Tipp: Beschreibe Bewegungen und Stimmung für beste Ergebnisse
                                </p>
                              </div>

                              {/* Credits-Info */}
                              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-cyan-500" />
                                  <span className="text-sm">Kosten</span>
                                </div>
                                <Badge variant="outline">{selectedVideoModel?.credits || 50} Credits</Badge>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setAiVideoDialogOpen(false)}>
                                Abbrechen
                              </Button>
                              <Button
                                onClick={generateAIVideo}
                                disabled={
                                  isGeneratingVideo || 
                                  !videoPrompt.trim() ||
                                  ((selectedVideoModel?.type === 'image-to-video' || selectedVideoModel?.type === 'image-animation') && !videoSourceImage)
                                }
                                className="bg-gradient-to-r from-cyan-500 to-blue-500"
                              >
                                {isGeneratingVideo ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generiere... (2-4 Min)
                                  </>
                                ) : (
                                  <>
                                    <Film className="h-4 w-4 mr-2" />
                                    Video generieren
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {/* Video-Hinweis für YouTube/TikTok */}
                    {requiresVideo() && !replicateEnabled && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          {selectedPlatforms.includes('YOUTUBE') || selectedPlatforms.includes('TIKTOK') 
                            ? 'YouTube/TikTok funktioniert am besten mit Videos. Video-Generierung ist unter Admin → Einstellungen aktivierbar.'
                            : 'Video-Upload wird unterstützt.'}
                        </p>
                      </div>
                    )}
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
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        "hover:border-primary hover:bg-primary/5",
                        mediaItems.length >= maxImages && "opacity-50 pointer-events-none"
                      )}
                    >
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">
                        Bilder oder Videos hierher ziehen
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        oder klicken zum Auswählen • JPG, PNG, WebP, GIF, MP4
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
                              <div className="absolute inset-0">
                                {/* Video Player */}
                                <video
                                  src={media.url}
                                  className="w-full h-full object-cover"
                                  muted
                                  loop
                                  playsInline
                                  onMouseEnter={(e) => e.currentTarget.play()}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.pause()
                                    e.currentTarget.currentTime = 0
                                  }}
                                />
                                {/* Video Icon Badge */}
                                <div className="absolute bottom-2 right-2">
                                  <Badge className="bg-cyan-500/90">
                                    <Film className="h-3 w-3" />
                                  </Badge>
                                </div>
                              </div>
                            )}
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {media.type === 'image' && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedMediaForCrop(media)
                                      setCropDialogOpen(true)
                                    }}
                                    title="Zuschneiden"
                                  >
                                    <Crop className="h-4 w-4" />
                                  </Button>
                                  {/* Use for Video Button */}
                                  {supportsVideo() && replicateEnabled && (
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        selectImageForVideo(media.url)
                                        setAiVideoDialogOpen(true)
                                      }}
                                      title="Zu Video animieren"
                                    >
                                      <Film className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeMedia(media.id)
                                }}
                                title="Löschen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex gap-1">
                              <Badge className="bg-black/70">{index + 1}</Badge>
                              {media.isAiGenerated && (
                                <Badge className={cn(
                                  media.type === 'video' ? "bg-cyan-500/90" : "bg-purple-500/90"
                                )}>
                                  <Sparkles className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                            
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
                
                {/* Navigation */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Zurück zum Text
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="flex-1">
                    Weiter zur Planung
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* STEP 3: Scheduling */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Zusammenfassung */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Zusammenfassung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plattformen</span>
                        <div className="flex gap-1">
                          {selectedPlatforms.map(p => {
                            const platform = platforms.find(pl => pl.id === p)
                            if (!platform) return null
                            const Icon = platform.icon
                            return (
                              <Badge key={p} variant="secondary" className="gap-1">
                                <Icon className="h-3 w-3" />
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zeichen</span>
                        <span className={isOverLimit ? 'text-red-500' : ''}>{characterCount} / {maxLength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Medien</span>
                        <span>{mediaItems.length} von {maxImages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hashtags</span>
                        <span>{hashtags.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
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
                    <CardDescription>
                      {isScheduling ? 'Post wird zur gewählten Zeit veröffentlicht' : 'Post wird als Entwurf gespeichert'}
                    </CardDescription>
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
                    size="lg"
                    onClick={() => savePost(isScheduling ? 'SCHEDULED' : 'DRAFT')}
                    disabled={isSaving || isOverLimit}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : isScheduling ? (
                      <Clock className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isScheduling ? 'Post planen' : 'Als Entwurf speichern'}
                  </Button>
                  
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full">
                    Zurück zu Medien
                  </Button>

                  {isOverLimit && (
                    <p className="text-xs text-red-500 flex items-center gap-1 justify-center">
                      <AlertCircle className="h-3 w-3" />
                      Text ist zu lang für ausgewählte Plattformen
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar mit Vorschau */}
        <div className="space-y-6">
          {showPreview && selectedPlatforms.length > 0 && (content || mediaItems.length > 0) ? (
            <PostPreview
              content={content}
              hashtags={hashtags}
              mediaUrls={mediaItems.map(m => m.url)}
              platforms={selectedPlatforms}
            />
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Vorschau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-6 bg-muted/30 text-center">
                  <Eye className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Schreibe Text oder füge Medien hinzu, um eine Vorschau zu sehen
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Quick Copy */}
          {content && (
            <Button variant="outline" className="w-full" onClick={copyContent}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Kopiert!' : 'Text kopieren'}
            </Button>
          )}
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
