import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'

// Fallback-Pläne wenn DB leer ist (für Anzeige ohne Stripe)
const fallbackPlans = {
  STYLIST: [
    {
      id: 'fallback-stylist-starter',
      name: 'Starter',
      slug: 'stylist-starter',
      description: 'Perfekt für den Einstieg in die Selbstständigkeit',
      planType: 'STYLIST' as PlanType,
      priceMonthly: 29,
      priceQuarterly: 79,
      priceSixMonths: 149,
      priceYearly: 290,
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
    },
    {
      id: 'fallback-stylist-professional',
      name: 'Professional',
      slug: 'stylist-professional',
      description: 'Für etablierte Stylisten mit wachsendem Kundenstamm',
      planType: 'STYLIST' as PlanType,
      priceMonthly: 49,
      priceQuarterly: 129,
      priceSixMonths: 249,
      priceYearly: 470,
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
        'Prioritäts-Support',
      ],
      maxChairs: null,
      maxBookings: null,
      maxCustomers: null,
      isPopular: true,
      trialDays: 14,
      sortOrder: 2,
    },
  ],
  SALON_OWNER: [
    {
      id: 'fallback-salon-basic',
      name: 'Basic',
      slug: 'salon-basic',
      description: 'Ideal für kleine Salons mit 1-3 Stühlen',
      planType: 'SALON_OWNER' as PlanType,
      priceMonthly: 79,
      priceQuarterly: 209,
      priceSixMonths: 399,
      priceYearly: 790,
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
    },
    {
      id: 'fallback-salon-business',
      name: 'Business',
      slug: 'salon-business',
      description: 'Für wachsende Salons mit Ambition',
      planType: 'SALON_OWNER' as PlanType,
      priceMonthly: 149,
      priceQuarterly: 399,
      priceSixMonths: 749,
      priceYearly: 1490,
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
        'Multi-Standort Support',
        '24/7 Premium Support',
      ],
      maxChairs: null,
      maxBookings: null,
      maxCustomers: null,
      isPopular: true,
      trialDays: 14,
      sortOrder: 2,
    },
  ],
}

/**
 * GET /api/plans
 * Liefert verfügbare Subscription-Pläne für die Paywall
 * Funktioniert auch ohne Stripe-Verbindung (zeigt Fallback-Pläne)
 * 
 * Query Parameters:
 * - type: 'STYLIST' | 'SALON_OWNER' (optional, default: 'STYLIST')
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const typeParam = searchParams.get('type')
    
    // Validierung des Plan-Typs
    const validTypes: PlanType[] = ['STYLIST', 'SALON_OWNER']
    const planType: PlanType = validTypes.includes(typeParam as PlanType) 
      ? (typeParam as PlanType) 
      : 'STYLIST'

    // Pläne aus der DB laden
    const plans = await prisma.subscriptionPlan.findMany({
      where: { 
        planType, 
        isActive: true 
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        planType: true,
        // Preise für alle 4 Intervalle
        priceMonthly: true,
        priceQuarterly: true,
        priceSixMonths: true,
        priceYearly: true,
        // Features
        features: true,
        // Limits
        maxChairs: true,
        maxBookings: true,
        maxCustomers: true,
        // Status
        isPopular: true,
        trialDays: true,
        sortOrder: true,
        // KEINE Stripe IDs zurückgeben (Sicherheit)
      }
    })

    // Wenn keine Pläne in der DB, Fallback verwenden
    if (plans.length === 0) {
      return NextResponse.json({ 
        plans: fallbackPlans[planType],
        planType,
        isFallback: true // Flag für Frontend
      })
    }

    // Preise in Zahlen konvertieren
    const formattedPlans = plans.map(plan => ({
      ...plan,
      priceMonthly: Number(plan.priceMonthly),
      priceQuarterly: Number(plan.priceQuarterly),
      priceSixMonths: Number(plan.priceSixMonths),
      priceYearly: Number(plan.priceYearly)
    }))

    return NextResponse.json({ 
      plans: formattedPlans,
      planType,
      isFallback: false
    })

  } catch (error) {
    console.error('Error fetching plans:', error)
    // Bei Fehler auch Fallback zurückgeben
    const typeParam = new URL(req.url).searchParams.get('type')
    const planType: PlanType = typeParam === 'SALON_OWNER' ? 'SALON_OWNER' : 'STYLIST'
    
    return NextResponse.json({ 
      plans: fallbackPlans[planType],
      planType,
      isFallback: true,
      error: 'DB nicht erreichbar'
    })
  }
}

