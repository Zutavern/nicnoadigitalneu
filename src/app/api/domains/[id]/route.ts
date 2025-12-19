/**
 * Single Domain Management API
 * 
 * GET: Domain-Details abrufen
 * POST: Domain verifizieren
 * DELETE: Domain entfernen
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyDomain, removeDomainFromProject, getDomainStatus } from '@/lib/vercel/domains'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { id } = await params

    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        homepageProject: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            isPublished: true,
          },
        },
      },
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain nicht gefunden' },
        { status: 404 }
      )
    }

    // Hole aktuellen Vercel-Status
    const vercelStatus = await getDomainStatus(domain.domain)

    return NextResponse.json({
      ...domain,
      purchasePriceUsd: domain.purchasePriceUsd ? Number(domain.purchasePriceUsd) : null,
      renewalPriceUsd: domain.renewalPriceUsd ? Number(domain.renewalPriceUsd) : null,
      customerPriceEur: domain.customerPriceEur ? Number(domain.customerPriceEur) : null,
      vercelStatus: {
        configured: vercelStatus.configured,
        verified: vercelStatus.verified,
      },
    })
  } catch (error) {
    console.error('Error fetching domain:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Domain' },
      { status: 500 }
    )
  }
}

// POST: Verifizierung triggern
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { id } = await params

    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain nicht gefunden' },
        { status: 404 }
      )
    }

    // Trigger Verifizierung bei Vercel
    const result = await verifyDomain(domain.domain)

    if (result.verified) {
      await prisma.customDomain.update({
        where: { id },
        data: {
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          dnsConfigured: true,
        },
      })

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Domain erfolgreich verifiziert!',
      })
    }

    return NextResponse.json({
      success: false,
      verified: false,
      message: result.error || 'Verifizierung noch nicht abgeschlossen. Bitte DNS-Einstellungen prüfen.',
    })

  } catch (error) {
    console.error('Error verifying domain:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Verifizierung' },
      { status: 500 }
    )
  }
}

// DELETE: Domain entfernen
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { id } = await params

    const domain = await prisma.customDomain.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain nicht gefunden' },
        { status: 404 }
      )
    }

    // Entferne Domain vom Vercel-Projekt
    const removeResult = await removeDomainFromProject(domain.domain)

    if (!removeResult.success) {
      console.warn('Could not remove domain from Vercel:', removeResult.error)
      // Trotzdem weitermachen und aus DB löschen
    }

    // Lösche aus der Datenbank
    await prisma.customDomain.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Domain erfolgreich entfernt',
    })

  } catch (error) {
    console.error('Error deleting domain:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Domain' },
      { status: 500 }
    )
  }
}



