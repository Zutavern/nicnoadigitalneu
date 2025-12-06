'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Mail,
  Save,
  Eye,
  Send,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Upload,
  Check,
  X,
  ChevronRight,
  Palette,
  FileText,
  Settings,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'

interface EmailTemplate {
  id: string
  slug: string
  name: string
  description: string | null
  subject: string
  content: {
    headline: string
    body: string
    buttonText?: string
    footer?: string
  }
  category: string
  primaryColor: string | null
  logoUrl: string | null
  isActive: boolean
  isSystem: boolean
  _count?: { sentEmails: number }
}

const categories = [
  { value: 'auth', label: 'Authentifizierung', icon: '🔐' },
  { value: 'onboarding', label: 'Onboarding', icon: '📋' },
  { value: 'subscription', label: 'Abonnement', icon: '💳' },
  { value: 'booking', label: 'Buchungen', icon: '📅' },
  { value: 'referral', label: 'Empfehlungen', icon: '🎁' },
  { value: 'system', label: 'System', icon: '⚙️' },
]

const deviceSizes = {
  mobile: 375,
  tablet: 768,
  desktop: 600,
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Editierbare Felder
  const [editedSubject, setEditedSubject] = useState('')
  const [editedHeadline, setEditedHeadline] = useState('')
  const [editedBody, setEditedBody] = useState('')
  const [editedButtonText, setEditedButtonText] = useState('')
  const [editedFooter, setEditedFooter] = useState('')
  const [editedPrimaryColor, setEditedPrimaryColor] = useState('#10b981')
  const [editedIsActive, setEditedIsActive] = useState(true)

  // Templates laden
  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/email-templates')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTemplates(data)
    } catch {
      toast.error('Fehler beim Laden der Templates')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // Template auswählen
  const selectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setEditedSubject(template.subject)
    setEditedHeadline(template.content.headline)
    setEditedBody(template.content.body)
    setEditedButtonText(template.content.buttonText || '')
    setEditedFooter(template.content.footer || '')
    setEditedPrimaryColor(template.primaryColor || '#10b981')
    setEditedIsActive(template.isActive)
    generatePreview(template.slug, {
      headline: template.content.headline,
      body: template.content.body,
      buttonText: template.content.buttonText,
      footer: template.content.footer,
    })
  }

  // Preview generieren
  const generatePreview = async (slug: string, content?: Record<string, string | undefined>) => {
    setIsGeneratingPreview(true)
    try {
      const res = await fetch('/api/admin/email-templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateSlug: slug,
          customContent: content,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to generate preview')
      
      const data = await res.json()
      setPreviewHtml(data.html)
    } catch {
      toast.error('Preview konnte nicht generiert werden')
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  // Änderungen speichern
  const saveChanges = async () => {
    if (!selectedTemplate) return
    
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/email-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: editedSubject,
          content: {
            headline: editedHeadline,
            body: editedBody,
            buttonText: editedButtonText || undefined,
            footer: editedFooter || undefined,
          },
          primaryColor: editedPrimaryColor,
          isActive: editedIsActive,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to save')
      
      toast.success('Änderungen gespeichert')
      loadTemplates()
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  // Live-Preview bei Änderungen
  const updatePreview = useCallback(() => {
    if (!selectedTemplate) return
    generatePreview(selectedTemplate.slug, {
      headline: editedHeadline,
      body: editedBody,
      buttonText: editedButtonText,
      footer: editedFooter,
    })
  }, [selectedTemplate, editedHeadline, editedBody, editedButtonText, editedFooter])

  // Test-Email senden
  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) return
    
    setIsSendingTest(true)
    try {
      const res = await fetch('/api/admin/email-templates/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateSlug: selectedTemplate.slug,
          testEmail,
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error)
      }
      
      if (data.preview) {
        toast.success('Test-Email generiert (Demo-Modus)')
      } else {
        toast.success('Test-Email gesendet!')
      }
      
      setTestEmailDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden')
    } finally {
      setIsSendingTest(false)
    }
  }

  // Gefilterte Templates
  const filteredTemplates = templates.filter(
    t => filterCategory === 'all' || t.category === filterCategory
  )

  // Kategorien mit Counts
  const categoryCounts = templates.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            E-Mail Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalte und bearbeite alle E-Mail-Vorlagen
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {templates.length} Templates
        </Badge>
      </div>

      {/* Main Content - Split Screen */}
      <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-220px)]">
        {/* Left Sidebar - Template List */}
        <div className="col-span-3 space-y-4">
          {/* Category Filter */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Kategorien</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    filterCategory === 'all' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <span>Alle Templates</span>
                  <Badge variant={filterCategory === 'all' ? 'secondary' : 'outline'} className="text-xs">
                    {templates.length}
                  </Badge>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setFilterCategory(cat.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterCategory === cat.value 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span>{cat.icon} {cat.label}</span>
                    <Badge variant={filterCategory === cat.value ? 'secondary' : 'outline'} className="text-xs">
                      {categoryCounts[cat.value] || 0}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template List */}
          <Card className="flex-1">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[500px]">
              <CardContent className="p-2">
                <div className="space-y-1">
                  {filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'bg-primary/10 border-l-4 border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{template.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {categories.find(c => c.value === template.category)?.icon}
                        </Badge>
                        {!template.isActive && (
                          <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Center - Editor */}
        <div className="col-span-4">
          <AnimatePresence mode="wait">
            {selectedTemplate ? (
              <motion.div
                key={selectedTemplate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                        <CardDescription>{selectedTemplate.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editedIsActive}
                          onCheckedChange={setEditedIsActive}
                        />
                        <span className="text-sm text-muted-foreground">
                          {editedIsActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Betreff */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Betreff
                      </Label>
                      <Input
                        id="subject"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        placeholder="E-Mail Betreff..."
                      />
                    </div>

                    {/* Überschrift */}
                    <div className="space-y-2">
                      <Label htmlFor="headline" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Überschrift
                      </Label>
                      <Input
                        id="headline"
                        value={editedHeadline}
                        onChange={(e) => setEditedHeadline(e.target.value)}
                        placeholder="Überschrift in der E-Mail..."
                      />
                    </div>

                    {/* Inhalt */}
                    <div className="space-y-2">
                      <Label htmlFor="body" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Inhalt
                      </Label>
                      <textarea
                        id="body"
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        placeholder="Hauptinhalt der E-Mail..."
                        className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground">
                        Variablen: {'{{name}}'}, {'{{userName}}'}, {'{{email}}'}, etc.
                      </p>
                    </div>

                    {/* Button Text */}
                    <div className="space-y-2">
                      <Label htmlFor="buttonText">Button Text (optional)</Label>
                      <Input
                        id="buttonText"
                        value={editedButtonText}
                        onChange={(e) => setEditedButtonText(e.target.value)}
                        placeholder="Zum Dashboard"
                      />
                    </div>

                    {/* Footer */}
                    <div className="space-y-2">
                      <Label htmlFor="footer">Footer Text (optional)</Label>
                      <Input
                        id="footer"
                        value={editedFooter}
                        onChange={(e) => setEditedFooter(e.target.value)}
                        placeholder="Zusätzlicher Hinweis..."
                      />
                    </div>

                    {/* Farbe */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Akzentfarbe
                      </Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editedPrimaryColor}
                          onChange={(e) => setEditedPrimaryColor(e.target.value)}
                          className="h-10 w-14 rounded cursor-pointer border"
                        />
                        <Input
                          value={editedPrimaryColor}
                          onChange={(e) => setEditedPrimaryColor(e.target.value)}
                          className="w-24 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={updatePreview} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Preview aktualisieren
                  </Button>
                  <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Send className="h-4 w-4 mr-2" />
                        Testen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Test-E-Mail senden</DialogTitle>
                        <DialogDescription>
                          Sende eine Test-E-Mail an eine beliebige Adresse.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>E-Mail Adresse</Label>
                          <Input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="test@beispiel.de"
                          />
                        </div>
                        <Button
                          onClick={sendTestEmail}
                          disabled={!testEmail || isSendingTest}
                          className="w-full"
                        >
                          {isSendingTest ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Test senden
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={saveChanges} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Speichern
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Kein Template ausgewählt</h3>
                  <p className="text-sm text-muted-foreground">
                    Wähle ein Template aus der Liste, um es zu bearbeiten.
                  </p>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>

        {/* Right - Preview */}
        <div className="col-span-5">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live-Vorschau
                </CardTitle>
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-background shadow' : ''}`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-background shadow' : ''}`}
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-background shadow' : ''}`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 bg-muted/50 overflow-auto">
              {isGeneratingPreview ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : previewHtml ? (
                <div className="flex justify-center">
                  <div 
                    className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                    style={{ width: deviceSizes[previewDevice] }}
                  >
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-[600px] border-0"
                      title="Email Preview"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Wähle ein Template, um die Vorschau zu sehen</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


