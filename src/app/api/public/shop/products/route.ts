import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/shop/products - Public endpoint for shop widget
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon ID erforderlich' },
        { status: 400 }
      )
    }

    // Get salon with shop connection
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: {
        shopifyConnections: {
          where: { isActive: true },
        },
        shopSettings: true,
      },
    })

    if (!salon || salon.shopifyConnections.length === 0) {
      return NextResponse.json(
        { error: 'Shop nicht verfügbar' },
        { status: 404 }
      )
    }

    // Build filter
    const where: Record<string, unknown> = {
      salonId,
      isActive: true,
      status: 'ACTIVE',
    }

    if (category) {
      where.productType = category
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.shopProduct.findMany({
        where,
        select: {
          id: true,
          shopifyProductId: true,
          title: true,
          description: true,
          productType: true,
          vendor: true,
          imageUrl: true,
          price: true,
          compareAtPrice: true,
          inventoryQuantity: true,
        },
        orderBy: { title: 'asc' },
        skip: offset,
        take: limit,
      }),
      prisma.shopProduct.count({ where }),
    ])

    // Get unique categories
    const categories = await prisma.shopProduct.findMany({
      where: {
        salonId,
        isActive: true,
        status: 'ACTIVE',
        productType: { not: null },
      },
      select: { productType: true },
      distinct: ['productType'],
    })

    // Set CORS headers for widget
    const response = NextResponse.json({
      salon: {
        id: salon.id,
        name: salon.name,
      },
      products: products.map((p) => ({
        id: p.id,
        shopifyProductId: p.shopifyProductId,
        title: p.title,
        description: p.description,
        category: p.productType,
        vendor: p.vendor,
        imageUrl: p.imageUrl,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        inStock: (p.inventoryQuantity || 0) > 0,
      })),
      categories: categories
        .map((c) => c.productType)
        .filter(Boolean) as string[],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response
  } catch (error) {
    console.error('Error fetching public products:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

