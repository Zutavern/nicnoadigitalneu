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
  FileText,
  Shield,
  Scale,
  ChevronDown,
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
import { toast } from 'sonner'
import Link from 'next/link'
import { SortableList } from '@/components/ui/sortable-list'

type LegalPageType = 'IMPRESSUM' | 'DATENSCHUTZ' | 'AGB'

interface LegalPageConfig {
  id?: string
  pageType: LegalPageType
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
  pageType: LegalPageType
  title: string
  content: string
  sortOrder: number
  isActive: boolean
  isCollapsible: boolean
}

const pageTypeConfig = {
  IMPRESSUM: {
    label: 'Impressum',
    icon: FileText,
    color: 'blue',
    route: '/impressum',
  },
  DATENSCHUTZ: {
    label: 'Datenschutz',
    icon: Shield,
    color: 'green',
    route: '/datenschutz',
  },
  AGB: {
    label: 'AGB',
    icon: Scale,
    color: 'purple',
    route: '/agb',
  },
}

export default function LegalAdminPage() {
  const [activePageType, setActivePageType] = useState<LegalPageType>('IMPRESSUM')
  const [pageConfig, setPageConfig] = useState<LegalPageConfig>({
    pageType: 'IMPRESSUM',
    heroBadgeText: '',
    heroTitle: '',
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPageConfig()
    fetchSections()
  }, [activePageType])

  const fetchPageConfig = async () => {
    try {
      setIsLoadingConfig(true)
      const res = await fetch(`/api/admin/legal-page-config?type=${activePageType}`)
      if (res.ok) {
        const data = await res.json()
        setPageConfig({
          ...data,
          pageType: activePageType,
          heroBadgeText: data.heroBadgeText || '',
          heroTitle: data.heroTitle || '',
          heroDescription: data.heroDescription || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          lastUpdated: data.lastUpdated || null,
        })
      } else {
        toast.error('Fehler beim Laden der Konfiguration')
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
      const res = await fetch(`/api/admin/legal-sections?type=${activePageType}`)
      if (res.ok) {
        const data = await res.json()
        setSections(Array.isArray(data) ? data : [])
      } else {
        toast.error('Fehler beim Laden der Abschnitte')
        setSections([])
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
      toast.error('Fehler beim Laden der Abschnitte')
      setSections([])
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
          pageType: activePageType,
          lastUpdated: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        toast.success('Konfiguration erfolgreich gespeichert')
        await fetchPageConfig()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Fehler beim Speichern der Konfiguration')
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
        // Update
        const res = await fetch(`/api/admin/legal-sections/${currentSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSection),
        })

        if (res.ok) {
          toast.success('Abschnitt erfolgreich aktualisiert')
          setEditSectionDialogOpen(false)
          resetCurrentSection()
          await fetchSections()
        } else {
          const error = await res.json()
          toast.error(error.error || 'Fehler beim Aktualisieren')
        }
      } else {
        // Create
        const maxSortOrder = sections.length > 0 
          ? Math.max(...sections.map(s => s.sortOrder)) + 1 
          : 0

        const res = await fetch('/api/admin/legal-sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentSection,
            pageType: activePageType,
            sortOrder: maxSortOrder,
          }),
        })

        if (res.ok) {
          toast.success('Abschnitt erfolgreich erstellt')
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
      toast.error('Fehler beim Speichern des Abschnitts')
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
        toast.success('Abschnitt erfolgreich gelöscht')
        await fetchSections()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Error deleting section:', error)
      toast.error('Fehler beim Löschen des Abschnitts')
    }
  }

  const handleReorderSections = async (reorderedSections: LegalSection[]) => {
    // Optimistisches Update
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
      toast.error('Fehler beim Verschieben der Abschnitte')
      await fetchSections()
    }
  }

  const toggleSectionExpanded = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const activeSections = sections.filter((s) => s.isActive)
  const PageIcon = pageTypeConfig[activePageType].icon

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rechtliche Seiten</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Impressum, Datenschutz und AGB
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={pageTypeConfig[activePageType].route} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Seite ansehen
            <ExternalLink className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Page Type Selection */}
      <Tabs value={activePageType} onValueChange={(v) => setActivePageType(v as LegalPageType)}>
        <TabsList className="grid w-full grid-cols-3">
          {(Object.keys(pageTypeConfig) as LegalPageType[]).map((type) => {
            const config = pageTypeConfig[type]
            const Icon = config.icon
            return (
              <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {config.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {(Object.keys(pageTypeConfig) as LegalPageType[]).map((type) => (
          <TabsContent key={type} value={type} className="space-y-6 mt-6">
            {/* Sub-Tabs for Config / Sections / Preview */}
            <Tabs defaultValue="config" className="space-y-6">
              <TabsList>
                <TabsTrigger value="config">Konfiguration</TabsTrigger>
                <TabsTrigger value="sections">Abschnitte</TabsTrigger>
                <TabsTrigger value="preview">Vorschau</TabsTrigger>
              </TabsList>

              {/* Config Tab */}
              <TabsContent value="config" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hero-Bereich</CardTitle>
                    <CardDescription>Hauptbereich am Anfang der Seite</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="heroBadgeText">Badge-Text</Label>
                      <Input
                        id="heroBadgeText"
                        value={pageConfig.heroBadgeText || ''}
                        onChange={(e) =>
                          setPageConfig((prev) => ({ ...prev, heroBadgeText: e.target.value }))
                        }
                        placeholder="z.B. Rechtliches"
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
                        placeholder={`z.B. ${pageTypeConfig[activePageType].label}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroDescription">Beschreibung</Label>
                      <Textarea
                        id="heroDescription"
                        value={pageConfig.heroDescription || ''}
                        onChange={(e) =>
                          setPageConfig((prev) => ({ ...prev, heroDescription: e.target.value }))
                        }
                        placeholder="Kurze Beschreibung der Seite..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      SEO-Einstellungen
                    </CardTitle>
                    <CardDescription>Optimieren Sie die Sichtbarkeit in Suchmaschinen</CardDescription>
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
                        placeholder={`z.B. ${pageTypeConfig[activePageType].label} | NICNOA`}
                        maxLength={70}
                      />
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">Leer lassen für automatischen Titel</p>
                        <p className={`text-xs ${(pageConfig.metaTitle || '').length > 60 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                          {(pageConfig.metaTitle || '').length}/70
                        </p>
                      </div>
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
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">Ideal sind 120-160 Zeichen</p>
                        <p className={`text-xs ${(pageConfig.metaDescription || '').length > 150 ? 'text-amber-500' : (pageConfig.metaDescription || '').length < 120 ? 'text-muted-foreground' : 'text-green-500'}`}>
                          {(pageConfig.metaDescription || '').length}/160
                        </p>
                      </div>
                    </div>

                    {/* Google Preview */}
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Google-Vorschau</p>
                      </div>
                      <div className="space-y-1 font-sans">
                        <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                          {pageConfig.metaTitle || `${pageTypeConfig[activePageType].label} | NICNOA`}
                        </p>
                        <p className="text-[#006621] text-sm">
                          nicnoa.de › {activePageType.toLowerCase()}
                        </p>
                        <p className="text-sm text-[#545454] line-clamp-2">
                          {pageConfig.metaDescription || pageConfig.heroDescription || pageTypeConfig[activePageType].description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(activePageType === 'IMPRESSUM' || activePageType === 'DATENSCHUTZ') && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Kontaktinformationen</CardTitle>
                      <CardDescription>Wird am Ende der Seite angezeigt</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">E-Mail</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={pageConfig.contactEmail || ''}
                            onChange={(e) =>
                              setPageConfig((prev) => ({ ...prev, contactEmail: e.target.value }))
                            }
                            placeholder="info@nicnoa.de"
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
                            placeholder="+49 (0) 123 456789"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSavePageConfig} disabled={isSavingConfig}>
                    {isSavingConfig ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird gespeichert...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Konfiguration speichern
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Sections Tab */}
              <TabsContent value="sections" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Inhalts-Abschnitte</CardTitle>
                        <CardDescription>
                          Verwalten Sie die einzelnen Abschnitte der {pageTypeConfig[activePageType].label}-Seite
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          resetCurrentSection()
                          setEditSectionDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Neuer Abschnitt
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSections ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : sections.length === 0 ? (
                      <div className="text-center py-12">
                        <PageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Noch keine Abschnitte vorhanden</p>
                        <Button
                          onClick={() => {
                            resetCurrentSection()
                            setEditSectionDialogOpen(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ersten Abschnitt erstellen
                        </Button>
                      </div>
                    ) : (
                      <SortableList
                        items={sections}
                        onReorder={handleReorderSections}
                        renderItem={(section) => (
                          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{section.title}</h3>
                                <Badge variant={section.isActive ? 'default' : 'secondary'}>
                                  {section.isActive ? 'Aktiv' : 'Inaktiv'}
                                </Badge>
                                {section.isCollapsible && (
                                  <Badge variant="outline">Klappbar</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {section.content.substring(0, 150)}...
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSection(section)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSection(section.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Live-Vorschau</CardTitle>
                    <CardDescription>
                      So wird die {pageTypeConfig[activePageType].label}-Seite für Besucher angezeigt
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-6 bg-background max-h-[800px] overflow-y-auto">
                      {/* Hero Section */}
                      <section className="py-12 text-center">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {pageConfig.heroBadgeText && (
                            <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm mb-4">
                              <PageIcon className="mr-1 h-3.5 w-3.5 text-primary" />
                              <span className="text-muted-foreground">{pageConfig.heroBadgeText}</span>
                            </span>
                          )}
                          <h1 className="text-4xl font-bold tracking-tight mb-4">
                            {pageConfig.heroTitle || pageTypeConfig[activePageType].label}
                          </h1>
                          {pageConfig.heroDescription && (
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                              {pageConfig.heroDescription}
                            </p>
                          )}
                        </motion.div>
                      </section>

                      {/* Sections */}
                      <section className="max-w-3xl mx-auto space-y-4">
                        {activeSections.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Keine aktiven Abschnitte vorhanden. Erstellen Sie Abschnitte im Tab &quot;Abschnitte&quot;.
                          </div>
                        ) : (
                          activeSections.map((section, index) => (
                            <motion.div
                              key={section.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border rounded-lg overflow-hidden"
                            >
                              {section.isCollapsible ? (
                                <>
                                  <button
                                    onClick={() => toggleSectionExpanded(section.id)}
                                    className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                                  >
                                    <h2 className="text-xl font-semibold">{section.title}</h2>
                                    <ChevronDown
                                      className={`h-5 w-5 transition-transform ${
                                        expandedSections.has(section.id) ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>
                                  {expandedSections.has(section.id) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      className="px-4 pb-4"
                                    >
                                      <div className="text-muted-foreground whitespace-pre-wrap">
                                        {section.content}
                                      </div>
                                    </motion.div>
                                  )}
                                </>
                              ) : (
                                <div className="p-4">
                                  <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                                  <div className="text-muted-foreground whitespace-pre-wrap">
                                    {section.content}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))
                        )}
                      </section>

                      {/* Contact Section */}
                      {(activePageType === 'IMPRESSUM' || activePageType === 'DATENSCHUTZ') &&
                        (pageConfig.contactEmail || pageConfig.contactPhone) && (
                          <section className="mt-12 max-w-3xl mx-auto">
                            <div className="rounded-lg bg-muted p-6">
                              <h2 className="text-xl font-semibold mb-4">
                                {activePageType === 'DATENSCHUTZ' ? 'Kontakt für Datenschutz' : 'Kontakt'}
                              </h2>
                              <p className="text-muted-foreground">
                                Bei Fragen wenden Sie sich bitte an:
                              </p>
                              <div className="mt-4 space-y-1">
                                {pageConfig.contactEmail && (
                                  <p>E-Mail: {pageConfig.contactEmail}</p>
                                )}
                                {pageConfig.contactPhone && (
                                  <p>Telefon: {pageConfig.contactPhone}</p>
                                )}
                              </div>
                            </div>
                          </section>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Section Dialog */}
      <Dialog open={editSectionDialogOpen} onOpenChange={setEditSectionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingSection ? 'Abschnitt bearbeiten' : 'Neuer Abschnitt'}
            </DialogTitle>
            <DialogDescription>
              Erstellen oder bearbeiten Sie einen Inhalts-Abschnitt für die {pageTypeConfig[activePageType].label}-Seite
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
                placeholder="z.B. §1 Geltungsbereich"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectionContent">Inhalt</Label>
              <Textarea
                id="sectionContent"
                value={currentSection.content || ''}
                onChange={(e) =>
                  setCurrentSection((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Der Inhalt des Abschnitts..."
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Tipp: Verwenden Sie Zeilenumbrüche für Absätze. **Text** für Fettdruck.
              </p>
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
                  checked={currentSection.isCollapsible !== false}
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
