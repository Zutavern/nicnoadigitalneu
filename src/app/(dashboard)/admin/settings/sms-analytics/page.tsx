'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  TrendingUp,
  BarChart3,
  Zap,
  Activity,
  Phone,
  Wallet,
  Shield,
  TestTube,
  Hash,
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

interface SmsAnalyticsData {
  isConfigured: boolean
  sevenIoApiError: string | null
  cacheInfo: {
    lastFetched: string
    nextRefresh: string
    isCached: boolean
  } | null
  settings: {
    senderId: string
    testNumbers: string[]
    testNumbersCount: number
  }
  balance: {
    current: number
    currency: string
    formatted: string
  }
  localStatistics: {
    totalVerifications: number
    last30Days: number
    last7Days: number
    last24Hours: number
    verified: number
    verificationRate: number
    totalSmsSent: number
  }
  journalStatistics: {
    totalSent: number
    delivered: number
    failed: number
    pending: number
    totalCost: number
  }
  chartData: {
    verificationsByDay: Array<{ date: string; count: number }>
  }
  recentVerifications: Array<{
    id: string
    phone: string
    verified: boolean
    smsCount: number
    attempts: number
    createdAt: string
    verifiedAt: string | null
    userName: string | null
    userEmail: string | null
  }>
  recentJournalEntries: Array<{
    id: string
    to: string
    from: string
    text: string
    timestamp: string
    status: string
    price: number
  }>
}

// Status Badge Component
function StatusBadge({ status, verified }: { status?: string; verified?: boolean }) {
  if (verified !== undefined) {
    return verified ? (
      <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Verifiziert
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Ausstehend
      </Badge>
    )
  }

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    DELIVERED: { label: 'Zugestellt', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', icon: <CheckCircle2 className="h-3 w-3" /> },
    delivered: { label: 'Zugestellt', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', icon: <CheckCircle2 className="h-3 w-3" /> },
    '1': { label: 'Zugestellt', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', icon: <CheckCircle2 className="h-3 w-3" /> },
    FAILED: { label: 'Fehlgeschlagen', color: 'bg-red-500/20 text-red-600 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
    failed: { label: 'Fehlgeschlagen', color: 'bg-red-500/20 text-red-600 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
    '0': { label: 'Fehlgeschlagen', color: 'bg-red-500/20 text-red-600 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
    PENDING: { label: 'Ausstehend', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
    pending: { label: 'Ausstehend', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
    BUFFERED: { label: 'Gepuffert', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400', icon: <Clock className="h-3 w-3" /> },
  }

  const config = statusConfig[status || ''] || { label: status || 'Unbekannt', color: 'bg-slate-500/20 text-slate-600', icon: null }

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
                  className="flex-1 bg-cyan-500/80 hover:bg-cyan-500 rounded-t transition-colors cursor-pointer min-w-[8px]"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{format(dateObj, 'dd. MMM', { locale: de })}</p>
                <p className="text-sm text-muted-foreground">{item.count} Verifizierungen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  subtitle,
  trend,
}: { 
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  subtitle?: string
  trend?: { value: number; label: string }
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}
        {trend && (
          <div className="mt-3">
            <Progress value={trend.value} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function SmsAnalyticsPage() {
  const [data, setData] = useState<SmsAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/sms-analytics')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Laden der SMS Analytics')
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

  const maxChartValue = Math.max(...data.chartData.verificationsByDay.map(d => d.count), 1)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-cyan-500" />
            SMS Analytics
          </h1>
          <p className="text-muted-foreground">
            Überwache deine SMS-Verifizierungen und seven.io Statistiken
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
                    seven.io nicht konfiguriert
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Um SMS-Analytics nutzen zu können, musst du zuerst seven.io in den Integrationen konfigurieren.
                    Ohne aktive Konfiguration können keine SMS versendet werden.
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/admin/settings/integrations">
                      <Zap className="h-4 w-4 mr-2" />
                      seven.io konfigurieren
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* API-Fehler */}
      {data.sevenIoApiError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">seven.io API-Fehler</p>
                <p className="text-sm">{data.sevenIoApiError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache-Info */}
      {!data.sevenIoApiError && data.cacheInfo && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>
            seven.io-Daten gecached {formatDistanceToNow(new Date(data.cacheInfo.lastFetched), { locale: de, addSuffix: true })}
          </span>
        </div>
      )}

      {/* Guthaben & Einstellungen */}
      {data.isConfigured && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-cyan-500/20">
                  <Wallet className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guthaben</p>
                  <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {data.balance.formatted}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://app.seven.io/account/prepaid" target="_blank" rel="noopener noreferrer">
                    Aufladen
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Absender-ID</p>
                  <p className="text-xl font-bold font-mono">{data.settings.senderId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <TestTube className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Testnummern</p>
                  <p className="text-xl font-bold">{data.settings.testNumbersCount}</p>
                </div>
              </div>
              {data.settings.testNumbers.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {data.settings.testNumbers.slice(0, 2).join(', ')}
                  {data.settings.testNumbers.length > 2 && ` +${data.settings.testNumbers.length - 2} mehr`}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kosten (Journal)</p>
                  <p className="text-xl font-bold">{data.journalStatistics.totalCost.toFixed(2)}€</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Basierend auf den letzten 100 SMS
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistik-Karten */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Verifizierungen"
          value={data.localStatistics.totalVerifications.toLocaleString()}
          icon={Phone}
          color="bg-blue-500/20 text-blue-600 dark:text-blue-400"
          subtitle={`${data.localStatistics.last24Hours} heute • ${data.localStatistics.last7Days} diese Woche`}
        />

        <StatCard
          title="Erfolgreich verifiziert"
          value={data.localStatistics.verified.toLocaleString()}
          icon={CheckCircle2}
          color="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          trend={{
            value: data.localStatistics.verificationRate,
            label: `${data.localStatistics.verificationRate}% Erfolgsrate`,
          }}
        />

        <StatCard
          title="SMS gesendet (lokal)"
          value={data.localStatistics.totalSmsSent.toLocaleString()}
          icon={Send}
          color="bg-purple-500/20 text-purple-600 dark:text-purple-400"
          subtitle="Summe aller Verifizierungs-SMS"
        />

        {data.isConfigured && (
          <StatCard
            title="SMS (seven.io)"
            value={data.journalStatistics.totalSent.toLocaleString()}
            icon={MessageSquare}
            color="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"
            subtitle={`${data.journalStatistics.delivered} zugestellt • ${data.journalStatistics.failed} fehlgeschlagen`}
          />
        )}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-500" />
            Verifizierungen (30 Tage)
          </CardTitle>
          <CardDescription>
            Anzahl der SMS-Verifizierungen pro Tag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={data.chartData.verificationsByDay} maxValue={maxChartValue} />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Vor 30 Tagen</span>
            <span>Heute</span>
          </div>
        </CardContent>
      </Card>

      {/* Letzte Verifizierungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-cyan-500" />
            Letzte Verifizierungen
          </CardTitle>
          <CardDescription>
            Die zuletzt durchgeführten Telefon-Verifizierungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentVerifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Noch keine Verifizierungen</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Nutzer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SMS</TableHead>
                    <TableHead>Versuche</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentVerifications.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono">{v.phone}</TableCell>
                      <TableCell>
                        {v.userName || v.userEmail || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge verified={v.verified} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{v.smsCount}</Badge>
                      </TableCell>
                      <TableCell>{v.attempts}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true, locale: de })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* seven.io Journal */}
      {data.isConfigured && data.recentJournalEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-cyan-500" />
              seven.io SMS-Log (Live)
            </CardTitle>
            <CardDescription>
              Direkt von der seven.io API abgerufene SMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>An</TableHead>
                    <TableHead>Von</TableHead>
                    <TableHead>Nachricht</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kosten</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentJournalEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs">{entry.to}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.from}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{entry.text}</TableCell>
                      <TableCell>
                        <StatusBadge status={entry.status} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.price.toFixed(3)}€</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.timestamp ? formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: de }) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <a href="https://app.seven.io/outbound" target="_blank" rel="noopener noreferrer">
                  Alle SMS in seven.io anzeigen
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

