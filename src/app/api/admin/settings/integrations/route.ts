import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clearOpenRouterConfigCache } from '@/lib/openrouter/client'
import { clearTranslationApiCache } from '@/lib/translation/translation-service'

// Interface für Settings mit seven.io Feldern (TypeScript Cache workaround)
interface IntegrationSettingsResult {
  openRouterApiKey: string | null
  openRouterEnabled: boolean
  openRouterDefaultModel: string | null
  openRouterSiteUrl: string | null
  openRouterSiteName: string | null
  deeplApiKey: string | null
  translationProvider: string | null
  pusherAppId: string | null
  pusherKey: string | null
  pusherSecret: string | null
  pusherCluster: string | null
  pusherEnabled: boolean
  posthogApiKey: string | null
  posthogHost: string | null
  posthogPersonalApiKey: string | null
  posthogProjectId: string | null
  posthogEnabled: boolean
  dailyApiKey: string | null
  dailyEnabled: boolean
  resendApiKey: string | null
  resendEnabled: boolean
  resendFromEmail: string | null
  resendFromName: string | null
  resendWebhookSecret: string | null
  sevenIoApiKey: string | null
  sevenIoEnabled: boolean
  sevenIoSenderId: string | null
  sevenIoTestNumbers: string | null
}

// GET /api/admin/settings/integrations
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    // Alle Felder aus der Datenbank laden
    const rawSettings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
    })

    let settings: IntegrationSettingsResult

    if (!rawSettings) {
      const created = await prisma.platformSettings.create({
        data: { id: 'default' },
      })
      settings = created as unknown as IntegrationSettingsResult
    } else {
      settings = rawSettings as unknown as IntegrationSettingsResult
    }

    // API Keys maskieren
    const maskKey = (key: string | null): string | null => {
      if (!key) return null
      if (key.length <= 8) return '••••••••'
      return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
    }

    return NextResponse.json({
      // OpenRouter
      openRouterApiKey: maskKey(settings.openRouterApiKey),
      openRouterEnabled: settings.openRouterEnabled,
      openRouterDefaultModel: settings.openRouterDefaultModel,
      openRouterSiteUrl: settings.openRouterSiteUrl,
      openRouterSiteName: settings.openRouterSiteName,
      
      // DeepL
      deeplApiKey: maskKey(settings.deeplApiKey),
      translationProvider: settings.translationProvider,
      
      // Pusher
      pusherAppId: maskKey(settings.pusherAppId),
      pusherKey: maskKey(settings.pusherKey),
      pusherSecret: maskKey(settings.pusherSecret),
      pusherCluster: settings.pusherCluster,
      pusherEnabled: settings.pusherEnabled,
      
      // PostHog
      posthogApiKey: maskKey(settings.posthogApiKey),
      posthogHost: settings.posthogHost,
      posthogPersonalApiKey: maskKey(settings.posthogPersonalApiKey),
      posthogProjectId: settings.posthogProjectId,
      posthogEnabled: settings.posthogEnabled,
      
      // Daily.co
      dailyApiKey: maskKey(settings.dailyApiKey),
      dailyEnabled: settings.dailyEnabled,
      
      // Resend
      resendApiKey: maskKey(settings.resendApiKey),
      resendEnabled: settings.resendEnabled,
      resendFromEmail: settings.resendFromEmail,
      resendFromName: settings.resendFromName,
      resendWebhookSecret: maskKey(settings.resendWebhookSecret),
      
      // seven.io SMS
      sevenIoApiKey: maskKey(settings.sevenIoApiKey),
      sevenIoEnabled: settings.sevenIoEnabled ?? false,
      sevenIoSenderId: settings.sevenIoSenderId,
      sevenIoTestNumbers: settings.sevenIoTestNumbers,
      
      // Stripe (aus env)
      stripeConfigured: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    })
  } catch (error) {
    console.error('Error fetching integration settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Integrationen' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings/integrations
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    // OpenRouter
    if (body.openRouterApiKey !== undefined) {
      updateData.openRouterApiKey = body.openRouterApiKey || null
    }
    if (body.openRouterEnabled !== undefined) {
      updateData.openRouterEnabled = body.openRouterEnabled
    }
    if (body.openRouterDefaultModel !== undefined) {
      updateData.openRouterDefaultModel = body.openRouterDefaultModel || null
    }
    if (body.openRouterSiteUrl !== undefined) {
      updateData.openRouterSiteUrl = body.openRouterSiteUrl || null
    }
    if (body.openRouterSiteName !== undefined) {
      updateData.openRouterSiteName = body.openRouterSiteName || null
    }

    // DeepL
    if (body.deeplApiKey !== undefined) {
      updateData.deeplApiKey = body.deeplApiKey || null
    }
    if (body.translationProvider !== undefined) {
      updateData.translationProvider = body.translationProvider || 'auto'
    }

    // Pusher
    if (body.pusherAppId !== undefined) {
      updateData.pusherAppId = body.pusherAppId || null
    }
    if (body.pusherKey !== undefined) {
      updateData.pusherKey = body.pusherKey || null
    }
    if (body.pusherSecret !== undefined) {
      updateData.pusherSecret = body.pusherSecret || null
    }
    if (body.pusherCluster !== undefined) {
      updateData.pusherCluster = body.pusherCluster || 'eu'
    }
    if (body.pusherEnabled !== undefined) {
      updateData.pusherEnabled = body.pusherEnabled
    }

    // PostHog
    if (body.posthogApiKey !== undefined) {
      updateData.posthogApiKey = body.posthogApiKey || null
    }
    if (body.posthogHost !== undefined) {
      updateData.posthogHost = body.posthogHost || null
    }
    if (body.posthogPersonalApiKey !== undefined) {
      updateData.posthogPersonalApiKey = body.posthogPersonalApiKey || null
    }
    if (body.posthogProjectId !== undefined) {
      updateData.posthogProjectId = body.posthogProjectId || null
    }
    if (body.posthogEnabled !== undefined) {
      updateData.posthogEnabled = body.posthogEnabled
    }

    // Daily.co
    if (body.dailyApiKey !== undefined) {
      updateData.dailyApiKey = body.dailyApiKey || null
    }
    if (body.dailyEnabled !== undefined) {
      updateData.dailyEnabled = body.dailyEnabled
    }

    // Resend
    if (body.resendApiKey !== undefined) {
      updateData.resendApiKey = body.resendApiKey || null
    }
    if (body.resendEnabled !== undefined) {
      updateData.resendEnabled = body.resendEnabled
    }
    if (body.resendFromEmail !== undefined) {
      updateData.resendFromEmail = body.resendFromEmail || null
    }
    if (body.resendFromName !== undefined) {
      updateData.resendFromName = body.resendFromName || null
    }
    if (body.resendWebhookSecret !== undefined) {
      updateData.resendWebhookSecret = body.resendWebhookSecret || null
    }

    // seven.io SMS
    if (body.sevenIoApiKey !== undefined) {
      updateData.sevenIoApiKey = body.sevenIoApiKey || null
    }
    if (body.sevenIoEnabled !== undefined) {
      updateData.sevenIoEnabled = body.sevenIoEnabled
    }
    if (body.sevenIoSenderId !== undefined) {
      updateData.sevenIoSenderId = body.sevenIoSenderId || 'NICNOA'
    }
    if (body.sevenIoTestNumbers !== undefined) {
      updateData.sevenIoTestNumbers = body.sevenIoTestNumbers || null
    }

    // Update oder Create
    await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: { id: 'default', ...updateData },
    })

    // Caches leeren
    clearOpenRouterConfigCache()
    clearTranslationApiCache()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating integration settings:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Integrationen' },
      { status: 500 }
    )
  }
}

