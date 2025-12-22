'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sparkles,
  Loader2,
  Wand2,
  Minimize2,
  Maximize2,
  Briefcase,
  Coffee,
  SpellCheck,
  Check,
  RotateCcw,
  Lightbulb,
  Heart,
  Target,
  BookOpen,
  Smile,
  ListChecks,
  MessageCircleQuestion,
  Megaphone,
  GraduationCap,
  Flame,
  Shield,
  Pen,
  ArrowRight,
  Laugh,
  SearchCheck,
  AlertCircle,
  FileText,
  Heading,
  Link2,
  Quote,
  BarChart3,
  Layers,
  Scissors,
  Scale,
  Eye,
  Sparkle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AITextImproverProps {
  editor: Editor | null
}

type ImprovementType = 
  | 'improve' 
  | 'shorter' 
  | 'longer' 
  | 'professional' 
  | 'casual' 
  | 'fix-grammar'
  | 'simplify'
  | 'persuasive'
  | 'seo-optimize'
  | 'summarize'
  | 'friendly'
  | 'bullet-points'
  | 'add-questions'
  | 'add-cta'
  | 'academic'
  | 'urgent'
  | 'trustworthy'
  | 'active-voice'
  | 'storytelling'
  | 'humorous'
  // Überprüfung
  | 'fact-check'
  | 'find-issues'
  | 'check-clarity'
  | 'check-logic'
  // Erweitern
  | 'add-examples'
  | 'add-statistics'
  | 'add-quotes'
  | 'add-transitions'
  // SEO & Content
  | 'generate-headline'
  | 'generate-teaser'
  | 'generate-meta'
  // Weitere
  | 'make-specific'
  | 'neutral-tone'
  | 'split-paragraphs'
  | 'polish'

interface ImprovementOption {
  type: ImprovementType
  label: string
  icon: React.ReactNode
  description: string
}

interface ImprovementCategory {
  label: string
  options: ImprovementOption[]
}

const IMPROVEMENT_CATEGORIES: ImprovementCategory[] = [
  {
    label: '✓ Überprüfung',
    options: [
      { type: 'fact-check', label: 'Faktencheck', icon: <SearchCheck className="h-4 w-4" />, description: 'Aussagen prüfen' },
      { type: 'find-issues', label: 'Probleme', icon: <AlertCircle className="h-4 w-4" />, description: 'Schwächen finden' },
      { type: 'check-clarity', label: 'Klarheit', icon: <Eye className="h-4 w-4" />, description: 'Verständlich?' },
      { type: 'check-logic', label: 'Logik', icon: <Scale className="h-4 w-4" />, description: 'Konsistenz prüfen' },
    ]
  },
  {
    label: '✨ Grundlagen',
    options: [
      { type: 'improve', label: 'Verbessern', icon: <Wand2 className="h-4 w-4" />, description: 'Allgemein besser' },
      { type: 'fix-grammar', label: 'Korrigieren', icon: <SpellCheck className="h-4 w-4" />, description: 'Grammatik & Co' },
      { type: 'simplify', label: 'Vereinfachen', icon: <Lightbulb className="h-4 w-4" />, description: 'Leichter' },
      { type: 'active-voice', label: 'Aktivieren', icon: <ArrowRight className="h-4 w-4" />, description: 'Aktive Sprache' },
      { type: 'polish', label: 'Polieren', icon: <Sparkle className="h-4 w-4" />, description: 'Feinschliff' },
    ]
  },
  {
    label: '📐 Struktur',
    options: [
      { type: 'shorter', label: 'Kürzer', icon: <Minimize2 className="h-4 w-4" />, description: 'Komprimieren' },
      { type: 'longer', label: 'Länger', icon: <Maximize2 className="h-4 w-4" />, description: 'Ausbauen' },
      { type: 'summarize', label: 'Zusammenfassen', icon: <BookOpen className="h-4 w-4" />, description: 'Kernaussagen' },
      { type: 'bullet-points', label: 'Aufzählung', icon: <ListChecks className="h-4 w-4" />, description: 'Als Liste' },
      { type: 'split-paragraphs', label: 'Absätze', icon: <Layers className="h-4 w-4" />, description: 'Aufteilen' },
      { type: 'add-transitions', label: 'Übergänge', icon: <Link2 className="h-4 w-4" />, description: 'Verbinden' },
    ]
  },
  {
    label: '🎭 Tonalität',
    options: [
      { type: 'professional', label: 'Professionell', icon: <Briefcase className="h-4 w-4" />, description: 'Formell' },
      { type: 'casual', label: 'Locker', icon: <Coffee className="h-4 w-4" />, description: 'Entspannt' },
      { type: 'friendly', label: 'Freundlich', icon: <Smile className="h-4 w-4" />, description: 'Einladend' },
      { type: 'academic', label: 'Akademisch', icon: <GraduationCap className="h-4 w-4" />, description: 'Wissenschaftlich' },
      { type: 'humorous', label: 'Humorvoll', icon: <Laugh className="h-4 w-4" />, description: 'Mit Witz' },
      { type: 'neutral-tone', label: 'Neutral', icon: <Scale className="h-4 w-4" />, description: 'Sachlich' },
    ]
  },
  {
    label: '📣 Marketing',
    options: [
      { type: 'persuasive', label: 'Überzeugend', icon: <Heart className="h-4 w-4" />, description: 'Emotional' },
      { type: 'urgent', label: 'Dringlich', icon: <Flame className="h-4 w-4" />, description: 'FOMO' },
      { type: 'trustworthy', label: 'Vertrauensvoll', icon: <Shield className="h-4 w-4" />, description: 'Seriös' },
      { type: 'add-cta', label: 'Call-to-Action', icon: <Megaphone className="h-4 w-4" />, description: 'Aufforderung' },
      { type: 'storytelling', label: 'Erzählerisch', icon: <Pen className="h-4 w-4" />, description: 'Geschichte' },
    ]
  },
  {
    label: '➕ Erweitern',
    options: [
      { type: 'add-examples', label: 'Beispiele', icon: <FileText className="h-4 w-4" />, description: 'Konkretisieren' },
      { type: 'add-statistics', label: 'Statistiken', icon: <BarChart3 className="h-4 w-4" />, description: 'Zahlen & Daten' },
      { type: 'add-quotes', label: 'Zitate', icon: <Quote className="h-4 w-4" />, description: 'Expertenmeinung' },
      { type: 'add-questions', label: 'Fragen', icon: <MessageCircleQuestion className="h-4 w-4" />, description: 'Interaktiv' },
      { type: 'make-specific', label: 'Konkretisieren', icon: <Scissors className="h-4 w-4" />, description: 'Details hinzu' },
    ]
  },
  {
    label: '🎯 SEO & Content',
    options: [
      { type: 'seo-optimize', label: 'SEO', icon: <Target className="h-4 w-4" />, description: 'Optimieren' },
      { type: 'generate-headline', label: 'Headline', icon: <Heading className="h-4 w-4" />, description: 'Überschrift' },
      { type: 'generate-teaser', label: 'Teaser', icon: <Sparkles className="h-4 w-4" />, description: 'Anreißer' },
      { type: 'generate-meta', label: 'Meta-Text', icon: <FileText className="h-4 w-4" />, description: 'Beschreibung' },
    ]
  },
]

// Flache Liste für einfachen Zugriff
const IMPROVEMENT_OPTIONS = IMPROVEMENT_CATEGORIES.flatMap(cat => cat.options)

export function AITextImprover({ editor }: AITextImproverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [isImproving, setIsImproving] = useState(false)
  const [improvedText, setImprovedText] = useState('')
  const [activeType, setActiveType] = useState<ImprovementType | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
  const [showButton, setShowButton] = useState(false)

  // Überwache Text-Selektion
  const handleSelectionChange = useCallback(() => {
    if (!editor || isOpen) return // Nicht aktualisieren wenn Popover offen

    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')

    if (text.trim().length > 10) {
      setSelectedText(text)
      
      // Berechne Position für den Button - rechts von der Selektion
      const domSelection = window.getSelection()
      if (domSelection && domSelection.rangeCount > 0) {
        const range = domSelection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        // Position rechts neben dem Ende der Selektion
        setButtonPosition({
          top: rect.top + window.scrollY + (rect.height / 2) - 14, // Vertikal zentriert
          left: rect.right + window.scrollX + 8, // 8px rechts vom Ende
        })
        setShowButton(true)
      }
    } else if (!isOpen) {
      setShowButton(false)
      setSelectedText('')
    }
  }, [editor, isOpen])

  useEffect(() => {
    if (!editor) return

    editor.on('selectionUpdate', handleSelectionChange)
    
    // Auch auf mouseup reagieren für bessere UX
    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 50)
    }
    
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      editor.off('selectionUpdate', handleSelectionChange)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [editor, handleSelectionChange])

  // Verstecke Button wenn Escape gedrückt wird
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setShowButton(false)
        setImprovedText('')
        setActiveType(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const improveText = async (type: ImprovementType) => {
    if (!selectedText.trim()) return

    setIsImproving(true)
    setActiveType(type)
    setImprovedText('')

    try {
      const res = await fetch('/api/admin/blog/generate/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, type }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der Verbesserung')
      }

      setImprovedText(data.improvedText)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler bei der Verbesserung')
    } finally {
      setIsImproving(false)
    }
  }

  const applyImprovement = () => {
    if (!editor || !improvedText) return

    // Ersetze den ausgewählten Text mit dem verbesserten Text
    const { from, to } = editor.state.selection
    editor.chain().focus().deleteRange({ from, to }).insertContent(improvedText).run()

    toast.success('Text ersetzt!')
    handleClose()
  }

  const handleClose = () => {
    setIsOpen(false)
    setShowButton(false)
    setImprovedText('')
    setActiveType(null)
  }

  const resetImprovement = () => {
    setImprovedText('')
    setActiveType(null)
  }

  if (!editor) return null

  return (
    <>
      {/* Floating AI Button - rechts neben der Selektion */}
      {(showButton || isOpen) && (
        <div
          ref={containerRef}
          className="fixed z-50"
          style={{
            top: `${buttonPosition.top}px`,
            left: `${buttonPosition.left}px`,
          }}
        >
          <Popover 
            open={isOpen} 
            onOpenChange={(open) => {
              setIsOpen(open)
              if (!open) {
                // Kurze Verzögerung damit Selektion erhalten bleibt
                setTimeout(() => {
                  if (!isOpen) {
                    setShowButton(false)
                    setImprovedText('')
                    setActiveType(null)
                  }
                }, 100)
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center justify-center rounded-full shadow-lg transition-all",
                  "bg-background border-2 border-orange-400 hover:border-orange-500 hover:bg-orange-500/10",
                  "animate-in fade-in zoom-in-95 duration-150",
                  isOpen 
                    ? "h-10 w-10 bg-orange-500/10 border-orange-500" 
                    : "h-9 w-9"
                )}
                title="KI Text verbessern"
              >
                <Sparkles className={cn(
                  "transition-colors text-orange-500",
                  isOpen ? "h-5 w-5" : "h-5 w-5"
                )} />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0" 
              align="start" 
              side="right"
              sideOffset={8}
              onInteractOutside={(e) => {
                // Verhindere Schließen wenn auf den Editor geklickt wird
                e.preventDefault()
              }}
            >
              <div className="p-3 border-b bg-gradient-to-r from-violet-500/5 to-purple-500/5">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  Text mit KI verbessern
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedText.length} Zeichen ausgewählt
                </p>
              </div>

              {!improvedText ? (
                <div className="max-h-[350px] overflow-y-auto">
                  {IMPROVEMENT_CATEGORIES.map((category) => (
                    <div key={category.label}>
                      <div className="px-3 py-1.5 bg-muted/30 border-y border-border/50">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {category.label}
                        </span>
                      </div>
                      <div className="p-1.5 grid grid-cols-3 gap-1">
                        {category.options.map((option) => (
                          <button
                            key={option.type}
                            onClick={() => improveText(option.type)}
                            disabled={isImproving}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 text-center rounded-lg transition-colors",
                              isImproving && activeType === option.type
                                ? 'bg-violet-500/10'
                                : 'hover:bg-muted'
                            )}
                          >
                            {isImproving && activeType === option.type ? (
                              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                            ) : (
                              <span className="text-violet-500">{option.icon}</span>
                            )}
                            <p className="text-xs font-medium leading-tight">{option.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Vorschlag:</p>
                    <div className="p-2 bg-muted/50 rounded-lg text-sm max-h-[150px] overflow-y-auto">
                      {improvedText}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={resetImprovement}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Andere Option
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-violet-500 hover:bg-violet-600"
                      onClick={applyImprovement}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Übernehmen
                    </Button>
                  </div>
                </div>
              )}

              {/* Schließen Button */}
              <div className="p-2 border-t">
                <button
                  onClick={handleClose}
                  className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1"
                >
                  Schließen (Esc)
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </>
  )
}




