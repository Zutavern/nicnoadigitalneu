'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  ExternalLink,
  FileText,
  Wand2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Code2,
  Search,
  Target,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { toast } from 'sonner'

interface Topic {
  title: string
  description: string
  keywords?: string[]
}

interface GeneratedArticle {
  title: string
  slug: string
  excerpt: string
  content: string
  metaTitle: string
  metaDescription: string
  suggestedTags: string[]
  suggestedCategory: string
  unsplashSearchTerms: string[]
  unsplashLinks: string[]
  estimatedReadTime: number
  featuredImage?: string
  focusKeyword?: string
}

interface AIArticleGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onArticleGenerated: (article: GeneratedArticle) => void
  categoryId?: string
}

type Step = 'topics' | 'config' | 'generate' | 'review'

const ARTICLE_TYPES = [
  { id: 'standard', label: 'Standard', desc: 'Klassischer Blog-Artikel' },
  { id: 'interview', label: 'Interview', desc: 'Fragen & Antworten Format' },
  { id: 'listicle', label: 'Listicle', desc: 'Nummerierte Liste (z.B. "10 Tipps")' },
  { id: 'how-to', label: 'How-To', desc: 'Schritt-für-Schritt Anleitung' },
  { id: 'case-study', label: 'Case Study', desc: 'Fallstudie mit Beispiel' },
  { id: 'opinion', label: 'Meinung', desc: 'Meinungsartikel' },
]

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Kurz', words: '~500 Wörter' },
  { value: 'medium', label: 'Mittel', words: '~1000 Wörter' },
  { value: 'long', label: 'Lang', words: '~2000 Wörter' },
  { value: 'very-long', label: 'Sehr Lang', words: '~3000+ Wörter' },
]

export function AIArticleGenerator({
  open,
  onOpenChange,
  onArticleGenerated,
  categoryId,
}: AIArticleGeneratorProps) {
  const [step, setStep] = useState<Step>('topics')
  
  // Step 1: Topic Selection
  const [headline, setHeadline] = useState('')
  const [subheadline, setSubheadline] = useState('')
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  
  // Step 2: Configuration
  const [articleType, setArticleType] = useState('standard')
  const [length, setLength] = useState('medium')
  const [includeQuotes, setIncludeQuotes] = useState(true)
  const [includeStatistics, setIncludeStatistics] = useState(true)
  const [focusKeyword, setFocusKeyword] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false)
  
  // Step 3: Generation
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  
  // Step 4: Review
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null)
  const [editedArticle, setEditedArticle] = useState<GeneratedArticle | null>(null)
  
  // Unsplash Images
  const [unsplashImages, setUnsplashImages] = useState<Array<{
    id: string
    url: string
    thumb: string
    alt: string
    photographer: string
    downloadUrl: string
  }>>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')

  // SEO Analysis berechnen
  const calculateSeoScore = (article: GeneratedArticle | null, keyword: string) => {
    if (!article) return { score: 0, checks: [] }
    
    const checks: Array<{ label: string; passed: boolean; tip?: string }> = []
    let score = 0
    const maxScore = 100
    
    const keywordLower = keyword.toLowerCase()
    const titleLower = article.title.toLowerCase()
    const contentLower = article.content.toLowerCase()
    const metaTitleLower = article.metaTitle.toLowerCase()
    const metaDescLower = article.metaDescription.toLowerCase()
    
    // Keyword in Titel (20 Punkte)
    if (keywordLower && titleLower.includes(keywordLower)) {
      checks.push({ label: 'Keyword im Titel', passed: true })
      score += 20
    } else if (keywordLower) {
      checks.push({ label: 'Keyword im Titel', passed: false, tip: 'Füge das Fokus-Keyword in den Titel ein' })
    }
    
    // Keyword in Meta-Titel (15 Punkte)
    if (keywordLower && metaTitleLower.includes(keywordLower)) {
      checks.push({ label: 'Keyword im Meta-Titel', passed: true })
      score += 15
    } else if (keywordLower) {
      checks.push({ label: 'Keyword im Meta-Titel', passed: false, tip: 'Füge das Keyword in den Meta-Titel ein' })
    }
    
    // Keyword in Meta-Description (15 Punkte)
    if (keywordLower && metaDescLower.includes(keywordLower)) {
      checks.push({ label: 'Keyword in Meta-Beschreibung', passed: true })
      score += 15
    } else if (keywordLower) {
      checks.push({ label: 'Keyword in Meta-Beschreibung', passed: false, tip: 'Erwähne das Keyword in der Beschreibung' })
    }
    
    // Meta-Titel Länge (10 Punkte)
    if (article.metaTitle.length >= 30 && article.metaTitle.length <= 60) {
      checks.push({ label: 'Meta-Titel Länge (30-60 Zeichen)', passed: true })
      score += 10
    } else {
      checks.push({ label: 'Meta-Titel Länge (30-60 Zeichen)', passed: false, tip: `Aktuell: ${article.metaTitle.length} Zeichen` })
    }
    
    // Meta-Description Länge (10 Punkte)
    if (article.metaDescription.length >= 120 && article.metaDescription.length <= 160) {
      checks.push({ label: 'Meta-Beschreibung Länge (120-160 Zeichen)', passed: true })
      score += 10
    } else {
      checks.push({ label: 'Meta-Beschreibung Länge (120-160 Zeichen)', passed: false, tip: `Aktuell: ${article.metaDescription.length} Zeichen` })
    }
    
    // Keyword-Dichte (15 Punkte)
    if (keywordLower) {
      const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length
      const keywordCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length
      const density = (keywordCount / wordCount) * 100
      
      if (density >= 0.5 && density <= 2.5) {
        checks.push({ label: `Keyword-Dichte (${density.toFixed(1)}%)`, passed: true })
        score += 15
      } else {
        checks.push({ label: `Keyword-Dichte (${density.toFixed(1)}%)`, passed: false, tip: 'Ideal: 0.5-2.5%' })
      }
    }
    
    // Content-Länge (15 Punkte)
    const contentWordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length
    if (contentWordCount >= 300) {
      checks.push({ label: `Inhaltslänge (${contentWordCount} Wörter)`, passed: true })
      score += 15
    } else {
      checks.push({ label: `Inhaltslänge (${contentWordCount} Wörter)`, passed: false, tip: 'Mindestens 300 Wörter empfohlen' })
    }
    
    // Wenn kein Keyword gesetzt, Score anpassen
    if (!keywordLower) {
      score = Math.round((score / 35) * 100) // Nur 35 von 100 Punkten sind ohne Keyword erreichbar
    }
    
    return { score: Math.min(score, maxScore), checks }
  }

  const resetState = () => {
    setStep('topics')
    setHeadline('')
    setSubheadline('')
    setTopics([])
    setSelectedTopic(null)
    setArticleType('standard')
    setLength('medium')
    setIncludeQuotes(true)
    setIncludeStatistics(true)
    setFocusKeyword('')
    setGeneratedArticle(null)
    setEditedArticle(null)
    setGenerationProgress(0)
    setShowPrompt(false)
    setSystemPrompt('')
    setCustomPrompt('')
    setUnsplashImages([])
    setSelectedImageUrl('')
  }

  // Lade den Prompt basierend auf der aktuellen Konfiguration
  const loadPromptPreview = async () => {
    setIsLoadingPrompt(true)
    try {
      const res = await fetch('/api/admin/blog/generate/preview-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleType,
          length,
          includeQuotes,
          includeStatistics,
          categoryId,
          focusKeyword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Laden des Prompts')
      }

      setSystemPrompt(data.systemPrompt)
      setCustomPrompt(data.systemPrompt)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Laden des Prompts')
    } finally {
      setIsLoadingPrompt(false)
    }
  }

  // Unsplash Bilder laden
  const loadUnsplashImages = async (searchTerms: string[]) => {
    if (!searchTerms.length) return
    
    setIsLoadingImages(true)
    try {
      const res = await fetch('/api/admin/blog/generate/unsplash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerms }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Laden der Bilder')
      }

      setUnsplashImages(data.images || [])
    } catch (error) {
      console.error('Error loading Unsplash images:', error)
      // Kein Toast - nicht kritisch
    } finally {
      setIsLoadingImages(false)
    }
  }

  const handleClose = () => {
    resetState()
    onOpenChange(false)
  }

  const generateTopics = async () => {
    if (!headline.trim()) {
      toast.error('Bitte gib ein Thema ein')
      return
    }

    setIsLoadingTopics(true)
    try {
      const res = await fetch('/api/admin/blog/generate/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          subheadline,
          categoryId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der Generierung')
      }

      setTopics(data.topics)
      toast.success('10 Themenvorschläge generiert!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler bei der Generierung')
    } finally {
      setIsLoadingTopics(false)
    }
  }

  const generateArticle = async () => {
    if (!selectedTopic) {
      toast.error('Bitte wähle ein Thema aus')
      return
    }

    setStep('generate')
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simuliere Fortschritt
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      // Verwende custom Prompt nur wenn er geändert wurde
      const useCustomPrompt = customPrompt && customPrompt !== systemPrompt

      const res = await fetch('/api/admin/blog/generate/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          articleType,
          length,
          includeQuotes,
          includeStatistics,
          categoryId,
          focusKeyword: focusKeyword || undefined,
          ...(useCustomPrompt && { customSystemPrompt: customPrompt }),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der Generierung')
      }

      // Lade Unsplash Bilder basierend auf den Suchbegriffen
      if (data.article?.unsplashSearchTerms?.length) {
        loadUnsplashImages(data.article.unsplashSearchTerms)
      }

      setGenerationProgress(100)
      setGeneratedArticle(data.article)
      setEditedArticle(data.article)
      
      setTimeout(() => {
        setStep('review')
        toast.success('Artikel erfolgreich generiert!')
      }, 500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler bei der Generierung')
      setStep('config')
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
    }
  }

  const handleAcceptArticle = () => {
    if (editedArticle) {
      onArticleGenerated({
        ...editedArticle,
        featuredImage: selectedImageUrl || undefined,
        focusKeyword: focusKeyword || undefined,
      })
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            KI Blog-Artikel Generator
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 py-2 border-b">
          {['topics', 'config', 'generate', 'review'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : ['topics', 'config', 'generate', 'review'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {['topics', 'config', 'generate', 'review'].indexOf(step) > i ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && <div className="w-12 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Step 1: Topic Selection */}
          {step === 'topics' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">Worum soll es gehen?</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="z.B. Salon Marketing, Kundenbindung, Trends 2024..."
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subheadline">Zusätzlicher Kontext (optional)</Label>
                  <Textarea
                    id="subheadline"
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                    placeholder="z.B. Fokus auf kleine Salons, Budget-freundlich..."
                    rows={2}
                  />
                </div>
                <Button
                  onClick={generateTopics}
                  disabled={isLoadingTopics || !headline.trim()}
                  className="w-full"
                >
                  {isLoadingTopics ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generiere Vorschläge...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      10 Themenvorschläge generieren
                    </>
                  )}
                </Button>
              </div>

              {topics.length > 0 && (
                <div className="space-y-3">
                  <Label>Wähle ein Thema:</Label>
                  <RadioGroup
                    value={selectedTopic?.title || ''}
                    onValueChange={(value) => {
                      const topic = topics.find((t) => t.title === value)
                      setSelectedTopic(topic || null)
                    }}
                  >
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {topics.map((topic, index) => (
                        <label
                          key={index}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTopic?.title === topic.title
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={topic.title} className="mt-1" />
                          <div className="flex-1">
                            <p className="font-medium">{topic.title}</p>
                            <p className="text-sm text-muted-foreground">{topic.description}</p>
                            {topic.keywords && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {topic.keywords.map((kw, ki) => (
                                  <Badge key={ki} variant="secondary" className="text-xs">
                                    {kw}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 'config' && selectedTopic && (
            <div className="space-y-6">
              {/* Selected Topic Preview */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedTopic.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedTopic.description}</p>
                  </div>
                </div>
              </div>

              {/* Article Type */}
              <div className="space-y-3">
                <Label>Artikeltyp</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ARTICLE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setArticleType(type.id)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        articleType === type.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="space-y-3">
                <Label>Artikellänge</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTH_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.words})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label>Zusätzliche Optionen</Label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={includeQuotes}
                      onCheckedChange={(checked) => setIncludeQuotes(!!checked)}
                    />
                    <div>
                      <p className="font-medium text-sm">Experten-Zitate einfügen</p>
                      <p className="text-xs text-muted-foreground">
                        KI generiert passende Zitate von Branchenexperten
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={includeStatistics}
                      onCheckedChange={(checked) => setIncludeStatistics(!!checked)}
                    />
                    <div>
                      <p className="font-medium text-sm">Statistiken & Zahlen</p>
                      <p className="text-xs text-muted-foreground">
                        Relevante Branchendaten und Statistiken einbauen
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Focus Keyword */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Fokus-Keyword (SEO)
                </Label>
                <Input
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="z.B. Salon Marketing"
                />
                <p className="text-xs text-muted-foreground">
                  Der Artikel wird auf dieses Keyword optimiert. Im Review siehst du den SEO-Score.
                </p>
              </div>

              {/* System Prompt Preview */}
              <Collapsible open={showPrompt} onOpenChange={setShowPrompt}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => {
                      if (!showPrompt && !systemPrompt) {
                        loadPromptPreview()
                      }
                      setShowPrompt(!showPrompt)
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      System-Prompt anzeigen & anpassen
                    </span>
                    {showPrompt ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-3">
                  {isLoadingPrompt ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>System-Prompt (einmalig anpassbar)</Label>
                          {customPrompt !== systemPrompt && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCustomPrompt(systemPrompt)}
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Zurücksetzen
                            </Button>
                          )}
                        </div>
                        <Textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          rows={12}
                          className="font-mono text-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          Dieser Prompt wird einmalig für diese Generierung verwendet.
                          Für dauerhafte Änderungen, speichere den Prompt in den{' '}
                          <span className="font-medium">Einstellungen → Tone of Voice</span>.
                        </p>
                      </div>
                      {customPrompt !== systemPrompt && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Der Prompt wurde angepasst. Diese Änderung gilt nur für diese Generierung.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Step 3: Generating */}
          {step === 'generate' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-lg">Artikel wird generiert...</p>
                <p className="text-sm text-muted-foreground">
                  Dies kann 30-60 Sekunden dauern
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <Progress value={generationProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {Math.round(generationProgress)}%
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && editedArticle && (
            <div className="space-y-6">
              {/* SEO Score Card */}
              {(() => {
                const seoAnalysis = calculateSeoScore(editedArticle, focusKeyword)
                const scoreColor = seoAnalysis.score >= 80 ? 'text-green-500' : seoAnalysis.score >= 50 ? 'text-yellow-500' : 'text-red-500'
                const scoreBg = seoAnalysis.score >= 80 ? 'bg-green-500/10 border-green-500/30' : seoAnalysis.score >= 50 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'
                
                return (
                  <div className={`p-4 rounded-lg border ${scoreBg}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="font-medium">SEO-Analyse</span>
                        {focusKeyword && (
                          <Badge variant="outline" className="ml-2">
                            Keyword: {focusKeyword}
                          </Badge>
                        )}
                      </div>
                      <div className={`text-2xl font-bold ${scoreColor}`}>
                        {seoAnalysis.score}/100
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {seoAnalysis.checks.map((check, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {check.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                          )}
                          <span className={check.passed ? 'text-muted-foreground' : ''}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {!focusKeyword && (
                      <p className="text-xs text-muted-foreground mt-3">
                        💡 Tipp: Gib ein Fokus-Keyword in Schritt 2 ein für eine vollständige SEO-Analyse
                      </p>
                    )}
                  </div>
                )
              })()}

              {/* Title & Meta */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Titel</Label>
                  <Input
                    value={editedArticle.title}
                    onChange={(e) =>
                      setEditedArticle({ ...editedArticle, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kurzbeschreibung (Excerpt)</Label>
                  <Textarea
                    value={editedArticle.excerpt}
                    onChange={(e) =>
                      setEditedArticle({ ...editedArticle, excerpt: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </div>

              {/* Featured Image Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Featured Image
                </Label>
                
                {/* Unsplash Link */}
                <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
                  <p className="text-sm text-muted-foreground">
                    💡 Such dir ein passendes Bild bei Unsplash und füge die URL unten ein:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editedArticle.unsplashSearchTerms?.length > 0 ? (
                      editedArticle.unsplashSearchTerms.map((term, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://unsplash.com/s/photos/${encodeURIComponent(term)}`, '_blank')}
                        >
                          <Search className="mr-1 h-3 w-3" />
                          {term}
                        </Button>
                      ))
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://unsplash.com', '_blank')}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Unsplash öffnen
                      </Button>
                    )}
                  </div>
                </div>

                {/* Image URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm">Bild-URL einfügen</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      value={selectedImageUrl}
                      onChange={(e) => setSelectedImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1"
                    />
                    {selectedImageUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedImageUrl('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Image Preview */}
                {selectedImageUrl && (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                      <img
                        src={selectedImageUrl}
                        alt="Vorschau"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.svg'
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Bild wird als Featured Image übernommen
                      </span>
                    </div>
                  </div>
                )}

                {/* Optional: File Upload */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Oder lade ein eigenes Bild hoch (nach dem Speichern im Blog-Editor möglich)
                  </p>
                </div>
              </div>

              {/* Content Preview */}
              <div className="space-y-2">
                <Label>Artikel-Vorschau</Label>
                <div className="border rounded-lg p-4 max-h-[250px] overflow-y-auto bg-background">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: editedArticle.content }}
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Meta-Titel</Label>
                  <Input
                    value={editedArticle.metaTitle}
                    onChange={(e) =>
                      setEditedArticle({ ...editedArticle, metaTitle: e.target.value })
                    }
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {editedArticle.metaTitle.length}/60
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Meta-Beschreibung</Label>
                  <Textarea
                    value={editedArticle.metaDescription}
                    onChange={(e) =>
                      setEditedArticle({ ...editedArticle, metaDescription: e.target.value })
                    }
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {editedArticle.metaDescription.length}/160
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Vorgeschlagene Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {editedArticle.suggestedTags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Read Time */}
              <p className="text-sm text-muted-foreground">
                Geschätzte Lesezeit: {editedArticle.estimatedReadTime} Minuten
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {step !== 'topics' && step !== 'generate' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 'config') setStep('topics')
                  if (step === 'review') setStep('config')
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Abbrechen
            </Button>
            {step === 'topics' && selectedTopic && (
              <Button onClick={() => setStep('config')}>
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 'config' && (
              <Button onClick={generateArticle}>
                <Sparkles className="mr-2 h-4 w-4" />
                Artikel generieren
              </Button>
            )}
            {step === 'review' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('config')
                    setGeneratedArticle(null)
                    setEditedArticle(null)
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Neu generieren
                </Button>
                <Button onClick={handleAcceptArticle}>
                  <Check className="mr-2 h-4 w-4" />
                  Übernehmen
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



