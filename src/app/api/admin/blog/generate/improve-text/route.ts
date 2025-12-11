import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chatCompletion } from '@/lib/openrouter/client'

type ImprovementType = 'improve' | 'shorter' | 'longer' | 'professional' | 'casual' | 'fix-grammar'

const IMPROVEMENT_PROMPTS: Record<ImprovementType, string> = {
  improve: 'Verbessere diesen Text. Mache ihn klarer, prägnanter und ansprechender. Behalte die ursprüngliche Bedeutung bei.',
  shorter: 'Kürze diesen Text auf etwa die Hälfte der Länge. Behalte die wichtigsten Informationen bei.',
  longer: 'Erweitere diesen Text um zusätzliche Details, Beispiele oder Erklärungen. Verdopple ungefähr die Länge.',
  professional: 'Schreibe diesen Text in einem professionelleren, formelleren Ton um.',
  casual: 'Schreibe diesen Text in einem lockereren, zugänglicheren Ton um.',
  'fix-grammar': 'Korrigiere alle Grammatik-, Rechtschreib- und Zeichensetzungsfehler in diesem Text.',
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { text, type } = body as { text: string; type: ImprovementType }

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text ist erforderlich' }, { status: 400 })
    }

    if (!type || !IMPROVEMENT_PROMPTS[type]) {
      return NextResponse.json({ error: 'Ungültiger Verbesserungstyp' }, { status: 400 })
    }

    // Hole Tone of Voice für Kontext
    const settings = await prisma.platformSettings.findFirst({
      select: {
        blogToneOfVoice: true,
        blogToneOfVoicePrompt: true,
      },
    })

    const systemPrompt = `Du bist ein Experte für Textverbesserung und Redaktion.
${settings?.blogToneOfVoicePrompt ? `Beachte diesen Schreibstil: ${settings.blogToneOfVoicePrompt}` : ''}

AUFGABE: ${IMPROVEMENT_PROMPTS[type]}

REGELN:
- Gib NUR den verbesserten Text zurück, keine Erklärungen oder Einleitungen
- Behalte die HTML-Formatierung bei, wenn vorhanden
- Der Text ist auf Deutsch
- Ändere nicht die grundlegende Struktur (z.B. wenn es eine Liste ist, bleibt es eine Liste)`

    const userPrompt = `Verbessere diesen Text:\n\n${text}`

    const result = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: 'anthropic/claude-3.5-sonnet',
        temperature: 0.7,
        maxTokens: 2000,
        requestType: 'completion',
      }
    )

    return NextResponse.json({
      improvedText: result.content.trim(),
      usage: result.usage,
    })
  } catch (error) {
    console.error('Error improving text:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler bei der Verbesserung' },
      { status: 500 }
    )
  }
}
