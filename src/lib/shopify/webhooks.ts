/**
 * Shopify Webhooks Handler
 * Verarbeitung von Shopify-Webhook-Events
 */

import { createHmac } from 'crypto'
import { prisma } from '@/lib/prisma'
import { syncSingleProduct } from './products'
import { calculateCommission } from './products'
import type {
  ProductWebhookPayload,
  InventoryWebhookPayload,
  OrderWebhookPayload,
} from './types'

/**
 * Verifiziert die Shopify-Webhook-Signatur
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(body, 'utf8')
  const digest = hmac.digest('base64')

  return digest === signature
}

/**
 * Findet die Connection basierend auf der Shop-Domain
 */
async function findConnectionByDomain(shopDomain: string) {
  // shopDomain kommt im Format "myshop.myshopify.com"
  const connection = await prisma.shopifyConnection.findFirst({
    where: {
      shopDomain: {
        contains: shopDomain.replace('.myshopify.com', ''),
      },
      isActive: true,
    },
    include: {
      salon: {
        include: {
          shopSettings: true,
        },
      },
    },
  })

  return connection
}

/**
 * Handler für products/create und products/update Webhooks
 */
export async function handleProductUpdate(
  shopDomain: string,
  payload: ProductWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const connection = await findConnectionByDomain(shopDomain)

    if (!connection) {
      return { success: false, error: 'Verbindung nicht gefunden' }
    }

    // Produkt synchronisieren
    const success = await syncSingleProduct(
      connection.id,
      payload.id.toString()
    )

    return { success }
  } catch (error) {
    console.error('Fehler beim Verarbeiten des Produkt-Webhooks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Handler für products/delete Webhook
 */
export async function handleProductDelete(
  shopDomain: string,
  payload: ProductWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const connection = await findConnectionByDomain(shopDomain)

    if (!connection) {
      return { success: false, error: 'Verbindung nicht gefunden' }
    }

    // Produkt löschen
    await prisma.shopProduct.deleteMany({
      where: {
        connectionId: connection.id,
        shopifyProductId: payload.id.toString(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Fehler beim Verarbeiten des Delete-Webhooks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Handler für inventory_levels/update Webhook
 */
export async function handleInventoryUpdate(
  shopDomain: string,
  payload: InventoryWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const connection = await findConnectionByDomain(shopDomain)

    if (!connection) {
      return { success: false, error: 'Verbindung nicht gefunden' }
    }

    // Wir müssen das Produkt über die inventory_item_id finden
    // Da wir die inventory_item_id nicht direkt speichern,
    // müssen wir alle Produkte bei einem Inventory-Update synchronisieren
    // oder die Produkte mit der REST API abgleichen

    // Einfachere Lösung: Alle Produkte neu synchronisieren
    // In Produktion würde man hier eine Lookup-Tabelle verwenden

    console.log('Inventory Update erhalten:', payload)

    return { success: true }
  } catch (error) {
    console.error('Fehler beim Verarbeiten des Inventory-Webhooks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Handler für orders/create Webhook (für Affiliate-Tracking)
 */
export async function handleOrderCreate(
  shopDomain: string,
  payload: OrderWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const connection = await findConnectionByDomain(shopDomain)

    if (!connection) {
      return { success: false, error: 'Verbindung nicht gefunden' }
    }

    // Prüfen ob es ein Affiliate-Order ist (über Tags oder Note)
    const tags = payload.tags?.split(',').map((t) => t.trim()) || []
    const affiliateTag = tags.find((t) => t.startsWith('affiliate:'))

    if (!affiliateTag) {
      // Kein Affiliate-Order
      return { success: true }
    }

    const stylistId = affiliateTag.replace('affiliate:', '')

    // Prüfen ob Stylist existiert und mit Salon verbunden ist
    const stylistConnection = await prisma.salonStylistConnection.findFirst({
      where: {
        salonId: connection.salonId,
        stylistId,
        isActive: true,
      },
    })

    if (!stylistConnection) {
      console.error('Stylist nicht mit Salon verbunden:', stylistId)
      return { success: false, error: 'Stylist nicht verbunden' }
    }

    // Shop-Einstellungen holen
    const settings = connection.salon.shopSettings

    if (!settings?.affiliateEnabled) {
      return { success: true } // Affiliate deaktiviert, kein Fehler
    }

    // Provision berechnen
    let totalCommission = 0
    const orderItems = []

    for (const lineItem of payload.line_items) {
      // Produkt in unserer DB finden
      const product = await prisma.shopProduct.findFirst({
        where: {
          connectionId: connection.id,
          shopifyProductId: lineItem.product_id.toString(),
        },
      })

      const itemTotal = parseFloat(lineItem.price) * lineItem.quantity
      const itemCommission = product
        ? calculateCommission(product, settings) * lineItem.quantity
        : itemTotal * 0.1 // Fallback: 10%

      totalCommission += itemCommission

      orderItems.push({
        shopifyProductId: lineItem.product_id.toString(),
        shopifyVariantId: lineItem.variant_id?.toString(),
        title: lineItem.title,
        imageUrl: null,
        quantity: lineItem.quantity,
        unitPrice: parseFloat(lineItem.price),
        total: itemTotal,
        commission: itemCommission,
      })
    }

    // Affiliate-Order erstellen
    await prisma.affiliateOrder.create({
      data: {
        salonId: connection.salonId,
        stylistId,
        shopifyOrderId: payload.id.toString(),
        shopifyOrderNumber: payload.order_number.toString(),
        customerEmail: payload.email,
        customerName: payload.shipping_address
          ? `${payload.shipping_address.first_name || ''} ${payload.shipping_address.last_name || ''}`.trim()
          : null,
        shippingAddress: payload.shipping_address
          ? JSON.parse(JSON.stringify(payload.shipping_address))
          : null,
        orderTotal: parseFloat(payload.total_price),
        commission: totalCommission,
        status: 'PENDING',
        commissionStatus: 'PENDING',
        items: {
          create: orderItems,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Fehler beim Verarbeiten des Order-Webhooks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Handler für orders/fulfilled Webhook
 */
export async function handleOrderFulfilled(
  shopDomain: string,
  payload: OrderWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // Affiliate-Order aktualisieren
    const affiliateOrder = await prisma.affiliateOrder.findUnique({
      where: { shopifyOrderId: payload.id.toString() },
    })

    if (!affiliateOrder) {
      return { success: true } // Kein Affiliate-Order
    }

    await prisma.affiliateOrder.update({
      where: { id: affiliateOrder.id },
      data: {
        status: 'SHIPPED',
        shippedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Fehler beim Verarbeiten des Fulfillment-Webhooks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Handler für orders/cancelled Webhook
 */
export async function handleOrderCancelled(
  shopDomain: string,
  payload: OrderWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const affiliateOrder = await prisma.affiliateOrder.findUnique({
      where: { shopifyOrderId: payload.id.toString() },
    })

    if (!affiliateOrder) {
      return { success: true }
    }

    await prisma.affiliateOrder.update({
      where: { id: affiliateOrder.id },
      data: {
        status: 'REFUNDED',
        commissionStatus: 'VOID',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Fehler beim Verarbeiten des Cancel-Webhooks:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Webhook-Topic zu Handler-Map
 */
export const webhookHandlers: Record<
  string,
  (
    shopDomain: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any
  ) => Promise<{ success: boolean; error?: string }>
> = {
  'products/create': handleProductUpdate,
  'products/update': handleProductUpdate,
  'products/delete': handleProductDelete,
  'inventory_levels/update': handleInventoryUpdate,
  'orders/create': handleOrderCreate,
  'orders/fulfilled': handleOrderFulfilled,
  'orders/cancelled': handleOrderCancelled,
}

