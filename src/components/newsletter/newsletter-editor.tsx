'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Save, 
  Send, 
  Eye, 
  TestTube, 
  Loader2,
  ArrowLeft 
} from 'lucide-react'
import { toast } from 'sonner'
import type { EditorRef, EmailEditorProps } from 'react-email-editor'

// Newsletter Segment enum (matching Prisma schema)
type NewsletterSegment = 'ALL' | 'STYLISTS' | 'SALON_OWNERS' | 'CUSTOM'

// Dynamic import für react-email-editor (nur Client-Side)
const EmailEditor = dynamic(() => import('react-email-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-muted/30 rounded-lg">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Editor wird geladen...</p>
      </div>
    </div>
  )
})

interface NewsletterEditorProps {
  newsletterId?: string
  initialData?: {
    name: string
    subject: string
    preheader?: string
    designJson?: object
    segment: NewsletterSegment
  }
  onSave?: (data: { designJson: object; htmlContent: string }) => Promise<void>
  onBack?: () => void
}

const segmentLabels: Record<NewsletterSegment, string> = {
  ALL: 'Alle Nutzer',
  STYLISTS: 'Nur Stuhlmieter',
  SALON_OWNERS: 'Nur Salonbesitzer',
  CUSTOM: 'Benutzerdefiniert'
}

export function NewsletterEditor({ 
  newsletterId,
  initialData,
  onSave,
  onBack 
}: NewsletterEditorProps) {
  const emailEditorRef = useRef<EditorRef | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  
  // Form State
  const [name, setName] = useState(initialData?.name || '')
  const [subject, setSubject] = useState(initialData?.subject || '')
  const [preheader, setPreheader] = useState(initialData?.preheader || '')
  const [segment, setSegment] = useState<NewsletterSegment>(
    initialData?.segment || 'ALL'
  )

  // Editor onReady callback
  const onReady: EmailEditorProps['onReady'] = useCallback((unlayer: Parameters<NonNullable<EmailEditorProps['onReady']>>[0]) => {
    emailEditorRef.current = { editor: unlayer }
    setIsReady(true)

    // Load initial design if available
    if (initialData?.designJson && Object.keys(initialData.designJson).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unlayer.loadDesign(initialData.designJson as any)
    }
  }, [initialData?.designJson])

  // Export design and HTML
  const exportContent = useCallback((): Promise<{ designJson: object; htmlContent: string }> => {
    return new Promise((resolve, reject) => {
      if (!emailEditorRef.current?.editor) {
        reject(new Error('Editor nicht bereit'))
        return
      }

      emailEditorRef.current.editor.exportHtml((data) => {
        const { design, html } = data
        resolve({ designJson: design, htmlContent: html })
      })
    })
  }, [])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!name || !subject) {
      toast.error('Bitte Name und Betreff ausfüllen')
      return
    }

    setIsSaving(true)
    try {
      const { designJson, htmlContent } = await exportContent()
      
      const endpoint = newsletterId 
        ? `/api/admin/newsletter/${newsletterId}`
        : '/api/admin/newsletter'
      
      const method = newsletterId ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          preheader,
          segment,
          designJson,
          htmlContent
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Speichern fehlgeschlagen')
      }

      toast.success('Newsletter gespeichert')
      
      if (onSave) {
        await onSave({ designJson, htmlContent })
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }, [name, subject, preheader, segment, newsletterId, exportContent, onSave])

  // Test email handler
  const handleTestSend = useCallback(async () => {
    if (!testEmail || !newsletterId) {
      toast.error('Bitte E-Mail-Adresse eingeben')
      return
    }

    // Erst speichern
    await handleSave()

    setIsSending(true)
    try {
      const response = await fetch(`/api/admin/newsletter/${newsletterId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Test-Versand fehlgeschlagen')
      }

      toast.success(`Test-Mail an ${testEmail} gesendet`)
      setShowTestDialog(false)
      setTestEmail('')
    } catch (error) {
      console.error('Test send error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden')
    } finally {
      setIsSending(false)
    }
  }, [testEmail, newsletterId, handleSave])

  // Send handler
  const handleSend = useCallback(async () => {
    if (!newsletterId) {
      toast.error('Bitte zuerst speichern')
      return
    }

    // Erst speichern
    await handleSave()

    setIsSending(true)
    try {
      const response = await fetch(`/api/admin/newsletter/${newsletterId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Versand fehlgeschlagen')
      }

      toast.success(result.message)
      setShowSendDialog(false)
      
      if (onBack) onBack()
    } catch (error) {
      console.error('Send error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden')
    } finally {
      setIsSending(false)
    }
  }, [newsletterId, handleSave, onBack])

  // Preview handler
  const handlePreview = useCallback(() => {
    if (!emailEditorRef.current?.editor) return
    
    emailEditorRef.current.editor.exportHtml((data) => {
      const { html } = data
      const previewWindow = window.open('', '_blank')
      if (previewWindow) {
        previewWindow.document.write(html)
        previewWindow.document.close()
      }
    })
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div>
                <Input
                  placeholder="Newsletter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 w-[200px] text-sm"
                />
              </div>
              <div>
                <Input
                  placeholder="Betreff"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-8 w-[250px] text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select 
              value={segment} 
              onValueChange={(v) => setSegment(v as NewsletterSegment)}
            >
              <SelectTrigger className="h-8 w-[160px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(segmentLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreview}
              disabled={!isReady}
            >
              <Eye className="h-4 w-4 mr-1" />
              Vorschau
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTestDialog(true)}
              disabled={!isReady || !newsletterId}
            >
              <TestTube className="h-4 w-4 mr-1" />
              Test
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              disabled={!isReady || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Speichern
            </Button>

            <Button 
              size="sm" 
              onClick={() => setShowSendDialog(true)}
              disabled={!isReady || !newsletterId}
            >
              <Send className="h-4 w-4 mr-1" />
              Senden
            </Button>
          </div>
        </div>

        {/* Preheader */}
        <div className="px-4 pb-3">
          <Input
            placeholder="Vorschautext (wird in E-Mail-Clients vor dem Öffnen angezeigt)"
            value={preheader}
            onChange={(e) => setPreheader(e.target.value)}
            className="h-8 text-sm text-muted-foreground"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <EmailEditor
          ref={emailEditorRef as React.RefObject<EditorRef>}
          onReady={onReady}
          minHeight="100%"
          options={{
            locale: 'de-DE',
            features: {
              textEditor: {
                spellChecker: true
              }
            },
            appearance: {
              theme: 'modern_light'
            },
            tools: {
              image: {
                enabled: true
              }
            },
            mergeTags: {
              name: { name: 'Name', value: '{{name}}' },
              email: { name: 'E-Mail', value: '{{email}}' }
            }
          }}
        />
      </div>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test-Mail senden</DialogTitle>
            <DialogDescription>
              Sende eine Test-Version des Newsletters an eine E-Mail-Adresse.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="test-email">E-Mail-Adresse</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="test@beispiel.de"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleTestSend} disabled={isSending || !testEmail}>
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Test senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Newsletter versenden</DialogTitle>
            <DialogDescription>
              Der Newsletter wird an alle Empfänger im Segment &quot;{segmentLabels[segment]}&quot; gesendet.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Jetzt senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

