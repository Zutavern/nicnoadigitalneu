'use client'

import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Search,
  FileText,
  Target,
  Gauge,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SEOAuditProps {
  metaTitle: string | null
  metaDescription: string | null
  content?: string | null // Hauptinhalt der Seite (für Keyword-Analyse)
  focusKeyword?: string // Optional vordefiniertes Keyword
  onFocusKeywordChange?: (keyword: string) => void
}

interface SEOCheck {
  id: string
  name: string
  status: 'success' | 'warning' | 'error'
  message: string
  points: number
  maxPoints: number
}

// Hilfsfunktion: Wörter zählen
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

// Hilfsfunktion: Keyword-Dichte berechnen
function calculateKeywordDensity(text: string, keyword: string): number {
  if (!text || !keyword) return 0
  const words = text.toLowerCase().split(/\s+/)
  const keywordLower = keyword.toLowerCase()
  const keywordWords = keywordLower.split(/\s+/)
  
  // Für Multi-Word Keywords
  if (keywordWords.length > 1) {
    const textLower = text.toLowerCase()
    const matches = textLower.split(keywordLower).length - 1
    return (matches * keywordWords.length / words.length) * 100
  }
  
  // Für Single-Word Keywords
  const matches = words.filter(w => w.includes(keywordLower)).length
  return (matches / words.length) * 100
}

// Hilfsfunktion: Keyword in Text finden
function keywordInText(text: string | null, keyword: string): boolean {
  if (!text || !keyword) return false
  return text.toLowerCase().includes(keyword.toLowerCase())
}

export function SEOAudit({
  metaTitle,
  metaDescription,
  content,
  focusKeyword: initialKeyword = '',
  onFocusKeywordChange,
}: SEOAuditProps) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [isExpanded, setIsExpanded] = useState(true)

  // SEO-Checks durchführen
  const checks = useMemo<SEOCheck[]>(() => {
    const results: SEOCheck[] = []
    const titleLength = (metaTitle || '').length
    const descLength = (metaDescription || '').length
    const contentWordCount = content ? countWords(content) : 0

    // 1. Meta-Titel Länge
    if (titleLength === 0) {
      results.push({
        id: 'title-exists',
        name: 'Meta-Titel vorhanden',
        status: 'error',
        message: 'Kein Meta-Titel definiert',
        points: 0,
        maxPoints: 15,
      })
    } else if (titleLength < 30) {
      results.push({
        id: 'title-length',
        name: 'Meta-Titel Länge',
        status: 'warning',
        message: `Zu kurz (${titleLength} Zeichen). Empfohlen: 50-60`,
        points: 8,
        maxPoints: 15,
      })
    } else if (titleLength > 60) {
      results.push({
        id: 'title-length',
        name: 'Meta-Titel Länge',
        status: 'warning',
        message: `Etwas lang (${titleLength} Zeichen). Kann in Google abgeschnitten werden`,
        points: 10,
        maxPoints: 15,
      })
    } else {
      results.push({
        id: 'title-length',
        name: 'Meta-Titel Länge',
        status: 'success',
        message: `Optimal (${titleLength} Zeichen)`,
        points: 15,
        maxPoints: 15,
      })
    }

    // 2. Meta-Description Länge
    if (descLength === 0) {
      results.push({
        id: 'desc-exists',
        name: 'Meta-Beschreibung vorhanden',
        status: 'error',
        message: 'Keine Meta-Beschreibung definiert',
        points: 0,
        maxPoints: 15,
      })
    } else if (descLength < 120) {
      results.push({
        id: 'desc-length',
        name: 'Meta-Beschreibung Länge',
        status: 'warning',
        message: `Zu kurz (${descLength} Zeichen). Empfohlen: 120-160`,
        points: 8,
        maxPoints: 15,
      })
    } else if (descLength > 160) {
      results.push({
        id: 'desc-length',
        name: 'Meta-Beschreibung Länge',
        status: 'warning',
        message: `Zu lang (${descLength} Zeichen). Wird in Google abgeschnitten`,
        points: 10,
        maxPoints: 15,
      })
    } else {
      results.push({
        id: 'desc-length',
        name: 'Meta-Beschreibung Länge',
        status: 'success',
        message: `Optimal (${descLength} Zeichen)`,
        points: 15,
        maxPoints: 15,
      })
    }

    // Keyword-basierte Checks (nur wenn Keyword eingegeben)
    if (keyword.trim()) {
      // 3. Keyword im Titel
      if (keywordInText(metaTitle, keyword)) {
        results.push({
          id: 'keyword-title',
          name: 'Keyword im Titel',
          status: 'success',
          message: `"${keyword}" ist im Titel enthalten`,
          points: 20,
          maxPoints: 20,
        })
      } else {
        results.push({
          id: 'keyword-title',
          name: 'Keyword im Titel',
          status: 'error',
          message: `"${keyword}" fehlt im Titel`,
          points: 0,
          maxPoints: 20,
        })
      }

      // 4. Keyword in Meta-Description
      if (keywordInText(metaDescription, keyword)) {
        results.push({
          id: 'keyword-desc',
          name: 'Keyword in Beschreibung',
          status: 'success',
          message: `"${keyword}" ist in der Beschreibung enthalten`,
          points: 15,
          maxPoints: 15,
        })
      } else {
        results.push({
          id: 'keyword-desc',
          name: 'Keyword in Beschreibung',
          status: 'warning',
          message: `"${keyword}" fehlt in der Beschreibung`,
          points: 0,
          maxPoints: 15,
        })
      }

      // 5. Keyword-Dichte im Content (wenn vorhanden)
      if (content && contentWordCount > 50) {
        const density = calculateKeywordDensity(content, keyword)
        
        if (density === 0) {
          results.push({
            id: 'keyword-density',
            name: 'Keyword-Dichte',
            status: 'error',
            message: `"${keyword}" kommt nicht im Inhalt vor`,
            points: 0,
            maxPoints: 20,
          })
        } else if (density < 0.5) {
          results.push({
            id: 'keyword-density',
            name: 'Keyword-Dichte',
            status: 'warning',
            message: `Niedrig (${density.toFixed(1)}%). Empfohlen: 1-2%`,
            points: 10,
            maxPoints: 20,
          })
        } else if (density > 3) {
          results.push({
            id: 'keyword-density',
            name: 'Keyword-Dichte',
            status: 'warning',
            message: `Zu hoch (${density.toFixed(1)}%). Kann als Spam gewertet werden`,
            points: 10,
            maxPoints: 20,
          })
        } else {
          results.push({
            id: 'keyword-density',
            name: 'Keyword-Dichte',
            status: 'success',
            message: `Optimal (${density.toFixed(1)}%)`,
            points: 20,
            maxPoints: 20,
          })
        }
      }
    } else {
      // Keyword nicht eingegeben - Hinweis
      results.push({
        id: 'keyword-missing',
        name: 'Focus-Keyword',
        status: 'warning',
        message: 'Kein Focus-Keyword definiert',
        points: 0,
        maxPoints: 35,
      })
    }

    // 6. Content-Länge (wenn vorhanden)
    if (content !== undefined) {
      if (contentWordCount === 0) {
        results.push({
          id: 'content-length',
          name: 'Inhaltslänge',
          status: 'error',
          message: 'Kein Inhalt vorhanden',
          points: 0,
          maxPoints: 15,
        })
      } else if (contentWordCount < 100) {
        results.push({
          id: 'content-length',
          name: 'Inhaltslänge',
          status: 'warning',
          message: `Sehr kurz (${contentWordCount} Wörter). Empfohlen: 300+`,
          points: 5,
          maxPoints: 15,
        })
      } else if (contentWordCount < 300) {
        results.push({
          id: 'content-length',
          name: 'Inhaltslänge',
          status: 'warning',
          message: `Kurz (${contentWordCount} Wörter). Empfohlen: 300+`,
          points: 10,
          maxPoints: 15,
        })
      } else {
        results.push({
          id: 'content-length',
          name: 'Inhaltslänge',
          status: 'success',
          message: `Gut (${contentWordCount} Wörter)`,
          points: 15,
          maxPoints: 15,
        })
      }
    }

    return results
  }, [metaTitle, metaDescription, content, keyword])

  // Score berechnen
  const { score, maxScore, percentage } = useMemo(() => {
    const totalPoints = checks.reduce((sum, c) => sum + c.points, 0)
    const totalMax = checks.reduce((sum, c) => sum + c.maxPoints, 0)
    return {
      score: totalPoints,
      maxScore: totalMax,
      percentage: totalMax > 0 ? Math.round((totalPoints / totalMax) * 100) : 0,
    }
  }, [checks])

  // Score-Farbe bestimmen
  const scoreColor = useMemo(() => {
    if (percentage >= 80) return 'text-green-500'
    if (percentage >= 60) return 'text-amber-500'
    return 'text-red-500'
  }, [percentage])

  const progressColor = useMemo(() => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }, [percentage])

  // Badge-Variante
  const scoreBadge = useMemo(() => {
    if (percentage >= 80) return { variant: 'default' as const, text: 'Gut', className: 'bg-green-500' }
    if (percentage >= 60) return { variant: 'secondary' as const, text: 'Mittel', className: 'bg-amber-500 text-white' }
    return { variant: 'destructive' as const, text: 'Verbesserungsbedarf', className: '' }
  }, [percentage])

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
    onFocusKeywordChange?.(value)
  }

  const statusIcon = (status: SEOCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Score Header */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Gauge className={`h-10 w-10 ${scoreColor}`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${scoreColor}`}>{percentage}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">SEO-Score</span>
              <Badge className={scoreBadge.className} variant={scoreBadge.variant}>
                {scoreBadge.text}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {score} von {maxScore} Punkten
            </p>
          </div>
        </div>
        <div className="w-32">
          <Progress value={percentage} className="h-2" />
        </div>
      </div>

      {/* Focus Keyword Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="focus-keyword" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Focus-Keyword
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Das Haupt-Keyword, für das diese Seite ranken soll. Wird für die Keyword-Dichte-Analyse verwendet.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="focus-keyword"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder="z.B. Salon Software, Friseur Buchung"
          className="max-w-md"
        />
      </div>

      {/* Detailed Checks */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detaillierte Prüfungen ({checks.length})
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {checks.map((check) => (
            <div
              key={check.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                {statusIcon(check.status)}
                <div>
                  <p className="text-sm font-medium">{check.name}</p>
                  <p className="text-xs text-muted-foreground">{check.message}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {check.points}/{check.maxPoints}
              </span>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Quick Tips basierend auf Fehlern */}
      {checks.some(c => c.status === 'error') && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-300 font-medium mb-1 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Verbesserungsvorschläge
          </p>
          <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
            {checks.filter(c => c.status === 'error').slice(0, 3).map(c => (
              <li key={c.id}>• {c.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

