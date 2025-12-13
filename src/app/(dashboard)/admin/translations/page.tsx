'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Trash2,
  RotateCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Zap,
  Search,
  PlusCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Language {
  id: string
  nativeName: string
  flag: string | null
}

interface Translation {
  id: string
  languageId: string
  language: Language
  contentType: string
  contentId: string
  field: string
  value: string
  status: 'PENDING' | 'TRANSLATED' | 'REVIEWED' | 'FAILED'
  isOutdated: boolean
  provider: string | null
  translatedAt: string | null
  updatedAt: string
}

interface TranslationJob {
  id: string
  languageId: string
  language: Language
  contentType: string
  contentId: string
  field: string
  originalText: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  priority: number
  attempts: number
  lastError: string | null
  createdAt: string
  completedAt: string | null
}

interface Stats {
  totalTranslations: number
  pendingTranslations: number
  translatedCount: number
  outdatedCount: number
  pendingJobs: number
  processingJobs: number
  failedJobs: number
}

export default function TranslationsAdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [jobs, setJobs] = useState<TranslationJob[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [languages, setLanguages] = useState<Language[]>([])
  const [contentTypes, setContentTypes] = useState<{ type: string; count: number }[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Filters
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Dialogs
  const [clearFailedDialog, setClearFailedDialog] = useState(false)
  const [retryAllDialog, setRetryAllDialog] = useState(false)
  const [scanResultDialog, setScanResultDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    newContent: number
    changedContent: number
    totalChanges: number
    changesByType: Record<string, number>
  } | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Fetch languages
      const langRes = await fetch('/api/admin/languages')
      const langData = await langRes.json()
      setLanguages(langData.map((l: Language & { stats: unknown }) => ({
        id: l.id,
        nativeName: l.nativeName,
        flag: l.flag,
      })))

      // Fetch translations with filters
      const params = new URLSearchParams()
      if (languageFilter !== 'all') params.set('languageId', languageFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (contentTypeFilter !== 'all') params.set('contentType', contentTypeFilter)
      params.set('page', page.toString())

      const transRes = await fetch(`/api/admin/translations?${params}`)
      const transData = await transRes.json()
      
      setTranslations(transData.translations || [])
      setStats(transData.stats)
      setContentTypes(transData.contentTypes || [])
      setTotalPages(transData.pagination?.totalPages || 1)

      // Fetch jobs
      const jobsRes = await fetch('/api/admin/translations/jobs?limit=20')
      const jobsData = await jobsRes.json()
      setJobs(jobsData.jobs || [])

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Fehler beim Laden der Daten')
    } finally {
      setIsLoading(false)
    }
  }, [languageFilter, statusFilter, contentTypeFilter, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh alle 3 Sekunden während Verarbeitung läuft oder Jobs pending sind
  useEffect(() => {
    if (isProcessing || (stats?.pendingJobs && stats.pendingJobs > 0) || (stats?.processingJobs && stats.processingJobs > 0)) {
      const interval = setInterval(fetchData, 3000)
      return () => clearInterval(interval)
    }
  }, [isProcessing, stats?.pendingJobs, stats?.processingJobs, fetchData])

  const handleClearFailed = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/translations/jobs?clearFailed=true', {
        method: 'DELETE',
      })
      const data = await res.json()
      toast.success(`${data.deleted} fehlgeschlagene Jobs gelöscht`)
      setClearFailedDialog(false)
      await fetchData()
    } catch (error) {
      toast.error('Fehler beim Löschen')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetryAll = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/translations/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retryAll: true }),
      })
      const data = await res.json()
      toast.success(`${data.retried} Jobs neu gestartet`)
      setRetryAllDialog(false)
      await fetchData()
    } catch (error) {
      toast.error('Fehler beim Neustarten')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetryJob = async (id: string) => {
    try {
      await fetch('/api/admin/translations/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      toast.success('Job neu gestartet')
      await fetchData()
    } catch (error) {
      toast.error('Fehler beim Neustarten')
    }
  }

  const handleProcessQueue = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      // ?all=true verarbeitet ALLE pending Jobs, nicht nur einen Batch
      const res = await fetch('/api/cron/process-translations?all=true')
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(`${data.successful || 0} von ${data.processed || 0} Übersetzungen verarbeitet`)
        await fetchData()
      }
    } catch (error) {
      toast.error('Fehler beim Verarbeiten der Queue')
    } finally {
      setIsProcessing(false)
    }
  }

  // Scan for changes in content
  const handleScanForChanges = async (preview: boolean = true) => {
    setIsScanning(true)
    try {
      if (preview) {
        // Nur scannen, zeigt Dialog mit Ergebnis
        const res = await fetch('/api/admin/translations/scan-changes')
        const data = await res.json()
        
        if (data.success) {
          setScanResult({
            newContent: data.summary.newContent,
            changedContent: data.summary.changedContent,
            totalChanges: data.summary.totalChanges,
            changesByType: data.changesByType || {},
          })
          setScanResultDialog(true)
        } else {
          toast.error('Fehler beim Scannen')
        }
      } else {
        // Jobs erstellen für alle Änderungen
        const res = await fetch('/api/admin/translations/scan-changes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            createJobsForNew: true, 
            createJobsForChanged: true 
          }),
        })
        const data = await res.json()
        
        if (data.success) {
          toast.success(data.message || `${data.actions.jobsCreated} Jobs erstellt`)
          setScanResultDialog(false)
          await fetchData()
        } else {
          toast.error('Fehler beim Erstellen der Jobs')
        }
      }
    } catch (error) {
      toast.error('Fehler beim Scannen')
    } finally {
      setIsScanning(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Ausstehend</Badge>
      case 'PROCESSING':
        return <Badge variant="default" className="bg-blue-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Läuft</Badge>
      case 'TRANSLATED':
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Fertig</Badge>
      case 'REVIEWED':
        return <Badge variant="default" className="bg-purple-500"><CheckCircle2 className="h-3 w-3 mr-1" />Geprüft</Badge>
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Fehler</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            Übersetzungen
          </h1>
          <p className="text-muted-foreground mt-1">
            Überwache und verwalte alle AI-Übersetzungen
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Scan for Changes Button */}
          <Button
            variant="outline"
            onClick={() => handleScanForChanges(true)}
            disabled={isScanning}
            className="border-primary/30 hover:bg-primary/10"
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Änderungen scannen
          </Button>
          
          {stats && stats.pendingJobs > 0 && (
            <Button
              onClick={handleProcessQueue}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Queue verarbeiten ({stats.pendingJobs})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', (isLoading || isProcessing || (stats?.pendingJobs && stats.pendingJobs > 0)) && 'animate-spin')} />
            {isProcessing || (stats?.pendingJobs && stats.pendingJobs > 0) ? 'Auto-Refresh...' : 'Aktualisieren'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Übersetzungen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTranslations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.translatedCount} fertig, {stats.pendingTranslations} ausstehend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Queue</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingJobs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.processingJobs} werden gerade verarbeitet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veraltet</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{stats.outdatedCount}</div>
              <p className="text-xs text-muted-foreground">
                Brauchen Aktualisierung
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fehler</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.failedJobs}</div>
              <div className="flex gap-2 mt-2">
                {stats.failedJobs > 0 && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRetryAllDialog(true)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setClearFailedDialog(true)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Löschen
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing Indicator */}
      {stats?.processingJobs && stats.processingJobs > 0 && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="relative">
              <Zap className="h-8 w-8 text-blue-500" />
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-500/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-blue-500">Übersetzung läuft...</h3>
              <p className="text-sm text-muted-foreground">
                {stats.processingJobs} Job(s) werden gerade verarbeitet. 
                {stats.pendingJobs} weitere in der Warteschlange.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="translations">Übersetzungen</TabsTrigger>
          <TabsTrigger value="jobs">Queue ({stats?.pendingJobs || 0})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* By Language */}
            <Card>
              <CardHeader>
                <CardTitle>Nach Sprache</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languages.filter(l => l.id !== 'de').slice(0, 10).map((lang) => (
                    <div key={lang.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      <Badge variant="secondary">
                        {translations.filter(t => t.languageId === lang.id).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Content Type */}
            <Card>
              <CardHeader>
                <CardTitle>Nach Inhaltstyp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentTypes.slice(0, 10).map((ct) => (
                    <div key={ct.type} className="flex items-center justify-between">
                      <span className="capitalize">{ct.type.replace(/_/g, ' ')}</span>
                      <Badge variant="secondary">{ct.count}</Badge>
                    </div>
                  ))}
                  {contentTypes.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Noch keine Übersetzungen vorhanden
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Letzte Jobs</CardTitle>
              <CardDescription>Die letzten 5 Übersetzungsjobs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sprache</TableHead>
                    <TableHead>Inhalt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.slice(0, 5).map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <span className="mr-2">{job.language.flag}</span>
                        {job.language.nativeName}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {job.contentType}/{job.field}
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString('de-DE')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {jobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Keine Jobs in der Queue
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Translations Tab */}
        <TabsContent value="translations" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sprache" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Sprachen</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.flag} {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="PENDING">Ausstehend</SelectItem>
                <SelectItem value="TRANSLATED">Übersetzt</SelectItem>
                <SelectItem value="REVIEWED">Geprüft</SelectItem>
                <SelectItem value="FAILED">Fehler</SelectItem>
              </SelectContent>
            </Select>

            <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Inhaltstyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                {contentTypes.map((ct) => (
                  <SelectItem key={ct.type} value={ct.type}>
                    {ct.type} ({ct.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Translations Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sprache</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Feld</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Aktualisiert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {translations.map((trans) => (
                    <TableRow key={trans.id}>
                      <TableCell>
                        <span className="mr-2">{trans.language.flag}</span>
                        {trans.language.nativeName}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {trans.contentType}
                      </TableCell>
                      <TableCell>{trans.field}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(trans.status)}
                          {trans.isOutdated && (
                            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Veraltet
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {trans.provider && (
                          <Badge variant="outline">{trans.provider}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(trans.updatedAt).toLocaleString('de-DE')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {translations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Keine Übersetzungen gefunden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Seite {page} von {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Übersetzungs-Queue</CardTitle>
              <CardDescription>
                Jobs werden automatisch im Hintergrund verarbeitet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sprache</TableHead>
                    <TableHead>Inhalt</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Versuche</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <span className="mr-2">{job.language.flag}</span>
                        {job.language.nativeName}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-mono text-xs">{job.contentType}</span>
                          <br />
                          <span className="text-muted-foreground text-xs">{job.field}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                        {job.lastError && (
                          <p className="text-xs text-destructive mt-1 max-w-[200px] truncate">
                            {job.lastError}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{job.attempts}/{3}</TableCell>
                      <TableCell>
                        {job.status === 'FAILED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRetryJob(job.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {jobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Keine Jobs in der Queue
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clear Failed Dialog */}
      <AlertDialog open={clearFailedDialog} onOpenChange={setClearFailedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fehlgeschlagene Jobs löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Alle {stats?.failedJobs} fehlgeschlagenen Jobs werden unwiderruflich gelöscht.
              Die Inhalte werden nicht übersetzt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearFailed}
              className="bg-destructive hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Retry All Dialog */}
      <AlertDialog open={retryAllDialog} onOpenChange={setRetryAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alle fehlgeschlagenen Jobs neu starten?</AlertDialogTitle>
            <AlertDialogDescription>
              {stats?.failedJobs} fehlgeschlagene Jobs werden zur erneuten Verarbeitung 
              in die Queue eingereiht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleRetryAll}>
              Alle neu starten
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scan Result Dialog */}
      <AlertDialog open={scanResultDialog} onOpenChange={setScanResultDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Scan-Ergebnis
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {scanResult && (
                  <>
                    {scanResult.totalChanges === 0 ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="font-medium text-green-500">Alles aktuell!</p>
                          <p className="text-sm text-muted-foreground">
                            Keine neuen oder geänderten Inhalte gefunden.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <div className="flex items-center gap-2 text-blue-500">
                              <PlusCircle className="h-4 w-4" />
                              <span className="font-medium">Neu</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{scanResult.newContent}</p>
                            <p className="text-xs text-muted-foreground">Noch nie übersetzt</p>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-center gap-2 text-amber-500">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-medium">Geändert</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{scanResult.changedContent}</p>
                            <p className="text-xs text-muted-foreground">Übersetzung veraltet</p>
                          </div>
                        </div>

                        {Object.keys(scanResult.changesByType).length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Betroffene Inhaltstypen:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(scanResult.changesByType).map(([type, count]) => (
                                <Badge key={type} variant="secondary">
                                  {type.replace(/_/g, ' ')}: {count}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                          Möchtest du für alle {scanResult.totalChanges} Änderungen 
                          Übersetzungs-Jobs erstellen?
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Schließen</AlertDialogCancel>
            {scanResult && scanResult.totalChanges > 0 && (
              <AlertDialogAction 
                onClick={() => handleScanForChanges(false)}
                disabled={isScanning}
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4 mr-2" />
                )}
                Jobs erstellen ({scanResult.totalChanges})
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


