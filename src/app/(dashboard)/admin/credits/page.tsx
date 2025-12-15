'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Coins,
  Plus,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Gift,
  ArrowUpCircle,
  ArrowDownCircle,
  MoreVertical,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface CreditPackage {
  id: string
  name: string
  description: string | null
  credits: number
  bonusCredits: number
  bonusPercent: number | null
  priceEur: number
  isActive: boolean
  isPopular: boolean
  isHidden: boolean
  sortOrder: number
  maxPerUser: number | null
  validDays: number | null
}

interface Transaction {
  id: string
  userId: string
  user: { name: string | null; email: string } | null
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string | null
  packageName: string | null
  createdAt: string
}

interface TopUser {
  userId: string
  user: { id: string; name: string | null; email: string; role: string } | null
  balance: number
  lifetimeUsed: number
  lifetimeBought: number
  lastTopUpAt: string | null
}

interface Stats {
  totalUsers: number
  totalBalance: number
  totalTransactions: number
  purchases: { count: number; totalCredits: number }
  usage: { count: number; totalCredits: number }
}

interface CreditsData {
  stats: Stats
  packages: CreditPackage[]
  recentTransactions: Transaction[]
  topUsers: TopUser[]
}

export default function AdminCreditsPage() {
  const [data, setData] = useState<CreditsData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Dialogs
  const [packageDialogOpen, setPackageDialogOpen] = useState(false)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null)
  const [selectedUser, setSelectedUser] = useState<TopUser | null>(null)
  
  // Form states
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    credits: 100,
    bonusCredits: 0,
    priceEur: 10,
    isActive: true,
    isPopular: false,
    sortOrder: 0,
  })
  
  const [adjustForm, setAdjustForm] = useState({
    amount: 0,
    reason: '',
    type: 'adjustment' as 'adjustment' | 'bonus' | 'refund',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/credits')
      if (!res.ok) throw new Error('Fehler beim Laden')
      const json = await res.json()
      setData(json)
    } catch (error) {
      toast.error('Daten konnten nicht geladen werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('de-DE').format(value)
  }

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      purchase: 'bg-green-100 text-green-800',
      usage: 'bg-red-100 text-red-800',
      bonus: 'bg-purple-100 text-purple-800',
      refund: 'bg-blue-100 text-blue-800',
      admin_adjustment: 'bg-yellow-100 text-yellow-800',
      expiry: 'bg-gray-100 text-gray-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'Kauf',
      usage: 'Nutzung',
      bonus: 'Bonus',
      refund: 'Erstattung',
      admin_adjustment: 'Admin',
      expiry: 'Verfallen',
    }
    return labels[type] || type
  }

  const handleSavePackage = async () => {
    try {
      const method = editingPackage ? 'PUT' : 'POST'
      const body = editingPackage 
        ? { id: editingPackage.id, ...packageForm }
        : packageForm

      const res = await fetch('/api/admin/credits/packages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Fehler beim Speichern')
      
      toast.success(editingPackage ? 'Paket aktualisiert' : 'Paket erstellt')
      setPackageDialogOpen(false)
      setEditingPackage(null)
      resetPackageForm()
      fetchData()
    } catch (error) {
      toast.error('Fehler beim Speichern des Pakets')
      console.error(error)
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Paket wirklich löschen?')) return

    try {
      const res = await fetch(`/api/admin/credits/packages?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Fehler beim Löschen')
      
      toast.success('Paket gelöscht')
      fetchData()
    } catch (error) {
      toast.error('Fehler beim Löschen')
      console.error(error)
    }
  }

  const handleAdjustCredits = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch('/api/admin/credits/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.userId,
          ...adjustForm,
        }),
      })

      if (!res.ok) throw new Error('Fehler bei der Anpassung')
      
      toast.success('Credits angepasst')
      setAdjustDialogOpen(false)
      setSelectedUser(null)
      setAdjustForm({ amount: 0, reason: '', type: 'adjustment' })
      fetchData()
    } catch (error) {
      toast.error('Fehler bei der Credit-Anpassung')
      console.error(error)
    }
  }

  const openEditPackage = (pkg: CreditPackage) => {
    setEditingPackage(pkg)
    setPackageForm({
      name: pkg.name,
      description: pkg.description || '',
      credits: pkg.credits,
      bonusCredits: pkg.bonusCredits,
      priceEur: pkg.priceEur,
      isActive: pkg.isActive,
      isPopular: pkg.isPopular,
      sortOrder: pkg.sortOrder,
    })
    setPackageDialogOpen(true)
  }

  const resetPackageForm = () => {
    setPackageForm({
      name: '',
      description: '',
      credits: 100,
      bonusCredits: 0,
      priceEur: 10,
      isActive: true,
      isPopular: false,
      sortOrder: 0,
    })
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            AI Credits Management
          </h1>
          <p className="text-muted-foreground">
            Verwalte Credit-Pakete und Nutzer-Guthaben
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button onClick={() => { resetPackageForm(); setEditingPackage(null); setPackageDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Neues Paket
          </Button>
        </div>
      </div>

      {data && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nutzer mit Credits</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.stats.totalUsers)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gesamt-Guthaben</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.stats.totalBalance)}</div>
                <p className="text-xs text-muted-foreground">Credits im System</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verkauft</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{formatNumber(data.stats.purchases.totalCredits)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.stats.purchases.count} Käufe
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verbraucht</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  -{formatNumber(data.stats.usage.totalCredits)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.stats.usage.count} Nutzungen
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="packages" className="space-y-4">
            <TabsList>
              <TabsTrigger value="packages">
                <Package className="h-4 w-4 mr-2" />
                Pakete
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Top Nutzer
              </TabsTrigger>
              <TabsTrigger value="transactions">
                <Coins className="h-4 w-4 mr-2" />
                Transaktionen
              </TabsTrigger>
            </TabsList>

            {/* Packages Tab */}
            <TabsContent value="packages">
              <Card>
                <CardHeader>
                  <CardTitle>Credit-Pakete</CardTitle>
                  <CardDescription>Verfügbare Pakete zum Kauf</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                        <TableHead className="text-right">Bonus</TableHead>
                        <TableHead className="text-right">Preis</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.packages.map((pkg) => (
                        <TableRow key={pkg.id} className={!pkg.isActive ? 'opacity-50' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{pkg.name}</span>
                              {pkg.isPopular && (
                                <Badge className="bg-amber-100 text-amber-800">Beliebt</Badge>
                              )}
                            </div>
                            {pkg.description && (
                              <p className="text-xs text-muted-foreground">{pkg.description}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(pkg.credits)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {pkg.bonusCredits > 0 && `+${formatNumber(pkg.bonusCredits)}`}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(pkg.priceEur)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                              {pkg.isActive ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditPackage(pkg)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Bearbeiten
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeletePackage(pkg.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Löschen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Top Nutzer</CardTitle>
                  <CardDescription>Nutzer mit dem höchsten Credit-Verbrauch</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nutzer</TableHead>
                        <TableHead className="text-right">Guthaben</TableHead>
                        <TableHead className="text-right">Gekauft</TableHead>
                        <TableHead className="text-right">Verbraucht</TableHead>
                        <TableHead>Letzte Aufladung</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.user?.name || 'Unbekannt'}</p>
                              <p className="text-xs text-muted-foreground">{user.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {formatNumber(user.balance)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatNumber(user.lifetimeBought)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatNumber(user.lifetimeUsed)}
                          </TableCell>
                          <TableCell>
                            {user.lastTopUpAt
                              ? format(new Date(user.lastTopUpAt), 'dd.MM.yy', { locale: de })
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setAdjustDialogOpen(true)
                              }}
                            >
                              <Gift className="h-4 w-4 mr-1" />
                              Anpassen
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Letzte Transaktionen</CardTitle>
                  <CardDescription>Die letzten 100 Credit-Bewegungen</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zeitpunkt</TableHead>
                        <TableHead>Nutzer</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead className="text-right">Betrag</TableHead>
                        <TableHead className="text-right">Neuer Stand</TableHead>
                        <TableHead>Beschreibung</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">
                            {format(new Date(tx.createdAt), 'dd.MM HH:mm', { locale: de })}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {tx.user?.name || tx.user?.email || 'System'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTransactionTypeColor(tx.type)}>
                              {getTransactionTypeLabel(tx.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {tx.amount >= 0 ? '+' : ''}{formatNumber(tx.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(tx.balanceAfter)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {tx.description || tx.packageName || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Package Dialog */}
      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? 'Paket bearbeiten' : 'Neues Paket erstellen'}
            </DialogTitle>
            <DialogDescription>
              Definiere ein Credit-Paket für den Verkauf
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={packageForm.name}
                onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                placeholder="z.B. Starter-Paket"
              />
            </div>
            <div className="grid gap-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={packageForm.description}
                onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                placeholder="Optionale Beschreibung"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={packageForm.credits}
                  onChange={(e) => setPackageForm({ ...packageForm, credits: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Bonus Credits</Label>
                <Input
                  type="number"
                  value={packageForm.bonusCredits}
                  onChange={(e) => setPackageForm({ ...packageForm, bonusCredits: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Preis (EUR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={packageForm.priceEur}
                  onChange={(e) => setPackageForm({ ...packageForm, priceEur: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Sortierung</Label>
                <Input
                  type="number"
                  value={packageForm.sortOrder}
                  onChange={(e) => setPackageForm({ ...packageForm, sortOrder: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={packageForm.isActive}
                  onCheckedChange={(checked) => setPackageForm({ ...packageForm, isActive: checked })}
                />
                <Label>Aktiv</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={packageForm.isPopular}
                  onCheckedChange={(checked) => setPackageForm({ ...packageForm, isPopular: checked })}
                />
                <Label>Als "Beliebt" markieren</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackageDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSavePackage}>
              {editingPackage ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Credits Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credits anpassen</DialogTitle>
            <DialogDescription>
              {selectedUser?.user?.name || selectedUser?.user?.email}
              <br />
              Aktuelles Guthaben: {formatNumber(selectedUser?.balance || 0)} Credits
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Typ</Label>
              <div className="flex gap-2">
                <Button
                  variant={adjustForm.type === 'bonus' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAdjustForm({ ...adjustForm, type: 'bonus', amount: Math.abs(adjustForm.amount) })}
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Bonus
                </Button>
                <Button
                  variant={adjustForm.type === 'adjustment' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAdjustForm({ ...adjustForm, type: 'adjustment' })}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Anpassung
                </Button>
                <Button
                  variant={adjustForm.type === 'refund' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setAdjustForm({ ...adjustForm, type: 'refund', amount: Math.abs(adjustForm.amount) })}
                >
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Erstattung
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Betrag (Credits)</Label>
              <Input
                type="number"
                value={adjustForm.amount}
                onChange={(e) => setAdjustForm({ ...adjustForm, amount: parseInt(e.target.value) })}
                placeholder={adjustForm.type === 'adjustment' ? 'Positiv oder negativ' : 'Anzahl Credits'}
              />
              <p className="text-xs text-muted-foreground">
                {adjustForm.type === 'adjustment'
                  ? 'Positiver Wert = Gutschrift, Negativer Wert = Abzug'
                  : 'Bitte einen positiven Wert eingeben'}
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Grund</Label>
              <Textarea
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                placeholder="Grund für die Anpassung..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAdjustCredits} disabled={!adjustForm.amount || !adjustForm.reason}>
              Credits anpassen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

