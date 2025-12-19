import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from 'v0-sdk'
import { checkSpendingLimit } from '@/lib/stripe/metered-billing'
import { logAIUsage } from '@/lib/openrouter/usage-tracker'
import type { HomepagePage } from '@/lib/homepage-builder'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/homepage/[id]/prompt
 * Sendet einen Prompt an V0 für eine bestimmte Seite
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { pageSlug, prompt } = body as { pageSlug: string; prompt: string }

    if (!pageSlug || !prompt) {
      return NextResponse.json({ error: 'pageSlug und prompt erforderlich' }, { status: 400 })
    }

    // Projekt laden
    const project = await prisma.homepageProject.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 })
    }

    if (project.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    // V0 API Key prüfen
    const v0ApiKey = process.env.V0_API_KEY
    if (!v0ApiKey) {
      return NextResponse.json({ error: 'V0 API nicht konfiguriert' }, { status: 500 })
    }

    // Spending-Limit prüfen
    const limitCheck = await checkSpendingLimit(session.user.id)
    if (!limitCheck.canUseAI) {
      return NextResponse.json({ 
        error: 'AI-Limit erreicht',
        message: limitCheck.message,
        limitReached: true
      }, { status: 403 })
    }

    // Seite finden
    const pages = (project.pages as HomepagePage[]) || []
    const pageIndex = pages.findIndex(p => p.slug === pageSlug)
    
    if (pageIndex === -1) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
    }

    const page = pages[pageIndex]

    // V0 Client erstellen
    const v0 = createClient({ apiKey: v0ApiKey })

    let chat
    let demoUrl: string | undefined
    let webUrl: string | undefined
    let chatId: string

    console.log('=== V0 PROMPT ===')
    console.log('Page:', pageSlug)
    console.log('Existing Chat ID:', page.v0ChatId)
    console.log('Prompt:', prompt)

    if (page.v0ChatId) {
      // Bestehenden Chat aktualisieren
      console.log('Sending message to existing chat...')
      chat = await v0.chats.sendMessage({
        chatId: page.v0ChatId,
        message: prompt
      })
      chatId = page.v0ChatId
    } else {
      // Neuen Chat erstellen
      console.log('Creating new chat...')
      chat = await v0.chats.create({
        message: prompt,
        system: `Du bist ein erfahrener Web-Entwickler für Friseur- und Salon-Websites.
Erstelle professionellen, responsiven Code mit Next.js und Tailwind CSS.
Alle Texte müssen auf Deutsch sein.
Nutze moderne UI-Patterns und achte auf Barrierefreiheit.`,
        chatPrivacy: 'private',
        modelConfiguration: {
          modelId: 'v0-1.5-md',
          imageGenerations: true
        }
      })
      chatId = chat.id
    }

    console.log('Chat Response:', JSON.stringify(chat, null, 2))

    // URLs extrahieren
    demoUrl = chat.latestVersion?.demoUrl
    webUrl = chat.webUrl

    // Seite aktualisieren
    const updatedPages = [...pages]
    updatedPages[pageIndex] = {
      ...page,
      v0DemoUrl: demoUrl,
      v0WebUrl: webUrl,
      v0ChatId: chatId,
      generatedAt: new Date().toISOString(),
      isGenerated: true
    }

    await prisma.homepageProject.update({
      where: { id },
      data: {
        pages: updatedPages,
        status: 'READY'
      }
    })

    // Usage in DB loggen und Metered Billing tracken
    try {
      await logAIUsage({
        userId: session.user.id,
        userType: session.user.role === 'SALON_OWNER' ? 'salon_owner' : 'chair_renter',
        requestType: 'homepage_prompt',
        model: 'v0-homepage-prompt', // Muss mit AIModelConfig.modelKey übereinstimmen
        provider: 'vercel',
        feature: 'homepage_prompt',
        inputTokens: prompt.length, // Approximation basierend auf Prompt-Länge
        outputTokens: 0,
        totalTokens: prompt.length,
        costUsd: 0, // Wird aus AIModelConfig berechnet (pricePerRun)
        responseTimeMs: 0,
        success: true,
        metadata: {
          projectId: id,
          pageSlug,
          chatId,
          promptLength: prompt.length,
          v0Model: 'v0-1.5-md',
        }
      })
      console.log('V0 Homepage Prompt logged successfully')
    } catch (trackError) {
      // Tracking-Fehler sollten das Prompting nicht blockieren
      console.error('Error logging V0 prompt usage:', trackError)
    }

    return NextResponse.json({
      success: true,
      demoUrl,
      webUrl,
      chatId
    })

  } catch (error: unknown) {
    console.error('=== PROMPT ERROR ===')
    console.error('Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Prompting',
        details: error instanceof Error ? error.message : 'Unbekannt'
      },
      { status: 500 }
    )
  }
}

