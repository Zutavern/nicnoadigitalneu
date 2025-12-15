import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { chatCompletion } from '@/lib/openrouter/client'
import { z } from 'zod'

// Schema für Content-Verbesserung
const improveSchema = z.object({
  content: z.string().min(1, 'Content erforderlich').max(2500),
  action: z.enum([
    'improve',        // Allgemein verbessern
    'shorten',        // Kürzen
    'expand',         // Erweitern
    'professional',   // Professioneller machen
    'casual',         // Lockerer machen
    'engaging',       // Mehr Engagement erzeugen
    'seo',            // SEO-optimieren
    'emoji',          // Emojis hinzufügen/optimieren
    'hashtags',       // Hashtags verbessern
    'cta',            // Call-to-Action hinzufügen
  ]).default('improve'),
  platform: z.enum([
    'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 
    'PINTEREST', 'TWITTER', 'YOUTUBE', 'THREADS'
  ]).optional(),
  targetLength: z.number().min(50).max(2200).optional(),
})

// POST /api/social/ai/improve - Content verbessern
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = improveSchema.parse(body)
    
    const actionPrompts: Record<string, string> = {
      improve: 'Verbessere den folgenden Social Media Post. Mache ihn ansprechender, klarer und wirkungsvoller.',
      shorten: `Kürze den folgenden Text auf ${validatedData.targetLength || 150} Zeichen, ohne die Kernaussage zu verlieren.`,
      expand: 'Erweitere den folgenden Text mit mehr Details und Kontext, ohne redundant zu werden.',
      professional: 'Formuliere den Text professioneller und geschäftsmäßiger, behalte aber die Kernaussage bei.',
      casual: 'Mache den Text lockerer und umgangssprachlicher, als würdest du mit einem Freund sprechen.',
      engaging: 'Überarbeite den Text so, dass er mehr Engagement (Likes, Kommentare, Shares) erzeugt. Füge Fragen oder Call-to-Actions ein.',
      seo: 'Optimiere den Text für Suchmaschinen. Füge relevante Keywords natürlich ein.',
      emoji: 'Füge passende Emojis hinzu oder optimiere die vorhandenen Emojis für mehr visuelle Wirkung.',
      hashtags: 'Analysiere den Inhalt und füge 5-7 relevante, trendige Hashtags hinzu oder verbessere die vorhandenen.',
      cta: 'Füge einen starken Call-to-Action hinzu, der zur Interaktion auffordert.',
    }
    
    const platformContext = validatedData.platform 
      ? `Optimiere speziell für ${validatedData.platform}.` 
      : ''
    
    const systemPrompt = `Du bist ein erfahrener Social Media Experte für die Friseur- und Beauty-Branche.

AUFGABE: ${actionPrompts[validatedData.action]}
${platformContext}

WICHTIG:
- Behalte die ursprüngliche Sprache des Textes bei
- Gib NUR den verbesserten Text zurück, ohne Erklärungen
- Wenn Hashtags vorhanden sind, behalte sie bei (außer bei 'hashtags' Action)`

    const improvedContent = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: validatedData.content },
      ],
      {
        temperature: 0.7,
        maxTokens: 600,
        userId: session.user.id,
        requestType: 'completion',
      }
    )
    
    // Hashtags extrahieren
    const hashtagRegex = /#[\wäöüÄÖÜß]+/g
    const extractedHashtags = improvedContent.match(hashtagRegex) || []
    
    return NextResponse.json({
      original: validatedData.content,
      improved: improvedContent,
      hashtags: extractedHashtags.map(h => h.substring(1)),
      action: validatedData.action,
      characterCount: {
        original: validatedData.content.length,
        improved: improvedContent.length,
      },
    })
  } catch (error) {
    console.error('[Social AI Improve] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Fehler bei der Content-Verbesserung' },
      { status: 500 }
    )
  }
}

