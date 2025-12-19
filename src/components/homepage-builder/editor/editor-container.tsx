'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Loader2,
  ArrowLeft,
  Sparkles,
  Globe,
  Eye,
  Save,
  ExternalLink,
  RefreshCw,
  Settings,
  Monitor,
  Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { PageList } from './page-list'
import { LivePreview } from './live-preview'

import { STATUS_CONFIGS } from '@/lib/homepage-builder'
import type { HomepageProjectClient, HomepagePage } from '@/lib/homepage-builder'

interface EditorContainerProps {
  project: HomepageProjectClient
  basePath: string
}

export function EditorContainer({ project: initialProject, basePath }: EditorContainerProps) {
  const router = useRouter()
  const [project, setProject] = useState(initialProject)
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(
    (initialProject.pages as HomepagePage[])?.[0]?.slug || null
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPrompting, setIsPrompting] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  
  const pages = project.pages as HomepagePage[]
  const selectedPage = pages.find(p => p.slug === selectedPageSlug)
  const statusConfig = STATUS_CONFIGS[project.status]
  
  const allPagesGenerated = pages.every(p => p.isGenerated)
  const anyPageGenerated = pages.some(p => p.isGenerated)

  // Polling für Generierungsstatus
  useEffect(() => {
    if (project.status !== 'GENERATING') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/homepage/${project.id}`)
        if (res.ok) {
          const { project: updated } = await res.json()
          setProject(updated)
          if (updated.status !== 'GENERATING') {
            clearInterval(interval)
            if (updated.status === 'READY') {
              toast.success('Alle Seiten wurden generiert!')
            } else if (updated.status === 'ERROR') {
              toast.error('Fehler bei der Generierung')
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [project.id, project.status])

  // Generierung starten
  const handleGenerate = useCallback(async (pageSlug?: string) => {
    setIsGenerating(true)
    console.log('=== CLIENT: Starting Generation ===')
    console.log('Project ID:', project.id)
    console.log('Page Slug:', pageSlug || 'ALL')
    
    try {
      const res = await fetch(`/api/homepage/${project.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSlug })
      })

      console.log('Response Status:', res.status)
      console.log('Response OK:', res.ok)

      const responseData = await res.json()
      console.log('Response Data:', responseData)

      if (!res.ok) {
        // Zeige detaillierte Fehlermeldung
        const errorMessage = responseData.details || responseData.error || 'Fehler bei der Generierung'
        console.error('Generation Error:', responseData)
        
        toast.error('V0 Generierungsfehler', {
          description: errorMessage.substring(0, 200),
          duration: 10000
        })
        
        throw new Error(errorMessage)
      }

      // Erfolgsfall: Zeige auch die V0 URLs
      console.log('Generation Success:', responseData)
      
      if (responseData.demoUrl) {
        toast.success('Generierung erfolgreich!', {
          description: 'V0 hat die Seite erstellt.',
          action: {
            label: 'Preview öffnen',
            onClick: () => window.open(responseData.demoUrl, '_blank')
          }
        })
      } else {
        toast.success(pageSlug ? 'Seite wird neu generiert...' : 'Homepage wird generiert...')
      }

      // Projekt neu laden
      const projectRes = await fetch(`/api/homepage/${project.id}`)
      if (projectRes.ok) {
        const { project: updated } = await projectRes.json()
        setProject(updated)
      }
    } catch (error) {
      console.error('=== CLIENT: Generation Error ===')
      console.error('Error:', error)
      
      if (error instanceof Error && !error.message.includes('V0')) {
        toast.error(error.message)
      }
    } finally {
      setIsGenerating(false)
    }
  }, [project.id])

  // Veröffentlichen
  const handlePublish = useCallback(async () => {
    setIsPublishing(true)
    try {
      const res = await fetch(`/api/homepage/${project.id}/publish`, {
        method: 'POST'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Veröffentlichen')
      }

      const { project: updated, publishedUrl } = await res.json()
      setProject(updated)
      setShowPublishDialog(false)
      
      toast.success('Homepage veröffentlicht!', {
        description: publishedUrl,
        action: {
          label: 'Öffnen',
          onClick: () => window.open(publishedUrl, '_blank')
        }
      })
    } catch (error) {
      console.error('Publish error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Veröffentlichen')
    } finally {
      setIsPublishing(false)
    }
  }, [project.id])

  // Prompt senden (direkte Änderungen via V0)
  const handlePrompt = useCallback(async (pageSlug: string, prompt: string) => {
    setIsPrompting(true)
    console.log('=== CLIENT: Sending Prompt ===')
    console.log('Page:', pageSlug)
    console.log('Prompt:', prompt)

    try {
      const res = await fetch(`/api/homepage/${project.id}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSlug, prompt })
      })

      const responseData = await res.json()
      console.log('Prompt Response:', responseData)

      if (!res.ok) {
        throw new Error(responseData.details || responseData.error || 'Fehler beim Prompting')
      }

      // Projekt neu laden
      const projectRes = await fetch(`/api/homepage/${project.id}`)
      if (projectRes.ok) {
        const { project: updated } = await projectRes.json()
        setProject(updated)
      }

      toast.success('Seite aktualisiert!', {
        description: 'Die Änderungen wurden von V0 generiert.'
      })

    } catch (error) {
      console.error('Prompt error:', error)
      toast.error('Fehler beim Aktualisieren', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      })
    } finally {
      setIsPrompting(false)
    }
  }, [project.id])

  // Veröffentlichung aufheben
  const handleUnpublish = useCallback(async () => {
    try {
      const res = await fetch(`/api/homepage/${project.id}/publish`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler')
      }

      const { project: updated } = await res.json()
      setProject(updated)
      toast.success('Veröffentlichung aufgehoben')
    } catch (error) {
      console.error('Unpublish error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler')
    }
  }, [project.id])

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(basePath)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="h-6 w-px bg-border" />
          
          <div>
            <h1 className="font-semibold">{project.name}</h1>
            <p className="text-xs text-muted-foreground">
              {project.slug}.nicnoa.online
            </p>
          </div>
          
          <Badge 
            variant={
              project.status === 'PUBLISHED' ? 'default' :
              project.status === 'READY' ? 'secondary' :
              project.status === 'GENERATING' ? 'outline' :
              project.status === 'ERROR' ? 'destructive' :
              'outline'
            }
            className={cn(
              project.status === 'GENERATING' && "animate-pulse"
            )}
          >
            {project.status === 'GENERATING' && (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            )}
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview-Modus Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          {/* Generieren Button */}
          {!allPagesGenerated && (
            <Button
              onClick={() => handleGenerate()}
              disabled={isGenerating || project.status === 'GENERATING'}
            >
              {isGenerating || project.status === 'GENERATING' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generiert...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {anyPageGenerated ? 'Alle generieren' : 'Homepage generieren'}
                </>
              )}
            </Button>
          )}

          {/* Veröffentlichen Button */}
          {project.isPublished ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(project.publishedUrl || '', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Live ansehen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnpublish}
              >
                Offline nehmen
              </Button>
            </div>
          ) : allPagesGenerated ? (
            <Button
              onClick={() => setShowPublishDialog(true)}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Veröffentlicht...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Veröffentlichen
                </>
              )}
            </Button>
          ) : null}
        </div>
      </header>

      {/* Error Banner */}
      {project.status === 'ERROR' && project.v0Error && (
        <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-3">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <div className="flex-shrink-0 text-destructive">⚠️</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-destructive">V0 Generierungsfehler</p>
              <p className="text-sm text-destructive/80 mt-1 break-all">
                {project.v0Error}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-shrink-0"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
              Erneut versuchen
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar: Seiten-Liste */}
        <aside className="w-64 border-r bg-muted/30 flex flex-col min-h-0 overflow-hidden">
          <PageList
            pages={pages}
            selectedSlug={selectedPageSlug}
            onSelect={setSelectedPageSlug}
            onRegenerate={(slug) => handleGenerate(slug)}
            isGenerating={isGenerating || project.status === 'GENERATING'}
          />
        </aside>

        {/* Preview - Begrenzt auf verfügbaren Platz mit Rand */}
        <main className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-3 min-h-0 flex flex-col overflow-hidden">
          <LivePreview
            page={selectedPage}
            project={project}
            previewMode={previewMode}
            onRegenerate={(slug) => handleGenerate(slug)}
            onPrompt={handlePrompt}
            isPrompting={isPrompting}
          />
        </main>
      </div>

      {/* Publish Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Homepage veröffentlichen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deine Homepage wird unter folgender Adresse erreichbar sein:
              <br />
              <strong className="text-foreground">
                https://{project.slug}.nicnoa.online
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird veröffentlicht...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Veröffentlichen
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

