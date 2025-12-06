import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, isStripeConfigured } from '@/lib/stripe-server'
import { isDemoModeActive, getMockAdminRevenue } from '@/lib/mock-data'

// GET /api/admin/revenue - Hole Revenue-Daten
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        ...getMockAdminRevenue(),
        source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Berechne Zeitraum
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Wenn Stripe konfiguriert ist, hole echte Daten
    if (isStripeConfigured && stripe) {
      try {
        return await getStripeRevenue(startDate, now, period)
      } catch (stripeError) {
        console.error('Stripe API error, falling back to local data:', stripeError)
      }
    }

    // Fallback: Lokale Payment-Daten
    return await getLocalRevenue(startDate, now, period)
  } catch (error) {
    console.error('Error fetching revenue:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Revenue-Daten' },
      { status: 500 }
    )
  }
}

async function getStripeRevenue(startDate: Date, endDate: Date, period: string) {
  // Hole Balance Transactions
  const balanceTransactions = await stripe!.balanceTransactions.list({
    created: {
      gte: Math.floor(startDate.getTime() / 1000),
      lte: Math.floor(endDate.getTime() / 1000)
    },
    limit: 100,
    type: 'charge' // Nur erfolgreiche Zahlungen
  })

  // Hole Charges für Details
  const charges = await stripe!.charges.list({
    created: {
      gte: Math.floor(startDate.getTime() / 1000),
      lte: Math.floor(endDate.getTime() / 1000)
    },
    limit: 100
  })

  // Berechne Metriken
  const totalRevenue = balanceTransactions.data.reduce((sum, t) => sum + t.amount, 0) / 100
  const totalFees = balanceTransactions.data.reduce((sum, t) => sum + (t.fee || 0), 0) / 100
  const netRevenue = totalRevenue - totalFees
  const transactionCount = balanceTransactions.data.length

  // Revenue nach Tag gruppieren
  const revenueByDay = new Map<string, number>()
  
  for (const t of balanceTransactions.data) {
    const date = new Date(t.created * 1000).toISOString().split('T')[0]
    revenueByDay.set(date, (revenueByDay.get(date) || 0) + t.amount / 100)
  }

  // In Array umwandeln und sortieren
  const dailyRevenue = Array.from(revenueByDay.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // MRR berechnen (aktive Subscriptions)
  const subscriptions = await stripe!.subscriptions.list({
    status: 'active',
    limit: 100
  })

  const mrr = subscriptions.data.reduce((sum, sub) => {
    const item = sub.items.data[0]
    if (!item?.price?.unit_amount) return sum
    const amount = item.price.unit_amount / 100
    if (item.price.recurring?.interval === 'year') return sum + amount / 12
    return sum + amount
  }, 0)

  // Letzte Transaktionen
  const recentTransactions = charges.data.slice(0, 10).map(charge => ({
    id: charge.id,
    amount: charge.amount / 100,
    currency: charge.currency.toUpperCase(),
    status: charge.status,
    customerEmail: charge.billing_details?.email || 'Unbekannt',
    description: charge.description || 'Zahlung',
    createdAt: new Date(charge.created * 1000)
  }))

  // Revenue nach Plan (aus Subscriptions)
  const revenueByPlan = new Map<string, number>()
  
  for (const sub of subscriptions.data) {
    const item = sub.items.data[0]
    if (!item?.price) continue
    
    const product = typeof item.price.product === 'object' 
      ? (item.price.product as { name?: string }).name || 'Unknown'
      : 'Unknown'
    
    const amount = (item.price.unit_amount || 0) / 100
    revenueByPlan.set(product, (revenueByPlan.get(product) || 0) + amount)
  }

  const planBreakdown = Array.from(revenueByPlan.entries())
    .map(([plan, amount]) => ({ plan, amount, percentage: 0 }))
  
  const totalPlanRevenue = planBreakdown.reduce((sum, p) => sum + p.amount, 0)
  planBreakdown.forEach(p => {
    p.percentage = totalPlanRevenue > 0 ? Math.round(p.amount / totalPlanRevenue * 100) : 0
  })

  return NextResponse.json({
    metrics: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      netRevenue: Math.round(netRevenue * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      transactionCount,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(mrr * 12 * 100) / 100
    },
    dailyRevenue,
    recentTransactions,
    planBreakdown,
    period,
    source: 'stripe'
  })
}

async function getLocalRevenue(startDate: Date, endDate: Date, period: string) {
  // Hole lokale Payment-Daten
  const payments = await prisma.payment.findMany({
    where: {
      status: 'PAID',
      paidAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { paidAt: 'desc' }
  })

  // Berechne Metriken
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const transactionCount = payments.length

  // Revenue nach Tag
  const revenueByDay = new Map<string, number>()
  
  for (const p of payments) {
    if (p.paidAt) {
      const date = p.paidAt.toISOString().split('T')[0]
      revenueByDay.set(date, (revenueByDay.get(date) || 0) + Number(p.amount))
    }
  }

  const dailyRevenue = Array.from(revenueByDay.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Letzte Transaktionen
  const recentPayments = await prisma.payment.findMany({
    where: { status: 'PAID' },
    orderBy: { paidAt: 'desc' },
    take: 10
  })

  // Hole Payer-Infos
  const payerIds = [...new Set(recentPayments.map(p => p.payerId))]
  const payers = await prisma.user.findMany({
    where: { id: { in: payerIds } },
    select: { id: true, email: true, name: true }
  })
  const payersMap = new Map(payers.map(p => [p.id, p]))

  const recentTransactions = recentPayments.map(p => ({
    id: p.id,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status.toLowerCase(),
    customerEmail: payersMap.get(p.payerId)?.email || 'Unbekannt',
    description: p.description || p.type,
    createdAt: p.paidAt || p.createdAt
  }))

  // Revenue nach Typ
  const revenueByType = new Map<string, number>()
  
  for (const p of payments) {
    const type = p.type
    revenueByType.set(type, (revenueByType.get(type) || 0) + Number(p.amount))
  }

  const planBreakdown = Array.from(revenueByType.entries())
    .map(([plan, amount]) => ({ 
      plan: formatPaymentType(plan), 
      amount, 
      percentage: 0 
    }))
  
  const totalTypeRevenue = planBreakdown.reduce((sum, p) => sum + p.amount, 0)
  planBreakdown.forEach(p => {
    p.percentage = totalTypeRevenue > 0 ? Math.round(p.amount / totalTypeRevenue * 100) : 0
  })

  // Berechne MRR aus Users mit aktiver Subscription
  const activeSubscribers = await prisma.user.count({
    where: { stripeSubscriptionStatus: 'active' }
  })
  
  // Durchschnittlicher Umsatz pro Subscriber (geschätzt)
  const avgRevenuePerUser = 49 // 49€ als Standard
  const mrr = activeSubscribers * avgRevenuePerUser

  return NextResponse.json({
    metrics: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      netRevenue: Math.round(totalRevenue * 0.97 * 100) / 100, // ~3% Gebühren geschätzt
      totalFees: Math.round(totalRevenue * 0.03 * 100) / 100,
      transactionCount,
      mrr,
      arr: mrr * 12
    },
    dailyRevenue,
    recentTransactions,
    planBreakdown,
    period,
    source: 'local'
  })
}

function formatPaymentType(type: string): string {
  const types: Record<string, string> = {
    'CHAIR_RENTAL': 'Stuhlmiete',
    'BOOKING': 'Buchungen',
    'SUBSCRIPTION': 'Abonnements',
    'DEPOSIT': 'Kautionen',
    'OTHER': 'Sonstiges'
  }
  return types[type] || type
}

