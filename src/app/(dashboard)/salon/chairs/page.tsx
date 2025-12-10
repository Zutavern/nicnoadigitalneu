'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Armchair,
  User,
  Euro,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface Chair {
  id: string
  name: string
  description: string | null
  dailyRate: number | null
  weeklyRate: number | null
  monthlyRate: number | null
  amenities: string[]
  images: string[]
  isAvailable: boolean
  isActive: boolean
  createdAt: Date
  currentRental: {
    id: string
    stylistId: string
    stylist: {
      id: string
      name: string
      email: string
      image: string | null
    } | null
    startDate: Date
    endDate: Date | null
    monthlyRent: number
    status: string
  } | null
}

interface ChairRental {
  id: string
  chairId: string
  chair: { id: string; name: string; monthlyRate: number | null }
  stylistId: string
  stylist: {
    id: string
    name: string
    email: string
    image: string | null
    stylistProfile?: {
      phone: string | null
      yearsExperience: number | null
      specialties: string[]
    }
  } | null
  startDate: Date
  endDate: Date | null
  monthlyRent: number
  deposit: number | null
  status: string
  notes: string | null
  createdAt: Date
}

export default function SalonChairsPage() {
  const [chairs, setChairs] = useState<Chair[]>([])
  const [rentals, setRentals] = useState<ChairRental[]>([])
  const [stats, setStats] = useState({ total: 0, available: 0, rented: 0, inactive: 0 })
  const [rentalStats, setRentalStats] = useState({ pending: 0, active: 0, completed: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingChair, setEditingChair] = useState<Chair | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    amenities: ''
  })

  useEffect(() => {
    fetchChairs()
    fetchRentals()
  }, [])

  const fetchChairs = async () => {
    try {
      const response = await fetch('/api/salon/chairs')
      if (!response.ok) throw new Error('Fehler beim Laden')
      const data = await response.json()
      setChairs(data.chairs || [])
      setStats(data.stats || { total: 0, available: 0, rented: 0, inactive: 0 })
    } catch {
      toast.error('Fehler beim Laden der Stühle')
    } finally {
      setLoading(false)
    }
  }

  const fetchRentals = async () => {
    try {
      const response = await fetch('/api/salon/chair-rentals')
      if (!response.ok) throw new Error('Fehler beim Laden')
      const data = await response.json()
      setRentals(data.rentals || [])
      setRentalStats(data.stats || { pending: 0, active: 0, completed: 0, cancelled: 0 })
    } catch {
      console.error('Fehler beim Laden der Mietanfragen')
    }
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...(editingChair && { id: editingChair.id }),
        name: formData.name,
        description: formData.description || null,
        dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null,
        monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
      }

      const response = await fetch('/api/salon/chairs', {
        method: editingChair ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Fehler beim Speichern')

      toast.success(editingChair ? 'Stuhl aktualisiert' : 'Stuhl erstellt')
      setIsCreateDialogOpen(false)
      setEditingChair(null)
      resetForm()
      fetchChairs()
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  const handleDelete = async (chairId: string) => {
    if (!confirm('Möchten Sie diesen Stuhl wirklich deaktivieren?')) return

    try {
      const response = await fetch(`/api/salon/chairs?id=${chairId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen')
      }

      toast.success('Stuhl deaktiviert')
      fetchChairs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen')
    }
  }

  const handleRentalAction = async (rentalId: string, action: 'accept' | 'reject' | 'terminate') => {
    const actionText = action === 'accept' ? 'akzeptieren' : action === 'reject' ? 'ablehnen' : 'beenden'
    if (!confirm(`Möchten Sie diese Mietanfrage wirklich ${actionText}?`)) return

    try {
      const response = await fetch('/api/salon/chair-rentals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalId, action })
      })

      if (!response.ok) throw new Error('Fehler bei der Aktion')

      const data = await response.json()
      toast.success(data.message)
      fetchChairs()
      fetchRentals()
    } catch {
      toast.error('Fehler bei der Verarbeitung')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      amenities: ''
    })
  }

  const openEditDialog = (chair: Chair) => {
    setEditingChair(chair)
    setFormData({
      name: chair.name,
      description: chair.description || '',
      dailyRate: chair.dailyRate?.toString() || '',
      weeklyRate: chair.weeklyRate?.toString() || '',
      monthlyRate: chair.monthlyRate?.toString() || '',
      amenities: chair.amenities.join(', ')
    })
    setIsCreateDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stuhlverwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Arbeitsplätze und Mietanfragen
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setEditingChair(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Stuhl
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingChair ? 'Stuhl bearbeiten' : 'Neuen Stuhl erstellen'}
              </DialogTitle>
              <DialogDescription>
                Fügen Sie einen neuen Arbeitsplatz hinzu oder bearbeiten Sie bestehende.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="z.B. Platz 1 - Fenster"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  placeholder="Besonderheiten des Arbeitsplatzes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Tag (€)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    placeholder="0"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyRate">Woche (€)</Label>
                  <Input
                    id="weeklyRate"
                    type="number"
                    placeholder="0"
                    value={formData.weeklyRate}
                    onChange={(e) => setFormData({ ...formData, weeklyRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyRate">Monat (€)</Label>
                  <Input
                    id="monthlyRate"
                    type="number"
                    placeholder="0"
                    value={formData.monthlyRate}
                    onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Ausstattung (kommagetrennt)</Label>
                <Input
                  id="amenities"
                  placeholder="Spiegel, Steckdose, Waschbecken..."
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name}>
                {editingChair ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Arbeitsplätze</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verfügbar</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Sofort mietbar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vermietet</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.rented}</div>
            <p className="text-xs text-muted-foreground">Aktive Mieten</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anfragen</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{rentalStats.pending}</div>
            <p className="text-xs text-muted-foreground">Ausstehend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chairs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chairs">Stühle ({chairs.length})</TabsTrigger>
          <TabsTrigger value="requests">
            Mietanfragen
            {rentalStats.pending > 0 && (
              <Badge variant="destructive" className="ml-2">{rentalStats.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Aktive Mieten ({rentalStats.active})</TabsTrigger>
        </TabsList>

        <TabsContent value="chairs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chairs.map((chair) => (
              <Card key={chair.id} className={!chair.isActive ? 'opacity-50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{chair.name}</CardTitle>
                      {chair.description && (
                        <CardDescription className="line-clamp-2">
                          {chair.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(chair)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(chair.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deaktivieren
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {chair.currentRental ? (
                      <Badge variant="secondary">
                        <User className="h-3 w-3 mr-1" />
                        {chair.currentRental.stylist?.name || 'Vermietet'}
                      </Badge>
                    ) : chair.isAvailable ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verfügbar
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Nicht verfügbar
                      </Badge>
                    )}
                  </div>

                  {chair.monthlyRate && (
                    <div className="flex items-center gap-1 text-lg font-semibold">
                      <Euro className="h-4 w-4" />
                      {chair.monthlyRate.toFixed(0)}
                      <span className="text-sm font-normal text-muted-foreground">/Monat</span>
                    </div>
                  )}

                  {chair.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {chair.amenities.slice(0, 3).map((amenity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {chair.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{chair.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {chairs.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Armchair className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Keine Stühle vorhanden</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Erstellen Sie Ihren ersten Arbeitsplatz, um Stuhlmieter anzuziehen.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ersten Stuhl erstellen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {rentals.filter(r => r.status === 'PENDING').map((rental) => (
            <Card key={rental.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{rental.stylist?.name || 'Unbekannt'}</h3>
                      <p className="text-sm text-muted-foreground">{rental.stylist?.email}</p>
                      {rental.stylist?.stylistProfile && (
                        <p className="text-xs text-muted-foreground">
                          {rental.stylist.stylistProfile.yearsExperience} Jahre Erfahrung
                          {rental.stylist.stylistProfile.specialties?.length > 0 && (
                            <> • {rental.stylist.stylistProfile.specialties.slice(0, 2).join(', ')}</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{rental.chair.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Ab {new Date(rental.startDate).toLocaleDateString('de-DE')}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      €{rental.monthlyRent}/Monat
                    </p>
                  </div>
                </div>
                {rental.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{rental.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => handleRentalAction(rental.id, 'accept')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Akzeptieren
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleRentalAction(rental.id, 'reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Ablehnen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {rentals.filter(r => r.status === 'PENDING').length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Keine offenen Anfragen</h3>
                <p className="text-muted-foreground text-center">
                  Neue Mietanfragen werden hier angezeigt.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {rentals.filter(r => r.status === 'ACTIVE').map((rental) => (
            <Card key={rental.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{rental.stylist?.name || 'Unbekannt'}</h3>
                      <p className="text-sm text-muted-foreground">{rental.stylist?.email}</p>
                      {rental.stylist?.stylistProfile?.phone && (
                        <p className="text-xs text-muted-foreground">
                          Tel: {rental.stylist.stylistProfile.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{rental.chair.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Seit {new Date(rental.startDate).toLocaleDateString('de-DE')}
                    </p>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Aktiv
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Monatliche Miete</p>
                    <p className="text-xl font-bold">€{rental.monthlyRent}</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => handleRentalAction(rental.id, 'terminate')}
                  >
                    Miete beenden
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {rentals.filter(r => r.status === 'ACTIVE').length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Armchair className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Keine aktiven Mieten</h3>
                <p className="text-muted-foreground text-center">
                  Akzeptierte Mietverträge werden hier angezeigt.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}







