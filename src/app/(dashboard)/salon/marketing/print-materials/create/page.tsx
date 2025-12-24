'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TemplateSelector } from '@/components/print-materials'
import type { TemplateBlock } from '@/components/print-materials'
import type { PrintMaterialType } from '@prisma/client'
import { ArrowLeft, Printer, Loader2 } from 'lucide-react'

export default function CreatePrintMaterialPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (config: {
    name: string
    type: PrintMaterialType
    templateId: string
    templateBlocks: TemplateBlock[]
  }) => {
    setIsCreating(true)

    try {
      // 1. Material erstellen
      const materialRes = await fetch('/api/print-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          type: config.type,
          templateId: config.templateId,
        }),
      })

      if (!materialRes.ok) {
        throw new Error('Fehler beim Erstellen')
      }

      const { material } = await materialRes.json()

      // 2. Template-Blöcke erstellen
      for (const block of config.templateBlocks) {
        await fetch(`/api/print-materials/${material.id}/blocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(block),
        })
      }

      toast.success('Drucksache erstellt!')
      router.push(`/salon/marketing/print-materials/${material.id}/edit`)
    } catch (error) {
      console.error('Error creating material:', error)
      toast.error('Fehler beim Erstellen der Drucksache')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/salon/marketing/print-materials">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Printer className="h-8 w-8 text-purple-500" />
            Neue Drucksache
          </h1>
          <p className="text-muted-foreground mt-1">
            Wähle ein Format und eine Vorlage für deine neue Drucksache
          </p>
        </div>
      </div>

      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Design auswählen</CardTitle>
          <CardDescription>
            Wähle eine Vorlage als Ausgangspunkt. Du kannst alles später anpassen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Drucksache wird erstellt...</p>
            </div>
          ) : (
            <TemplateSelector onSelect={handleCreate} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

