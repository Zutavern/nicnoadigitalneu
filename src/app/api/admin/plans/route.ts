import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'
import { getStripe, isStripeConfigured } from '@/lib/stripe-server'
import { isDemoModeActive, getMockAdminPlans } from '@/lib/mock-data'

// GET /api/admin/plans - Alle Pläne abrufen
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    // Demo-Modus prüfen (Admins bekommen echte Daten)
    const isAdmin = session?.user?.role === 'ADMIN'
    if (!isAdmin && await isDemoModeActive()) {
      return NextResponse.json(getMockAdminPlans())
    }
    
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
      priceSixMonths,
      priceYearly,
      features = [],
      maxChairs,
      maxBookings,
      maxCustomers,
      isActive = true,
      isPopular = false,
      sortOrder = 0,
      trialDays = 14,
      includedAiCreditsEur = 0,
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
        priceSixMonths: priceSixMonths || priceMonthly * 6 * 0.85, // 15% Rabatt
        priceYearly: priceYearly || priceMonthly * 12 * 0.8, // 20% Rabatt
        features,
        maxChairs,
        maxBookings,
        maxCustomers,
        isActive,
        isPopular,
        sortOrder,
        trialDays,
        includedAiCreditsEur,
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
    const { id, syncToStripe, ...updateData } = body

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

    // Stripe-Synchronisierung wenn aktiviert
    if (syncToStripe && isStripeConfigured) {
      const stripe = getStripe()
      const slug = updateData.slug || existingPlan.slug
      const name = updateData.name || existingPlan.name
      const description = updateData.description || existingPlan.description

      // Produkt in Stripe erstellen oder aktualisieren
      if (existingPlan.stripeProductId) {
        // Produkt aktualisieren
        await stripe.products.update(existingPlan.stripeProductId, {
          name,
          description: description || undefined,
          metadata: {
            planType: updateData.planType || existingPlan.planType,
            slug
          }
        })
      } else {
        // Neues Produkt erstellen
        const product = await stripe.products.create({
          name,
          description: description || undefined,
          metadata: {
            planType: updateData.planType || existingPlan.planType,
            slug
          }
        })
        updateData.stripeProductId = product.id
      }

      const productId = updateData.stripeProductId || existingPlan.stripeProductId

      // Preise aktualisieren (Stripe erlaubt keine Preisänderungen, daher neue erstellen)
      const priceMonthly = updateData.priceMonthly ?? existingPlan.priceMonthly
      const priceQuarterly = updateData.priceQuarterly ?? existingPlan.priceQuarterly
      const priceSixMonths = updateData.priceSixMonths ?? existingPlan.priceSixMonths
      const priceYearly = updateData.priceYearly ?? existingPlan.priceYearly

      // Monatspreis
      if (priceMonthly > 0 && priceMonthly !== existingPlan.priceMonthly) {
        // Alten Preis archivieren
        if (existingPlan.stripePriceMonthly) {
          await stripe.prices.update(existingPlan.stripePriceMonthly, { active: false })
        }
        // Neuen Preis erstellen
        const newPrice = await stripe.prices.create({
          product: productId!,
          unit_amount: Math.round(priceMonthly * 100),
          currency: 'eur',
          recurring: { interval: 'month' },
          lookup_key: `${slug}_monthly`,
          metadata: { planSlug: slug, interval: 'monthly' }
        })
        updateData.stripePriceMonthly = newPrice.id
      }

      // Quartalspreis
      if (priceQuarterly > 0 && priceQuarterly !== existingPlan.priceQuarterly) {
        if (existingPlan.stripePriceQuarterly) {
          await stripe.prices.update(existingPlan.stripePriceQuarterly, { active: false })
        }
        const newPrice = await stripe.prices.create({
          product: productId!,
          unit_amount: Math.round(priceQuarterly * 100),
          currency: 'eur',
          recurring: { interval: 'month', interval_count: 3 },
          lookup_key: `${slug}_quarterly`,
          metadata: { planSlug: slug, interval: 'quarterly' }
        })
        updateData.stripePriceQuarterly = newPrice.id
      }

      // 6-Monatspreis
      if (priceSixMonths > 0 && priceSixMonths !== existingPlan.priceSixMonths) {
        if (existingPlan.stripePriceSixMonths) {
          await stripe.prices.update(existingPlan.stripePriceSixMonths, { active: false })
        }
        const newPrice = await stripe.prices.create({
          product: productId!,
          unit_amount: Math.round(priceSixMonths * 100),
          currency: 'eur',
          recurring: { interval: 'month', interval_count: 6 },
          lookup_key: `${slug}_six_months`,
          metadata: { planSlug: slug, interval: 'sixMonths' }
        })
        updateData.stripePriceSixMonths = newPrice.id
      }

      // Jahrespreis
      if (priceYearly > 0 && priceYearly !== existingPlan.priceYearly) {
        if (existingPlan.stripePriceYearly) {
          await stripe.prices.update(existingPlan.stripePriceYearly, { active: false })
        }
        const newPrice = await stripe.prices.create({
          product: productId!,
          unit_amount: Math.round(priceYearly * 100),
          currency: 'eur',
          recurring: { interval: 'year' },
          lookup_key: `${slug}_yearly`,
          metadata: { planSlug: slug, interval: 'yearly' }
        })
        updateData.stripePriceYearly = newPrice.id
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
