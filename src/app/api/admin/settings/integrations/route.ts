import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clearOpenRouterConfigCache } from '@/lib/openrouter/client'
import { clearTranslationApiCache } from '@/lib/translation/translation-service'

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

    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: {
        // OpenRouter
        openRouterApiKey: true,
        openRouterEnabled: true,
        openRouterDefaultModel: true,
        openRouterSiteUrl: true,
        openRouterSiteName: true,
        
        // DeepL
        deeplApiKey: true,
        translationProvider: true,
        
        // Pusher
        pusherAppId: true,
        pusherKey: true,
        pusherSecret: true,
        pusherCluster: true,
        pusherEnabled: true,
        
        // PostHog
        posthogApiKey: true,
        posthogHost: true,
        posthogPersonalApiKey: true,
        
        // Daily.co
        dailyApiKey: true,
        dailyEnabled: true,
      },
    })

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: 'default' },
        select: {
          openRouterApiKey: true,
          openRouterEnabled: true,
          openRouterDefaultModel: true,
          openRouterSiteUrl: true,
          openRouterSiteName: true,
          deeplApiKey: true,
          translationProvider: true,
          pusherAppId: true,
          pusherKey: true,
          pusherSecret: true,
          pusherCluster: true,
          pusherEnabled: true,
          posthogApiKey: true,
          posthogHost: true,
          posthogPersonalApiKey: true,
          dailyApiKey: true,
          dailyEnabled: true,
        },
      })
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
      
      // Daily.co
      dailyApiKey: maskKey(settings.dailyApiKey),
      dailyEnabled: settings.dailyEnabled,
      
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

    // Daily.co
    if (body.dailyApiKey !== undefined) {
      updateData.dailyApiKey = body.dailyApiKey || null
    }
    if (body.dailyEnabled !== undefined) {
      updateData.dailyEnabled = body.dailyEnabled
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

