'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Package,
  User,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { OrderStatusBadge } from '@/components/shop'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  productTitle: string
  productImageUrl: string | null
  quantity: number
  unitPrice: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  stylist: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  status: string
  paidAt: string | null
  readyAt: string | null
  pickedUpAt: string | null
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

interface Stats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
}

export default function SalonOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [pagination.page, statusFilter])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })

      const res = await fetch(`/api/salon/shop/orders?${params}`)
      const data = await res.json()

      if (res.ok) {
        setOrders(data.orders)
        setStats(data.stats)
        setPagination(data.pagination)
      } else {
        toast.error(data.error || 'Fehler beim Laden')
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Bestellungen')
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch('/api/salon/shop/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        loadOrders()
        setSelectedOrder(null)
      } else {
        toast.error(data.error || 'Aktualisierung fehlgeschlagen')
      }
    } catch (error) {
      toast.error('Aktualisierung fehlgeschlagen')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-purple-500" />
            Bestellungen
          </h1>
          <p className="text-muted-foreground">
            B2B-Bestellungen von Ihren Stuhlmietern
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Ausstehend</p>
              <p className="text-2xl font-bold text-amber-500">{stats.pendingOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
              <p className="text-2xl font-bold text-emerald-500">{stats.completedOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Umsatz</p>
              <p className="text-2xl font-bold">
                {stats.totalRevenue.toFixed(2).replace('.', ',')} €
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Bestellungen</SelectItem>
            <SelectItem value="PENDING">Ausstehend</SelectItem>
            <SelectItem value="PAID">Bezahlt</SelectItem>
            <SelectItem value="READY">Bereit</SelectItem>
            <SelectItem value="PICKED_UP">Abgeholt</SelectItem>
            <SelectItem value="CANCELLED">Storniert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Keine Bestellungen gefunden</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:border-purple-500/50 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={order.stylist.image || undefined} />
                        <AvatarFallback>
                          {order.stylist.name?.[0] || order.stylist.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.orderNumber}</span>
                          <OrderStatusBadge status={order.status} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.stylist.name || order.stylist.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {order.total.toFixed(2).replace('.', ',')} €
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} Artikel
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {order.paymentMethod === 'STRIPE' ? 'Stripe' : 'Stuhlmiete'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
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
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Bestellung {selectedOrder.orderNumber}
                  <OrderStatusBadge status={selectedOrder.status} />
                </DialogTitle>
                <DialogDescription>
                  {selectedOrder.stylist.name || selectedOrder.stylist.email} •{' '}
                  {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  <h4 className="font-medium">Artikel</h4>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productTitle}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.productTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x {item.unitPrice.toFixed(2).replace('.', ',')} €
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        {item.total.toFixed(2).replace('.', ',')} €
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summen */}
                <div className="border-t pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Zwischensumme</span>
                    <span>{selectedOrder.subtotal.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>MwSt.</span>
                    <span>{selectedOrder.tax.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Gesamt</span>
                    <span>{selectedOrder.total.toFixed(2).replace('.', ',')} €</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-muted/50 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Notizen:</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {selectedOrder.status === 'PENDING' && (
                  <Button
                    onClick={() => updateStatus(selectedOrder.id, 'CANCELLED')}
                    variant="destructive"
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Stornieren
                  </Button>
                )}
                {selectedOrder.status === 'PAID' && (
                  <Button
                    onClick={() => updateStatus(selectedOrder.id, 'READY')}
                    disabled={isUpdating}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Bereit zur Abholung
                  </Button>
                )}
                {selectedOrder.status === 'READY' && (
                  <Button
                    onClick={() => updateStatus(selectedOrder.id, 'PICKED_UP')}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Als abgeholt markieren
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

