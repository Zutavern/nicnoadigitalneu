'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Send, 
  Copy,
  Mail,
  MousePointerClick,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

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

interface NewsletterCardProps {
  newsletter: Newsletter
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
}

const statusConfig: Record<NewsletterStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Entwurf', variant: 'secondary' },
  SCHEDULED: { label: 'Geplant', variant: 'outline' },
  SENDING: { label: 'Wird gesendet', variant: 'default' },
  SENT: { label: 'Gesendet', variant: 'default' },
  FAILED: { label: 'Fehlgeschlagen', variant: 'destructive' }
}

const segmentLabels: Record<NewsletterSegment, string> = {
  ALL: 'Alle',
  STYLISTS: 'Stuhlmieter',
  SALON_OWNERS: 'Salonbesitzer',
  CUSTOM: 'Benutzerdefiniert'
}

export function NewsletterCard({ 
  newsletter, 
  onEdit, 
  onDelete,
  onDuplicate 
}: NewsletterCardProps) {
  const status = statusConfig[newsletter.status]
  const isSent = newsletter.status === 'SENT'
  const openRate = newsletter.sentCount > 0 
    ? Math.round((newsletter.openCount / newsletter.sentCount) * 100) 
    : 0
  const clickRate = newsletter.openCount > 0 
    ? Math.round((newsletter.clickCount / newsletter.openCount) * 100) 
    : 0

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{newsletter.name}</h3>
            <Badge variant={status.variant} className="shrink-0">
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {newsletter.subject}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {newsletter.status === 'DRAFT' && (
              <DropdownMenuItem onClick={() => onEdit?.(newsletter.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDuplicate?.(newsletter.id)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplizieren
            </DropdownMenuItem>
            {newsletter.status === 'DRAFT' && (
              <DropdownMenuItem 
                onClick={() => onDelete?.(newsletter.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Mail className="h-3.5 w-3.5" />
          {segmentLabels[newsletter.segment]}
        </span>
        {newsletter.sentAt && (
          <span>
            Gesendet {formatDistanceToNow(new Date(newsletter.sentAt), { 
              addSuffix: true, 
              locale: de 
            })}
          </span>
        )}
      </div>

      {isSent && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Send className="h-3.5 w-3.5" />
              <span className="text-xs">Gesendet</span>
            </div>
            <p className="font-semibold">{newsletter.sentCount.toLocaleString('de-DE')}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Eye className="h-3.5 w-3.5" />
              <span className="text-xs">Geöffnet</span>
            </div>
            <p className="font-semibold">{openRate}%</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <MousePointerClick className="h-3.5 w-3.5" />
              <span className="text-xs">Geklickt</span>
            </div>
            <p className="font-semibold">{clickRate}%</p>
          </div>
        </div>
      )}

      {!isSent && (
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Erstellt {formatDistanceToNow(new Date(newsletter.createdAt), { 
              addSuffix: true, 
              locale: de 
            })}
            {newsletter.creator?.name && ` von ${newsletter.creator.name}`}
          </p>
        </div>
      )}
    </Card>
  )
}

