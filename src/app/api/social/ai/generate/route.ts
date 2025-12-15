import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { chatCompletion } from '@/lib/openrouter/client'
import { z } from 'zod'

// Schema für AI-Generierung
const generateSchema = z.object({
  prompt: z.string().min(10, 'Prompt zu kurz').max(1000, 'Prompt zu lang'),
  platforms: z.array(z.enum([
    'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 
    'PINTEREST', 'TWITTER', 'YOUTUBE', 'THREADS'
  ])).min(1).default(['INSTAGRAM']),
  tone: z.enum([
    'professional', 'casual', 'friendly', 'playful', 
    'inspirational', 'informative', 'promotional'
  ]).default('friendly'),
  language: z.string().default('de'),
  includeHashtags: z.boolean().default(true),
  includeEmojis: z.boolean().default(true),
  maxLength: z.number().min(50).max(2200).default(280),
  industry: z.string().optional(),
  brandVoice: z.string().optional(),
})

// POST /api/social/ai/generate - Content generieren
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = generateSchema.parse(body)
    
    // Plattform-spezifische Anweisungen
    const platformGuidelines: Record<string, string> = {
      INSTAGRAM: 'Instagram: Visuell ansprechend, Story-telling, max. 2200 Zeichen, 3-5 relevante Hashtags',
      FACEBOOK: 'Facebook: Konversational, kann länger sein, lädt zur Interaktion ein',
      LINKEDIN: 'LinkedIn: Professionell, business-fokussiert, thought leadership',
      TIKTOK: 'TikTok: Kurz, trendy, Gen-Z-Sprache, viral-tauglich',
      TWITTER: 'X/Twitter: Knackig, max. 280 Zeichen, provokativ/interessant',
      PINTEREST: 'Pinterest: Beschreibend, SEO-optimiert, Anleitungs-Stil',
      YOUTUBE: 'YouTube: Video-Beschreibung, Timestamps, Call-to-Action',
      THREADS: 'Threads: Authentisch, konversational, Community-fokussiert',
    }
    
    const toneDescriptions: Record<string, string> = {
      professional: 'professionell und geschäftlich',
      casual: 'locker und umgangssprachlich',
      friendly: 'freundlich und einladend',
      playful: 'verspielt und humorvoll',
      inspirational: 'inspirierend und motivierend',
      informative: 'informativ und lehrreich',
      promotional: 'werblich aber nicht aufdringlich',
    }
    
    const selectedPlatformGuidelines = validatedData.platforms
      .map(p => platformGuidelines[p])
      .join('\n')
    
    const systemPrompt = `Du bist ein erfahrener Social Media Manager und Content Creator für die Friseur- und Beauty-Branche.

AUFGABE: Erstelle einen Social Media Post basierend auf dem Nutzer-Prompt.

STIL & TON:
- Tonalität: ${toneDescriptions[validatedData.tone]}
- Sprache: ${validatedData.language === 'de' ? 'Deutsch' : validatedData.language}
${validatedData.industry ? `- Branche: ${validatedData.industry}` : '- Branche: Friseur/Beauty/Salon'}
${validatedData.brandVoice ? `- Markenstimme: ${validatedData.brandVoice}` : ''}

PLATTFORM-RICHTLINIEN:
${selectedPlatformGuidelines}

FORMATIERUNG:
- Maximale Länge: ${validatedData.maxLength} Zeichen
${validatedData.includeEmojis ? '- Verwende passende Emojis (nicht übertrieben)' : '- Keine Emojis verwenden'}
${validatedData.includeHashtags ? '- Füge 3-5 relevante Hashtags am Ende hinzu' : '- Keine Hashtags hinzufügen'}

AUSGABE-FORMAT:
Gib NUR den fertigen Post-Text zurück, ohne Erklärungen oder Metadaten.
Falls Hashtags gewünscht, füge sie am Ende des Posts ein.`

    const userMessage = validatedData.prompt
    
    const generatedContent = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      {
        temperature: 0.8,
        maxTokens: 500,
        userId: session.user.id,
        requestType: 'completion',
      }
    )
    
    // Hashtags extrahieren
    const hashtagRegex = /#[\wäöüÄÖÜß]+/g
    const extractedHashtags = generatedContent.match(hashtagRegex) || []
    
    // Content ohne Hashtags (für separate Speicherung)
    const contentWithoutHashtags = generatedContent
      .replace(hashtagRegex, '')
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Mehrfache Zeilenumbrüche reduzieren
    
    return NextResponse.json({
      content: generatedContent,
      contentWithoutHashtags,
      hashtags: extractedHashtags.map(h => h.substring(1)), // Ohne #
      characterCount: generatedContent.length,
      platforms: validatedData.platforms,
      tone: validatedData.tone,
      aiModel: 'openai/gpt-4o-mini', // oder aus Config
    })
  } catch (error) {
    console.error('[Social AI Generate] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Fehler bei der Content-Generierung' },
      { status: 500 }
    )
  }
}

