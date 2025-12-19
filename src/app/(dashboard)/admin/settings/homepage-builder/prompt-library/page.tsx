'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Library,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Loader2,
  FileText,
  Sparkles,
  ArrowUpDown,
  Download,
  Upload,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HomepagePrompt {
  id: string
  pageType: string
  targetRole: string
  category: string
  title: string
  prompt: string
  description?: string
  icon?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PromptStats {
  total: number
  active: number
  byPageType: Record<string, number>
  byTargetRole: Record<string, number>
  byCategory: Record<string, number>
}

// Seiten-Typen
const PAGE_TYPES = [
  { value: 'home', label: 'Startseite' },
  { value: 'ueber-mich', label: 'Über mich' },
  { value: 'ueber-uns', label: 'Über uns' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'galerie', label: 'Galerie' },
  { value: 'leistungen', label: 'Leistungen' },
  { value: 'preise', label: 'Preise' },
  { value: 'kontakt', label: 'Kontakt' },
  { value: 'team', label: 'Team' },
  { value: 'impressum', label: 'Impressum' },
  { value: 'all', label: 'Alle Seiten' }
]

// Rollen
const TARGET_ROLES = [
  { value: 'STYLIST', label: 'Stuhlmieter' },
  { value: 'SALON_OWNER', label: 'Saloninhaber' },
  { value: 'BOTH', label: 'Beide' }
]

// Kategorien
const CATEGORIES = [
  'Hero', 'Header', 'Layout', 'Testimonials', 'Services', 'CTA', 'Galerie',
  'Social', 'Animation', 'Bio', 'Team', 'Qualifikationen', 'Philosophie',
  'Zahlen', 'Awards', 'Quote', 'Grid', 'Filter', 'Lightbox', 'Vorher/Nachher',
  'Video', 'Beschreibung', 'Featured', 'Kategorien', 'Performance', 'Preisliste',
  'Pakete', 'Details', 'Badges', 'Rabatt', 'FAQ', 'Formular', 'Karte', 'Info',
  'Navigation', 'Design', 'Kontakt', 'Farben', 'Schrift', 'Abstände', 'Mobile',
  'Bilder', 'Buttons', 'Footer', 'SEO', 'Buchung', 'Highlight'
]

export default function PromptLibraryPage() {
  const [prompts, setPrompts] = useState<HomepagePrompt[]>([])
  const [stats, setStats] = useState<PromptStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter
  const [filterPageType, setFilterPageType] = useState<string>('')
  const [filterRole, setFilterRole] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterActive, setFilterActive] = useState<string>('')
  
  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<HomepagePrompt | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    pageType: 'home',
    targetRole: 'BOTH',
    category: 'Hero',
    title: '',
    prompt: '',
    description: '',
    icon: '',
    isActive: true
  })

  // Daten laden
  useEffect(() => {
    loadPrompts()
  }, [filterPageType, filterRole, filterCategory, filterActive])

  const loadPrompts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterPageType) params.append('pageType', filterPageType)
      if (filterRole) params.append('targetRole', filterRole)
      if (filterCategory) params.append('category', filterCategory)
      if (filterActive) params.append('isActive', filterActive)

      const res = await fetch(`/api/admin/homepage-prompts?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setPrompts(data.prompts)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading prompts:', error)
      toast.error('Fehler beim Laden der Prompts')
    } finally {
      setLoading(false)
    }
  }

  // Gefilterte und gesuchte Prompts
  const filteredPrompts = useMemo(() => {
    if (!searchQuery) return prompts
    const query = searchQuery.toLowerCase()
    return prompts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.prompt.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }, [prompts, searchQuery])

  // Prompt erstellen
  const handleCreate = async () => {
    if (!formData.title || !formData.prompt) {
      toast.error('Titel und Prompt sind erforderlich')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/homepage-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success('Prompt erstellt')
        setShowCreateDialog(false)
        resetForm()
        loadPrompts()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Erstellen')
      }
    } catch (error) {
      console.error('Error creating prompt:', error)
      toast.error('Fehler beim Erstellen')
    } finally {
      setSaving(false)
    }
  }

  // Prompt aktualisieren
  const handleUpdate = async () => {
    if (!selectedPrompt || !formData.title || !formData.prompt) {
      toast.error('Titel und Prompt sind erforderlich')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/homepage-prompts/${selectedPrompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success('Prompt aktualisiert')
        setShowEditDialog(false)
        setSelectedPrompt(null)
        resetForm()
        loadPrompts()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Aktualisieren')
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
      toast.error('Fehler beim Aktualisieren')
    } finally {
      setSaving(false)
    }
  }

  // Prompt löschen
  const handleDelete = async () => {
    if (!selectedPrompt) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/homepage-prompts/${selectedPrompt.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Prompt gelöscht')
        setShowDeleteDialog(false)
        setSelectedPrompt(null)
        loadPrompts()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Fehler beim Löschen')
    } finally {
      setSaving(false)
    }
  }

  // Status umschalten
  const handleToggleActive = async (prompt: HomepagePrompt) => {
    try {
      const res = await fetch(`/api/admin/homepage-prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !prompt.isActive })
      })

      if (res.ok) {
        toast.success(prompt.isActive ? 'Prompt deaktiviert' : 'Prompt aktiviert')
        loadPrompts()
      }
    } catch (error) {
      console.error('Error toggling prompt:', error)
      toast.error('Fehler beim Umschalten')
    }
  }

  // Prompt duplizieren
  const handleDuplicate = async (prompt: HomepagePrompt) => {
    try {
      const res = await fetch('/api/admin/homepage-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType: prompt.pageType,
          targetRole: prompt.targetRole,
          category: prompt.category,
          title: `${prompt.title} (Kopie)`,
          prompt: prompt.prompt,
          description: prompt.description,
          icon: prompt.icon,
          isActive: prompt.isActive
        })
      })

      if (res.ok) {
        toast.success('Prompt dupliziert')
        loadPrompts()
      }
    } catch (error) {
      console.error('Error duplicating prompt:', error)
      toast.error('Fehler beim Duplizieren')
    }
  }

  // Formular zurücksetzen
  const resetForm = () => {
    setFormData({
      pageType: 'home',
      targetRole: 'BOTH',
      category: 'Hero',
      title: '',
      prompt: '',
      description: '',
      icon: '',
      isActive: true
    })
  }

  // Edit öffnen
  const openEditDialog = (prompt: HomepagePrompt) => {
    setSelectedPrompt(prompt)
    setFormData({
      pageType: prompt.pageType,
      targetRole: prompt.targetRole,
      category: prompt.category,
      title: prompt.title,
      prompt: prompt.prompt,
      description: prompt.description || '',
      icon: prompt.icon || '',
      isActive: prompt.isActive
    })
    setShowEditDialog(true)
  }

  // Seiten-Label
  const getPageLabel = (value: string) => 
    PAGE_TYPES.find(p => p.value === value)?.label || value

  // Rollen-Label
  const getRoleLabel = (value: string) =>
    TARGET_ROLES.find(r => r.value === value)?.label || value

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="h-6 w-6" />
            Prompt Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalte die Prompt-Vorschläge für den Homepage-Builder
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPrompts} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Aktualisieren
          </Button>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Prompt
          </Button>
        </div>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
              <CardDescription>Gesamt</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-2xl text-emerald-600">{stats.active}</CardTitle>
              <CardDescription>Aktiv</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-2xl">{Object.keys(stats.byPageType).length}</CardTitle>
              <CardDescription>Seiten-Typen</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-2xl">{Object.keys(stats.byCategory).length}</CardTitle>
              <CardDescription>Kategorien</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filter & Suche */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Suche */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Seiten-Filter */}
            <Select value={filterPageType || '_all'} onValueChange={(v) => setFilterPageType(v === '_all' ? '' : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Alle Seiten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Alle Seiten</SelectItem>
                {PAGE_TYPES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Rollen-Filter */}
            <Select value={filterRole || '_all'} onValueChange={(v) => setFilterRole(v === '_all' ? '' : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Alle Rollen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Alle Rollen</SelectItem>
                {TARGET_ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status-Filter */}
            <Select value={filterActive || '_all'} onValueChange={(v) => setFilterActive(v === '_all' ? '' : v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Alle</SelectItem>
                <SelectItem value="true">Aktiv</SelectItem>
                <SelectItem value="false">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabelle */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Titel</TableHead>
                  <TableHead>Seite</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead className="w-[100px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredPrompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Keine Prompts gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell>
                        <Switch
                          checked={prompt.isActive}
                          onCheckedChange={() => handleToggleActive(prompt)}
                          aria-label="Status"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prompt.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {prompt.prompt}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getPageLabel(prompt.pageType)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{prompt.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={prompt.targetRole === 'BOTH' ? 'default' : 'secondary'}
                        >
                          {getRoleLabel(prompt.targetRole)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(prompt)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(prompt)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplizieren
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => { setSelectedPrompt(prompt); setShowDeleteDialog(true) }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Neuen Prompt erstellen</DialogTitle>
            <DialogDescription>
              Erstelle einen neuen Prompt-Vorschlag für den Homepage-Builder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seiten-Typ</Label>
                <Select 
                  value={formData.pageType} 
                  onValueChange={(v) => setFormData(p => ({ ...p, pageType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_TYPES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ziel-Rolle</Label>
                <Select 
                  value={formData.targetRole} 
                  onValueChange={(v) => setFormData(p => ({ ...p, targetRole: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Icon (optional)</Label>
                <Input
                  placeholder="z.B. Sparkles"
                  value={formData.icon}
                  onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input
                placeholder="z.B. Header vergrößern"
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Prompt-Text *</Label>
              <Textarea
                placeholder="Der vollständige Prompt-Text..."
                value={formData.prompt}
                onChange={(e) => setFormData(p => ({ ...p, prompt: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung (optional)</Label>
              <Textarea
                placeholder="Optionale Beschreibung..."
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData(p => ({ ...p, isActive: v }))}
              />
              <Label>Aktiv</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Prompt bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite den Prompt-Vorschlag
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seiten-Typ</Label>
                <Select 
                  value={formData.pageType} 
                  onValueChange={(v) => setFormData(p => ({ ...p, pageType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_TYPES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ziel-Rolle</Label>
                <Select 
                  value={formData.targetRole} 
                  onValueChange={(v) => setFormData(p => ({ ...p, targetRole: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Icon (optional)</Label>
                <Input
                  placeholder="z.B. Sparkles"
                  value={formData.icon}
                  onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input
                placeholder="z.B. Header vergrößern"
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Prompt-Text *</Label>
              <Textarea
                placeholder="Der vollständige Prompt-Text..."
                value={formData.prompt}
                onChange={(e) => setFormData(p => ({ ...p, prompt: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung (optional)</Label>
              <Textarea
                placeholder="Optionale Beschreibung..."
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData(p => ({ ...p, isActive: v }))}
              />
              <Label>Aktiv</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prompt löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du diesen Prompt löschen möchtest?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          {selectedPrompt && (
            <div className="py-4">
              <p className="font-medium">{selectedPrompt.title}</p>
              <p className="text-sm text-muted-foreground">{selectedPrompt.prompt}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

