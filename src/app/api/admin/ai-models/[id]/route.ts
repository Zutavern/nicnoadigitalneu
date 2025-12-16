/**
 * Admin Single AI Model API
 * 
 * GET: Einzelnes Modell abrufen
 * PATCH: Modell bearbeiten (Marge, Status, etc.)
 * DELETE: Modell deaktivieren
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const model = await prisma.aIModelConfig.findUnique({
      where: { id },
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Modell nicht gefunden' },
        { status: 404 }
      )
    }

    // Hole Nutzungsstatistiken für dieses Modell
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const stats = await prisma.aIUsageLog.aggregate({
      where: {
        model: { in: [model.modelId, model.modelKey] },
        createdAt: { gte: thirtyDaysAgo },
        success: true,
      },
      _count: true,
      _sum: {
        totalTokens: true,
        costUsd: true,
      },
    })

    const costUsd = Number(stats._sum.costUsd || 0)
    const revenueUsd = costUsd * (1 + model.marginPercent / 100)

    return NextResponse.json({
      model: {
        ...model,
        costPerInputToken: model.costPerInputToken ? Number(model.costPerInputToken) : null,
        costPerOutputToken: model.costPerOutputToken ? Number(model.costPerOutputToken) : null,
        costPerRun: model.costPerRun ? Number(model.costPerRun) : null,
        pricePerInputToken: model.pricePerInputToken ? Number(model.pricePerInputToken) : null,
        pricePerOutputToken: model.pricePerOutputToken ? Number(model.pricePerOutputToken) : null,
        pricePerRun: model.pricePerRun ? Number(model.pricePerRun) : null,
      },
      stats: {
        requests: stats._count,
        tokens: stats._sum.totalTokens || 0,
        costUsd,
        revenueUsd,
        profit: revenueUsd - costUsd,
      },
    })

  } catch (error) {
    console.error('Error fetching AI model:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Modells' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Hole aktuelles Modell
    const current = await prisma.aIModelConfig.findUnique({
      where: { id },
    })

    if (!current) {
      return NextResponse.json(
        { error: 'Modell nicht gefunden' },
        { status: 404 }
      )
    }

    // Erlaubte Update-Felder
    const allowedFields = [
      'name',
      'description',
      'subcategory',
      'marginPercent',
      'isActive',
      'isFree',
      'sortOrder',
      'costPerInputToken',
      'costPerOutputToken',
      'costPerRun',
    ]

    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Wenn Marge geändert wurde, berechne neue Preise
    if (body.marginPercent !== undefined) {
      const margin = body.marginPercent
      
      const costInput = body.costPerInputToken ?? (current.costPerInputToken ? Number(current.costPerInputToken) : null)
      const costOutput = body.costPerOutputToken ?? (current.costPerOutputToken ? Number(current.costPerOutputToken) : null)
      const costRun = body.costPerRun ?? (current.costPerRun ? Number(current.costPerRun) : null)

      if (costInput !== null) {
        updateData.pricePerInputToken = costInput * (1 + margin / 100)
      }
      if (costOutput !== null) {
        updateData.pricePerOutputToken = costOutput * (1 + margin / 100)
      }
      if (costRun !== null) {
        updateData.pricePerRun = costRun * (1 + margin / 100)
      }
    }

    // Wenn Kosten geändert wurden, berechne neue Preise
    if (body.costPerInputToken !== undefined || body.costPerOutputToken !== undefined || body.costPerRun !== undefined) {
      const margin = body.marginPercent ?? current.marginPercent

      if (body.costPerInputToken !== undefined) {
        updateData.pricePerInputToken = body.costPerInputToken * (1 + margin / 100)
      }
      if (body.costPerOutputToken !== undefined) {
        updateData.pricePerOutputToken = body.costPerOutputToken * (1 + margin / 100)
      }
      if (body.costPerRun !== undefined) {
        updateData.pricePerRun = body.costPerRun * (1 + margin / 100)
      }
    }

    const model = await prisma.aIModelConfig.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      model: {
        ...model,
        costPerInputToken: model.costPerInputToken ? Number(model.costPerInputToken) : null,
        costPerOutputToken: model.costPerOutputToken ? Number(model.costPerOutputToken) : null,
        costPerRun: model.costPerRun ? Number(model.costPerRun) : null,
        pricePerInputToken: model.pricePerInputToken ? Number(model.pricePerInputToken) : null,
        pricePerOutputToken: model.pricePerOutputToken ? Number(model.pricePerOutputToken) : null,
        pricePerRun: model.pricePerRun ? Number(model.pricePerRun) : null,
      },
      message: `Modell "${model.name}" erfolgreich aktualisiert`,
    })

  } catch (error) {
    console.error('Error updating AI model:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Modells' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const model = await prisma.aIModelConfig.findUnique({
      where: { id },
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Modell nicht gefunden' },
        { status: 404 }
      )
    }

    // Soft-Delete: Deaktivieren statt löschen
    await prisma.aIModelConfig.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: `Modell "${model.name}" wurde deaktiviert`,
    })

  } catch (error) {
    console.error('Error deleting AI model:', error)
    return NextResponse.json(
      { error: 'Fehler beim Deaktivieren des Modells' },
      { status: 500 }
    )
  }
}

