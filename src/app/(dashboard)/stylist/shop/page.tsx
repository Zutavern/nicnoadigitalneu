'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Store,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  Package,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface Salon {
  id: string
  name: string
  slug: string
  images: string[]
  shopName: string | null
  paymentOptions: {
    stripe: boolean
    rentAddition: boolean
  }
  orderCount: number
}

export default function StylistShopPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [salons, setSalons] = useState<Salon[]>([])

  useEffect(() => {
    loadSalons()
  }, [])

  const loadSalons = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/stylist/shop/salons')
      const data = await res.json()

      if (res.ok) {
        setSalons(data.salons)
      } else {
        toast.error(data.error || 'Fehler beim Laden')
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Shops')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (salons.length === 0) {
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
              <CardTitle className="text-2xl">Keine Shops verfügbar</CardTitle>
              <CardDescription className="text-base">
                Die Salons, mit denen Sie verbunden sind, haben noch keinen Shop aktiviert.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Sobald ein Salonbesitzer seinen Shop aktiviert, können Sie hier
                Produkte einkaufen.
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
            <ShoppingBag className="h-6 w-6 text-purple-500" />
            Shop
          </h1>
          <p className="text-muted-foreground">
            Produkte von Ihren Salons einkaufen
          </p>
        </div>
        <Link href="/stylist/shop/orders">
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Meine Bestellungen
          </Button>
        </Link>
      </div>

      {/* Salons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salons.map((salon, index) => (
          <motion.div
            key={salon.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden hover:shadow-lg hover:border-purple-500/50 transition-all">
              {/* Salon Image */}
              <div className="relative h-40 bg-muted">
                {salon.images?.[0] ? (
                  <Image
                    src={salon.images[0]}
                    alt={salon.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                {salon.orderCount > 0 && (
                  <Badge className="absolute top-3 right-3">
                    {salon.orderCount} Bestellungen
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{salon.name}</CardTitle>
                {salon.shopName && (
                  <CardDescription>{salon.shopName}</CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Payment Options */}
                <div className="flex items-center gap-2 text-xs">
                  {salon.paymentOptions.stripe && (
                    <Badge variant="outline" className="text-xs">
                      Karte
                    </Badge>
                  )}
                  {salon.paymentOptions.rentAddition && (
                    <Badge variant="outline" className="text-xs">
                      Stuhlmiete
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => router.push(`/stylist/shop/products?salonId=${salon.id}`)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Zum Shop
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

