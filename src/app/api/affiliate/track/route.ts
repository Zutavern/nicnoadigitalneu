import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// POST /api/affiliate/track - Track affiliate click/visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { salonId, affiliateToken, action, productId } = body

    if (!salonId || !affiliateToken) {
      return NextResponse.json(
        { error: 'Salon ID und Affiliate Token erforderlich' },
        { status: 400 }
      )
    }

    // Validate action
    const validActions = ['click', 'view', 'add_to_cart', 'checkout']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Ungültige Aktion' },
        { status: 400 }
      )
    }

    // Verify affiliate token and get affiliate user
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: {
        stylists: { select: { id: true } },
        shopSettings: true,
      },
    })

    if (!salon || !salon.shopSettings?.affiliateEnabled) {
      return NextResponse.json(
        { error: 'Affiliate nicht verfügbar' },
        { status: 400 }
      )
    }

    // Find affiliate by verifying token
    let affiliateUserId: string | null = null
    for (const stylist of salon.stylists) {
      const expectedToken = crypto
        .createHash('sha256')
        .update(`${stylist.id}:${salonId}:${process.env.AUTH_SECRET || 'secret'}`)
        .digest('hex')
        .substring(0, 16)

      if (expectedToken === affiliateToken) {
        affiliateUserId = stylist.id
        break
      }
    }

    if (!affiliateUserId) {
      return NextResponse.json(
        { error: 'Ungültiger Affiliate Token' },
        { status: 400 }
      )
    }

    // Log tracking event (could store in database for analytics)
    console.log(`Affiliate tracking: ${action}`, {
      salonId,
      affiliateUserId,
      productId,
      timestamp: new Date().toISOString(),
    })

    // Set affiliate cookie for order attribution
    const response = NextResponse.json({
      success: true,
      tracked: true,
    })

    // Set a cookie to remember the affiliate for 30 days
    response.cookies.set('nicnoa_aff', `${salonId}:${affiliateToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error) {
    console.error('Error tracking affiliate:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// GET /api/affiliate/track - Verify affiliate and get info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')
    const affiliateToken = searchParams.get('ref')

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon ID erforderlich' },
        { status: 400 }
      )
    }

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: {
        shopifyConnections: {
          where: { isActive: true },
        },
        shopSettings: true,
      },
    })

    if (!salon || salon.shopifyConnections.length === 0) {
      return NextResponse.json(
        { error: 'Shop nicht verfügbar' },
        { status: 400 }
      )
    }

    // Check if affiliate is valid
    let affiliateValid = false
    if (affiliateToken && salon.shopSettings?.affiliateEnabled) {
      const stylists = await prisma.user.findMany({
        where: {
          salons: { some: { id: salonId } },
          role: 'STYLIST',
        },
        select: { id: true },
      })

      for (const stylist of stylists) {
        const expectedToken = crypto
          .createHash('sha256')
          .update(`${stylist.id}:${salonId}:${process.env.AUTH_SECRET || 'secret'}`)
          .digest('hex')
          .substring(0, 16)

        if (expectedToken === affiliateToken) {
          affiliateValid = true
          break
        }
      }
    }

    return NextResponse.json({
      success: true,
      salon: {
        id: salon.id,
        name: salon.name,
      },
      shopEnabled: true,
      affiliateEnabled: salon.shopSettings?.affiliateEnabled || false,
      affiliateValid,
    })
  } catch (error) {
    console.error('Error verifying affiliate:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

