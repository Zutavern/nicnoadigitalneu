'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Package, AlertTriangle, Edit, MoreVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: {
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
  variant?: 'salon' | 'stylist'
  onAddToCart?: (productId: string) => void
  onEdit?: (productId: string) => void
  onView?: (productId: string) => void
  isAddingToCart?: boolean
}

export function ProductCard({
  product,
  variant = 'stylist',
  onAddToCart,
  onEdit,
  onView,
  isAddingToCart,
}: ProductCardProps) {
  const price = variant === 'stylist' ? product.stylistPrice : product.shopifyPrice
  const isAvailable = product.isAvailable ?? product.inventoryQuantity > 0
  const isLowStock = product.isLowStock ?? (product.inventoryQuantity > 0 && product.inventoryQuantity <= 5)
  const isOutOfStock = product.isOutOfStock ?? product.inventoryQuantity <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-purple-500/50">
        {/* Bild */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOutOfStock && (
              <Badge variant="destructive" className="text-xs">
                Ausverkauft
              </Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-500 border-amber-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Nur noch {product.inventoryQuantity}
              </Badge>
            )}
            {variant === 'stylist' && product.savingsPercent && product.savingsPercent > 0 && (
              <Badge className="text-xs bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                -{product.savingsPercent}%
              </Badge>
            )}
          </div>

          {/* Salon Actions */}
          {variant === 'salon' && (onEdit || onView) && (
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(product.id)}>
                      Details anzeigen
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(product.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Vendor / Kategorie */}
          {(product.vendor || product.productType) && (
            <p className="text-xs text-muted-foreground truncate">
              {product.vendor || product.productType}
            </p>
          )}

          {/* Titel */}
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>

          {/* Preis */}
          <div className="flex items-end gap-2">
            <span className="text-lg font-bold">
              {price?.toFixed(2).replace('.', ',')} €
            </span>
            {variant === 'stylist' && product.originalPrice && product.originalPrice > (price || 0) && (
              <span className="text-sm text-muted-foreground line-through">
                {product.originalPrice.toFixed(2).replace('.', ',')} €
              </span>
            )}
          </div>

          {/* Lagerbestand (nur Salon) */}
          {variant === 'salon' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>{product.inventoryQuantity} auf Lager</span>
            </div>
          )}

          {/* Action Button */}
          {variant === 'stylist' && onAddToCart && (
            <Button
              className={cn(
                'w-full',
                !isAvailable && 'opacity-50 cursor-not-allowed'
              )}
              disabled={!isAvailable || isAddingToCart}
              onClick={() => onAddToCart(product.id)}
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAddingToCart ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

