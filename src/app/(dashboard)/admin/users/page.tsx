'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  Plus,
  Building2,
  Scissors,
  Shield,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  Ban,
  Trash2,
  Coins,
  Infinity,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { toast } from 'sonner'
import { DataTable } from '@/components/ui/data-table'
import { createColumns, type User } from './columns'
import {
  createDeleteAction,
  createBlockAction,
  createUnblockAction,
  createRestoreAction,
  type BulkAction,
} from '@/components/ui/data-table-bulk-actions'

const passwordRequirements = [
  { id: 'length', label: 'Mindestens 8 Zeichen', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'Ein Großbuchstabe', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Ein Kleinbuchstabe', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Eine Zahl', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Ein Sonderzeichen', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Credits state
  const [userCredits, setUserCredits] = useState<{
    balance: number
    isUnlimited: boolean
  } | null>(null)
  const [creditsAmount, setCreditsAmount] = useState('')
  const [creditsReason, setCreditsReason] = useState('')
  const [setUnlimited, setSetUnlimited] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STYLIST' as 'ADMIN' | 'SALON_OWNER' | 'STYLIST',
    password: '',
  })
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Fetch users from API
  const fetchUsers = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const response = await fetch('/api/admin/users?limit=100')
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Benutzer')
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      toast.error('Fehler beim Laden der Benutzer')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleView = (user: User) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: '',
    })
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleResetPassword = (user: User) => {
    setSelectedUser(user)
    setNewPassword('')
    setPasswordDialogOpen(true)
  }

  const handleLoginAs = async (user: User) => {
    toast.info('Diese Funktion wird noch implementiert')
    console.log('Impersonating user:', user.id)
  }

  const handleAdjustCredits = async (user: User) => {
    setSelectedUser(user)
    setCreditsAmount('')
    setCreditsReason('')
    setUserCredits(null)
    setSetUnlimited(false)
    setCreditsDialogOpen(true)
    
    // Lade aktuelle Credits des Users
    try {
      const res = await fetch(`/api/admin/credits?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setUserCredits({
          balance: data.balance ?? 0,
          isUnlimited: data.isUnlimited ?? false,
        })
        setSetUnlimited(data.isUnlimited ?? false)
      }
    } catch (error) {
      console.error('Error fetching user credits:', error)
    }
  }

  const handleSaveCredits = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/admin/credits/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: creditsAmount ? parseFloat(creditsAmount) : undefined,
          reason: creditsReason || 'Admin-Anpassung',
          isUnlimited: setUnlimited,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      toast.success(setUnlimited ? 'Unlimited-Status aktiviert' : 'Credits erfolgreich angepasst')
      setCreditsDialogOpen(false)
      setSelectedUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateUser = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Erstellen des Benutzers')
      }

      toast.success('Benutzer erfolgreich erstellt')
      setCreateDialogOpen(false)
      setFormData({ name: '', email: '', role: 'STYLIST', password: '' })
      fetchUsers(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Aktualisieren des Benutzers')
      }

      toast.success('Benutzer erfolgreich aktualisiert')
      setEditDialogOpen(false)
      setSelectedUser(null)
      fetchUsers(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen des Benutzers')
      }

      toast.success('Benutzer erfolgreich gelöscht')
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Ändern des Passworts')
      }

      toast.success('Passwort erfolgreich geändert')
      setPasswordDialogOpen(false)
      setSelectedUser(null)
      setNewPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create columns with callbacks
  const columns = useMemo(() => createColumns({
    onView: handleView,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onResetPassword: handleResetPassword,
    onLoginAs: handleLoginAs,
    onAdjustCredits: handleAdjustCredits,
  }), [])

  // Bulk Actions
  const handleBulkDelete = async (ids: string[], reason?: string) => {
    const response = await fetch('/api/admin/users/bulk', {
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
    fetchUsers(true)
  }

  const handleBulkBlock = async (ids: string[], reason?: string) => {
    const response = await fetch('/api/admin/users/bulk', {
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
    fetchUsers(true)
  }

  const handleBulkUnblock = async (ids: string[]) => {
    const response = await fetch('/api/admin/users/bulk', {
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
    fetchUsers(true)
  }

  const bulkActions: BulkAction[] = useMemo(() => [
    createDeleteAction(handleBulkDelete, 'Benutzer'),
    createBlockAction(handleBulkBlock, 'Benutzer'),
    createUnblockAction(handleBulkUnblock, 'Benutzer'),
  ], [])

  const isPasswordValid = passwordRequirements.every(req => req.test(newPassword))
  const isCreateFormValid = formData.name && formData.email && formData.password && 
    passwordRequirements.every(req => req.test(formData.password))

  // Stats
  const salonOwners = users.filter(u => u.role === 'SALON_OWNER').length
  const stylists = users.filter(u => u.role === 'STYLIST').length
  const admins = users.filter(u => u.role === 'ADMIN').length
  const verifiedUsers = users.filter(u => u.emailVerified).length

  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold">Fehler beim Laden</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <Button onClick={() => fetchUsers()}>Erneut versuchen</Button>
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
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            Benutzerverwaltung
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie alle Benutzer der Plattform
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Benutzer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{salonOwners}</p>
                <p className="text-xs text-muted-foreground">Salonbesitzer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stylists}</p>
                <p className="text-xs text-muted-foreground">Stuhlmieter</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{admins}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
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
                <p className="text-2xl font-bold">{verifiedUsers}</p>
                <p className="text-xs text-muted-foreground">Verifiziert</p>
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
            data={users}
            searchKey="userName"
            searchPlaceholder="Suchen nach Name, E-Mail..."
            filterableColumns={[
              {
                id: 'role',
                title: 'Rolle',
                options: [
                  { label: 'Admin', value: 'ADMIN' },
                  { label: 'Salonbesitzer', value: 'SALON_OWNER' },
                  { label: 'Stuhlmieter', value: 'STYLIST' },
                ],
              },
              {
                id: 'status',
                title: 'Status',
                options: [
                  { label: 'Aktiv', value: 'active' },
                  { label: 'Ausstehend', value: 'pending' },
                ],
              },
              {
                id: 'emailVerified',
                title: 'E-Mail',
                options: [
                  { label: 'Verifiziert', value: 'verified' },
                  { label: 'Nicht verifiziert', value: 'unverified' },
                ],
              },
            ]}
            isLoading={isLoading}
            onRefresh={() => fetchUsers(true)}
            initialColumnVisibility={{
              id: false,
              email: false,
            }}
            exportConfig={{
              filename: 'benutzer',
              columns: [
                { key: 'id', header: 'ID' },
                { key: 'name', header: 'Name' },
                { key: 'email', header: 'E-Mail' },
                { key: 'role', header: 'Rolle', transform: (v) => {
                  const roles: Record<string, string> = { ADMIN: 'Admin', SALON_OWNER: 'Salonbesitzer', STYLIST: 'Stuhlmieter' }
                  return roles[v as string] || String(v)
                }},
                { key: 'emailVerified', header: 'E-Mail verifiziert', transform: (v) => v ? 'Ja' : 'Nein' },
                { key: 'onboardingCompleted', header: 'Onboarding', transform: (v) => v ? 'Ja' : 'Nein' },
                { key: 'createdAt', header: 'Registriert am', transform: (v) => v ? new Date(v as string).toLocaleDateString('de-DE') : '' },
              ],
            }}
            bulkActions={bulkActions}
            idAccessor={(row) => row.id}
            itemType="Benutzer"
          />
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzerdetails</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {selectedUser.name?.split(' ').map(n => n[0]).join('') || selectedUser.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{selectedUser.name || 'Kein Name'}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Rolle</p>
                  <Badge className={
                    selectedUser.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
                    selectedUser.role === 'SALON_OWNER' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-pink-500/10 text-pink-500'
                  }>
                    {selectedUser.role === 'ADMIN' ? 'Admin' :
                     selectedUser.role === 'SALON_OWNER' ? 'Salonbesitzer' : 'Stuhlmieter'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {selectedUser.onboardingCompleted ? (
                    <Badge className="bg-green-500/10 text-green-500">Aktiv</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/10 text-yellow-500">Ausstehend</Badge>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">E-Mail verifiziert</p>
                  {selectedUser.emailVerified ? (
                    <Badge variant="outline" className="text-green-500">Ja</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-500">Nein</Badge>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Registriert</p>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neuer Benutzer</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Benutzer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">E-Mail</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Rolle</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as typeof formData.role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STYLIST">Stuhlmieter</SelectItem>
                  <SelectItem value="SALON_OWNER">Salonbesitzer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Passwort</Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="space-y-1 mt-2">
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2 text-sm">
                    {req.test(formData.password) ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={req.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting || !isCreateFormValid}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Benutzerdaten
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-Mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rolle</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as typeof formData.role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STYLIST">Stuhlmieter</SelectItem>
                  <SelectItem value="SALON_OWNER">Salonbesitzer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleEditUser} disabled={isSubmitting}>
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
            <DialogTitle>Benutzer löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie "{selectedUser?.name || selectedUser?.email}" löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Passwort zurücksetzen</DialogTitle>
            <DialogDescription>
              Setzen Sie das Passwort für "{selectedUser?.name || selectedUser?.email}" zurück
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="space-y-1 mt-2">
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2 text-sm">
                    {req.test(newPassword) ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={req.test(newPassword) ? 'text-green-500' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleChangePassword} disabled={isSubmitting || !isPasswordValid}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Passwort ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credits Dialog */}
      <Dialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              AI Credits anpassen
            </DialogTitle>
            <DialogDescription>
              Passen Sie die Credits für "{selectedUser?.name || selectedUser?.email}" an
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Aktuelle Credits Anzeige */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Aktueller Stand</p>
              <div className="flex items-center gap-2">
                {userCredits?.isUnlimited ? (
                  <div className="flex items-center gap-2 text-amber-500">
                    <Infinity className="h-6 w-6" />
                    <span className="text-2xl font-bold">Unlimited</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold">
                    {userCredits?.balance?.toFixed(2) ?? '—'} Credits
                  </span>
                )}
              </div>
            </div>

            {/* Unlimited Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Infinity className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Unlimited aktivieren</p>
                  <p className="text-sm text-muted-foreground">
                    Unbegrenzte AI-Nutzung (Tracking bleibt aktiv)
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={setUnlimited}
                onChange={(e) => setSetUnlimited(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300"
              />
            </div>

            {/* Credits Betrag */}
            {!setUnlimited && (
              <div className="space-y-2">
                <Label htmlFor="credits-amount">Credits hinzufügen/abziehen</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCreditsAmount(prev => {
                      const val = parseFloat(prev || '0')
                      return String(val - 10)
                    })}
                  >
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </Button>
                  <Input
                    id="credits-amount"
                    type="number"
                    step="0.01"
                    value={creditsAmount}
                    onChange={(e) => setCreditsAmount(e.target.value)}
                    placeholder="z.B. 50 oder -10"
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCreditsAmount(prev => {
                      const val = parseFloat(prev || '0')
                      return String(val + 10)
                    })}
                  >
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Positiv = Gutschrift, Negativ = Abzug
                </p>
              </div>
            )}

            {/* Grund */}
            <div className="space-y-2">
              <Label htmlFor="credits-reason">Grund (optional)</Label>
              <Input
                id="credits-reason"
                value={creditsReason}
                onChange={(e) => setCreditsReason(e.target.value)}
                placeholder="z.B. Testguthaben, Bonus..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSaveCredits} 
              disabled={isSubmitting || (!setUnlimited && !creditsAmount)}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
