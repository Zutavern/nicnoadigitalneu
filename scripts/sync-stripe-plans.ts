/**
 * Stripe Plans Synchronization Script
 * 
 * Synchronisiert Stripe Price IDs mit der Datenbank
 * 
 * Ausführen: npx tsx scripts/sync-stripe-plans.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import Stripe from 'stripe'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Umgebungsvariablen prüfen
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY nicht gesetzt!')
  process.exit(1)
}
if (!process.env.DATABASE_URL && !process.env.DIRECT_DATABASE_URL) {
  console.error('❌ DATABASE_URL nicht gesetzt!')
  process.exit(1)
}

// Prisma mit PG-Adapter initialisieren
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter } as never)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil'
})

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

async function syncStripePlans() {
  console.log('🔄 Starte Stripe-Plan-Synchronisierung...\n')

  try {
    // Alle Stripe-Produkte abrufen
    const products = await stripe.products.list({ limit: 100, active: true })
    console.log(`📦 ${products.data.length} Stripe-Produkte gefunden\n`)

    let synced = 0
    let skipped = 0
    let errors = 0

    for (const product of products.data) {
      const slug = PRODUCT_SLUG_MAP[product.name]

      if (!slug) {
        console.log(`⏭️  "${product.name}" - Kein Mapping (übersprungen)`)
        skipped++
        continue
      }

      // Plan in der DB finden
      const plan = await prisma.subscriptionPlan.findFirst({
        where: { slug }
      })

      if (!plan) {
        console.log(`❌ "${product.name}" - Plan "${slug}" nicht in DB gefunden`)
        errors++
        continue
      }

      // Alle Preise für dieses Produkt abrufen
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100
      })

      const priceIds: Record<string, string | null> = {
        stripePriceMonthly: null,
        stripePriceQuarterly: null,
        stripePriceSixMonths: null,
        stripePriceYearly: null,
      }

      for (const price of prices.data) {
        if (price.recurring) {
          const interval = price.recurring.interval
          const intervalCount = price.recurring.interval_count

          if (interval === 'month' && intervalCount === 1) {
            priceIds.stripePriceMonthly = price.id
          } else if (interval === 'month' && intervalCount === 3) {
            priceIds.stripePriceQuarterly = price.id
          } else if (interval === 'month' && intervalCount === 6) {
            priceIds.stripePriceSixMonths = price.id
          } else if (interval === 'year' && intervalCount === 1) {
            priceIds.stripePriceYearly = price.id
          }
        }
      }

      // DB aktualisieren
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

        console.log(`✅ "${product.name}" → ${slug}`)
        console.log(`   Monthly: ${priceIds.stripePriceMonthly || '—'}`)
        console.log(`   Quarterly: ${priceIds.stripePriceQuarterly || '—'}`)
        console.log(`   SixMonths: ${priceIds.stripePriceSixMonths || '—'}`)
        console.log(`   Yearly: ${priceIds.stripePriceYearly || '—'}`)
        console.log('')
        synced++
      } else {
        console.log(`⚠️  "${product.name}" - Keine Preise gefunden`)
        skipped++
      }
    }

    console.log('━'.repeat(50))
    console.log(`\n📊 Ergebnis:`)
    console.log(`   ✅ Synchronisiert: ${synced}`)
    console.log(`   ⏭️  Übersprungen: ${skipped}`)
    console.log(`   ❌ Fehler: ${errors}`)
    console.log('')

  } catch (error) {
    console.error('❌ Fehler:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

syncStripePlans()

