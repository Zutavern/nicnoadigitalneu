/**
 * Admin Credit Packages API Route
 * 
 * CRUD für Credit-Pakete
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface PackageInput {
  name: string
  description?: string
  credits: number
  bonusCredits?: number
  bonusPercent?: number
  priceEur: number
  isActive?: boolean
  isPopular?: boolean
  isHidden?: boolean
  sortOrder?: number
  maxPerUser?: number
  validDays?: number
  stripePriceId?: string
}

/**
 * GET: Alle Pakete abrufen
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const packages = await prisma.creditPackage.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      packages: packages.map(p => ({
        ...p,
        credits: Number(p.credits),
        bonusCredits: Number(p.bonusCredits),
        priceEur: Number(p.priceEur),
      })),
    })

  } catch (error) {
    console.error('[Admin Packages] GET Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Pakete' },
      { status: 500 }
    )
  }
}

/**
 * POST: Neues Paket erstellen
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const body: PackageInput = await request.json()

    if (!body.name || !body.credits || !body.priceEur) {
      return NextResponse.json(
        { error: 'Name, Credits und Preis sind erforderlich' },
        { status: 400 }
      )
    }

    const newPackage = await prisma.creditPackage.create({
      data: {
        name: body.name,
        description: body.description,
        credits: body.credits,
        bonusCredits: body.bonusCredits || 0,
        bonusPercent: body.bonusPercent,
        priceEur: body.priceEur,
        isActive: body.isActive ?? true,
        isPopular: body.isPopular ?? false,
        isHidden: body.isHidden ?? false,
        sortOrder: body.sortOrder ?? 0,
        maxPerUser: body.maxPerUser,
        validDays: body.validDays,
        stripePriceId: body.stripePriceId,
      },
    })

    return NextResponse.json({
      success: true,
      package: {
        ...newPackage,
        credits: Number(newPackage.credits),
        bonusCredits: Number(newPackage.bonusCredits),
        priceEur: Number(newPackage.priceEur),
      },
    })

  } catch (error) {
    console.error('[Admin Packages] POST Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Pakets' },
      { status: 500 }
    )
  }
}

/**
 * PUT: Paket aktualisieren
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Paket-ID erforderlich' }, { status: 400 })
    }

    const updatedPackage = await prisma.creditPackage.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      package: {
        ...updatedPackage,
        credits: Number(updatedPackage.credits),
        bonusCredits: Number(updatedPackage.bonusCredits),
        priceEur: Number(updatedPackage.priceEur),
      },
    })

  } catch (error) {
    console.error('[Admin Packages] PUT Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Pakets' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Paket löschen
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Paket-ID erforderlich' }, { status: 400 })
    }

    // Prüfe ob Transaktionen existieren
    const transactionCount = await prisma.creditTransaction.count({
      where: { packageId: id },
    })

    if (transactionCount > 0) {
      // Deaktivieren statt löschen
      await prisma.creditPackage.update({
        where: { id },
        data: { isActive: false, isHidden: true },
      })

      return NextResponse.json({
        success: true,
        message: 'Paket wurde deaktiviert (hat verknüpfte Transaktionen)',
      })
    }

    await prisma.creditPackage.delete({ where: { id } })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Admin Packages] DELETE Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Pakets' },
      { status: 500 }
    )
  }
}

