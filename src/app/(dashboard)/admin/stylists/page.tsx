'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scissors,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Award,
  Briefcase,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
  Euro,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Stylist {
  id: string
  userId: string
  yearsExperience: number | null
  specialties: string[]
  certifications: string[]
  portfolio: string[]
  hourlyRate: number | null
  availability: Record<string, unknown> | null
  bio: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    onboardingCompleted: boolean
    registeredAt: string
    subscriptionStatus: string | null
    priceId: string | null
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function StylistsPage() {
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    yearsExperience: '',
    specialties: '',
    certifications: '',
    hourlyRate: '',
    bio: '',
  })

  // Fetch stylists from API
  const fetchStylists = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/admin/stylists?${params}`)
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Stylisten')
      }

      const data = await response.json()
      setStylists(data.stylists)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      toast.error('Fehler beim Laden der Stylisten')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [pagination.page, pagination.limit, searchQuery])

  useEffect(() => {
    fetchStylists()
  }, [fetchStylists])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getSubscriptionBadge = (status: string | null) => {
    if (!status || status === 'canceled' || status === 'incomplete_expired') {
      return <Badge variant="outline">Kostenlos</Badge>
    }
    if (status === 'active' || status === 'trialing') {
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Pro</Badge>
    }
    return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{status}</Badge>
  }

  const handleEdit = (stylist: Stylist) => {
    setSelectedStylist(stylist)
    setEditForm({
      yearsExperience: stylist.yearsExperience?.toString() || '',
      specialties: stylist.specialties.join(', '),
      certifications: stylist.certifications.join(', '),
      hourlyRate: stylist.hourlyRate?.toString() || '',
      bio: stylist.bio || '',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedStylist) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/stylists/${selectedStylist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearsExperience: editForm.yearsExperience ? parseInt(editForm.yearsExperience) : null,
          specialties: editForm.specialties ? editForm.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
          certifications: editForm.certifications ? editForm.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
          hourlyRate: editForm.hourlyRate ? parseFloat(editForm.hourlyRate) : null,
          bio: editForm.bio || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Aktualisieren')
      }

      toast.success('Stylist erfolgreich aktualisiert')
      setEditDialogOpen(false)
      fetchStylists(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedStylist) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/stylists/${selectedStylist.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen')
      }

      toast.success('Stylist-Profil erfolgreich gelöscht')
      setDeleteDialogOpen(false)
      setSelectedStylist(null)
      fetchStylists(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stats
  const avgExperience = stylists.length > 0 
    ? stylists.reduce((sum, s) => sum + (s.yearsExperience || 0), 0) / stylists.length 
    : 0
  const avgHourlyRate = stylists.length > 0 
    ? stylists.filter(s => s.hourlyRate).reduce((sum, s) => sum + (s.hourlyRate || 0), 0) / stylists.filter(s => s.hourlyRate).length || 0
    : 0
  const completedOnboarding = stylists.filter(s => s.user.onboardingCompleted).length

  if (isLoading && stylists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Lade Stylisten...</p>
        </div>
      </div>
    )
  }

  if (error && stylists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <p className="font-medium">Fehler beim Laden</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => fetchStylists()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Scissors className="h-8 w-8 text-primary" />
            Stylisten-Verwaltung
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle registrierten Stylisten
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchStylists(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-xs text-muted-foreground">Stylisten gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgExperience.toFixed(0)} Jahre</p>
                <p className="text-xs text-muted-foreground">Ø Erfahrung</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Euro className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">€{avgHourlyRate.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Ø Stundensatz</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedOnboarding}</p>
                <p className="text-xs text-muted-foreground">Onboarding fertig</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name, E-Mail, Spezialisierung..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stylists Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Stylist</th>
                  <th className="text-left p-4 font-medium">Erfahrung</th>
                  <th className="text-left p-4 font-medium">Spezialisierungen</th>
                  <th className="text-left p-4 font-medium">Stundensatz</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Abo</th>
                  <th className="text-right p-4 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {stylists.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Keine Stylisten gefunden
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {stylists.map((stylist, index) => (
                      <motion.tr
                        key={stylist.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-muted/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={stylist.user.image || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                                {stylist.user.name?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{stylist.user.name || 'Unbekannt'}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {stylist.user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {stylist.yearsExperience ? (
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-purple-500" />
                              <span>{stylist.yearsExperience} Jahre</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {stylist.specialties.slice(0, 2).map((spec, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {stylist.specialties.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{stylist.specialties.length - 2}
                              </Badge>
                            )}
                            {stylist.specialties.length === 0 && (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {stylist.hourlyRate ? (
                            <span className="font-medium">€{stylist.hourlyRate}/h</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {stylist.user.onboardingCompleted ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                              Aktiv
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              Ausstehend
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          {getSubscriptionBadge(stylist.user.subscriptionStatus)}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedStylist(stylist)
                                setViewDialogOpen(true)
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Profil anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(stylist)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast.info('Diese Funktion wird noch implementiert')
                              }}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Als Stylist einloggen
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedStylist(stylist)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              {pagination.total} Stylisten gefunden
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Seite {pagination.page} von {pagination.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Stylist Profil</DialogTitle>
          </DialogHeader>
          {selectedStylist && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStylist.user.image || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-xl">
                    {selectedStylist.user.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStylist.user.name || 'Unbekannt'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStylist.user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Erfahrung</p>
                  <p className="font-medium">{selectedStylist.yearsExperience || 0} Jahre</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Stundensatz</p>
                  <p className="font-medium">
                    {selectedStylist.hourlyRate ? `€${selectedStylist.hourlyRate}/h` : 'Nicht angegeben'}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-muted-foreground">Spezialisierungen</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedStylist.specialties.length > 0 ? (
                      selectedStylist.specialties.map((spec, i) => (
                        <Badge key={i} variant="outline">{spec}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Keine angegeben</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-muted-foreground">Zertifizierungen</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedStylist.certifications.length > 0 ? (
                      selectedStylist.certifications.map((cert, i) => (
                        <Badge key={i} variant="secondary">{cert}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Keine angegeben</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedStylist.bio && (
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Über mich</p>
                  <p className="text-sm">{selectedStylist.bio}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                {selectedStylist.user.onboardingCompleted ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Onboarding abgeschlossen
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    <XCircle className="h-3 w-3 mr-1" />
                    Onboarding ausstehend
                  </Badge>
                )}
                {getSubscriptionBadge(selectedStylist.user.subscriptionStatus)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Stylist bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie das Stylist-Profil
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-experience">Erfahrung (Jahre)</Label>
                <Input
                  id="edit-experience"
                  type="number"
                  value={editForm.yearsExperience}
                  onChange={(e) => setEditForm({ ...editForm, yearsExperience: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rate">Stundensatz (€)</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  step="0.01"
                  value={editForm.hourlyRate}
                  onChange={(e) => setEditForm({ ...editForm, hourlyRate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-specialties">Spezialisierungen (kommagetrennt)</Label>
              <Input
                id="edit-specialties"
                placeholder="z.B. Balayage, Hochsteckfrisuren, Colorationen"
                value={editForm.specialties}
                onChange={(e) => setEditForm({ ...editForm, specialties: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-certifications">Zertifizierungen (kommagetrennt)</Label>
              <Input
                id="edit-certifications"
                placeholder="z.B. L'Oréal Color, Wella Master"
                value={editForm.certifications}
                onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Über mich</Label>
              <Textarea
                id="edit-bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stylist-Profil löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie dieses Stylist-Profil löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          {selectedStylist && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                    {selectedStylist.user.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedStylist.user.name || 'Unbekannt'}</p>
                  <p className="text-sm text-muted-foreground">{selectedStylist.user.email}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
