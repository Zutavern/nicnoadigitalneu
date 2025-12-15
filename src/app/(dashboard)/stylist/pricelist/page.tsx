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
  Loader2,
  Plus,
  LayoutTemplate,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  FileDown,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import type { PriceListClient } from '@/lib/pricelist/types'
import { PRICING_MODEL_CONFIGS } from '@/lib/pricelist/types'
import { PriceListPreview } from '@/components/pricelist'

export default function StylistPricelistPage() {
  const [priceLists, setPriceLists] = useState<PriceListClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPriceLists = useCallback(async () => {
    try {
      const res = await fetch('/api/pricelist')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setPriceLists(data.priceLists)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Laden der Preislisten')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPriceLists()
  }, [fetchPriceLists])

  const handleDelete = async () => {
    if (!deleteId) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/pricelist/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Fehler beim Löschen')
      
      setPriceLists(prev => prev.filter(p => p.id !== deleteId))
      toast.success('Preisliste gelöscht')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Löschen')
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
            <LayoutTemplate className="h-6 w-6 text-primary" />
            Preislisten
          </h1>
          <p className="text-muted-foreground">
            Erstelle und verwalte professionelle Preislisten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPriceLists}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Link href="/stylist/pricelist/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neue Preisliste
            </Button>
          </Link>
        </div>
      </div>

      {/* Liste */}
      {priceLists.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <LayoutTemplate className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Keine Preislisten vorhanden</p>
            <p className="text-muted-foreground mb-6">
              Erstelle deine erste Preisliste mit unserem Block-Editor
            </p>
            <Link href="/stylist/pricelist/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Preisliste erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {priceLists.map((priceList, index) => {
              const modelConfig = PRICING_MODEL_CONFIGS[priceList.pricingModel]
              return (
                <motion.div
                  key={priceList.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="group hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {priceList.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {modelConfig.label}
                            </Badge>
                            {priceList.isPublished && (
                              <Badge className="text-xs bg-green-500">
                                Veröffentlicht
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/stylist/pricelist/${priceList.id}/edit`}>
                              <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem disabled>
                              <Eye className="h-4 w-4 mr-2" />
                              Vorschau
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                              <FileDown className="h-4 w-4 mr-2" />
                              PDF exportieren
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(priceList.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      {/* Vorschau mit schönem Container */}
                      <Link href={`/stylist/pricelist/${priceList.id}/edit`}>
                        <div className="group/preview relative bg-muted/50 rounded-xl p-4 mb-3 cursor-pointer transition-all hover:shadow-lg hover:bg-muted/70">
                          {/* Preview Container mit Schatten */}
                          <div className="relative flex justify-center">
                            <div 
                              className="transition-transform group-hover/preview:scale-[1.02]"
                              style={{
                                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.12)) drop-shadow(0 3px 8px rgba(0,0,0,0.08))',
                              }}
                            >
                              <PriceListPreview
                                priceList={priceList}
                                blocks={priceList.blocks || []}
                                scale={0.22}
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
                      
                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(priceList.updatedAt), {
                            addSuffix: true,
                            locale: de,
                          })}
                        </span>
                        <span>{priceList.blocks?.length || 0} Blöcke</span>
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
            <AlertDialogTitle>Preisliste löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Preisliste und alle
              Inhalte werden permanent gelöscht.
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
    </div>
  )
}
