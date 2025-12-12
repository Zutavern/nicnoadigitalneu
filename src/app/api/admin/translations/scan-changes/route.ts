import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { scanForChanges, scanAndQueueTranslations } from '@/lib/translation/change-detector'

export const dynamic = 'force-dynamic'

/**
 * GET: Scan für Änderungen (ohne Jobs zu erstellen)
 * Zeigt nur an, was sich geändert hat
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const languageId = searchParams.get('languageId') || undefined

    const result = await scanForChanges(languageId)

    // Gruppiere Änderungen nach Typ für bessere Übersicht
    const changesByType: Record<string, number> = {}
    for (const change of result.changes) {
      const key = change.contentType
      changesByType[key] = (changesByType[key] || 0) + 1
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalScanned: result.totalScanned,
        newContent: result.newContent,
        changedContent: result.changedContent,
        unchangedContent: result.unchangedContent,
        totalChanges: result.changes.length,
      },
      changesByType,
      // Nur die ersten 50 Änderungen zurückgeben für die Vorschau
      changes: result.changes.slice(0, 50).map(c => ({
        contentType: c.contentType,
        contentId: c.contentId,
        field: c.field,
        languageId: c.languageId,
        isNew: !c.hasTranslation,
        valuePreview: c.value.substring(0, 100) + (c.value.length > 100 ? '...' : ''),
      })),
      hasMoreChanges: result.changes.length > 50,
    })
  } catch (error) {
    console.error('Error scanning for changes:', error)
    return NextResponse.json(
      { error: 'Failed to scan for changes' },
      { status: 500 }
    )
  }
}

/**
 * POST: Scan und Jobs erstellen
 * Markiert veraltete Übersetzungen und erstellt neue Jobs
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { 
      languageId, 
      createJobsForNew = true, 
      createJobsForChanged = true 
    } = body

    const result = await scanAndQueueTranslations(languageId, {
      createJobsForNew,
      createJobsForChanged,
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalScanned: result.totalScanned,
        newContent: result.newContent,
        changedContent: result.changedContent,
        unchangedContent: result.unchangedContent,
      },
      actions: {
        markedOutdated: result.markedOutdated,
        jobsCreated: result.jobsCreated,
      },
      message: result.jobsCreated > 0
        ? `${result.jobsCreated} neue Übersetzungs-Jobs erstellt`
        : 'Keine neuen Übersetzungen erforderlich',
    })
  } catch (error) {
    console.error('Error scanning and queueing translations:', error)
    return NextResponse.json(
      { error: 'Failed to scan and queue translations' },
      { status: 500 }
    )
  }
}
