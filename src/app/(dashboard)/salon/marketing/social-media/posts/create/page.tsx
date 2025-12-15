'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const platforms = [
  { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500', maxLength: 2200 },
  { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-500', maxLength: 63206 },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-600', maxLength: 3000 },
  { id: 'TWITTER', name: 'X/Twitter', icon: Twitter, color: 'from-gray-800 to-black', maxLength: 280 },
  { id: 'TIKTOK', name: 'TikTok', icon: Share2, color: 'from-pink-500 to-cyan-500', maxLength: 2200 },
  { id: 'YOUTUBE', name: 'YouTube', icon: Youtube, color: 'from-red-600 to-red-500', maxLength: 5000 },
]

const tones = [
  { id: 'friendly', name: 'Freundlich', emoji: '😊' },
  { id: 'professional', name: 'Professionell', emoji: '💼' },
  { id: 'casual', name: 'Locker', emoji: '✌️' },
  { id: 'playful', name: 'Verspielt', emoji: '🎉' },
  { id: 'inspirational', name: 'Inspirierend', emoji: '✨' },
  { id: 'promotional', name: 'Werblich', emoji: '📢' },
]

export default function CreatePostPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai')
  
  // Form State
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['INSTAGRAM'])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>()
  const [scheduledTime, setScheduledTime] = useState('12:00')
  const [isScheduling, setIsScheduling] = useState(false)
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiTone, setAiTone] = useState('friendly')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  
  // Submission State
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Plattform-spezifische Zeichenlimits
  const getMaxLength = () => {
    const selectedPlatformData = platforms.filter(p => selectedPlatforms.includes(p.id))
    return Math.min(...selectedPlatformData.map(p => p.maxLength))
  }

  const characterCount = content.length
  const maxLength = getMaxLength()
  const isOverLimit = characterCount > maxLength

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
      setActiveTab('manual') // Zum Editor wechseln
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
          platforms: selectedPlatforms,
          status,
          scheduledFor,
          aiGenerated: activeTab === 'ai' || isGenerating,
          aiPrompt: aiPrompt || null,
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Neuen Post erstellen</h1>
          <p className="text-muted-foreground">
            Erstelle Content mit KI-Unterstützung oder manuell
          </p>
        </div>
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
          {/* Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 bg-muted/30">
                {content ? (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                    {hashtags.length > 0 && (
                      <p className="text-sm text-blue-500 mt-2">
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
    </div>
  )
}

