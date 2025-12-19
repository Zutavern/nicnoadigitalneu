'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Globe, 
  Loader2, 
  Check, 
  AlertCircle, 
  Clock,
  ExternalLink,
  RefreshCw,
  Trash2,
  Copy,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface CustomDomain {
  id: string
  domain: string
  verificationStatus: 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'FAILED'
  verificationMethod: string | null
  verificationToken: string | null
  dnsConfigured: boolean
  isPurchased: boolean
  customerPriceEur: number | null
  expiresAt: string | null
  createdAt: string
  homepageProject: {
    id: string
    name: string
    slug: string
    status: string
  } | null
  vercelStatus: {
    configured: boolean
    verified: boolean
  }
}

interface DomainManagementProps {
  className?: string
}

export function DomainManagement({ className }: DomainManagementProps) {
  const [domains, setDomains] = useState<CustomDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch('/api/domains')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setDomains(data.domains || [])
    } catch (error) {
      console.error('Error fetching domains:', error)
      toast.error('Fehler beim Laden der Domains')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  const handleVerify = async (domainId: string) => {
    setVerifying(domainId)
    try {
      const res = await fetch(`/api/domains/${domainId}`, { method: 'POST' })
      const data = await res.json()

      if (data.verified) {
        toast.success('Domain erfolgreich verifiziert!')
        fetchDomains()
      } else {
        toast.info(data.message || 'Verifizierung noch nicht abgeschlossen')
      }
    } catch (error) {
      console.error('Error verifying domain:', error)
      toast.error('Fehler bei der Verifizierung')
    } finally {
      setVerifying(null)
    }
  }

  const handleDelete = async (domainId: string) => {
    setDeleting(domainId)
    try {
      const res = await fetch(`/api/domains/${domainId}`, { method: 'DELETE' })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success('Domain erfolgreich entfernt')
      fetchDomains()
    } catch (error) {
      console.error('Error deleting domain:', error)
      toast.error('Fehler beim Löschen der Domain')
    } finally {
      setDeleting(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('In die Zwischenablage kopiert')
  }

  const getStatusBadge = (domain: CustomDomain) => {
    if (domain.vercelStatus.verified || domain.verificationStatus === 'VERIFIED') {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
          <Check className="h-3 w-3 mr-1" />
          Aktiv
        </Badge>
      )
    }
    if (domain.verificationStatus === 'VERIFYING') {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Wird verifiziert
        </Badge>
      )
    }
    if (domain.verificationStatus === 'FAILED') {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Fehlgeschlagen
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Ausstehend
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Lade Domains...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-emerald-500" />
            Meine Domains
          </CardTitle>
          <CardDescription>
            Verwalte deine eigenen Domains
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDomains}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {domains.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Noch keine Domains registriert</p>
            <p className="text-sm mt-1">
              Suche oben nach einer Domain für deine Homepage
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {domains.map((domain, index) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Collapsible
                  open={expandedDomain === domain.id}
                  onOpenChange={(open) => setExpandedDomain(open ? domain.id : null)}
                >
                  <div className="border rounded-lg overflow-hidden">
                    {/* Header */}
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-full',
                            domain.vercelStatus.verified 
                              ? 'bg-emerald-100 dark:bg-emerald-900' 
                              : 'bg-amber-100 dark:bg-amber-900'
                          )}>
                            <Globe className={cn(
                              'h-4 w-4',
                              domain.vercelStatus.verified 
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            )} />
                          </div>
                          <div>
                            <p className="font-medium">{domain.domain}</p>
                            <p className="text-xs text-muted-foreground">
                              Hinzugefügt {formatDistanceToNow(new Date(domain.createdAt), { 
                                addSuffix: true, 
                                locale: de 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(domain)}
                          <ChevronDown className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            expandedDomain === domain.id && 'rotate-180'
                          )} />
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Expanded Content */}
                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-2 border-t bg-muted/30 space-y-4">
                        {/* Verknüpfte Homepage */}
                        {domain.homepageProject && (
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <div>
                              <p className="text-sm font-medium">Verknüpft mit</p>
                              <p className="text-xs text-muted-foreground">
                                {domain.homepageProject.name}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a 
                                href={`https://${domain.homepageProject.slug}.nicnoa.online`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Öffnen
                              </a>
                            </Button>
                          </div>
                        )}

                        {/* DNS-Konfiguration */}
                        {!domain.vercelStatus.verified && domain.verificationToken && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                              DNS-Konfiguration erforderlich
                            </p>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center justify-between p-2 bg-background rounded">
                                <div>
                                  <span className="text-muted-foreground">Typ:</span>{' '}
                                  <span className="font-mono">{domain.verificationMethod || 'TXT'}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-background rounded">
                                <div className="flex-1 overflow-hidden">
                                  <span className="text-muted-foreground">Wert:</span>{' '}
                                  <span className="font-mono text-xs break-all">
                                    {domain.verificationToken}
                                  </span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(domain.verificationToken!)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="mt-3 w-full"
                              onClick={() => handleVerify(domain.id)}
                              disabled={verifying === domain.id}
                            >
                              {verifying === domain.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              )}
                              Verifizierung prüfen
                            </Button>
                          </div>
                        )}

                        {/* Preis-Info */}
                        {domain.customerPriceEur && (
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <span className="text-sm text-muted-foreground">Jährliche Kosten</span>
                            <span className="font-medium">€{domain.customerPriceEur.toFixed(2)}/Jahr</span>
                          </div>
                        )}

                        {/* Aktionen */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            asChild
                          >
                            <a 
                              href={`https://${domain.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Domain öffnen
                            </a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Domain entfernen?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Möchtest du <strong>{domain.domain}</strong> wirklich entfernen?
                                  Die Domain wird von deinem Projekt getrennt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(domain.id)}
                                  disabled={deleting === domain.id}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleting === domain.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                  )}
                                  Entfernen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}



