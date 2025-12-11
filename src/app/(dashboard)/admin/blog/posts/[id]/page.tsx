'use client'

import { useState, useEffect, use } from 'react'
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
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Globe,
  ExternalLink,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react'
import { SEOSection } from '@/components/admin/seo-preview'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { AIArticleGenerator } from '@/components/editor/ai-article-generator'

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

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
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
  
  // AI Generator
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  
  // Options
  const [authors, setAuthors] = useState<Author[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [postRes, authorsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch(`/api/admin/blog/posts/${id}`),
        fetch('/api/admin/blog/authors'),
        fetch('/api/admin/blog/categories'),
        fetch('/api/admin/blog/tags'),
      ])

      if (!postRes.ok) {
        throw new Error('Post nicht gefunden')
      }

      const [postData, authorsData, categoriesData, tagsData] = await Promise.all([
        postRes.json(),
        authorsRes.json(),
        categoriesRes.json(),
        tagsRes.json(),
      ])

      const post = postData.post
      setTitle(post.title || '')
      setSlug(post.slug || '')
      setExcerpt(post.excerpt || '')
      setContent(post.content || '')
      setFeaturedImage(post.featuredImage || '')
      setFeaturedImageAlt(post.featuredImageAlt || '')
      setAuthorId(post.authorId || '')
      setCategoryId(post.categoryId || '')
      setSelectedTagIds(post.tagIds || [])
      setStatus(post.status || 'DRAFT')
      setIsFeatured(post.isFeatured || false)
      setMetaTitle(post.metaTitle || '')
      setMetaDescription(post.metaDescription || '')

      setAuthors(authorsData.authors || [])
      setCategories(categoriesData.categories || [])
      setTags(tagsData.tags || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Fehler beim Laden des Artikels')
      router.push('/admin/blog/posts')
    } finally {
      setIsLoading(false)
    }
  }

  // AI Artikel übernehmen
  const handleAIArticleGenerated = (article: {
    title: string
    slug: string
    excerpt: string
    content: string
    metaTitle: string
    metaDescription: string
    suggestedTags: string[]
    suggestedCategory: string
    estimatedReadTime: number
    featuredImage?: string
    focusKeyword?: string
  }) => {
    setTitle(article.title)
    setSlug(article.slug)
    setExcerpt(article.excerpt)
    setContent(article.content)
    setMetaTitle(article.metaTitle)
    setMetaDescription(article.metaDescription)
    
    // Featured Image übernehmen
    if (article.featuredImage) {
      setFeaturedImage(article.featuredImage)
    }
    
    // Versuche passende Tags zu finden
    const matchingTags = tags.filter((t) =>
      article.suggestedTags.some((st) => 
        st.toLowerCase() === t.name.toLowerCase()
      )
    )
    if (matchingTags.length > 0) {
      setSelectedTagIds(matchingTags.map((t) => t.id))
    }
    
    // Versuche passende Kategorie zu finden
    const matchingCategory = categories.find(
      (c) => c.name.toLowerCase() === article.suggestedCategory.toLowerCase()
    )
    if (matchingCategory) {
      setCategoryId(matchingCategory.id)
    }
    
    toast.success('Artikel übernommen! Überprüfe die Inhalte und speichere.')
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
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
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

      if (publishStatus) {
        setStatus(publishStatus)
      }

      toast.success('Artikel gespeichert!')
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Fehler beim Löschen')
      }

      toast.success('Artikel gelöscht')
      router.push('/admin/blog/posts')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog/posts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Artikel bearbeiten</h1>
            <p className="text-muted-foreground mt-1">
              {title || 'Unbenannter Artikel'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'PUBLISHED' && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/blog/${slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ansehen
              </Link>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Artikel löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchtest du diesen Artikel wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Löschen'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
            Speichern
          </Button>
          {status !== 'PUBLISHED' && (
            <Button
              onClick={() => handleSave('PUBLISHED')}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Veröffentlichen
            </Button>
          )}
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
                showAIButton
                onAIClick={() => setShowAIGenerator(true)}
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
            </CardHeader>
            <CardContent>
              <SEOSection
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                fallbackTitle={title || 'Titel des Artikels'}
                fallbackDescription={excerpt || 'Beschreibung des Artikels erscheint hier...'}
                url={`nicnoa.de/blog/${slug || 'url-slug'}`}
                onTitleChange={setMetaTitle}
                onDescriptionChange={setMetaDescription}
                content={content}
              />
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
                    <SelectItem value="ARCHIVED">Archiviert</SelectItem>
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
                            ? prev.filter((tid) => tid !== tag.id)
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setFeaturedImage('')
                      setFeaturedImageAlt('')
                    }}
                  >
                    Bild entfernen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Article Generator Dialog */}
      <AIArticleGenerator
        open={showAIGenerator}
        onOpenChange={setShowAIGenerator}
        onArticleGenerated={handleAIArticleGenerated}
        categoryId={categoryId || undefined}
      />
    </div>
  )
}
