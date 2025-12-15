/**
 * Admin Credit Adjustment API Route
 * 
 * Ermöglicht Admins, Nutzer-Credits manuell anzupassen
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { adjustUserCredits, addCredits, getOrCreateUserCredits } from '@/lib/credits'

interface AdjustmentInput {
  userId: string
  amount?: number
  reason: string
  type?: 'adjustment' | 'bonus' | 'refund'
  isUnlimited?: boolean
}

/**
 * POST: Credits eines Nutzers anpassen
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Prüfe Admin-Rechte
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const body: AdjustmentInput = await request.json()
    const { userId, amount, reason, type = 'adjustment', isUnlimited } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob User existiert
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Nutzer nicht gefunden' }, { status: 404 })
    }

    // Wenn isUnlimited gesetzt werden soll
    if (isUnlimited !== undefined) {
      // Hole oder erstelle UserCredits
      let userCredits = await (prisma.userCredits as unknown as {
        findUnique: (args: { where: { userId: string } }) => Promise<{ id: string } | null>
      }).findUnique({
        where: { userId },
      })
      
      if (!userCredits) {
        userCredits = await (prisma.userCredits as unknown as {
          create: (args: { data: { userId: string; isUnlimited: boolean } }) => Promise<{ id: string }>
        }).create({
          data: {
            userId,
            isUnlimited,
          },
        })
      } else {
        await (prisma.userCredits as unknown as {
          update: (args: { where: { userId: string }; data: { isUnlimited: boolean } }) => Promise<unknown>
        }).update({
          where: { userId },
          data: { isUnlimited },
        })
      }
      
      // Wenn nur Unlimited-Status gesetzt wird, ohne Credits-Änderung
      if (amount === undefined || amount === 0) {
        const updatedCredits = await getOrCreateUserCredits(userId)
        return NextResponse.json({
          success: true,
          newBalance: updatedCredits.balance,
          isUnlimited,
          userCredits: updatedCredits,
          user: targetUser,
        })
      }
    }

    // Credits-Anpassung (wenn amount angegeben)
    if (amount !== undefined && amount !== 0) {
      let result

      if (type === 'bonus' && amount > 0) {
        // Bonus gutschreiben
        result = await addCredits({
          userId,
          type: 'bonus',
          amount,
          description: `Bonus: ${reason || 'Admin-Anpassung'}`,
          adminUserId: session.user.id,
          adminNote: reason,
        })
      } else if (type === 'refund' && amount > 0) {
        // Erstattung
        result = await addCredits({
          userId,
          type: 'refund',
          amount,
          description: `Erstattung: ${reason || 'Admin-Anpassung'}`,
          adminUserId: session.user.id,
          adminNote: reason,
        })
      } else {
        // Standard-Anpassung (positiv oder negativ)
        result = await adjustUserCredits(userId, amount, session.user.id, reason || 'Admin-Anpassung')
      }

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    }

    // Hole aktuelle Balance
    const userCredits = await getOrCreateUserCredits(userId)

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      newBalance: result.newBalance,
      userCredits,
      user: targetUser,
    })

  } catch (error) {
    console.error('[Admin Credits Adjust] Error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Credit-Anpassung' },
      { status: 500 }
    )
  }
}

/**
 * GET: Credit-Balance eines Nutzers abrufen
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId erforderlich' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Nutzer nicht gefunden' }, { status: 404 })
    }

    const userCredits = await getOrCreateUserCredits(userId)

    // Letzte 20 Transaktionen
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        package: { select: { name: true } },
      },
    })

    return NextResponse.json({
      user: targetUser,
      credits: userCredits,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceBefore: Number(t.balanceBefore),
        balanceAfter: Number(t.balanceAfter),
        description: t.description,
        packageName: t.package?.name,
        createdAt: t.createdAt,
      })),
    })

  } catch (error) {
    console.error('[Admin Credits Adjust] GET Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Credit-Daten' },
      { status: 500 }
    )
  }
}

