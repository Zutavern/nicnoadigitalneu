'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { cn } from '@/lib/utils'
import { MATERIAL_TYPE_CONFIGS, THEME_CONFIGS } from '@/lib/print-materials/types'
import type { PrintMaterialClient } from '@/lib/print-materials/types'
import {
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Download,
  CreditCard,
  Printer,
  FileText,
  Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function PrintMaterialsPage() {
  const router = useRouter()
  const [materials, setMaterials] = useState<PrintMaterialClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null)

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/print-materials')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setMaterials(data.materials)
    } catch (error) {
      toast.error('Fehler beim Laden der Drucksachen')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleDelete = async () => {
    if (!materialToDelete) return

    try {
      const res = await fetch(`/api/print-materials/${materialToDelete}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Fehler beim Löschen')

      setMaterials(prev => prev.filter(m => m.id !== materialToDelete))
      toast.success('Drucksache gelöscht')
    } catch (error) {
      toast.error('Fehler beim Löschen')
    } finally {
      setDeleteDialogOpen(false)
      setMaterialToDelete(null)
    }
  }

  const handleDuplicate = async (id: string) => {
    const material = materials.find(m => m.id === id)
    if (!material) return

    try {
      const res = await fetch('/api/print-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${material.name} (Kopie)`,
          type: material.type,
          width: material.width,
          height: material.height,
          bleed: material.bleed,
          theme: material.theme,
          fontFamily: material.fontFamily,
          primaryColor: material.primaryColor,
          secondaryColor: material.secondaryColor,
          backgroundColor: material.backgroundColor,
          frontBackgroundUrl: material.frontBackgroundUrl,
          backBackgroundUrl: material.backBackgroundUrl,
        }),
      })

      if (!res.ok) throw new Error('Fehler beim Duplizieren')

      const data = await res.json()

      // Blöcke kopieren
      for (const block of material.blocks) {
        await fetch(`/api/print-materials/${data.material.id}/blocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...block,
            id: undefined,
            printMaterialId: undefined,
            createdAt: undefined,
            updatedAt: undefined,
          }),
        })
      }

      toast.success('Drucksache dupliziert')
      fetchMaterials()
    } catch (error) {
      toast.error('Fehler beim Duplizieren')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Printer className="h-8 w-8 text-purple-500" />
            Drucksachen
          </h1>
          <p className="text-muted-foreground mt-1">
            Erstelle professionelle Visitenkarten, Flyer und mehr
          </p>
        </div>
        <Link href="/stylist/marketing/print-materials/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Drucksache
          </Button>
        </Link>
      </div>

      {/* Statistiken */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gesamt</CardDescription>
            <CardTitle className="text-3xl">{materials.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visitenkarten</CardDescription>
            <CardTitle className="text-3xl">
              {materials.filter(m => m.type === 'BUSINESS_CARD' || m.type === 'BUSINESS_CARD_SQUARE').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Flyer</CardDescription>
            <CardTitle className="text-3xl">
              {materials.filter(m => m.type === 'FLYER_A5' || m.type === 'FLYER_A6').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Material-Liste */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Printer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Drucksachen vorhanden</h3>
            <p className="text-muted-foreground mb-4">
              Erstelle deine erste Visitenkarte oder Flyer
            </p>
            <Link href="/stylist/marketing/print-materials/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Erste Drucksache erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => {
            const typeConfig = MATERIAL_TYPE_CONFIGS[material.type]
            const theme = THEME_CONFIGS.find(t => t.id === material.theme)

            return (
              <Card key={material.id} className="group overflow-hidden">
                {/* Preview */}
                <div
                  className="h-40 flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ background: theme?.preview || '#f5f5f5' }}
                >
                  <div className="flex gap-2">
                    <div
                      className="rounded shadow-lg"
                      style={{
                        width: material.width * 1.5,
                        height: material.height * 1.5,
                        backgroundColor: material.backgroundColor,
                      }}
                    />
                    <div
                      className="rounded shadow-lg"
                      style={{
                        width: material.width * 1.5,
                        height: material.height * 1.5,
                        backgroundColor: material.backgroundColor,
                      }}
                    />
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{material.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {typeConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {material.width} × {material.height} mm
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Bearbeitet: {format(new Date(material.updatedAt), 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/stylist/marketing/print-materials/${material.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(material.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Als PDF exportieren
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setMaterialToDelete(material.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/stylist/marketing/print-materials/${material.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Drucksache löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Drucksache wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

