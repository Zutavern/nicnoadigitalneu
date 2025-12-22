/**
 * Shopify Inventory Service
 * Lagerbestand-Verwaltung
 */

import { prisma } from '@/lib/prisma'
import { createClientFromSalon, ShopifyClient } from './client'

interface InventoryLevel {
  productId: string
  productTitle: string
  shopifyProductId: string
  inventoryQuantity: number
  lowStockThreshold: number
  isLowStock: boolean
  imageUrl: string | null
}

interface InventoryAdjustment {
  productId: string
  delta: number
  reason?: string
}

/**
 * Holt den Lagerbestand für einen Salon
 */
export async function getInventoryLevels(
  salonId: string,
  options?: {
    lowStockOnly?: boolean
    search?: string
    limit?: number
    offset?: number
  }
): Promise<{ items: InventoryLevel[]; total: number }> {
  const connection = await prisma.shopifyConnection.findUnique({
    where: { salonId },
  })

  if (!connection) {
    return { items: [], total: 0 }
  }

  const whereClause = {
    connectionId: connection.id,
    isActive: true,
    ...(options?.search && {
      title: { contains: options.search, mode: 'insensitive' as const },
    }),
  }

  // Gesamtzahl für Pagination
  const total = await prisma.shopProduct.count({ where: whereClause })

  // Produkte holen
  let products = await prisma.shopProduct.findMany({
    where: whereClause,
    orderBy: [{ inventoryQuantity: 'asc' }, { title: 'asc' }],
    take: options?.limit || 100,
    skip: options?.offset || 0,
  })

  // Inventory-Levels erstellen
  let items: InventoryLevel[] = products.map((product) => ({
    productId: product.id,
    productTitle: product.title,
    shopifyProductId: product.shopifyProductId,
    inventoryQuantity: product.inventoryQuantity,
    lowStockThreshold: product.lowStockThreshold,
    isLowStock: product.inventoryQuantity <= product.lowStockThreshold,
    imageUrl: product.imageUrl,
  }))

  // Filter für Low Stock
  if (options?.lowStockOnly) {
    items = items.filter((item) => item.isLowStock)
  }

  return { items, total }
}

/**
 * Passt den Lagerbestand an (in NICNOA-DB, synct später zu Shopify)
 */
export async function adjustInventory(
  salonId: string,
  adjustment: InventoryAdjustment
): Promise<{ success: boolean; newQuantity?: number; error?: string }> {
  try {
    const product = await prisma.shopProduct.findUnique({
      where: { id: adjustment.productId },
      include: { connection: true },
    })

    if (!product) {
      return { success: false, error: 'Produkt nicht gefunden' }
    }

    if (product.connection.salonId !== salonId) {
      return { success: false, error: 'Keine Berechtigung' }
    }

    const newQuantity = product.inventoryQuantity + adjustment.delta

    if (newQuantity < 0) {
      return {
        success: false,
        error: `Lagerbestand kann nicht negativ werden. Aktuell: ${product.inventoryQuantity}`,
      }
    }

    // In NICNOA-DB aktualisieren
    await prisma.shopProduct.update({
      where: { id: adjustment.productId },
      data: { inventoryQuantity: newQuantity },
    })

    // Optional: Zu Shopify synchronisieren
    // Dies könnte asynchron im Hintergrund passieren
    // await syncInventoryToShopify(product, newQuantity, adjustment.reason)

    return { success: true, newQuantity }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Synchronisiert Lagerbestand zu Shopify
 */
export async function syncInventoryToShopify(
  salonId: string,
  productId: string,
  newQuantity: number,
  reason?: string
): Promise<boolean> {
  try {
    const product = await prisma.shopProduct.findUnique({
      where: { id: productId },
      include: { connection: true },
    })

    if (!product || product.connection.salonId !== salonId) {
      return false
    }

    const client = await createClientFromSalon(salonId)

    if (!client) {
      return false
    }

    // Locations holen
    const locations = await client.getLocations()
    const activeLocation = locations.find((l) => l.isActive)

    if (!activeLocation) {
      console.error('Keine aktive Location gefunden')
      return false
    }

    // Shopify-Produkt holen um Inventory Item ID zu bekommen
    const shopifyProduct = await client.getProduct(
      `gid://shopify/Product/${product.shopifyProductId}`
    )

    if (!shopifyProduct) {
      return false
    }

    const variant = shopifyProduct.variants.edges.find(
      (e) => e.node.legacyResourceId === product.shopifyVariantId
    )

    if (!variant) {
      return false
    }

    // Delta berechnen
    const delta = newQuantity - product.inventoryQuantity

    // Inventar anpassen
    await client.adjustInventory(
      variant.node.inventoryItem.id,
      activeLocation.id,
      delta,
      reason || 'NICNOA-Anpassung'
    )

    return true
  } catch (error) {
    console.error('Fehler beim Synchronisieren zu Shopify:', error)
    return false
  }
}

/**
 * Setzt den Low-Stock-Schwellwert für ein Produkt
 */
export async function setLowStockThreshold(
  salonId: string,
  productId: string,
  threshold: number
): Promise<boolean> {
  try {
    const product = await prisma.shopProduct.findUnique({
      where: { id: productId },
      include: { connection: true },
    })

    if (!product || product.connection.salonId !== salonId) {
      return false
    }

    await prisma.shopProduct.update({
      where: { id: productId },
      data: { lowStockThreshold: threshold },
    })

    return true
  } catch {
    return false
  }
}

/**
 * Holt Produkte mit niedrigem Lagerbestand
 */
export async function getLowStockProducts(
  salonId: string,
  limit: number = 10
): Promise<InventoryLevel[]> {
  const { items } = await getInventoryLevels(salonId, {
    lowStockOnly: true,
    limit,
  })
  return items
}

/**
 * Zählt Produkte mit niedrigem Lagerbestand
 */
export async function countLowStockProducts(salonId: string): Promise<number> {
  const connection = await prisma.shopifyConnection.findUnique({
    where: { salonId },
  })

  if (!connection) {
    return 0
  }

  // Alle Produkte holen und prüfen
  const products = await prisma.shopProduct.findMany({
    where: {
      connectionId: connection.id,
      isActive: true,
    },
    select: {
      inventoryQuantity: true,
      lowStockThreshold: true,
    },
  })

  return products.filter((p) => p.inventoryQuantity <= p.lowStockThreshold)
    .length
}

/**
 * Holt Inventar-Statistiken für einen Salon
 */
export async function getInventoryStats(salonId: string): Promise<{
  totalProducts: number
  totalStock: number
  lowStockCount: number
  outOfStockCount: number
  totalValue: number
}> {
  const connection = await prisma.shopifyConnection.findUnique({
    where: { salonId },
  })

  if (!connection) {
    return {
      totalProducts: 0,
      totalStock: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalValue: 0,
    }
  }

  const products = await prisma.shopProduct.findMany({
    where: {
      connectionId: connection.id,
      isActive: true,
    },
    select: {
      inventoryQuantity: true,
      lowStockThreshold: true,
      shopifyPrice: true,
    },
  })

  let totalStock = 0
  let lowStockCount = 0
  let outOfStockCount = 0
  let totalValue = 0

  for (const product of products) {
    totalStock += product.inventoryQuantity

    if (product.inventoryQuantity <= 0) {
      outOfStockCount++
    } else if (product.inventoryQuantity <= product.lowStockThreshold) {
      lowStockCount++
    }

    totalValue +=
      product.inventoryQuantity *
      (typeof product.shopifyPrice === 'object'
        ? product.shopifyPrice.toNumber()
        : Number(product.shopifyPrice))
  }

  return {
    totalProducts: products.length,
    totalStock,
    lowStockCount,
    outOfStockCount,
    totalValue: Math.round(totalValue * 100) / 100,
  }
}

