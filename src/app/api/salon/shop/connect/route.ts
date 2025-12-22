/**
 * API Route: Shopify Store verbinden
 * POST /api/salon/shop/connect
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ShopifyClient, encryptToken, syncProducts } from '@/lib/shopify'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Prüfen ob User ein Salon-Besitzer ist
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id,
        isActive: true,
        isDeleted: false,
      },
    })

    if (!salon) {
      return NextResponse.json(
        { error: 'Kein Salon gefunden. Bitte erstellen Sie zuerst einen Salon.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { shopDomain, accessToken, apiKey, apiSecretKey } = body

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        { error: 'Shop-Domain und Access Token sind erforderlich' },
        { status: 400 }
      )
    }

    // Domain normalisieren
    const normalizedDomain = shopDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .toLowerCase()

    // Prüfen ob bereits eine Verbindung existiert
    const existingConnection = await prisma.shopifyConnection.findUnique({
      where: { salonId: salon.id },
    })

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Es existiert bereits eine Shopify-Verbindung. Bitte zuerst trennen.' },
        { status: 400 }
      )
    }

    // Verbindung testen
    const client = new ShopifyClient({
      shopDomain: normalizedDomain,
      accessToken,
    })

    const testResult = await client.testConnection()

    if (!testResult.success) {
      return NextResponse.json(
        { error: `Verbindung fehlgeschlagen: ${testResult.error}` },
        { status: 400 }
      )
    }

    // Token verschlüsseln
    const encryptedToken = encryptToken(accessToken)
    const encryptedApiSecret = apiSecretKey ? encryptToken(apiSecretKey) : null

    // Verbindung erstellen
    const connection = await prisma.shopifyConnection.create({
      data: {
        salonId: salon.id,
        shopDomain: normalizedDomain,
        accessToken: encryptedToken,
        apiKey: apiKey || null,
        apiSecretKey: encryptedApiSecret,
        storeName: testResult.shopName,
        isActive: true,
      },
    })

    // Shop-Einstellungen erstellen (mit Standardwerten)
    await prisma.shopSettings.create({
      data: {
        salonId: salon.id,
        defaultMarginType: 'PERCENTAGE',
        defaultMarginValue: 20,
        defaultCommissionType: 'PERCENTAGE',
        defaultCommissionValue: 10,
        allowStripePayment: true,
        allowRentAddition: true,
        affiliateEnabled: false,
      },
    })

    // Produkte im Hintergrund synchronisieren
    syncProducts(connection.id).catch((error) => {
      console.error('Fehler bei der initialen Produktsynchronisierung:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Shopify erfolgreich verbunden',
      connection: {
        id: connection.id,
        shopDomain: connection.shopDomain,
        storeName: connection.storeName,
      },
    })
  } catch (error) {
    console.error('Fehler beim Verbinden mit Shopify:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

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
        shopifyConnection: {
          select: {
            id: true,
            shopDomain: true,
            storeName: true,
            isActive: true,
            lastSyncAt: true,
            createdAt: true,
          },
        },
      },
    })

    if (!salon) {
      return NextResponse.json({ error: 'Kein Salon gefunden' }, { status: 403 })
    }

    return NextResponse.json({
      connected: !!salon.shopifyConnection,
      connection: salon.shopifyConnection,
    })
  } catch (error) {
    console.error('Fehler beim Abrufen der Verbindung:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

