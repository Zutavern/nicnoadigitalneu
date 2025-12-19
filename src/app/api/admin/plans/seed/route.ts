/**
 * Seed Stripe Plans API
 * 
 * POST /api/admin/plans/seed
 * Synchronisiert Stripe-Produkte mit der SubscriptionPlan Tabelle
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'

const STRIPE_PLANS = [
  // STYLIST PLÄNE
  {
    name: 'Starter',
    slug: 'stylist-starter',
    description: 'Perfekt für den Einstieg in die Selbstständigkeit',
    planType: 'STYLIST' as PlanType,
    priceMonthly: 29,
    priceQuarterly: 79,
    priceSixMonths: 149,
    priceYearly: 290,
    stripeProductId: 'prod_TdFGKNLOV8F3tf',
    stripePriceMonthly: 'price_1SfylWDQ6Tu8zQpYQOog1c7I',
    stripePriceQuarterly: 'price_1SfylWDQ6Tu8zQpYHHU8m1li',
    stripePriceSixMonths: 'price_1SfylXDQ6Tu8zQpYRUImgsaE',
    stripePriceYearly: 'price_1SfylYDQ6Tu8zQpYLWdoWbjA',
    features: [
      'Einfacher Buchungskalender',
      'Kundenverwaltung (bis 100 Kunden)',
      'Automatische Terminerinnerungen',
      'Basis-Umsatzübersicht',
      'E-Mail Support',
    ],
    maxChairs: null,
    maxBookings: 50,
    maxCustomers: 100,
    isPopular: false,
    trialDays: 14,
    sortOrder: 1,
    includedAiCreditsEur: 5,
  },
  {
    name: 'Professional',
    slug: 'stylist-professional',
    description: 'Für etablierte Stylisten mit wachsendem Kundenstamm',
    planType: 'STYLIST' as PlanType,
    priceMonthly: 49,
    priceQuarterly: 129,
    priceSixMonths: 249,
    priceYearly: 470,
    stripeProductId: 'prod_TdFG8zHIOWkZlt',
    stripePriceMonthly: 'price_1SfylkDQ6Tu8zQpYiew7OTp6',
    stripePriceQuarterly: 'price_1SfylkDQ6Tu8zQpYt4R6ELIz',
    stripePriceSixMonths: 'price_1SfyllDQ6Tu8zQpYY2RKieG5',
    stripePriceYearly: 'price_1SfylmDQ6Tu8zQpYGGEYJ3Ab',
    features: [
      'Alles aus Starter',
      'Detaillierte Auswertungen & Analytics',
      'Google Ad Manager Integration',
      'Meta Ad Manager Integration',
      'Leistungsfähige Marketing Tools',
      'Social Media Management',
      'Business Profil',
      'Unbegrenzte Kundenverwaltung',
      'Online-Zahlungen',
      'Homepage-Builder mit KI',
      'Prioritäts-Support',
    ],
    maxChairs: null,
    maxBookings: null,
    maxCustomers: null,
    isPopular: true,
    trialDays: 14,
    sortOrder: 2,
    includedAiCreditsEur: 15,
  },
  // SALON OWNER PLÄNE
  {
    name: 'Basic',
    slug: 'salon-basic',
    description: 'Ideal für kleine Salons mit 1-3 Stühlen',
    planType: 'SALON_OWNER' as PlanType,
    priceMonthly: 79,
    priceQuarterly: 209,
    priceSixMonths: 399,
    priceYearly: 790,
    stripeProductId: 'prod_TdFGYZwDunLCV2',
    stripePriceMonthly: 'price_1Sfym1DQ6Tu8zQpYyTOYdmgR',
    stripePriceQuarterly: 'price_1Sfym2DQ6Tu8zQpYmNV5HBTZ',
    stripePriceSixMonths: 'price_1Sfym3DQ6Tu8zQpYFKTV6wRW',
    stripePriceYearly: 'price_1Sfym4DQ6Tu8zQpYtutiiOAz',
    features: [
      'Bis zu 3 Stuhlmieter',
      'Zentrales Buchungssystem',
      'Digitale Mietverträge',
      'Automatische Mietabrechnung',
      'Basis-Reporting',
      'Marketing Tools Grundpaket',
      'E-Mail Support',
    ],
    maxChairs: 3,
    maxBookings: 200,
    maxCustomers: 500,
    isPopular: false,
    trialDays: 14,
    sortOrder: 1,
    includedAiCreditsEur: 10,
  },
  {
    name: 'Business',
    slug: 'salon-business',
    description: 'Für wachsende Salons mit Ambition',
    planType: 'SALON_OWNER' as PlanType,
    priceMonthly: 149,
    priceQuarterly: 399,
    priceSixMonths: 749,
    priceYearly: 1490,
    stripeProductId: 'prod_TdFGzLu6vTm6Ya',
    stripePriceMonthly: 'price_1Sfym5DQ6Tu8zQpYGwJgt2Hg',
    stripePriceQuarterly: 'price_1Sfym6DQ6Tu8zQpYC0sSJ8h7',
    stripePriceSixMonths: 'price_1Sfym7DQ6Tu8zQpYQG10bIwf',
    stripePriceYearly: 'price_1Sfym7DQ6Tu8zQpYz3YZSys5',
    features: [
      'Alles aus Basic',
      'Unbegrenzte Stuhlmieter',
      'Detaillierte Auswertungen & Analytics',
      'Umsatz-Dashboard',
      'Volle Belvo-Integration (ERP)',
      'Komplettes Co-Working Space Management',
      'Zahlungsabwicklung inkl. SEPA',
      'Einbindung in automatisierte Buchhaltung',
      'Google Ad Manager Integration',
      'Meta Ad Manager Integration',
      'Leistungsfähige Marketing Tools',
      'Homepage-Builder mit KI',
      'Multi-Standort Support',
      '24/7 Premium Support',
    ],
    maxChairs: null,
    maxBookings: null,
    maxCustomers: null,
    isPopular: true,
    trialDays: 14,
    sortOrder: 2,
    includedAiCreditsEur: 25,
  },
]

export async function POST() {
  try {
    const session = await auth()
    
    // Admin-Check (oder erlauben für localhost)
    const isLocalhost = process.env.NODE_ENV === 'development'
    if (!isLocalhost && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const results = []

    for (const plan of STRIPE_PLANS) {
      const result = await prisma.subscriptionPlan.upsert({
        where: { slug: plan.slug },
        update: {
          name: plan.name,
          description: plan.description,
          planType: plan.planType,
          priceMonthly: plan.priceMonthly,
          priceQuarterly: plan.priceQuarterly,
          priceSixMonths: plan.priceSixMonths,
          priceYearly: plan.priceYearly,
          stripeProductId: plan.stripeProductId,
          stripePriceMonthly: plan.stripePriceMonthly,
          stripePriceQuarterly: plan.stripePriceQuarterly,
          stripePriceSixMonths: plan.stripePriceSixMonths,
          stripePriceYearly: plan.stripePriceYearly,
          features: plan.features,
          maxChairs: plan.maxChairs,
          maxBookings: plan.maxBookings,
          maxCustomers: plan.maxCustomers,
          isPopular: plan.isPopular,
          trialDays: plan.trialDays,
          sortOrder: plan.sortOrder,
          includedAiCreditsEur: plan.includedAiCreditsEur,
          isActive: true,
        },
        create: {
          name: plan.name,
          slug: plan.slug,
          description: plan.description,
          planType: plan.planType,
          priceMonthly: plan.priceMonthly,
          priceQuarterly: plan.priceQuarterly,
          priceSixMonths: plan.priceSixMonths,
          priceYearly: plan.priceYearly,
          stripeProductId: plan.stripeProductId,
          stripePriceMonthly: plan.stripePriceMonthly,
          stripePriceQuarterly: plan.stripePriceQuarterly,
          stripePriceSixMonths: plan.stripePriceSixMonths,
          stripePriceYearly: plan.stripePriceYearly,
          features: plan.features,
          maxChairs: plan.maxChairs,
          maxBookings: plan.maxBookings,
          maxCustomers: plan.maxCustomers,
          isPopular: plan.isPopular,
          trialDays: plan.trialDays,
          sortOrder: plan.sortOrder,
          includedAiCreditsEur: plan.includedAiCreditsEur,
          isActive: true,
        },
      })

      results.push({
        slug: plan.slug,
        name: plan.name,
        planType: plan.planType,
        id: result.id,
      })
    }

    const totalCount = await prisma.subscriptionPlan.count({ where: { isActive: true } })

    return NextResponse.json({
      success: true,
      message: `${results.length} Pläne synchronisiert`,
      plans: results,
      totalActive: totalCount,
    })

  } catch (error) {
    console.error('Error seeding plans:', error)
    return NextResponse.json(
      { error: 'Fehler beim Synchronisieren der Pläne' },
      { status: 500 }
    )
  }
}



