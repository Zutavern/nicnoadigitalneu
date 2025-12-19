/**
 * Stripe Plans Synchronization API
 * 
 * Synchronisiert Stripe Price IDs mit der Datenbank
 * Basierend auf den aktuellen Stripe-Produkten und Preisen
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, isStripeConfigured } from '@/lib/stripe-server'

// Mapping von Stripe-Produktnamen zu DB-Slugs
const PRODUCT_SLUG_MAP: Record<string, string> = {
  'Stylist Starter': 'stylist-starter',
  'Stylist Professional': 'stylist-professional',
  'Stylist Premium': 'stylist-premium',
  'Salon Basic': 'salon-basic',
  'Salon Small Business': 'salon-small',
  'Salon Business': 'salon-business',
  'Salon Enterprise': 'salon-enterprise',
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // Admin-Check
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    if (!isStripeConfigured) {
      return NextResponse.json(
        { error: 'Stripe ist nicht konfiguriert' },
        { status: 503 }
      )
    }

    const stripe = getStripe()
    const results: Array<{ plan: string; status: string; priceIds?: Record<string, string> }> = []

    // Alle Stripe-Produkte abrufen
    const products = await stripe.products.list({ limit: 100, active: true })
    
    for (const product of products.data) {
      const slug = PRODUCT_SLUG_MAP[product.name]
      
      if (!slug) {
        // Überspringe Produkte ohne Mapping (z.B. AI Credits)
        continue
      }

      // Plan in der DB finden
      const plan = await prisma.subscriptionPlan.findFirst({
        where: { slug }
      })

      if (!plan) {
        results.push({ plan: product.name, status: `Plan "${slug}" nicht in DB gefunden` })
        continue
      }

      // Alle Preise für dieses Produkt abrufen
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100
      })

      const priceIds: Record<string, string | null> = {
        stripePriceIdMonthly: null,
        stripePriceIdQuarterly: null,
        stripePriceIdSixMonths: null,
        stripePriceIdYearly: null,
      }

      for (const price of prices.data) {
        if (price.recurring) {
          const interval = price.recurring.interval
          const intervalCount = price.recurring.interval_count

          if (interval === 'month' && intervalCount === 1) {
            priceIds.stripePriceIdMonthly = price.id
          } else if (interval === 'month' && intervalCount === 3) {
            priceIds.stripePriceIdQuarterly = price.id
          } else if (interval === 'month' && intervalCount === 6) {
            priceIds.stripePriceIdSixMonths = price.id
          } else if (interval === 'year' && intervalCount === 1) {
            priceIds.stripePriceIdYearly = price.id
          }
        }
      }

      // DB aktualisieren (nur nicht-null Werte)
      const updateData: Record<string, string> = {}
      for (const [key, value] of Object.entries(priceIds)) {
        if (value) {
          updateData[key] = value
        }
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.subscriptionPlan.update({
          where: { id: plan.id },
          data: updateData
        })

        results.push({
          plan: product.name,
          status: 'Synchronisiert',
          priceIds: updateData
        })
      } else {
        results.push({
          plan: product.name,
          status: 'Keine Preise gefunden'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.filter(r => r.status === 'Synchronisiert').length} Pläne synchronisiert`,
      results
    })

  } catch (error) {
    console.error('Error syncing Stripe plans:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Synchronisierung' },
      { status: 500 }
    )
  }
}



