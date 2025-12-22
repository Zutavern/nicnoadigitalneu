'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Package,
  Search,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductGrid } from '@/components/shop'
import { toast } from 'sonner'
import Link from 'next/link'

interface Product {
  id: string
  title: string
  imageUrl: string | null
  vendor: string | null
  productType: string | null
  shopifyPrice: number
  inventoryQuantity: number
  lowStockThreshold: number
  isLowStock: boolean
  isOutOfStock: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function SalonProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [lowStockOnly, setLowStockOnly] = useState(false)

  // Debounce für Suche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Produkte laden wenn sich Filter ändern
  useEffect(() => {
    loadProducts()
  }, [pagination.page, category, lowStockOnly, debouncedSearch])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(category && category !== 'all' && { category }),
        ...(lowStockOnly && { lowStock: 'true' }),
      })

      const res = await fetch(`/api/salon/shop/products?${params}`)
      const data = await res.json()

      if (res.ok) {
        setProducts(data.products)
        setPagination(data.pagination)
        setCategories(data.categories || [])
      } else {
        toast.error(data.error || 'Fehler beim Laden')
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Produkte')
    } finally {
      setIsLoading(false)
    }
  }

  // Page auf 1 zurücksetzen bei Suche
  useEffect(() => {
    if (debouncedSearch !== '') {
      setPagination((prev) => ({ ...prev, page: 1 }))
    }
  }, [debouncedSearch])

  const handleClearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setCategory('all')
    setLowStockOnly(false)
    setPagination((prev) => ({ ...prev, page: 1 }))
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
        loadProducts()
      } else {
        toast.error(data.error || 'Synchronisierung fehlgeschlagen')
      }
    } catch (error) {
      toast.error('Synchronisierung fehlgeschlagen')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleEdit = (productId: string) => {
    router.push(`/salon/shop/products/${productId}`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/salon/shop">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-purple-500" />
              Produkte
            </h1>
            <p className="text-muted-foreground">
              {pagination.total} Produkte aus Shopify
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          Synchronisieren
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Produkte suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={lowStockOnly ? 'default' : 'outline'}
              onClick={() => {
                setLowStockOnly(!lowStockOnly)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className="whitespace-nowrap"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Niedriger Bestand
            </Button>

            {(search || category !== 'all' || lowStockOnly) && (
              <Button variant="ghost" onClick={handleClearFilters}>
                Filter zurücksetzen
              </Button>
            )}
          </div>

          {/* Aktive Filter anzeigen */}
          {(search || category !== 'all' || lowStockOnly) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {search && (
                <Badge variant="secondary" className="text-xs">
                  Suche: "{search}"
                </Badge>
              )}
              {category !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Kategorie: {category}
                </Badge>
              )}
              {lowStockOnly && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Nur niedriger Bestand
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-square" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ProductGrid
          products={products}
          variant="salon"
          onEdit={handleEdit}
          emptyMessage="Keine Produkte gefunden. Synchronisieren Sie Ihre Produkte aus Shopify."
        />
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
    </div>
  )
}

