'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Scissors,
  Award,
  Briefcase,
  Loader2,
  CheckCircle2,
  Mail,
  Calendar,
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
import { createColumns, type Stylist } from './columns'
import {
  createDeleteAction,
  createBlockAction,
  createUnblockAction,
  type BulkAction,
} from '@/components/ui/data-table-bulk-actions'

export default function StylistsPage() {
  const [stylists, setStylists] = useState<Stylist[]>([])
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
      const response = await fetch('/api/admin/stylists?limit=100')
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Stylisten')
      }

      const data = await response.json()
      setStylists(data.stylists || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      toast.error('Fehler beim Laden der Stylisten')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchStylists()
  }, [fetchStylists])

  const handleView = (stylist: Stylist) => {
    setSelectedStylist(stylist)
    setViewDialogOpen(true)
  }

  const handleEdit = (stylist: Stylist) => {
    setSelectedStylist(stylist)
    setEditForm({
      yearsExperience: stylist.yearsExperience?.toString() || '',
      specialties: (stylist.specialties || []).join(', '),
      certifications: (stylist.certifications || []).join(', '),
      bio: stylist.bio || '',
    })
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (stylist: Stylist) => {
    setSelectedStylist(stylist)
    setDeleteDialogOpen(true)
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
          bio: editForm.bio || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Aktualisieren')
      }

      toast.success('Stuhlmieter erfolgreich aktualisiert')
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

      toast.success('Stuhlmieter erfolgreich gelöscht')
      setDeleteDialogOpen(false)
      setSelectedStylist(null)
      fetchStylists(true)
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

  // Bulk Actions - da Stylisten über User-IDs verknüpft sind
  const handleBulkDelete = async (ids: string[], reason?: string) => {
    // Stylisten löschen (über User-Tabelle)
    const userIds = stylists.filter(s => ids.includes(s.id)).map(s => s.userId)
    
    const response = await fetch('/api/admin/users/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids: userIds, reason }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Fehler beim Löschen')
    }
    
    const data = await response.json()
    toast.success(data.message)
    fetchStylists(true)
  }

  const handleBulkBlock = async (ids: string[], reason?: string) => {
    const userIds = stylists.filter(s => ids.includes(s.id)).map(s => s.userId)
    
    const response = await fetch('/api/admin/users/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block', ids: userIds, reason }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Fehler beim Sperren')
    }
    
    const data = await response.json()
    toast.success(data.message)
    fetchStylists(true)
  }

  const handleBulkUnblock = async (ids: string[]) => {
    const userIds = stylists.filter(s => ids.includes(s.id)).map(s => s.userId)
    
    const response = await fetch('/api/admin/users/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unblock', ids: userIds }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Fehler beim Entsperren')
    }
    
    const data = await response.json()
    toast.success(data.message)
    fetchStylists(true)
  }

  const bulkActions: BulkAction[] = useMemo(() => [
    createDeleteAction(handleBulkDelete, 'Stuhlmieter'),
    createBlockAction(handleBulkBlock, 'Stuhlmieter'),
    createUnblockAction(handleBulkUnblock, 'Stuhlmieter'),
  ], [stylists])

  // Stats
  const avgExperience = stylists.length > 0
    ? stylists.reduce((sum, s) => sum + (s.yearsExperience || 0), 0) / stylists.length
    : 0
  const completedOnboarding = stylists.filter(s => s.user?.onboardingCompleted).length

  if (error && stylists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Scissors className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold">Fehler beim Laden</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <Button onClick={() => fetchStylists()}>Erneut versuchen</Button>
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
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            Stylisten-Verwaltung
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie alle registrierten Stylisten
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stylists.length}</p>
                <p className="text-xs text-muted-foreground">Stuhlmieter gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgExperience.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Ø Jahre Erfahrung</p>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stylists.filter(s => (s.certifications?.length || 0) > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Mit Zertifizierungen</p>
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
            data={stylists}
            searchKey="userName"
            searchPlaceholder="Suchen nach Name, E-Mail..."
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
            ]}
            isLoading={isLoading}
            onRefresh={() => fetchStylists(true)}
            initialColumnVisibility={{
              email: false,
              certifications: false,
              bio: false,
              availability: false,
              registeredAt: false,
              createdAt: false,
              updatedAt: false,
            }}
            exportConfig={{
              filename: 'stylisten',
              columns: [
                { key: 'id', header: 'ID' },
                { key: 'user.name', header: 'Name' },
                { key: 'user.email', header: 'E-Mail' },
                { key: 'yearsExperience', header: 'Berufserfahrung (Jahre)' },
                { key: 'specialties', header: 'Spezialisierungen', transform: (v) => Array.isArray(v) ? v.join(', ') : '' },
                { key: 'certifications', header: 'Zertifizierungen', transform: (v) => Array.isArray(v) ? v.join(', ') : '' },
                { key: 'bio', header: 'Bio' },
                { key: 'availability', header: 'Verfügbarkeit', transform: (v) => {
                  const avail = v as Record<string, boolean> | null
                  if (!avail) return ''
                  return Object.entries(avail).filter(([, val]) => val).map(([day]) => day).join(', ')
                }},
                { key: 'user.onboardingCompleted', header: 'Onboarding', transform: (v) => v ? 'Ja' : 'Nein' },
                { key: 'user.subscriptionStatus', header: 'Abo-Status' },
                { key: 'user.registeredAt', header: 'Registriert am', transform: (v) => v ? new Date(v as string).toLocaleDateString('de-DE') : '' },
                { key: 'createdAt', header: 'Erstellt am', transform: (v) => v ? new Date(v as string).toLocaleDateString('de-DE') : '' },
              ],
            }}
            bulkActions={bulkActions}
            idAccessor={(row) => row.id}
            itemType="Stuhlmieter"
          />
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              {selectedStylist?.user?.name || 'Stuhlmieter Details'}
            </DialogTitle>
            <DialogDescription>
              Detaillierte Informationen zum Stylisten
            </DialogDescription>
          </DialogHeader>
          {selectedStylist && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {selectedStylist.user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <div>
                  <p className="font-medium">{selectedStylist.user?.name || 'Kein Name'}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedStylist.user?.email}
                  </p>
                </div>
                <div className="ml-auto">
                  {selectedStylist.user?.onboardingCompleted ? (
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
                    <Briefcase className="h-3 w-3" /> Berufserfahrung
                  </p>
                  <p className="font-medium">
                    {selectedStylist.yearsExperience 
                      ? `${selectedStylist.yearsExperience} Jahre` 
                      : 'Nicht angegeben'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Registriert
                  </p>
                  <p className="font-medium">
                    {selectedStylist.user?.registeredAt 
                      ? new Date(selectedStylist.user.registeredAt).toLocaleDateString('de-DE')
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Specialties */}
              {(selectedStylist.specialties?.length || 0) > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Spezialisierungen</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStylist.specialties.map((spec, i) => (
                      <Badge key={i} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {(selectedStylist.certifications?.length || 0) > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Zertifizierungen</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStylist.certifications.map((cert, i) => (
                      <Badge key={i} className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        <Award className="mr-1 h-3 w-3" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedStylist.bio && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Über mich</p>
                  <p className="text-sm">{selectedStylist.bio}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Stuhlmieter bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Informationen des Stylisten
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-experience">Berufserfahrung (Jahre)</Label>
              <Input
                id="edit-experience"
                type="number"
                value={editForm.yearsExperience}
                onChange={(e) => setEditForm({ ...editForm, yearsExperience: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-specialties">Spezialisierungen (kommagetrennt)</Label>
              <Input
                id="edit-specialties"
                value={editForm.specialties}
                onChange={(e) => setEditForm({ ...editForm, specialties: e.target.value })}
                placeholder="z.B. Colorationen, Balayage, Hochsteckfrisuren"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-certifications">Zertifizierungen (kommagetrennt)</Label>
              <Input
                id="edit-certifications"
                value={editForm.certifications}
                onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })}
                placeholder="z.B. Meisterbrief, L'Oréal Colorist"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stuhlmieter löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie den Stylisten "{selectedStylist?.user?.name}" löschen möchten?
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
