import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' })
  : null

// GET: Fetch revenue analytics from Stripe
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    if (!stripe) {
      return NextResponse.json({
        error: 'Stripe ist nicht konfiguriert',
        configured: false,
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const dateFrom = searchParams.get('dateFrom') || '-30d'

    // Parse date range
    const now = Math.floor(Date.now() / 1000)
    let startDate = now - 30 * 24 * 60 * 60 // Default 30 days
    
    if (dateFrom === '-1d') startDate = now - 24 * 60 * 60
    else if (dateFrom === '-7d') startDate = now - 7 * 24 * 60 * 60
    else if (dateFrom === '-30d') startDate = now - 30 * 24 * 60 * 60
    else if (dateFrom === '-90d') startDate = now - 90 * 24 * 60 * 60

    switch (type) {
      case 'overview': {
        const [subscriptions, charges, balance] = await Promise.all([
          stripe.subscriptions.list({ limit: 100, status: 'all' }),
          stripe.charges.list({ limit: 100, created: { gte: startDate } }),
          stripe.balance.retrieve(),
        ])

        const activeSubscriptions = subscriptions.data.filter(s => s.status === 'active')
        const trialSubscriptions = subscriptions.data.filter(s => s.status === 'trialing')
        const canceledSubscriptions = subscriptions.data.filter(s => s.status === 'canceled')

        // Calculate MRR
        const mrr = activeSubscriptions.reduce((sum, sub) => {
          const amount = sub.items.data[0]?.price?.unit_amount || 0
          const interval = sub.items.data[0]?.price?.recurring?.interval
          if (interval === 'year') return sum + (amount / 12)
          return sum + amount
        }, 0) / 100

        // Calculate total revenue in period
        const totalRevenue = charges.data
          .filter(c => c.status === 'succeeded')
          .reduce((sum, c) => sum + c.amount, 0) / 100

        // Calculate churn rate
        const churnRate = subscriptions.data.length > 0
          ? (canceledSubscriptions.length / subscriptions.data.length) * 100
          : 0

        // Average revenue per user
        const avgRevenuePerUser = activeSubscriptions.length > 0
          ? totalRevenue / activeSubscriptions.length
          : 0

        return NextResponse.json({
          configured: true,
          data: {
            totalRevenue,
            mrr,
            arr: mrr * 12,
            activeSubscriptions: activeSubscriptions.length,
            trialUsers: trialSubscriptions.length,
            churnRate: Math.round(churnRate * 10) / 10,
            avgRevenuePerUser: Math.round(avgRevenuePerUser * 100) / 100,
            lifetimeValue: avgRevenuePerUser * 12, // Simplified LTV
            balance: (balance.available[0]?.amount || 0) / 100,
          },
        })
      }

      case 'trends': {
        const charges = await stripe.charges.list({
          limit: 100,
          created: { gte: startDate },
        })

        // Group by day
        const dailyRevenue = new Map<string, number>()
        const dailySubscriptions = new Map<string, number>()

        for (const charge of charges.data) {
          if (charge.status !== 'succeeded') continue
          const date = new Date(charge.created * 1000).toISOString().split('T')[0]
          dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + charge.amount / 100)
        }

        // Fill in missing days
        const days = Math.ceil((now - startDate) / (24 * 60 * 60))
        const trends = []
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now * 1000 - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          trends.push({
            date,
            revenue: dailyRevenue.get(date) || 0,
            subscriptions: dailySubscriptions.get(date) || 0,
          })
        }

        return NextResponse.json({
          configured: true,
          data: trends,
        })
      }

      case 'by-plan': {
        const subscriptions = await stripe.subscriptions.list({
          limit: 100,
          status: 'active',
          expand: ['data.items.data.price.product'],
        })

        const planRevenue = new Map<string, { revenue: number; count: number }>()
        let totalRevenue = 0

        for (const sub of subscriptions.data) {
          const price = sub.items.data[0]?.price
          const product = price?.product as Stripe.Product | undefined
          const planName = product?.name || 'Unknown Plan'
          const amount = (price?.unit_amount || 0) / 100

          const existing = planRevenue.get(planName) || { revenue: 0, count: 0 }
          planRevenue.set(planName, {
            revenue: existing.revenue + amount,
            count: existing.count + 1,
          })
          totalRevenue += amount
        }

        const data = Array.from(planRevenue.entries()).map(([plan, { revenue, count }]) => ({
          plan,
          revenue,
          count,
          percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
        })).sort((a, b) => b.revenue - a.revenue)

        return NextResponse.json({
          configured: true,
          data,
        })
      }

      case 'by-channel': {
        // This would need PostHog integration to get UTM data
        // For now, return sample data structure
        const subscriptions = await stripe.subscriptions.list({
          limit: 100,
          status: 'active',
        })

        // In a real implementation, you'd join with PostHog data
        // to get the UTM source for each customer
        const data = [
          { channel: 'Direct', revenue: 0, conversions: Math.floor(subscriptions.data.length * 0.4), percentage: 40 },
          { channel: 'Google', revenue: 0, conversions: Math.floor(subscriptions.data.length * 0.25), percentage: 25 },
          { channel: 'Social', revenue: 0, conversions: Math.floor(subscriptions.data.length * 0.2), percentage: 20 },
          { channel: 'Referral', revenue: 0, conversions: Math.floor(subscriptions.data.length * 0.15), percentage: 15 },
        ]

        return NextResponse.json({
          configured: true,
          data,
        })
      }

      case 'transactions': {
        const charges = await stripe.charges.list({
          limit: 50,
          created: { gte: startDate },
          expand: ['data.customer'],
        })

        const data = charges.data.map(charge => {
          const customer = charge.customer as Stripe.Customer | null
          return {
            id: charge.id,
            amount: charge.amount / 100,
            currency: charge.currency.toUpperCase(),
            status: charge.status,
            customer: customer?.name || customer?.email || 'Unknown',
            email: customer?.email || undefined,
            created: new Date(charge.created * 1000).toISOString(),
            description: charge.description || undefined,
          }
        })

        return NextResponse.json({
          configured: true,
          data,
        })
      }

      case 'conversion-funnel': {
        // This would need PostHog + Stripe integration
        // Return structure for now
        const subscriptions = await stripe.subscriptions.list({ limit: 100 })
        const total = subscriptions.data.length
        const active = subscriptions.data.filter(s => s.status === 'active').length
        const trialing = subscriptions.data.filter(s => s.status === 'trialing').length

        // Estimated funnel (would need real visitor data from PostHog)
        const visitors = total * 10 // Rough estimate
        const signups = total * 2
        
        return NextResponse.json({
          configured: true,
          data: [
            { step: 'Website-Besucher', count: visitors, percentage: 100 },
            { step: 'Registrierung', count: signups, percentage: Math.round((signups / visitors) * 100) },
            { step: 'Trial gestartet', count: trialing + active, percentage: Math.round(((trialing + active) / visitors) * 100) },
            { step: 'Paid Conversion', count: active, percentage: Math.round((active / visitors) * 100) },
          ],
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Revenue API error:', error)
    return NextResponse.json({
      error: 'Fehler beim Abrufen der Revenue-Daten',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
