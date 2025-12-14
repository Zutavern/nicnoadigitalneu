'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  FileImage,
  LayoutTemplate,
  RefreshCw,
  CheckCircle2,
  Building2,
  Sparkles,
  Download,
  Eye,
  Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricelistBackground {
  id: string
  url: string
  filename: string
  sortOrder: number
  isActive: boolean
  type: string
  createdAt: string
}

export default function StylistPricelistPage() {
  const [backgrounds, setBackgrounds] = useState<PricelistBackground[]>([])
  const [source, setSource] = useState<'admin' | 'salon'>('admin')
  const [selectedBackground, setSelectedBackground] = useState<PricelistBackground | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Daten laden
  const fetchBackgrounds = useCallback(async () => {
    try {
      const res = await fetch('/api/pricelist/available-backgrounds')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setBackgrounds(data.backgrounds)
      setSource(data.source)
      
      // Ersten Hintergrund automatisch auswählen
      if (data.backgrounds.length > 0 && !selectedBackground) {
        setSelectedBackground(data.backgrounds[0])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Laden der Hintergründe')
    } finally {
      setIsLoading(false)
    }
  }, [selectedBackground])

  useEffect(() => {
    fetchBackgrounds()
  }, [fetchBackgrounds])

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
            Preislisten
          </h1>
          <p className="text-muted-foreground">
            Erstelle professionelle Preislisten mit schönen Hintergründen
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBackgrounds}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Quelle Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {source === 'salon' ? (
              <>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Salon-Hintergründe</p>
                  <p className="text-sm text-muted-foreground">
                    Dein Salon stellt {backgrounds.length} eigene Hintergründe bereit
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Plattform-Hintergründe</p>
                  <p className="text-sm text-muted-foreground">
                    {backgrounds.length} professionelle Vorlagen verfügbar
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {backgrounds.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Keine Hintergründe verfügbar</p>
            <p className="text-muted-foreground">
              Es sind aktuell keine Preislisten-Hintergründe verfügbar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Hintergrund-Auswahl */}
          <Card>
            <CardHeader>
              <CardTitle>Hintergrund wählen</CardTitle>
              <CardDescription>
                Wähle einen Hintergrund für deine Preisliste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {backgrounds.map((bg, index) => (
                    <motion.div
                      key={bg.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <Card 
                        className={cn(
                          'cursor-pointer overflow-hidden transition-all hover:shadow-lg',
                          selectedBackground?.id === bg.id && 'ring-2 ring-primary ring-offset-2'
                        )}
                        onClick={() => setSelectedBackground(bg)}
                      >
                        <div className="relative aspect-[210/297] bg-muted">
                          <img
                            src={bg.url}
                            alt={bg.filename}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          
                          {selectedBackground?.id === bg.id && (
                            <div className="absolute top-2 right-2">
                              <div className="p-1 rounded-full bg-primary text-primary-foreground shadow-lg">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-2">
                          <p className="text-xs font-medium truncate text-center">
                            {bg.filename}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Vorschau & Aktionen */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vorschau
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBackground ? (
                  <div className="relative">
                    {/* A4 Vorschau mit Schatten */}
                    <div className="relative aspect-[210/297] bg-white rounded-lg overflow-hidden shadow-2xl border">
                      <img
                        src={selectedBackground.url}
                        alt={selectedBackground.filename}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Platzhalter für zukünftige Text-Overlays */}
                      <div className="absolute inset-0 flex flex-col items-center justify-start pt-8 pointer-events-none">
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
                          <p className="text-xs text-muted-foreground font-medium">
                            Preisliste
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Format: A4 Hochformat</span>
                      <Badge variant="outline">
                        {selectedBackground.filename}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[210/297] bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Hintergrund auswählen</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aktionen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Preisliste erstellen
                </CardTitle>
                <CardDescription>
                  Weitere Funktionen kommen bald
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" disabled={!selectedBackground}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Preisliste bearbeiten
                  <Badge variant="secondary" className="ml-2">Bald</Badge>
                </Button>
                <Button variant="outline" className="w-full" disabled={!selectedBackground}>
                  <Download className="h-4 w-4 mr-2" />
                  Als PDF herunterladen
                  <Badge variant="secondary" className="ml-2">Bald</Badge>
                </Button>
              </CardContent>
            </Card>

            {/* Coming Soon Hinweis */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wand2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Demnächst verfügbar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Text-Overlays, Preisgestaltung und PDF-Export werden bald freigeschaltet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

