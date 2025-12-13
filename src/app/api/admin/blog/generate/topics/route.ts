import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chatCompletion } from '@/lib/openrouter/client'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { headline, subheadline, categoryId } = body

    if (!headline) {
      return NextResponse.json({ error: 'Headline ist erforderlich' }, { status: 400 })
    }

    // Hole Kontext: Kategorie-Name und bisherige Artikel
    let categoryName = ''
    let existingArticles: string[] = []

    if (categoryId) {
      const category = await prisma.blogCategory.findUnique({
        where: { id: categoryId },
        select: { name: true },
      })
      categoryName = category?.name || ''
    }

    // Hole die letzten 10 Artikel-Titel für Kontext
    const recentPosts = await prisma.blogPost.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { title: true },
    })
    existingArticles = recentPosts.map((p) => p.title)

    // Hole Tone of Voice
    const settings = await prisma.platformSettings.findFirst({
      select: {
        blogToneOfVoice: true,
        blogToneOfVoicePrompt: true,
      },
    })

    const systemPrompt = `Du bist ein erfahrener Content-Stratege für die Salon- und Beauty-Branche.
Deine Aufgabe ist es, 10 kreative und relevante Blog-Themenvorschläge zu generieren.

${settings?.blogToneOfVoice ? `Gewünschter Schreibstil: ${settings.blogToneOfVoice}` : ''}
${categoryName ? `Kategorie: ${categoryName}` : ''}
${existingArticles.length > 0 ? `Bereits existierende Artikel (vermeide Duplikate): ${existingArticles.join(', ')}` : ''}

Generiere 10 einzigartige, ansprechende Blog-Themen basierend auf dem gegebenen Input.
Jedes Thema soll:
- Relevant für Salonbesitzer und die Beauty-Branche sein
- Ein konkretes Problem lösen oder Mehrwert bieten
- SEO-freundlich und klickstark formuliert sein

Antworte NUR mit einem JSON-Array von 10 Objekten mit folgender Struktur:
[
  {
    "title": "Kurzer, prägnanter Titel",
    "description": "1-2 Sätze Beschreibung worum es geht",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]`

    const userPrompt = `Generiere 10 Blog-Themenvorschläge basierend auf:

Hauptthema: ${headline}
${subheadline ? `Zusätzlicher Kontext: ${subheadline}` : ''}

Gib NUR das JSON-Array zurück, keine weiteren Erklärungen.`

    const result = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'anthropic/claude-3.5-sonnet',
        temperature: 0.8,
        requestType: 'completion',
      }
    )

    // Parse JSON Response
    let topics
    try {
      // Versuche JSON zu extrahieren (manchmal kommt es mit Markdown-Codeblöcken)
      const jsonMatch = result.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0])
      } else {
        topics = JSON.parse(result.content)
      }
    } catch (parseError) {
      console.error('Failed to parse topics JSON:', result.content)
      return NextResponse.json(
        { error: 'Fehler beim Parsen der Themenvorschläge' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      topics,
      usage: result.usage,
    })
  } catch (error) {
    console.error('Error generating topics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler bei der Generierung' },
      { status: 500 }
    )
  }
}



