import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ARTICLE_TYPE_PROMPTS: Record<string, string> = {
  standard: 'Ein klassischer, informativer Blog-Artikel mit Einleitung, Hauptteil und Fazit.',
  interview: 'Ein Interview-Stil Artikel mit Fragen und Antworten. Erfinde einen fiktiven Experten.',
  listicle: 'Ein Listicle-Artikel mit nummerierten Punkten (z.B. "10 Tipps für...").',
  'how-to': 'Eine Schritt-für-Schritt Anleitung mit klaren, umsetzbaren Schritten.',
  'case-study': 'Eine Fallstudie mit einem konkreten Beispiel, Herausforderung, Lösung und Ergebnis.',
  opinion: 'Ein Meinungsartikel mit klarer Positionierung und Argumentation.',
}

const LENGTH_CONFIG: Record<string, { words: string; paragraphs: string }> = {
  short: { words: '400-600', paragraphs: '4-6' },
  medium: { words: '800-1200', paragraphs: '8-12' },
  long: { words: '1800-2200', paragraphs: '15-20' },
  'very-long': { words: '2800-3500', paragraphs: '25-35' },
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { articleType, length, includeQuotes, includeStatistics, categoryId } = body

    // Hole Tone of Voice und Kategorie
    const [settings, category] = await Promise.all([
      prisma.platformSettings.findFirst({
        select: {
          blogToneOfVoice: true,
          blogToneOfVoicePrompt: true,
          blogArticleSystemPrompt: true,
        },
      }),
      categoryId
        ? prisma.blogCategory.findUnique({
            where: { id: categoryId },
            select: { name: true },
          })
        : null,
    ])

    // Wenn ein gespeicherter Artikel-Prompt existiert, verwende diesen
    if (settings?.blogArticleSystemPrompt) {
      // Ersetze Platzhalter
      let customPrompt = settings.blogArticleSystemPrompt
      customPrompt = customPrompt.replace('{{TONE_OF_VOICE}}', settings?.blogToneOfVoicePrompt || '')
      customPrompt = customPrompt.replace('{{ARTICLE_TYPE}}', ARTICLE_TYPE_PROMPTS[articleType] || ARTICLE_TYPE_PROMPTS.standard)
      customPrompt = customPrompt.replace('{{LENGTH_WORDS}}', LENGTH_CONFIG[length]?.words || LENGTH_CONFIG.medium.words)
      customPrompt = customPrompt.replace('{{LENGTH_PARAGRAPHS}}', LENGTH_CONFIG[length]?.paragraphs || LENGTH_CONFIG.medium.paragraphs)
      customPrompt = customPrompt.replace('{{QUOTES}}', includeQuotes ? 'Füge 2-3 passende Experten-Zitate ein (erfinde realistische Zitate von Branchenexperten).' : '')
      customPrompt = customPrompt.replace('{{STATISTICS}}', includeStatistics ? 'Füge relevante Statistiken und Zahlen ein (nutze realistische Branchendaten).' : '')
      customPrompt = customPrompt.replace('{{CATEGORY}}', category?.name || 'Allgemein')

      return NextResponse.json({ systemPrompt: customPrompt })
    }

    // Generiere Standard-Prompt
    const lengthConfig = LENGTH_CONFIG[length] || LENGTH_CONFIG.medium
    const typePrompt = ARTICLE_TYPE_PROMPTS[articleType] || ARTICLE_TYPE_PROMPTS.standard

    const systemPrompt = `Du bist ein professioneller Content-Writer für die Salon- und Beauty-Branche.
Du schreibst hochwertige, SEO-optimierte Blog-Artikel auf Deutsch.

${settings?.blogToneOfVoicePrompt ? `SCHREIBSTIL-ANWEISUNGEN:\n${settings.blogToneOfVoicePrompt}\n` : ''}

ARTIKEL-FORMAT: ${typePrompt}

LÄNGE: ${lengthConfig.words} Wörter, ${lengthConfig.paragraphs} Absätze

${includeQuotes ? 'Füge 2-3 passende Experten-Zitate ein (erfinde realistische Zitate von Branchenexperten).' : ''}
${includeStatistics ? 'Füge relevante Statistiken und Zahlen ein (nutze realistische Branchendaten).' : ''}

FORMATIERUNG:
- Verwende HTML-Tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>
- Beginne mit einer starken Einleitung (ohne H1 - der Titel kommt separat)
- Strukturiere mit Zwischenüberschriften (H2, H3)
- Füge am Ende ein Fazit oder Call-to-Action ein
- Mache den Text scanbar mit kurzen Absätzen und Listen

WICHTIG: Antworte NUR mit einem JSON-Objekt in folgendem Format:
{
  "title": "SEO-optimierter Titel (max 60 Zeichen)",
  "slug": "url-freundlicher-slug",
  "excerpt": "Kurze, ansprechende Beschreibung (max 160 Zeichen)",
  "content": "<h2>Erste Überschrift</h2><p>Inhalt...</p>...",
  "metaTitle": "SEO Meta-Titel (max 60 Zeichen)",
  "metaDescription": "SEO Meta-Beschreibung (max 160 Zeichen)",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "suggestedCategory": "${category?.name || 'Allgemein'}",
  "unsplashSearchTerms": ["suchbegriff1", "suchbegriff2"],
  "estimatedReadTime": 5
}`

    return NextResponse.json({ systemPrompt })
  } catch (error) {
    console.error('Error generating prompt preview:', error)
    return NextResponse.json(
      { error: 'Fehler beim Generieren des Prompts' },
      { status: 500 }
    )
  }
}
