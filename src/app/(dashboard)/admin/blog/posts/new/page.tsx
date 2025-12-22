'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { ImageUploader } from '@/components/ui/image-uploader'
import { AIArticleGenerator } from '@/components/editor/ai-article-generator'
import {
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  Image as ImageIcon,
  Sparkles,
  PenTool,
} from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  color: string
}

interface Author {
  id: string
  name: string
  avatar: string | null
}

interface Tag {
  id: string
  name: string
}

export default function NewBlogPostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Mode Selection: null = not selected, 'manual' = write yourself, 'ai' = use AI
  const [mode, setMode] = useState<'selection' | 'manual' | 'ai'>('selection')
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  
  // Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [featuredImageAlt, setFeaturedImageAlt] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [status, setStatus] = useState('DRAFT')
  const [isFeatured, setIsFeatured] = useState(false)
  
  // SEO
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  
  // Options
  const [authors, setAuthors] = useState<Author[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    fetchOptions()
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setSlug(generateSlug(title))
    }
  }, [title, slug])

  const fetchOptions = async () => {
    try {
      const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/admin/blog/authors'),
        fetch('/api/admin/blog/categories'),
        fetch('/api/admin/blog/tags'),
      ])

      const [authorsData, categoriesData, tagsData] = await Promise.all([
        authorsRes.json(),
        categoriesRes.json(),
        tagsRes.json(),
      ])

      setAuthors(authorsData.authors || [])
      setCategories(categoriesData.categories || [])
      setTags(tagsData.tags || [])
    } catch (error) {
      console.error('Error fetching options:', error)
      toast.error('Fehler beim Laden der Optionen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (publishStatus?: string) => {
    if (!title.trim()) {
      toast.error('Bitte gib einen Titel ein')
      return
    }
    if (!authorId) {
      toast.error('Bitte wähle einen Autor aus')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || generateSlug(title),
          excerpt,
          content,
          featuredImage: featuredImage || null,
          featuredImageAlt: featuredImageAlt || null,
          authorId,
          categoryId: categoryId || null,
          tagIds: selectedTagIds,
          status: publishStatus || status,
          isFeatured,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      toast.success(
        publishStatus === 'PUBLISHED' 
          ? 'Artikel veröffentlicht!' 
          : 'Artikel gespeichert!'
      )
      router.push(`/admin/blog/posts/${data.post.id}`)
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle AI Generated Article
  const handleAIArticleGenerated = (article: {
    title: string
    slug: string
    excerpt: string
    content: string
    metaTitle?: string
    metaDescription?: string
    suggestedTags?: string[]
    suggestedCategory?: string
  }) => {
    setTitle(article.title)
    setSlug(article.slug)
    setExcerpt(article.excerpt)
    setContent(article.content)
    if (article.metaTitle) setMetaTitle(article.metaTitle)
    if (article.metaDescription) setMetaDescription(article.metaDescription)
    
    // Find matching category
    if (article.suggestedCategory) {
      const matchingCategory = categories.find(
        (cat) => cat.name.toLowerCase() === article.suggestedCategory?.toLowerCase()
      )
      if (matchingCategory) {
        setCategoryId(matchingCategory.id)
      }
    }
    
    // Find matching tags
    if (article.suggestedTags?.length) {
      const matchingTagIds = tags
        .filter((tag) =>
          article.suggestedTags?.some(
            (st) => st.toLowerCase() === tag.name.toLowerCase()
          )
        )
        .map((tag) => tag.id)
      setSelectedTagIds(matchingTagIds)
    }

    setShowAIGenerator(false)
    setMode('manual') // Switch to manual mode for editing
    toast.success('KI-Artikel übernommen! Du kannst ihn jetzt bearbeiten.')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Mode Selection Screen
  if (mode === 'selection') {
    return (
      <div className="min-h-[60vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog/posts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Neuer Artikel</h1>
            <p className="text-muted-foreground text-sm">
              Wähle wie du deinen Artikel erstellen möchtest
            </p>
          </div>
        </div>

        {/* Centered Mode Selection */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-4 max-w-2xl w-full">
            {/* Manual Writing */}
            <button
              onClick={() => setMode('manual')}
              className="flex-1 group relative p-6 rounded-xl border-2 border-border/50 bg-card hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <PenTool className="h-6 w-6 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">Selbst schreiben</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Rich-Text-Editor mit KI-Textverbesserung
                  </p>
                </div>
              </div>
            </button>

            {/* AI Generation */}
            <button
              onClick={() => {
                setMode('ai')
                setShowAIGenerator(true)
              }}
              className="flex-1 group relative p-6 rounded-xl border-2 border-border/50 bg-card hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-200 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-purple-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
              <div className="flex items-start gap-4 relative">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/20 flex items-center justify-center shrink-0 group-hover:from-orange-500/20 group-hover:to-orange-600/30 transition-colors">
                  <Sparkles className="h-6 w-6 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">Mit KI generieren</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    SEO-optimierte Artikel automatisch erstellen
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* AI Generator Dialog */}
        <AIArticleGenerator
          open={showAIGenerator}
          onOpenChange={(open) => {
            setShowAIGenerator(open)
            if (!open) setMode('selection')
          }}
          onArticleGenerated={handleAIArticleGenerated}
          categoryId={categoryId || undefined}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              // If content exists, confirm before going back
              if (title || content) {
                if (confirm('Möchtest du wirklich zurück? Ungespeicherte Änderungen gehen verloren.')) {
                  setMode('selection')
                  // Reset form
                  setTitle('')
                  setSlug('')
                  setExcerpt('')
                  setContent('')
                  setFeaturedImage('')
                  setFeaturedImageAlt('')
                  setAuthorId('')
                  setCategoryId('')
                  setSelectedTagIds([])
                  setMetaTitle('')
                  setMetaDescription('')
                }
              } else {
                setMode('selection')
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Neuer Artikel</h1>
            <p className="text-muted-foreground text-sm">
              Erstelle einen neuen Blog-Artikel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Als Entwurf speichern
          </Button>
          <Button
            onClick={() => handleSave('PUBLISHED')}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Globe className="mr-2 h-4 w-4" />
            )}
            Veröffentlichen
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  placeholder="Ein aussagekräftiger Titel..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL-Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/blog/</span>
                  <Input
                    id="slug"
                    placeholder="url-freundlicher-name"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Kurzbeschreibung</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Eine kurze Beschreibung für die Vorschau..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {excerpt.length}/500 Zeichen
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Inhalt</CardTitle>
              <CardDescription>
                Schreibe deinen Artikel mit dem Rich-Text-Editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="Beginne hier mit dem Schreiben..."
                editorClassName="min-h-[500px]"
              />
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO-Einstellungen
              </CardTitle>
              <CardDescription>
                Optimiere die Darstellung in Suchmaschinen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta-Titel</Label>
                <Input
                  id="metaTitle"
                  placeholder={title || 'Titel für Suchmaschinen'}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={70}
                />
                <p className="text-xs text-muted-foreground">
                  {metaTitle.length}/70 Zeichen
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta-Beschreibung</Label>
                <Textarea
                  id="metaDescription"
                  placeholder={excerpt || 'Beschreibung für Suchmaschinen'}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 Zeichen
                </p>
              </div>

              {/* Google Preview */}
              <div className="mt-6 p-4 bg-white rounded-lg border shadow-sm">
                <p className="text-xs text-gray-700 font-medium mb-2">Google-Vorschau:</p>
                <div className="space-y-1">
                  <p className="text-blue-600 text-lg truncate">
                    {metaTitle || title || 'Titel des Artikels'}
                  </p>
                  <p className="text-green-700 text-sm">
                    nicnoa.online/blog/{slug || 'url-slug'}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {metaDescription || excerpt || 'Beschreibung des Artikels erscheint hier...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Veröffentlichung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Entwurf</SelectItem>
                    <SelectItem value="PUBLISHED">Veröffentlicht</SelectItem>
                    <SelectItem value="SCHEDULED">Geplant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Als Featured markieren</Label>
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </CardContent>
          </Card>

          {/* Author & Category */}
          <Card>
            <CardHeader>
              <CardTitle>Zuordnung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author">Autor *</Label>
                <Select value={authorId} onValueChange={setAuthorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Autor wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {authors.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    <Link href="/admin/blog/authors" className="text-primary hover:underline">
                      Erstelle zuerst einen Autor
                    </Link>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag.id}
                      type="button"
                      variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedTagIds((prev) =>
                          prev.includes(tag.id)
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id]
                        )
                      }}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Beitragsbild
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="url">
                <TabsList className="w-full">
                  <TabsTrigger value="url" className="flex-1">URL</TabsTrigger>
                  <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="upload" className="space-y-2">
                  <ImageUploader
                    value={featuredImage || undefined}
                    onUpload={(url) => {
                      setFeaturedImage(url)
                      toast.success('Bild hochgeladen!')
                    }}
                    onRemove={() => setFeaturedImage('')}
                    uploadEndpoint="/api/admin/blog/posts/upload-image"
                    aspectRatio={16/9}
                    placeholder="Featured Image hochladen"
                    description="JPEG, PNG, WebP • Empfohlen: 1200x630px"
                  />
                </TabsContent>
              </Tabs>
              
              {featuredImage && (
                <div className="space-y-2">
                  <img
                    src={featuredImage}
                    alt="Preview"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <Input
                    placeholder="Alt-Text für das Bild"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}


