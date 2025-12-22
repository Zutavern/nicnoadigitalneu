/**
 * API Route: Shopify Verbindung testen (ohne zu speichern)
 * POST /api/salon/shop/test-connection
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ShopifyClient } from '@/lib/shopify'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { shopDomain, accessToken } = body

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        { error: 'Shop-Domain und Access Token sind erforderlich' },
        { status: 400 }
      )
    }

    // Domain normalisieren
    let normalizedDomain = shopDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .toLowerCase()
    
    // Wenn noch kein .myshopify.com, hinzufügen
    if (!normalizedDomain.includes('.myshopify.com')) {
      normalizedDomain = `${normalizedDomain}.myshopify.com`
    }

    // Verbindung testen
    const client = new ShopifyClient({
      shopDomain: normalizedDomain,
      accessToken,
    })

    const testResult = await client.testConnection()

    if (!testResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: testResult.error || 'Verbindung fehlgeschlagen' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      shopName: testResult.shopName,
      shopDomain: normalizedDomain,
      message: 'Verbindung erfolgreich!',
    })
  } catch (error) {
    console.error('Fehler beim Testen der Shopify-Verbindung:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Interner Serverfehler' 
      },
      { status: 500 }
    )
  }
}

