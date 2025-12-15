import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateOpenRouterCompletion } from '@/lib/openrouter/client'
import { logAIUsage } from '@/lib/openrouter/usage-tracker'
import { z } from 'zod'

const hashtagRequestSchema = z.object({
  content: z.string().min(1, 'Inhalt erforderlich'),
  platforms: z.array(z.string()).optional().default(['INSTAGRAM']),
  count: z.number().min(5).max(30).optional().default(10),
  style: z.enum(['trending', 'niche', 'branded', 'mixed']).optional().default('mixed'),
  industry: z.string().optional().default('Friseursalon'),
})

// Platform-spezifische Hashtag-Tipps
const platformTips: Record<string, string> = {
  INSTAGRAM: 'Mix aus populären (100k-1M) und Nischen-Hashtags (10k-100k). Max 30, optimal 10-15.',
  FACEBOOK: 'Weniger Hashtags (3-5), fokussiert auf Thema. Mehr beschreibend.',
  LINKEDIN: 'Professionelle, branchenspezifische Tags (3-5). Keine Emojis.',
  TWITTER: 'Trending Hashtags nutzen wenn passend. Max 2-3 pro Tweet.',
  TIKTOK: 'Trending Sounds/Challenges einbeziehen. Mix aus viral und nische.',
  YOUTUBE: 'Keywords als Hashtags. Relevant für Suche. Max 3 im Titel.',
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let success = false
  let errorMessage: string | undefined

  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      errorMessage = 'Nicht autorisiert'
      return NextResponse.json({ error: errorMessage }, { status: 401 })
    }

    const body = await request.json()
    const { content, platforms, count, style, industry } = hashtagRequestSchema.parse(body)

    // Plattform-spezifische Tipps sammeln
    const platformAdvice = platforms
      .map(p => platformTips[p])
      .filter(Boolean)
      .join('\n')

    const styleInstructions = {
      trending: 'Fokus auf aktuell beliebte, virale Hashtags',
      niche: 'Fokus auf spezifische, zielgruppenrelevante Hashtags mit weniger Konkurrenz',
      branded: 'Mix aus Marken-Hashtags und Community-Tags',
      mixed: 'Ausgewogener Mix aus trending, niche und branded Hashtags',
    }

    const systemPrompt = `Du bist ein Social Media Experte für die ${industry}-Branche.
Du generierst optimale Hashtags für Social Media Posts.

REGELN:
- Generiere genau ${count} einzigartige Hashtags
- Keine Duplikate
- Hashtags ohne # Symbol
- Nur lowercase
- Keine Leerzeichen (zusammengeschrieben oder mit Unterstrichen)
- Deutsch und Englisch gemischt (je nach Zielgruppe)
- ${styleInstructions[style]}

PLATTFORM-TIPPS:
${platformAdvice || 'Allgemein: Mix aus populären und nische Hashtags'}

KATEGORIEN für Friseur/Beauty:
- Styling: hairstyle, haircut, hairtutorial, hairinspo
- Farbe: balayage, highlights, haircolor, colorcorrection
- Pflege: haircare, healthyhair, hairtreatment
- Trends: hairtrends, hairstylist2024
- Lokal: [stadt]friseur, [stadt]hairstylist
- Business: hairstylist, behindthechair, salonlife

Antworte NUR mit einem JSON-Array der Hashtags, z.B.:
["hairstyle", "balayage", "friseurmünchen", "hairgoals"]`

    const userPrompt = `Generiere ${count} optimale Hashtags für diesen Post:

"${content}"

Plattformen: ${platforms.join(', ')}
Stil: ${style}

Antworte NUR mit dem JSON-Array.`

    const response = await generateOpenRouterCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      maxTokens: 500,
      temperature: 0.7,
    })

    // Parse JSON response
    let hashtags: string[] = []
    
    try {
      // Versuche JSON zu parsen
      const jsonMatch = response.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        hashtags = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: Komma-getrennte Liste
        hashtags = response.content
          .replace(/[\[\]"']/g, '')
          .split(/[,\n]/)
          .map(tag => tag.trim().toLowerCase().replace(/^#/, ''))
          .filter(tag => tag.length > 0 && tag.length < 30)
      }
    } catch {
      // Fallback Parsing
      hashtags = response.content
        .split(/[\s,\n]+/)
        .map(tag => tag.trim().toLowerCase().replace(/^#/, ''))
        .filter(tag => tag.length > 2 && tag.length < 30 && /^[a-z0-9äöüß_]+$/.test(tag))
    }

    // Deduplizieren und limitieren
    hashtags = [...new Set(hashtags)].slice(0, count)

    // Log usage
    success = true
    await logAIUsage({
      userId: session.user.id,
      salonId: session.user.salonId,
      userType: session.user.role,
      requestType: 'hashtag_generation',
      model: response.model || 'unknown',
      provider: 'openrouter',
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      totalTokens: response.usage?.totalTokens || 0,
      costUsd: response.usage?.totalCost || 0,
      responseTimeMs: Date.now() - startTime,
      success: true,
      feature: 'hashtag_generation',
      creditsUsed: 0.5, // Geringe Credits für Hashtags
      metadata: {
        platforms,
        style,
        hashtagCount: hashtags.length,
      },
    })

    return NextResponse.json({
      hashtags,
      count: hashtags.length,
      platforms,
      style,
    })

  } catch (error) {
    console.error('[AI Hashtags] Error:', error)
    errorMessage = error instanceof Error ? error.message : 'Hashtag-Generierung fehlgeschlagen'

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// GET - Trending Hashtags für eine Branche/Plattform
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') || 'INSTAGRAM'
    const category = searchParams.get('category') || 'allgemein'

    // Vordefinierte beliebte Hashtags für die Beauty/Friseur-Branche
    const trendingByCategory: Record<string, Record<string, string[]>> = {
      INSTAGRAM: {
        allgemein: ['hairstyle', 'hairgoals', 'hairinspo', 'hairstylist', 'salonlife', 'behindthechair'],
        farbe: ['balayage', 'haircolor', 'blondehair', 'highlights', 'colormelt', 'babylights'],
        schnitt: ['haircut', 'hairtransformation', 'newhairdontcare', 'shorthair', 'longhair'],
        styling: ['hairtutorial', 'hairvideo', 'hairstyling', 'curlyhair', 'straighthair'],
        pflege: ['haircare', 'healthyhair', 'hairtreatment', 'olaplex', 'kerastase'],
        trend: ['hairtrends', 'hairtok', 'viralhair', 'hairtransformation'],
      },
      TIKTOK: {
        allgemein: ['hairtok', 'hairstylist', 'hairtransformation', 'fyp', 'foryou'],
        farbe: ['haircoloring', 'balayagetutorial', 'blonding', 'colorcorrection'],
        schnitt: ['haircuttutorial', 'curtainbangs', 'wolfcut', 'layeredhair'],
        styling: ['hairstyle', 'easyhairstyles', 'hairhack', 'quickhair'],
        trend: ['viralhairstyle', 'hairtiktok', 'grwm', 'getreadywithme'],
      },
      LINKEDIN: {
        allgemein: ['hairstylist', 'beautyprofessional', 'salonowner', 'hairindustry'],
        business: ['salonbusiness', 'beautybusiness', 'entrepreneurship', 'smallbusiness'],
        education: ['haireducation', 'continuingeducation', 'masterclass'],
      },
    }

    const platformHashtags = trendingByCategory[platform] || trendingByCategory['INSTAGRAM']
    const categoryHashtags = platformHashtags[category] || platformHashtags['allgemein']

    return NextResponse.json({
      trending: categoryHashtags,
      platform,
      category,
      categories: Object.keys(platformHashtags),
    })

  } catch (error) {
    console.error('[AI Hashtags GET] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Hashtags' },
      { status: 500 }
    )
  }
}
