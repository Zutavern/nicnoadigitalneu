'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { 
  Plus, 
  Search, 
  Mail,
  FileEdit,
  Send,
  CheckCircle,
  Loader2,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { NewsletterThumbnail } from '@/components/newsletter-builder/newsletter-thumbnail'
import { EmailPreview } from '@/components/newsletter-builder/email-preview'
import { CreateNewsletterDialog } from '@/components/newsletter-builder/create-newsletter-dialog'
import type { NewsletterBlock, NewsletterBranding } from '@/lib/newsletter-builder/types'

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
  updatedAt: string
  designJson?: {
    contentBlocks?: NewsletterBlock[]
  }
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

const STATUS_BADGES: Record<NewsletterStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Entwurf', variant: 'secondary' },
  SCHEDULED: { label: 'Geplant', variant: 'outline' },
  SENDING: { label: 'Wird gesendet', variant: 'default' },
  SENT: { label: 'Gesendet', variant: 'default' },
  FAILED: { label: 'Fehlgeschlagen', variant: 'destructive' },
}

// Default Branding für Thumbnails
const DEFAULT_BRANDING: NewsletterBranding = {
  primaryColor: '#10b981',
  companyName: 'NICNOA',
  websiteUrl: 'https://nicnoa.online',
}

export default function NewsletterPage() {
  const router = useRouter()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [branding, setBranding] = useState<NewsletterBranding>(DEFAULT_BRANDING)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Finde den Newsletter für die Vorschau
  const previewNewsletter = previewId ? newsletters.find(n => n.id === previewId) : null

  // Stats
  const stats = {
    total: newsletters.length,
    drafts: newsletters.filter(n => n.status === 'DRAFT').length,
    sent: newsletters.filter(n => n.status === 'SENT').length,
    totalSent: newsletters.reduce((acc, n) => acc + n.sentCount, 0)
  }

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
    fetchBranding()
    fetchNewsletters()
  }, [fetchBranding, fetchNewsletters])

  // Filtered newsletters
  const filteredNewsletters = newsletters.filter(newsletter => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      newsletter.name.toLowerCase().includes(query) ||
      newsletter.subject.toLowerCase().includes(query)
    )
  })

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
      setNewsletters(prev => prev.filter(n => n.id !== deleteId))
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
      const response = await fetch(`/api/admin/newsletter/${id}`)
      if (!response.ok) throw new Error('Laden fehlgeschlagen')
      
      const { newsletter } = await response.json()
      
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

  // Hilfsfunktion um Blöcke aus designJson zu extrahieren
  const getBlocks = (newsletter: Newsletter): NewsletterBlock[] => {
    if (!newsletter.designJson) return []
    return newsletter.designJson.contentBlocks || []
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Newsletter
          </h1>
          <p className="text-muted-foreground">
            Erstelle und versende Newsletter an deine Nutzer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchNewsletters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Newsletter
          </Button>
        </div>
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

      {/* Newsletter Grid mit Thumbnails */}
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
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Newsletter
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredNewsletters.map((newsletter, index) => {
              const statusBadge = STATUS_BADGES[newsletter.status]
              const blocks = getBlocks(newsletter)
              
              return (
                <motion.div
                  key={newsletter.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="group hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {newsletter.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant={statusBadge.variant} className="text-xs">
                              {statusBadge.label}
                            </Badge>
                            {newsletter.status === 'SENT' && newsletter.sentCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {newsletter.sentCount} gesendet
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/admin/marketing/newsletter/${newsletter.id}/edit`}>
                              <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => setPreviewId(newsletter.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Vorschau
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(newsletter.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplizieren
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(newsletter.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      {/* Thumbnail Preview */}
                      <Link href={`/admin/marketing/newsletter/${newsletter.id}/edit`}>
                        <div className="group/preview relative bg-muted/50 rounded-xl p-4 mb-3 cursor-pointer transition-all hover:shadow-lg hover:bg-muted/70">
                          <div className="relative flex justify-center">
                            <div 
                              className="transition-transform group-hover/preview:scale-[1.02]"
                              style={{
                                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.12)) drop-shadow(0 3px 8px rgba(0,0,0,0.08))',
                              }}
                            >
                              <NewsletterThumbnail
                                blocks={blocks}
                                branding={branding}
                                className="w-[140px]"
                              />
                            </div>
                          </div>
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                            <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                              <Pencil className="h-3.5 w-3.5 inline mr-1.5" />
                              Bearbeiten
                            </div>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Subject */}
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {newsletter.subject}
                      </p>
                      
                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(newsletter.updatedAt || newsletter.createdAt), {
                            addSuffix: true,
                            locale: de,
                          })}
                        </span>
                        <span>{blocks.length} Blöcke</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
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

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg">
                {previewNewsletter?.name || 'Vorschau'}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          {/* Preview Content */}
          <div className="flex-1 overflow-auto">
            {previewNewsletter && (
              <EmailPreview
                blocks={getBlocks(previewNewsletter)}
                branding={branding}
              />
            )}
          </div>

          {/* Footer mit Aktionen */}
          <div className="px-6 py-4 border-t flex-shrink-0 flex items-center justify-between bg-background">
            <div className="text-sm text-muted-foreground">
              {previewNewsletter && `${getBlocks(previewNewsletter).length} Blöcke`}
            </div>
            <Link href={`/admin/marketing/newsletter/${previewId}/edit`}>
              <Button>
                <Pencil className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Newsletter Dialog */}
      <CreateNewsletterDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  )
}
