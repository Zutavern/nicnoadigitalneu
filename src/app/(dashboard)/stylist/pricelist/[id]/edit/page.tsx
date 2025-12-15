'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Loader2,
  ArrowLeft,
  Save,
  FileDown,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlockEditor, PreviewViewer, ThemeSelector } from '@/components/pricelist'
import type { PriceListClient, PriceBlockClient } from '@/lib/pricelist/types'

export default function EditPricelistPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [priceList, setPriceList] = useState<PriceListClient | null>(null)
  const [blocks, setBlocks] = useState<PriceBlockClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  // Daten laden
  const fetchPriceList = useCallback(async () => {
    try {
      const res = await fetch(`/api/pricelist/${id}`)
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Preisliste nicht gefunden')
          router.push('/stylist/pricelist')
          return
        }
        throw new Error('Fehler beim Laden')
      }
      const data = await res.json()
      setPriceList(data.priceList)
      setBlocks(data.priceList.blocks)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Laden der Preisliste')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchPriceList()
  }, [fetchPriceList])

  // Name ändern
  const handleNameChange = (name: string) => {
    if (!priceList) return
    setPriceList({ ...priceList, name })
    setHasChanges(true)
  }

  // Theme/Font ändern
  const handleThemeChange = (theme: string) => {
    if (!priceList) return
    setPriceList({ ...priceList, theme })
    setHasChanges(true)
  }

  const handleFontChange = (fontFamily: string) => {
    if (!priceList) return
    setPriceList({ ...priceList, fontFamily })
    setHasChanges(true)
  }

  // Blöcke ändern
  const handleBlocksChange = (newBlocks: PriceBlockClient[]) => {
    setBlocks(newBlocks)
    setHasChanges(true)
  }

  // Block speichern
  const handleBlockSave = async (block: PriceBlockClient) => {
    try {
      // Alle Block-Daten für API vorbereiten
      const blockData = {
        type: block.type,
        sortOrder: block.sortOrder,
        // Container-Blöcke
        parentBlockId: block.parentBlockId,
        columnIndex: block.columnIndex,
        columnWidths: block.columnWidths,
        // Section Header
        title: block.title,
        subtitle: block.subtitle,
        // Price Item
        itemName: block.itemName,
        description: block.description,
        priceType: block.priceType,
        price: block.price,
        priceMax: block.priceMax,
        priceText: block.priceText,
        qualifier: block.qualifier,
        // Text / Info Box / Quote
        content: block.content,
        // Image / Logo
        imageUrl: block.imageUrl,
        // Spacer
        spacerSize: block.spacerSize,
        // Badge
        badgeText: block.badgeText,
        badgeStyle: block.badgeStyle,
        badgeColor: block.badgeColor,
        // Icon Text
        iconName: block.iconName,
        // Contact Info
        phone: block.phone,
        email: block.email,
        address: block.address,
        website: block.website,
        // Social Links
        socialLinks: block.socialLinks,
        // QR Code
        qrCodeUrl: block.qrCodeUrl,
        qrCodeLabel: block.qrCodeLabel,
        // Footer
        footerText: block.footerText,
        // Text Alignment
        textAlign: block.textAlign,
        // Varianten
        variants: block.variants?.map(v => ({
          label: v.label,
          price: v.price,
          sortOrder: v.sortOrder,
        })) || [],
      }

      if (block.isNew) {
        // Neuen Block erstellen
        const res = await fetch(`/api/pricelist/${id}/blocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blockData),
        })

        if (!res.ok) throw new Error('Fehler beim Speichern')
        const { block: savedBlock } = await res.json()

        // Block in Liste aktualisieren
        setBlocks(prev =>
          prev.map(b => (b.id === block.id ? { ...savedBlock, isNew: false } : b))
        )
      } else {
        // Existierenden Block aktualisieren
        const res = await fetch(`/api/pricelist/${id}/blocks/${block.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blockData),
        })

        if (!res.ok) throw new Error('Fehler beim Speichern')
        const { block: savedBlock } = await res.json()

        setBlocks(prev => prev.map(b => (b.id === block.id ? savedBlock : b)))
      }

      toast.success('Block gespeichert')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Speichern')
    }
  }

  // Block löschen
  const handleBlockDelete = async (blockId: string) => {
    try {
      const res = await fetch(`/api/pricelist/${id}/blocks/${blockId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Fehler beim Löschen')

      setBlocks(prev =>
        prev
          .filter(b => b.id !== blockId)
          .map((b, i) => ({ ...b, sortOrder: i }))
      )
      toast.success('Block gelöscht')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  // Blöcke neu sortieren
  const handleBlocksReorder = async (reorderedBlocks: { id: string; sortOrder: number }[]) => {
    try {
      const res = await fetch(`/api/pricelist/${id}/blocks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: reorderedBlocks }),
      })

      if (!res.ok) throw new Error('Fehler beim Sortieren')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Sortieren')
    }
  }

  // Preisliste speichern (inkl. aller neuen Blöcke)
  const handleSave = async () => {
    if (!priceList) return

    setIsSaving(true)
    try {
      // Alle neuen Blöcke zuerst speichern
      const newBlocks = blocks.filter(b => b.isNew)
      
      for (const block of newBlocks) {
        const blockData = {
          type: block.type,
          sortOrder: block.sortOrder,
          parentBlockId: block.parentBlockId,
          columnIndex: block.columnIndex,
          columnWidths: block.columnWidths,
          title: block.title,
          subtitle: block.subtitle,
          itemName: block.itemName,
          description: block.description,
          priceType: block.priceType,
          price: block.price,
          priceMax: block.priceMax,
          priceText: block.priceText,
          qualifier: block.qualifier,
          content: block.content,
          imageUrl: block.imageUrl,
          spacerSize: block.spacerSize,
          badgeText: block.badgeText,
          badgeStyle: block.badgeStyle,
          badgeColor: block.badgeColor,
          iconName: block.iconName,
          phone: block.phone,
          email: block.email,
          address: block.address,
          website: block.website,
          socialLinks: block.socialLinks,
          qrCodeUrl: block.qrCodeUrl,
          qrCodeLabel: block.qrCodeLabel,
          footerText: block.footerText,
          textAlign: block.textAlign,
          variants: block.variants?.map(v => ({
            label: v.label,
            price: v.price,
            sortOrder: v.sortOrder,
          })) || [],
        }

        const res = await fetch(`/api/pricelist/${id}/blocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blockData),
        })

        if (!res.ok) throw new Error('Fehler beim Speichern der Blöcke')
      }

      // Preisliste speichern
      const res = await fetch(`/api/pricelist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: priceList.name,
          theme: priceList.theme,
          fontFamily: priceList.fontFamily,
          showLogo: priceList.showLogo,
          showContact: priceList.showContact,
          columns: priceList.columns,
        }),
      })

      if (!res.ok) throw new Error('Fehler beim Speichern')

      // Nach dem Speichern: Blöcke neu laden um korrekte IDs zu bekommen
      const refreshRes = await fetch(`/api/pricelist/${id}`)
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        setBlocks(data.priceList.blocks)
      }

      toast.success('Preisliste gespeichert')
      setHasChanges(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  // Hintergrundbild zu Base64 konvertieren
  const imageToBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  // PDF Export (Server-Side mit Puppeteer)
  const handleExport = async () => {
    if (!priceList) return

    setIsExporting(true)
    try {
      // Hintergrundbild zu Base64 konvertieren falls vorhanden
      let backgroundBase64: string | undefined
      if (priceList.backgroundUrl) {
        const base64 = await imageToBase64(priceList.backgroundUrl)
        if (base64) {
          backgroundBase64 = base64
        }
      }

      // Server-Side PDF-Generierung aufrufen
      const response = await fetch('/api/pricelist/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceList,
          blocks,
          backgroundBase64,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'PDF-Generierung fehlgeschlagen')
      }

      // PDF-Blob erstellen und herunterladen
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${priceList.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF exportiert!')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Export')
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading || !priceList) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <Link href="/stylist/pricelist">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Input
            value={priceList.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="font-semibold text-lg border-none shadow-none focus-visible:ring-0 w-auto"
            placeholder="Preislisten-Name"
          />
          {hasChanges && (
            <span className="text-xs text-muted-foreground">Ungespeicherte Änderungen</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau'}
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Design
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Design-Einstellungen</SheetTitle>
                <SheetDescription>
                  Passe das Aussehen deiner Preisliste an
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ThemeSelector
                  selectedTheme={priceList.theme}
                  selectedFont={priceList.fontFamily}
                  onThemeChange={handleThemeChange}
                  onFontChange={handleFontChange}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            PDF
          </Button>

          <Button size="sm" onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Speichern
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={cn('flex-1 border-r', showPreview && 'max-w-[50%]')}>
          <BlockEditor
            priceList={priceList}
            blocks={blocks}
            onBlocksChange={handleBlocksChange}
            onBlockSave={handleBlockSave}
            onBlockDelete={handleBlockDelete}
            onBlocksReorder={handleBlocksReorder}
          />
        </div>

        {/* Preview mit Zoom & Pan */}
        {showPreview && (
          <div className="flex-1 overflow-hidden">
            <PreviewViewer
              priceList={priceList}
              blocks={blocks}
            />
          </div>
        )}
      </div>
    </div>
  )
}


