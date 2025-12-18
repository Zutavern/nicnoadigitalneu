'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { NewsletterCard } from '@/components/newsletter'
import { 
  Plus, 
  Search, 
  Mail,
  FileEdit,
  Send,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
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

type NewsletterStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED'
type NewsletterSegment = 'ALL' | 'STYLISTS' | 'SALON_OWNERS' | 'CUSTOM'

interface Newsletter {
  id: string
  name: string
  subject: string
  status: NewsletterStatus
  segment: NewsletterSegment
  sentAt: string | null
  sentCount: number
  openCount: number
  clickCount: number
  createdAt: string
  creator?: {
    name: string | null
    email: string
  } | null
}

const statusFilters = [
  { value: 'all', label: 'Alle Status' },
  { value: 'DRAFT', label: 'Entwürfe' },
  { value: 'SCHEDULED', label: 'Geplant' },
  { value: 'SENT', label: 'Gesendet' },
  { value: 'FAILED', label: 'Fehlgeschlagen' }
]

export default function NewsletterPage() {
  const router = useRouter()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Stats
  const stats = {
    total: newsletters.length,
    drafts: newsletters.filter(n => n.status === 'DRAFT').length,
    sent: newsletters.filter(n => n.status === 'SENT').length,
    totalSent: newsletters.reduce((acc, n) => acc + n.sentCount, 0)
  }

  const fetchNewsletters = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      
      const response = await fetch(`/api/admin/newsletter?${params}`)
      if (!response.ok) throw new Error('Laden fehlgeschlagen')
      
      const data = await response.json()
      setNewsletters(data.newsletters || [])
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Fehler beim Laden der Newsletter')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchNewsletters()
  }, [fetchNewsletters])

  // Filtered newsletters
  const filteredNewsletters = newsletters.filter(newsletter => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      newsletter.name.toLowerCase().includes(query) ||
      newsletter.subject.toLowerCase().includes(query)
    )
  })

  const handleEdit = (id: string) => {
    router.push(`/admin/marketing/newsletter/${id}/edit`)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/newsletter/${deleteId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Löschen fehlgeschlagen')
      }
      
      toast.success('Newsletter gelöscht')
      fetchNewsletters()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      // Newsletter laden
      const response = await fetch(`/api/admin/newsletter/${id}`)
      if (!response.ok) throw new Error('Laden fehlgeschlagen')
      
      const { newsletter } = await response.json()
      
      // Als neuen Newsletter erstellen
      const createResponse = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${newsletter.name} (Kopie)`,
          subject: newsletter.subject,
          preheader: newsletter.preheader,
          designJson: newsletter.designJson,
          segment: newsletter.segment
        })
      })
      
      if (!createResponse.ok) throw new Error('Duplizieren fehlgeschlagen')
      
      toast.success('Newsletter dupliziert')
      fetchNewsletters()
    } catch (error) {
      console.error('Duplicate error:', error)
      toast.error('Fehler beim Duplizieren')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Newsletter</h1>
          <p className="text-muted-foreground">
            Erstelle und versende Newsletter an deine Nutzer
          </p>
        </div>
        <Button onClick={() => router.push('/admin/marketing/newsletter/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Newsletter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <FileEdit className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.drafts}</p>
              <p className="text-sm text-muted-foreground">Entwürfe</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.sent}</p>
              <p className="text-sm text-muted-foreground">Gesendet</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Send className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {stats.totalSent.toLocaleString('de-DE')}
              </p>
              <p className="text-sm text-muted-foreground">E-Mails gesendet</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Newsletter suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map(filter => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Newsletter List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredNewsletters.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Newsletter</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Keine Newsletter für diese Filter gefunden.'
              : 'Erstelle deinen ersten Newsletter.'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button onClick={() => router.push('/admin/marketing/newsletter/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Newsletter
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNewsletters.map(newsletter => (
            <NewsletterCard
              key={newsletter.id}
              newsletter={newsletter}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Newsletter löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Newsletter 
              wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

