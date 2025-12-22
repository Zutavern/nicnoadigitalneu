/**
 * API Route: Einzelnes Produkt
 * GET/PUT /api/salon/shop/products/[id]
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateStylistPrice, calculateCommission, ShopifyClient } from '@/lib/shopify'
import { decryptToken, isEncrypted } from '@/lib/shopify/encryption'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
        isActive: true,
        isDeleted: false,
      },
      include: {
        shopifyConnection: true,
        shopSettings: true,
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 403 })
    }

    const product = await prisma.shopProduct.findUnique({
      where: { id },
      include: {
        connection: true,
      },
    })

    if (!product || product.connection.salonId !== salon.id) {
      return NextResponse.json({ error: 'Produkt nicht gefunden' }, { status: 404 })
    }

    // Stylist-Preis und Provision berechnen
    const stylistPrice = calculateStylistPrice(product, salon.shopSettings)
    const commission = calculateCommission(product, salon.shopSettings)

    return NextResponse.json({
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        productType: product.productType,
        handle: product.handle,
        imageUrl: product.imageUrl,
        images: product.images,
        shopifyProductId: product.shopifyProductId,
        shopifyVariantId: product.shopifyVariantId,
        shopifyInventoryId: product.shopifyInventoryId, // Für Inventory-Sync
        shopifyPrice: Number(product.shopifyPrice),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        purchasePrice: product.purchasePrice ? Number(product.purchasePrice) : null,
        customMarginType: product.customMarginType,
        customMarginValue: product.customMarginValue ? Number(product.customMarginValue) : null,
        customCommissionType: product.customCommissionType,
        customCommissionValue: product.customCommissionValue
          ? Number(product.customCommissionValue)
          : null,
        inventoryQuantity: product.inventoryQuantity,
        lowStockThreshold: product.lowStockThreshold,
        trackInventory: product.trackInventory,
        isActive: product.isActive,
        isAffiliateEnabled: product.isAffiliateEnabled,
        lastSyncAt: product.lastSyncAt,
        // Berechnete Werte
        calculatedStylistPrice: stylistPrice,
        calculatedCommission: commission,
        // Sync-Fähigkeiten
        canSyncInventory: !!product.shopifyInventoryId,
        canSyncPrice: !!product.shopifyVariantId,
        canSyncProduct: !!product.shopifyProductId,
      },
    })
  } catch (error) {
    console.error('Fehler beim Abrufen des Produkts:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
        isActive: true,
        isDeleted: false,
      },
      include: {
        shopifyConnection: true,
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 403 })
    }

    const product = await prisma.shopProduct.findUnique({
      where: { id },
      include: {
        connection: true,
      },
    })

    if (!product || product.connection.salonId !== salon.id) {
      return NextResponse.json({ error: 'Produkt nicht gefunden' }, { status: 404 })
    }

    const body = await request.json()

    // NICNOA-spezifische Felder
    const {
      purchasePrice,
      customMarginType,
      customMarginValue,
      customCommissionType,
      customCommissionValue,
      lowStockThreshold,
      isActive,
      isAffiliateEnabled,
      inventoryQuantity,
      // Shopify-Felder (werden zu Shopify gepusht)
      title,
      description,
      vendor,
      productType,
      shopifyPrice,
      syncToShopify, // Flag ob zu Shopify gepusht werden soll
    } = body

    // Validierung
    if (customMarginType && !['PERCENTAGE', 'FIXED', null].includes(customMarginType)) {
      return NextResponse.json(
        { error: 'Ungültiger Marge-Typ' },
        { status: 400 }
      )
    }

    if (customCommissionType && !['PERCENTAGE', 'FIXED', null].includes(customCommissionType)) {
      return NextResponse.json(
        { error: 'Ungültiger Provisions-Typ' },
        { status: 400 }
      )
    }

    const shopifyErrors: string[] = []

    // Shopify-Updates durchführen wenn syncToShopify=true
    if (syncToShopify && salon.shopifyConnection) {
      const accessToken = isEncrypted(salon.shopifyConnection.accessToken)
        ? decryptToken(salon.shopifyConnection.accessToken)
        : salon.shopifyConnection.accessToken

      const client = new ShopifyClient({
        shopDomain: salon.shopifyConnection.shopDomain,
        accessToken,
      })

      // 1. Produktdaten zu Shopify pushen (Titel, Beschreibung, Vendor)
      const hasProductChanges = title || description !== undefined || vendor || productType
      if (hasProductChanges) {
        const productGid = `gid://shopify/Product/${product.shopifyProductId}`
        const updateResult = await client.updateProduct({
          productId: productGid,
          ...(title && { title }),
          ...(description !== undefined && { descriptionHtml: description || '' }),
          ...(vendor && { vendor }),
          ...(productType && { productType }),
        })

        if (!updateResult.success) {
          shopifyErrors.push(`Produktdaten: ${updateResult.error}`)
        }
      }

      // 2. Varianten-Preis zu Shopify pushen
      if (shopifyPrice !== undefined && product.shopifyVariantId) {
        const productGid = `gid://shopify/Product/${product.shopifyProductId}`
        const variantGid = `gid://shopify/ProductVariant/${product.shopifyVariantId}`
        const priceResult = await client.updateProductVariant({
          productId: productGid,
          variantId: variantGid,
          price: String(shopifyPrice),
        })

        if (!priceResult.success) {
          shopifyErrors.push(`Preis: ${priceResult.error}`)
        }
      }

      // 3. Lagerbestand zu Shopify pushen
      if (inventoryQuantity !== undefined) {
        if (!product.shopifyInventoryId) {
          shopifyErrors.push(
            'Lagerbestand: Keine Inventory-ID vorhanden. Bitte synchronisiere die Produkte neu.'
          )
        } else {
          try {
            // Ersten Standort holen
            const locations = await client.getLocations()
            const activeLocation = locations.find((l) => l.isActive)

            if (activeLocation) {
              const inventoryResult = await client.setInventoryQuantity(
                product.shopifyInventoryId,
                activeLocation.id,
                inventoryQuantity
              )

              if (!inventoryResult.success) {
                shopifyErrors.push(`Lagerbestand: ${inventoryResult.error}`)
              }
            } else {
              shopifyErrors.push('Kein aktiver Standort in Shopify gefunden')
            }
          } catch (locationError: unknown) {
            const errorMessage =
              locationError instanceof Error ? locationError.message : 'Unbekannter Fehler'
            if (errorMessage.includes('Access denied') || errorMessage.includes('locations')) {
              shopifyErrors.push(
                'Lagerbestand: Keine Berechtigung für Standorte. Bitte aktiviere "read_locations" in deiner Shopify App.'
              )
            } else {
              shopifyErrors.push(`Lagerbestand: ${errorMessage}`)
            }
          }
        }
      }
    }

    // Lokale Datenbank aktualisieren
    const updatedProduct = await prisma.shopProduct.update({
      where: { id },
      data: {
        // Shopify-Daten lokal speichern
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(vendor && { vendor }),
        ...(productType && { productType }),
        ...(shopifyPrice !== undefined && { shopifyPrice }),
        ...(inventoryQuantity !== undefined && { inventoryQuantity }),
        // NICNOA-spezifische Felder
        ...(purchasePrice !== undefined && {
          purchasePrice: purchasePrice === null ? null : purchasePrice,
        }),
        ...(customMarginType !== undefined && {
          customMarginType: customMarginType === null ? null : customMarginType,
        }),
        ...(customMarginValue !== undefined && {
          customMarginValue: customMarginValue === null ? null : customMarginValue,
        }),
        ...(customCommissionType !== undefined && {
          customCommissionType: customCommissionType === null ? null : customCommissionType,
        }),
        ...(customCommissionValue !== undefined && {
          customCommissionValue: customCommissionValue === null ? null : customCommissionValue,
        }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold }),
        ...(isActive !== undefined && { isActive }),
        ...(isAffiliateEnabled !== undefined && { isAffiliateEnabled }),
      },
    })

    return NextResponse.json({
      success: true,
      shopifyErrors: shopifyErrors.length > 0 ? shopifyErrors : undefined,
      product: {
        id: updatedProduct.id,
        title: updatedProduct.title,
        description: updatedProduct.description,
        vendor: updatedProduct.vendor,
        productType: updatedProduct.productType,
        shopifyPrice: Number(updatedProduct.shopifyPrice),
        purchasePrice: updatedProduct.purchasePrice
          ? Number(updatedProduct.purchasePrice)
          : null,
        customMarginType: updatedProduct.customMarginType,
        customMarginValue: updatedProduct.customMarginValue
          ? Number(updatedProduct.customMarginValue)
          : null,
        customCommissionType: updatedProduct.customCommissionType,
        customCommissionValue: updatedProduct.customCommissionValue
          ? Number(updatedProduct.customCommissionValue)
          : null,
        inventoryQuantity: updatedProduct.inventoryQuantity,
        lowStockThreshold: updatedProduct.lowStockThreshold,
        isActive: updatedProduct.isActive,
        isAffiliateEnabled: updatedProduct.isAffiliateEnabled,
      },
    })
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Produkts:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

