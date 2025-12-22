/**
 * Shopify Products Service
 * Produkt-Synchronisierung und -Verwaltung
 */

import { prisma } from '@/lib/prisma'
import { createClientFromConnection, ShopifyClient } from './client'
import type { ShopifyProduct, SyncResult } from './types'

/**
 * Synchronisiert alle Produkte von Shopify
 */
export async function syncProducts(connectionId: string): Promise<SyncResult> {
  const client = await createClientFromConnection(connectionId)

  if (!client) {
    return {
      success: false,
      productsCreated: 0,
      productsUpdated: 0,
      productsRemoved: 0,
      errors: ['Verbindung nicht gefunden oder inaktiv'],
    }
  }

  const result: SyncResult = {
    success: true,
    productsCreated: 0,
    productsUpdated: 0,
    productsRemoved: 0,
    errors: [],
  }

  try {
    // Alle vorhandenen Produkt-IDs holen
    const existingProducts = await prisma.shopProduct.findMany({
      where: { connectionId },
      select: { id: true, shopifyProductId: true, shopifyVariantId: true },
    })

    const existingProductIds = new Set(
      existingProducts.map((p) => `${p.shopifyProductId}:${p.shopifyVariantId || ''}`)
    )
    const syncedProductIds = new Set<string>()

    // Alle Produkte von Shopify holen (mit Pagination)
    let cursor: string | undefined
    let hasNextPage = true

    while (hasNextPage) {
      const response = await client.getProducts(100, cursor)

      for (const product of response.products) {
        // Nur aktive Produkte synchronisieren
        if (product.status !== 'ACTIVE') continue

        const variants = product.variants.edges.map((e) => e.node)

        // Für jede Variante einen Eintrag erstellen
        for (const variant of variants) {
          const productKey = `${product.legacyResourceId}:${variant.legacyResourceId}`
          syncedProductIds.add(productKey)

          const existingProduct = existingProducts.find(
            (p) =>
              p.shopifyProductId === product.legacyResourceId &&
              p.shopifyVariantId === variant.legacyResourceId
          )

          const images = product.images.edges.map((e) => e.node.url)
          const mainImage = variant.image?.url || product.featuredImage?.url || images[0]

          const productData = {
            shopifyProductId: product.legacyResourceId,
            shopifyVariantId: variant.legacyResourceId,
            shopifyInventoryId: variant.inventoryItem?.id || null, // GID für Inventory
            title:
              variants.length > 1
                ? `${product.title} - ${variant.title}`
                : product.title,
            description: product.description || null,
            vendor: product.vendor || null,
            productType: product.productType || null,
            imageUrl: mainImage || null,
            images,
            handle: product.handle || null,
            shopifyPrice: parseFloat(variant.price),
            compareAtPrice: variant.compareAtPrice
              ? parseFloat(variant.compareAtPrice)
              : null,
            inventoryQuantity: variant.inventoryQuantity,
            lastSyncAt: new Date(),
          }

          if (existingProduct) {
            await prisma.shopProduct.update({
              where: { id: existingProduct.id },
              data: productData,
            })
            result.productsUpdated++
          } else {
            await prisma.shopProduct.create({
              data: {
                connectionId,
                ...productData,
              },
            })
            result.productsCreated++
          }
        }
      }

      hasNextPage = response.pageInfo.hasNextPage
      cursor = response.pageInfo.endCursor || undefined
    }

    // Produkte entfernen, die nicht mehr in Shopify existieren
    const productsToRemove = existingProducts.filter(
      (p) =>
        !syncedProductIds.has(`${p.shopifyProductId}:${p.shopifyVariantId || ''}`)
    )

    if (productsToRemove.length > 0) {
      await prisma.shopProduct.deleteMany({
        where: {
          id: { in: productsToRemove.map((p) => p.id) },
        },
      })
      result.productsRemoved = productsToRemove.length
    }

    // Verbindung aktualisieren
    await prisma.shopifyConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    })
  } catch (error) {
    result.success = false
    result.errors.push(
      error instanceof Error ? error.message : 'Unbekannter Fehler'
    )
  }

  return result
}

/**
 * Aktualisiert ein einzelnes Produkt von Shopify
 */
export async function syncSingleProduct(
  connectionId: string,
  shopifyProductId: string
): Promise<boolean> {
  const client = await createClientFromConnection(connectionId)

  if (!client) {
    return false
  }

  try {
    const product = await client.getProduct(
      `gid://shopify/Product/${shopifyProductId}`
    )

    if (!product) {
      // Produkt wurde in Shopify gelöscht - bei uns auch entfernen
      await prisma.shopProduct.deleteMany({
        where: {
          connectionId,
          shopifyProductId,
        },
      })
      return true
    }

    const variants = product.variants.edges.map((e) => e.node)
    const images = product.images.edges.map((e) => e.node.url)

    for (const variant of variants) {
      const mainImage =
        variant.image?.url || product.featuredImage?.url || images[0]

      await prisma.shopProduct.upsert({
        where: {
          connectionId_shopifyProductId_shopifyVariantId: {
            connectionId,
            shopifyProductId: product.legacyResourceId,
            shopifyVariantId: variant.legacyResourceId,
          },
        },
        update: {
          shopifyInventoryId: variant.inventoryItem?.id || null,
          title:
            variants.length > 1
              ? `${product.title} - ${variant.title}`
              : product.title,
          description: product.description || null,
          vendor: product.vendor || null,
          productType: product.productType || null,
          imageUrl: mainImage || null,
          images,
          handle: product.handle || null,
          shopifyPrice: parseFloat(variant.price),
          compareAtPrice: variant.compareAtPrice
            ? parseFloat(variant.compareAtPrice)
            : null,
          inventoryQuantity: variant.inventoryQuantity,
          lastSyncAt: new Date(),
        },
        create: {
          connectionId,
          shopifyProductId: product.legacyResourceId,
          shopifyVariantId: variant.legacyResourceId,
          shopifyInventoryId: variant.inventoryItem?.id || null,
          title:
            variants.length > 1
              ? `${product.title} - ${variant.title}`
              : product.title,
          description: product.description || null,
          vendor: product.vendor || null,
          productType: product.productType || null,
          imageUrl: mainImage || null,
          images,
          handle: product.handle || null,
          shopifyPrice: parseFloat(variant.price),
          compareAtPrice: variant.compareAtPrice
            ? parseFloat(variant.compareAtPrice)
            : null,
          inventoryQuantity: variant.inventoryQuantity,
          lastSyncAt: new Date(),
        },
      })
    }

    return true
  } catch (error) {
    console.error('Fehler beim Synchronisieren des Produkts:', error)
    return false
  }
}

/**
 * Holt Produkte für einen Salon mit berechneten Stylist-Preisen
 */
export async function getProductsWithStylistPrices(
  salonId: string,
  options?: {
    limit?: number
    offset?: number
    search?: string
    categoryFilter?: string
  }
) {
  // Shop-Einstellungen holen
  const settings = await prisma.shopSettings.findUnique({
    where: { salonId },
  })

  // Verbindung holen
  const connection = await prisma.shopifyConnection.findUnique({
    where: { salonId },
    include: {
      products: {
        where: {
          isActive: true,
          ...(options?.search && {
            title: { contains: options.search, mode: 'insensitive' },
          }),
          ...(options?.categoryFilter && {
            productType: options.categoryFilter,
          }),
        },
        orderBy: { title: 'asc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      },
    },
  })

  if (!connection) {
    return []
  }

  // Preise berechnen
  return connection.products.map((product) => {
    const stylistPrice = calculateStylistPrice(product, settings)

    return {
      ...product,
      stylistPrice,
      savings:
        Number(product.shopifyPrice) - stylistPrice > 0
          ? Number(product.shopifyPrice) - stylistPrice
          : 0,
      savingsPercent:
        Number(product.shopifyPrice) > 0
          ? Math.round(
              ((Number(product.shopifyPrice) - stylistPrice) /
                Number(product.shopifyPrice)) *
                100
            )
          : 0,
    }
  })
}

/**
 * Berechnet den Stylist-Preis (B2B)
 */
export function calculateStylistPrice(
  product: {
    purchasePrice: number | null | { toNumber: () => number }
    shopifyPrice: number | { toNumber: () => number }
    customMarginType: string | null
    customMarginValue: number | null | { toNumber: () => number }
  },
  settings: {
    defaultMarginType: string
    defaultMarginValue: number | { toNumber: () => number }
  } | null
): number {
  // Basis: EK wenn vorhanden, sonst Shopify-VK
  const basePrice =
    product.purchasePrice !== null
      ? typeof product.purchasePrice === 'object'
        ? product.purchasePrice.toNumber()
        : product.purchasePrice
      : typeof product.shopifyPrice === 'object'
        ? product.shopifyPrice.toNumber()
        : product.shopifyPrice

  // Marge-Typ und -Wert ermitteln
  const marginType =
    product.customMarginType || settings?.defaultMarginType || 'PERCENTAGE'
  const marginValue =
    product.customMarginValue !== null
      ? typeof product.customMarginValue === 'object'
        ? product.customMarginValue.toNumber()
        : product.customMarginValue
      : settings
        ? typeof settings.defaultMarginValue === 'object'
          ? settings.defaultMarginValue.toNumber()
          : settings.defaultMarginValue
        : 20

  // Preis berechnen
  if (marginType === 'PERCENTAGE') {
    return Math.round(basePrice * (1 + marginValue / 100) * 100) / 100
  } else {
    return Math.round((basePrice + marginValue) * 100) / 100
  }
}

/**
 * Berechnet die Affiliate-Provision
 */
export function calculateCommission(
  product: {
    shopifyPrice: number | { toNumber: () => number }
    customCommissionType: string | null
    customCommissionValue: number | null | { toNumber: () => number }
  },
  settings: {
    defaultCommissionType: string
    defaultCommissionValue: number | { toNumber: () => number }
  } | null
): number {
  const salePrice =
    typeof product.shopifyPrice === 'object'
      ? product.shopifyPrice.toNumber()
      : product.shopifyPrice

  const commissionType =
    product.customCommissionType ||
    settings?.defaultCommissionType ||
    'PERCENTAGE'
  const commissionValue =
    product.customCommissionValue !== null
      ? typeof product.customCommissionValue === 'object'
        ? product.customCommissionValue.toNumber()
        : product.customCommissionValue
      : settings
        ? typeof settings.defaultCommissionValue === 'object'
          ? settings.defaultCommissionValue.toNumber()
          : settings.defaultCommissionValue
        : 10

  if (commissionType === 'PERCENTAGE') {
    return Math.round(salePrice * (commissionValue / 100) * 100) / 100
  } else {
    return Math.round(commissionValue * 100) / 100
  }
}

/**
 * Holt alle Produktkategorien eines Salons
 */
export async function getProductCategories(salonId: string): Promise<string[]> {
  const connection = await prisma.shopifyConnection.findUnique({
    where: { salonId },
  })

  if (!connection) {
    return []
  }

  const categories = await prisma.shopProduct.findMany({
    where: {
      connectionId: connection.id,
      isActive: true,
      productType: { not: null },
    },
    select: { productType: true },
    distinct: ['productType'],
    orderBy: { productType: 'asc' },
  })

  return categories
    .map((c) => c.productType)
    .filter((c): c is string => c !== null)
}

