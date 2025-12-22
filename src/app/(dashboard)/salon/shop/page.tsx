'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Settings,
  RefreshCw,
  Link as LinkIcon,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import Link from 'next/link'

interface ShopStats {
  orders: {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    completedOrders: number
  }
  inventory: {
    totalProducts: number
    totalStock: number
    lowStockCount: number
    outOfStockCount: number
    totalValue: number
  }
}

interface Connection {
  id: string
  shopDomain: string
  storeName: string | null
  isActive: boolean
  lastSyncAt: string | null
}

export default function SalonShopPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [stats, setStats] = useState<ShopStats | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Verbindung prüfen
      const connRes = await fetch('/api/salon/shop/connect')
      const connData = await connRes.json()

      if (connData.connected && connData.connection) {
        setConnection(connData.connection)

        // Analytics laden
        const analyticsRes = await fetch('/api/salon/shop/analytics?days=30')
        const analyticsData = await analyticsRes.json()

        setStats({
          orders: analyticsData.orders,
          inventory: analyticsData.inventory,
        })
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error)
      toast.error('Fehler beim Laden der Shop-Daten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/salon/shop/sync', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        toast.success(
          `Synchronisiert: ${data.stats.created} neu, ${data.stats.updated} aktualisiert`
        )
        loadData()
      } else {
        toast.error(data.error || 'Synchronisierung fehlgeschlagen')
      }
    } catch (error) {
      toast.error('Synchronisierung fehlgeschlagen')
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  // Nicht verbunden
  if (!connection) {
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
                <Store className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle className="text-2xl">Shop verbinden</CardTitle>
              <CardDescription className="text-base">
                Verbinde deinen Shopify-Store, um Produkte zu verwalten und deinen
                Stuhlmietern anzubieten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <Package className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm font-medium">Produkte verwalten</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm font-medium">B2B-Verkauf</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm font-medium">Affiliate-System</p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push('/salon/shop/connect')}
              >
                <LinkIcon className="h-5 w-5 mr-2" />
                Shopify verbinden
              </Button>
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
            <Store className="h-6 w-6 text-purple-500" />
            Shop
          </h1>
          <p className="text-muted-foreground">
            Verbunden mit {connection.storeName || connection.shopDomain}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronisiere...' : 'Synchronisieren'}
          </Button>
          <Link href="/salon/shop/settings">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Produkte</CardDescription>
              <CardTitle className="text-3xl">
                {stats?.inventory.totalProducts || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats?.inventory.totalStock || 0} Einheiten auf Lager
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bestellungen</CardDescription>
              <CardTitle className="text-3xl">{stats?.orders.totalOrders || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats?.orders.pendingOrders || 0} ausstehend
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Umsatz (30 Tage)</CardDescription>
              <CardTitle className="text-3xl">
                {(stats?.orders.totalRevenue || 0).toFixed(2).replace('.', ',')} €
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats?.orders.completedOrders || 0} abgeschlossene Bestellungen
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card
            className={
              (stats?.inventory.lowStockCount || 0) > 0
                ? 'border-amber-500/50'
                : ''
            }
          >
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                {(stats?.inventory.lowStockCount || 0) > 0 && (
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                )}
                Niedriger Bestand
              </CardDescription>
              <CardTitle className="text-3xl">
                {stats?.inventory.lowStockCount || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats?.inventory.outOfStockCount || 0} ausverkauft
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/salon/shop/products">
          <Card className="cursor-pointer hover:shadow-md hover:border-purple-500/50 transition-all">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-500" />
                Produkte verwalten
              </CardTitle>
              <CardDescription>
                Preise, Lagerbestand und Margen konfigurieren
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/salon/shop/orders">
          <Card className="cursor-pointer hover:shadow-md hover:border-purple-500/50 transition-all">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-purple-500" />
                Bestellungen
                {(stats?.orders.pendingOrders || 0) > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {stats?.orders.pendingOrders}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                B2B-Bestellungen von Stuhlmietern verwalten
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/salon/shop/settings">
          <Card className="cursor-pointer hover:shadow-md hover:border-purple-500/50 transition-all">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Einstellungen
              </CardTitle>
              <CardDescription>
                Margen, Provisionen und Zahlungsoptionen
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Letzte Synchronisierung */}
      {connection.lastSyncAt && (
        <p className="text-xs text-muted-foreground text-center">
          Letzte Synchronisierung:{' '}
          {new Date(connection.lastSyncAt).toLocaleString('de-DE')}
        </p>
      )}
    </div>
  )
}

