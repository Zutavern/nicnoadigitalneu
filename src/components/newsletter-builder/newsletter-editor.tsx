'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Loader2, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
  Check,
  Clock,
  CalendarClock,
  Users
} from 'lucide-react'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { NewsletterBlock, NewsletterBranding } from '@/lib/newsletter-builder/types'
import { BlockEditor } from './block-editor'
import { EmailPreview } from './email-preview'
import { PersonalizationPalette } from './personalization-palette'
import { ScheduleDialog } from './schedule-dialog'

interface NewsletterEditorProps {
  newsletterId?: string
  initialData?: {
    name: string
    subject: string
    contentBlocks: NewsletterBlock[]
  }
  onSave: (data: {
    name: string
    subject: string
    contentBlocks: NewsletterBlock[]
  }) => Promise<void>
  onBack: () => void
}

// Default Branding (wird vom API überschrieben)
const DEFAULT_BRANDING: NewsletterBranding = {
  companyName: 'NICNOA&CO.online',
  primaryColor: '#10b981',
  websiteUrl: 'https://www.nicnoa.online',
}

// History Management für Undo/Redo
const MAX_HISTORY_SIZE = 50
const AUTO_SAVE_INTERVAL = 30000 // 30 Sekunden

type HistoryEntry = {
  blocks: NewsletterBlock[]
  timestamp: number
}

export function NewsletterEditor({ 
  newsletterId,
  initialData,
  onSave,
  onBack 
}: NewsletterEditorProps) {
  const router = useRouter()
  
  // Form State
  const [name, setName] = useState(initialData?.name || '')
  const [subject, setSubject] = useState(initialData?.subject || '')
  const [blocks, setBlocks] = useState<NewsletterBlock[]>(initialData?.contentBlocks || [])
  
  // History State für Undo/Redo
  const [history, setHistory] = useState<HistoryEntry[]>([
    { blocks: initialData?.contentBlocks || [], timestamp: Date.now() }
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isUndoRedoAction = useRef(false)
  
  // UI State
  const [showPreview, setShowPreview] = useState(true)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [recipientCount, setRecipientCount] = useState(0)
  
  // Aktiver Text-Input für Personalisierung (optional)
  const [activeInputRef, setActiveInputRef] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null)
  
  // Branding (von API laden)
  const [branding, setBranding] = useState<NewsletterBranding>(DEFAULT_BRANDING)

  // Branding laden
  useEffect(() => {
    async function loadBranding() {
      try {
        const response = await fetch('/api/admin/newsletter/base-template')
        if (response.ok) {
          const data = await response.json()
          if (data.branding) {
            setBranding({
              logoUrl: data.branding.logoUrl,
              primaryColor: data.branding.primaryColor || DEFAULT_BRANDING.primaryColor,
              footerText: data.branding.footerText,
              companyName: data.branding.companyName || DEFAULT_BRANDING.companyName,
              websiteUrl: data.branding.websiteUrl || DEFAULT_BRANDING.websiteUrl,
            })
          }
        }
      } catch (error) {
        console.error('Failed to load branding:', error)
      }
    }
    loadBranding()
  }, [])

  // Track unsaved changes
  useEffect(() => {
    if (initialData) {
      const hasNameChanged = name !== initialData.name
      const hasSubjectChanged = subject !== initialData.subject
      const hasBlocksChanged = JSON.stringify(blocks) !== JSON.stringify(initialData.contentBlocks)
      setHasUnsavedChanges(hasNameChanged || hasSubjectChanged || hasBlocksChanged)
    } else {
      setHasUnsavedChanges(name.length > 0 || subject.length > 0 || blocks.length > 0)
    }
  }, [name, subject, blocks, initialData])

  // History Management - Neue Einträge hinzufügen
  const addToHistory = useCallback((newBlocks: NewsletterBlock[]) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false
      return
    }
    
    setHistory(prev => {
      // Alles nach dem aktuellen Index entfernen (bei neuem Eintrag nach Undo)
      const newHistory = prev.slice(0, historyIndex + 1)
      
      // Neuen Eintrag hinzufügen
      newHistory.push({ blocks: newBlocks, timestamp: Date.now() })
      
      // Max History Size einhalten
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift()
      }
      
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_SIZE - 1))
  }, [historyIndex])

  // Blocks ändern mit History-Tracking
  const handleBlocksChange = useCallback((newBlocks: NewsletterBlock[]) => {
    setBlocks(newBlocks)
    addToHistory(newBlocks)
  }, [addToHistory])

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setBlocks(history[newIndex].blocks)
    }
  }, [historyIndex, history])

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setBlocks(history[newIndex].blocks)
    }
  }, [historyIndex, history])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z = Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      // Cmd/Ctrl + Shift + Z = Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        handleRedo()
      }
      // Cmd/Ctrl + Y = Redo (Alternative)
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault()
        handleRedo()
      }
      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error('Bitte gib einen Namen ein')
      return
    }
    if (!subject.trim()) {
      toast.error('Bitte gib einen Betreff ein')
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        name: name.trim(),
        subject: subject.trim(),
        contentBlocks: blocks,
      })
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      toast.success('Newsletter gespeichert')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }, [name, subject, blocks, onSave])

  // Auto-Save
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !newsletterId) return
    if (!name.trim() || !subject.trim()) return

    const timeout = setTimeout(() => {
      handleSave()
    }, AUTO_SAVE_INTERVAL)

    return () => clearTimeout(timeout)
  }, [autoSaveEnabled, hasUnsavedChanges, newsletterId, name, subject, blocks, handleSave])

  // Send test email handler
  const handleSendTest = useCallback(async () => {
    if (!testEmail.trim()) {
      toast.error('Bitte gib eine E-Mail-Adresse ein')
      return
    }

    if (!newsletterId) {
      toast.error('Bitte speichere den Newsletter zuerst')
      return
    }

    setIsSending(true)
    try {
      // Sende aktuelle Blocks mit für Live-Preview
      const response = await fetch(`/api/admin/newsletter/${newsletterId}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmail.trim(),
          contentBlocks: blocks, // Aktuelle Blocks für Live-Preview
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }

      toast.success(data.message || 'Test-E-Mail gesendet')
      setShowSendDialog(false)
      setTestEmail('')
    } catch (error) {
      console.error('Send test error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden')
    } finally {
      setIsSending(false)
    }
  }, [newsletterId, testEmail, blocks])

  // Back handler with unsaved changes check
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      onBack()
    }
  }, [hasUnsavedChanges, onBack])

  // Schedule handler
  const handleSchedule = useCallback(async (scheduledAt: Date) => {
    if (!newsletterId) {
      toast.error('Bitte speichere den Newsletter zuerst')
      return
    }

    setIsSending(true)
    try {
      // Erst speichern
      await handleSave()
      
      // Dann schedulen
      const response = await fetch(`/api/admin/newsletter/${newsletterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scheduledAt: scheduledAt.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule newsletter')
      }

      toast.success(`Newsletter geplant für ${scheduledAt.toLocaleString('de-DE')}`)
      setShowScheduleDialog(false)
    } catch (error) {
      console.error('Schedule error:', error)
      toast.error('Fehler beim Planen')
    } finally {
      setIsSending(false)
    }
  }, [newsletterId, handleSave])

  // Send now handler
  const handleSendNow = useCallback(async () => {
    if (!newsletterId) {
      toast.error('Bitte speichere den Newsletter zuerst')
      return
    }

    setIsSending(true)
    try {
      // Erst speichern
      await handleSave()
      
      // Dann senden
      const response = await fetch(`/api/admin/newsletter/${newsletterId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send newsletter')
      }

      toast.success(data.message || 'Newsletter versendet!')
      setShowScheduleDialog(false)
    } catch (error) {
      console.error('Send error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden')
    } finally {
      setIsSending(false)
    }
  }, [newsletterId, handleSave])

  // Personalisierung einfügen
  const handleInsertPlaceholder = useCallback((placeholder: string) => {
    // In den Betreff einfügen (einfachste Option)
    setSubject(prev => prev + placeholder)
    toast.success(`${placeholder} eingefügt`)
  }, [])

  // Undo/Redo Status
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div>
                <Label htmlFor="name" className="text-xs text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Newsletter Name"
                  className="h-8 w-48"
                />
              </div>
              <div>
                <Label htmlFor="subject" className="text-xs text-muted-foreground">Betreff</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E-Mail Betreff"
                  className="h-8 w-64"
                />
              </div>
            </div>

            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1 border-l pl-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="h-8 w-8"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rückgängig (⌘Z)</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="h-8 w-8"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Wiederholen (⌘⇧Z)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Personalisierungs-Palette */}
            <div className="border-l pl-4">
              <PersonalizationPalette onInsert={handleInsertPlaceholder} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Save Status */}
            {lastSaved && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                {hasUnsavedChanges ? (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>Ungespeicherte Änderungen</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span>Gespeichert</span>
                  </>
                )}
              </div>
            )}

            {/* Preview Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="h-8 px-3"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Vorschau
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Vorschau
                  </>
                )}
              </Button>
              
              {showPreview && (
                <ToggleGroup 
                  type="single" 
                  value={previewMode} 
                  onValueChange={(v) => v && setPreviewMode(v as 'desktop' | 'mobile')}
                  className="border-l"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value="desktop" size="sm" className="h-8 w-8 p-0">
                        <Monitor className="h-4 w-4" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>Desktop-Vorschau</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value="mobile" size="sm" className="h-8 w-8 p-0">
                        <Smartphone className="h-4 w-4" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>Mobile-Vorschau</TooltipContent>
                  </Tooltip>
                </ToggleGroup>
              )}
            </div>

            {newsletterId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSendDialog(true)}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Test
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleDialog(true)}
                >
                  <CalendarClock className="h-4 w-4 mr-1" />
                  Versenden
                </Button>
              </>
            )}

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Speichern
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Block Editor */}
          <div className={cn('flex-1 border-r', showPreview && 'max-w-[50%]')}>
            <BlockEditor
              blocks={blocks}
              primaryColor={branding.primaryColor}
              onBlocksChange={handleBlocksChange}
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="flex-1 overflow-hidden bg-muted/30">
              <EmailPreview
                blocks={blocks}
                branding={branding}
                previewMode={previewMode}
              />
            </div>
          )}
        </div>

        {/* Unsaved Changes Dialog */}
        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Ungespeicherte Änderungen
              </AlertDialogTitle>
              <AlertDialogDescription>
                Du hast ungespeicherte Änderungen. Möchtest du diese speichern bevor du gehst?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onBack}>
                Verwerfen
              </AlertDialogCancel>
              <AlertDialogAction onClick={async () => {
                await handleSave()
                onBack()
              }}>
                Speichern & Zurück
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Send Test Dialog */}
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test-E-Mail senden</DialogTitle>
              <DialogDescription>
                Sende eine Test-E-Mail an die angegebene Adresse um die Darstellung zu prüfen.
                {hasUnsavedChanges && (
                  <span className="block mt-2 text-amber-600">
                    Hinweis: Die aktuellen (ungespeicherten) Änderungen werden für den Test verwendet.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">E-Mail-Adresse</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@beispiel.de"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendTest()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSendTest} disabled={isSending}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Senden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <ScheduleDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          onSchedule={handleSchedule}
          onSendNow={handleSendNow}
          isLoading={isSending}
          recipientCount={recipientCount}
        />
      </div>
    </TooltipProvider>
  )
}
