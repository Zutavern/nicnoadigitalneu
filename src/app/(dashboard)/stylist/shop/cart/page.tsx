'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  CreditCard,
  Wallet,
  Package,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'

interface CartItem {
  id: string
  productId: string
  title: string
  imageUrl: string | null
  quantity: number
  unitPrice: number
  total: number
  originalPrice: number
  inventoryQuantity: number
  isAvailable: boolean
}

function StylistCartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const salonId = searchParams.get('salonId')

  const [items, setItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'RENT_ADDITION'>('STRIPE')
  const [paymentOptions, setPaymentOptions] = useState({ stripe: true, rentAddition: true })
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

  useEffect(() => {
    if (salonId) {
      loadCart()
    }
  }, [salonId])

  const loadCart = async () => {
    if (!salonId) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/stylist/shop/cart?salonId=${salonId}`)
      const data = await res.json()

      if (res.ok) {
        setItems(data.items || [])
        setSubtotal(data.subtotal || 0)
      } else {
        toast.error(data.error || 'Fehler beim Laden')
      }

      // Checkout Summary für Zahlungsoptionen
      const summaryRes = await fetch(`/api/stylist/shop/checkout?salonId=${salonId}`)
      const summaryData = await summaryRes.json()

      if (summaryRes.ok) {
        setPaymentOptions(summaryData.paymentOptions)
        // Standard auf verfügbare Option setzen
        if (!summaryData.paymentOptions.stripe && summaryData.paymentOptions.rentAddition) {
          setPaymentMethod('RENT_ADDITION')
        }
      }
    } catch (error) {
      toast.error('Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdatingItemId(itemId)
    try {
      const res = await fetch('/api/stylist/shop/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      })

      const data = await res.json()

      if (res.ok) {
        loadCart()
      } else {
        toast.error(data.error || 'Fehler beim Aktualisieren')
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/stylist/shop/cart?itemId=${itemId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Artikel entfernt')
        loadCart()
      } else {
        toast.error(data.error || 'Fehler beim Entfernen')
      }
    } catch (error) {
      toast.error('Fehler beim Entfernen')
    }
  }

  const handleCheckout = async () => {
    if (!salonId) return

    setIsCheckingOut(true)
    try {
      const res = await fetch('/api/stylist/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId, paymentMethod }),
      })

      const data = await res.json()

      if (res.ok) {
        if (paymentMethod === 'STRIPE' && data.checkoutUrl) {
          // Redirect zu Stripe
          window.location.href = data.checkoutUrl
        } else {
          // Rent Addition - direkt erfolgreich
          toast.success(data.message)
          router.push('/stylist/shop/orders?success=true')
        }
      } else {
        toast.error(data.error || 'Checkout fehlgeschlagen')
      }
    } catch (error) {
      toast.error('Checkout fehlgeschlagen')
    } finally {
      setIsCheckingOut(false)
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const tax = subtotal * 0.19
  const total = subtotal + tax

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/stylist/shop/products?salonId=${salonId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-purple-500" />
            Warenkorb
          </h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'Artikel' : 'Artikel'}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">Ihr Warenkorb ist leer</p>
            <Link href={`/stylist/shop/products?salonId=${salonId}`}>
              <Button>Weiter einkaufen</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold">
                            {item.unitPrice.toFixed(2).replace('.', ',')} €
                          </span>
                          {item.originalPrice > item.unitPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {item.originalPrice.toFixed(2).replace('.', ',')} €
                            </span>
                          )}
                        </div>

                        {!item.isAvailable && (
                          <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            Nur {item.inventoryQuantity} verfügbar
                          </div>
                        )}
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={updatingItemId === item.id}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={updatingItemId === item.id || item.quantity >= item.inventoryQuantity}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Entfernen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zwischensumme</span>
                    <span>{subtotal.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>MwSt. (19%)</span>
                    <span>{tax.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Gesamt</span>
                    <span>{total.toFixed(2).replace('.', ',')} €</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>Zahlungsmethode</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as 'STRIPE' | 'RENT_ADDITION')}
                  >
                    {paymentOptions.stripe && (
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-purple-500/50 cursor-pointer">
                        <RadioGroupItem value="STRIPE" id="stripe" />
                        <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                          <CreditCard className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">Karte / Link</p>
                            <p className="text-xs text-muted-foreground">Sofort bezahlen</p>
                          </div>
                        </Label>
                      </div>
                    )}
                    {paymentOptions.rentAddition && (
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-purple-500/50 cursor-pointer">
                        <RadioGroupItem value="RENT_ADDITION" id="rent" />
                        <Label htmlFor="rent" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Wallet className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="font-medium">Zur Stuhlmiete addieren</p>
                            <p className="text-xs text-muted-foreground">Mit nächster Miete zahlen</p>
                          </div>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.some((i) => !i.isAvailable)}
                >
                  {isCheckingOut ? 'Wird verarbeitet...' : 'Jetzt bestellen'}
                </Button>

                {items.some((i) => !i.isAvailable) && (
                  <p className="text-xs text-amber-500 text-center">
                    Einige Artikel sind nicht mehr in der gewünschten Menge verfügbar
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StylistCartPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}>
      <StylistCartContent />
    </Suspense>
  )
}

