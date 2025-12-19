/**
 * Admin AI Models API
 * 
 * GET: Alle Modelle mit Nutzungsstatistiken abrufen
 * POST: Neues Modell hinzufügen
 * PATCH: Bulk-Update (alle Margen anpassen)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AIModelCategory, AIModelProvider } from '@prisma/client'
import { ServerAdminEvents } from '@/lib/analytics-server'

interface ModelStats {
  totalRequests: number
  totalTokens: number
  totalCostUsd: number
  totalRevenueUsd: number
  profit: number
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') as AIModelCategory | null
    const provider = searchParams.get('provider') as AIModelProvider | null
    const includeStats = searchParams.get('includeStats') === 'true'
    const days = parseInt(searchParams.get('days') || '30')

    // Hole alle Modelle
    const models = await prisma.aIModelConfig.findMany({
      where: {
        ...(category && { category }),
        ...(provider && { provider }),
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
      ],
    })

    // Hole Nutzungsstatistiken wenn gewünscht
    let modelStats: Map<string, ModelStats> = new Map()

    if (includeStats) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Hole aggregierte Statistiken pro Modell
      const stats = await prisma.aIUsageLog.groupBy({
        by: ['model'],
        where: {
          createdAt: { gte: startDate },
          success: true,
        },
        _count: true,
        _sum: {
          totalTokens: true,
          costUsd: true,
        },
      })

      // Berechne Profit für jedes Modell
      for (const stat of stats) {
        const modelConfig = models.find(m => m.modelId === stat.model || m.modelKey === stat.model)
        if (modelConfig) {
          const costUsd = Number(stat._sum.costUsd || 0)
          const revenueUsd = costUsd * (1 + modelConfig.marginPercent / 100)
          
          modelStats.set(modelConfig.modelKey, {
            totalRequests: stat._count,
            totalTokens: stat._sum.totalTokens || 0,
            totalCostUsd: costUsd,
            totalRevenueUsd: revenueUsd,
            profit: revenueUsd - costUsd,
          })
        }
      }
    }

    // Gruppiere nach Kategorie
    const grouped = {
      text: models.filter(m => m.category === 'TEXT'),
      image: models.filter(m => m.category === 'IMAGE'),
      video: models.filter(m => m.category === 'VIDEO'),
      v0: models.filter(m => m.category === 'GENERATION'),
    }

    // Füge Stats zu Modellen hinzu
    const modelsWithStats = models.map(model => ({
      ...model,
      costPerInputToken: model.costPerInputToken ? Number(model.costPerInputToken) : null,
      costPerOutputToken: model.costPerOutputToken ? Number(model.costPerOutputToken) : null,
      costPerRun: model.costPerRun ? Number(model.costPerRun) : null,
      pricePerInputToken: model.pricePerInputToken ? Number(model.pricePerInputToken) : null,
      pricePerOutputToken: model.pricePerOutputToken ? Number(model.pricePerOutputToken) : null,
      pricePerRun: model.pricePerRun ? Number(model.pricePerRun) : null,
      stats: modelStats.get(model.modelKey) || null,
    }))

    // Gesamtstatistiken
    const totalStats = {
      totalModels: models.length,
      activeModels: models.filter(m => m.isActive).length,
      byCategory: {
        text: grouped.text.length,
        image: grouped.image.length,
        video: grouped.video.length,
        v0: grouped.v0.length,
      },
      totalProfit: Array.from(modelStats.values()).reduce((sum, s) => sum + s.profit, 0),
      totalRequests: Array.from(modelStats.values()).reduce((sum, s) => sum + s.totalRequests, 0),
    }

    return NextResponse.json({
      models: modelsWithStats,
      grouped: {
        text: modelsWithStats.filter(m => m.category === 'TEXT'),
        image: modelsWithStats.filter(m => m.category === 'IMAGE'),
        video: modelsWithStats.filter(m => m.category === 'VIDEO'),
        v0: modelsWithStats.filter(m => m.category === 'GENERATION'),
      },
      stats: totalStats,
    })

  } catch (error) {
    console.error('Error fetching AI models:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Modelle' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      provider,
      modelId,
      modelKey,
      name,
      description,
      category,
      subcategory,
      costPerInputToken,
      costPerOutputToken,
      costPerRun,
      marginPercent = 40,
      avgDurationMs,
      maxTokens,
      supportsStreaming,
      isFree,
    } = body

    // Validierung
    if (!provider || !modelId || !modelKey || !name || !category) {
      return NextResponse.json(
        { error: 'Pflichtfelder: provider, modelId, modelKey, name, category' },
        { status: 400 }
      )
    }

    // Prüfe ob modelKey bereits existiert
    const existing = await prisma.aIModelConfig.findUnique({
      where: { modelKey },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Modell mit Key "${modelKey}" existiert bereits` },
        { status: 400 }
      )
    }

    // Berechne Verkaufspreise
    const calculatePrice = (cost: number | null) =>
      cost ? cost * (1 + marginPercent / 100) : null

    const model = await prisma.aIModelConfig.create({
      data: {
        provider: provider as AIModelProvider,
        modelId,
        modelKey,
        name,
        description,
        category: category as AIModelCategory,
        subcategory,
        costPerInputToken,
        costPerOutputToken,
        costPerRun,
        marginPercent,
        pricePerInputToken: calculatePrice(costPerInputToken),
        pricePerOutputToken: calculatePrice(costPerOutputToken),
        pricePerRun: calculatePrice(costPerRun),
        avgDurationMs,
        maxTokens,
        supportsStreaming: supportsStreaming ?? false,
        isFree: isFree ?? false,
        isActive: true,
      },
    })

    return NextResponse.json({
      model,
      message: `Modell "${name}" erfolgreich erstellt`,
    })

  } catch (error) {
    console.error('Error creating AI model:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Modells' },
      { status: 500 }
    )
  }
}

// Bulk-Update für alle Margen
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action, category, marginPercent } = body

    if (action === 'bulk-margin') {
      // Setze alle Margen auf einen bestimmten Wert
      if (marginPercent === undefined || marginPercent < 0 || marginPercent > 200) {
        return NextResponse.json(
          { error: 'Marge muss zwischen 0 und 200% liegen' },
          { status: 400 }
        )
      }

      // Hole alle betroffenen Modelle
      const models = await prisma.aIModelConfig.findMany({
        where: category ? { category: category as AIModelCategory } : {},
      })

      // Update jedes Modell mit neuer Marge
      let updated = 0
      for (const model of models) {
        const calculatePrice = (cost: number | null) =>
          cost ? cost * (1 + marginPercent / 100) : null

        await prisma.aIModelConfig.update({
          where: { id: model.id },
          data: {
            marginPercent,
            pricePerInputToken: calculatePrice(model.costPerInputToken ? Number(model.costPerInputToken) : null),
            pricePerOutputToken: calculatePrice(model.costPerOutputToken ? Number(model.costPerOutputToken) : null),
            pricePerRun: calculatePrice(model.costPerRun ? Number(model.costPerRun) : null),
          },
        })
        updated++
      }

      // Track bulk update event in PostHog
      await ServerAdminEvents.aiModelUpdated(
        session.user.id,
        'bulk',
        category || 'all',
        { action: 'bulk-margin', marginPercent, modelsUpdated: updated }
      )

      return NextResponse.json({
        message: `${updated} Modelle auf ${marginPercent}% Marge aktualisiert`,
        updated,
      })
    }

    return NextResponse.json(
      { error: 'Unbekannte Aktion' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error bulk updating AI models:', error)
    return NextResponse.json(
      { error: 'Fehler beim Bulk-Update' },
      { status: 500 }
    )
  }
}

