/**
 * Credit Packages API für Nutzer
 * 
 * Zeigt verfügbare Credit-Pakete an
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/credits/packages - Verfügbare Pakete abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Hole aktive Pakete, sortiert nach Preis
    const packages = await prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        credits: true,
        priceEur: true,
        isPopular: true,
        maxPerUser: true,
        validDays: true,
      },
    })

    // Berechne Käufe pro Paket für aktuellen Nutzer
    const purchaseCounts = await prisma.creditTransaction.groupBy({
      by: ['packageId'],
      where: {
        userId: session.user.id,
        type: 'purchase',
        packageId: { not: null },
      },
      _count: true,
    })

    const purchaseMap = new Map(
      purchaseCounts.map(p => [p.packageId, p._count])
    )

    const packagesWithDetails = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      credits: Number(pkg.credits),
      priceEur: Number(pkg.priceEur),
      pricePerCredit: Number(pkg.priceEur) / Number(pkg.credits),
      isPopular: pkg.isPopular,
      maxPerUser: pkg.maxPerUser,
      validDays: pkg.validDays,
      purchasedCount: purchaseMap.get(pkg.id) || 0,
      canPurchase: pkg.maxPerUser 
        ? (purchaseMap.get(pkg.id) || 0) < pkg.maxPerUser 
        : true,
    }))

    return NextResponse.json({ packages: packagesWithDetails })
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Pakete' },
      { status: 500 }
    )
  }
}

