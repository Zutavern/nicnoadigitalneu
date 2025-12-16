import { SubscriptionPlan, BillingInterval } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * Verfügbare Pläne für einen bestimmten User-Typ laden
 */
export async function getAvailablePlans(planType: 'STYLIST' | 'SALON_OWNER') {
  return prisma.subscriptionPlan.findMany({
    where: { planType, isActive: true },
    orderBy: { sortOrder: 'asc' }
  })
}

/**
 * Preis für ein bestimmtes Billing-Interval berechnen
 */
export function getPriceForInterval(plan: SubscriptionPlan, interval: BillingInterval): number {
  switch (interval) {
    case 'MONTHLY':
      return Number(plan.priceMonthly)
    case 'QUARTERLY':
      return Number(plan.priceQuarterly)
    case 'SIX_MONTHS':
      return Number(plan.priceSixMonths)
    case 'YEARLY':
      return Number(plan.priceYearly)
    default:
      return Number(plan.priceMonthly)
  }
}

/**
 * Stripe Price ID für ein bestimmtes Interval ermitteln
 */
export function getStripePriceIdForInterval(plan: SubscriptionPlan, interval: BillingInterval): string | null {
  switch (interval) {
    case 'MONTHLY':
      return plan.stripePriceMonthly
    case 'QUARTERLY':
      return plan.stripePriceQuarterly
    case 'SIX_MONTHS':
      return plan.stripePriceSixMonths
    case 'YEARLY':
      return plan.stripePriceYearly
    default:
      return null
  }
}

/**
 * Anzahl der Monate für ein Interval
 */
export function getMonthsForInterval(interval: BillingInterval): number {
  switch (interval) {
    case 'MONTHLY':
      return 1
    case 'QUARTERLY':
      return 3
    case 'SIX_MONTHS':
      return 6
    case 'YEARLY':
      return 12
    default:
      return 1
  }
}

/**
 * Ersparnis gegenüber Monatspreis berechnen (in Prozent)
 */
export function calculateSavings(plan: SubscriptionPlan, interval: BillingInterval): number {
  const monthlyPrice = Number(plan.priceMonthly)
  const intervalPrice = getPriceForInterval(plan, interval)
  const months = getMonthsForInterval(interval)
  
  // Was würde es kosten, wenn man monatlich zahlt?
  const regularTotal = monthlyPrice * months
  
  // Tatsächlicher Preis für das Interval
  const actualTotal = intervalPrice
  
  if (regularTotal <= 0) return 0
  
  // Ersparnis in Prozent
  return Math.round(((regularTotal - actualTotal) / regularTotal) * 100)
}

/**
 * Monatlicher Äquivalentpreis berechnen
 */
export function getMonthlyEquivalent(plan: SubscriptionPlan, interval: BillingInterval): number {
  const price = getPriceForInterval(plan, interval)
  const months = getMonthsForInterval(interval)
  return price / months
}

/**
 * Interval-Label für die UI
 */
export function getIntervalLabel(interval: BillingInterval): string {
  switch (interval) {
    case 'MONTHLY':
      return '1 Monat'
    case 'QUARTERLY':
      return '3 Monate'
    case 'SIX_MONTHS':
      return '6 Monate'
    case 'YEARLY':
      return '12 Monate'
    default:
      return interval
  }
}

/**
 * Alle verfügbaren Billing-Intervalle
 */
export const BILLING_INTERVALS: {
  id: BillingInterval
  label: string
  months: number
  discount?: number
}[] = [
  { id: 'MONTHLY', label: '1 Monat', months: 1 },
  { id: 'QUARTERLY', label: '3 Monate', months: 3, discount: 10 },
  { id: 'SIX_MONTHS', label: '6 Monate', months: 6, discount: 15 },
  { id: 'YEARLY', label: '12 Monate', months: 12, discount: 25 },
]

/**
 * Type für Subscription Plan mit berechneten Preisen
 */
export interface PlanWithPricing extends SubscriptionPlan {
  currentPrice: number
  monthlyEquivalent: number
  savings: number
}

/**
 * Plan mit berechneten Preisen für ein Interval
 */
export function getPlanWithPricing(plan: SubscriptionPlan, interval: BillingInterval): PlanWithPricing {
  return {
    ...plan,
    currentPrice: getPriceForInterval(plan, interval),
    monthlyEquivalent: getMonthlyEquivalent(plan, interval),
    savings: calculateSavings(plan, interval)
  }
}

