import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET: Alle Sprachen abrufen
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const languages = await prisma.language.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            translations: true,
            translationJobs: {
              where: { status: 'PENDING' }
            }
          }
        }
      }
    })

    // Statistiken pro Sprache berechnen
    const languagesWithStats = await Promise.all(
      languages.map(async (lang) => {
        const [totalTranslations, outdatedTranslations, pendingJobs] = await Promise.all([
          prisma.translation.count({
            where: { languageId: lang.id }
          }),
          prisma.translation.count({
            where: { languageId: lang.id, isOutdated: true }
          }),
          prisma.translationJob.count({
            where: { languageId: lang.id, status: 'PENDING' }
          })
        ])

        return {
          ...lang,
          stats: {
            totalTranslations,
            outdatedTranslations,
            pendingJobs
          }
        }
      })
    )

    return NextResponse.json(languagesWithStats)
  } catch (error) {
    console.error('Error fetching languages:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Sprachen' },
      { status: 500 }
    )
  }
}

// PUT: Sprache aktualisieren (aktivieren/deaktivieren, Reihenfolge, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id, isActive, isDefault, sortOrder } = data

    // Wenn als Default gesetzt wird, andere Default entfernen
    if (isDefault === true) {
      await prisma.language.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    // Deaktivierung tracken für SEO
    const existingLang = await prisma.language.findUnique({ where: { id } })
    const deactivatedAt = isActive === false && existingLang?.isActive === true
      ? new Date()
      : isActive === true
        ? null
        : existingLang?.deactivatedAt

    const updated = await prisma.language.update({
      where: { id },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof isDefault === 'boolean' && { isDefault }),
        ...(typeof sortOrder === 'number' && { sortOrder }),
        deactivatedAt,
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating language:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Sprache' },
      { status: 500 }
    )
  }
}

// POST: Reihenfolge aller Sprachen aktualisieren (Bulk)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { languages } = await request.json()

    // Bulk-Update der Reihenfolge
    await Promise.all(
      languages.map((lang: { id: string; sortOrder: number }) =>
        prisma.language.update({
          where: { id: lang.id },
          data: { sortOrder: lang.sortOrder }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering languages:', error)
    return NextResponse.json(
      { error: 'Fehler beim Sortieren der Sprachen' },
      { status: 500 }
    )
  }
}
