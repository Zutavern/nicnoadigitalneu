/**
 * User Credits API
 * 
 * Ermöglicht Nutzern das Abrufen ihrer Credits und Transaktionen
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/user/credits - Aktuelle Credits und Transaktionen abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeTransactions = searchParams.get('includeTransactions') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    // Hole oder erstelle UserCredits
    let userCredits = await prisma.userCredits.findUnique({
      where: { userId: session.user.id },
      select: {
        balance: true,
        lifetimeUsed: true,
        lifetimeBought: true,
        lastTopUpAt: true,
        isUnlimited: true,
      },
    })

    if (!userCredits) {
      try {
        userCredits = await prisma.userCredits.create({
          data: {
            userId: session.user.id,
            balance: 0,
            lifetimeUsed: 0,
            lifetimeBought: 0,
            isUnlimited: false,
          },
          select: {
            balance: true,
            lifetimeUsed: true,
            lifetimeBought: true,
            lastTopUpAt: true,
            isUnlimited: true,
          },
        })
      } catch (createError) {
        // Falls concurrent create, versuche erneut zu laden
        console.log('UserCredits create failed, trying to find again:', createError)
        userCredits = await prisma.userCredits.findUnique({
          where: { userId: session.user.id },
          select: {
            balance: true,
            lifetimeUsed: true,
            lifetimeBought: true,
            lastTopUpAt: true,
            isUnlimited: true,
          },
        })
        
        if (!userCredits) {
          // Erstelle mit Default-Werten falls nicht gefunden
          return NextResponse.json({
            credits: {
              balance: 0,
              lifetimeUsed: 0,
              lifetimeBought: 0,
              lastTopUpAt: null,
              isUnlimited: false,
            },
            transactions: [],
          })
        }
      }
    }

    let transactions: {
      id: string
      type: string
      amount: number
      description: string | null
      createdAt: Date
      packageName?: string
    }[] = []

    if (includeTransactions) {
      try {
        const rawTransactions = await prisma.creditTransaction.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            package: {
              select: { name: true },
            },
          },
        })

        transactions = rawTransactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          description: t.description,
          createdAt: t.createdAt,
          packageName: t.package?.name,
        }))
      } catch (txError) {
        console.error('Error fetching transactions:', txError)
        // Fahre ohne Transaktionen fort
      }
    }

    return NextResponse.json({
      credits: {
        balance: Number(userCredits.balance),
        lifetimeUsed: Number(userCredits.lifetimeUsed),
        lifetimeBought: Number(userCredits.lifetimeBought),
        lastTopUpAt: userCredits.lastTopUpAt,
        isUnlimited: userCredits.isUnlimited ?? false,
      },
      transactions,
    })
  } catch (error) {
    console.error('Error fetching user credits:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return NextResponse.json(
      { error: `Fehler beim Laden der Credits: ${errorMessage}` },
      { status: 500 }
    )
  }
}

