'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileCheck,
  User,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  MessageSquare,
  Building2,
  Shield,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Mail,
  Phone,
  Upload,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { DocumentViewerDialog } from '@/components/ui/document-viewer-dialog'

interface OnboardingApplication {
  id: string
  userId: string
  user: {
    name: string | null
    email: string
  }
  companyName: string | null
  taxId: string | null
  businessStreet: string | null
  businessCity: string | null
  businessZipCode: string | null
  onboardingStatus: 'IN_PROGRESS' | 'PENDING_DOCUMENTS' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
  currentStep: number
  createdAt: string
  updatedAt: string
  documents: {
    masterCertificate: { url: string | null; status: string; notAvailable?: boolean }
    businessRegistration: { url: string | null; status: string; notAvailable?: boolean }
    liabilityInsurance: { url: string | null; status: string; notAvailable?: boolean }
    statusDetermination: { url: string | null; status: string; notAvailable?: boolean }
    craftsChamber: { url: string | null; status: string; notAvailable?: boolean }
  }
  compliance: {
    ownPhone: boolean | string
    ownAppointmentBook: boolean | string
    ownCashRegister: boolean | string
    ownPriceList: boolean | string
    ownBranding: boolean | string
  }
  selfEmploymentDeclaration: boolean
  adminNotes: string | null
}


const documentLabels: Record<string, string> = {
  masterCertificate: 'Meisterbrief / Ausnahmebewilligung',
  businessRegistration: 'Gewerbeanmeldung',
  liabilityInsurance: 'Betriebshaftpflichtversicherung',
  statusDetermination: 'Statusfeststellung (V027)',
  craftsChamber: 'Eintragung Handwerkskammer',
}

const complianceLabels: Record<string, string> = {
  ownPhone: 'Eigenes Telefon',
  ownAppointmentBook: 'Eigenes Terminbuch',
  ownCashRegister: 'Eigene Kasse/EC-Terminal',
  ownPriceList: 'Eigene Preisliste',
  ownBranding: 'Eigenes Branding',
}

export default function OnboardingReviewPage() {
  const [applications, setApplications] = useState<OnboardingApplication[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<OnboardingApplication | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  
  // Document Viewer states
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState<string>('')
  const [viewerTitle, setViewerTitle] = useState<string>('')
  
  // Upload Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadDocumentKey, setUploadDocumentKey] = useState<string>('')
  const [uploadUserId, setUploadUserId] = useState<string>('')
  const [uploadOnboardingId, setUploadOnboardingId] = useState<string>('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Daten laden
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/onboarding')
      if (res.ok) {
        const data = await res.json()
        // Unterstützt sowohl { applications: [...] } als auch direkt [...]
        setApplications(Array.isArray(data) ? data : (data.applications || []))
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const pendingCount = applications.filter(a => 
    a.onboardingStatus === 'PENDING_REVIEW' || a.onboardingStatus === 'PENDING_DOCUMENTS'
  ).length

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.onboardingStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_DOCUMENTS':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Dokumente fehlen</Badge>
      case 'PENDING_REVIEW':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Prüfung ausstehend</Badge>
      case 'APPROVED':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Genehmigt</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Abgelehnt</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Bearbeitung</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Prüfe ob Dokumente fehlen
  const hasAllDocuments = (app: OnboardingApplication) => {
    return Object.values(app.documents).every(doc => doc.url || doc.notAvailable)
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'UPLOADED':
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleApprove = async () => {
    if (!selectedApplication) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/onboarding/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', adminNotes }),
      })
      
      if (res.ok) {
        setApplications(prev => prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, onboardingStatus: 'APPROVED' as const, adminNotes } 
            : app
        ))
      }
    } catch (error) {
      console.error('Error approving application:', error)
    } finally {
      setApproveDialogOpen(false)
      setSelectedApplication(null)
      setAdminNotes('')
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApplication) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/onboarding/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', adminNotes }),
      })
      
      if (res.ok) {
        setApplications(prev => prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, onboardingStatus: 'REJECTED' as const, adminNotes } 
            : app
        ))
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
    } finally {
      setRejectDialogOpen(false)
      setSelectedApplication(null)
      setAdminNotes('')
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  // Document Viewer öffnen
  const openDocumentViewer = (url: string, title: string) => {
    setViewerUrl(url)
    setViewerTitle(title)
    setViewerOpen(true)
  }
  
  // Upload Dialog öffnen
  const openUploadDialog = (app: OnboardingApplication, documentKey: string) => {
    setUploadUserId(app.userId)
    setUploadOnboardingId(app.id)
    setUploadDocumentKey(documentKey)
    setUploadFile(null)
    setUploadDialogOpen(true)
  }
  
  // Admin Upload für Nutzer
  const handleAdminUpload = async () => {
    if (!uploadFile || !uploadUserId || !uploadDocumentKey || !uploadOnboardingId) return
    
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('userId', uploadUserId)
      formData.append('documentKey', uploadDocumentKey)
      formData.append('onboardingId', uploadOnboardingId)
      
      const res = await fetch('/api/admin/onboarding/upload-document', {
        method: 'POST',
        body: formData,
      })
      
      if (res.ok) {
        const data = await res.json()
        
        // Update local state
        setApplications(prev => prev.map(app => {
          if (app.id === uploadOnboardingId) {
            return {
              ...app,
              documents: {
                ...app.documents,
                [uploadDocumentKey]: {
                  ...app.documents[uploadDocumentKey as keyof typeof app.documents],
                  url: data.url,
                  status: 'UPLOADED',
                }
              },
              // Update status if all documents are now uploaded
              onboardingStatus: data.newStatus || app.onboardingStatus,
            }
          }
          return app
        }))
        
        setUploadDialogOpen(false)
        setUploadFile(null)
      } else {
        const errorData = await res.json()
        alert(`Fehler: ${errorData.error || 'Upload fehlgeschlagen'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload fehlgeschlagen')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-primary" />
            Onboarding-Prüfung
            {pendingCount > 0 && (
              <Badge className="bg-amber-500 text-white">
                {pendingCount} ausstehend
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Prüfe und genehmige neue Stuhlmieter-Anträge
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchApplications()} disabled={isInitialLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isInitialLoading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications.filter(a => a.onboardingStatus === 'PENDING_DOCUMENTS').length}</p>
                <p className="text-sm text-muted-foreground">Dokumente fehlen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications.filter(a => a.onboardingStatus === 'PENDING_REVIEW').length}</p>
                <p className="text-sm text-muted-foreground">Prüfung ausstehend</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications.filter(a => a.onboardingStatus === 'APPROVED').length}</p>
                <p className="text-sm text-muted-foreground">Genehmigt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications.filter(a => a.onboardingStatus === 'REJECTED').length}</p>
                <p className="text-sm text-muted-foreground">Abgelehnt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-sm text-muted-foreground">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name, Firma oder E-Mail..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="PENDING_DOCUMENTS">Dokumente fehlen</SelectItem>
                <SelectItem value="PENDING_REVIEW">Prüfung ausstehend</SelectItem>
                <SelectItem value="APPROVED">Genehmigt</SelectItem>
                <SelectItem value="REJECTED">Abgelehnt</SelectItem>
                <SelectItem value="IN_PROGRESS">In Bearbeitung</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine Anträge gefunden</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`overflow-hidden transition-all duration-200 ${expandedId === app.id ? 'ring-2 ring-primary' : ''}`}>
                {/* Header Row */}
                <div 
                  className="p-4 md:p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{app.companyName || 'Unbenannt'}</h3>
                          {getStatusBadge(app.onboardingStatus)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{app.user.name || app.user.email}</span>
                          <span>•</span>
                          <span>{formatDate(app.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Nachricht senden Button - immer anzeigen bei ausstehenden Anträgen */}
                      {(app.onboardingStatus === 'PENDING_DOCUMENTS' || app.onboardingStatus === 'PENDING_REVIEW') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-500 border-blue-500/20 hover:bg-blue-500/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `/admin/messages?recipient=${app.userId}`
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Nachricht
                        </Button>
                      )}
                      
                      {/* Genehmigen/Ablehnen nur bei PENDING_REVIEW (alle Dokumente vorhanden) */}
                      {app.onboardingStatus === 'PENDING_REVIEW' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedApplication(app)
                              setApproveDialogOpen(true)
                            }}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Genehmigen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedApplication(app)
                              setRejectDialogOpen(true)
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Ablehnen
                          </Button>
                        </>
                      )}
                      
                      {/* Bei PENDING_DOCUMENTS: Ausgegraut anzeigen */}
                      {app.onboardingStatus === 'PENDING_DOCUMENTS' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-muted-foreground border-muted/20 opacity-50 cursor-not-allowed"
                            disabled
                            title="Dokumente fehlen noch"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Genehmigen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-muted-foreground border-muted/20 opacity-50 cursor-not-allowed"
                            disabled
                            title="Dokumente fehlen noch"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Ablehnen
                          </Button>
                        </>
                      )}
                      
                      {expandedId === app.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === app.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-6 pb-6 border-t">
                        <div className="grid gap-6 md:grid-cols-3 pt-6">
                          {/* Geschäftsdaten */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Building2 className="h-5 w-5 text-emerald-500" />
                              <h4 className="font-semibold">Geschäftsdaten</h4>
                            </div>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-muted-foreground">Firma:</span> {app.companyName}</p>
                              <p><span className="text-muted-foreground">Steuernr.:</span> {app.taxId || '-'}</p>
                              <p><span className="text-muted-foreground">Adresse:</span> {app.businessStreet}, {app.businessZipCode} {app.businessCity}</p>
                            </div>
                            <div className="pt-4 border-t space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${app.user.email}`} className="text-primary hover:underline">
                                  {app.user.email}
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Compliance */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Shield className="h-5 w-5 text-amber-500" />
                              <h4 className="font-semibold">Compliance-Check</h4>
                            </div>
                            <div className="space-y-2">
                              {Object.entries(app.compliance).map(([key, value]) => {
                                const isYes = value === true || value === 'yes'
                                const isPending = value === 'pending'
                                const isNo = value === false || value === 'no'
                                
                                return (
                                  <div key={key} className="flex items-center gap-2 text-sm">
                                    {isYes && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                    {isPending && <Clock className="h-4 w-4 text-amber-500" />}
                                    {isNo && <XCircle className="h-4 w-4 text-red-500" />}
                                    <span className={isYes ? '' : 'text-muted-foreground'}>
                                      {complianceLabels[key]}
                                    </span>
                                    {isPending && <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20 ml-1">In Arbeit</Badge>}
                                    {isNo && <Badge className="text-xs bg-red-500/10 text-red-500 border-red-500/20 ml-1">Nein</Badge>}
                                  </div>
                                )
                              })}
                            </div>
                            <div className="pt-4 border-t">
                              <div className="flex items-center gap-2 text-sm">
                                {app.selfEmploymentDeclaration ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span>Rechtliche Erklärung akzeptiert</span>
                              </div>
                            </div>
                          </div>

                          {/* Dokumente */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <h4 className="font-semibold">Dokumente</h4>
                            </div>
                            <div className="space-y-3">
                              {Object.entries(app.documents).map(([key, doc]) => (
                                <div key={key} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {doc.url ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                    ) : doc.notAvailable ? (
                                      <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{documentLabels[key]}</span>
                                    {doc.notAvailable && !doc.url && (
                                      <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20 flex-shrink-0">
                                        Später
                                      </Badge>
                                    )}
                                    {!doc.url && !doc.notAvailable && (
                                      <Badge className="text-xs bg-red-500/10 text-red-500 border-red-500/20 flex-shrink-0">
                                        Fehlt
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {doc.url ? (
                                      <>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openDocumentViewer(doc.url!, documentLabels[key])
                                          }}
                                          title="Ansehen"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          asChild
                                          title="In neuem Tab öffnen"
                                        >
                                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      </>
                                    ) : (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-primary border-primary/20 hover:bg-primary/10"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openUploadDialog(app, key)
                                        }}
                                        title="Dokument für Nutzer hochladen"
                                      >
                                        <Upload className="h-4 w-4 mr-1" />
                                        Hochladen
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Admin Notes */}
                        {app.adminNotes && (
                          <div className="mt-6 p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Admin-Notizen</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{app.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Antrag genehmigen
            </DialogTitle>
            <DialogDescription>
              Möchtest du den Antrag von {selectedApplication?.companyName} genehmigen?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notizen (optional)</label>
              <Textarea
                placeholder="Notizen zum Antrag..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={isLoading}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isLoading ? 'Wird genehmigt...' : 'Genehmigen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Antrag ablehnen
            </DialogTitle>
            <DialogDescription>
              Möchtest du den Antrag von {selectedApplication?.companyName} ablehnen?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Begründung (erforderlich)</label>
              <Textarea
                placeholder="Grund für die Ablehnung..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={isLoading || !adminNotes}
              variant="destructive"
            >
              {isLoading ? 'Wird abgelehnt...' : 'Ablehnen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document Viewer Dialog */}
      <DocumentViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        file={null}
        url={viewerUrl}
        title={viewerTitle}
      />
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Dokument für Nutzer hochladen
            </DialogTitle>
            <DialogDescription>
              Lade ein Dokument hoch, das du vom Nutzer per E-Mail erhalten hast.
              <br />
              <span className="font-medium">{documentLabels[uploadDocumentKey]}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Datei auswählen</label>
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{uploadFile.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Klicken zum Auswählen oder Datei hierher ziehen
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, JPG, PNG (max. 10MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        alert('Datei zu groß (max. 10MB)')
                        return
                      }
                      setUploadFile(file)
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleAdminUpload} 
              disabled={!uploadFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird hochgeladen...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Hochladen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

