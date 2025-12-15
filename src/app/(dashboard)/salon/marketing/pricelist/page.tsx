'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Upload,
  Loader2,
  Trash2,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FileImage,
  LayoutTemplate,
  RefreshCw,
  Building2,
  Sparkles,
  Crown,
  Users,
  ArrowRight,
  Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface PricelistBackground {
  id: string
  url: string
  filename: string
  sortOrder: number
  isActive: boolean
  type: string
  createdAt: string
}

export default function SalonPricelistPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [salonBackgrounds, setSalonBackgrounds] = useState<PricelistBackground[]>([])
  const [adminBackgrounds, setAdminBackgrounds] = useState<PricelistBackground[]>([])
  const [salonActiveCount, setSalonActiveCount] = useState(0)
  const [hasOwnBackgrounds, setHasOwnBackgrounds] = useState(false)
  const [hasSalonProfile, setHasSalonProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PricelistBackground | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'own' | 'admin'>('admin')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_ACTIVE = 6
  
  // Demo-Modus: Onboarding nicht abgeschlossen ODER kein Salon-Profil vorhanden
  // Das Banner wird angezeigt für Nutzer, die noch nicht als zahlende Kunden aktiv sind
  const isDemoMode = !isLoading && (
    (session?.user && !session.user.onboardingCompleted) || 
    !hasSalonProfile
  )

  // Daten laden
  const fetchBackgrounds = useCallback(async () => {
    try {
      const res = await fetch('/api/salon/pricelist-backgrounds')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setSalonBackgrounds(data.salonBackgrounds || [])
      setAdminBackgrounds(data.adminBackgrounds || [])
      setSalonActiveCount(data.salonActiveCount || 0)
      setHasOwnBackgrounds(data.hasOwnBackgrounds || false)
      setHasSalonProfile(data.hasSalonProfile || false)
      
      // Setze Tab basierend auf vorhandenen eigenen Hintergründen
      if (data.hasOwnBackgrounds) {
        setActiveTab('own')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Laden der Hintergründe')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBackgrounds()
  }, [fetchBackgrounds])

  // Drag & Drop Handler
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(f => 
      ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type)
    )
    
    if (imageFiles.length === 0) {
      toast.error('Bitte nur Bilddateien (PNG, JPG, WebP) hochladen')
      return
    }

    for (const file of imageFiles) {
      await uploadFile(file)
    }
  }, [])

  // File Upload
  const uploadFile = async (file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Nur PNG, JPG und WebP Dateien erlaubt')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Datei darf maximal 5MB groß sein')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 100)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/salon/pricelist-backgrounds', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload fehlgeschlagen')
      }

      toast.success(`"${file.name}" erfolgreich hochgeladen`)
      await fetchBackgrounds()
      setActiveTab('own')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Hochladen')
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => uploadFile(file))
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Toggle Aktivierung
  const toggleActive = async (bg: PricelistBackground) => {
    if (!bg.isActive && salonActiveCount >= MAX_ACTIVE) {
      toast.error(`Maximal ${MAX_ACTIVE} Hintergründe können gleichzeitig aktiv sein`)
      return
    }

    setTogglingId(bg.id)

    try {
      const res = await fetch(`/api/salon/pricelist-backgrounds/${bg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !bg.isActive }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler')
      }

      await fetchBackgrounds()
      toast.success(bg.isActive ? 'Hintergrund deaktiviert' : 'Hintergrund aktiviert')
    } catch (error) {
      console.error('Toggle error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Ändern')
    } finally {
      setTogglingId(null)
    }
  }

  // Löschen
  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      const res = await fetch(`/api/salon/pricelist-backgrounds/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler')
      }

      toast.success('Hintergrund gelöscht')
      await fetchBackgrounds()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setDeleteTarget(null)
    }
  }

  // Ermittle aktuell verwendete Hintergründe
  const effectiveBackgrounds = salonActiveCount > 0 
    ? salonBackgrounds.filter(bg => bg.isActive) 
    : adminBackgrounds

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
            <LayoutTemplate className="h-6 w-6 text-primary" />
            Preislisten-Hintergründe
          </h1>
          <p className="text-muted-foreground">
            Verwalte die Hintergrund-Templates für deine Preislisten
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBackgrounds}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Demo-Modus Banner */}
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <CardContent className="relative py-10 px-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Icon & Badge */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                      <Palette className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-amber-500 text-white border-0 shadow-md">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Eigene Preislisten-Designs für deinen Salon
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                      Als <span className="font-semibold text-primary">nicnoa.online Salonbetreiber-Kunde</span> kannst du 
                      eigene Hintergrund-Templates hochladen. Alle Stuhlmieter in deinem Salon nutzen dann 
                      automatisch dein Corporate Design für ihre Preislisten – <span className="italic">einheitlich & professionell</span>.
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Bis zu 6 eigene Designs</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Für alle Stuhlmieter</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Building2 className="h-4 w-4 text-purple-500" />
                      <span>Einheitliches Branding</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 gap-2"
                      onClick={() => router.push('/salon/upgrade')}
                    >
                      <Crown className="h-5 w-5" />
                      Jetzt Stühle vermieten
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Schalte alle Funktionen frei und starte mit der Stuhlvermietung
                    </p>
                  </div>
                </div>

                {/* Preview Mockup */}
                <div className="hidden xl:block flex-shrink-0">
                  <div className="relative">
                    {/* Stacked preview cards */}
                    <div className="absolute -left-4 -top-2 w-32 aspect-[210/297] rounded-lg bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-800/20 shadow-lg border opacity-60 transform -rotate-6" />
                    <div className="absolute -right-2 -top-1 w-32 aspect-[210/297] rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 shadow-lg border opacity-80 transform rotate-3" />
                    <div className="relative w-32 aspect-[210/297] rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 shadow-xl border-2 border-primary/30 flex items-center justify-center">
                      <div className="text-center p-4">
                        <FileImage className="h-8 w-8 mx-auto text-primary/50 mb-2" />
                        <p className="text-[10px] text-muted-foreground">Dein Design</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Aktuell verwendete Hintergründe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Aktuell verfügbare Hintergründe
          </CardTitle>
          <CardDescription>
            {salonActiveCount > 0 
              ? 'Deine eigenen Hintergründe werden für Stuhlmieter angezeigt'
              : 'Die Standard-Hintergründe der Plattform werden verwendet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {effectiveBackgrounds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileImage className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Keine aktiven Hintergründe verfügbar</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {effectiveBackgrounds.slice(0, 6).map((bg) => (
                <div 
                  key={bg.id} 
                  className="relative aspect-[210/297] rounded-lg overflow-hidden border bg-muted shadow-sm"
                >
                  <img
                    src={bg.url}
                    alt={bg.filename}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs für Admin/Eigene */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'own' | 'admin')}>
        <TabsList className={cn("grid w-full", isDemoMode ? "grid-cols-1" : "grid-cols-2")}>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Plattform-Vorlagen ({adminBackgrounds.length})
          </TabsTrigger>
          {!isDemoMode && (
            <TabsTrigger value="own" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Eigene Hintergründe ({salonBackgrounds.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Plattform-Vorlagen (nur Ansicht) */}
        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plattform-Hintergründe</CardTitle>
              <CardDescription>
                Diese Hintergründe werden standardmäßig für deine Stuhlmieter angezeigt, 
                solange du keine eigenen aktiviert hast.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adminBackgrounds.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileImage className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Keine Plattform-Hintergründe verfügbar</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {adminBackgrounds.map((bg) => (
                    <Card key={bg.id} className="overflow-hidden">
                      <div className="relative aspect-[210/297] bg-muted">
                        <img
                          src={bg.url}
                          alt={bg.filename}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium truncate">{bg.filename}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eigene Hintergründe - nur für Nicht-Demo-Nutzer */}
        {!isDemoMode && (
        <TabsContent value="own" className="space-y-4">
          {/* Status */}
          {salonBackgrounds.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileImage className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Aktive eigene Hintergründe</p>
                      <p className="text-sm text-muted-foreground">
                        {salonActiveCount} von {MAX_ACTIVE} aktiv
                      </p>
                    </div>
                  </div>
                  <div className="w-32">
                    <Progress value={(salonActiveCount / MAX_ACTIVE) * 100} className="h-2" />
                  </div>
                </div>
                {salonActiveCount > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Deine eigenen Hintergründe werden für Stuhlmieter angezeigt</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upload-Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Card
            className={cn(
              'cursor-pointer border-2 border-dashed transition-all',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
            )}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              {isUploading ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <div className="w-full">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">Wird hochgeladen...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {isDragging ? (
                      <Upload className="h-7 w-7 text-primary animate-bounce" />
                    ) : (
                      <ImageIcon className="h-7 w-7 text-primary" />
                    )}
                  </div>
                  <p className="font-medium text-lg mb-1">
                    {isDragging ? 'Dateien hier ablegen' : 'Eigene Hintergründe hochladen'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PNG, JPG oder WebP • Max. 5MB • A4 Hochformat empfohlen
                  </p>
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Dateien auswählen
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Grid eigene Hintergründe */}
          {salonBackgrounds.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {salonBackgrounds.map((bg, index) => (
                  <motion.div
                    key={bg.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className={cn(
                      'group relative overflow-hidden transition-all',
                      bg.isActive && 'ring-2 ring-primary ring-offset-2'
                    )}>
                      {/* A4 Vorschau */}
                      <div className="relative aspect-[210/297] bg-muted">
                        <img
                          src={bg.url}
                          alt={bg.filename}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        
                        {bg.isActive && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-primary text-primary-foreground shadow-lg">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Aktiv
                            </Badge>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setDeleteTarget(bg)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={bg.filename}>
                              {bg.filename}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(bg.createdAt), { addSuffix: true, locale: de })}
                            </p>
                          </div>
                          <Switch
                            checked={bg.isActive}
                            onCheckedChange={() => toggleActive(bg)}
                            disabled={togglingId === bg.id || (!bg.isActive && salonActiveCount >= MAX_ACTIVE)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        )}
        </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hintergrund löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du &quot;{deleteTarget?.filename}&quot; wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

