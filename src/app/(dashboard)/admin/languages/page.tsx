'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, Reorder } from 'framer-motion'
import {
  Languages,
  Globe,
  Loader2,
  Save,
  RefreshCw,
  Check,
  AlertTriangle,
  Clock,
  FileText,
  GripVertical,
  Sparkles,
  Play,
  Pause,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Language {
  id: string
  name: string
  nativeName: string
  flag: string | null
  isDefault: boolean
  isActive: boolean
  sortOrder: number
  deactivatedAt: string | null
  redirectTo: string | null
  stats: {
    totalTranslations: number
    outdatedTranslations: number
    pendingJobs: number
  }
}

export default function LanguagesAdminPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [deactivateDialog, setDeactivateDialog] = useState<Language | null>(null)
  const [translateAllDialog, setTranslateAllDialog] = useState(false)

  const fetchLanguages = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/languages')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLanguages(data)
    } catch (error) {
      console.error('Error fetching languages:', error)
      toast.error('Fehler beim Laden der Sprachen')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLanguages()
  }, [fetchLanguages])

  const handleToggleActive = async (lang: Language) => {
    // Bei Deaktivierung: Dialog anzeigen
    if (lang.isActive) {
      setDeactivateDialog(lang)
      return
    }

    // Bei Aktivierung: Direkt durchführen
    await updateLanguage(lang.id, { isActive: true })
  }

  const confirmDeactivate = async () => {
    if (!deactivateDialog) return

    await updateLanguage(deactivateDialog.id, { isActive: false })
    setDeactivateDialog(null)
  }

  const handleSetDefault = async (lang: Language) => {
    if (lang.isDefault) return

    await updateLanguage(lang.id, { isDefault: true, isActive: true })
  }

  const updateLanguage = async (id: string, data: Partial<Language>) => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/languages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })

      if (!res.ok) throw new Error('Failed to update')

      await fetchLanguages()
      toast.success('Sprache aktualisiert')
    } catch (error) {
      console.error('Error updating language:', error)
      toast.error('Fehler beim Aktualisieren')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReorder = (newOrder: Language[]) => {
    setLanguages(newOrder)
    setHasChanges(true)
  }

  const saveOrder = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languages: languages.map((lang, index) => ({
            id: lang.id,
            sortOrder: index + 1,
          })),
        }),
      })

      if (!res.ok) throw new Error('Failed to save order')

      setHasChanges(false)
      toast.success('Reihenfolge gespeichert')
    } catch (error) {
      console.error('Error saving order:', error)
      toast.error('Fehler beim Speichern der Reihenfolge')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTranslateAll = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/translations/queue-all', {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to queue translations')

      const data = await res.json()
      toast.success(`${data.jobsCreated} Übersetzungsjobs erstellt`)
      setTranslateAllDialog(false)
      await fetchLanguages()
    } catch (error) {
      console.error('Error queueing translations:', error)
      toast.error('Fehler beim Erstellen der Übersetzungsjobs')
    } finally {
      setIsSaving(false)
    }
  }

  const activeCount = languages.filter((l) => l.isActive).length
  const totalTranslations = languages.reduce((acc, l) => acc + l.stats.totalTranslations, 0)
  const pendingJobs = languages.reduce((acc, l) => acc + l.stats.pendingJobs, 0)
  const outdatedCount = languages.reduce((acc, l) => acc + l.stats.outdatedTranslations, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Languages className="h-8 w-8 text-primary" />
            Sprachen & Übersetzungen
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalte die verfügbaren Sprachen und starte AI-Übersetzungen
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button onClick={saveOrder} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Reihenfolge speichern
            </Button>
          )}

          <Button
            variant="outline"
            onClick={fetchLanguages}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Aktualisieren
          </Button>

          <Button
            onClick={() => setTranslateAllDialog(true)}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Alle übersetzen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Sprachen</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              von {languages.length} verfügbaren
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Übersetzungen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTranslations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Gespeicherte Texte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Warteschlange</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ausstehende Jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veraltet</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{outdatedCount}</div>
            <p className="text-xs text-muted-foreground">Brauchen Update</p>
          </CardContent>
        </Card>
      </div>

      {/* Languages List */}
      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Sprachen</CardTitle>
          <CardDescription>
            Ziehe die Sprachen per Drag & Drop, um die Reihenfolge zu ändern.
            Die erste aktive Sprache wird im Sprachswitcher als erstes angezeigt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Reorder.Group
            axis="y"
            values={languages}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {languages.map((lang) => (
              <Reorder.Item
                key={lang.id}
                value={lang}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border bg-card transition-colors',
                  lang.isActive ? 'border-border' : 'border-border/50 opacity-60',
                  'cursor-grab active:cursor-grabbing'
                )}
              >
                {/* Drag Handle */}
                <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                {/* Flag & Name */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {lang.nativeName}
                      {lang.isDefault && (
                        <Badge variant="default" className="text-xs">
                          Standard
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {lang.name} ({lang.id.toUpperCase()})
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 flex-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Übersetzungen:</span>{' '}
                    <span className="font-medium">{lang.stats.totalTranslations}</span>
                  </div>

                  {lang.stats.pendingJobs > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {lang.stats.pendingJobs} ausstehend
                    </Badge>
                  )}

                  {lang.stats.outdatedTranslations > 0 && (
                    <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500/30">
                      <AlertTriangle className="h-3 w-3" />
                      {lang.stats.outdatedTranslations} veraltet
                    </Badge>
                  )}

                  {!lang.isActive && lang.deactivatedAt && (
                    <Badge variant="outline" className="gap-1 text-red-500 border-red-500/30">
                      <Pause className="h-3 w-3" />
                      301 Redirect aktiv
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  {!lang.isDefault && lang.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(lang)}
                      disabled={isSaving}
                    >
                      Als Standard
                    </Button>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {lang.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                    <Switch
                      checked={lang.isActive}
                      onCheckedChange={() => handleToggleActive(lang)}
                      disabled={lang.isDefault || isSaving}
                    />
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Globe className="h-5 w-5" />
            SEO-Hinweise zur Mehrsprachigkeit
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Aktive Sprachen:</strong> Werden in der URL-Struktur (/de/, /en/, etc.),
            Sitemap und hreflang-Tags berücksichtigt.
          </p>
          <p>
            <strong>Deaktivierte Sprachen:</strong> Erhalten automatisch 301-Redirects zur
            Standardsprache. Google wird die Änderung innerhalb von 2-4 Wochen übernehmen.
          </p>
          <p>
            <strong>Übersetzungen bleiben erhalten:</strong> Bei Reaktivierung sind alle
            Übersetzungen sofort wieder verfügbar.
          </p>
        </CardContent>
      </Card>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog
        open={!!deactivateDialog}
        onOpenChange={() => setDeactivateDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {deactivateDialog?.flag} {deactivateDialog?.nativeName} deaktivieren?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <span>Diese Aktion wird:</span>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>301-Redirects für alle /{deactivateDialog?.id}/ URLs aktivieren</li>
                  <li>{deactivateDialog?.nativeName} aus allen hreflang-Tags entfernen</li>
                  <li>{deactivateDialog?.nativeName} aus der Sitemap entfernen</li>
                  <li>Google wird die Änderung in 2-4 Wochen übernehmen</li>
                </ul>
                <span className="text-primary font-medium block">
                  Die Übersetzungen bleiben erhalten und können reaktiviert werden.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeactivate}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Deaktivieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Translate All Dialog */}
      <Dialog open={translateAllDialog} onOpenChange={setTranslateAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Alle Inhalte übersetzen
            </DialogTitle>
            <DialogDescription>
              Dies erstellt Übersetzungsjobs für alle aktiven Sprachen.
              Die Übersetzungen werden im Hintergrund mit DeepL und OpenAI durchgeführt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Aktive Sprachen:</h4>
              <div className="flex flex-wrap gap-2">
                {languages
                  .filter((l) => l.isActive && !l.isDefault)
                  .map((lang) => (
                    <Badge key={lang.id} variant="secondary">
                      {lang.flag} {lang.nativeName}
                    </Badge>
                  ))}
              </div>
              {languages.filter((l) => l.isActive && !l.isDefault).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Keine zusätzlichen Sprachen aktiviert. Aktiviere zuerst mindestens eine Sprache.
                </p>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Die Übersetzung erfolgt Schritt für Schritt im Hintergrund.
                Du kannst den Fortschritt unter "Übersetzungen" verfolgen.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTranslateAllDialog(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleTranslateAll}
              disabled={isSaving || languages.filter((l) => l.isActive && !l.isDefault).length === 0}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Übersetzung starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

