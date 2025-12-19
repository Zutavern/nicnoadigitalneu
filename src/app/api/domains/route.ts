/**
 * Domains Management API
 * 
 * GET: Liste aller Domains des Users
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDomainStatus } from '@/lib/vercel/domains'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Hole alle Domains des Users
    const domains = await prisma.customDomain.findMany({
      where: { userId: session.user.id },
      include: {
        homepageProject: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Hole aktuellen Status von Vercel für jede Domain
    const domainsWithStatus = await Promise.all(
      domains.map(async (domain) => {
        const vercelStatus = await getDomainStatus(domain.domain)
        
        return {
          ...domain,
          purchasePriceUsd: domain.purchasePriceUsd ? Number(domain.purchasePriceUsd) : null,
          renewalPriceUsd: domain.renewalPriceUsd ? Number(domain.renewalPriceUsd) : null,
          customerPriceEur: domain.customerPriceEur ? Number(domain.customerPriceEur) : null,
          vercelStatus: {
            configured: vercelStatus.configured,
            verified: vercelStatus.verified,
          },
        }
      })
    )

    return NextResponse.json({
      domains: domainsWithStatus,
      total: domains.length,
    })
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Domains' },
      { status: 500 }
    )
  }
}



