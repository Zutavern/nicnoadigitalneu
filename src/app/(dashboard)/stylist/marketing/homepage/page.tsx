'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2,
  Plus,
  Globe,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  Clock,
  Sparkles,
  Rocket,
  Settings,
  Link2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { HomepageThumbnail } from '@/components/homepage-builder/homepage-thumbnail'
import { GoLiveDialog } from '@/components/homepage-builder/go-live-dialog'
import { MAX_PROJECTS_PER_USER, TEMPLATE_CONFIGS, DESIGN_STYLE_CONFIGS } from '@/lib/homepage-builder'
import type { HomepageProjectClient, HomepagePage } from '@/lib/homepage-builder'

export default function StylistHomepagePage() {
  const [projects, setProjects] = useState<HomepageProjectClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewProject, setPreviewProject] = useState<HomepageProjectClient | null>(null)
  const [canCreate, setCanCreate] = useState(true)
  const [goLiveProject, setGoLiveProject] = useState<HomepageProjectClient | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/homepage')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setProjects(data.projects)
      setCanCreate(data.canCreate)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Laden der Projekte')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleDelete = async () => {
    if (!deleteId) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/homepage/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Fehler beim Löschen')
      }
      
      setProjects(prev => prev.filter(p => p.id !== deleteId))
      toast.success('Projekt gelöscht')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Meine Homepages
          </h1>
          <p className="text-muted-foreground">
            Erstelle und verwalte deine professionellen Websites mit KI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProjects}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          {canCreate ? (
            <Link href="/stylist/marketing/homepage/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neue Homepage
              </Button>
            </Link>
          ) : (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Maximum erreicht ({MAX_PROJECTS_PER_USER})
            </Button>
          )}
        </div>
      </div>

      {/* Projekte-Zähler */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{projects.length} von {MAX_PROJECTS_PER_USER} Projekten verwendet</span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${(projects.length / MAX_PROJECTS_PER_USER) * 100}%` }}
          />
        </div>
      </div>

      {/* Liste */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="relative inline-block mb-6">
              <Globe className="h-16 w-16 text-muted-foreground/30" />
              <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1" />
            </div>
            <p className="text-lg font-medium mb-2">Noch keine Homepage erstellt</p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Erstelle deine professionelle Website in wenigen Minuten. 
              Unser KI-Assistent hilft dir dabei.
            </p>
            <Link href="/stylist/marketing/homepage/create">
              <Button size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Jetzt neue Homepage erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => {
              const templateConfig = TEMPLATE_CONFIGS[project.templateType]
              const designConfig = DESIGN_STYLE_CONFIGS[project.designStyle]
              const pages = project.pages as HomepagePage[]
              const isReady = project.status === 'READY' || project.status === 'GENERATED'
              // TODO: customDomain sollte aus dem Projekt kommen wenn implementiert
              const connectedDomain = project.publishedUrl && !project.publishedUrl.includes('nicnoa.online') 
                ? project.publishedUrl.replace('https://', '') 
                : null
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="group hover:shadow-lg transition-all overflow-hidden flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate flex items-center gap-2">
                            {project.name}
                            {project.isPublished && (
                              <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600">
                                <Globe className="h-3 w-3 mr-1" />
                                Live
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {templateConfig?.label || project.templateType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {designConfig?.label || project.designStyle}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {pages.length} Seiten
                            </Badge>
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/stylist/marketing/homepage/${project.id}/edit`}>
                              <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => setPreviewProject(project)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Vorschau
                            </DropdownMenuItem>
                            {project.isPublished && project.publishedUrl && (
                              <DropdownMenuItem asChild>
                                <a href={project.publishedUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Website öffnen
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(project.id)}
                              disabled={project.isPublished}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      {/* Vorschau */}
                      <Link href={`/stylist/marketing/homepage/${project.id}/edit`}>
                        <div className="group/preview relative bg-muted/50 rounded-xl p-4 mb-3 cursor-pointer transition-all hover:shadow-lg hover:bg-muted/70">
                          <div className="relative flex justify-center">
                            <div 
                              className="transition-transform group-hover/preview:scale-[1.02]"
                              style={{
                                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.12)) drop-shadow(0 3px 8px rgba(0,0,0,0.08))',
                              }}
                            >
                              <HomepageThumbnail
                                project={project}
                                scale={0.25}
                              />
                            </div>
                          </div>
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                            <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                              <Pencil className="h-3.5 w-3.5 inline mr-1.5" />
                              Bearbeiten
                            </div>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Domain Info oder Live nehmen Button */}
                      {project.isPublished ? (
                        <div className="mt-auto">
                          {connectedDomain ? (
                            // Custom Domain verbunden
                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <div className="flex items-center gap-2 text-sm">
                                <Link2 className="h-4 w-4 text-emerald-600" />
                                <span className="font-medium text-emerald-700 dark:text-emerald-300 truncate">
                                  {connectedDomain}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setGoLiveProject(project)}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Bearbeiten
                              </Button>
                            </div>
                          ) : (
                            // Subdomain (kostenlos)
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Globe className="h-4 w-4" />
                                <span className="truncate">{project.slug}.nicnoa.online</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setGoLiveProject(project)}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Domain
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : isReady ? (
                        // Nicht veröffentlicht aber bereit - Aktion Button
                        <Button
                          className="mt-auto w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                          onClick={() => setGoLiveProject(project)}
                        >
                          <Rocket className="h-4 w-4 mr-2" />
                          Homepage live nehmen
                        </Button>
                      ) : null}
                      
                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(project.updatedAt), {
                            addSuffix: true,
                            locale: de,
                          })}
                        </span>
                        {project.publishedUrl && (
                          <a 
                            href={project.publishedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Öffnen
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Homepage löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Das Projekt und alle
              generierten Seiten werden permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewProject} onOpenChange={(open) => !open && setPreviewProject(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-lg">
              {previewProject?.name || 'Vorschau'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto bg-muted/30 p-6 flex items-start justify-center">
            {previewProject && (
              <div
                style={{
                  filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.15)) drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
                }}
              >
                <HomepageThumbnail
                  project={previewProject}
                  scale={0.8}
                />
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t flex-shrink-0 flex items-center justify-between bg-background">
            <div className="text-sm text-muted-foreground">
              {(previewProject?.pages as HomepagePage[])?.length || 0} Seiten • {DESIGN_STYLE_CONFIGS[previewProject?.designStyle || 'MODERN']?.label || 'Modern'}
            </div>
            <div className="flex gap-2">
              {previewProject && !previewProject.isPublished && (previewProject.status === 'READY' || previewProject.status === 'GENERATED') && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setPreviewProject(null)
                    setGoLiveProject(previewProject)
                  }}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Live nehmen
                </Button>
              )}
              <Link href={`/stylist/marketing/homepage/${previewProject?.id}/edit`}>
                <Button>
                  <Pencil className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Go Live Dialog */}
      <GoLiveDialog
        open={!!goLiveProject}
        onOpenChange={(open) => !open && setGoLiveProject(null)}
        projectId={goLiveProject?.id || ''}
        projectName={goLiveProject?.name || ''}
        projectSlug={goLiveProject?.slug || ''}
        connectedDomain={goLiveProject?.publishedUrl && !goLiveProject.publishedUrl.includes('nicnoa.online') 
          ? goLiveProject.publishedUrl.replace('https://', '') 
          : null}
        isPublished={goLiveProject?.isPublished}
        onSuccess={fetchProjects}
      />
    </div>
  )
}
