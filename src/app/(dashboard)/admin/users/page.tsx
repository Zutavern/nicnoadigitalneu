'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Key,
  LogIn,
  Building2,
  Scissors,
  Shield,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface User {
  id: string
  name: string | null
  email: string
  role: 'ADMIN' | 'SALON_OWNER' | 'STYLIST'
  emailVerified: string | null
  onboardingCompleted: boolean
  createdAt: string
  image: string | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const passwordRequirements = [
  { id: 'length', label: 'Mindestens 8 Zeichen', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'Ein Großbuchstabe', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Ein Kleinbuchstabe', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Eine Zahl', test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Ein Sonderzeichen', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STYLIST' as User['role'],
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
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      if (roleFilter !== 'all') {
        params.append('role', roleFilter)
      }

      const response = await fetch(`/api/admin/users?${params}`)
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Benutzer')
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      toast.error('Fehler beim Laden der Benutzer')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [pagination.page, pagination.limit, searchQuery, roleFilter])

  // Initial load and refetch on filter changes
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case 'SALON_OWNER':
        return (
          <Badge variant="outline" className="border-purple-500/50 text-purple-500">
            <Building2 className="h-3 w-3 mr-1" />
            Salonbetreiber
          </Badge>
        )
      case 'STYLIST':
        return (
          <Badge variant="outline" className="border-orange-500/50 text-orange-500">
            <Scissors className="h-3 w-3 mr-1" />
            Stylist
          </Badge>
        )
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

  const handleImpersonate = async (user: User) => {
    // TODO: Implement proper impersonation via API
    toast.info('Diese Funktion wird noch implementiert')
    console.log('Impersonating user:', user.id)
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: '',
    })
    setEditDialogOpen(true)
  }

  const isPasswordValid = passwordRequirements.every(req => req.test(newPassword))
  const isCreateFormValid = formData.name && formData.email && formData.password && 
    passwordRequirements.every(req => req.test(formData.password))

  // Calculate stats
  const totalUsers = pagination.total
  const salonOwners = users.filter(u => u.role === 'SALON_OWNER').length
  const stylists = users.filter(u => u.role === 'STYLIST').length
  const verifiedUsers = users.filter(u => u.emailVerified).length

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Lade Benutzer...</p>
        </div>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <p className="font-medium">Fehler beim Laden</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => fetchUsers()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Benutzerverwaltung
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle Benutzer der Plattform
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportieren
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Benutzer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
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
                <p className="text-xs text-muted-foreground">Salonbetreiber</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stylists}</p>
                <p className="text-xs text-muted-foreground">Stylisten</p>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name oder E-Mail..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={(value) => {
                setRoleFilter(value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Rolle filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Rollen</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SALON_OWNER">Salonbetreiber</SelectItem>
                  <SelectItem value="STYLIST">Stylist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Benutzer</th>
                  <th className="text-left p-4 font-medium">Rolle</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Registriert</th>
                  <th className="text-right p-4 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Keine Benutzer gefunden
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.image || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                                {user.name?.split(' ').map(n => n[0]).join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name || 'Unbekannt'}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {user.emailVerified ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="text-sm">
                                {user.emailVerified ? 'Verifiziert' : 'Nicht verifiziert'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {user.onboardingCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {user.onboardingCompleted ? 'Onboarding done' : 'Onboarding offen'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(user.createdAt).toLocaleDateString('de-DE')}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(user)
                                setPasswordDialogOpen(true)
                              }}>
                                <Key className="mr-2 h-4 w-4" />
                                Passwort ändern
                              </DropdownMenuItem>
                              {user.role !== 'ADMIN' && (
                                <DropdownMenuItem onClick={() => handleImpersonate(user)}>
                                  <LogIn className="mr-2 h-4 w-4" />
                                  Als Benutzer einloggen
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
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
              {pagination.total} Benutzer gefunden
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

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neuer Benutzer</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Benutzer auf der Plattform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                placeholder="Max Mustermann"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">E-Mail</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="max@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Rolle</Label>
              <Select value={formData.role} onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SALON_OWNER">Salonbetreiber</SelectItem>
                  <SelectItem value="STYLIST">Stylist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Passwort</Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="space-y-1 mt-2">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center gap-2 text-xs ${
                      req.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {req.test(formData.password) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    {req.label}
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Benutzerdaten
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              <Select value={formData.role} onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SALON_OWNER">Salonbetreiber</SelectItem>
                  <SelectItem value="STYLIST">Stylist</SelectItem>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Benutzer löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Avatar>
                  <AvatarFallback>
                    {selectedUser.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
            )}
          </div>
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

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Setzen Sie ein neues Passwort für {selectedUser?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {passwordRequirements.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center gap-2 text-xs ${
                    req.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  {req.test(newPassword) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  {req.label}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPasswordDialogOpen(false)
              setNewPassword('')
            }}>
              Abbrechen
            </Button>
            <Button onClick={handleChangePassword} disabled={isSubmitting || !isPasswordValid}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Passwort setzen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
