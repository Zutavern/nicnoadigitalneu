'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Tag,
  Plus,
  Loader2,
  Percent,
  Clock,
  Users,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  MoreVertical,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Coupon {
  id: string
  code: string
  name: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountPercent: number | null
  discountAmount: number | null
  currency: string
  duration: 'ONCE' | 'REPEATING' | 'FOREVER'
  durationMonths: number | null
  maxRedemptions: number | null
  timesRedeemed: number
  expiresAt: string | null
  minAmount: number | null
  firstTimeOnly: boolean
  applicablePlanIds: string[]
  isActive: boolean
  stripeCouponId: string | null
  createdAt: string
  _count?: { redemptions: number }
}

interface Stats {
  total: number
  active: number
  expired: number
  totalRedemptions: number
  withStripe: number
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountPercent: 10,
    discountAmount: 5,
    duration: 'ONCE' as 'ONCE' | 'REPEATING' | 'FOREVER',
    durationMonths: 3,
    maxRedemptions: null as number | null,
    expiresAt: '',
    minAmount: null as number | null,
    firstTimeOnly: false,
    syncToStripe: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/coupons')
      if (res.ok) {
        const data = await res.json()
        setCoupons(data.coupons)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'NICNOA-'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  const createCoupon = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Code und Name sind erforderlich')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message)
        setDialogOpen(false)
        resetForm()
        fetchCoupons()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Netzwerkfehler')
    } finally {
      setIsCreating(false)
    }
  }

  const toggleCoupon = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive })
      })

      if (res.ok) {
        toast.success(`Coupon ${isActive ? 'aktiviert' : 'deaktiviert'}`)
        fetchCoupons()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler')
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Coupon wirklich löschen?')) return

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Coupon gelöscht')
        fetchCoupons()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Fehler')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
    toast.success('Code kopiert')
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      discountPercent: 10,
      discountAmount: 5,
      duration: 'ONCE',
      durationMonths: 3,
      maxRedemptions: null,
      expiresAt: '',
      minAmount: null,
      firstTimeOnly: false,
      syncToStripe: true
    })
  }

  const isExpired = (coupon: Coupon) => {
    return coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon-Verwaltung</h1>
          <p className="text-muted-foreground mt-1">
            Erstellen und verwalten Sie Promo-Codes und Rabattaktionen
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neuer Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neuen Coupon erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen Promo-Code für Ihre Kunden
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Code */}
              <div className="space-y-2">
                <Label>Coupon-Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="z.B. SUMMER2024"
                    className="uppercase"
                  />
                  <Button variant="outline" onClick={generateCode} type="button">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Sommer-Rabatt"
                />
              </div>

              {/* Beschreibung */}
              <div className="space-y-2">
                <Label>Beschreibung (optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kurze Beschreibung..."
                  rows={2}
                />
              </div>

              {/* Typ und Wert */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rabatt-Typ</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Prozent (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fester Betrag (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rabatt-Wert</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      max={formData.type === 'PERCENTAGE' ? 99 : 1000}
                      value={formData.type === 'PERCENTAGE' ? formData.discountPercent : formData.discountAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        if (formData.type === 'PERCENTAGE') {
                          setFormData({ ...formData, discountPercent: val })
                        } else {
                          setFormData({ ...formData, discountAmount: val })
                        }
                      }}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {formData.type === 'PERCENTAGE' ? '%' : '€'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dauer */}
              <div className="space-y-2">
                <Label>Gültigkeit</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(v) => setFormData({ ...formData, duration: v as 'ONCE' | 'REPEATING' | 'FOREVER' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONCE">Einmalig (erste Zahlung)</SelectItem>
                    <SelectItem value="REPEATING">Wiederkehrend (X Monate)</SelectItem>
                    <SelectItem value="FOREVER">Dauerhaft (alle Zahlungen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.duration === 'REPEATING' && (
                <div className="space-y-2">
                  <Label>Anzahl Monate</Label>
                  <Input
                    type="number"
                    min={1}
                    max={36}
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                  />
                </div>
              )}

              {/* Ablaufdatum */}
              <div className="space-y-2">
                <Label>Ablaufdatum (optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>

              {/* Max Redemptions */}
              <div className="space-y-2">
                <Label>Max. Einlösungen (optional)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.maxRedemptions || ''}
                  onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Unbegrenzt"
                />
              </div>

              {/* First Time Only */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Nur für Neukunden</Label>
                  <p className="text-xs text-muted-foreground">Nur beim ersten Kauf einlösbar</p>
                </div>
                <Switch
                  checked={formData.firstTimeOnly}
                  onCheckedChange={(c) => setFormData({ ...formData, firstTimeOnly: c })}
                />
              </div>

              {/* Sync to Stripe */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <Label>Mit Stripe synchronisieren</Label>
                  <p className="text-xs text-muted-foreground">Coupon automatisch in Stripe erstellen</p>
                </div>
                <Switch
                  checked={formData.syncToStripe}
                  onCheckedChange={(c) => setFormData({ ...formData, syncToStripe: c })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={createCoupon} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Erstellen...
                  </>
                ) : (
                  'Coupon erstellen'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          {[
            { label: 'Gesamt', value: stats.total, icon: Tag, color: 'text-primary' },
            { label: 'Aktiv', value: stats.active, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Abgelaufen', value: stats.expired, icon: Clock, color: 'text-amber-500' },
            { label: 'Einlösungen', value: stats.totalRedemptions, icon: Users, color: 'text-blue-500' },
            { label: 'Mit Stripe', value: stats.withStripe, icon: CheckCircle2, color: 'text-violet-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Coupons</CardTitle>
          <CardDescription>
            {coupons.length} Coupon{coupons.length !== 1 ? 's' : ''} vorhanden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Noch keine Coupons erstellt</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ersten Coupon erstellen
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rabatt</TableHead>
                  <TableHead>Einlösungen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stripe</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {coupons.map((coupon) => (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyCode(coupon.code)}
                          >
                            {copiedCode === coupon.code ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{coupon.name}</p>
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {coupon.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {coupon.type === 'PERCENTAGE'
                            ? `${coupon.discountPercent}%`
                            : `€${coupon.discountAmount}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{coupon.timesRedeemed}</span>
                          {coupon.maxRedemptions && (
                            <span className="text-muted-foreground">
                              / {coupon.maxRedemptions}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isExpired(coupon) ? (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Abgelaufen
                          </Badge>
                        ) : coupon.isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Aktiv
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inaktiv
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {coupon.stripeCouponId ? (
                          <Badge variant="outline" className="text-violet-500 border-violet-500/20">
                            Synced
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Switch
                            checked={coupon.isActive}
                            onCheckedChange={(c) => toggleCoupon(coupon.id, c)}
                            disabled={isExpired(coupon)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteCoupon(coupon.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

