'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Building2,
  Armchair,
  Users,
  CheckCircle2,
  Loader2,
  Phone,
  Globe,
  Mail,
  MapPin,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { DataTable } from '@/components/ui/data-table'
import { createColumns, type Salon } from './columns'
import {
  createDeleteAction,
  createBlockAction,
  createUnblockAction,
  type BulkAction,
} from '@/components/ui/data-table-bulk-actions'

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([])
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
      const response = await fetch('/api/admin/salons?limit=100')
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Salons')
      }

      const data = await response.json()
      setSalons(data.salons || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      toast.error('Fehler beim Laden der Salons')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchSalons()
  }, [fetchSalons])

  const handleView = (salon: Salon) => {
    setSelectedSalon(salon)
    setViewDialogOpen(true)
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

  const handleDeleteClick = (salon: Salon) => {
    setSelectedSalon(salon)
    setDeleteDialogOpen(true)
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

  // Create columns with callbacks
  const columns = useMemo(() => createColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDeleteClick,
  }), [])

  // Bulk Actions
  const handleBulkDelete = async (ids: string[], reason?: string) => {
    const response = await fetch('/api/admin/salons/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids, reason }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Fehler beim Löschen')
    }
    
    const data = await response.json()
    toast.success(data.message)
    fetchSalons(true)
  }

  const handleBulkBlock = async (ids: string[], reason?: string) => {
    const response = await fetch('/api/admin/salons/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block', ids, reason }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Fehler beim Sperren')
    }
    
    const data = await response.json()
    toast.success(data.message)
    fetchSalons(true)
  }

  const handleBulkUnblock = async (ids: string[]) => {
    const response = await fetch('/api/admin/salons/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unblock', ids }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Fehler beim Entsperren')
    }
    
    const data = await response.json()
    toast.success(data.message)
    fetchSalons(true)
  }

  const bulkActions: BulkAction[] = useMemo(() => [
    createDeleteAction(handleBulkDelete, 'Salons'),
    createBlockAction(handleBulkBlock, 'Salons'),
    createUnblockAction(handleBulkUnblock, 'Salons'),
  ], [])

  // Stats
  const totalChairs = salons.reduce((sum, s) => sum + (s.chairCount || 0), 0)
  const totalEmployees = salons.reduce((sum, s) => sum + (s.employeeCount || 0), 0)
  const completedOnboarding = salons.filter(s => s.owner?.onboardingCompleted).length

  // Get unique cities for filter
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(salons.map(s => s.city).filter(Boolean))]
    return uniqueCities.map(city => ({
      label: city as string,
      value: city as string,
    }))
  }, [salons])

  if (error && salons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold">Fehler beim Laden</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <Button onClick={() => fetchSalons()}>Erneut versuchen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            Salon-Verwaltung
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie alle registrierten Salons
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{salons.length}</p>
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

      {/* DataTable */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={salons}
            searchKey="salonName"
            searchPlaceholder="Suchen nach Name, Besitzer..."
            filterableColumns={[
              {
                id: 'status',
                title: 'Status',
                options: [
                  { label: 'Aktiv', value: 'active' },
                  { label: 'Ausstehend', value: 'pending' },
                ],
              },
              {
                id: 'subscription',
                title: 'Abo',
                options: [
                  { label: 'Kostenlos', value: 'free' },
                  { label: 'Aktiv', value: 'active' },
                  { label: 'Testphase', value: 'trialing' },
                ],
              },
              ...(cities.length > 0 ? [{
                id: 'city',
                title: 'Stadt',
                options: cities,
              }] : []),
            ]}
            isLoading={isLoading}
            onRefresh={() => fetchSalons(true)}
            initialColumnVisibility={{
              email: false,
              phone: false,
              website: false,
              address: false,
              zipCode: false,
              salonSize: false,
              createdAt: false,
              updatedAt: false,
            }}
            exportConfig={{
              filename: 'salons',
              columns: [
                { key: 'id', header: 'ID' },
                { key: 'salonName', header: 'Salonname' },
                { key: 'owner.name', header: 'Besitzer' },
                { key: 'owner.email', header: 'E-Mail' },
                { key: 'phone', header: 'Telefon' },
                { key: 'website', header: 'Website' },
                { key: 'street', header: 'Straße' },
                { key: 'zipCode', header: 'PLZ' },
                { key: 'city', header: 'Stadt' },
                { key: 'country', header: 'Land' },
                { key: 'chairCount', header: 'Stühle' },
                { key: 'employeeCount', header: 'Mitarbeiter' },
                { key: 'salonSize', header: 'Fläche (m²)' },
                { key: 'owner.onboardingCompleted', header: 'Onboarding', transform: (v) => v ? 'Ja' : 'Nein' },
                { key: 'owner.subscriptionStatus', header: 'Abo-Status' },
                { key: 'createdAt', header: 'Erstellt am', transform: (v) => v ? new Date(v as string).toLocaleDateString('de-DE') : '' },
                { key: 'updatedAt', header: 'Aktualisiert am', transform: (v) => v ? new Date(v as string).toLocaleDateString('de-DE') : '' },
                { key: 'description', header: 'Beschreibung' },
              ],
            }}
            bulkActions={bulkActions}
            idAccessor={(row) => row.id}
            itemType="Salons"
          />
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedSalon?.salonName || 'Salon Details'}
            </DialogTitle>
            <DialogDescription>
              Detaillierte Informationen zum Salon
            </DialogDescription>
          </DialogHeader>
          {selectedSalon && (
            <div className="space-y-6">
              {/* Owner Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/40 flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {selectedSalon.salonName?.substring(0, 2).toUpperCase() || '??'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{selectedSalon.owner?.name || 'Kein Name'}</p>
                  <p className="text-sm text-muted-foreground">{selectedSalon.owner?.email}</p>
                </div>
                <div className="ml-auto">
                  {selectedSalon.owner?.onboardingCompleted ? (
                    <Badge className="bg-green-500/10 text-green-500">Aktiv</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/10 text-yellow-500">Ausstehend</Badge>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Adresse
                  </p>
                  <p className="font-medium">
                    {selectedSalon.street || '-'}<br />
                    {selectedSalon.zipCode} {selectedSalon.city}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Telefon
                  </p>
                  <p className="font-medium">{selectedSalon.phone || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Website
                  </p>
                  <p className="font-medium">{selectedSalon.website || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> E-Mail
                  </p>
                  <p className="font-medium">{selectedSalon.owner?.email || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Armchair className="h-3 w-3" /> Stühle
                  </p>
                  <p className="font-medium">{selectedSalon.chairCount || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> Mitarbeiter
                  </p>
                  <p className="font-medium">{selectedSalon.employeeCount || 0}</p>
                </div>
              </div>

              {selectedSalon.description && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Beschreibung</p>
                  <p className="text-sm">{selectedSalon.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Salon bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Saloninformationen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Salonname</Label>
                <Input
                  id="edit-name"
                  value={editForm.salonName}
                  onChange={(e) => setEditForm({ ...editForm, salonName: e.target.value })}
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
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-street">Straße</Label>
                <Input
                  id="edit-street"
                  value={editForm.street}
                  onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-zip">PLZ</Label>
                <Input
                  id="edit-zip"
                  value={editForm.zipCode}
                  onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">Stadt</Label>
                <Input
                  id="edit-city"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-chairs">Anzahl Stühle</Label>
                <Input
                  id="edit-chairs"
                  type="number"
                  value={editForm.chairCount}
                  onChange={(e) => setEditForm({ ...editForm, chairCount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-employees">Anzahl Mitarbeiter</Label>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salon löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie den Salon "{selectedSalon?.salonName}" löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
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
