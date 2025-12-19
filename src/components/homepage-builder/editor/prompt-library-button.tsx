'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Library,
  Search,
  Loader2,
  Sparkles,
  Star,
  Video,
  LayoutPanelLeft,
  Minus,
  PanelTop,
  Pin,
  Ghost,
  Newspaper,
  Grid3x3,
  Shuffle,
  GalleryHorizontal,
  Scissors,
  Image,
  CalendarCheck,
  Move,
  Images,
  Instagram,
  Wand2,
  Layers,
  User,
  Building,
  History,
  Award,
  BadgeCheck,
  Users,
  Heart,
  Target,
  Camera,
  TrendingUp,
  Trophy,
  Quote,
  LayoutGrid,
  Filter,
  Maximize,
  SplitSquareHorizontal,
  FlipHorizontal,
  Text,
  FolderOpen,
  Loader,
  ArrowDownCircle,
  List,
  Table,
  CreditCard,
  FolderKanban,
  ChevronDown,
  Package,
  Gem,
  Info,
  Clock,
  Flame,
  Percent,
  CalendarPlus,
  HelpCircle,
  FormInput,
  ListOrdered,
  Tag,
  Map,
  MapPin,
  Contact,
  Navigation,
  Share2,
  MessageCircle,
  FileUser,
  Crown,
  FileText,
  Mail,
  ArrowLeft,
  Palette,
  Moon,
  Flower,
  Type,
  Underline,
  ALargeSmall,
  Expand,
  Shrink,
  Smartphone,
  ImagePlus,
  Circle,
  Pause,
  MousePointerClick,
  PanelBottom,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HomepageTemplate } from '@/lib/homepage-builder'

// Icon-Mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Star,
  Video,
  LayoutPanelLeft,
  Minus,
  PanelTop,
  Pin,
  Ghost,
  Newspaper,
  Grid3x3,
  Shuffle,
  GalleryHorizontal,
  Scissors,
  Image,
  CalendarCheck,
  Move,
  Images,
  Instagram,
  Wand2,
  Layers,
  User,
  Building,
  History,
  Award,
  BadgeCheck,
  Users,
  Heart,
  Target,
  Camera,
  TrendingUp,
  Trophy,
  Quote,
  LayoutGrid,
  Filter,
  Maximize,
  SplitSquareHorizontal,
  FlipHorizontal,
  Text,
  FolderOpen,
  Loader,
  ArrowDownCircle,
  List,
  Table,
  CreditCard,
  FolderKanban,
  ChevronDown,
  Package,
  Gem,
  Info,
  Clock,
  Flame,
  Percent,
  CalendarPlus,
  HelpCircle,
  FormInput,
  ListOrdered,
  Tag,
  Map,
  MapPin,
  Contact,
  Navigation,
  Share2,
  MessageCircle,
  FileUser,
  Crown,
  FileText,
  Mail,
  ArrowLeft,
  Palette,
  Moon,
  Flower,
  Type,
  Underline,
  ALargeSmall,
  Expand,
  Shrink,
  Smartphone,
  ImagePlus,
  Circle,
  Pause,
  MousePointerClick,
  PanelBottom,
}

interface HomepagePrompt {
  id: string
  pageType: string
  targetRole: string
  category: string
  title: string
  prompt: string
  description?: string
  icon?: string
}

interface PromptLibraryButtonProps {
  pageSlug: string
  templateType: HomepageTemplate
  onSelectPrompt: (prompt: string) => void
  disabled?: boolean
}

export function PromptLibraryButton({
  pageSlug,
  templateType,
  onSelectPrompt,
  disabled = false
}: PromptLibraryButtonProps) {
  const [open, setOpen] = useState(false)
  const [prompts, setPrompts] = useState<HomepagePrompt[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Bestimme targetRole basierend auf templateType
  const targetRole = useMemo(() => {
    if (templateType.startsWith('STYLIST_')) {
      return 'STYLIST'
    }
    if (templateType.startsWith('SALON_')) {
      return 'SALON_OWNER'
    }
    return 'BOTH'
  }, [templateType])

  // Prompts laden wenn Popover geöffnet wird oder Seite wechselt
  useEffect(() => {
    if (open) {
      loadPrompts()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pageSlug, targetRole])

  const loadPrompts = async () => {
    setLoading(true)
    try {
      console.log('Loading prompts for:', { pageSlug, targetRole })
      const res = await fetch(
        `/api/homepage-prompts?pageType=${pageSlug}&targetRole=${targetRole}`
      )
      const data = await res.json()
      console.log('Prompts response:', { status: res.status, total: data.total, prompts: data.prompts?.length })
      if (res.ok) {
        setPrompts(data.prompts || [])
      } else {
        console.error('API Error:', data)
      }
    } catch (error) {
      console.error('Error loading prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prompts nach Kategorien gruppieren
  const groupedPrompts = useMemo(() => {
    const filtered = prompts.filter(p => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        p.title.toLowerCase().includes(query) ||
        p.prompt.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    })

    const groups: Record<string, HomepagePrompt[]> = {}
    filtered.forEach(p => {
      if (!groups[p.category]) {
        groups[p.category] = []
      }
      groups[p.category].push(p)
    })

    return groups
  }, [prompts, searchQuery])

  const handleSelectPrompt = (prompt: HomepagePrompt) => {
    onSelectPrompt(prompt.prompt)
    setOpen(false)
    setSearchQuery('')
  }

  // Seiten-Name für Anzeige
  const pageDisplayName = useMemo(() => {
    const names: Record<string, string> = {
      home: 'Startseite',
      'ueber-mich': 'Über mich',
      'ueber-uns': 'Über uns',
      portfolio: 'Portfolio',
      galerie: 'Galerie',
      leistungen: 'Leistungen',
      preise: 'Preise',
      kontakt: 'Kontakt',
      team: 'Team',
      impressum: 'Impressum'
    }
    return names[pageSlug] || pageSlug
  }, [pageSlug])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "gap-1.5 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white",
            open && "bg-zinc-800 text-white"
          )}
        >
          <Library className="h-4 w-4" />
          <span className="hidden sm:inline">Vorschläge</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0 bg-zinc-950 border-zinc-800"
        align="start"
        side="top"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <Library className="h-4 w-4 text-emerald-500" />
            <h4 className="font-medium text-white text-sm">
              Prompt-Vorschläge
            </h4>
            <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400">
              {pageDisplayName}
            </Badge>
          </div>
          {/* Suche */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Prompts durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[350px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : Object.keys(groupedPrompts).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
              <Library className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery 
                  ? 'Keine Prompts gefunden' 
                  : 'Keine Prompts für diese Seite verfügbar'
                }
              </p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedPrompts).map(([category, categoryPrompts]) => (
                <div key={category} className="mb-3 last:mb-0">
                  {/* Kategorie-Header */}
                  <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      {category}
                    </span>
                    <div className="flex-1 h-px bg-zinc-800" />
                    <Badge variant="outline" className="text-[10px] h-4 border-zinc-700 text-zinc-500">
                      {categoryPrompts.length}
                    </Badge>
                  </div>

                  {/* Prompts */}
                  <div className="space-y-1">
                    {categoryPrompts.map((prompt) => {
                      const IconComponent = prompt.icon ? iconMap[prompt.icon] : Sparkles
                      
                      return (
                        <button
                          key={prompt.id}
                          onClick={() => handleSelectPrompt(prompt)}
                          className={cn(
                            "w-full flex items-start gap-3 p-2 rounded-lg",
                            "text-left transition-colors",
                            "hover:bg-zinc-900 group"
                          )}
                        >
                          {/* Icon */}
                          <div className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center",
                            "bg-zinc-900 group-hover:bg-emerald-500/20 transition-colors"
                          )}>
                            {IconComponent && (
                              <IconComponent className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                            )}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors truncate">
                              {prompt.title}
                            </p>
                            <p className="text-xs text-zinc-600 group-hover:text-zinc-500 line-clamp-2 mt-0.5">
                              {prompt.prompt}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-zinc-800 bg-zinc-900/50">
          <p className="text-[10px] text-zinc-600 text-center">
            {prompts.length} Prompts verfügbar • Klicke zum Übernehmen
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

