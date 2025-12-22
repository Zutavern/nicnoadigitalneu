'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Euro,
  TrendingUp,
  CheckCircle,
  Clock,
  Ban,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Wallet,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface AffiliateOrder {
  id: string
  affiliate: { id: string; name: string | null; email: string | null }
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

interface TopAffiliate {
  affiliate: { id: string; name: string | null; email: string | null }
  orders: number
  revenue: number
  commission: number
}

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  breakdown: Record<string, { count: number; amount: number }>
}

export default function SalonAffiliateManagementPage() {
  const [orders, setOrders] = useState<AffiliateOrder[]>([])
  const [topAffiliates, setTopAffiliates] = useState<TopAffiliate[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCommissions()
  }, [pagination.page, statusFilter])

  const loadCommissions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })

      const res = await fetch(`/api/salon/shop/affiliate/commissions?${params}`)
      const data = await res.json()

      if (res.ok) {
        setOrders(data.orders || [])
        setTopAffiliates(data.topAffiliates || [])
        setStats(data.stats || null)
        setPagination(data.pagination || pagination)
      } else {
        toast.error(data.error || 'Fehler beim Laden')
      }
    } catch (error) {
      toast.error('Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const updateCommissionStatus = async (orderId: string, action: string) => {
    try {
      const res = await fetch('/api/salon/shop/affiliate/commissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        loadCommissions()
      } else {
        toast.error(data.error || 'Fehler')
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren')
    }
  }

  const bulkPayout = async (affiliateId: string) => {
    try {
      const res = await fetch('/api/salon/shop/affiliate/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        loadCommissions()
      } else {
        toast.error(data.error || 'Fehler')
      }
    } catch (error) {
      toast.error('Fehler beim Auszahlen')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: typeof Clock }> = {
      PENDING: {
        label: 'Ausstehend',
        className: 'bg-amber-500/20 text-amber-500',
        icon: Clock,
      },
      APPROVED: {
        label: 'Freigegeben',
        className: 'bg-blue-500/20 text-blue-500',
        icon: CheckCircle,
      },
      PAID: {
        label: 'Ausgezahlt',
        className: 'bg-emerald-500/20 text-emerald-500',
        icon: CheckCircle,
      },
      VOID: {
        label: 'Storniert',
        className: 'bg-gray-500/20 text-gray-500',
        icon: Ban,
      },
    }

    const c = config[status] || config.PENDING
    const Icon = c.icon

    return (
      <Badge variant="secondary" className={c.className}>
        <Icon className="h-3 w-3 mr-1" />
        {c.label}
      </Badge>
    )
  }

  const getPayoutBadge = (method: string | null) => {
    if (!method) return null

    if (method === 'BANK_TRANSFER') {
      return (
        <Badge variant="outline" className="text-xs">
          <CreditCard className="h-3 w-3 mr-1" />
          Überweisung
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="text-xs">
        <Wallet className="h-3 w-3 mr-1" />
        Stuhlmiete
      </Badge>
    )
  }

  if (isLoading && orders.length === 0) {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-500" />
            Affiliate-Provisionen
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Provisionen Ihrer Stylisten
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Gesamtumsatz</span>
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
                {(stats.breakdown?.PENDING?.amount || 0).toFixed(2).replace('.', ',')} €
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.breakdown?.PENDING?.count || 0} Provisionen
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Freigegeben</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">
                {(stats.breakdown?.APPROVED?.amount || 0).toFixed(2).replace('.', ',')} €
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.breakdown?.APPROVED?.count || 0} Provisionen
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <Euro className="h-4 w-4" />
                <span className="text-sm">Ausgezahlt</span>
              </div>
              <p className="text-2xl font-bold text-emerald-500">
                {(stats.breakdown?.PAID?.amount || 0).toFixed(2).replace('.', ',')} €
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.breakdown?.PAID?.count || 0} Provisionen
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Provisionen</h2>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="PENDING">Ausstehend</SelectItem>
                <SelectItem value="APPROVED">Freigegeben</SelectItem>
                <SelectItem value="PAID">Ausgezahlt</SelectItem>
                <SelectItem value="VOID">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Euro className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Keine Affiliate-Provisionen gefunden
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bestellung</TableHead>
                      <TableHead>Affiliate</TableHead>
                      <TableHead>Betrag</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">#{order.shopifyOrderNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.affiliate.name || 'Unbekannt'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.affiliate.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-emerald-500">
                              {order.commission.toFixed(2).replace('.', ',')} €
                            </p>
                            <p className="text-xs text-muted-foreground">
                              von {order.orderTotal.toFixed(2).replace('.', ',')} €
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(order.commissionStatus)}
                            {getPayoutBadge(order.payoutMethod)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.commissionStatus !== 'PAID' &&
                            order.commissionStatus !== 'VOID' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    Aktionen
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {order.commissionStatus === 'PENDING' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateCommissionStatus(order.id, 'approve')
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                                      Freigeben
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateCommissionStatus(order.id, 'pay')
                                    }
                                  >
                                    <Euro className="h-4 w-4 mr-2 text-emerald-500" />
                                    Als ausgezahlt markieren
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateCommissionStatus(order.id, 'void')
                                    }
                                    className="text-red-500"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Stornieren
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

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

        {/* Top Affiliates */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Top Affiliates</h2>

          {topAffiliates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Noch keine Affiliates
                </p>
              </CardContent>
            </Card>
          ) : (
            topAffiliates.map((affiliate, index) => (
              <motion.div
                key={affiliate.affiliate.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {(affiliate.affiliate.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {affiliate.affiliate.name || 'Unbekannt'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {affiliate.orders} Bestellungen
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-500">
                          {affiliate.commission.toFixed(2).replace('.', ',')} €
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Provision
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Umsatz: {affiliate.revenue.toFixed(2).replace('.', ',')} €
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkPayout(affiliate.affiliate.id)}
                      >
                        <Euro className="h-3 w-3 mr-1" />
                        Auszahlen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}

          {/* Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Auszahlungsprozess</p>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Provisionen werden nach Lieferung freigegeben</li>
                    <li>• Sammeln Sie Provisionen für die monatliche Auszahlung</li>
                    <li>• Wählen Sie zwischen Überweisung oder Stuhlmiete-Abzug</li>
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

