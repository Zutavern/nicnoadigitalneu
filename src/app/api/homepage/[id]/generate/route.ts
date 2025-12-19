import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from 'v0-sdk'
import { buildFullHomepagePrompt, buildSinglePagePrompt } from '@/lib/homepage-builder/v0-prompt-builder'
import { checkSpendingLimit } from '@/lib/stripe/metered-billing'
import { logAIUsage } from '@/lib/openrouter/usage-tracker'
import type { 
  HomepageTemplate, 
  HomepageDesignStyle, 
  HomepageContactData,
  HomepagePage 
} from '@/lib/homepage-builder'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/homepage/[id]/generate
 * Startet die V0-Generierung für ein Projekt
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { pageSlug, customPrompt } = body as { pageSlug?: string; customPrompt?: string }

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

    // Spending-Limit prüfen (nur bei echter V0 API)
    const v0ApiKey = process.env.V0_API_KEY
    const useV0Api = process.env.USE_V0_API === 'true'
    
    if (v0ApiKey && useV0Api) {
      const limitCheck = await checkSpendingLimit(session.user.id)
      if (!limitCheck.canUseAI) {
        return NextResponse.json({ 
          error: 'AI-Limit erreicht',
          message: limitCheck.message,
          limitReached: true
        }, { status: 403 })
      }
    }

    // Status auf GENERATING setzen
    await prisma.homepageProject.update({
      where: { id },
      data: { status: 'GENERATING', v0Error: null }
    })

    // Benutzer-Rolle ermitteln
    const userRole = session.user.role === 'SALON_OWNER' ? 'SALON_OWNER' : 'STYLIST'

    // Kontext für Prompt-Builder erstellen
    const promptContext = {
      templateType: project.templateType as HomepageTemplate,
      designStyle: project.designStyle as HomepageDesignStyle,
      contactData: (project.contactData as HomepageContactData) || {},
      pages: (project.pages as HomepagePage[]) || [],
      brandingColor: project.brandingColor || '#10b981',
      logoUrl: project.brandingLogoUrl || undefined,
      forRole: userRole as 'STYLIST' | 'SALON_OWNER'
    }

    let prompt: string
    let targetPage: HomepagePage | undefined

    if (pageSlug) {
      // Nur eine einzelne Seite generieren
      targetPage = promptContext.pages.find(p => p.slug === pageSlug)
      if (!targetPage) {
        return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 })
      }
      prompt = buildSinglePagePrompt(promptContext, targetPage, customPrompt)
    } else {
      // Komplette Homepage generieren
      prompt = buildFullHomepagePrompt(promptContext)
    }

    // Mock-Generierung verwenden wenn:
    // - Kein API-Key vorhanden
    // - USE_V0_API nicht auf 'true' gesetzt (Standard: Mock)
    if (!v0ApiKey || !useV0Api) {
      console.log('Verwende Mock-Generierung (V0 API deaktiviert oder kein Key)')
      
      const mockGeneratedCode = generateMockCode(promptContext, targetPage)
      
      // Seiten aktualisieren
      const updatedPages = promptContext.pages.map(page => {
        if (!pageSlug || page.slug === pageSlug) {
          return {
            ...page,
            generatedCode: mockGeneratedCode,
            generatedAt: new Date().toISOString(),
            isGenerated: true
          }
        }
        return page
      })

      await prisma.homepageProject.update({
        where: { id },
        data: {
          pages: updatedPages,
          status: 'READY',
          v0GenerationId: `mock-${Date.now()}`
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Seiten erfolgreich generiert (Preview-Modus)',
        isMock: true
      })
    }

    // Echter V0 API-Aufruf mit dem offiziellen SDK
    try {
      console.log('=== V0 GENERATION START ===')
      console.log('Project ID:', id)
      console.log('Page Slug:', pageSlug || 'ALL PAGES')
      console.log('API Key vorhanden:', !!v0ApiKey)
      console.log('API Key Prefix:', v0ApiKey?.substring(0, 10) + '...')
      console.log('Prompt Länge:', prompt.length, 'Zeichen')
      console.log('Prompt Preview:', prompt.substring(0, 500) + '...')
      
      // V0 Client erstellen
      console.log('Erstelle V0 Client...')
      const v0Client = createClient({
        apiKey: v0ApiKey
      })
      console.log('V0 Client erstellt')

      // Chat erstellen und Code generieren
      console.log('Sende Chat-Request an V0...')
      const chatRequest = {
        message: prompt,
        system: `Du bist ein erfahrener Web-Entwickler, spezialisiert auf moderne Friseur- und Salon-Websites. 
Erstelle professionellen, responsiven Code mit Next.js 14+ App Router und Tailwind CSS. 
Alle Texte müssen auf Deutsch sein. 
Die Websites müssen DSGVO-konform sein und alle rechtlich notwendigen Seiten (Impressum, Datenschutz) enthalten.`,
        chatPrivacy: 'private' as const,
        modelConfiguration: {
          modelId: 'v0-1.5-md',
          imageGenerations: true
        }
      }
      console.log('Chat Request Config:', JSON.stringify({
        ...chatRequest,
        message: chatRequest.message.substring(0, 100) + '...',
        system: chatRequest.system.substring(0, 100) + '...'
      }, null, 2))

      const chat = await v0Client.chats.create(chatRequest)
      
      console.log('=== V0 RESPONSE ===')
      console.log('Chat Object:', JSON.stringify(chat, null, 2))

      const generationId = chat.id
      const demoUrl = chat.latestVersion?.demoUrl
      const webUrl = chat.webUrl

      console.log('Parsed Values:')
      console.log('- Generation ID:', generationId)
      console.log('- Demo URL:', demoUrl)
      console.log('- Web URL:', webUrl)

      // Seiten mit generiertem Code und URLs aktualisieren
      const updatedPages = promptContext.pages.map(page => {
        if (!pageSlug || page.slug === pageSlug) {
          return {
            ...page,
            generatedCode: `// V0 Generated Component
// Demo URL: ${demoUrl}
// Edit URL: ${webUrl}

// Der generierte Code kann unter folgenden URLs angesehen werden:
// Preview: ${demoUrl}
// Bearbeiten: ${webUrl}
`,
            generatedAt: new Date().toISOString(),
            isGenerated: true,
            v0DemoUrl: demoUrl,
            v0WebUrl: webUrl,
            v0ChatId: generationId // Chat ID für weitere Prompts speichern
          }
        }
        return page
      })

      await prisma.homepageProject.update({
        where: { id },
        data: {
          pages: updatedPages,
          status: 'READY',
          v0GenerationId: generationId
        }
      })

      // Usage in DB loggen und Metered Billing tracken
      try {
        await logAIUsage({
          userId: session.user.id,
          userType: session.user.role === 'SALON_OWNER' ? 'salon_owner' : 'chair_renter',
          requestType: 'homepage_generation',
          model: 'v0-homepage-generate', // Muss mit AIModelConfig.modelKey übereinstimmen
          provider: 'vercel',
          feature: 'homepage_generation',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costUsd: 0, // Wird aus AIModelConfig berechnet (pricePerRun)
          responseTimeMs: 0,
          success: true,
          metadata: {
            projectId: id,
            pageSlug: pageSlug || 'all',
            generationId,
            v0Model: 'v0-1.5-md',
          }
        })
        console.log('V0 Homepage Generation logged successfully')
      } catch (trackError) {
        // Tracking-Fehler sollten die Generierung nicht blockieren
        console.error('Error logging V0 usage:', trackError)
      }

      return NextResponse.json({
        success: true,
        message: 'Generierung abgeschlossen',
        generationId,
        demoUrl,
        webUrl
      })

    } catch (v0Error: unknown) {
      console.error('=== V0 API ERROR ===')
      console.error('Error Type:', typeof v0Error)
      console.error('Error:', v0Error)
      
      // Detailliertes Error Logging
      if (v0Error instanceof Error) {
        console.error('Error Name:', v0Error.name)
        console.error('Error Message:', v0Error.message)
        console.error('Error Stack:', v0Error.stack)
        
        // Check for response errors (from fetch)
        if ('cause' in v0Error) {
          console.error('Error Cause:', v0Error.cause)
        }
      }
      
      // Falls es ein Response Error ist
      if (v0Error && typeof v0Error === 'object' && 'response' in v0Error) {
        const responseError = v0Error as { response?: { status?: number; statusText?: string; data?: unknown } }
        console.error('Response Status:', responseError.response?.status)
        console.error('Response StatusText:', responseError.response?.statusText)
        console.error('Response Data:', responseError.response?.data)
      }
      
      const errorMessage = v0Error instanceof Error ? v0Error.message : JSON.stringify(v0Error)
      
      await prisma.homepageProject.update({
        where: { id },
        data: {
          status: 'ERROR',
          v0Error: errorMessage.substring(0, 500) // Limit error length
        }
      })

      return NextResponse.json(
        { 
          error: 'Fehler bei der V0-Generierung', 
          details: errorMessage,
          errorType: v0Error instanceof Error ? v0Error.name : typeof v0Error
        },
        { status: 500 }
      )
    }

  } catch (error: unknown) {
    console.error('=== GENERAL GENERATE ERROR ===')
    console.error('Error:', error)
    
    if (error instanceof Error) {
      console.error('Error Name:', error.name)
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Fehler bei der Generierung',
        details: error instanceof Error ? error.message : JSON.stringify(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Generiert schönen HTML-Preview-Code für die Live-Vorschau
 */
function generateMockCode(
  context: { brandingColor: string; contactData: HomepageContactData; forRole: string },
  targetPage?: HomepagePage
): string {
  const pageName = targetPage?.title || 'Startseite'
  const businessName = context.forRole === 'SALON_OWNER'
    ? context.contactData.salonName || context.contactData.name || 'Mein Salon'
    : context.contactData.name || 'Mein Studio'
  
  const street = context.contactData.street || 'Musterstraße 1'
  const city = context.contactData.city || 'Berlin'
  const zipCode = context.contactData.zipCode || '10115'
  const phone = context.contactData.phone || '+49 30 123456'
  const email = context.contactData.email || 'info@beispiel.de'
  const primaryColor = context.brandingColor || '#10b981'

  // Generiere vollständiges HTML für iframe-Preview
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} - ${pageName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .brand-bg { background-color: ${primaryColor}; }
    .brand-bg-light { background-color: ${primaryColor}15; }
    .brand-text { color: ${primaryColor}; }
    .brand-border { border-color: ${primaryColor}; }
  </style>
</head>
<body class="bg-white">
  <!-- Navigation -->
  <nav class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="text-xl font-bold">${businessName}</div>
      <div class="hidden md:flex items-center gap-8">
        <span class="text-gray-600 hover:text-gray-900 transition cursor-pointer">Start</span>
        <span class="text-gray-600 hover:text-gray-900 transition cursor-pointer">Leistungen</span>
        <span class="text-gray-600 hover:text-gray-900 transition cursor-pointer">Über uns</span>
        <span class="text-gray-600 hover:text-gray-900 transition cursor-pointer">Kontakt</span>
        <button class="brand-bg text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition">
          Termin buchen
        </button>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="min-h-screen flex items-center justify-center brand-bg-light pt-20">
    <div class="text-center px-6 max-w-3xl">
      <span class="inline-block brand-bg text-white text-sm px-4 py-1 rounded-full mb-6">
        ✨ Willkommen
      </span>
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        ${businessName}
      </h1>
      <p class="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
        ${context.forRole === 'SALON_OWNER' 
          ? 'Ihr professioneller Salon für stilvolle Looks und entspannte Momente.' 
          : 'Ihr persönlicher Stylist für individuelle Beratung und kreative Looks.'}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="brand-bg text-white px-8 py-4 rounded-full font-medium text-lg hover:opacity-90 transition shadow-lg">
          Jetzt Termin buchen
        </button>
        <button class="bg-white text-gray-900 px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-50 transition border border-gray-200">
          Mehr erfahren
        </button>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section class="py-24 px-6">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <span class="brand-text text-sm font-medium uppercase tracking-wider">Unsere Leistungen</span>
        <h2 class="text-4xl font-bold text-gray-900 mt-3">Was wir für Sie tun</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
          <div class="brand-bg w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl mb-6">✂️</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Schnitt & Styling</h3>
          <p class="text-gray-600">Professioneller Haarschnitt und individuelles Styling für jeden Anlass.</p>
        </div>
        <div class="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
          <div class="brand-bg w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl mb-6">🎨</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Färbung & Highlights</h3>
          <p class="text-gray-600">Von natürlichen Nuancen bis zu kreativen Farben – wir verwirklichen Ihre Wünsche.</p>
        </div>
        <div class="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
          <div class="brand-bg w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl mb-6">💆</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Pflege & Wellness</h3>
          <p class="text-gray-600">Entspannende Behandlungen für Haar und Kopfhaut mit Premium-Produkten.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="brand-bg py-20 px-6">
    <div class="max-w-4xl mx-auto text-center text-white">
      <h2 class="text-4xl font-bold mb-6">Bereit für Ihren neuen Look?</h2>
      <p class="text-xl opacity-90 mb-10">Buchen Sie jetzt Ihren Termin und lassen Sie sich von uns verwöhnen.</p>
      <button class="bg-white text-gray-900 px-10 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition shadow-lg">
        Termin vereinbaren
      </button>
    </div>
  </section>

  <!-- Contact Section -->
  <section class="py-24 px-6 bg-gray-50">
    <div class="max-w-6xl mx-auto">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span class="brand-text text-sm font-medium uppercase tracking-wider">Kontakt</span>
          <h2 class="text-4xl font-bold text-gray-900 mt-3 mb-6">Besuchen Sie uns</h2>
          <div class="space-y-4 text-gray-600">
            <p class="flex items-center gap-3">
              <span class="brand-bg text-white w-10 h-10 rounded-full flex items-center justify-center">📍</span>
              ${street}, ${zipCode} ${city}
            </p>
            <p class="flex items-center gap-3">
              <span class="brand-bg text-white w-10 h-10 rounded-full flex items-center justify-center">📞</span>
              ${phone}
            </p>
            <p class="flex items-center gap-3">
              <span class="brand-bg text-white w-10 h-10 rounded-full flex items-center justify-center">✉️</span>
              ${email}
            </p>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-lg">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">Öffnungszeiten</h3>
          <div class="space-y-3 text-gray-600">
            <div class="flex justify-between"><span>Montag - Freitag</span><span class="font-medium">09:00 - 19:00</span></div>
            <div class="flex justify-between"><span>Samstag</span><span class="font-medium">09:00 - 16:00</span></div>
            <div class="flex justify-between"><span>Sonntag</span><span class="text-gray-400">Geschlossen</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-12 px-6">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="text-xl font-bold">${businessName}</div>
      <div class="flex gap-6 text-gray-400">
        <span class="hover:text-white transition cursor-pointer">Impressum</span>
        <span class="hover:text-white transition cursor-pointer">Datenschutz</span>
        <span class="hover:text-white transition cursor-pointer">AGB</span>
      </div>
      <div class="text-gray-400 text-sm">© ${new Date().getFullYear()} ${businessName}</div>
    </div>
  </footer>
</body>
</html>`
}
