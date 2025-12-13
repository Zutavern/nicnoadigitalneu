'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  UserCheck,
  UserX,
  ExternalLink,
  Briefcase,
  ChevronDown,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { de } from 'date-fns/locale'

interface JobApplication {
  id: string
  jobId: string | null
  firstName: string
  lastName: string
  email: string
  phone: string | null
  coverLetter: string | null
  cvUrl: string
  cvFileName: string
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEW' | 'REJECTED' | 'ACCEPTED'
  notes: string | null
  createdAt: string
  updatedAt: string
  job: {
    id: string
    title: string
    category: string
  } | null
}

const statusConfig = {
  PENDING: { label: 'Neu', color: 'bg-blue-500', icon: Clock, variant: 'default' as const },
  REVIEWED: { label: 'Geprüft', color: 'bg-yellow-500', icon: Eye, variant: 'secondary' as const },
  INTERVIEW: { label: 'Interview', color: 'bg-purple-500', icon: MessageSquare, variant: 'default' as const },
  REJECTED: { label: 'Abgelehnt', color: 'bg-red-500', icon: UserX, variant: 'destructive' as const },
  ACCEPTED: { label: 'Angenommen', color: 'bg-green-500', icon: UserCheck, variant: 'default' as const },
}

export default function HRPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterJob, setFilterJob] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([])

  useEffect(() => {
    fetchApplications()
    fetchJobs()
  }, [])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/applications')
      if (!res.ok) throw new Error('Failed to fetch applications')
      const data = await res.json()
      setApplications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Fehler beim Laden der Bewerbungen')
      setApplications([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/admin/jobs?includeInactive=true')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.map((j: { id: string; title: string }) => ({ id: j.id, title: j.title })))
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      toast.success('Status aktualisiert')
      fetchApplications()
      
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus as JobApplication['status'] })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Fehler beim Aktualisieren des Status')
    } finally {
      setIsSaving(false)
    }
  }

  const updateApplicationNotes = async () => {
    if (!selectedApplication) return
    
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!res.ok) throw new Error('Failed to update notes')

      toast.success('Notizen gespeichert')
      fetchApplications()
      setSelectedApplication({ ...selectedApplication, notes })
    } catch (error) {
      console.error('Error updating notes:', error)
      toast.error('Fehler beim Speichern der Notizen')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteApplication = async (applicationId: string) => {
    if (!confirm('Möchten Sie diese Bewerbung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return

    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete application')

      toast.success('Bewerbung gelöscht')
      fetchApplications()
      setDetailDialogOpen(false)
    } catch (error) {
      console.error('Error deleting application:', error)
      toast.error('Fehler beim Löschen der Bewerbung')
    }
  }

  const openDetailDialog = (application: JobApplication) => {
    setSelectedApplication(application)
    setNotes(application.notes || '')
    setDetailDialogOpen(true)
  }

  const filteredApplications = applications.filter((app) => {
    if (filterStatus !== 'all' && app.status !== filterStatus) return false
    if (filterJob !== 'all' && app.jobId !== filterJob && !(filterJob === 'initiative' && !app.jobId)) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const fullName = `${app.firstName} ${app.lastName}`.toLowerCase()
      const email = app.email.toLowerCase()
      if (!fullName.includes(query) && !email.includes(query)) return false
    }
    return true
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    reviewed: applications.filter(a => a.status === 'REVIEWED').length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            HR - Bewerber
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle eingegangenen Bewerbungen
          </p>
        </div>
        <Button variant="outline" onClick={fetchApplications}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Aktualisieren
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Neu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              Geprüft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.reviewed}</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              Interview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.interview}</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              Angenommen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.accepted}</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-500" />
              Abgelehnt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Bewerber suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${config.color}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Stelle:</Label>
              <Select value={filterJob} onValueChange={setFilterJob}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Stellen</SelectItem>
                  <SelectItem value="initiative">Initiativbewerbungen</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Bewerbungen ({filteredApplications.length})</CardTitle>
          <CardDescription>
            Klicken Sie auf eine Bewerbung, um Details zu sehen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine Bewerbungen gefunden</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((application) => {
                const status = statusConfig[application.status]
                const StatusIcon = status.icon
                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => openDetailDialog(application)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {application.firstName[0]}{application.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">
                                {application.firstName} {application.lastName}
                              </h3>
                              <Badge variant={status.variant} className="text-xs">
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {status.label}
                              </Badge>
                              {application.job ? (
                                <Badge variant="outline" className="text-xs">
                                  <Briefcase className="mr-1 h-3 w-3" />
                                  {application.job.title}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Initiativ
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {application.email}
                              </span>
                              {application.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {application.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true, locale: de })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm">
                                  Status
                                  <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {Object.entries(statusConfig).map(([key, config]) => {
                                  const Icon = config.icon
                                  return (
                                    <DropdownMenuItem
                                      key={key}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        updateApplicationStatus(application.id, key)
                                      }}
                                      className={application.status === key ? 'bg-muted' : ''}
                                    >
                                      <Icon className="mr-2 h-4 w-4" />
                                      {config.label}
                                      {application.status === key && (
                                        <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                                      )}
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {selectedApplication.firstName[0]}{selectedApplication.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {selectedApplication.firstName} {selectedApplication.lastName}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusConfig[selectedApplication.status].variant}>
                        {statusConfig[selectedApplication.status].label}
                      </Badge>
                      {selectedApplication.job ? (
                        <Badge variant="outline">
                          {selectedApplication.job.title}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Initiativbewerbung</Badge>
                      )}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Eingegangen am {format(new Date(selectedApplication.createdAt), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Kontaktdaten */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Kontaktdaten</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">E-Mail</p>
                        <a href={`mailto:${selectedApplication.email}`} className="text-sm font-medium hover:text-primary">
                          {selectedApplication.email}
                        </a>
                      </div>
                    </div>
                    {selectedApplication.phone && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Telefon</p>
                          <a href={`tel:${selectedApplication.phone}`} className="text-sm font-medium hover:text-primary">
                            {selectedApplication.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lebenslauf */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Lebenslauf</h3>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedApplication.cvFileName}</p>
                      <p className="text-xs text-muted-foreground">PDF-Dokument</p>
                    </div>
                    <Button asChild>
                      <a href={selectedApplication.cvUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Herunterladen
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Anschreiben */}
                {selectedApplication.coverLetter && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Anschreiben</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                    </div>
                  </div>
                )}

                {/* Status ändern */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Status ändern</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const Icon = config.icon
                      const isActive = selectedApplication.status === key
                      return (
                        <Button
                          key={key}
                          variant={isActive ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateApplicationStatus(selectedApplication.id, key)}
                          disabled={isSaving}
                          className={isActive ? '' : 'hover:bg-muted'}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {config.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Notizen */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Interne Notizen</h3>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notizen zu dieser Bewerbung hinzufügen..."
                    rows={4}
                  />
                  <Button onClick={updateApplicationNotes} disabled={isSaving} size="sm">
                    {isSaving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</>
                    ) : (
                      'Notizen speichern'
                    )}
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="destructive"
                  onClick={() => deleteApplication(selectedApplication.id)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Bewerbung löschen
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" asChild className="flex-1 sm:flex-none">
                    <a href={`mailto:${selectedApplication.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      E-Mail senden
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)} className="flex-1 sm:flex-none">
                    Schließen
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}






