'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  RefreshCw,
  X,
  FileText,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Code,
  DollarSign,
  Cog,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  Building2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface JobPosting {
  id: string
  title: string
  slug: string
  category: string
  description: string
  requirements: string
  benefits: string | null
  location: string
  type: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface CareerPageConfig {
  id?: string
  heroBadgeText: string
  heroTitle: string
  heroDescription: string
  heroFeature1Text: string
  heroFeature2Text: string
  heroFeature3Text: string
  noJobsTitle: string
  noJobsDescription: string
  ctaTitle: string
  ctaDescription: string
  ctaButtonText: string
  ctaButtonLink: string
  initiativeTitle: string
  initiativeDescription: string
  initiativeButtonText: string
}

const emptyJob: Partial<JobPosting> = {
  title: '',
  slug: '',
  category: 'IT-Development',
  description: '',
  requirements: '',
  benefits: '',
  location: 'München (Remote)',
  type: 'Vollzeit',
  isActive: true,
  sortOrder: 0,
}

const categories = [
  { value: 'IT-Development', label: 'IT & Development', icon: Code },
  { value: 'Operations', label: 'Operations', icon: Cog },
  { value: 'Finance', label: 'Finance', icon: DollarSign },
]

const jobTypes = [
  'Vollzeit',
  'Teilzeit',
  'Werkstudent',
  'Praktikum',
  'Freelance',
]

export default function CareerPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentJob, setCurrentJob] = useState<Partial<JobPosting>>(emptyJob)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)
  
  // Page Config States
  const [mainTab, setMainTab] = useState<'jobs' | 'config'>('jobs')
  const [pageConfig, setPageConfig] = useState<CareerPageConfig>({
    heroBadgeText: 'Wir suchen dich!',
    heroTitle: 'Karriere bei NICNOA&CO.online',
    heroDescription: 'Werde Teil unseres Teams und gestalte die Zukunft der Friseurbranche mit uns.',
    heroFeature1Text: 'Remote-First',
    heroFeature2Text: 'Startup-Kultur',
    heroFeature3Text: 'Faire Bezahlung',
    noJobsTitle: 'Aktuell keine offenen Stellen',
    noJobsDescription: 'Aber wir freuen uns über Initiativbewerbungen!',
    ctaTitle: 'Bereit für deinen nächsten Karriereschritt?',
    ctaDescription: 'Wir bieten dir ein spannendes Umfeld, in dem du wachsen und dich entwickeln kannst.',
    ctaButtonText: 'Initiativbewerbung',
    ctaButtonLink: '/karriere/initiativ',
    initiativeTitle: 'Initiativbewerbung',
    initiativeDescription: 'Du hast kein passendes Stellenangebot gefunden? Bewirb dich trotzdem bei uns!',
    initiativeButtonText: 'Jetzt initiativ bewerben',
  })
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchJobs()
    fetchPageConfig()
  }, [showInactive])

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/jobs?includeInactive=true')
      if (!res.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const data = await res.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Fehler beim Laden der Jobs')
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPageConfig = async () => {
    setIsLoadingConfig(true)
    try {
      const res = await fetch('/api/admin/career-page-config')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setPageConfig(prev => ({ ...prev, ...data }))
        }
      }
    } catch (error) {
      console.error('Error fetching page config:', error)
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const updatePageConfig = useCallback(<K extends keyof CareerPageConfig>(key: K, value: CareerPageConfig[K]) => {
    setPageConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }, [])

  const handleSaveJob = async () => {
    if (!currentJob.title || !currentJob.slug || !currentJob.description || !currentJob.requirements) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    setIsSaving(true)
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/jobs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentJob),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success(isEditing ? 'Stelle aktualisiert!' : 'Stelle erstellt!')
      setEditDialogOpen(false)
      setCurrentJob(emptyJob)
      fetchJobs()
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Möchten Sie diese Stelle wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return

    try {
      const res = await fetch(`/api/admin/jobs?id=${jobId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete job')

      toast.success('Stelle gelöscht')
      fetchJobs()
    } catch (error) {
      toast.error('Fehler beim Löschen')
    }
  }

  const openEditDialog = (job?: JobPosting) => {
    if (job) {
      setCurrentJob(job)
      setIsEditing(true)
    } else {
      setCurrentJob(emptyJob)
      setIsEditing(false)
    }
    setEditDialogOpen(true)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSavePageConfig = async () => {
    if (!pageConfig.heroTitle) {
      toast.error('Hero-Titel ist erforderlich')
      return
    }

    setIsSavingConfig(true)
    try {
      const res = await fetch('/api/admin/career-page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageConfig),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      toast.success('Seiten-Konfiguration gespeichert!')
      setHasChanges(false)
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Fehler beim Speichern')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (filterCategory !== 'all' && job.category !== filterCategory) return false
    if (!showInactive && !job.isActive) return false
    return true
  })

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.isActive).length,
    itDev: jobs.filter(j => j.category === 'IT-Development').length,
    operations: jobs.filter(j => j.category === 'Operations').length,
    finance: jobs.filter(j => j.category === 'Finance').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Karriere</h1>
          {hasChanges && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
              Ungespeicherte Änderungen
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
          </Button>
          <Button onClick={handleSavePageConfig} disabled={isSavingConfig || !hasChanges}>
            {isSavingConfig ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Speichern</>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Settings */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} overflow-y-auto p-6`}>
          <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'jobs' | 'config')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Stellenangebote
              </TabsTrigger>
              <TabsTrigger value="config">
                <FileText className="mr-2 h-4 w-4" />
                Seiten-Konfiguration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-6 mt-6">
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-5">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      IT
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.itDev}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Cog className="h-4 w-4" />
                      Ops
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.operations}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Finance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.finance}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters & Actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label>Kategorie:</Label>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle Kategorien</SelectItem>
                            {categories.map((cat) => {
                              const Icon = cat.icon
                              return (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {cat.label}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="showInactive"
                          checked={showInactive}
                          onCheckedChange={setShowInactive}
                        />
                        <Label htmlFor="showInactive" className="cursor-pointer">
                          Inaktive anzeigen
                        </Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={fetchJobs} size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Aktualisieren
                      </Button>
                      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => openEditDialog()} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Neue Stelle
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {isEditing ? 'Stelle bearbeiten' : 'Neue Stelle erstellen'}
                            </DialogTitle>
                            <DialogDescription>
                              {isEditing ? 'Bearbeiten Sie die Stellenanzeige' : 'Erstellen Sie eine neue Stellenanzeige'}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-6 py-4">
                            {/* Title & Slug */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="title">Titel *</Label>
                                <Input
                                  id="title"
                                  value={currentJob.title || ''}
                                  onChange={(e) => {
                                    const title = e.target.value
                                    setCurrentJob({
                                      ...currentJob,
                                      title,
                                      slug: !isEditing ? generateSlug(title) : currentJob.slug,
                                    })
                                  }}
                                  placeholder="z.B. Frontend Developer (m/w/d)"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                  id="slug"
                                  value={currentJob.slug || ''}
                                  onChange={(e) => setCurrentJob({ ...currentJob, slug: e.target.value })}
                                  placeholder="z.B. frontend-developer"
                                />
                              </div>
                            </div>

                            {/* Category & Type */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Kategorie *</Label>
                                <Select
                                  value={currentJob.category}
                                  onValueChange={(value) => 
                                    setCurrentJob({ ...currentJob, category: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((cat) => {
                                      const Icon = cat.icon
                                      return (
                                        <SelectItem key={cat.value} value={cat.value}>
                                          <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />
                                            {cat.label}
                                          </div>
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Anstellungsart</Label>
                                <Select
                                  value={currentJob.type}
                                  onValueChange={(value) => 
                                    setCurrentJob({ ...currentJob, type: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {jobTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                              <Label htmlFor="location">Standort</Label>
                              <Input
                                id="location"
                                value={currentJob.location || ''}
                                onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
                                placeholder="z.B. München (Remote)"
                              />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <Label htmlFor="description">Beschreibung *</Label>
                              <Textarea
                                id="description"
                                value={currentJob.description || ''}
                                onChange={(e) => setCurrentJob({ ...currentJob, description: e.target.value })}
                                placeholder="Beschreibung der Stelle..."
                                rows={4}
                              />
                            </div>

                            {/* Requirements */}
                            <div className="space-y-2">
                              <Label htmlFor="requirements">Anforderungen *</Label>
                              <Textarea
                                id="requirements"
                                value={currentJob.requirements || ''}
                                onChange={(e) => setCurrentJob({ ...currentJob, requirements: e.target.value })}
                                placeholder="Anforderungen an Bewerber (jede Zeile ein Punkt)..."
                                rows={4}
                              />
                              <p className="text-xs text-muted-foreground">
                                Jede Zeile wird als separater Punkt angezeigt
                              </p>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-2">
                              <Label htmlFor="benefits">Benefits (optional)</Label>
                              <Textarea
                                id="benefits"
                                value={currentJob.benefits || ''}
                                onChange={(e) => setCurrentJob({ ...currentJob, benefits: e.target.value || null })}
                                placeholder="Was wir bieten (jede Zeile ein Punkt)..."
                                rows={4}
                              />
                            </div>

                            {/* Sortierung & Status */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="sortOrder">Sortierung</Label>
                                <Input
                                  id="sortOrder"
                                  type="number"
                                  value={currentJob.sortOrder || 0}
                                  onChange={(e) => setCurrentJob({ ...currentJob, sortOrder: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="flex items-center gap-2 pt-8">
                                <Switch
                                  id="isActive"
                                  checked={currentJob.isActive !== false}
                                  onCheckedChange={(checked) => setCurrentJob({ ...currentJob, isActive: checked })}
                                />
                                <Label htmlFor="isActive" className="cursor-pointer">
                                  Aktiv (sichtbar auf der Website)
                                </Label>
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                              Abbrechen
                            </Button>
                            <Button onClick={handleSaveJob} disabled={isSaving}>
                              {isSaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Speichern...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Speichern
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs List */}
              <div className="space-y-3">
                {filteredJobs.map((job) => {
                  const category = categories.find(c => c.value === job.category)
                  const CategoryIcon = category?.icon || Code
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className={`${!job.isActive ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                              <CategoryIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{job.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {category?.label}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {job.type}
                                </Badge>
                                {!job.isActive && (
                                  <Badge variant="destructive" className="text-xs">Inaktiv</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {job.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(job)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteJob(job.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {filteredJobs.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Keine Stellenangebote gefunden.</p>
                    <Button className="mt-4" onClick={() => openEditDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Erste Stelle erstellen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="config" className="space-y-6 mt-6">
              {isLoadingConfig ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero-Bereich</CardTitle>
                      <CardDescription>Konfigurieren Sie den Hero-Bereich der Karriere-Seite</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Badge-Text</Label>
                        <Input
                          value={pageConfig.heroBadgeText || ''}
                          onChange={(e) => updatePageConfig('heroBadgeText', e.target.value)}
                          placeholder="z.B. Wir suchen dich!"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Titel *</Label>
                        <Input
                          value={pageConfig.heroTitle || ''}
                          onChange={(e) => updatePageConfig('heroTitle', e.target.value)}
                          placeholder="z.B. Karriere bei NICNOA&CO.online"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={pageConfig.heroDescription || ''}
                          onChange={(e) => updatePageConfig('heroDescription', e.target.value)}
                          placeholder="Beschreibungstext..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Feature 1</Label>
                          <Input
                            value={pageConfig.heroFeature1Text || ''}
                            onChange={(e) => updatePageConfig('heroFeature1Text', e.target.value)}
                            placeholder="z.B. Remote-First"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Feature 2</Label>
                          <Input
                            value={pageConfig.heroFeature2Text || ''}
                            onChange={(e) => updatePageConfig('heroFeature2Text', e.target.value)}
                            placeholder="z.B. Startup-Kultur"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Feature 3</Label>
                          <Input
                            value={pageConfig.heroFeature3Text || ''}
                            onChange={(e) => updatePageConfig('heroFeature3Text', e.target.value)}
                            placeholder="z.B. Faire Bezahlung"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Keine Jobs vorhanden</CardTitle>
                      <CardDescription>Texte, wenn keine Jobs verfügbar sind</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Titel</Label>
                        <Input
                          value={pageConfig.noJobsTitle || ''}
                          onChange={(e) => updatePageConfig('noJobsTitle', e.target.value)}
                          placeholder="z.B. Aktuell keine offenen Stellen"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={pageConfig.noJobsDescription || ''}
                          onChange={(e) => updatePageConfig('noJobsDescription', e.target.value)}
                          placeholder="z.B. Aber wir freuen uns über Initiativbewerbungen!"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Initiativbewerbung</CardTitle>
                      <CardDescription>Texte für den Initiativbewerbungs-Bereich</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Titel</Label>
                        <Input
                          value={pageConfig.initiativeTitle || ''}
                          onChange={(e) => updatePageConfig('initiativeTitle', e.target.value)}
                          placeholder="z.B. Initiativbewerbung"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={pageConfig.initiativeDescription || ''}
                          onChange={(e) => updatePageConfig('initiativeDescription', e.target.value)}
                          placeholder="Beschreibungstext..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button-Text</Label>
                        <Input
                          value={pageConfig.initiativeButtonText || ''}
                          onChange={(e) => updatePageConfig('initiativeButtonText', e.target.value)}
                          placeholder="z.B. Jetzt initiativ bewerben"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>CTA-Bereich</CardTitle>
                      <CardDescription>Konfigurieren Sie den CTA-Bereich am Ende der Seite</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Titel</Label>
                        <Input
                          value={pageConfig.ctaTitle || ''}
                          onChange={(e) => updatePageConfig('ctaTitle', e.target.value)}
                          placeholder="z.B. Bereit für deinen nächsten Karriereschritt?"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={pageConfig.ctaDescription || ''}
                          onChange={(e) => updatePageConfig('ctaDescription', e.target.value)}
                          placeholder="Beschreibungstext..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Button-Text</Label>
                          <Input
                            value={pageConfig.ctaButtonText || ''}
                            onChange={(e) => updatePageConfig('ctaButtonText', e.target.value)}
                            placeholder="z.B. Initiativbewerbung"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Button-Link</Label>
                          <Input
                            value={pageConfig.ctaButtonLink || ''}
                            onChange={(e) => updatePageConfig('ctaButtonLink', e.target.value)}
                            placeholder="/karriere/initiativ"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Preview */}
        {showPreview && (
          <div className="w-1/2 border-l bg-muted/30 p-6 overflow-y-auto">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live-Vorschau
                </CardTitle>
                <CardDescription>
                  So wird die Karriere-Seite für Besucher angezeigt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg bg-background p-6 space-y-6 max-h-[800px] overflow-y-auto">
                  {/* Hero Preview */}
                  <div className="space-y-4">
                    {pageConfig.heroBadgeText && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{pageConfig.heroBadgeText}</span>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold">{pageConfig.heroTitle || 'Titel eingeben'}</h2>
                    {pageConfig.heroDescription && (
                      <p className="text-sm text-muted-foreground">{pageConfig.heroDescription}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {pageConfig.heroFeature1Text && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-card border">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>{pageConfig.heroFeature1Text}</span>
                        </div>
                      )}
                      {pageConfig.heroFeature2Text && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-card border">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span>{pageConfig.heroFeature2Text}</span>
                        </div>
                      )}
                      {pageConfig.heroFeature3Text && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-card border">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span>{pageConfig.heroFeature3Text}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Jobs Preview */}
                  <div className="border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground">Stellenangebote-Vorschau</h3>
                    {filteredJobs.filter(j => j.isActive).slice(0, 3).map((job) => {
                      const category = categories.find(c => c.value === job.category)
                      const CategoryIcon = category?.icon || Code
                      return (
                        <div key={job.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <CategoryIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{job.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{job.location}</span>
                                <span>•</span>
                                <span>{job.type}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {category?.label}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                    {filteredJobs.filter(j => j.isActive).length === 0 && (
                      <div className="text-center py-4 border rounded-lg">
                        <p className="font-medium text-sm">{pageConfig.noJobsTitle || 'Keine offenen Stellen'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{pageConfig.noJobsDescription}</p>
                      </div>
                    )}
                  </div>

                  {/* Initiative Section Preview */}
                  {pageConfig.initiativeTitle && (
                    <div className="border-t pt-4 space-y-2">
                      <h3 className="font-semibold text-sm">{pageConfig.initiativeTitle}</h3>
                      <p className="text-xs text-muted-foreground">{pageConfig.initiativeDescription}</p>
                      <Button size="sm" variant="outline" disabled>
                        {pageConfig.initiativeButtonText || 'Initiativ bewerben'}
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* CTA Section Preview */}
                  {(pageConfig.ctaTitle || pageConfig.ctaDescription) && (
                    <div className="border-t pt-4 space-y-4 bg-muted/50 -mx-6 -mb-6 p-6 rounded-b-lg">
                      {pageConfig.ctaTitle && (
                        <h3 className="text-lg font-bold">{pageConfig.ctaTitle}</h3>
                      )}
                      {pageConfig.ctaDescription && (
                        <p className="text-sm text-muted-foreground">{pageConfig.ctaDescription}</p>
                      )}
                      {pageConfig.ctaButtonText && (
                        <Button size="sm" disabled>
                          {pageConfig.ctaButtonText}
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}




