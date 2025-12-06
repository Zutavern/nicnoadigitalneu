'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Users,
  Armchair,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
  Phone,
  Globe,
  Mail,
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

interface Salon {
  id: string
  userId: string
  salonName: string
  street: string | null
  city: string | null
  zipCode: string | null
  country: string | null
  phone: string | null
  website: string | null
  employeeCount: number | null
  chairCount: number | null
  salonSize: number | null
  description: string | null
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string | null
    email: string
    image: string | null
    onboardingCompleted: boolean
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

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([])
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
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    salonName: '',
    street: '',
    city: '',
    zipCode: '',
    phone: '',
    website: '',
    employeeCount: '',
    chairCount: '',
    description: '',
  })

  // Fetch salons from API
  const fetchSalons = useCallback(async (showRefreshing = false) => {
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

      const response = await fetch(`/api/admin/salons?${params}`)
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Salons')
      }

      const data = await response.json()
      setSalons(data.salons)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      toast.error('Fehler beim Laden der Salons')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [pagination.page, pagination.limit, searchQuery])

  useEffect(() => {
    fetchSalons()
  }, [fetchSalons])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getSubscriptionBadge = (status: string | null, priceId: string | null) => {
    if (!status || status === 'canceled' || status === 'incomplete_expired') {
      return <Badge variant="outline">Kostenlos</Badge>
    }
    if (status === 'active' || status === 'trialing') {
      // Determine plan based on priceId or default to Pro
      const isPro = priceId?.includes('pro') ?? true
      return isPro ? (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Pro</Badge>
      ) : (
        <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Enterprise</Badge>
      )
    }
    return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{status}</Badge>
  }

  const handleEdit = (salon: Salon) => {
    setSelectedSalon(salon)
    setEditForm({
      salonName: salon.salonName || '',
      street: salon.street || '',
      city: salon.city || '',
      zipCode: salon.zipCode || '',
      phone: salon.phone || '',
      website: salon.website || '',
      employeeCount: salon.employeeCount?.toString() || '',
      chairCount: salon.chairCount?.toString() || '',
      description: salon.description || '',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedSalon) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/salons/${selectedSalon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonName: editForm.salonName,
          street: editForm.street || null,
          city: editForm.city || null,
          zipCode: editForm.zipCode || null,
          phone: editForm.phone || null,
          website: editForm.website || null,
          employeeCount: editForm.employeeCount ? parseInt(editForm.employeeCount) : null,
          chairCount: editForm.chairCount ? parseInt(editForm.chairCount) : null,
          description: editForm.description || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Aktualisieren')
      }

      toast.success('Salon erfolgreich aktualisiert')
      setEditDialogOpen(false)
      fetchSalons(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSalon) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/salons/${selectedSalon.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen')
      }

      toast.success('Salon erfolgreich gelöscht')
      setDeleteDialogOpen(false)
      setSelectedSalon(null)
      fetchSalons(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stats
  const totalChairs = salons.reduce((sum, s) => sum + (s.chairCount || 0), 0)
  const totalEmployees = salons.reduce((sum, s) => sum + (s.employeeCount || 0), 0)
  const completedOnboarding = salons.filter(s => s.owner.onboardingCompleted).length

  if (isLoading && salons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Lade Salons...</p>
        </div>
      </div>
    )
  }

  if (error && salons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <p className="font-medium">Fehler beim Laden</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => fetchSalons()}>
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
            <Building2 className="h-8 w-8 text-primary" />
            Salon-Verwaltung
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle registrierten Salons
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchSalons(true)}
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
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-xs text-muted-foreground">Salons gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Armchair className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalChairs}</p>
                <p className="text-xs text-muted-foreground">Stühle gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Mitarbeiter</p>
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
                placeholder="Suchen nach Name, Besitzer, Stadt..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salons Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Salon</th>
                  <th className="text-left p-4 font-medium">Standort</th>
                  <th className="text-left p-4 font-medium">Kapazität</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Abo</th>
                  <th className="text-right p-4 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {salons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Keine Salons gefunden
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {salons.map((salon, index) => (
                      <motion.tr
                        key={salon.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-muted/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={salon.owner.image || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-purple-500/40">
                                {salon.salonName?.substring(0, 2).toUpperCase() || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{salon.salonName || 'Unbenannt'}</p>
                              <p className="text-sm text-muted-foreground">{salon.owner.name || salon.owner.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {salon.city ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {salon.city}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1" title="Stühle">
                              <Armchair className="h-3 w-3" />
                              {salon.chairCount || '-'}
                            </span>
                            <span className="flex items-center gap-1" title="Mitarbeiter">
                              <Users className="h-3 w-3" />
                              {salon.employeeCount || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {salon.owner.onboardingCompleted ? (
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
                          {getSubscriptionBadge(salon.owner.subscriptionStatus, salon.owner.priceId)}
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
                                setSelectedSalon(salon)
                                setViewDialogOpen(true)
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(salon)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                toast.info('Diese Funktion wird noch implementiert')
                              }}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Als Besitzer einloggen
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedSalon(salon)
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
              {pagination.total} Salons gefunden
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
            <DialogTitle>Salon Details</DialogTitle>
          </DialogHeader>
          {selectedSalon && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-purple-500/40 text-xl">
                    {selectedSalon.salonName?.substring(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedSalon.salonName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Besitzer: {selectedSalon.owner.name || selectedSalon.owner.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Adresse</p>
                  <p className="font-medium">
                    {selectedSalon.street || '-'}<br />
                    {selectedSalon.zipCode} {selectedSalon.city || '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Kapazität</p>
                  <p className="font-medium">
                    {selectedSalon.chairCount || 0} Stühle, {selectedSalon.employeeCount || 0} Mitarbeiter
                  </p>
                </div>
                {selectedSalon.phone && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Telefon
                    </p>
                    <p className="font-medium">{selectedSalon.phone}</p>
                  </div>
                )}
                {selectedSalon.website && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Website
                    </p>
                    <a 
                      href={selectedSalon.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {selectedSalon.website}
                    </a>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> E-Mail
                  </p>
                  <p className="font-medium">{selectedSalon.owner.email}</p>
                </div>
                {selectedSalon.salonSize && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Größe</p>
                    <p className="font-medium">{selectedSalon.salonSize} m²</p>
                  </div>
                )}
              </div>

              {selectedSalon.description && (
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Beschreibung</p>
                  <p className="text-sm">{selectedSalon.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                {selectedSalon.owner.onboardingCompleted ? (
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
                {getSubscriptionBadge(selectedSalon.owner.subscriptionStatus, selectedSalon.owner.priceId)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Salon bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Salon-Daten
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Salon-Name</Label>
              <Input
                id="edit-name"
                value={editForm.salonName}
                onChange={(e) => setEditForm({ ...editForm, salonName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-street">Straße</Label>
                <Input
                  id="edit-street"
                  value={editForm.street}
                  onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">Stadt</Label>
                <Input
                  id="edit-city"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-zip">PLZ</Label>
                <Input
                  id="edit-zip"
                  value={editForm.zipCode}
                  onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefon</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-chairs">Stühle</Label>
                <Input
                  id="edit-chairs"
                  type="number"
                  value={editForm.chairCount}
                  onChange={(e) => setEditForm({ ...editForm, chairCount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-employees">Mitarbeiter</Label>
                <Input
                  id="edit-employees"
                  type="number"
                  value={editForm.employeeCount}
                  onChange={(e) => setEditForm({ ...editForm, employeeCount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschreibung</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
            <DialogTitle>Salon löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diesen Salon löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          {selectedSalon && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedSalon.salonName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSalon.owner.email}</p>
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
