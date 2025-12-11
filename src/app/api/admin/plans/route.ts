import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'
import { getStripe, isStripeConfigured } from '@/lib/stripe-server'
import { isDemoModeActive, getMockAdminPlans } from '@/lib/mock-data'

// GET /api/admin/plans - Alle Pläne abrufen
export async function GET(request: Request) {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive({ ignoreForAdmin: true })) {
      return NextResponse.json(getMockAdminPlans())
    }

    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const planType = searchParams.get('planType') as PlanType | null
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: Record<string, unknown> = {}
    
    if (planType) {
      where.planType = planType
    }
    
    if (!includeInactive) {
      where.isActive = true
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where,
      orderBy: [
        { planType: 'asc' },
        { sortOrder: 'asc' },
        { priceMonthly: 'asc' }
      ]
    })

    // Gruppiere nach PlanType für einfachere Anzeige
    const groupedPlans = {
      SALON_OWNER: plans.filter(p => p.planType === 'SALON_OWNER'),
      STYLIST: plans.filter(p => p.planType === 'STYLIST')
    }

    // Statistiken
    const stats = {
      total: plans.length,
      active: plans.filter(p => p.isActive).length,
      salonOwnerPlans: groupedPlans.SALON_OWNER.length,
      stylistPlans: groupedPlans.STYLIST.length,
      withStripe: plans.filter(p => p.stripeProductId).length
    }

    return NextResponse.json({
      plans,
      groupedPlans,
      stats
    })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Pläne' },
      { status: 500 }
    )
  }
}

// POST /api/admin/plans - Neuen Plan erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      planType,
      priceMonthly,
      priceQuarterly,
      priceYearly,
      features = [],
      maxChairs,
      maxBookings,
      maxCustomers,
      isActive = true,
      isPopular = false,
      sortOrder = 0,
      trialDays = 14,
      syncToStripe = false
    } = body

    // Validierung
    if (!name || !slug || !planType || priceMonthly === undefined) {
      return NextResponse.json(
        { error: 'Name, Slug, Plan-Typ und monatlicher Preis sind erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Slug bereits existiert
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { slug }
    })

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Ein Plan mit diesem Slug existiert bereits' },
        { status: 400 }
      )
    }

    // Stripe Integration (optional)
    let stripeProductId: string | undefined
    let stripePriceMonthly: string | undefined
    let stripePriceQuarterly: string | undefined
    let stripePriceYearly: string | undefined

    if (syncToStripe && isStripeConfigured) {
      const stripe = getStripe()
      
      // Produkt erstellen
      const product = await stripe.products.create({
        name,
        description: description || undefined,
        metadata: {
          planType,
          slug
        }
      })
      stripeProductId = product.id

      // Preise erstellen
      if (priceMonthly > 0) {
        const monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(priceMonthly * 100),
          currency: 'eur',
          recurring: { interval: 'month' },
          lookup_key: `${slug}_monthly`,
          metadata: { planSlug: slug, interval: 'monthly' }
        })
        stripePriceMonthly = monthlyPrice.id
      }

      if (priceQuarterly > 0) {
        const quarterlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(priceQuarterly * 100),
          currency: 'eur',
          recurring: { interval: 'month', interval_count: 3 },
          lookup_key: `${slug}_quarterly`,
          metadata: { planSlug: slug, interval: 'quarterly' }
        })
        stripePriceQuarterly = quarterlyPrice.id
      }

      if (priceYearly > 0) {
        const yearlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(priceYearly * 100),
          currency: 'eur',
          recurring: { interval: 'year' },
          lookup_key: `${slug}_yearly`,
          metadata: { planSlug: slug, interval: 'yearly' }
        })
        stripePriceYearly = yearlyPrice.id
      }
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        slug,
        description,
        planType,
        priceMonthly,
        priceQuarterly: priceQuarterly || priceMonthly * 3 * 0.9, // 10% Rabatt
        priceYearly: priceYearly || priceMonthly * 12 * 0.8, // 20% Rabatt
        features,
        maxChairs,
        maxBookings,
        maxCustomers,
        isActive,
        isPopular,
        sortOrder,
        trialDays,
        stripeProductId,
        stripePriceMonthly,
        stripePriceQuarterly,
        stripePriceYearly
      }
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Plans' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/plans - Plan aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Plan-ID erforderlich' }, { status: 400 })
    }

    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan nicht gefunden' }, { status: 404 })
    }

    // Wenn Slug geändert wird, prüfe auf Duplikate
    if (updateData.slug && updateData.slug !== existingPlan.slug) {
      const duplicateSlug = await prisma.subscriptionPlan.findUnique({
        where: { slug: updateData.slug }
      })
      if (duplicateSlug) {
        return NextResponse.json(
          { error: 'Ein Plan mit diesem Slug existiert bereits' },
          { status: 400 }
        )
      }
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Plans' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/plans - Plan deaktivieren (Soft Delete)
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Plan-ID erforderlich' }, { status: 400 })
    }

    // Soft Delete - nur deaktivieren
    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false }
    })

    // Optional: In Stripe archivieren
    if (plan.stripeProductId && isStripeConfigured) {
      const stripe = getStripe()
      await stripe.products.update(plan.stripeProductId, {
        active: false
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Plan wurde deaktiviert',
      plan
    })
  } catch (error) {
    console.error('Error deactivating plan:', error)
    return NextResponse.json(
      { error: 'Fehler beim Deaktivieren des Plans' },
      { status: 500 }
    )
  }
}
