'use client'

import { ProductCard } from './product-card'

interface Product {
  id: string
  title: string
  imageUrl: string | null
  vendor?: string | null
  productType?: string | null
  shopifyPrice?: number
  stylistPrice?: number
  originalPrice?: number
  savings?: number
  savingsPercent?: number
  inventoryQuantity: number
  isLowStock?: boolean
  isOutOfStock?: boolean
  isAvailable?: boolean
}

interface ProductGridProps {
  products: Product[]
  variant?: 'salon' | 'stylist'
  onAddToCart?: (productId: string) => void
  onEdit?: (productId: string) => void
  onView?: (productId: string) => void
  addingToCartId?: string | null
  emptyMessage?: string
}

export function ProductGrid({
  products,
  variant = 'stylist',
  onAddToCart,
  onEdit,
  onView,
  addingToCartId,
  emptyMessage = 'Keine Produkte gefunden',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          onAddToCart={onAddToCart}
          onEdit={onEdit}
          onView={onView}
          isAddingToCart={addingToCartId === product.id}
        />
      ))}
    </div>
  )
}

