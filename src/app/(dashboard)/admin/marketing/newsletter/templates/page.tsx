'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Plus, 
  FileText, 
  Trash2, 
  Star,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface NewsletterTemplate {
  id: string
  name: string
  description: string | null
  category: string
  isDefault: boolean
  createdAt: string
}

const categories = [
  { value: 'general', label: 'Allgemein' },
  { value: 'welcome', label: 'Willkommen' },
  { value: 'promo', label: 'Promotion' },
  { value: 'update', label: 'Updates' }
]

// Standard-Templates für neue Installationen
const defaultTemplates = [
  {
    name: 'Einfaches Update',
    description: 'Minimales Template für schnelle Updates',
    category: 'update',
    designJson: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: 'heading',
                    values: {
                      text: 'Hallo {{name}}!'
                    }
                  },
                  {
                    type: 'text',
                    values: {
                      text: '<p>Hier sind deine neuesten Updates von NICNOA.</p>'
                    }
                  },
                  {
                    type: 'button',
                    values: {
                      text: 'Zum Dashboard',
                      href: 'https://nicnoa.online'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  {
    name: 'Promotion',
    description: 'Template für Angebote und Aktionen',
    category: 'promo',
    designJson: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: 'image',
                    values: {
                      src: '',
                      alt: 'Banner'
                    }
                  },
                  {
                    type: 'heading',
                    values: {
                      text: 'Exklusives Angebot'
                    }
                  },
                  {
                    type: 'text',
                    values: {
                      text: '<p>Sichere dir jetzt dein Angebot!</p>'
                    }
                  },
                  {
                    type: 'button',
                    values: {
                      text: 'Jetzt sichern',
                      href: 'https://nicnoa.online'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  }
]

export default function NewsletterTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState('general')

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/newsletter/templates')
      if (!response.ok) throw new Error('Laden fehlgeschlagen')
      
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Fehler beim Laden der Templates')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleCreate = async () => {
    if (!formName) {
      toast.error('Bitte Name eingeben')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/newsletter/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          category: formCategory,
          designJson: {} // Leeres Design - wird beim Bearbeiten gefüllt
        })
      })

      if (!response.ok) throw new Error('Erstellen fehlgeschlagen')

      toast.success('Template erstellt')
      setShowCreateDialog(false)
      setFormName('')
      setFormDescription('')
      setFormCategory('general')
      fetchTemplates()
    } catch (error) {
      console.error('Create error:', error)
      toast.error('Fehler beim Erstellen')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/newsletter/templates?id=${deleteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Löschen fehlgeschlagen')

      toast.success('Template gelöscht')
      fetchTemplates()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleUseTemplate = async (template: NewsletterTemplate) => {
    // Neuen Newsletter mit dem Template erstellen
    try {
      const templateResponse = await fetch(`/api/admin/newsletter/templates`)
      const templateData = await templateResponse.json()
      const fullTemplate = templateData.templates.find((t: NewsletterTemplate & { designJson?: object }) => t.id === template.id)
      
      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Neuer Newsletter (${template.name})`,
          subject: 'Betreff eingeben',
          designJson: fullTemplate?.designJson || {},
          segment: 'ALL'
        })
      })

      if (!response.ok) throw new Error('Erstellen fehlgeschlagen')

      const { newsletter } = await response.json()
      router.push(`/admin/marketing/newsletter/${newsletter.id}/edit`)
    } catch (error) {
      console.error('Use template error:', error)
      toast.error('Fehler beim Erstellen aus Template')
    }
  }

  const handleInitializeDefaults = async () => {
    setIsCreating(true)
    try {
      for (const template of defaultTemplates) {
        await fetch('/api/admin/newsletter/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template)
        })
      }
      toast.success('Standard-Templates erstellt')
      fetchTemplates()
    } catch (error) {
      console.error('Initialize error:', error)
      toast.error('Fehler beim Initialisieren')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/admin/marketing/newsletter')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Newsletter Templates</h1>
            <p className="text-muted-foreground">
              Vorgefertigte Designs für schnelle Newsletter
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Template
        </Button>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Templates</h3>
          <p className="text-muted-foreground mb-4">
            Erstelle Templates für wiederkehrende Newsletter-Designs.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Template
            </Button>
            <Button variant="outline" onClick={handleInitializeDefaults} disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Standard-Templates laden
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{template.name}</h3>
                    {template.isDefault && (
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {categories.find(c => c.value === template.category)?.label || template.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDeleteId(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Verwenden
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Template</DialogTitle>
            <DialogDescription>
              Erstelle ein neues Newsletter-Template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="z.B. Monatlicher Update"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                placeholder="Kurze Beschreibung des Templates"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !formName}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Template löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

