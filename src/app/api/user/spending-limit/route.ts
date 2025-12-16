/**
 * User Spending Limit API
 * 
 * GET: Aktuelles Limit und Verbrauch abrufen
 * PATCH: Limit anpassen
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserIncludedAiCredits } from '@/lib/stripe/metered-billing'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hole oder erstelle SpendingLimit
    let spendingLimit = await prisma.spendingLimit.findUnique({
      where: { userId: session.user.id },
    })

    if (!spendingLimit) {
      // Erstelle Standard-Limit
      spendingLimit = await prisma.spendingLimit.create({
        data: {
          userId: session.user.id,
          monthlyLimitEur: 50,
          alertThreshold: 80,
          hardLimit: false,
        },
      })
    }

    // Prüfe ob Monat zurückgesetzt werden muss
    const now = new Date()
    const lastReset = new Date(spendingLimit.lastResetAt)
    
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      // Neuer Monat - Reset
      spendingLimit = await prisma.spendingLimit.update({
        where: { id: spendingLimit.id },
        data: {
          currentMonthSpent: 0,
          lastResetAt: now,
          alertSentAt: null,
          limitHitAt: null,
        },
      })
    }

    // Berechne aktuelle Monatskosten aus Usage Logs (zur Verifizierung)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const actualUsage = await prisma.aIUsageLog.aggregate({
      where: {
        userId: session.user.id,
        createdAt: { gte: monthStart },
        success: true,
      },
      _sum: {
        costUsd: true,
      },
    })

    // Konvertiere zu EUR mit Marge
    const marginMultiplier = 1.4
    const actualCostEur = Number(actualUsage._sum.costUsd || 0) * marginMultiplier * 0.92

    // Aktualisiere den gespeicherten Wert wenn abweichend
    if (Math.abs(Number(spendingLimit.currentMonthSpent) - actualCostEur) > 0.01) {
      spendingLimit = await prisma.spendingLimit.update({
        where: { id: spendingLimit.id },
        data: { currentMonthSpent: actualCostEur },
      })
    }

    const percentageUsed = Number(spendingLimit.monthlyLimitEur) > 0
      ? (Number(spendingLimit.currentMonthSpent) / Number(spendingLimit.monthlyLimitEur)) * 100
      : 0

    const remaining = Math.max(0, Number(spendingLimit.monthlyLimitEur) - Number(spendingLimit.currentMonthSpent))

    // Hole inkludierte AI-Credits aus dem Plan
    const includedAiCreditsEur = await getUserIncludedAiCredits(session.user.id)
    const currentMonthSpent = Number(spendingLimit.currentMonthSpent)
    const includedCreditsRemaining = Math.max(0, includedAiCreditsEur - currentMonthSpent)
    const chargedToStripeThisMonth = Math.max(0, currentMonthSpent - includedAiCreditsEur)

    return NextResponse.json({
      limit: {
        id: spendingLimit.id,
        monthlyLimitEur: Number(spendingLimit.monthlyLimitEur),
        alertThreshold: spendingLimit.alertThreshold,
        hardLimit: spendingLimit.hardLimit,
      },
      usage: {
        currentMonthSpentEur: currentMonthSpent,
        remainingEur: remaining,
        percentageUsed: Math.min(100, percentageUsed),
        isNearLimit: percentageUsed >= spendingLimit.alertThreshold,
        hasHitLimit: spendingLimit.hardLimit && percentageUsed >= 100,
      },
      // Inkludierte Credits aus dem Plan
      includedCredits: {
        totalEur: includedAiCreditsEur,
        remainingEur: includedCreditsRemaining,
        usedEur: Math.min(currentMonthSpent, includedAiCreditsEur),
        percentageUsed: includedAiCreditsEur > 0 
          ? Math.min(100, (Math.min(currentMonthSpent, includedAiCreditsEur) / includedAiCreditsEur) * 100)
          : 0,
      },
      // Extra-Verbrauch über inkludierte Credits hinaus
      extraUsage: {
        chargedEur: chargedToStripeThisMonth,
        hasExtraUsage: chargedToStripeThisMonth > 0,
      },
      alerts: {
        alertSentAt: spendingLimit.alertSentAt,
        limitHitAt: spendingLimit.limitHitAt,
      },
      period: {
        start: monthStart.toISOString(),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
      },
    })

  } catch (error) {
    console.error('Error fetching spending limit:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Limits' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { monthlyLimitEur, alertThreshold, hardLimit } = body

    // Validierung
    if (monthlyLimitEur !== undefined && (monthlyLimitEur < 0 || monthlyLimitEur > 10000)) {
      return NextResponse.json(
        { error: 'Limit muss zwischen 0 und 10.000€ liegen' },
        { status: 400 }
      )
    }

    if (alertThreshold !== undefined && (alertThreshold < 0 || alertThreshold > 100)) {
      return NextResponse.json(
        { error: 'Schwellenwert muss zwischen 0 und 100% liegen' },
        { status: 400 }
      )
    }

    // Hole oder erstelle SpendingLimit
    let spendingLimit = await prisma.spendingLimit.findUnique({
      where: { userId: session.user.id },
    })

    const updateData: Record<string, unknown> = {}

    if (monthlyLimitEur !== undefined) {
      updateData.monthlyLimitEur = monthlyLimitEur
      // Reset Alerts wenn Limit erhöht wird
      if (!spendingLimit || monthlyLimitEur > Number(spendingLimit.monthlyLimitEur)) {
        updateData.alertSentAt = null
        updateData.limitHitAt = null
      }
    }

    if (alertThreshold !== undefined) {
      updateData.alertThreshold = alertThreshold
    }

    if (hardLimit !== undefined) {
      updateData.hardLimit = hardLimit
    }

    if (spendingLimit) {
      spendingLimit = await prisma.spendingLimit.update({
        where: { id: spendingLimit.id },
        data: updateData,
      })
    } else {
      spendingLimit = await prisma.spendingLimit.create({
        data: {
          userId: session.user.id,
          monthlyLimitEur: monthlyLimitEur ?? 50,
          alertThreshold: alertThreshold ?? 80,
          hardLimit: hardLimit ?? false,
        },
      })
    }

    return NextResponse.json({
      message: 'Einstellungen gespeichert',
      limit: {
        id: spendingLimit.id,
        monthlyLimitEur: Number(spendingLimit.monthlyLimitEur),
        alertThreshold: spendingLimit.alertThreshold,
        hardLimit: spendingLimit.hardLimit,
      },
    })

  } catch (error) {
    console.error('Error updating spending limit:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Einstellungen' },
      { status: 500 }
    )
  }
}

