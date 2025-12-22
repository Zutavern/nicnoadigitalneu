import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET /api/stylist/shop/affiliate/widget - Get widget configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon ID erforderlich' },
        { status: 400 }
      )
    }

    // Verify user is stylist assigned to this salon
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        salons: {
          where: { id: salonId },
          include: {
            shopifyConnections: {
              where: { isActive: true },
              select: { shopDomain: true },
            },
            shopSettings: true,
          },
        },
      },
    })

    if (!user || user.role !== 'STYLIST') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const salon = user.salons[0]
    if (!salon) {
      return NextResponse.json(
        { error: 'Nicht diesem Salon zugeordnet' },
        { status: 403 }
      )
    }

    if (
      salon.shopifyConnections.length === 0 ||
      !salon.shopSettings?.affiliateEnabled
    ) {
      return NextResponse.json(
        { error: 'Affiliate-System nicht aktiviert für diesen Salon' },
        { status: 400 }
      )
    }

    // Generate affiliate token (hash of user+salon)
    const affiliateToken = crypto
      .createHash('sha256')
      .update(`${session.user.id}:${salonId}:${process.env.AUTH_SECRET || 'secret'}`)
      .digest('hex')
      .substring(0, 16)

    // Generate widget embed code
    const baseUrl = process.env.NEXTAUTH_URL || 'https://app.nicnoa.com'
    const shopDomain = salon.shopifyConnections[0]?.shopDomain

    const embedCode = `<!-- NICNOA Shop Widget -->
<div id="nicnoa-shop-widget" 
     data-salon="${salonId}" 
     data-affiliate="${affiliateToken}"
     data-theme="dark">
</div>
<script src="${baseUrl}/widget/shop.js" async></script>`

    const linkCode = `${baseUrl}/shop/${salonId}?ref=${affiliateToken}`

    return NextResponse.json({
      success: true,
      affiliateToken,
      salonName: salon.name,
      shopDomain,
      commissionRate: salon.shopSettings.defaultAffiliateCommission,
      embedCode,
      linkCode,
      widgetUrl: `${baseUrl}/widget/shop.js`,
      previewUrl: `${baseUrl}/shop/${salonId}/preview?ref=${affiliateToken}`,
    })
  } catch (error) {
    console.error('Error getting widget config:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

