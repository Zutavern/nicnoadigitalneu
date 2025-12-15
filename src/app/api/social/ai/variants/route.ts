import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateOpenRouterCompletion } from '@/lib/openrouter/client'
import { logAIUsage } from '@/lib/openrouter/usage-tracker'
import { z } from 'zod'

const variantsRequestSchema = z.object({
  content: z.string().min(1, 'Inhalt erforderlich'),
  platforms: z.array(z.enum([
    'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE'
  ])).min(1),
  preserveHashtags: z.boolean().optional().default(true),
  preserveEmojis: z.boolean().optional().default(true),
})

// Platform-spezifische Anpassungen
const platformConfig: Record<string, { 
  maxLength: number
  style: string
  tips: string
}> = {
  INSTAGRAM: {
    maxLength: 2200,
    style: 'Persönlich, storytelling, emotionale Verbindung',
    tips: 'Erste Zeile ist Hook. Emojis nutzen. Call-to-Action am Ende.',
  },
  FACEBOOK: {
    maxLength: 63206,
    style: 'Konversationell, community-orientiert, teilbar',
    tips: 'Fragen stellen. Längerer Content möglich. Emotionale Geschichten.',
  },
  LINKEDIN: {
    maxLength: 3000,
    style: 'Professionell, wertschöpfend, thought leadership',
    tips: 'Keine Emojis in Headlines. Professioneller Ton. Insights teilen.',
  },
  TWITTER: {
    maxLength: 280,
    style: 'Prägnant, witzig, zeitnah',
    tips: 'Maximal 280 Zeichen! Kurz und knackig. Trending Topics nutzen.',
  },
  TIKTOK: {
    maxLength: 2200,
    style: 'Gen-Z-freundlich, trendy, unterhaltsam',
    tips: 'Trends aufgreifen. Lockerer Ton. Hashtags für Discoverability.',
  },
  YOUTUBE: {
    maxLength: 5000,
    style: 'Beschreibend, SEO-optimiert, ausführlich',
    tips: 'Keywords einbauen. Timestamps möglich. Call-to-Subscribe.',
  },
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let success = false

  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { content, platforms, preserveHashtags, preserveEmojis } = variantsRequestSchema.parse(body)

    // Hashtags extrahieren
    const hashtagMatch = content.match(/#\w+/g) || []
    const hashtags = hashtagMatch.map(h => h.slice(1))

    // Plattform-spezifische Prompts generieren
    const platformPrompts = platforms.map(platform => {
      const config = platformConfig[platform]
      return `
### ${platform}
- Max Zeichen: ${config.maxLength}
- Stil: ${config.style}
- Tipps: ${config.tips}
${platform === 'TWITTER' ? '⚠️ WICHTIG: Maximal 280 Zeichen inklusive Hashtags!' : ''}
`
    }).join('\n')

    const systemPrompt = `Du bist ein Social Media Copywriter für die Beauty/Friseur-Branche.
Du passt Content perfekt an verschiedene Plattformen an.

REGELN:
- Jede Variante muss zur Plattform passen
- Kernaussage beibehalten, Stil anpassen
- ${preserveHashtags ? 'Hashtags anpassen und beibehalten' : 'Keine Hashtags'}
- ${preserveEmojis ? 'Passende Emojis verwenden' : 'Keine Emojis'}
- Twitter MUSS unter 280 Zeichen bleiben!

PLATTFORM-SPEZIFIKATIONEN:
${platformPrompts}

ANTWORT-FORMAT (JSON):
{
  "variants": {
    "PLATFORM": {
      "content": "...",
      "characterCount": 123,
      "hashtags": ["tag1", "tag2"]
    }
  }
}`

    const userPrompt = `Erstelle plattform-optimierte Varianten für:

"${content}"

Plattformen: ${platforms.join(', ')}
${hashtags.length > 0 ? `Ursprüngliche Hashtags: ${hashtags.map(h => '#' + h).join(' ')}` : ''}

Antworte NUR mit dem JSON-Objekt.`

    const response = await generateOpenRouterCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      maxTokens: 2000,
      temperature: 0.7,
    })

    // Parse JSON response
    let variants: Record<string, { content: string; characterCount: number; hashtags: string[] }> = {}
    
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        variants = parsed.variants || parsed
      }
    } catch {
      // Fallback: Versuche Content zu extrahieren
      for (const platform of platforms) {
        const platformMatch = response.content.match(new RegExp(`${platform}[:\\s]+["']?([^"'\\n]+)["']?`, 'i'))
        if (platformMatch) {
          variants[platform] = {
            content: platformMatch[1].trim(),
            characterCount: platformMatch[1].trim().length,
            hashtags: (platformMatch[1].match(/#\w+/g) || []).map(h => h.slice(1)),
          }
        }
      }
    }

    // Validierung und Nachbearbeitung
    for (const platform of platforms) {
      if (!variants[platform]) {
        // Fallback: Original-Content mit Längenanpassung
        const config = platformConfig[platform]
        let adjustedContent = content
        
        if (adjustedContent.length > config.maxLength) {
          adjustedContent = adjustedContent.slice(0, config.maxLength - 3) + '...'
        }
        
        variants[platform] = {
          content: adjustedContent,
          characterCount: adjustedContent.length,
          hashtags,
        }
      } else {
        // Zeichencount aktualisieren
        variants[platform].characterCount = variants[platform].content.length
        
        // Twitter-Limit erzwingen
        if (platform === 'TWITTER' && variants[platform].content.length > 280) {
          variants[platform].content = variants[platform].content.slice(0, 277) + '...'
          variants[platform].characterCount = 280
        }
      }
    }

    // Log usage
    success = true
    await logAIUsage({
      userId: session.user.id,
      salonId: session.user.salonId,
      userType: session.user.role,
      requestType: 'caption_variants',
      model: response.model || 'unknown',
      provider: 'openrouter',
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      totalTokens: response.usage?.totalTokens || 0,
      costUsd: response.usage?.totalCost || 0,
      responseTimeMs: Date.now() - startTime,
      success: true,
      feature: 'caption_variants',
      creditsUsed: 1, // 1 Credit für Varianten
      metadata: {
        platforms,
        variantsGenerated: Object.keys(variants).length,
      },
    })

    return NextResponse.json({
      variants,
      original: content,
      platforms,
    })

  } catch (error) {
    console.error('[AI Variants] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Varianten-Generierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}

