'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
  originalPrice: number
  stylistPrice: number
  savings: number
  savingsPercent: number
  inventoryQuantity: number
  isAvailable: boolean
}

function StylistProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const salonId = searchParams.get('salonId')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [cartItemCount, setCartItemCount] = useState(0)
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null)

  useEffect(() => {
    if (salonId) {
      loadProducts()
      loadCart()
    }
  }, [salonId, pagination.page, category])

  const loadProducts = async () => {
    if (!salonId) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        salonId,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(category && category !== 'all' && { category }),
      })

      const res = await fetch(`/api/stylist/shop/products?${params}`)
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

  const loadCart = async () => {
    if (!salonId) return

    try {
      const res = await fetch(`/api/stylist/shop/cart?salonId=${salonId}`)
      const data = await res.json()

      if (res.ok) {
        setCartItemCount(data.itemCount || 0)
      }
    } catch (error) {
      // Silent fail
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    loadProducts()
  }

  const handleAddToCart = async (productId: string) => {
    if (!salonId) return

    setAddingToCartId(productId)
    try {
      const res = await fetch('/api/stylist/shop/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId, productId, quantity: 1 }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Zum Warenkorb hinzugefügt')
        loadCart()
      } else {
        toast.error(data.error || 'Fehler beim Hinzufügen')
      }
    } catch (error) {
      toast.error('Fehler beim Hinzufügen')
    } finally {
      setAddingToCartId(null)
    }
  }

  if (!salonId) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Kein Salon ausgewählt</p>
        <Link href="/stylist/shop">
          <Button className="mt-4">Zurück zur Shop-Übersicht</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/stylist/shop">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="h-6 w-6 text-purple-500" />
              Produkte
            </h1>
            <p className="text-muted-foreground">{pagination.total} Produkte</p>
          </div>
        </div>
        <Link href={`/stylist/shop/cart?salonId=${salonId}`}>
          <Button className="relative">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Warenkorb
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </Link>
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
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

            <Button onClick={handleSearch}>Suchen</Button>
          </div>
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
          variant="stylist"
          onAddToCart={handleAddToCart}
          addingToCartId={addingToCartId}
          emptyMessage="Keine Produkte gefunden"
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

export default function StylistProductsPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}>
      <StylistProductsContent />
    </Suspense>
  )
}

