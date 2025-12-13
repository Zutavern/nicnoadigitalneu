'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  FileQuestion,
  Shield,
  Lock,
  Save,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ErrorMessage {
  id: string
  errorType: string
  message: string
  isActive: boolean
  sortOrder: number
}

const ERROR_TYPES = [
  { value: '404', label: '404 - Nicht gefunden', icon: FileQuestion, color: 'blue' },
  { value: '500', label: '500 - Serverfehler', icon: AlertTriangle, color: 'red' },
  { value: '403', label: '403 - Zugriff verweigert', icon: Shield, color: 'orange' },
  { value: '401', label: '401 - Nicht autorisiert', icon: Lock, color: 'yellow' },
]

export default function ErrorMessagesPage() {
  const [messages, setMessages] = useState<Record<string, ErrorMessage[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingMessage, setEditingMessage] = useState<ErrorMessage | null>(null)
  const [formData, setFormData] = useState({
    errorType: '404',
    message: '',
    isActive: true,
  })

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/error-messages')
      if (!res.ok) throw new Error('Failed to fetch')
      const data: ErrorMessage[] = await res.json()
      
      // Gruppiere nach errorType
      const grouped = data.reduce((acc, msg) => {
        if (!acc[msg.errorType]) {
          acc[msg.errorType] = []
        }
        acc[msg.errorType].push(msg)
        return acc
      }, {} as Record<string, ErrorMessage[]>)

      setMessages(grouped)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Fehler beim Laden der Fehlermeldungen')
    } finally {
      setIsLoading(false)
    }
  }

  const openDialog = (message?: ErrorMessage) => {
    if (message) {
      setEditingMessage(message)
      setFormData({
        errorType: message.errorType,
        message: message.message,
        isActive: message.isActive,
      })
    } else {
      setEditingMessage(null)
      setFormData({
        errorType: '404',
        message: '',
        isActive: true,
      })
    }
    setShowDialog(true)
  }

  const saveMessage = async () => {
    if (!formData.message.trim()) {
      toast.error('Bitte geben Sie eine Fehlermeldung ein')
      return
    }

    setIsSaving(true)
    try {
      if (editingMessage) {
        // Update
        const res = await fetch(`/api/admin/error-messages/${editingMessage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: formData.message,
            isActive: formData.isActive,
          }),
        })
        if (!res.ok) throw new Error('Failed to update')
      } else {
        // Create
        const res = await fetch('/api/admin/error-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Failed to create')
      }

      toast.success('Fehlermeldung gespeichert!')
      setShowDialog(false)
      fetchMessages()
    } catch (error) {
      console.error('Error saving message:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Möchten Sie diese Fehlermeldung wirklich löschen?')) return

    try {
      const res = await fetch(`/api/admin/error-messages/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Fehlermeldung gelöscht!')
      fetchMessages()
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const toggleActive = async (message: ErrorMessage) => {
    try {
      const res = await fetch(`/api/admin/error-messages/${message.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !message.isActive,
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      fetchMessages()
    } catch (error) {
      console.error('Error toggling active:', error)
      toast.error('Fehler beim Aktualisieren')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-primary" />
            Fehlermeldungen
          </h1>
          <p className="text-muted-foreground">
            Verwalte witzige Fehlermeldungen für verschiedene Fehlertypen
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Meldung
        </Button>
      </div>

      {/* Tabs für verschiedene Fehlertypen */}
      <Tabs defaultValue="404" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {ERROR_TYPES.map((type) => (
            <TabsTrigger key={type.value} value={type.value}>
              <type.icon className="mr-2 h-4 w-4" />
              {type.value}
            </TabsTrigger>
          ))}
        </TabsList>

        {ERROR_TYPES.map((type) => (
          <TabsContent key={type.value} value={type.value} className="space-y-4">
            <div className="grid gap-4">
              {(messages[type.value] || []).map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={!message.isActive ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={message.isActive ? 'default' : 'secondary'}>
                              {message.isActive ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Sortierung: {message.sortOrder}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={message.isActive}
                            onCheckedChange={() => toggleActive(message)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(message)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {(!messages[type.value] || messages[type.value].length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Noch keine Fehlermeldungen für {type.label}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setFormData({ ...formData, errorType: type.value })
                        openDialog()
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Erste Meldung hinzufügen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog zum Bearbeiten/Erstellen */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMessage ? 'Fehlermeldung bearbeiten' : 'Neue Fehlermeldung'}
            </DialogTitle>
            <DialogDescription>
              {editingMessage
                ? 'Bearbeite die Fehlermeldung'
                : 'Erstelle eine neue witzige Fehlermeldung'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="errorType">Fehlertyp</Label>
              <select
                id="errorType"
                value={formData.errorType}
                onChange={(e) => setFormData({ ...formData, errorType: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!!editingMessage}
              >
                {ERROR_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Fehlermeldung</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Hey, wir schneiden gerade Haare. Deshalb ist unser Server langsam."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Aktiv</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Abbrechen
            </Button>
            <Button onClick={saveMessage} disabled={isSaving || !formData.message.trim()}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}








