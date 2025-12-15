import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { chatCompletion } from '@/lib/openrouter/client'
import { z } from 'zod'

// Schema für Hashtag-Vorschläge
const hashtagSchema = z.object({
  content: z.string().min(1).max(2500).optional(),
  topic: z.string().min(1).max(200).optional(),
  industry: z.string().default('Friseur/Beauty/Salon'),
  platform: z.enum([
    'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 
    'PINTEREST', 'TWITTER', 'YOUTUBE', 'THREADS'
  ]).default('INSTAGRAM'),
  count: z.number().min(3).max(30).default(15),
  includeNiche: z.boolean().default(true),
  includeTrending: z.boolean().default(true),
  language: z.string().default('de'),
}).refine(data => data.content || data.topic, {
  message: 'Entweder content oder topic muss angegeben werden',
})

// POST /api/social/ai/hashtags - Hashtag-Vorschläge generieren
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = hashtagSchema.parse(body)
    
    const platformGuidelines: Record<string, string> = {
      INSTAGRAM: '3-5 hochrelevante + 5-10 mittlere Reichweite + einige Nischen-Hashtags',
      FACEBOOK: 'Weniger Hashtags (3-5), fokussiert auf Kategorien',
      LINKEDIN: 'Professionelle, branchen-spezifische Hashtags (3-5)',
      TIKTOK: 'Trendige, virale Hashtags + Nischen-Tags',
      TWITTER: '1-3 relevante Hashtags, nicht mehr',
      PINTEREST: 'SEO-fokussierte Beschreibungs-Tags',
      YOUTUBE: 'Keyword-fokussierte Tags für Video-SEO',
      THREADS: 'Konversations-bezogene Tags (2-4)',
    }
    
    const systemPrompt = `Du bist ein Social Media Hashtag-Experte für die ${validatedData.industry}-Branche.

AUFGABE: Generiere ${validatedData.count} relevante Hashtags für ${validatedData.platform}.

PLATTFORM-RICHTLINIE: ${platformGuidelines[validatedData.platform]}

KATEGORIEN:
${validatedData.includeNiche ? '- Nischen-Hashtags (spezifisch, weniger Konkurrenz)' : ''}
${validatedData.includeTrending ? '- Trendige/Populäre Hashtags (hohe Reichweite)' : ''}
- Branchen-spezifische Hashtags
- Lokale/Regionale Hashtags (falls passend)

SPRACHE: ${validatedData.language === 'de' ? 'Deutsch (deutsche und englische Hashtags gemischt)' : validatedData.language}

AUSGABE-FORMAT:
Gib die Hashtags als JSON-Array zurück, gruppiert nach Kategorie:
{
  "popular": ["hashtag1", "hashtag2"],
  "niche": ["hashtag3", "hashtag4"],
  "industry": ["hashtag5", "hashtag6"],
  "trending": ["hashtag7", "hashtag8"]
}

Gib NUR das JSON zurück, keine Erklärungen.`

    const userMessage = validatedData.content 
      ? `Basierend auf diesem Content:\n${validatedData.content}`
      : `Für das Thema: ${validatedData.topic}`
    
    const response = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      {
        temperature: 0.7,
        maxTokens: 500,
        userId: session.user.id,
        requestType: 'completion',
      }
    )
    
    // JSON parsen
    let hashtags: Record<string, string[]>
    try {
      // Versuche JSON zu extrahieren
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        hashtags = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: Hashtags aus Text extrahieren
        const extractedTags = response.match(/#?[\wäöüÄÖÜß]+/g) || []
        hashtags = {
          all: extractedTags.map(t => t.replace('#', '')).filter(t => t.length > 2),
        }
      }
    } catch {
      // Fallback bei Parse-Fehler
      const extractedTags = response.match(/#?[\wäöüÄÖÜß]+/g) || []
      hashtags = {
        all: extractedTags.map(t => t.replace('#', '')).filter(t => t.length > 2),
      }
    }
    
    // Alle Hashtags flach zurückgeben
    const allHashtags = Object.values(hashtags).flat()
    
    return NextResponse.json({
      hashtags,
      all: allHashtags,
      formatted: allHashtags.map(h => `#${h}`).join(' '),
      count: allHashtags.length,
      platform: validatedData.platform,
    })
  } catch (error) {
    console.error('[Social AI Hashtags] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Fehler bei der Hashtag-Generierung' },
      { status: 500 }
    )
  }
}

