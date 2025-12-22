'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Link2,
  Copy,
  Euro,
  TrendingUp,
  Package,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Wallet,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AffiliateOrder {
  id: string
  salon: { id: string; name: string }
  shopifyOrderNumber: string
  customerName: string | null
  orderTotal: number
  commission: number
  status: string
  commissionStatus: string
  payoutMethod: string | null
  paidOutAt: string | null
  createdAt: string
}

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  pendingCommission: number
  approvedCommission: number
  paidCommission: number
}

function StylistAffiliateContent() {
  const searchParams = useSearchParams()
  const salonIdParam = searchParams.get('salonId')

  const [orders, setOrders] = useState<AffiliateOrder[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isEnabled, setIsEnabled] = useState(false)
  const [salonId, setSalonId] = useState<string>(salonIdParam || '')
  const [payoutMethod, setPayoutMethod] = useState<string>('BANK_TRANSFER')
  const [isSavingPayout, setIsSavingPayout] = useState(false)

  useEffect(() => {
    loadAffiliateData()
  }, [pagination.page, salonId])

  const loadAffiliateData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(salonId && { salonId }),
      })

      const res = await fetch(`/api/stylist/shop/affiliate?${params}`)
      const data = await res.json()

      if (res.ok) {
        setIsEnabled(data.enabled)
        setOrders(data.orders || [])
        setStats(data.stats || null)
        setPagination(data.pagination || pagination)

        if (data.orders?.[0]?.payoutMethod) {
          setPayoutMethod(data.orders[0].payoutMethod)
        }
      } else {
        toast.error(data.error || 'Fehler beim Laden')
      }
    } catch (error) {
      toast.error('Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const savePayoutMethod = async () => {
    if (!salonId) {
      toast.error('Bitte wählen Sie einen Salon aus')
      return
    }

    setIsSavingPayout(true)
    try {
      const res = await fetch('/api/stylist/shop/affiliate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId, payoutMethod }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsSavingPayout(false)
    }
  }

  const copyAffiliateLink = () => {
    // In Produktion würde hier der echte Affiliate-Link generiert
    const link = `https://shop.example.com/?ref=${salonId}`
    navigator.clipboard.writeText(link)
    toast.success('Affiliate-Link kopiert!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getCommissionStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      PENDING: {
        label: 'Ausstehend',
        className: 'bg-amber-500/20 text-amber-500',
      },
      APPROVED: {
        label: 'Freigegeben',
        className: 'bg-blue-500/20 text-blue-500',
      },
      PAID: {
        label: 'Ausgezahlt',
        className: 'bg-emerald-500/20 text-emerald-500',
      },
      VOID: {
        label: 'Storniert',
        className: 'bg-gray-500/20 text-gray-500',
      },
    }

    const c = config[status] || config.PENDING

    return (
      <Badge variant="secondary" className={c.className}>
        {c.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (!isEnabled) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-dashed">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                <Link2 className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle className="text-2xl">Affiliate nicht verfügbar</CardTitle>
              <CardDescription className="text-base">
                Das Affiliate-System ist für die ausgewählten Salons nicht aktiviert.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Sobald ein Salonbesitzer das Affiliate-System aktiviert, können Sie
                hier Provisionen verdienen.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6 text-purple-500" />
            Affiliate
          </h1>
          <p className="text-muted-foreground">
            Verdienen Sie Provisionen durch Produktempfehlungen
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-sm">Bestellungen</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Umsatz</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.totalRevenue.toFixed(2).replace('.', ',')} €
              </p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Ausstehend</span>
              </div>
              <p className="text-2xl font-bold text-amber-500">
                {(stats.pendingCommission + stats.approvedCommission).toFixed(2).replace('.', ',')} €
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Ausgezahlt</span>
              </div>
              <p className="text-2xl font-bold text-emerald-500">
                {stats.paidCommission.toFixed(2).replace('.', ',')} €
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Provisionen</h2>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Euro className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Noch keine Affiliate-Provisionen
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{order.shopifyOrderNumber}</span>
                            {getCommissionStatusBadge(order.commissionStatus)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.salon.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customerName || 'Kunde'} •{' '}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-500">
                            +{order.commission.toFixed(2).replace('.', ',')} €
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bestellwert: {order.orderTotal.toFixed(2).replace('.', ',')} €
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Seite {pagination.page} von {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Affiliate Link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ihr Affiliate-Link</CardTitle>
              <CardDescription>
                Teilen Sie diesen Link, um Provisionen zu verdienen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                https://shop.example.com/?ref=...
              </div>
              <Button className="w-full" onClick={copyAffiliateLink}>
                <Copy className="h-4 w-4 mr-2" />
                Link kopieren
              </Button>
              <p className="text-xs text-muted-foreground">
                Kunden die über Ihren Link kaufen, werden Ihnen zugeordnet.
              </p>
            </CardContent>
          </Card>

          {/* Payout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Auszahlung</CardTitle>
              <CardDescription>
                Wie möchten Sie Ihre Provisionen erhalten?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={payoutMethod} onValueChange={setPayoutMethod}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-purple-500/50">
                  <RadioGroupItem value="BANK_TRANSFER" id="bank" />
                  <Label
                    htmlFor="bank"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">Überweisung</p>
                      <p className="text-xs text-muted-foreground">
                        Monatliche Auszahlung auf Ihr Konto
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-purple-500/50">
                  <RadioGroupItem value="RENT_DEDUCTION" id="rent" />
                  <Label
                    htmlFor="rent"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Wallet className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="font-medium">Von Stuhlmiete abziehen</p>
                      <p className="text-xs text-muted-foreground">
                        Provision wird von der Miete abgezogen
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <Button
                className="w-full"
                variant="outline"
                onClick={savePayoutMethod}
                disabled={isSavingPayout || !salonId}
              >
                {isSavingPayout ? 'Speichern...' : 'Speichern'}
              </Button>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Wie funktioniert es?</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Teilen Sie Ihren Affiliate-Link</li>
                    <li>• Kunde bestellt über Ihren Link</li>
                    <li>• Provision wird nach Lieferung freigegeben</li>
                    <li>• Monatliche Sammelauszahlung</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function StylistAffiliatePage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}>
      <StylistAffiliateContent />
    </Suspense>
  )
}

