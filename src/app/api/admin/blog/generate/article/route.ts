import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chatCompletion } from '@/lib/openrouter/client'

interface ArticleConfig {
  topic: {
    title: string
    description: string
    keywords?: string[]
  }
  articleType: 'standard' | 'interview' | 'listicle' | 'how-to' | 'case-study' | 'opinion'
  length: 'short' | 'medium' | 'long' | 'very-long' // ~500, ~1000, ~2000, ~3000+ words
  includeQuotes: boolean
  includeStatistics: boolean
  categoryId?: string
  focusKeyword?: string // SEO Fokus-Keyword
  customSystemPrompt?: string // Einmalig angepasster Prompt
}

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

    const body: ArticleConfig = await request.json()
    const { topic, articleType, length, includeQuotes, includeStatistics, categoryId, focusKeyword, customSystemPrompt } = body

    if (!topic?.title) {
      return NextResponse.json({ error: 'Thema ist erforderlich' }, { status: 400 })
    }

    let systemPrompt: string

    // Wenn ein Custom Prompt übergeben wurde, verwende diesen
    if (customSystemPrompt) {
      systemPrompt = customSystemPrompt
    } else {
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

      const lengthConfig = LENGTH_CONFIG[length] || LENGTH_CONFIG.medium
      const typePrompt = ARTICLE_TYPE_PROMPTS[articleType] || ARTICLE_TYPE_PROMPTS.standard

      // Wenn ein gespeicherter Artikel-Prompt existiert, verwende diesen
      if (settings?.blogArticleSystemPrompt) {
        systemPrompt = settings.blogArticleSystemPrompt
          .replace('{{TONE_OF_VOICE}}', settings?.blogToneOfVoicePrompt || '')
          .replace('{{ARTICLE_TYPE}}', typePrompt)
          .replace('{{LENGTH_WORDS}}', lengthConfig.words)
          .replace('{{LENGTH_PARAGRAPHS}}', lengthConfig.paragraphs)
          .replace('{{QUOTES}}', includeQuotes ? 'Füge 2-3 passende Experten-Zitate ein (erfinde realistische Zitate von Branchenexperten).' : '')
          .replace('{{STATISTICS}}', includeStatistics ? 'Füge relevante Statistiken und Zahlen ein (nutze realistische Branchendaten).' : '')
          .replace('{{CATEGORY}}', category?.name || 'Allgemein')
      } else {
        // Standard-Prompt generieren
        systemPrompt = `Du bist ein professioneller Content-Writer für die Salon- und Beauty-Branche.
Du schreibst hochwertige, SEO-optimierte Blog-Artikel auf Deutsch.

${settings?.blogToneOfVoicePrompt ? `SCHREIBSTIL-ANWEISUNGEN:\n${settings.blogToneOfVoicePrompt}\n` : ''}

${focusKeyword ? `SEO FOKUS-KEYWORD: "${focusKeyword}"
- Verwende das Keyword natürlich im Titel, in den ersten 100 Wörtern und in Zwischenüberschriften
- Keyword-Dichte: 1-2% (nicht übertreiben)
- Verwende das Keyword auch in Meta-Titel und Meta-Beschreibung
- Nutze semantisch verwandte Begriffe
` : ''}

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
      }
    }

    const userPrompt = `Schreibe einen vollständigen Blog-Artikel zu folgendem Thema:

TITEL: ${topic.title}
BESCHREIBUNG: ${topic.description}
${topic.keywords?.length ? `KEYWORDS: ${topic.keywords.join(', ')}` : ''}

Gib NUR das JSON-Objekt zurück, keine weiteren Erklärungen.`

    const result = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'anthropic/claude-3.5-sonnet',
        temperature: 0.7,
        maxTokens: 8000, // Mehr Tokens für lange Artikel
        requestType: 'completion',
      }
    )

    // Parse JSON Response
    let article
    try {
      // Versuche JSON zu extrahieren
      const jsonMatch = result.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        article = JSON.parse(jsonMatch[0])
      } else {
        article = JSON.parse(result.content)
      }
    } catch (parseError) {
      console.error('Failed to parse article JSON:', result.content)
      return NextResponse.json(
        { error: 'Fehler beim Parsen des Artikels' },
        { status: 500 }
      )
    }

    // Generiere Unsplash Links
    const unsplashLinks = (article.unsplashSearchTerms || []).map(
      (term: string) => `https://unsplash.com/s/photos/${encodeURIComponent(term)}`
    )

    return NextResponse.json({
      article: {
        ...article,
        unsplashLinks,
      },
      usage: result.usage,
    })
  } catch (error) {
    console.error('Error generating article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler bei der Generierung' },
      { status: 500 }
    )
  }
}



