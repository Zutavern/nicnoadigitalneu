'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Package,
  Store,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { OrderStatusBadge } from '@/components/shop'
import { toast } from 'sonner'
import Link from 'next/link'

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
  salon: {
    id: string
    name: string
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

function StylistOrdersContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  useEffect(() => {
    if (success === 'true') {
      setShowSuccessDialog(true)
    }
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

      const res = await fetch(`/api/stylist/shop/orders?${params}`)
      const data = await res.json()

      if (res.ok) {
        setOrders(data.orders)
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
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="text-center">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <DialogTitle className="text-xl">Bestellung erfolgreich!</DialogTitle>
            <DialogDescription>
              Ihre Bestellung wurde erfolgreich aufgegeben. Der Salonbesitzer wird Sie
              benachrichtigen, sobald die Produkte zur Abholung bereit sind.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowSuccessDialog(false)}>
            Verstanden
          </Button>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-purple-500" />
            Meine Bestellungen
          </h1>
          <p className="text-muted-foreground">
            Übersicht Ihrer Shop-Bestellungen
          </p>
        </div>
        <Link href="/stylist/shop">
          <Button variant="outline">
            <Store className="h-4 w-4 mr-2" />
            Zum Shop
          </Button>
        </Link>
      </div>

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
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">Noch keine Bestellungen</p>
            <Link href="/stylist/shop">
              <Button>Jetzt einkaufen</Button>
            </Link>
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
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.orderNumber}</span>
                        <OrderStatusBadge status={order.status} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.salon.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {order.total.toFixed(2).replace('.', ',')} €
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} Artikel
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {order.paymentMethod === 'STRIPE' ? 'Karte' : 'Stuhlmiete'}
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
                  {selectedOrder.salon.name} •{' '}
                  {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status Timeline */}
                <div className="flex items-center gap-2 text-sm">
                  <div className={`flex items-center gap-1 ${selectedOrder.paidAt ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    <CheckCircle className="h-4 w-4" />
                    Bezahlt
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className={`flex items-center gap-1 ${selectedOrder.readyAt ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    <CheckCircle className="h-4 w-4" />
                    Bereit
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className={`flex items-center gap-1 ${selectedOrder.pickedUpAt ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    <CheckCircle className="h-4 w-4" />
                    Abgeholt
                  </div>
                </div>

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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function StylistOrdersPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}>
      <StylistOrdersContent />
    </Suspense>
  )
}

