import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Übersetzungen für einen bestimmten Content abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('contentType')
    const contentId = searchParams.get('contentId')
    const locale = searchParams.get('locale')

    if (!contentType || !contentId || !locale) {
      return NextResponse.json(
        { error: 'contentType, contentId und locale sind erforderlich' },
        { status: 400 }
      )
    }

    // Prüfen ob Sprache aktiv ist
    const language = await prisma.language.findUnique({
      where: { id: locale },
    })

    if (!language || !language.isActive) {
      return NextResponse.json(
        { error: 'Sprache nicht verfügbar', translations: [] },
        { status: 200 }
      )
    }

    // Übersetzungen laden
    const translations = await prisma.translation.findMany({
      where: {
        contentType,
        contentId,
        languageId: locale,
        status: 'TRANSLATED',
        isOutdated: false,
      },
      select: {
        field: true,
        value: true,
        translatedAt: true,
        provider: true,
      },
    })

    // Cache-Header für bessere Performance
    const headers = new Headers()
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    return NextResponse.json(
      { translations },
      { headers }
    )
  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Übersetzungen', translations: [] },
      { status: 500 }
    )
  }
}


