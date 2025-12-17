import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default-Konfiguration falls keine DB-Einstellungen existieren
const defaultConfig = {
  intervals: [
    { id: 'monthly', label: '1 Monat', months: 1, discount: 0, enabled: true },
    { id: 'quarterly', label: '3 Monate', months: 3, discount: 10, enabled: true },
    { id: 'sixMonths', label: '6 Monate', months: 6, discount: 15, enabled: true, badge: 'Beliebt' },
    { id: 'yearly', label: '12 Monate', months: 12, discount: 25, enabled: true, badge: 'Beste Ersparnis' },
  ],
  defaultInterval: 'sixMonths',
  trialDays: 14,
  trialEnabled: true,
  currency: 'EUR',
  currencySign: '€',
  couponsEnabled: true,
  showCouponOnPricing: false,
  moneyBackEnabled: true,
  moneyBackDays: 30,
  pricingPageDesign: 'compact', // compact, expanded, modern
  priceRoundingEnabled: true
}

/**
 * GET /api/billing-config
 * Öffentliche Route für die Billing-Konfiguration (für Preisseite)
 */
export async function GET() {
  try {
    // Versuche Einstellungen aus der DB zu laden
    const settings = await prisma.billingSetting.findUnique({
      where: { id: 'default' }
    })

    if (!settings) {
      return NextResponse.json(defaultConfig)
    }

    // Konfiguration aus DB-Einstellungen erstellen
    const intervals = [
      {
        id: 'monthly',
        label: '1 Monat',
        months: 1,
        discount: settings.monthlyDiscount,
        enabled: settings.monthlyEnabled
      },
      {
        id: 'quarterly',
        label: '3 Monate',
        months: 3,
        discount: settings.quarterlyDiscount,
        enabled: settings.quarterlyEnabled
      },
      {
        id: 'sixMonths',
        label: '6 Monate',
        months: 6,
        discount: settings.sixMonthsDiscount,
        enabled: settings.sixMonthsEnabled,
        badge: 'Beliebt'
      },
      {
        id: 'yearly',
        label: '12 Monate',
        months: 12,
        discount: settings.yearlyDiscount,
        enabled: settings.yearlyEnabled,
        badge: 'Beste Ersparnis'
      }
    ].filter(i => i.enabled) // Nur aktive Intervalle zurückgeben

    return NextResponse.json({
      intervals,
      defaultInterval: settings.defaultInterval,
      trialDays: settings.defaultTrialDays,
      trialEnabled: settings.trialEnabled,
      currency: settings.currency,
      currencySign: settings.currencySign,
      couponsEnabled: settings.couponsEnabled,
      showCouponOnPricing: settings.showCouponOnPricing,
      moneyBackEnabled: settings.moneyBackEnabled,
      moneyBackDays: settings.moneyBackDays,
      pricingPageDesign: settings.pricingPageDesign || 'compact',
      priceRoundingEnabled: settings.priceRoundingEnabled
    })

  } catch (error) {
    console.error('Error fetching billing config:', error)
    // Fallback auf Default-Config
    return NextResponse.json(defaultConfig)
  }
}

