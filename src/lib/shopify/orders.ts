/**
 * Shopify Orders Service
 * B2B-Bestellungen für Stylisten
 */

import { prisma } from '@/lib/prisma'
import { calculateStylistPrice } from './products'

interface CartItem {
  productId: string
  quantity: number
}

interface CreateOrderInput {
  salonId: string
  stylistId: string
  items: CartItem[]
  paymentMethod: 'STRIPE' | 'RENT_ADDITION'
  notes?: string
}

interface OrderSummary {
  subtotal: number
  tax: number
  total: number
  items: Array<{
    productId: string
    title: string
    quantity: number
    unitPrice: number
    total: number
    imageUrl: string | null
  }>
}

/**
 * Generiert eine eindeutige Bestellnummer
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

/**
 * Berechnet die Bestellzusammenfassung
 */
export async function calculateOrderSummary(
  salonId: string,
  items: CartItem[]
): Promise<OrderSummary | null> {
  // Shop-Einstellungen holen
  const settings = await prisma.shopSettings.findUnique({
    where: { salonId },
  })

  // Produkte holen
  const productIds = items.map((i) => i.productId)
  const products = await prisma.shopProduct.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    include: {
      connection: true,
    },
  })

  // Prüfen ob alle Produkte vom richtigen Salon sind
  if (products.some((p) => p.connection.salonId !== salonId)) {
    return null
  }

  // Items berechnen
  const calculatedItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)

    if (!product) {
      throw new Error(`Produkt nicht gefunden: ${item.productId}`)
    }

    const unitPrice = calculateStylistPrice(product, settings)
    const total = Math.round(unitPrice * item.quantity * 100) / 100

    return {
      productId: product.id,
      title: product.title,
      quantity: item.quantity,
      unitPrice,
      total,
      imageUrl: product.imageUrl,
    }
  })

  const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0)
  const tax = Math.round(subtotal * 0.19 * 100) / 100 // 19% MwSt
  const total = Math.round((subtotal + tax) * 100) / 100

  return {
    subtotal,
    tax,
    total,
    items: calculatedItems,
  }
}

/**
 * Erstellt eine B2B-Bestellung
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    // Bestellzusammenfassung berechnen
    const summary = await calculateOrderSummary(input.salonId, input.items)

    if (!summary) {
      return { success: false, error: 'Ungültige Bestellung' }
    }

    // Lagerbestand prüfen
    const productIds = input.items.map((i) => i.productId)
    const products = await prisma.shopProduct.findMany({
      where: { id: { in: productIds } },
    })

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)

      if (!product) {
        return {
          success: false,
          error: `Produkt nicht gefunden: ${item.productId}`,
        }
      }

      if (product.trackInventory && product.inventoryQuantity < item.quantity) {
        return {
          success: false,
          error: `Nicht genügend Lagerbestand für: ${product.title}`,
        }
      }
    }

    const orderNumber = generateOrderNumber()

    // Bestellung erstellen
    const order = await prisma.shopOrder.create({
      data: {
        salonId: input.salonId,
        stylistId: input.stylistId,
        orderNumber,
        subtotal: summary.subtotal,
        tax: summary.tax,
        total: summary.total,
        paymentMethod: input.paymentMethod,
        status: input.paymentMethod === 'RENT_ADDITION' ? 'PAID' : 'PENDING',
        paidAt: input.paymentMethod === 'RENT_ADDITION' ? new Date() : null,
        notes: input.notes,
        items: {
          create: summary.items.map((item) => ({
            productId: item.productId,
            productTitle: item.title,
            productImageUrl: item.imageUrl,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
    })

    // Lagerbestand reduzieren
    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)

      if (product?.trackInventory) {
        await prisma.shopProduct.update({
          where: { id: item.productId },
          data: {
            inventoryQuantity: {
              decrement: item.quantity,
            },
          },
        })
      }
    }

    // Warenkorb leeren
    await prisma.shopCartItem.deleteMany({
      where: {
        cart: {
          stylistId: input.stylistId,
          salonId: input.salonId,
        },
      },
    })

    await prisma.shopCart.deleteMany({
      where: {
        stylistId: input.stylistId,
        salonId: input.salonId,
      },
    })

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der Bestellung:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Holt Bestellungen für einen Salon
 */
export async function getSalonOrders(
  salonId: string,
  options?: {
    status?: string
    limit?: number
    offset?: number
  }
) {
  const orders = await prisma.shopOrder.findMany({
    where: {
      salonId,
      ...(options?.status && { status: options.status as never }),
    },
    include: {
      stylist: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  })

  return orders
}

/**
 * Holt Bestellungen für einen Stylisten
 */
export async function getStylistOrders(
  stylistId: string,
  options?: {
    salonId?: string
    status?: string
    limit?: number
    offset?: number
  }
) {
  const orders = await prisma.shopOrder.findMany({
    where: {
      stylistId,
      ...(options?.salonId && { salonId: options.salonId }),
      ...(options?.status && { status: options.status as never }),
    },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  })

  return orders
}

/**
 * Aktualisiert den Bestellstatus
 */
export async function updateOrderStatus(
  orderId: string,
  salonId: string,
  status: 'PENDING' | 'PAID' | 'READY' | 'PICKED_UP' | 'CANCELLED'
): Promise<boolean> {
  try {
    const order = await prisma.shopOrder.findUnique({
      where: { id: orderId },
    })

    if (!order || order.salonId !== salonId) {
      return false
    }

    const updateData: Record<string, unknown> = { status }

    // Zusätzliche Felder je nach Status
    if (status === 'PAID') {
      updateData.paidAt = new Date()
    } else if (status === 'READY') {
      updateData.readyAt = new Date()
    } else if (status === 'PICKED_UP') {
      updateData.pickedUpAt = new Date()
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date()

      // Bei Stornierung: Lagerbestand wieder erhöhen
      const items = await prisma.shopOrderItem.findMany({
        where: { orderId },
        include: { product: true },
      })

      for (const item of items) {
        if (item.product.trackInventory) {
          await prisma.shopProduct.update({
            where: { id: item.productId },
            data: {
              inventoryQuantity: {
                increment: item.quantity,
              },
            },
          })
        }
      }
    }

    await prisma.shopOrder.update({
      where: { id: orderId },
      data: updateData,
    })

    return true
  } catch {
    return false
  }
}

/**
 * Holt Bestellstatistiken für einen Salon
 */
export async function getOrderStats(
  salonId: string,
  period?: { start: Date; end: Date }
) {
  const whereClause = {
    salonId,
    status: { not: 'CANCELLED' as const },
    ...(period && {
      createdAt: {
        gte: period.start,
        lte: period.end,
      },
    }),
  }

  const orders = await prisma.shopOrder.findMany({
    where: whereClause,
    select: {
      total: true,
      status: true,
      paymentMethod: true,
    },
  })

  const totalRevenue = orders.reduce(
    (sum, o) =>
      sum +
      (typeof o.total === 'object' ? o.total.toNumber() : Number(o.total)),
    0
  )

  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length
  const completedOrders = orders.filter((o) => o.status === 'PICKED_UP').length
  const stripePayments = orders.filter(
    (o) => o.paymentMethod === 'STRIPE'
  ).length
  const rentAdditions = orders.filter(
    (o) => o.paymentMethod === 'RENT_ADDITION'
  ).length

  return {
    totalOrders: orders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    pendingOrders,
    completedOrders,
    stripePayments,
    rentAdditions,
  }
}

