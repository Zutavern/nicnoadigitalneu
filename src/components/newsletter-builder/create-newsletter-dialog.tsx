'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { FilePlus, LayoutTemplate, Loader2, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { NewsletterThumbnail } from './newsletter-thumbnail'
import { 
  NEWSLETTER_TEMPLATES, 
  cloneTemplateBlocks,
  type NewsletterTemplate 
} from '@/lib/newsletter-builder/templates'
import type { NewsletterBranding, NewsletterBlock } from '@/lib/newsletter-builder/types'

interface CreateNewsletterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Default Branding für Thumbnails
const DEFAULT_BRANDING: NewsletterBranding = {
  primaryColor: '#10b981',
  companyName: 'NICNOA',
  websiteUrl: 'https://nicnoa.online',
}

type Step = 'choose' | 'configure'

export function CreateNewsletterDialog({ open, onOpenChange }: CreateNewsletterDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('choose')
  const [selectedTemplate, setSelectedTemplate] = useState<NewsletterTemplate | null>(null)
  const [startEmpty, setStartEmpty] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [branding, setBranding] = useState<NewsletterBranding>(DEFAULT_BRANDING)

  // Branding laden
  const fetchBranding = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/newsletter/base-template')
      if (response.ok) {
        const data = await response.json()
        setBranding({
          logoUrl: data.branding?.emailLogoUrl,
          primaryColor: data.branding?.emailPrimaryColor || '#10b981',
          footerText: data.branding?.emailFooterText,
          companyName: 'NICNOA',
          websiteUrl: 'https://nicnoa.online',
        })
      }
    } catch (error) {
      console.error('Branding fetch error:', error)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchBranding()
    }
  }, [open, fetchBranding])

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('choose')
        setSelectedTemplate(null)
        setStartEmpty(false)
        setName('')
        setSubject('')
      }, 200)
    }
  }, [open])

  const handleSelectTemplate = (template: NewsletterTemplate) => {
    setSelectedTemplate(template)
    setStartEmpty(false)
    setName(template.name)
    setSubject(`${template.name} - Newsletter`)
    setStep('configure')
  }

  const handleStartEmpty = () => {
    setSelectedTemplate(null)
    setStartEmpty(true)
    setName('Neuer Newsletter')
    setSubject('')
    setStep('configure')
  }

  const handleBack = () => {
    setStep('choose')
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Bitte gib einen Namen ein')
      return
    }

    setIsCreating(true)
    try {
      // Blöcke vorbereiten
      let contentBlocks: NewsletterBlock[] = []
      if (selectedTemplate) {
        contentBlocks = cloneTemplateBlocks(selectedTemplate)
      }

      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim() || name.trim(),
          designJson: { contentBlocks },
          segment: 'ALL',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erstellen fehlgeschlagen')
      }

      const { newsletter } = await response.json()
      toast.success('Newsletter erstellt')
      onOpenChange(false)
      router.push(`/admin/marketing/newsletter/${newsletter.id}/edit`)
    } catch (error) {
      console.error('Create error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Erstellen')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'choose' ? 'Neuen Newsletter erstellen' : 'Newsletter konfigurieren'}
          </DialogTitle>
          <DialogDescription>
            {step === 'choose' 
              ? 'Starte mit einem leeren Newsletter oder wähle eine Vorlage'
              : 'Gib deinem Newsletter einen Namen und Betreff'}
          </DialogDescription>
        </DialogHeader>

        {step === 'choose' ? (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 pb-4">
              {/* Leer starten Option */}
              <Card 
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md border-2',
                  startEmpty ? 'border-primary' : 'border-transparent hover:border-muted'
                )}
                onClick={handleStartEmpty}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FilePlus className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Leer starten</h3>
                      <p className="text-sm text-muted-foreground">
                        Beginne mit einem leeren Newsletter und füge deine eigenen Blöcke hinzu
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Templates */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Vorlagen</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {NEWSLETTER_TEMPLATES.map((template) => (
                    <Card
                      key={template.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md border-2 overflow-hidden',
                        selectedTemplate?.id === template.id 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-muted'
                      )}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent className="p-0">
                        {/* Thumbnail */}
                        <div className="relative bg-muted/50 p-3 flex justify-center">
                          <NewsletterThumbnail
                            blocks={template.blocks}
                            branding={branding}
                            className="w-[100px]"
                          />
                          {selectedTemplate?.id === template.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="p-3">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4 py-4">
            {/* Ausgewählte Vorlage anzeigen */}
            {selectedTemplate && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-12">
                  <NewsletterThumbnail
                    blocks={selectedTemplate.blocks}
                    branding={branding}
                    className="w-12"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Vorlage: {selectedTemplate.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  Ändern
                </Button>
              </div>
            )}

            {startEmpty && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FilePlus className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Leerer Newsletter</p>
                  <p className="text-xs text-muted-foreground">Du startest mit einem leeren Editor</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  Ändern
                </Button>
              </div>
            )}

            {/* Name & Subject */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Willkommens-Newsletter Januar"
                />
                <p className="text-xs text-muted-foreground">
                  Interner Name zur Organisation
                </p>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="subject">Betreff</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="z.B. Willkommen bei NICNOA!"
                />
                <p className="text-xs text-muted-foreground">
                  E-Mail-Betreff für Empfänger (kann später geändert werden)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          {step === 'configure' ? (
            <>
              <Button variant="ghost" onClick={handleBack}>
                Zurück
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Newsletter erstellen
              </Button>
            </>
          ) : (
            <>
              <div />
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}



