'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Loader2,
  Save,
  Plus,
  Edit2,
  Trash2,
  Shield,
  ArrowLeft,
  ExternalLink,
  Globe,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { SortableList } from '@/components/ui/sortable-list'
import { LegalAdminPreview } from '@/components/legal/legal-admin-preview'
import { LegalTiptapEditor } from '@/components/editor/legal-tiptap-editor'

const PAGE_TYPE = 'DATENSCHUTZ'

interface LegalPageConfig {
  id?: string
  pageType: string
  heroBadgeText: string | null
  heroTitle: string
  heroDescription: string | null
  metaTitle: string | null
  metaDescription: string | null
  contactEmail: string | null
  contactPhone: string | null
  lastUpdated: string | null
}

interface LegalSection {
  id: string
  pageType: string
  title: string
  content: string
  sortOrder: number
  isActive: boolean
  isCollapsible: boolean
}

export default function DatenschutzAdminPage() {
  const [pageConfig, setPageConfig] = useState<LegalPageConfig>({
    pageType: PAGE_TYPE,
    heroBadgeText: '',
    heroTitle: 'Datenschutzerklärung',
    heroDescription: '',
    metaTitle: '',
    metaDescription: '',
    contactEmail: '',
    contactPhone: '',
    lastUpdated: null,
  })
  const [sections, setSections] = useState<LegalSection[]>([])
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isLoadingSections, setIsLoadingSections] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [editSectionDialogOpen, setEditSectionDialogOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState<Partial<LegalSection>>({
    title: '',
    content: '',
    sortOrder: 0,
    isActive: true,
    isCollapsible: true,
  })
  const [isEditingSection, setIsEditingSection] = useState(false)

  useEffect(() => {
    fetchPageConfig()
    fetchSections()
  }, [])

  const fetchPageConfig = async () => {
    try {
      setIsLoadingConfig(true)
      const res = await fetch(`/api/admin/legal-page-config?type=${PAGE_TYPE}`)
      if (res.ok) {
        const data = await res.json()
        setPageConfig({
          ...data,
          pageType: PAGE_TYPE,
          heroBadgeText: data.heroBadgeText || '',
          heroTitle: data.heroTitle || 'Datenschutzerklärung',
          heroDescription: data.heroDescription || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          lastUpdated: data.lastUpdated || null,
        })
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      toast.error('Fehler beim Laden der Konfiguration')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const fetchSections = async () => {
    try {
      setIsLoadingSections(true)
      const res = await fetch(`/api/admin/legal-sections?type=${PAGE_TYPE}`)
      if (res.ok) {
        const data = await res.json()
        setSections(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
      toast.error('Fehler beim Laden der Abschnitte')
    } finally {
      setIsLoadingSections(false)
    }
  }

  const handleSavePageConfig = async () => {
    try {
      setIsSavingConfig(true)
      const res = await fetch('/api/admin/legal-page-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pageConfig,
          pageType: PAGE_TYPE,
          lastUpdated: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        toast.success('Konfiguration gespeichert')
        await fetchPageConfig()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleSaveSection = async () => {
    try {
      if (!currentSection.title || !currentSection.content) {
        toast.error('Titel und Inhalt sind erforderlich')
        return
      }

      if (isEditingSection && currentSection.id) {
        const res = await fetch(`/api/admin/legal-sections/${currentSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSection),
        })

        if (res.ok) {
          toast.success('Abschnitt aktualisiert')
          setEditSectionDialogOpen(false)
          resetCurrentSection()
          await fetchSections()
        } else {
          const error = await res.json()
          toast.error(error.error || 'Fehler beim Aktualisieren')
        }
      } else {
        const maxSortOrder = sections.length > 0 
          ? Math.max(...sections.map(s => s.sortOrder)) + 1 
          : 0

        const res = await fetch('/api/admin/legal-sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentSection,
            pageType: PAGE_TYPE,
            sortOrder: maxSortOrder,
          }),
        })

        if (res.ok) {
          toast.success('Abschnitt erstellt')
          setEditSectionDialogOpen(false)
          resetCurrentSection()
          await fetchSections()
        } else {
          const error = await res.json()
          toast.error(error.error || 'Fehler beim Erstellen')
        }
      }
    } catch (error) {
      console.error('Error saving section:', error)
      toast.error('Fehler beim Speichern')
    }
  }

  const resetCurrentSection = () => {
    setCurrentSection({
      title: '',
      content: '',
      sortOrder: 0,
      isActive: true,
      isCollapsible: true,
    })
    setIsEditingSection(false)
  }

  const handleEditSection = (section: LegalSection) => {
    setCurrentSection(section)
    setIsEditingSection(true)
    setEditSectionDialogOpen(true)
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Möchten Sie diesen Abschnitt wirklich löschen?')) return

    try {
      const res = await fetch(`/api/admin/legal-sections/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Abschnitt gelöscht')
        await fetchSections()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Error deleting section:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const handleReorderSections = async (reorderedSections: LegalSection[]) => {
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      sortOrder: index,
    }))
    setSections(updatedSections)

    try {
      const res = await fetch('/api/admin/legal-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: updatedSections }),
      })

      if (res.ok) {
        toast.success('Reihenfolge aktualisiert')
      } else {
        toast.error('Fehler beim Speichern der Reihenfolge')
        await fetchSections()
      }
    } catch (error) {
      console.error('Error reordering sections:', error)
      await fetchSections()
    }
  }

  if (isLoadingConfig || isLoadingSections) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/legal">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-500" />
              Datenschutzerklärung
            </h1>
            <p className="text-sm text-muted-foreground">
              DSGVO-konforme Datenschutzerklärung
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/datenschutz" target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Seite ansehen
          </Link>
        </Button>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
        {/* Left: Editor */}
        <div className="overflow-y-auto space-y-4 pr-2">
          {/* Page Config */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Seiteneinstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroBadgeText">Badge-Text</Label>
                  <Input
                    id="heroBadgeText"
                    value={pageConfig.heroBadgeText || ''}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, heroBadgeText: e.target.value }))
                    }
                    placeholder="z.B. DSGVO"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Titel</Label>
                  <Input
                    id="heroTitle"
                    value={pageConfig.heroTitle}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, heroTitle: e.target.value }))
                    }
                    placeholder="Datenschutzerklärung"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroDescription">Beschreibung</Label>
                <Textarea
                  id="heroDescription"
                  value={pageConfig.heroDescription || ''}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, heroDescription: e.target.value }))
                  }
                  placeholder="Kurze Beschreibung..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Datenschutz E-Mail</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={pageConfig.contactEmail || ''}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, contactEmail: e.target.value }))
                    }
                    placeholder="datenschutz@nicnoa.de"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefon</Label>
                  <Input
                    id="contactPhone"
                    value={pageConfig.contactPhone || ''}
                    onChange={(e) =>
                      setPageConfig((prev) => ({ ...prev, contactPhone: e.target.value }))
                    }
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta-Titel</Label>
                <Input
                  id="metaTitle"
                  value={pageConfig.metaTitle || ''}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, metaTitle: e.target.value }))
                  }
                  placeholder="Datenschutz | NICNOA"
                  maxLength={70}
                />
                <p className={`text-xs ${(pageConfig.metaTitle || '').length > 60 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  {(pageConfig.metaTitle || '').length}/70
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta-Beschreibung</Label>
                <Textarea
                  id="metaDescription"
                  value={pageConfig.metaDescription || ''}
                  onChange={(e) =>
                    setPageConfig((prev) => ({ ...prev, metaDescription: e.target.value }))
                  }
                  placeholder="Beschreibung für Suchmaschinen..."
                  rows={2}
                  maxLength={160}
                />
                <p className={`text-xs ${(pageConfig.metaDescription || '').length > 150 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  {(pageConfig.metaDescription || '').length}/160
                </p>
              </div>
              {/* Google Preview */}
              <div className="p-3 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-3 w-3 text-gray-500" />
                  <p className="text-xs font-medium text-gray-700">Google-Vorschau</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[#1a0dab] text-sm hover:underline cursor-pointer truncate">
                    {pageConfig.metaTitle || 'Datenschutz | NICNOA'}
                  </p>
                  <p className="text-[#006621] text-xs">nicnoa.de › datenschutz</p>
                  <p className="text-xs text-[#545454] line-clamp-2">
                    {pageConfig.metaDescription || pageConfig.heroDescription || 'Datenschutzerklärung gemäß DSGVO'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Config Button */}
          <Button onClick={handleSavePageConfig} disabled={isSavingConfig} className="w-full">
            {isSavingConfig ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Einstellungen speichern
          </Button>

          {/* Sections */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Abschnitte ({sections.length})</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    resetCurrentSection()
                    setEditSectionDialogOpen(true)
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Neu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Noch keine Abschnitte</p>
                </div>
              ) : (
                <SortableList
                  items={sections}
                  onReorder={handleReorderSections}
                  renderItem={(section) => (
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{section.title}</span>
                          <Badge variant={section.isActive ? 'default' : 'secondary'} className="text-xs">
                            {section.isActive ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                          {section.isCollapsible && (
                            <Badge variant="outline" className="text-xs">Klappbar</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditSection(section)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(section.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="border rounded-lg overflow-y-auto bg-background">
          <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm border-b px-4 py-2">
            <p className="text-sm font-medium text-center">Live-Vorschau</p>
          </div>
          <LegalAdminPreview
            pageType="DATENSCHUTZ"
            config={pageConfig}
            sections={sections}
          />
        </div>
      </div>

      {/* Edit Section Dialog */}
      <Dialog open={editSectionDialogOpen} onOpenChange={setEditSectionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingSection ? 'Abschnitt bearbeiten' : 'Neuer Abschnitt'}
            </DialogTitle>
            <DialogDescription>
              Erstellen oder bearbeiten Sie einen Datenschutz-Abschnitt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sectionTitle">Titel</Label>
              <Input
                id="sectionTitle"
                value={currentSection.title || ''}
                onChange={(e) =>
                  setCurrentSection((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="z.B. 1. Verantwortlicher"
              />
            </div>
            <div className="space-y-2">
              <Label>Inhalt</Label>
              <LegalTiptapEditor
                content={currentSection.content || ''}
                onChange={(content) =>
                  setCurrentSection((prev) => ({ ...prev, content }))
                }
                placeholder="Inhalt des Datenschutz-Abschnitts..."
                minHeight="300px"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="sectionActive"
                  checked={currentSection.isActive !== false}
                  onCheckedChange={(checked) =>
                    setCurrentSection((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="sectionActive">Aktiv</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="sectionCollapsible"
                  checked={currentSection.isCollapsible === true}
                  onCheckedChange={(checked) =>
                    setCurrentSection((prev) => ({ ...prev, isCollapsible: checked }))
                  }
                />
                <Label htmlFor="sectionCollapsible">Klappbar</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSectionDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveSection}>
              <Save className="mr-2 h-4 w-4" />
              {isEditingSection ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
