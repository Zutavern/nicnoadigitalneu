'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Loader2,
  FileText,
  Search,
  Copy,
  Sparkles,
  Hash,
  Instagram,
  Facebook,
  Linkedin,
  Share2,
  Trash2,
  Edit,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  description: string | null
  content: string
  category: string | null
  hashtags: string[]
  recommendedPlatforms: string[]
  isGlobal: boolean
  usageCount: number
  createdAt: string
  userId: string
}

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM: <Instagram className="h-3 w-3" />,
  FACEBOOK: <Facebook className="h-3 w-3" />,
  LINKEDIN: <Linkedin className="h-3 w-3" />,
  TIKTOK: <Share2 className="h-3 w-3" />,
}

const categories = [
  { id: 'angebot', name: 'Angebote & Aktionen' },
  { id: 'tipp', name: 'Tipps & Tricks' },
  { id: 'event', name: 'Events' },
  { id: 'produkt', name: 'Produkte' },
  { id: 'team', name: 'Team & Behind the Scenes' },
  { id: 'trend', name: 'Trends' },
  { id: 'saisonal', name: 'Saisonales' },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: '',
    hashtags: [] as string[],
    recommendedPlatforms: [] as string[],
  })
  const [hashtagInput, setHashtagInput] = useState('')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/social/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Fehler beim Laden der Vorlagen')
    } finally {
      setIsLoading(false)
    }
  }

  const saveTemplate = async () => {
    if (!formData.name || !formData.content) {
      toast.error('Name und Inhalt sind erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/social/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Fehler beim Speichern')

      toast.success('Vorlage gespeichert!')
      setIsDialogOpen(false)
      resetForm()
      loadTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      content: '',
      category: '',
      hashtags: [],
      recommendedPlatforms: [],
    })
    setHashtagInput('')
  }

  const addHashtag = () => {
    if (!hashtagInput.trim()) return
    const tag = hashtagInput.trim().replace('#', '')
    if (!formData.hashtags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, tag],
      }))
    }
    setHashtagInput('')
  }

  const removeHashtag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== tag),
    }))
  }

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      recommendedPlatforms: prev.recommendedPlatforms.includes(platform)
        ? prev.recommendedPlatforms.filter(p => p !== platform)
        : [...prev.recommendedPlatforms, platform],
    }))
  }

  const useTemplate = (template: Template) => {
    // Content + Hashtags in Zwischenablage kopieren
    const fullContent = template.hashtags.length > 0
      ? `${template.content}\n\n${template.hashtags.map(h => `#${h}`).join(' ')}`
      : template.content
    
    navigator.clipboard.writeText(fullContent)
    setCopiedId(template.id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('In Zwischenablage kopiert!')
  }

  const useTemplateForPost = (template: Template) => {
    // Zur Post-Erstellung mit Template-Daten navigieren
    const params = new URLSearchParams({
      content: template.content,
      hashtags: template.hashtags.join(','),
      platforms: template.recommendedPlatforms.join(','),
    })
    router.push(`/admin/marketing/social-media/posts/create?${params.toString()}`)
  }

  // Gefilterte Templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Globale vs. eigene Templates trennen
  const globalTemplates = filteredTemplates.filter(t => t.isGlobal)
  const userTemplates = filteredTemplates.filter(t => !t.isGlobal)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-500" />
            Content-Vorlagen
          </h1>
          <p className="text-muted-foreground mt-1">
            Erstelle und verwende wiederverwendbare Post-Vorlagen
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Neue Vorlage
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Neue Vorlage erstellen</DialogTitle>
              <DialogDescription>
                Erstelle eine wiederverwendbare Vorlage für deine Posts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. Sommerangebot"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Kategorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Beschreibung</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Kurze Beschreibung der Vorlage"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Content *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Der Post-Text..."
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label>Hashtags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    placeholder="#hashtag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  />
                  <Button type="button" variant="outline" onClick={addHashtag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.hashtags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button onClick={() => removeHashtag(tag)} className="ml-1 hover:text-destructive">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Empfohlene Plattformen</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK'].map(platform => (
                    <Button
                      key={platform}
                      type="button"
                      variant={formData.recommendedPlatforms.includes(platform) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePlatform(platform)}
                    >
                      {platformIcons[platform]}
                      <span className="ml-1">{platform}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={saveTemplate} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Vorlagen durchsuchen..."
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Eigene Vorlagen */}
      {userTemplates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Meine Vorlagen</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={useTemplate}
                onUseForPost={useTemplateForPost}
                copiedId={copiedId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Globale Vorlagen */}
      {globalTemplates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Vorlagen-Bibliothek
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={useTemplate}
                onUseForPost={useTemplateForPost}
                copiedId={copiedId}
                isGlobal
              />
            ))}
          </div>
        </div>
      )}

      {/* Keine Ergebnisse */}
      {filteredTemplates.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">Keine Vorlagen gefunden</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery || filterCategory !== 'all'
                ? 'Versuche andere Suchbegriffe oder Filter'
                : 'Erstelle deine erste Vorlage für schnelleres Posten'}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Vorlage erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TemplateCard({
  template,
  onUse,
  onUseForPost,
  copiedId,
  isGlobal = false,
}: {
  template: Template
  onUse: (t: Template) => void
  onUseForPost: (t: Template) => void
  copiedId: string | null
  isGlobal?: boolean
}) {
  const isCopied = copiedId === template.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="h-full hover:border-purple-500/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {template.name}
                {isGlobal && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Vorlage
                  </Badge>
                )}
              </CardTitle>
              {template.category && (
                <CardDescription className="mt-1">
                  {categories.find(c => c.id === template.category)?.name || template.category}
                </CardDescription>
              )}
            </div>
            {template.recommendedPlatforms.length > 0 && (
              <div className="flex gap-1">
                {template.recommendedPlatforms.map(p => (
                  <span key={p} className="text-muted-foreground">
                    {platformIcons[p]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm line-clamp-3">{template.content}</p>
          
          {template.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.hashtags.slice(0, 5).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {template.hashtags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{template.hashtags.length - 5}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onUse(template)}
            >
              {isCopied ? (
                <><Check className="h-3 w-3 mr-1" /> Kopiert</>
              ) : (
                <><Copy className="h-3 w-3 mr-1" /> Kopieren</>
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => onUseForPost(template)}
            >
              Verwenden
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

