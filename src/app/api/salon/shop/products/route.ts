/**
 * API Route: Produkte
 * GET /api/salon/shop/products
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getProductCategories } from '@/lib/shopify'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '24', 10)
    const lowStockOnly = searchParams.get('lowStock') === 'true'

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

    if (!salon.shopifyConnection) {
      return NextResponse.json(
        { error: 'Keine Shopify-Verbindung gefunden' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    // Filter erstellen
    const whereClause: Record<string, unknown> = {
      connectionId: salon.shopifyConnection.id,
      isActive: true,
    }

    // Suche hinzufügen
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Kategorie-Filter
    if (category) {
      whereClause.productType = category
    }

    // Low-Stock-Filter direkt in der Datenbank-Abfrage
    // Wir nutzen raw SQL oder einen Workaround, da Prisma keine Feld-Vergleiche unterstützt
    // Stattdessen holen wir alle und filtern, aber mit einem besseren Ansatz
    if (lowStockOnly) {
      // Für low-stock müssen wir alle holen und dann filtern, da Prisma
      // keine field-to-field comparison in WHERE unterstützt
      const allProducts = await prisma.shopProduct.findMany({
        where: whereClause,
        orderBy: [{ inventoryQuantity: 'asc' }, { title: 'asc' }],
      })
      
      // Filtern nach low stock
      const lowStockProducts = allProducts.filter(
        (p) => p.inventoryQuantity <= p.lowStockThreshold
      )
      
      const total = lowStockProducts.length
      const products = lowStockProducts.slice(offset, offset + limit)

      // Kategorien holen
      const categories = await getProductCategories(salon.id)

      // Antwort formatieren
      const formattedProducts = products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        productType: product.productType,
        handle: product.handle,
        imageUrl: product.imageUrl,
        images: product.images,
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
        isLowStock: product.inventoryQuantity <= product.lowStockThreshold,
        isOutOfStock: product.inventoryQuantity <= 0,
        trackInventory: product.trackInventory,
        isAffiliateEnabled: product.isAffiliateEnabled,
        lastSyncAt: product.lastSyncAt,
      }))

      return NextResponse.json({
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        categories,
        settings: salon.shopSettings
          ? {
              defaultMarginType: salon.shopSettings.defaultMarginType,
              defaultMarginValue: Number(salon.shopSettings.defaultMarginValue),
            }
          : null,
      })
    }

    // Gesamtzahl (ohne lowStock-Filter)
    const total = await prisma.shopProduct.count({ where: whereClause })

    // Produkte holen
    const products = await prisma.shopProduct.findMany({
      where: whereClause,
      orderBy: [{ inventoryQuantity: 'asc' }, { title: 'asc' }],
      take: limit,
      skip: offset,
    })

    // Kategorien holen
    const categories = await getProductCategories(salon.id)

    // Antwort formatieren
    const formattedProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      vendor: product.vendor,
      productType: product.productType,
      handle: product.handle,
      imageUrl: product.imageUrl,
      images: product.images,
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
      isLowStock: product.inventoryQuantity <= product.lowStockThreshold,
      isOutOfStock: product.inventoryQuantity <= 0,
      trackInventory: product.trackInventory,
      isAffiliateEnabled: product.isAffiliateEnabled,
      lastSyncAt: product.lastSyncAt,
    }))

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      categories,
      settings: salon.shopSettings
        ? {
            defaultMarginType: salon.shopSettings.defaultMarginType,
            defaultMarginValue: Number(salon.shopSettings.defaultMarginValue),
          }
        : null,
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Produkte:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

