/**
 * API Route: Warenkorb für Stylisten
 * GET/POST/DELETE /api/stylist/shop/cart
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateStylistPrice } from '@/lib/shopify'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Warenkorb mit Items holen
    const cart = await prisma.shopCart.findUnique({
      where: {
        stylistId_salonId: {
          stylistId: session.user.id,
          salonId,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Shop-Einstellungen für Preisberechnung
    const settings = await prisma.shopSettings.findUnique({
      where: { salonId },
    })

    if (!cart) {
      return NextResponse.json({
        cart: null,
        items: [],
        subtotal: 0,
        itemCount: 0,
      })
    }

    // Items mit berechneten Preisen
    const itemsWithPrices = cart.items.map((item) => {
      const stylistPrice = calculateStylistPrice(item.product, settings)
      const itemTotal = stylistPrice * item.quantity

      return {
        id: item.id,
        productId: item.product.id,
        title: item.product.title,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        unitPrice: stylistPrice,
        total: itemTotal,
        originalPrice: Number(item.product.shopifyPrice),
        inventoryQuantity: item.product.inventoryQuantity,
        isAvailable:
          item.product.inventoryQuantity >= item.quantity ||
          !item.product.trackInventory,
      }
    })

    const subtotal = itemsWithPrices.reduce((sum, item) => sum + item.total, 0)
    const itemCount = itemsWithPrices.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    return NextResponse.json({
      cart: {
        id: cart.id,
        salonId: cart.salonId,
      },
      items: itemsWithPrices,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount,
    })
  } catch (error) {
    console.error('Fehler beim Abrufen des Warenkorbs:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { salonId, productId, quantity = 1 } = body

    if (!salonId || !productId) {
      return NextResponse.json(
        { error: 'Salon-ID und Produkt-ID sind erforderlich' },
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

    // Produkt prüfen
    const product = await prisma.shopProduct.findUnique({
      where: { id: productId },
      include: { connection: true },
    })

    if (!product || !product.isActive || product.connection.salonId !== salonId) {
      return NextResponse.json(
        { error: 'Produkt nicht verfügbar' },
        { status: 400 }
      )
    }

    // Lagerbestand prüfen
    if (product.trackInventory && product.inventoryQuantity < quantity) {
      return NextResponse.json(
        { error: `Nur ${product.inventoryQuantity} Stück verfügbar` },
        { status: 400 }
      )
    }

    // Warenkorb erstellen oder holen
    let cart = await prisma.shopCart.findUnique({
      where: {
        stylistId_salonId: {
          stylistId: session.user.id,
          salonId,
        },
      },
    })

    if (!cart) {
      cart = await prisma.shopCart.create({
        data: {
          stylistId: session.user.id,
          salonId,
        },
      })
    }

    // Prüfen ob Produkt bereits im Warenkorb
    const existingItem = await prisma.shopCartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      // Menge aktualisieren
      const newQuantity = existingItem.quantity + quantity

      if (product.trackInventory && product.inventoryQuantity < newQuantity) {
        return NextResponse.json(
          { error: `Nur ${product.inventoryQuantity} Stück verfügbar` },
          { status: 400 }
        )
      }

      await prisma.shopCartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // Neues Item erstellen
      await prisma.shopCartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Produkt zum Warenkorb hinzugefügt',
    })
  } catch (error) {
    console.error('Fehler beim Hinzufügen zum Warenkorb:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Item-ID und Menge sind erforderlich' },
        { status: 400 }
      )
    }

    // Item mit Warenkorb holen
    const item = await prisma.shopCartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    })

    if (!item || item.cart.stylistId !== session.user.id) {
      return NextResponse.json(
        { error: 'Item nicht gefunden' },
        { status: 404 }
      )
    }

    if (quantity <= 0) {
      // Item löschen
      await prisma.shopCartItem.delete({
        where: { id: itemId },
      })
    } else {
      // Lagerbestand prüfen
      if (
        item.product.trackInventory &&
        item.product.inventoryQuantity < quantity
      ) {
        return NextResponse.json(
          { error: `Nur ${item.product.inventoryQuantity} Stück verfügbar` },
          { status: 400 }
        )
      }

      // Menge aktualisieren
      await prisma.shopCartItem.update({
        where: { id: itemId },
        data: { quantity },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Warenkorb aktualisiert',
    })
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Warenkorbs:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')
    const itemId = searchParams.get('itemId')

    if (itemId) {
      // Einzelnes Item löschen
      const item = await prisma.shopCartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
      })

      if (!item || item.cart.stylistId !== session.user.id) {
        return NextResponse.json(
          { error: 'Item nicht gefunden' },
          { status: 404 }
        )
      }

      await prisma.shopCartItem.delete({
        where: { id: itemId },
      })
    } else if (salonId) {
      // Ganzen Warenkorb leeren
      await prisma.shopCartItem.deleteMany({
        where: {
          cart: {
            stylistId: session.user.id,
            salonId,
          },
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Item-ID oder Salon-ID erforderlich' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item entfernt',
    })
  } catch (error) {
    console.error('Fehler beim Löschen aus dem Warenkorb:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

