import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, isStripeConfigured } from '@/lib/stripe-server'
import { isDemoModeActive, getMockAdminSubscriptions } from '@/lib/mock-data'
import type Stripe from 'stripe'

interface SubscriptionWithUser {
  id: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  plan: {
    id: string
    name: string
    amount: number
    interval: string
  } | null
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
  } | null
  stripeSubscriptionId: string | null
}

// GET /api/admin/subscriptions - Hole alle Subscriptions
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
        ...getMockAdminSubscriptions(),
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    // Wenn Stripe nicht konfiguriert ist, nutze lokale Daten
    if (!isStripeConfigured || !stripe) {
      return await getLocalSubscriptions(page, limit, status)
    }

    // Hole Subscriptions von Stripe
    try {
      const stripeParams: Stripe.SubscriptionListParams = {
        limit: 100, // Stripe max
        expand: ['data.plan.product', 'data.customer']
      }
      
      if (status && status !== 'all') {
        stripeParams.status = status as Stripe.SubscriptionListParams['status']
      }

      const stripeSubscriptions = await stripe.subscriptions.list(stripeParams)

      // Verknüpfe mit lokalen User-Daten
      const subscriptions: SubscriptionWithUser[] = []

      for (const sub of stripeSubscriptions.data) {
        const customerId = typeof sub.customer === 'string' 
          ? sub.customer 
          : sub.customer?.id

        // Finde User mit dieser Stripe Customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        })

        const planItem = sub.items.data[0]
        const product = planItem?.price?.product

        subscriptions.push({
          id: sub.id,
          status: sub.status,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          plan: planItem ? {
            id: planItem.price.id,
            name: typeof product === 'object' && product !== null && 'name' in product 
              ? (product as Stripe.Product).name 
              : 'Unknown Plan',
            amount: planItem.price.unit_amount || 0,
            interval: planItem.price.recurring?.interval || 'month'
          } : null,
          user,
          stripeSubscriptionId: sub.id
        })
      }

      // Berechne Statistiken
      const stats = calculateStats(subscriptions)

      // Pagination
      const startIndex = (page - 1) * limit
      const paginatedSubscriptions = subscriptions.slice(startIndex, startIndex + limit)

      return NextResponse.json({
        subscriptions: paginatedSubscriptions,
        pagination: {
          page,
          limit,
          total: subscriptions.length,
          totalPages: Math.ceil(subscriptions.length / limit)
        },
        stats,
        source: 'stripe'
      })
    } catch (stripeError) {
      console.error('Stripe API error, falling back to local data:', stripeError)
      return await getLocalSubscriptions(page, limit, status)
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Subscriptions' },
      { status: 500 }
    )
  }
}

// Fallback: Lokale Subscription-Daten aus der Datenbank
async function getLocalSubscriptions(page: number, limit: number, status: string | null) {
  const where: Record<string, unknown> = {
    stripeSubscriptionId: { not: null }
  }
  
  if (status && status !== 'all') {
    where.stripeSubscriptionStatus = status
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionStatus: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ])

  const subscriptions: SubscriptionWithUser[] = users.map(user => ({
    id: user.stripeSubscriptionId!,
    status: user.stripeSubscriptionStatus || 'unknown',
    currentPeriodStart: new Date(user.createdAt),
    currentPeriodEnd: user.stripeCurrentPeriodEnd || new Date(),
    cancelAtPeriodEnd: false,
    plan: {
      id: user.stripePriceId || 'unknown',
      name: getPlanNameFromPriceId(user.stripePriceId),
      amount: getPlanAmountFromPriceId(user.stripePriceId),
      interval: 'month'
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role
    },
    stripeSubscriptionId: user.stripeSubscriptionId
  }))

  // Berechne Statistiken aus allen Usern mit Subscription
  const allUsersWithSub = await prisma.user.findMany({
    where: { stripeSubscriptionId: { not: null } },
    select: {
      stripeSubscriptionStatus: true,
      stripePriceId: true
    }
  })

  const stats = {
    total: allUsersWithSub.length,
    active: allUsersWithSub.filter(u => u.stripeSubscriptionStatus === 'active').length,
    trialing: allUsersWithSub.filter(u => u.stripeSubscriptionStatus === 'trialing').length,
    pastDue: allUsersWithSub.filter(u => u.stripeSubscriptionStatus === 'past_due').length,
    canceled: allUsersWithSub.filter(u => u.stripeSubscriptionStatus === 'canceled').length,
    mrr: calculateMRRFromUsers(allUsersWithSub),
    arr: calculateMRRFromUsers(allUsersWithSub) * 12
  }

  return NextResponse.json({
    subscriptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    stats,
    source: 'local'
  })
}

// Helper Funktionen
function calculateStats(subscriptions: SubscriptionWithUser[]) {
  const active = subscriptions.filter(s => s.status === 'active').length
  const trialing = subscriptions.filter(s => s.status === 'trialing').length
  const pastDue = subscriptions.filter(s => s.status === 'past_due').length
  const canceled = subscriptions.filter(s => s.status === 'canceled').length

  // MRR Berechnung
  const mrr = subscriptions
    .filter(s => s.status === 'active' && s.plan)
    .reduce((sum, s) => {
      const amount = s.plan!.amount / 100 // Cents zu EUR
      if (s.plan!.interval === 'year') return sum + amount / 12
      return sum + amount
    }, 0)

  return {
    total: subscriptions.length,
    active,
    trialing,
    pastDue,
    canceled,
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(mrr * 12 * 100) / 100
  }
}

function getPlanNameFromPriceId(priceId: string | null): string {
  if (!priceId) return 'Unknown'
  if (priceId.includes('starter') || priceId.includes('basic')) return 'Starter'
  if (priceId.includes('pro')) return 'Professional'
  if (priceId.includes('enterprise')) return 'Enterprise'
  return 'Standard'
}

function getPlanAmountFromPriceId(priceId: string | null): number {
  if (!priceId) return 0
  if (priceId.includes('starter') || priceId.includes('basic')) return 2900 // 29€
  if (priceId.includes('pro')) return 7900 // 79€
  if (priceId.includes('enterprise')) return 19900 // 199€
  return 4900 // 49€ default
}

function calculateMRRFromUsers(users: { stripePriceId: string | null, stripeSubscriptionStatus: string | null }[]): number {
  return users
    .filter(u => u.stripeSubscriptionStatus === 'active')
    .reduce((sum, u) => sum + getPlanAmountFromPriceId(u.stripePriceId) / 100, 0)
}

