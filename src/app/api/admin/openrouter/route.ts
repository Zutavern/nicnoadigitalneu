import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { clearOpenRouterConfigCache } from '@/lib/openrouter/client'

const MASKED_KEY = '••••••••••••••••'

// GET: OpenRouter Konfiguration abrufen
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const settings = await prisma.platformSettings.findFirst({
      select: {
        openRouterApiKey: true,
        openRouterEnabled: true,
        openRouterDefaultModel: true,
        openRouterSiteUrl: true,
        openRouterSiteName: true,
      },
    })

    if (!settings) {
      return NextResponse.json({
        openRouterApiKey: null,
        openRouterEnabled: false,
        openRouterDefaultModel: 'openai/gpt-4o-mini',
        openRouterSiteUrl: 'https://nicnoa.de',
        openRouterSiteName: 'NICNOA Platform',
      })
    }

    // API Key maskieren
    return NextResponse.json({
      openRouterApiKey: settings.openRouterApiKey ? MASKED_KEY : null,
      openRouterEnabled: settings.openRouterEnabled,
      openRouterDefaultModel: settings.openRouterDefaultModel || 'openai/gpt-4o-mini',
      openRouterSiteUrl: settings.openRouterSiteUrl || 'https://nicnoa.de',
      openRouterSiteName: settings.openRouterSiteName || 'NICNOA Platform',
      hasApiKey: !!settings.openRouterApiKey,
    })
  } catch (error) {
    console.error('Error fetching OpenRouter config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT: OpenRouter Konfiguration aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const {
      openRouterApiKey,
      openRouterEnabled,
      openRouterDefaultModel,
      openRouterSiteUrl,
      openRouterSiteName,
    } = body

    // Update-Daten vorbereiten
    const updateData: Record<string, unknown> = {}

    // API Key nur aktualisieren wenn nicht maskiert
    if (openRouterApiKey !== undefined && openRouterApiKey !== MASKED_KEY) {
      updateData.openRouterApiKey = openRouterApiKey || null
    }

    if (openRouterEnabled !== undefined) {
      updateData.openRouterEnabled = openRouterEnabled
    }

    if (openRouterDefaultModel !== undefined) {
      updateData.openRouterDefaultModel = openRouterDefaultModel
    }

    if (openRouterSiteUrl !== undefined) {
      updateData.openRouterSiteUrl = openRouterSiteUrl || null
    }

    if (openRouterSiteName !== undefined) {
      updateData.openRouterSiteName = openRouterSiteName || null
    }

    // Upsert: Erstellen falls nicht vorhanden
    const updated = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
      select: {
        openRouterApiKey: true,
        openRouterEnabled: true,
        openRouterDefaultModel: true,
        openRouterSiteUrl: true,
        openRouterSiteName: true,
      },
    })

    // Cache leeren
    clearOpenRouterConfigCache()

    // Maskierte Response zurückgeben
    return NextResponse.json({
      openRouterApiKey: updated.openRouterApiKey ? MASKED_KEY : null,
      openRouterEnabled: updated.openRouterEnabled,
      openRouterDefaultModel: updated.openRouterDefaultModel,
      openRouterSiteUrl: updated.openRouterSiteUrl,
      openRouterSiteName: updated.openRouterSiteName,
      hasApiKey: !!updated.openRouterApiKey,
    })
  } catch (error) {
    console.error('Error updating OpenRouter config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Konfiguration' },
      { status: 500 }
    )
  }
}

// POST: API Key testen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { apiKey } = body

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key fehlt' }, { status: 400 })
    }

    // Test-Request an OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({
        valid: false,
        error: errorData.error?.message || `API Fehler: ${response.status}`,
      })
    }

    const data = await response.json()
    const modelCount = data.data?.length || 0

    return NextResponse.json({
      valid: true,
      modelCount,
      message: `API Key gültig. ${modelCount} Modelle verfügbar.`,
    })
  } catch (error) {
    console.error('Error testing OpenRouter API key:', error)
    return NextResponse.json({
      valid: false,
      error: 'Verbindungsfehler zu OpenRouter',
    })
  }
}


