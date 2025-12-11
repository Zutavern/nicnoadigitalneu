'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  Save,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  Sparkles,
  Shield,
  Zap,
  Wrench,
  Rocket,
  ArrowRight,
  Globe,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'
import { SortableList } from '@/components/ui/sortable-list'

interface UpdatesPageConfig {
  id: string
  heroBadgeText: string | null
  heroTitle: string
  heroTitleHighlight: string | null
  heroDescription: string | null
  ctaTitle: string | null
  ctaDescription: string | null
  ctaButtonText: string | null
  ctaButtonLink: string | null
  metaTitle: string | null
  metaDescription: string | null
}

interface ChangelogEntry {
  id: string
  date: string
  category: string
  icon: string
  title: string
  description: string
  isHighlight: boolean
  sortOrder: number
  isActive: boolean
}

const iconOptions = [
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'shield', label: 'Shield' },
  { value: 'zap', label: 'Zap' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'star', label: 'Star' },
]

const categoryOptions = [
  { value: 'Neu', label: 'Neu' },
  { value: 'Feature', label: 'Feature' },
  { value: 'Sicherheit', label: 'Sicherheit' },
  { value: 'Optimierung', label: 'Optimierung' },
  { value: 'Bugfix', label: 'Bugfix' },
]

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'sparkles': Sparkles,
    'shield': Shield,
    'zap': Zap,
    'wrench': Wrench,
    'rocket': Rocket,
    'star': Star,
  }
  return iconMap[iconName] || Sparkles
}

export default function UpdatesAdminPage() {
  const [config, setConfig] = useState<UpdatesPageConfig>({
    id: 'default',
    heroBadgeText: '',
    heroTitle: '',
    heroTitleHighlight: '',
    heroDescription: '',
    ctaTitle: '',
    ctaDescription: '',
    ctaButtonText: '',
    ctaButtonLink: '',
    metaTitle: '',
    metaDescription: '',
  })
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Dialog states
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<Partial<ChangelogEntry>>({})
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [configRes, entriesRes] = await Promise.all([
        fetch('/api/admin/updates-page-config'),
        fetch('/api/admin/changelog-entries'),
      ])

      if (configRes.ok) {
        const configData = await configRes.json()
        setConfig(configData)
      }

      if (entriesRes.ok) {
        const entriesData = await entriesRes.json()
        setEntries(entriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Fehler beim Laden der Daten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/updates-page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        toast.success('Konfiguration gespeichert')
      } else {
        toast.error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEntry = async () => {
    try {
      const url = isEditing && currentEntry.id
        ? `/api/admin/changelog-entries/${currentEntry.id}`
        : '/api/admin/changelog-entries'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentEntry,
          sortOrder: currentEntry.sortOrder ?? entries.length,
        }),
      })

      if (res.ok) {
        toast.success(isEditing ? 'Eintrag aktualisiert' : 'Eintrag erstellt')
        setEntryDialogOpen(false)
        setCurrentEntry({})
        setIsEditing(false)
        await fetchData()
      } else {
        toast.error('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return
    try {
      const res = await fetch(`/api/admin/changelog-entries/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Eintrag gelöscht')
        await fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const handleReorderEntries = async (items: ChangelogEntry[]) => {
    setEntries(items)
    try {
      await fetch('/api/admin/changelog-entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((item, i) => ({ id: item.id, sortOrder: i })) }),
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const activeEntries = entries.filter(e => e.isActive)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Updates / Changelog</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie die Updates-Seite für Transparenz
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/updates" target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Seite ansehen
            <ExternalLink className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config">Konfiguration</TabsTrigger>
          <TabsTrigger value="entries">Changelog-Einträge ({entries.length})</TabsTrigger>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
        </TabsList>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero-Bereich</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Badge-Text</Label>
                  <Input
                    value={config.heroBadgeText || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, heroBadgeText: e.target.value }))}
                    placeholder="z.B. Neueste Updates"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Highlight-Text</Label>
                  <Input
                    value={config.heroTitleHighlight || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, heroTitleHighlight: e.target.value }))}
                    placeholder="z.B. Salon-Space"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Titel</Label>
                <Input
                  value={config.heroTitle}
                  onChange={(e) => setConfig(prev => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="Haupttitel"
                />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={config.heroDescription || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, heroDescription: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Newsletter CTA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CTA Titel</Label>
                <Input
                  value={config.ctaTitle || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, ctaTitle: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Beschreibung</Label>
                <Textarea
                  value={config.ctaDescription || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, ctaDescription: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={config.ctaButtonText || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={config.ctaButtonLink || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, ctaButtonLink: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO-Einstellungen
              </CardTitle>
              <CardDescription>
                Optimieren Sie die Sichtbarkeit in Suchmaschinen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta-Titel</Label>
                <Input
                  value={config.metaTitle || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder={config.heroTitle || 'Titel für Suchmaschinen'}
                  maxLength={70}
                />
                <div className="flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    Leer lassen für automatischen Titel
                  </p>
                  <p className={`text-xs ${(config.metaTitle || '').length > 60 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    {(config.metaTitle || '').length}/70
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meta-Beschreibung</Label>
                <Textarea
                  value={config.metaDescription || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder={config.heroDescription || 'Beschreibung für Suchmaschinen'}
                  maxLength={160}
                  rows={2}
                />
                <div className="flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    Ideal sind 120-160 Zeichen
                  </p>
                  <p className={`text-xs ${(config.metaDescription || '').length > 150 ? 'text-amber-500' : (config.metaDescription || '').length < 120 ? 'text-muted-foreground' : 'text-green-500'}`}>
                    {(config.metaDescription || '').length}/160
                  </p>
                </div>
              </div>

              {/* Google Preview */}
              <div className="mt-6 p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">Google-Vorschau</p>
                </div>
                <div className="space-y-1 font-sans">
                  <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                    {config.metaTitle || config.heroTitle || 'Updates | NICNOA'}
                  </p>
                  <p className="text-[#006621] text-sm">
                    nicnoa.de › updates
                  </p>
                  <p className="text-sm text-[#545454] line-clamp-2">
                    {config.metaDescription || config.heroDescription || 'Entdecken Sie die neuesten Updates und Verbesserungen der NICNOA Plattform.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Konfiguration speichern
            </Button>
          </div>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Changelog-Einträge</CardTitle>
                  <CardDescription>Updates und Verbesserungen dokumentieren</CardDescription>
                </div>
                <Button onClick={() => { 
                  setCurrentEntry({ 
                    icon: 'sparkles', 
                    category: 'Neu',
                    isActive: true, 
                    isHighlight: false,
                    date: new Date().toISOString().split('T')[0],
                  }); 
                  setIsEditing(false); 
                  setEntryDialogOpen(true); 
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Neuer Eintrag
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Noch keine Changelog-Einträge vorhanden
                </div>
              ) : (
                <SortableList
                  items={entries}
                  onReorder={handleReorderEntries}
                  renderItem={(entry) => {
                    const IconComponent = getIconComponent(entry.icon)
                    return (
                      <div className={`flex items-start gap-4 p-4 border rounded-lg ${entry.isHighlight ? 'border-primary/50 bg-primary/5' : ''}`}>
                        <div className="rounded-lg bg-primary/10 p-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline">{formatDate(entry.date)}</Badge>
                            <Badge>{entry.category}</Badge>
                            <h3 className="font-semibold">{entry.title}</h3>
                            {entry.isHighlight && <Badge variant="secondary">Highlight</Badge>}
                            <Badge variant={entry.isActive ? 'default' : 'secondary'}>
                              {entry.isActive ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { 
                            setCurrentEntry({
                              ...entry,
                              date: new Date(entry.date).toISOString().split('T')[0],
                            }); 
                            setIsEditing(true); 
                            setEntryDialogOpen(true); 
                          }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Live-Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-background max-h-[800px] overflow-y-auto">
                {/* Hero */}
                <section className="py-12 text-center">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {config.heroBadgeText && (
                      <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm mb-4">
                        <Star className="mr-1 h-3.5 w-3.5 fill-primary text-primary" />
                        <span className="text-muted-foreground">{config.heroBadgeText}</span>
                      </span>
                    )}
                    <h1 className="text-3xl font-bold tracking-tight mb-4">
                      {config.heroTitle.includes(config.heroTitleHighlight || '') 
                        ? config.heroTitle.split(config.heroTitleHighlight || '').map((part, i, arr) => (
                            <span key={i}>
                              {part}
                              {i < arr.length - 1 && <span className="text-primary">{config.heroTitleHighlight}</span>}
                            </span>
                          ))
                        : config.heroTitle}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">{config.heroDescription}</p>
                  </motion.div>
                </section>

                {/* Updates Grid */}
                {activeEntries.length > 0 && (
                  <section className="py-8">
                    <div className="grid gap-4 md:grid-cols-2">
                      {activeEntries.map((entry) => {
                        const IconComponent = getIconComponent(entry.icon)
                        return (
                          <div
                            key={entry.id}
                            className={`rounded-xl border bg-card p-4 ${entry.isHighlight ? 'md:col-span-2' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Badge>{entry.category}</Badge>
                              <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="rounded-lg bg-primary/10 p-2">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{entry.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* CTA */}
                {config.ctaTitle && (
                  <section className="py-8 bg-muted/50 -mx-6 px-6 rounded-lg text-center">
                    <h2 className="text-xl font-bold mb-2">{config.ctaTitle}</h2>
                    <p className="text-muted-foreground mb-6">{config.ctaDescription}</p>
                    {config.ctaButtonText && (
                      <Button size="lg">
                        {config.ctaButtonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </section>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entry Dialog */}
      <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Eintrag bearbeiten' : 'Neuer Changelog-Eintrag'}</DialogTitle>
            <DialogDescription>Dokumentieren Sie Updates und Verbesserungen</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input 
                  type="date" 
                  value={currentEntry.date || ''} 
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, date: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select value={currentEntry.category || 'Neu'} onValueChange={(v) => setCurrentEntry(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={currentEntry.icon || 'sparkles'} onValueChange={(v) => setCurrentEntry(prev => ({ ...prev, icon: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {iconOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input value={currentEntry.title || ''} onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea value={currentEntry.description || ''} onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))} rows={3} />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={currentEntry.isActive !== false} onCheckedChange={(c) => setCurrentEntry(prev => ({ ...prev, isActive: c }))} />
                <Label>Aktiv</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={currentEntry.isHighlight === true} onCheckedChange={(c) => setCurrentEntry(prev => ({ ...prev, isHighlight: c }))} />
                <Label>Highlight (volle Breite)</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveEntry}><Save className="mr-2 h-4 w-4" /> Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
