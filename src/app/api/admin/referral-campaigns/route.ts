import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

// Stripe initialisieren (wenn konfiguriert)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' })
  : null

/**
 * GET /api/admin/referral-campaigns
 * Alle Kampagnen laden
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await prisma.referralCampaign.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Statistiken
    const stats = {
      total: campaigns.length,
      active: campaigns.filter(c => c.isActive).length,
      totalReferrals: campaigns.reduce((sum, c) => sum + c.totalReferrals, 0),
      successfulReferrals: campaigns.reduce((sum, c) => sum + c.successfulReferrals, 0)
    }

    return NextResponse.json({
      campaigns,
      stats,
      stripeConfigured: !!stripe
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Kampagnen' }, { status: 500 })
  }
}

/**
 * POST /api/admin/referral-campaigns
 * Neue Kampagne erstellen
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      slug,
      description,
      codePrefix,
      referrerRewardMonths,
      referredRewardMonths,
      referrerRewardText,
      referredRewardText,
      marketingText,
      isActive,
      isDefault,
      validFrom,
      validUntil,
      maxRedemptions,
      syncToStripe
    } = body

    // Validierung
    if (!name || !slug || !codePrefix) {
      return NextResponse.json(
        { error: 'Name, Slug und Code-Prefix sind erforderlich' },
        { status: 400 }
      )
    }

    // Prüfen ob Slug bereits existiert
    const existingSlug = await prisma.referralCampaign.findUnique({
      where: { slug }
    })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Eine Kampagne mit diesem Slug existiert bereits' },
        { status: 400 }
      )
    }

    // Wenn diese Kampagne aktiv sein soll, alle anderen deaktivieren
    if (isActive) {
      await prisma.referralCampaign.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    // Stripe Coupons erstellen (wenn gewünscht und Stripe konfiguriert)
    let stripeReferrerCouponId: string | null = null
    let stripeReferredCouponId: string | null = null

    if (syncToStripe && stripe) {
      try {
        // Coupon für Empfehler (X Monate kostenlos)
        if (referrerRewardMonths > 0) {
          const referrerCoupon = await stripe.coupons.create({
            name: `${name} - Empfehler (${referrerRewardMonths} Monat${referrerRewardMonths > 1 ? 'e' : ''} gratis)`,
            duration: 'repeating',
            duration_in_months: referrerRewardMonths,
            percent_off: 100,
            metadata: {
              campaign_slug: slug,
              reward_type: 'referrer',
              created_by: 'nicnoa_referral_system'
            }
          })
          stripeReferrerCouponId = referrerCoupon.id
        }

        // Coupon für Geworbenen (Y Monate kostenlos)
        if (referredRewardMonths > 0) {
          const referredCoupon = await stripe.coupons.create({
            name: `${name} - Geworbener (${referredRewardMonths} Monat${referredRewardMonths > 1 ? 'e' : ''} gratis)`,
            duration: 'repeating',
            duration_in_months: referredRewardMonths,
            percent_off: 100,
            metadata: {
              campaign_slug: slug,
              reward_type: 'referred',
              created_by: 'nicnoa_referral_system'
            }
          })
          stripeReferredCouponId = referredCoupon.id
        }
      } catch (stripeError) {
        console.error('Stripe coupon creation error:', stripeError)
        // Weitermachen ohne Stripe
      }
    }

    // Kampagne erstellen
    const campaign = await prisma.referralCampaign.create({
      data: {
        name,
        slug,
        description: description || '',
        codePrefix: codePrefix.toUpperCase(),
        referrerRewardMonths: referrerRewardMonths || 1,
        referredRewardMonths: referredRewardMonths || 1,
        referrerRewardText: referrerRewardText || `${referrerRewardMonths || 1} Monat${(referrerRewardMonths || 1) > 1 ? 'e' : ''} gratis`,
        referredRewardText: referredRewardText || `${referredRewardMonths || 1} Monat${(referredRewardMonths || 1) > 1 ? 'e' : ''} gratis`,
        marketingText: marketingText || 'Empfehle uns weiter und spare!',
        isActive: isActive || false,
        isDefault: isDefault || false,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        maxRedemptions: maxRedemptions || null,
        stripeReferrerCouponId,
        stripeReferredCouponId
      }
    })

    return NextResponse.json({
      campaign,
      message: 'Kampagne erfolgreich erstellt',
      stripeSync: syncToStripe && stripe ? 'success' : 'skipped'
    })

  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen der Kampagne' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/referral-campaigns
 * Kampagne aktualisieren
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Kampagnen-ID erforderlich' }, { status: 400 })
    }

    // Wenn diese Kampagne aktiviert wird, alle anderen deaktivieren
    if (updateData.isActive) {
      await prisma.referralCampaign.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      })
    }

    // Daten vorbereiten
    const data: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'description', 'codePrefix', 
      'referrerRewardMonths', 'referredRewardMonths',
      'referrerRewardText', 'referredRewardText', 'marketingText',
      'isActive', 'isDefault', 'validFrom', 'validUntil', 'maxRedemptions'
    ]

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'codePrefix') {
          data[field] = updateData[field].toUpperCase()
        } else if (field === 'validFrom' || field === 'validUntil') {
          data[field] = updateData[field] ? new Date(updateData[field]) : null
        } else {
          data[field] = updateData[field]
        }
      }
    }

    const campaign = await prisma.referralCampaign.update({
      where: { id },
      data
    })

    return NextResponse.json({
      campaign,
      message: 'Kampagne aktualisiert'
    })

  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/referral-campaigns?id=xxx
 * Kampagne löschen (soft delete / deaktivieren)
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
      return NextResponse.json({ error: 'Kampagnen-ID erforderlich' }, { status: 400 })
    }

    // Prüfen ob Kampagne existiert
    const campaign = await prisma.referralCampaign.findUnique({
      where: { id }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Kampagne nicht gefunden' }, { status: 404 })
    }

    // Wenn Referrals existieren, nur deaktivieren statt löschen
    const referralCount = await prisma.referral.count({
      where: { campaignId: id }
    })

    if (referralCount > 0) {
      await prisma.referralCampaign.update({
        where: { id },
        data: { isActive: false }
      })
      return NextResponse.json({
        message: 'Kampagne deaktiviert (hat Referrals)',
        deactivated: true
      })
    }

    // Kampagne löschen
    await prisma.referralCampaign.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Kampagne gelöscht',
      deleted: true
    })

  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}

