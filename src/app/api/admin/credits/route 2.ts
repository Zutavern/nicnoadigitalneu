/**
 * Admin Credits API Route
 * 
 * Verwaltet Credits, Pakete und Transaktionen
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCreditStats } from '@/lib/credits'

/**
 * GET: Holt Credit-Übersicht für Admin
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Prüfe Admin-Rechte
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    // Wenn userId angegeben, hole nur Credits für diesen User
    if (userId) {
      const userCredits = await (prisma.userCredits as unknown as {
        findUnique: (args: { where: { userId: string } }) => Promise<{
          balance: unknown
          isUnlimited?: boolean
          lifetimeUsed: unknown
          lifetimeBought: unknown
        } | null>
      }).findUnique({
        where: { userId },
      })
      
      return NextResponse.json({
        balance: userCredits ? Number(userCredits.balance) : 0,
        isUnlimited: (userCredits as { isUnlimited?: boolean } | null)?.isUnlimited ?? false,
        lifetimeUsed: userCredits ? Number(userCredits.lifetimeUsed) : 0,
        lifetimeBought: userCredits ? Number(userCredits.lifetimeBought) : 0,
      })
    }
    
    const days = parseInt(searchParams.get('days') || '30', 10)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Hole Statistiken und Daten parallel
    const [
      stats,
      packages,
      recentTransactions,
      topUsers,
    ] = await Promise.all([
      getCreditStats(startDate),
      // Alle Pakete
      prisma.creditPackage.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
      // Letzte 100 Transaktionen
      prisma.creditTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          package: {
            select: { name: true },
          },
        },
      }),
      // Top User nach Credits-Verbrauch
      prisma.userCredits.findMany({
        orderBy: { lifetimeUsed: 'desc' },
        take: 20,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      stats,
      packages: packages.map(p => ({
        ...p,
        credits: Number(p.credits),
        bonusCredits: Number(p.bonusCredits),
        priceEur: Number(p.priceEur),
      })),
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        userId: t.userId,
        user: t.user,
        type: t.type,
        amount: Number(t.amount),
        balanceBefore: Number(t.balanceBefore),
        balanceAfter: Number(t.balanceAfter),
        description: t.description,
        packageName: t.package?.name,
        createdAt: t.createdAt,
      })),
      topUsers: topUsers.map(u => ({
        userId: u.userId,
        user: u.user,
        balance: Number(u.balance),
        lifetimeUsed: Number(u.lifetimeUsed),
        lifetimeBought: Number(u.lifetimeBought),
        lastTopUpAt: u.lastTopUpAt,
      })),
    })

  } catch (error) {
    console.error('[Admin Credits] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Credits-Daten' },
      { status: 500 }
    )
  }
}

