/**
 * Credits System Client
 * 
 * Verwaltet Nutzer-Credits, Transaktionen und Abrechnung
 */

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateCreditsFromUsd, CreditFeature, CREDIT_PRICING } from './pricing'

// Types
export interface CreditBalance {
  balance: number
  lifetimeUsed: number
  lifetimeBought: number
  lastTopUpAt: Date | null
  isUnlimited: boolean
}

export interface CreditTransactionInput {
  userId: string
  type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'admin_adjustment' | 'expiry'
  amount: number
  description?: string
  packageId?: string
  aiUsageLogId?: string
  stripePaymentId?: string
  adminUserId?: string
  adminNote?: string
  metadata?: Record<string, unknown>
}

export interface DeductCreditsResult {
  success: boolean
  newBalance: number
  transactionId?: string
  error?: string
}

/**
 * Holt oder erstellt das UserCredits-Objekt für einen User
 */
export async function getOrCreateUserCredits(userId: string): Promise<CreditBalance> {
  let credits = await prisma.userCredits.findUnique({
    where: { userId },
    select: {
      balance: true,
      lifetimeUsed: true,
      lifetimeBought: true,
      lastTopUpAt: true,
      isUnlimited: true,
    },
  })

  if (!credits) {
    credits = await prisma.userCredits.create({
      data: {
        userId,
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
  }

  return {
    balance: Number(credits.balance),
    lifetimeUsed: Number(credits.lifetimeUsed),
    lifetimeBought: Number(credits.lifetimeBought),
    lastTopUpAt: credits.lastTopUpAt,
    isUnlimited: credits.isUnlimited ?? false,
  }
}

/**
 * Holt den aktuellen Credit-Stand eines Users
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const credits = await getOrCreateUserCredits(userId)
  return credits.balance
}

/**
 * Prüft ob ein User genügend Credits hat
 * Unlimited-Accounts haben immer genügend Credits
 */
export async function hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
  const credits = await getOrCreateUserCredits(userId)
  if (credits.isUnlimited) return true
  return credits.balance >= amount
}

/**
 * Zieht Credits ab (für AI-Nutzung)
 * Bei Unlimited-Accounts werden keine Credits abgezogen, aber die Nutzung wird trotzdem getrackt
 */
export async function deductCredits(
  userId: string,
  amount: number,
  feature: CreditFeature,
  description?: string,
  aiUsageLogId?: string
): Promise<DeductCreditsResult> {
  if (amount <= 0) {
    return { success: true, newBalance: await getCreditBalance(userId) }
  }

  try {
    // Transaktion um Race Conditions zu vermeiden
    const result = await prisma.$transaction(async (tx) => {
      // Hole aktuellen Stand mit Lock
      const userCredits = await tx.userCredits.findUnique({
        where: { userId },
        select: {
          id: true,
          balance: true,
          lifetimeUsed: true,
          isUnlimited: true,
        },
      })

      if (!userCredits) {
        throw new Error('Keine Credits gefunden. Bitte Credits aufladen.')
      }

      const currentBalance = Number(userCredits.balance)
      const isUnlimited = userCredits.isUnlimited ?? false
      
      // Für Unlimited-Accounts: Keine Credits abziehen, aber Nutzung tracken
      if (isUnlimited) {
        // Nur lifetimeUsed aktualisieren für Tracking
        await tx.userCredits.update({
          where: { userId },
          data: {
            lifetimeUsed: Number(userCredits.lifetimeUsed) + amount,
          },
        })

        // Erstelle Transaktion für Tracking (mit amount 0 für keine echte Abbuchung)
        const transaction = await tx.creditTransaction.create({
          data: {
            userId,
            userCreditsId: userCredits.id,
            type: 'usage',
            amount: 0, // Keine echte Abbuchung
            balanceBefore: currentBalance,
            balanceAfter: currentBalance, // Balance bleibt gleich
            description: `[Unlimited] ${description || `${CREDIT_PRICING[feature]?.name || feature} Nutzung`}`,
            aiUsageLogId,
            metadata: { feature, originalAmount: amount, isUnlimited: true },
          },
        })

        return { newBalance: currentBalance, transactionId: transaction.id, isUnlimited: true }
      }
      
      // Normale Credits-Abbuchung
      if (currentBalance < amount) {
        throw new Error(`Nicht genügend Credits. Aktuell: ${currentBalance}, Benötigt: ${amount}`)
      }

      const newBalance = currentBalance - amount
      const newLifetimeUsed = Number(userCredits.lifetimeUsed) + amount

      // Update Balance
      await tx.userCredits.update({
        where: { userId },
        data: {
          balance: newBalance,
          lifetimeUsed: newLifetimeUsed,
        },
      })

      // Erstelle Transaktion
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          userCreditsId: userCredits.id,
          type: 'usage',
          amount: -amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: description || `${CREDIT_PRICING[feature]?.name || feature} Nutzung`,
          aiUsageLogId,
          metadata: { feature },
        },
      })

      return { newBalance, transactionId: transaction.id, isUnlimited: false }
    })

    return {
      success: true,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    }
  } catch (error) {
    console.error('[Credits] Deduct error:', error)
    return {
      success: false,
      newBalance: await getCreditBalance(userId),
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Fügt Credits hinzu (Kauf, Bonus, Admin)
 */
export async function addCredits(input: CreditTransactionInput): Promise<DeductCreditsResult> {
  const { userId, type, amount, description, packageId, stripePaymentId, adminUserId, adminNote, metadata } = input

  if (amount <= 0) {
    return { success: false, newBalance: 0, error: 'Betrag muss positiv sein' }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Hole oder erstelle UserCredits
      let userCredits = await tx.userCredits.findUnique({
        where: { userId },
      })

      if (!userCredits) {
        userCredits = await tx.userCredits.create({
          data: {
            userId,
            balance: 0,
            lifetimeUsed: 0,
            lifetimeBought: 0,
          },
        })
      }

      const currentBalance = Number(userCredits.balance)
      const newBalance = currentBalance + amount
      const isLifetimeBought = type === 'purchase'

      // Update Balance
      await tx.userCredits.update({
        where: { userId },
        data: {
          balance: newBalance,
          lifetimeBought: isLifetimeBought 
            ? Number(userCredits.lifetimeBought) + amount 
            : userCredits.lifetimeBought,
          lastTopUpAt: new Date(),
        },
      })

      // Erstelle Transaktion
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          userCreditsId: userCredits.id,
          type,
          amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description,
          packageId,
          stripePaymentId,
          adminUserId,
          adminNote,
          metadata: metadata as object,
        },
      })

      return { newBalance, transactionId: transaction.id }
    })

    return {
      success: true,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    }
  } catch (error) {
    console.error('[Credits] Add error:', error)
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }
}

/**
 * Holt die Transaktions-Historie eines Users
 */
export async function getCreditTransactions(
  userId: string,
  options: {
    limit?: number
    offset?: number
    type?: string
  } = {}
) {
  const { limit = 50, offset = 0, type } = options

  const transactions = await prisma.creditTransaction.findMany({
    where: {
      userId,
      ...(type && { type }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      package: {
        select: {
          name: true,
          credits: true,
          priceEur: true,
        },
      },
    },
  })

  const total = await prisma.creditTransaction.count({
    where: {
      userId,
      ...(type && { type }),
    },
  })

  return {
    transactions: transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      balanceBefore: Number(t.balanceBefore),
      balanceAfter: Number(t.balanceAfter),
      description: t.description,
      package: t.package ? {
        name: t.package.name,
        credits: Number(t.package.credits),
        priceEur: Number(t.package.priceEur),
      } : null,
      createdAt: t.createdAt,
    })),
    total,
    hasMore: offset + limit < total,
  }
}

/**
 * Holt alle verfügbaren Credit-Pakete
 */
export async function getCreditPackages(includeHidden = false) {
  const packages = await prisma.creditPackage.findMany({
    where: {
      isActive: true,
      ...(includeHidden ? {} : { isHidden: false }),
    },
    orderBy: { sortOrder: 'asc' },
  })

  return packages.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    credits: Number(p.credits),
    bonusCredits: Number(p.bonusCredits),
    bonusPercent: p.bonusPercent,
    totalCredits: Number(p.credits) + Number(p.bonusCredits),
    priceEur: Number(p.priceEur),
    isPopular: p.isPopular,
    stripePriceId: p.stripePriceId,
    validDays: p.validDays,
  }))
}

/**
 * Verarbeitet AI-Usage und zieht Credits ab
 */
export async function processAIUsageCredits(
  userId: string,
  costUsd: number,
  feature: CreditFeature,
  aiUsageLogId?: string
): Promise<DeductCreditsResult> {
  // Berechne Credits aus USD-Kosten
  const creditsToDeduct = calculateCreditsFromUsd(costUsd)
  
  if (creditsToDeduct <= 0) {
    return { success: true, newBalance: await getCreditBalance(userId) }
  }

  return deductCredits(
    userId,
    creditsToDeduct,
    feature,
    `${CREDIT_PRICING[feature]?.name || feature} ($${costUsd.toFixed(4)})`,
    aiUsageLogId
  )
}

/**
 * Admin: Passt Credits eines Users an
 */
export async function adjustUserCredits(
  userId: string,
  amount: number,
  adminUserId: string,
  reason: string
): Promise<DeductCreditsResult> {
  if (amount === 0) {
    return { success: false, newBalance: 0, error: 'Betrag darf nicht 0 sein' }
  }

  if (amount > 0) {
    return addCredits({
      userId,
      type: 'admin_adjustment',
      amount,
      description: `Admin-Anpassung: ${reason}`,
      adminUserId,
      adminNote: reason,
    })
  } else {
    // Negative Anpassung
    try {
      const result = await prisma.$transaction(async (tx) => {
        const userCredits = await tx.userCredits.findUnique({
          where: { userId },
        })

        if (!userCredits) {
          throw new Error('Keine Credits gefunden')
        }

        const currentBalance = Number(userCredits.balance)
        const newBalance = Math.max(0, currentBalance + amount) // Nicht unter 0

        await tx.userCredits.update({
          where: { userId },
          data: { balance: newBalance },
        })

        const transaction = await tx.creditTransaction.create({
          data: {
            userId,
            userCreditsId: userCredits.id,
            type: 'admin_adjustment',
            amount,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: `Admin-Anpassung: ${reason}`,
            adminUserId,
            adminNote: reason,
          },
        })

        return { newBalance, transactionId: transaction.id }
      })

      return {
        success: true,
        newBalance: result.newBalance,
        transactionId: result.transactionId,
      }
    } catch (error) {
      return {
        success: false,
        newBalance: 0,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      }
    }
  }
}

/**
 * Holt Statistiken für Admin-Dashboard
 */
export async function getCreditStats(startDate?: Date, endDate?: Date) {
  const dateFilter = {
    ...(startDate && { gte: startDate }),
    ...(endDate && { lte: endDate }),
  }

  const [
    totalUsers,
    totalBalance,
    totalTransactions,
    purchaseStats,
    usageStats,
  ] = await Promise.all([
    // Anzahl User mit Credits
    prisma.userCredits.count(),
    
    // Gesamt-Balance aller User
    prisma.userCredits.aggregate({
      _sum: { balance: true },
    }),
    
    // Gesamt-Transaktionen
    prisma.creditTransaction.count({
      where: startDate || endDate ? { createdAt: dateFilter } : undefined,
    }),
    
    // Käufe
    prisma.creditTransaction.aggregate({
      where: {
        type: 'purchase',
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      _sum: { amount: true },
      _count: true,
    }),
    
    // Nutzung
    prisma.creditTransaction.aggregate({
      where: {
        type: 'usage',
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  return {
    totalUsers,
    totalBalance: Number(totalBalance._sum.balance || 0),
    totalTransactions,
    purchases: {
      count: purchaseStats._count,
      totalCredits: Number(purchaseStats._sum.amount || 0),
    },
    usage: {
      count: usageStats._count,
      totalCredits: Math.abs(Number(usageStats._sum.amount || 0)),
    },
  }
}

