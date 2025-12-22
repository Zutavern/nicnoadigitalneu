import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chatCompletion } from '@/lib/openrouter/client'

type ImprovementType = 
  | 'improve' 
  | 'shorter' 
  | 'longer' 
  | 'professional' 
  | 'casual' 
  | 'fix-grammar'
  | 'simplify'
  | 'persuasive'
  | 'seo-optimize'
  | 'summarize'
  | 'friendly'
  | 'bullet-points'
  | 'add-questions'
  | 'add-cta'
  | 'academic'
  | 'urgent'
  | 'trustworthy'
  | 'active-voice'
  | 'storytelling'
  | 'humorous'
  // Überprüfung
  | 'fact-check'
  | 'find-issues'
  | 'check-clarity'
  | 'check-logic'
  // Erweitern
  | 'add-examples'
  | 'add-statistics'
  | 'add-quotes'
  | 'add-transitions'
  // SEO & Content
  | 'generate-headline'
  | 'generate-teaser'
  | 'generate-meta'
  // Weitere
  | 'make-specific'
  | 'neutral-tone'
  | 'split-paragraphs'
  | 'polish'

const IMPROVEMENT_PROMPTS: Record<ImprovementType, string> = {
  // ✓ Überprüfung
  'fact-check': `Überprüfe diesen Text kritisch auf Fakten und Aussagen. 
Analysiere mit deinem Wissen:
- Sind die Aussagen korrekt?
- Gibt es fragwürdige oder veraltete Informationen?
- Was sollte überprüft oder korrigiert werden?

Gib einen überarbeiteten Text zurück, in dem du:
1. Offensichtlich falsche Aussagen korrigierst
2. Fragwürdige Stellen mit [PRÜFEN: ...] markierst
3. Verbesserungsvorschläge in den Text einarbeitest`,

  'find-issues': `Analysiere diesen Text kritisch und finde Schwächen:
- Gibt es unklare Formulierungen?
- Fehlen wichtige Informationen?
- Gibt es logische Lücken?
- Sind Aussagen zu vage oder zu pauschal?
- Gibt es Widersprüche?

Gib einen verbesserten Text zurück, der diese Probleme behebt.`,

  'check-clarity': `Prüfe diesen Text auf Verständlichkeit:
- Ist jeder Satz klar und eindeutig?
- Könnten Leser etwas missverstehen?
- Gibt es Fachbegriffe, die erklärt werden sollten?
- Ist die Struktur logisch aufgebaut?

Gib einen klareren, verständlicheren Text zurück.`,

  'check-logic': `Überprüfe die logische Konsistenz dieses Textes:
- Folgen die Argumente logisch aufeinander?
- Gibt es Widersprüche?
- Sind Schlussfolgerungen nachvollziehbar?
- Fehlen wichtige Zwischenschritte in der Argumentation?

Gib einen logisch verbesserten Text zurück.`,

  // ✨ Grundlagen
  improve: 'Verbessere diesen Text. Mache ihn klarer, prägnanter und ansprechender. Behalte die ursprüngliche Bedeutung bei.',
  'fix-grammar': 'Korrigiere alle Grammatik-, Rechtschreib- und Zeichensetzungsfehler in diesem Text. Verändere den Stil nicht.',
  simplify: 'Vereinfache diesen Text. Verwende kürzere Sätze, einfachere Wörter und eine klarere Struktur. Mache ihn leicht verständlich für jeden Leser.',
  'active-voice': 'Schreibe diesen Text in aktiver Stimme um. Ersetze Passivkonstruktionen durch aktive Formulierungen. Mache die Sätze direkter und kraftvoller.',
  polish: 'Gib diesem Text den letzten Feinschliff. Optimiere Wortwahl, Rhythmus und Fluss. Entferne überflüssige Wörter, verbessere Übergänge und mache jeden Satz prägnant.',
  
  // 📐 Struktur
  shorter: 'Kürze diesen Text auf etwa die Hälfte der Länge. Behalte nur die wichtigsten Informationen.',
  longer: 'Erweitere diesen Text um zusätzliche Details, Beispiele oder Erklärungen. Verdopple ungefähr die Länge, aber bleibe relevant.',
  summarize: 'Fasse diesen Text in 1-3 prägnanten Sätzen zusammen. Extrahiere nur die Kernaussagen.',
  'bullet-points': 'Wandle diesen Text in eine übersichtliche Aufzählung (Bullet Points) um. Strukturiere die Hauptpunkte klar und prägnant. Verwende HTML-Listen (<ul><li>).',
  'split-paragraphs': 'Teile diesen Text in mehrere gut strukturierte Absätze auf. Jeder Absatz sollte einen Gedanken behandeln. Füge Leerzeilen zwischen den Absätzen ein.',
  'add-transitions': 'Füge diesem Text bessere Übergänge zwischen den Sätzen und Absätzen hinzu. Verwende Konnektoren und Überleitungen für einen besseren Lesefluss.',
  
  // 🎭 Tonalität
  professional: 'Schreibe diesen Text in einem professionellen, formellen Geschäftston um. Verwende gehobene Sprache.',
  casual: 'Schreibe diesen Text in einem lockeren, entspannten Ton um. Wie in einem freundlichen Gespräch.',
  friendly: 'Schreibe diesen Text warm und einladend um. Verwende eine persönliche, nahbare Ansprache.',
  academic: 'Schreibe diesen Text in einem akademischen, wissenschaftlichen Stil um. Verwende Fachsprache, präzise Formulierungen und einen objektiven Ton.',
  humorous: 'Schreibe diesen Text humorvoller und unterhaltsamer um. Füge Witz, Wortspiele oder leichte Ironie hinzu, ohne die Kernbotschaft zu verlieren.',
  'neutral-tone': 'Schreibe diesen Text in einem neutralen, sachlichen Ton um. Entferne subjektive Bewertungen, emotionale Sprache und persönliche Meinungen. Halte ihn objektiv und ausgewogen.',
  
  // 📣 Marketing
  persuasive: 'Schreibe diesen Text überzeugender und emotionaler um. Füge aktivierende Elemente hinzu, die zum Handeln motivieren.',
  urgent: 'Schreibe diesen Text dringlicher um. Erzeuge ein Gefühl von Zeitdruck und FOMO (Fear of Missing Out). Betone die Wichtigkeit schnellen Handelns.',
  trustworthy: 'Schreibe diesen Text vertrauenserweckender um. Verwende einen seriösen, glaubwürdigen Ton. Betone Fakten, Expertise und Zuverlässigkeit.',
  'add-cta': 'Füge diesem Text einen starken Call-to-Action hinzu. Formuliere eine klare Handlungsaufforderung, die den Leser zum nächsten Schritt motiviert.',
  storytelling: 'Schreibe diesen Text als fesselnde Geschichte um. Verwende erzählerische Elemente: Szenen, Emotionen, einen Spannungsbogen.',
  
  // ➕ Erweitern
  'add-examples': 'Füge diesem Text konkrete Beispiele hinzu, die die Aussagen veranschaulichen und greifbarer machen. Die Beispiele sollten relevant und nachvollziehbar sein.',
  'add-statistics': 'Erweitere diesen Text mit plausiblen Statistiken, Zahlen oder Daten, die die Aussagen untermauern. Markiere erfundene Statistiken mit [BEISPIEL-STATISTIK] zur späteren Verifizierung.',
  'add-quotes': 'Füge diesem Text passende Zitate oder Expertenmeinungen hinzu, die die Kernaussagen unterstützen. Markiere erfundene Zitate mit [BEISPIEL-ZITAT] zur späteren Verifizierung.',
  'add-questions': 'Füge diesem Text rhetorische Fragen hinzu, um ihn interaktiver und einladender zu gestalten. Die Fragen sollen den Leser zum Nachdenken anregen.',
  'make-specific': 'Mache diesen Text konkreter und spezifischer. Ersetze vage Aussagen durch präzise Details, Zahlen oder Beispiele.',
  
  // 🎯 SEO & Content
  'seo-optimize': 'Optimiere diesen Text für Suchmaschinen. Verwende natürliche Keyword-Variationen, klare Struktur und leserfreundliche Absätze.',
  'generate-headline': `Generiere 5 verschiedene Überschriften für diesen Text:
1. Eine aufmerksamkeitsstarke Headline
2. Eine SEO-optimierte Headline mit Keyword
3. Eine Frage als Headline
4. Eine Headline mit Zahlen/Liste
5. Eine emotionale Headline

Format: Nummerierte Liste der 5 Headlines.`,
  'generate-teaser': 'Erstelle einen kurzen, knackigen Teaser-Text (2-3 Sätze) für diesen Inhalt. Der Teaser soll neugierig machen und zum Weiterlesen animieren.',
  'generate-meta': 'Erstelle eine SEO-optimierte Meta-Description (max. 155 Zeichen) für diesen Text. Sie soll das Thema zusammenfassen und zum Klicken animieren.',
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

    // Prüfungs-Optionen haben eigene Regeln
    const isCheckType = ['fact-check', 'find-issues', 'check-clarity', 'check-logic'].includes(type)
    const isGenerateType = ['generate-headline', 'generate-teaser', 'generate-meta'].includes(type)
    
    const systemPrompt = `Du bist ein Experte für Textverbesserung, Redaktion und Content-Analyse.
${settings?.blogToneOfVoicePrompt && !isCheckType ? `Beachte diesen Schreibstil: ${settings.blogToneOfVoicePrompt}` : ''}

AUFGABE: ${IMPROVEMENT_PROMPTS[type]}

REGELN:
${isGenerateType 
  ? '- Gib das Ergebnis direkt zurück (z.B. Headlines als Liste, Teaser als Text)'
  : isCheckType 
    ? '- Gib den überarbeiteten/verbesserten Text zurück mit eingearbeiteten Korrekturen'
    : '- Gib NUR den verbesserten Text zurück, keine Erklärungen oder Einleitungen'
}
- Behalte die HTML-Formatierung bei, wenn vorhanden
- Der Text ist auf Deutsch
- Ändere nicht die grundlegende Struktur (z.B. wenn es eine Liste ist, bleibt es eine Liste), außer es wird explizit verlangt`

    const userPrompt = `Verbessere diesen Text:\n\n${text}`

    const improvedText = await chatCompletion(
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
      improvedText: improvedText.trim(),
    })
  } catch (error) {
    console.error('Error improving text:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler bei der Verbesserung' },
      { status: 500 }
    )
  }
}




