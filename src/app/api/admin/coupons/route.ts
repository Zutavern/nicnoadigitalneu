import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isStripeConfigured, stripe } from '@/lib/stripe-server'
import { CouponType, CouponDuration } from '@prisma/client'

/**
 * GET /api/admin/coupons
 * Listet alle Coupons auf
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { redemptions: true }
        }
      }
    })

    // Statistiken berechnen
    const stats = {
      total: coupons.length,
      active: coupons.filter(c => c.isActive).length,
      expired: coupons.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date()).length,
      totalRedemptions: coupons.reduce((sum, c) => sum + c.timesRedeemed, 0),
      withStripe: coupons.filter(c => c.stripeCouponId).length
    }

    return NextResponse.json({ coupons, stats })

  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Coupons' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/coupons
 * Erstellt einen neuen Coupon (auch in Stripe)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      code,
      name,
      description,
      type = 'PERCENTAGE',
      discountPercent,
      discountAmount,
      duration = 'ONCE',
      durationMonths,
      maxRedemptions,
      expiresAt,
      minAmount,
      firstTimeOnly = false,
      applicablePlanIds = [],
      syncToStripe = true
    } = body

    // Validierung
    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code und Name sind erforderlich' },
        { status: 400 }
      )
    }

    // Code-Format prüfen (nur Großbuchstaben, Zahlen, Bindestriche)
    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    
    // Prüfen ob Code bereits existiert
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Dieser Coupon-Code existiert bereits' },
        { status: 400 }
      )
    }

    let stripeCouponId: string | null = null

    // In Stripe erstellen falls konfiguriert
    if (syncToStripe && isStripeConfigured && stripe) {
      try {
        const stripeParams: {
          id: string
          name: string
          percent_off?: number
          amount_off?: number
          currency?: string
          duration: 'once' | 'repeating' | 'forever'
          duration_in_months?: number
          max_redemptions?: number
          redeem_by?: number
        } = {
          id: cleanCode,
          name: name,
          duration: duration.toLowerCase() as 'once' | 'repeating' | 'forever'
        }

        if (type === 'PERCENTAGE' && discountPercent) {
          stripeParams.percent_off = discountPercent
        } else if (type === 'FIXED_AMOUNT' && discountAmount) {
          stripeParams.amount_off = Math.round(Number(discountAmount) * 100) // Cents
          stripeParams.currency = 'eur'
        }

        if (duration === 'REPEATING' && durationMonths) {
          stripeParams.duration_in_months = durationMonths
        }

        if (maxRedemptions) {
          stripeParams.max_redemptions = maxRedemptions
        }

        if (expiresAt) {
          stripeParams.redeem_by = Math.floor(new Date(expiresAt).getTime() / 1000)
        }

        const stripeCoupon = await stripe.coupons.create(stripeParams)
        stripeCouponId = stripeCoupon.id
      } catch (stripeError) {
        console.error('Stripe coupon creation error:', stripeError)
        // Wir erstellen trotzdem lokal, aber ohne Stripe-ID
      }
    }

    // In DB erstellen
    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        name,
        description,
        type: type as CouponType,
        discountPercent: type === 'PERCENTAGE' ? discountPercent : null,
        discountAmount: type === 'FIXED_AMOUNT' ? discountAmount : null,
        duration: duration as CouponDuration,
        durationMonths: duration === 'REPEATING' ? durationMonths : null,
        maxRedemptions,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        minAmount,
        firstTimeOnly,
        applicablePlanIds,
        stripeCouponId,
        isActive: true
      }
    })

    return NextResponse.json({
      coupon,
      message: `Coupon "${cleanCode}" erfolgreich erstellt${stripeCouponId ? ' (mit Stripe synchronisiert)' : ''}`
    })

  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Coupons' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/coupons
 * Aktualisiert einen Coupon
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Nur erlaubte Felder updaten
    const allowedFields = [
      'name', 'description', 'maxRedemptions', 'expiresAt',
      'minAmount', 'firstTimeOnly', 'applicablePlanIds', 'isActive'
    ]

    const filteredData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: filteredData
    })

    return NextResponse.json({
      coupon,
      message: 'Coupon erfolgreich aktualisiert'
    })

  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Coupons' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/coupons
 * Löscht einen Coupon
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon-ID ist erforderlich' },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon nicht gefunden' },
        { status: 404 }
      )
    }

    // Auch in Stripe löschen falls vorhanden
    if (coupon.stripeCouponId && isStripeConfigured && stripe) {
      try {
        await stripe.coupons.del(coupon.stripeCouponId)
      } catch (stripeError) {
        console.error('Error deleting Stripe coupon:', stripeError)
        // Trotzdem lokal löschen
      }
    }

    await prisma.coupon.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Coupon erfolgreich gelöscht'
    })

  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Coupons' },
      { status: 500 }
    )
  }
}

