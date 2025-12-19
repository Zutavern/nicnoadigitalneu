import Stripe from 'stripe'
import { SubscriptionPlan, CreditPackage, BillingInterval } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getStripe } from '../stripe-server'
import { getStripePriceIdForInterval } from './subscription-helpers'

/**
 * Zentrale Stripe Service Library
 * Handles alle Stripe-Operationen
 */
export const stripeService = {
  /**
   * Stripe Customer erstellen oder existierenden abrufen
   */
  async getOrCreateCustomer(
    userId: string, 
    email: string, 
    name?: string
  ): Promise<string> {
    const stripe = getStripe()
    
    // Prüfe ob User bereits eine Stripe Customer ID hat
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { stripeCustomerId: true }
    })
    
    if (user?.stripeCustomerId) {
      return user.stripeCustomerId
    }
    
    // Neuen Stripe Customer erstellen
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: { 
        userId,
        platform: 'nicnoa'
      }
    })
    
    // Customer ID in der DB speichern
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    })
    
    return customer.id
  },

  /**
   * Subscription Checkout Session erstellen
   */
  async createSubscriptionCheckout(params: {
    customerId: string
    planId: string
    interval: BillingInterval
    userId: string
    successUrl: string
    cancelUrl: string
  }): Promise<Stripe.Checkout.Session> {
    const stripe = getStripe()
    
    // Plan aus der DB laden
    const plan = await prisma.subscriptionPlan.findUnique({ 
      where: { id: params.planId } 
    })
    
    if (!plan) {
      throw new Error('Plan nicht gefunden')
    }
    
    // Stripe Price ID für das gewählte Interval ermitteln
    const priceId = getStripePriceIdForInterval(plan, params.interval)
    
    if (!priceId) {
      throw new Error(`Kein Stripe-Preis für das Interval "${params.interval}" konfiguriert. Bitte synchronisieren Sie den Plan mit Stripe.`)
    }
    
    // Checkout Session erstellen mit Stripe Tax
    return stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: 'subscription',
      // Link für schnellen 1-Klick-Checkout aktivieren
      payment_method_types: ['card', 'link'],
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      subscription_data: {
        trial_period_days: plan.trialDays || undefined,
        metadata: { 
          userId: params.userId, 
          planId: params.planId, 
          interval: params.interval 
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      // Speichere die Billing-Adresse automatisch auf dem Customer (erforderlich für automatic_tax)
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      // Stripe Tax für automatische MwSt-Berechnung
      automatic_tax: { enabled: true },
      // Steuer-ID Sammlung für B2B
      tax_id_collection: { enabled: true },
      locale: 'de',
      metadata: { 
        userId: params.userId, 
        planId: params.planId,
        type: 'subscription'
      }
    })
  },

  /**
   * Credit-Paket Checkout Session erstellen (Einmalkauf)
   */
  async createCreditCheckout(params: {
    customerId: string
    packageId: string
    userId: string
    successUrl: string
    cancelUrl: string
  }): Promise<Stripe.Checkout.Session> {
    const stripe = getStripe()
    
    // Paket aus der DB laden
    const pkg = await prisma.creditPackage.findUnique({ 
      where: { id: params.packageId } 
    })
    
    if (!pkg) {
      throw new Error('Credit-Paket nicht gefunden')
    }
    
    if (!pkg.stripePriceId) {
      throw new Error('Kein Stripe-Preis für dieses Credit-Paket konfiguriert. Bitte synchronisieren Sie das Paket mit Stripe.')
    }
    
    // Checkout Session im Payment-Modus erstellen
    return stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: 'payment',
      // Link für schnellen 1-Klick-Checkout aktivieren
      payment_method_types: ['card', 'link'],
      line_items: [{ 
        price: pkg.stripePriceId, 
        quantity: 1 
      }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      locale: 'de',
      metadata: { 
        userId: params.userId, 
        packageId: params.packageId,
        type: 'credit_purchase',
        credits: (pkg.credits + (pkg.bonusCredits || 0)).toString()
      }
    })
  },

  /**
   * Customer Portal Session erstellen
   */
  async createPortalSession(
    customerId: string, 
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    const stripe = getStripe()
    
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    })
  },

  /**
   * Subscription kündigen
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = getStripe()
    
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
  },

  /**
   * Subscription sofort kündigen
   */
  async cancelSubscriptionImmediately(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = getStripe()
    
    return stripe.subscriptions.cancel(subscriptionId)
  },

  /**
   * Subscription pausieren
   */
  async pauseSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = getStripe()
    
    return stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: 'void' // Keine Rechnungen während Pause
      }
    })
  },

  /**
   * Subscription wieder aktivieren (nach Pause)
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = getStripe()
    
    return stripe.subscriptions.update(subscriptionId, {
      pause_collection: '' as unknown as Stripe.SubscriptionUpdateParams.PauseCollection // Setzt auf null
    })
  },

  /**
   * Subscription Plan wechseln (Upgrade/Downgrade) mit Proration-Vorschau
   */
  async getProrationPreview(params: {
    subscriptionId: string
    newPriceId: string
  }): Promise<{
    immediate: number
    nextInvoice: number
    prorationDate: number
  }> {
    const stripe = getStripe()
    
    const subscription = await stripe.subscriptions.retrieve(params.subscriptionId)
    const subscriptionItemId = subscription.items.data[0]?.id
    
    if (!subscriptionItemId) {
      throw new Error('Kein Subscription Item gefunden')
    }
    
    // Proration Datum (jetzt)
    const prorationDate = Math.floor(Date.now() / 1000)
    
    // Vorschau der nächsten Rechnung mit neuem Preis
    const invoice = await stripe.invoices.createPreview({
      customer: subscription.customer as string,
      subscription: params.subscriptionId,
      subscription_items: [{
        id: subscriptionItemId,
        price: params.newPriceId
      }],
      subscription_proration_date: prorationDate,
      subscription_proration_behavior: 'create_prorations'
    })
    
    return {
      immediate: invoice.amount_due, // Sofort fällig (in Cents)
      nextInvoice: invoice.subtotal, // Nächste volle Rechnung
      prorationDate
    }
  },

  /**
   * Subscription Plan wechseln (Upgrade/Downgrade)
   */
  async updateSubscription(
    subscriptionId: string, 
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    const stripe = getStripe()
    
    // Aktuelle Subscription abrufen
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    // Subscription Item ID finden
    const subscriptionItemId = subscription.items.data[0]?.id
    
    if (!subscriptionItemId) {
      throw new Error('Kein Subscription Item gefunden')
    }
    
    // Subscription mit neuem Preis aktualisieren
    return stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: newPriceId
      }],
      proration_behavior: 'create_prorations'
    })
  },

  /**
   * Plan mit Stripe synchronisieren (Product + Prices erstellen)
   */
  async syncPlanToStripe(planId: string): Promise<SubscriptionPlan> {
    const stripe = getStripe()
    
    const plan = await prisma.subscriptionPlan.findUnique({ 
      where: { id: planId } 
    })
    
    if (!plan) {
      throw new Error('Plan nicht gefunden')
    }
    
    let productId = plan.stripeProductId
    
    // Product erstellen falls nicht vorhanden
    if (!productId) {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description || undefined,
        metadata: {
          planId: plan.id,
          planType: plan.planType
        }
      })
      productId = product.id
    }
    
    // Prices für alle Intervalle erstellen
    const updates: Partial<SubscriptionPlan> = {
      stripeProductId: productId
    }
    
    // Monthly Price
    if (!plan.stripePriceMonthly && Number(plan.priceMonthly) > 0) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(Number(plan.priceMonthly) * 100),
        currency: 'eur',
        recurring: { interval: 'month', interval_count: 1 },
        metadata: { planId: plan.id, interval: 'MONTHLY' }
      })
      updates.stripePriceMonthly = price.id
    }
    
    // Quarterly Price (3 Monate)
    if (!plan.stripePriceQuarterly && Number(plan.priceQuarterly) > 0) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(Number(plan.priceQuarterly) * 100),
        currency: 'eur',
        recurring: { interval: 'month', interval_count: 3 },
        metadata: { planId: plan.id, interval: 'QUARTERLY' }
      })
      updates.stripePriceQuarterly = price.id
    }
    
    // Six Months Price (6 Monate)
    if (!plan.stripePriceSixMonths && Number(plan.priceSixMonths) > 0) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(Number(plan.priceSixMonths) * 100),
        currency: 'eur',
        recurring: { interval: 'month', interval_count: 6 },
        metadata: { planId: plan.id, interval: 'SIX_MONTHS' }
      })
      updates.stripePriceSixMonths = price.id
    }
    
    // Yearly Price
    if (!plan.stripePriceYearly && Number(plan.priceYearly) > 0) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(Number(plan.priceYearly) * 100),
        currency: 'eur',
        recurring: { interval: 'year', interval_count: 1 },
        metadata: { planId: plan.id, interval: 'YEARLY' }
      })
      updates.stripePriceYearly = price.id
    }
    
    // DB aktualisieren
    return prisma.subscriptionPlan.update({
      where: { id: planId },
      data: updates
    })
  },

  /**
   * Credit-Paket mit Stripe synchronisieren
   */
  async syncCreditPackageToStripe(packageId: string): Promise<CreditPackage> {
    const stripe = getStripe()
    
    const pkg = await prisma.creditPackage.findUnique({ 
      where: { id: packageId } 
    })
    
    if (!pkg) {
      throw new Error('Credit-Paket nicht gefunden')
    }
    
    // Prüfen ob bereits synchronisiert
    if (pkg.stripePriceId) {
      return pkg
    }
    
    // Product erstellen
    const product = await stripe.products.create({
      name: pkg.name,
      description: pkg.description || `${pkg.credits} Credits${pkg.bonusCredits ? ` + ${pkg.bonusCredits} Bonus` : ''}`,
      metadata: {
        packageId: pkg.id,
        credits: pkg.credits.toString(),
        bonusCredits: (pkg.bonusCredits || 0).toString()
      }
    })
    
    // One-time Price erstellen
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(Number(pkg.priceEur) * 100),
      currency: 'eur',
      metadata: { packageId: pkg.id }
    })
    
    // DB aktualisieren
    return prisma.creditPackage.update({
      where: { id: packageId },
      data: { stripePriceId: price.id }
    })
  },

  /**
   * Webhook Signatur verifizieren
   */
  constructWebhookEvent(
    body: string | Buffer, 
    signature: string, 
    secret: string
  ): Stripe.Event {
    const stripe = getStripe()
    return stripe.webhooks.constructEvent(body, signature, secret)
  }
}

export type StripeService = typeof stripeService

