import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/homepage-prompts
 * Prompts für eine bestimmte Seite laden (für den Editor)
 * 
 * Query-Parameter:
 * - pageType: Seiten-Typ (home, ueber-mich, kontakt, etc.)
 * - targetRole: STYLIST, SALON_OWNER oder BOTH
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType')
    const targetRole = searchParams.get('targetRole')

    if (!pageType) {
      return NextResponse.json(
        { error: 'pageType ist erforderlich' },
        { status: 400 }
      )
    }

    // Filter aufbauen: Prompts für die Seite + passende Rolle + "alle Seiten" Prompts
    const prompts = await prisma.homepagePrompt.findMany({
      where: {
        isActive: true,
        // Seiten-Filter: spezifische Seite ODER alle Seiten
        pageType: {
          in: [pageType, 'all']
        },
        // Rollen-Filter: passende Rolle ODER BOTH
        ...(targetRole && {
          targetRole: {
            in: [targetRole, 'BOTH']
          }
        })
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' }
      ],
      select: {
        id: true,
        pageType: true,
        targetRole: true,
        category: true,
        title: true,
        prompt: true,
        description: true,
        icon: true
      }
    })

    // Nach Kategorien gruppieren
    const groupedPrompts: Record<string, typeof prompts> = {}
    
    prompts.forEach(p => {
      if (!groupedPrompts[p.category]) {
        groupedPrompts[p.category] = []
      }
      groupedPrompts[p.category].push(p)
    })

    return NextResponse.json({ 
      prompts,
      grouped: groupedPrompts,
      total: prompts.length
    })
  } catch (error) {
    console.error('Error fetching homepage prompts:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Prompts' },
      { status: 500 }
    )
  }
}

