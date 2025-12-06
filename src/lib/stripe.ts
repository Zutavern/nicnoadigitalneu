// Stripe Pricing Plans - Client-safe
export const PRICING_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    description: 'Für den Einstieg',
    price: 0,
    priceId: null,
    features: [
      'Bis zu 5 Termine pro Monat',
      '1 Stuhl',
      'Basis-Kalender',
      'E-Mail-Support',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    description: 'Für wachsende Salons',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    features: [
      'Unbegrenzte Termine',
      'Bis zu 5 Stühle',
      'Erweiterte Analytics',
      'Kundenmanagement',
      'SMS-Erinnerungen',
      'Prioritäts-Support',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Für große Salon-Spaces',
    price: 99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    features: [
      'Alles aus Pro',
      'Unbegrenzte Stühle',
      'Multi-Location Support',
      'API-Zugang',
      'White-Label Option',
      'Dedizierter Account Manager',
      '24/7 Premium Support',
    ],
  },
} as const

export type PlanId = keyof typeof PRICING_PLANS

// Subscription Status Types
export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid'

// Helper to format currency
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

// Helper to get plan by price ID
export function getPlanByPriceId(priceId: string): typeof PRICING_PLANS[PlanId] | null {
  for (const plan of Object.values(PRICING_PLANS)) {
    if (plan.priceId === priceId) {
      return plan
    }
  }
  return null
}
