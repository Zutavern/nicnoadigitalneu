import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Standard-Prompt Template
const DEFAULT_ARTICLE_PROMPT = `Du bist ein professioneller Content-Writer für die Salon- und Beauty-Branche.
Du schreibst hochwertige, SEO-optimierte Blog-Artikel auf Deutsch.

{{TONE_OF_VOICE}}

ARTIKEL-FORMAT: {{ARTICLE_TYPE}}

LÄNGE: {{LENGTH_WORDS}} Wörter, {{LENGTH_PARAGRAPHS}} Absätze

{{QUOTES}}
{{STATISTICS}}

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
  "suggestedCategory": "{{CATEGORY}}",
  "unsplashSearchTerms": ["suchbegriff1", "suchbegriff2"],
  "estimatedReadTime": 5
}`

// GET: Tone of Voice Einstellungen abrufen
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const settings = await prisma.platformSettings.findFirst({
      select: {
        blogToneOfVoice: true,
        blogToneOfVoicePrompt: true,
        blogArticleSystemPrompt: true,
      },
    })

    return NextResponse.json({
      blogToneOfVoice: settings?.blogToneOfVoice || '',
      blogToneOfVoicePrompt: settings?.blogToneOfVoicePrompt || '',
      blogArticleSystemPrompt: settings?.blogArticleSystemPrompt || '',
      defaultArticlePrompt: DEFAULT_ARTICLE_PROMPT,
    })
  } catch (error) {
    console.error('Error fetching tone of voice:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden' },
      { status: 500 }
    )
  }
}

// PUT: Tone of Voice Einstellungen aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { blogToneOfVoice, blogToneOfVoicePrompt, blogArticleSystemPrompt } = body

    await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {
        blogToneOfVoice: blogToneOfVoice || null,
        blogToneOfVoicePrompt: blogToneOfVoicePrompt || null,
        blogArticleSystemPrompt: blogArticleSystemPrompt || null,
      },
      create: {
        id: 'default',
        blogToneOfVoice: blogToneOfVoice || null,
        blogToneOfVoicePrompt: blogToneOfVoicePrompt || null,
        blogArticleSystemPrompt: blogArticleSystemPrompt || null,
      },
    })

    return NextResponse.json({
      blogToneOfVoice: blogToneOfVoice || '',
      blogToneOfVoicePrompt: blogToneOfVoicePrompt || '',
      blogArticleSystemPrompt: blogArticleSystemPrompt || '',
    })
  } catch (error) {
    console.error('Error saving tone of voice:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern' },
      { status: 500 }
    )
  }
}




