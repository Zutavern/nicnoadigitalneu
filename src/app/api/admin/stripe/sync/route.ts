import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isStripeConfigured } from '@/lib/stripe-server'
import { stripeService } from '@/lib/stripe/stripe-service'

/**
 * GET /api/admin/stripe/sync
 * Zeigt den Sync-Status aller Pläne und Credit-Pakete
 */
export async function GET() {
  try {
    const session = await auth()

    // Nur für Admins
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Alle Pläne laden
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    // Alle Credit-Pakete laden
    const packages = await prisma.creditPackage.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    // Status aufbereiten
    const plansStatus = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      planType: plan.planType,
      isActive: plan.isActive,
      hasStripeProduct: !!plan.stripeProductId,
      stripeProductId: plan.stripeProductId,
      prices: {
        monthly: {
          price: Number(plan.priceMonthly),
          hasStripePrice: !!plan.stripePriceMonthly,
          stripePriceId: plan.stripePriceMonthly
        },
        quarterly: {
          price: Number(plan.priceQuarterly),
          hasStripePrice: !!plan.stripePriceQuarterly,
          stripePriceId: plan.stripePriceQuarterly
        },
        sixMonths: {
          price: Number(plan.priceSixMonths),
          hasStripePrice: !!plan.stripePriceSixMonths,
          stripePriceId: plan.stripePriceSixMonths
        },
        yearly: {
          price: Number(plan.priceYearly),
          hasStripePrice: !!plan.stripePriceYearly,
          stripePriceId: plan.stripePriceYearly
        }
      },
      needsSync: !plan.stripeProductId || 
                 (Number(plan.priceMonthly) > 0 && !plan.stripePriceMonthly) ||
                 (Number(plan.priceQuarterly) > 0 && !plan.stripePriceQuarterly) ||
                 (Number(plan.priceSixMonths) > 0 && !plan.stripePriceSixMonths) ||
                 (Number(plan.priceYearly) > 0 && !plan.stripePriceYearly)
    }))

    const packagesStatus = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      credits: pkg.credits,
      bonusCredits: pkg.bonusCredits,
      price: Number(pkg.priceEur),
      isActive: pkg.isActive,
      hasStripePrice: !!pkg.stripePriceId,
      stripePriceId: pkg.stripePriceId,
      needsSync: !pkg.stripePriceId && Number(pkg.priceEur) > 0
    }))

    // Zusammenfassung
    const summary = {
      stripeConfigured: isStripeConfigured,
      plans: {
        total: plans.length,
        synced: plansStatus.filter(p => !p.needsSync).length,
        needsSync: plansStatus.filter(p => p.needsSync).length
      },
      packages: {
        total: packages.length,
        synced: packagesStatus.filter(p => !p.needsSync).length,
        needsSync: packagesStatus.filter(p => p.needsSync).length
      }
    }

    return NextResponse.json({
      summary,
      plans: plansStatus,
      packages: packagesStatus
    })

  } catch (error) {
    console.error('Error fetching sync status:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Sync-Status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/stripe/sync
 * Synchronisiert einen Plan oder ein Credit-Paket mit Stripe
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    // Nur für Admins
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    if (!isStripeConfigured) {
      return NextResponse.json(
        { error: 'Stripe ist nicht konfiguriert' },
        { status: 503 }
      )
    }

    const { planId, packageId, syncAll } = await req.json()

    // Alle synchronisieren
    if (syncAll) {
      const results = {
        plans: [] as { id: string; name: string; success: boolean; error?: string }[],
        packages: [] as { id: string; name: string; success: boolean; error?: string }[]
      }

      // Alle Pläne synchronisieren
      const plans = await prisma.subscriptionPlan.findMany({ where: { isActive: true } })
      for (const plan of plans) {
        try {
          await stripeService.syncPlanToStripe(plan.id)
          results.plans.push({ id: plan.id, name: plan.name, success: true })
        } catch (error) {
          results.plans.push({ 
            id: plan.id, 
            name: plan.name, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unbekannter Fehler'
          })
        }
      }

      // Alle Pakete synchronisieren
      const packages = await prisma.creditPackage.findMany({ where: { isActive: true } })
      for (const pkg of packages) {
        try {
          await stripeService.syncCreditPackageToStripe(pkg.id)
          results.packages.push({ id: pkg.id, name: pkg.name, success: true })
        } catch (error) {
          results.packages.push({ 
            id: pkg.id, 
            name: pkg.name, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unbekannter Fehler'
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Synchronisierung abgeschlossen',
        results
      })
    }

    // Einzelnen Plan synchronisieren
    if (planId) {
      const updatedPlan = await stripeService.syncPlanToStripe(planId)
      return NextResponse.json({
        success: true,
        message: `Plan "${updatedPlan.name}" wurde mit Stripe synchronisiert`,
        plan: {
          id: updatedPlan.id,
          name: updatedPlan.name,
          stripeProductId: updatedPlan.stripeProductId,
          stripePriceMonthly: updatedPlan.stripePriceMonthly,
          stripePriceQuarterly: updatedPlan.stripePriceQuarterly,
          stripePriceSixMonths: updatedPlan.stripePriceSixMonths,
          stripePriceYearly: updatedPlan.stripePriceYearly
        }
      })
    }

    // Einzelnes Paket synchronisieren
    if (packageId) {
      const updatedPackage = await stripeService.syncCreditPackageToStripe(packageId)
      return NextResponse.json({
        success: true,
        message: `Credit-Paket "${updatedPackage.name}" wurde mit Stripe synchronisiert`,
        package: {
          id: updatedPackage.id,
          name: updatedPackage.name,
          stripePriceId: updatedPackage.stripePriceId
        }
      })
    }

    return NextResponse.json(
      { error: 'planId, packageId oder syncAll ist erforderlich' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error syncing with Stripe:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler bei der Synchronisierung' },
      { status: 500 }
    )
  }
}

