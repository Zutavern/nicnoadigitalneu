'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Send,
  CheckCircle2,
  Eye,
  MousePointer,
  AlertTriangle,
  XCircle,
  Globe,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Settings,
  TrendingUp,
  BarChart3,
  Zap,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { de } from 'date-fns/locale'

interface EmailAnalyticsData {
  isConfigured: boolean
  resendApiError: string | null
  cacheInfo: {
    lastFetched: string
    nextRefresh: string
    isCached: boolean
  } | null
  settings: {
    fromEmail: string | null
    fromName: string | null
  } | null
  statistics: {
    total: number
    last30Days: number
    last7Days: number
    last24Hours: number
    byStatus: {
      pending: number
      sent: number
      delivered: number
      opened: number
      clicked: number
      bounced: number
      failed: number
    }
    rates: {
      delivery: number
      open: number
      click: number
      bounce: number
    }
  }
  chartData: {
    emailsByDay: Array<{ date: string; count: number }>
  }
  recentEmails: Array<{
    id: string
    templateName: string
    recipientEmail: string
    subject: string
    status: string
    createdAt: string
    deliveredAt: string | null
    openedAt: string | null
    clickedAt: string | null
    resendId: string | null
  }>
  templateStats: Array<{
    templateId: string
    templateName: string
    templateSlug: string
    count: number
    lastSent: string
  }>
  domains: Array<{
    id: string
    name: string
    status: string
    region: string
    createdAt: string
    capabilities?: {
      sending: string
      receiving: string
    }
  }>
  resendEmails: Array<{
    id: string
    to: string[]
    from: string
    subject: string
    created_at: string
    last_event: string
  }>
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    PENDING: { label: 'Ausstehend', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
    SENT: { label: 'Gesendet', variant: 'outline', icon: <Send className="h-3 w-3" /> },
    DELIVERED: { label: 'Zugestellt', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
    OPENED: { label: 'Geöffnet', variant: 'default', icon: <Eye className="h-3 w-3" /> },
    CLICKED: { label: 'Geklickt', variant: 'default', icon: <MousePointer className="h-3 w-3" /> },
    BOUNCED: { label: 'Bounced', variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> },
    FAILED: { label: 'Fehlgeschlagen', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  }

  const config = statusConfig[status] || { label: status, variant: 'secondary' as const, icon: null }

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  )
}

// Domain Status Badge
function DomainStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    verified: { label: 'Verifiziert', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', icon: <CheckCircle className="h-3 w-3" /> },
    pending: { label: 'Ausstehend', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
    not_started: { label: 'Nicht gestartet', color: 'bg-slate-500/20 text-slate-600 dark:text-slate-400', icon: <AlertCircle className="h-3 w-3" /> },
    failed: { label: 'Fehlgeschlagen', color: 'bg-red-500/20 text-red-600 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
  }

  const config = statusConfig[status] || statusConfig.not_started

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  )
}

// Simple Bar Chart Component
function SimpleBarChart({ data, maxValue }: { data: Array<{ date: string; count: number }>; maxValue: number }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        Keine Daten vorhanden
      </div>
    )
  }

  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((item, index) => {
        const height = maxValue > 0 ? (item.count / maxValue) * 100 : 0
        const dateObj = new Date(item.date)
        
        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex-1 bg-primary/80 hover:bg-primary rounded-t transition-colors cursor-pointer min-w-[8px]"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{format(dateObj, 'dd. MMM', { locale: de })}</p>
                <p className="text-sm text-muted-foreground">{item.count} E-Mails</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}

// Rate Card Component
function RateCard({ 
  title, 
  rate, 
  icon: Icon, 
  color,
  description 
}: { 
  title: string
  rate: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{rate}%</p>
          </div>
        </div>
        <Progress value={rate} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function EmailAnalyticsPage() {
  const [data, setData] = useState<EmailAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/email-analytics')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Laden der E-Mail Analytics')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/webhooks/resend`
    navigator.clipboard.writeText(webhookUrl)
    toast.success('Webhook-URL kopiert!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Fehler beim Laden der Daten</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const maxChartValue = Math.max(...data.chartData.emailsByDay.map(d => d.count), 1)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            E-Mail Analytics
          </h1>
          <p className="text-muted-foreground">
            Überwache deine E-Mail-Zustellung und Performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/settings/integrations">
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </Link>
          </Button>
        </div>
      </div>

      {/* Konfigurationswarnung */}
      {!data.isConfigured && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-600 dark:text-amber-400">
                    Resend nicht konfiguriert
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Um E-Mail-Analytics nutzen zu können, musst du zuerst Resend in den Integrationen konfigurieren.
                    Ohne aktive Konfiguration können keine E-Mails versendet oder getrackt werden.
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/admin/settings/integrations">
                      <Zap className="h-4 w-4 mr-2" />
                      Resend konfigurieren
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* API-Fehler oder Cache-Info */}
      {data.resendApiError && (
        <Card className={data.resendApiError.includes('Rate Limit') 
          ? "border-amber-500/50 bg-amber-500/10" 
          : "border-destructive/50 bg-destructive/10"
        }>
          <CardContent className="pt-6">
            <div className={`flex items-center gap-3 ${
              data.resendApiError.includes('Rate Limit') 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-destructive'
            }`}>
              {data.resendApiError.includes('Rate Limit') ? (
                <Clock className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <div>
                <p className="font-medium">
                  {data.resendApiError.includes('Rate Limit') 
                    ? 'Resend Rate Limit erreicht' 
                    : 'Resend API-Fehler'
                  }
                </p>
                <p className="text-sm">{data.resendApiError}</p>
                {data.resendApiError.includes('Rate Limit') && data.cacheInfo && (
                  <p className="text-xs mt-1 opacity-75">
                    Die Daten werden aus dem Cache angezeigt. Nächste Aktualisierung: {
                      formatDistanceToNow(new Date(data.cacheInfo.nextRefresh), { locale: de, addSuffix: true })
                    }
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache-Info (nur wenn kein Fehler) */}
      {!data.resendApiError && data.cacheInfo && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>
            Resend-Daten gecached {formatDistanceToNow(new Date(data.cacheInfo.lastFetched), { locale: de, addSuffix: true })}
          </span>
        </div>
      )}

      {/* Statistik-Karten */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamt gesendet</p>
                <p className="text-2xl font-bold">{data.statistics.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{data.statistics.last24Hours} heute</span>
              <span>•</span>
              <span>{data.statistics.last7Days} diese Woche</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zugestellt</p>
                <p className="text-2xl font-bold">
                  {(data.statistics.byStatus.delivered + data.statistics.byStatus.opened + data.statistics.byStatus.clicked).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={data.statistics.rates.delivery} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{data.statistics.rates.delivery}% Zustellrate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Geöffnet</p>
                <p className="text-2xl font-bold">
                  {(data.statistics.byStatus.opened + data.statistics.byStatus.clicked).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={data.statistics.rates.open} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{data.statistics.rates.open}% Öffnungsrate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bounced/Failed</p>
                <p className="text-2xl font-bold">
                  {(data.statistics.byStatus.bounced + data.statistics.byStatus.failed).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={data.statistics.rates.bounce} className="h-1.5 [&>div]:bg-amber-500" />
              <p className="text-xs text-muted-foreground mt-1">{data.statistics.rates.bounce}% Bounce-Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raten-Übersicht */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RateCard
          title="Zustellrate"
          rate={data.statistics.rates.delivery}
          icon={CheckCircle2}
          color="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          description="Anteil erfolgreich zugestellter E-Mails"
        />
        <RateCard
          title="Öffnungsrate"
          rate={data.statistics.rates.open}
          icon={Eye}
          color="bg-purple-500/20 text-purple-600 dark:text-purple-400"
          description="Anteil geöffneter E-Mails"
        />
        <RateCard
          title="Klickrate"
          rate={data.statistics.rates.click}
          icon={MousePointer}
          color="bg-blue-500/20 text-blue-600 dark:text-blue-400"
          description="Anteil der E-Mails mit Klicks"
        />
        <RateCard
          title="Bounce-Rate"
          rate={data.statistics.rates.bounce}
          icon={AlertTriangle}
          color="bg-amber-500/20 text-amber-600 dark:text-amber-400"
          description="Anteil nicht zustellbarer E-Mails"
        />
      </div>

      {/* Chart & Domains */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* E-Mail-Verlauf Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              E-Mail-Verlauf (30 Tage)
            </CardTitle>
            <CardDescription>
              Anzahl gesendeter E-Mails pro Tag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={data.chartData.emailsByDay} maxValue={maxChartValue} />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Vor 30 Tagen</span>
              <span>Heute</span>
            </div>
          </CardContent>
        </Card>

        {/* Domains */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Domains
            </CardTitle>
            <CardDescription>
              Verifizierte Absender-Domains in Resend
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data.isConfigured ? (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Resend nicht konfiguriert</p>
              </div>
            ) : data.domains.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Keine Domains konfiguriert</p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer">
                    Domain hinzufügen
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{domain.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Region: {domain.region}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {domain.capabilities?.sending === 'enabled' && (
                        <Badge variant="outline" className="text-xs">
                          <Send className="h-3 w-3 mr-1" />
                          Senden
                        </Badge>
                      )}
                      <DomainStatusBadge status={domain.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Webhook-Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Webhook-Konfiguration
          </CardTitle>
          <CardDescription>
            Konfiguriere Webhooks in Resend, um Echtzeit-Updates zu Events zu erhalten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-1">
              <p className="text-sm font-medium">Webhook-URL</p>
              <code className="text-xs text-muted-foreground break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/resend` : '/api/webhooks/resend'}
              </code>
            </div>
            <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            <p className="text-muted-foreground">Unterstützte Events:</p>
            <div className="flex flex-wrap gap-2">
              {['email.sent', 'email.delivered', 'email.opened', 'email.clicked', 'email.bounced', 'email.complained'].map((event) => (
                <Badge key={event} variant="secondary" className="font-mono text-xs">
                  {event}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template-Statistiken */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Template-Nutzung
          </CardTitle>
          <CardDescription>
            Meistgenutzte E-Mail-Templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.templateStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Noch keine E-Mails versendet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.templateStats.map((template, index) => (
                <div
                  key={template.templateId}
                  className="flex items-center gap-4"
                >
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{template.templateName}</p>
                    <p className="text-xs text-muted-foreground">
                      Zuletzt: {formatDistanceToNow(new Date(template.lastSent), { addSuffix: true, locale: de })}
                    </p>
                  </div>
                  <Badge variant="secondary">{template.count} gesendet</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Letzte E-Mails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Letzte E-Mails
          </CardTitle>
          <CardDescription>
            Die zuletzt versendeten E-Mails und ihr Status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Noch keine E-Mails versendet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empfänger</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Betreff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gesendet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.recipientEmail}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{email.templateName}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{email.subject}</TableCell>
                      <TableCell>
                        <StatusBadge status={email.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true, locale: de })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resend E-Mails (direkt von API) */}
      {data.isConfigured && data.resendEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Resend E-Mails (Live)
            </CardTitle>
            <CardDescription>
              Direkt von der Resend API abgerufene E-Mails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Von</TableHead>
                    <TableHead>An</TableHead>
                    <TableHead>Betreff</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.resendEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-mono text-xs">{email.from}</TableCell>
                      <TableCell>{email.to.join(', ')}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{email.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {email.last_event || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(email.created_at), { addSuffix: true, locale: de })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

