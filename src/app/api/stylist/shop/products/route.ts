/**
 * API Route: Produkte für Stylisten
 * GET /api/stylist/shop/products
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getProductsWithStylistPrices, getProductCategories } from '@/lib/shopify'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '24', 10)

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfen ob Stylist mit Salon verbunden ist
    const connection = await prisma.salonStylistConnection.findFirst({
      where: {
        stylistId: session.user.id,
        salonId,
        isActive: true,
      },
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Sie sind nicht mit diesem Salon verbunden' },
        { status: 403 }
      )
    }

    // Produkte mit Stylist-Preisen holen
    const products = await getProductsWithStylistPrices(salonId, {
      limit,
      offset: (page - 1) * limit,
      search,
      categoryFilter: category,
    })

    // Kategorien holen
    const categories = await getProductCategories(salonId)

    // Gesamtzahl für Pagination
    const shopifyConnection = await prisma.shopifyConnection.findUnique({
      where: { salonId },
    })

    const total = shopifyConnection
      ? await prisma.shopProduct.count({
          where: {
            connectionId: shopifyConnection.id,
            isActive: true,
            ...(search && {
              title: { contains: search, mode: 'insensitive' },
            }),
            ...(category && { productType: category }),
          },
        })
      : 0

    return NextResponse.json({
      products: products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        vendor: product.vendor,
        productType: product.productType,
        imageUrl: product.imageUrl,
        images: product.images,
        originalPrice: Number(product.shopifyPrice),
        stylistPrice: product.stylistPrice,
        savings: product.savings,
        savingsPercent: product.savingsPercent,
        inventoryQuantity: product.inventoryQuantity,
        isAvailable: product.inventoryQuantity > 0 || !product.trackInventory,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      categories,
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Produkte:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

