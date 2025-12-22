/**
 * API Route: Checkout für Stylisten
 * POST /api/stylist/shop/checkout
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createOrder, calculateOrderSummary } from '@/lib/shopify'
import { getStripe } from '@/lib/stripe-server'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { salonId, paymentMethod, notes } = body

    if (!salonId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Salon-ID und Zahlungsmethode sind erforderlich' },
        { status: 400 }
      )
    }

    if (!['STRIPE', 'RENT_ADDITION'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Ungültige Zahlungsmethode' },
        { status: 400 }
      )
    }

    // Prüfen ob Stylist mit Salon verbunden ist
    const salonConnection = await prisma.salonStylistConnection.findFirst({
      where: {
        stylistId: session.user.id,
        salonId,
        isActive: true,
      },
    })

    if (!salonConnection) {
      return NextResponse.json(
        { error: 'Sie sind nicht mit diesem Salon verbunden' },
        { status: 403 }
      )
    }

    // Shop-Einstellungen prüfen
    const shopSettings = await prisma.shopSettings.findUnique({
      where: { salonId },
    })

    if (
      paymentMethod === 'STRIPE' &&
      !shopSettings?.allowStripePayment
    ) {
      return NextResponse.json(
        { error: 'Stripe-Zahlung ist für diesen Shop nicht aktiviert' },
        { status: 400 }
      )
    }

    if (
      paymentMethod === 'RENT_ADDITION' &&
      !shopSettings?.allowRentAddition
    ) {
      return NextResponse.json(
        { error: 'Zahlung über Stuhlmiete ist für diesen Shop nicht aktiviert' },
        { status: 400 }
      )
    }

    // Warenkorb holen
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

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Warenkorb ist leer' },
        { status: 400 }
      )
    }

    // Items für Bestellung vorbereiten
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))

    // Bestellzusammenfassung berechnen
    const summary = await calculateOrderSummary(salonId, orderItems)

    if (!summary) {
      return NextResponse.json(
        { error: 'Fehler bei der Bestellberechnung' },
        { status: 500 }
      )
    }

    if (paymentMethod === 'STRIPE') {
      // Stripe Checkout Session erstellen
      const stripe = getStripe()

      // User für Stripe Customer
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true, stripeCustomerId: true },
      })

      if (!user?.email) {
        return NextResponse.json(
          { error: 'E-Mail-Adresse erforderlich' },
          { status: 400 }
        )
      }

      // Stripe Customer erstellen oder holen
      let customerId = user.stripeCustomerId

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: {
            userId: session.user.id,
            platform: 'nicnoa',
          },
        })
        customerId = customer.id

        await prisma.user.update({
          where: { id: session.user.id },
          data: { stripeCustomerId: customerId },
        })
      }

      // Line Items für Stripe
      const lineItems = summary.items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.title,
            images: item.imageUrl ? [item.imageUrl] : undefined,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      }))

      // Checkout Session erstellen
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card', 'link'],
        line_items: lineItems,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/stylist/shop/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/stylist/shop/cart?salonId=${salonId}&cancelled=true`,
        automatic_tax: { enabled: true },
        locale: 'de',
        metadata: {
          userId: session.user.id,
          salonId,
          type: 'shop_order',
          items: JSON.stringify(orderItems),
        },
      })

      return NextResponse.json({
        success: true,
        paymentMethod: 'STRIPE',
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
      })
    } else {
      // RENT_ADDITION - Bestellung direkt erstellen
      const result = await createOrder({
        salonId,
        stylistId: session.user.id,
        items: orderItems,
        paymentMethod: 'RENT_ADDITION',
        notes,
      })

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Fehler beim Erstellen der Bestellung' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        paymentMethod: 'RENT_ADDITION',
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        message: 'Bestellung erfolgreich erstellt. Der Betrag wird zur nächsten Stuhlmiete addiert.',
      })
    }
  } catch (error) {
    console.error('Fehler beim Checkout:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// GET für Order-Summary vor Checkout
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

    // Warenkorb holen
    const cart = await prisma.shopCart.findUnique({
      where: {
        stylistId_salonId: {
          stylistId: session.user.id,
          salonId,
        },
      },
      include: {
        items: true,
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Warenkorb ist leer' },
        { status: 400 }
      )
    }

    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))

    const summary = await calculateOrderSummary(salonId, orderItems)

    if (!summary) {
      return NextResponse.json(
        { error: 'Fehler bei der Berechnung' },
        { status: 500 }
      )
    }

    // Shop-Einstellungen für Zahlungsoptionen
    const shopSettings = await prisma.shopSettings.findUnique({
      where: { salonId },
    })

    return NextResponse.json({
      summary: {
        subtotal: summary.subtotal,
        tax: summary.tax,
        total: summary.total,
        items: summary.items,
      },
      paymentOptions: {
        stripe: shopSettings?.allowStripePayment ?? true,
        rentAddition: shopSettings?.allowRentAddition ?? true,
      },
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Zusammenfassung:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

