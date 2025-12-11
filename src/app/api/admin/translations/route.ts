import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET: Übersetzungen und Jobs abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const languageId = searchParams.get('languageId')
    const status = searchParams.get('status')
    const contentType = searchParams.get('contentType')
    const isOutdated = searchParams.get('isOutdated')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Translations mit Filter
    const where: Record<string, unknown> = {}
    if (languageId) where.languageId = languageId
    if (status) where.status = status
    if (contentType) where.contentType = contentType
    if (isOutdated === 'true') where.isOutdated = true

    const [translations, total] = await Promise.all([
      prisma.translation.findMany({
        where,
        include: {
          language: {
            select: { id: true, nativeName: true, flag: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.translation.count({ where })
    ])

    // Statistiken
    const [
      totalTranslations,
      pendingTranslations,
      translatedCount,
      outdatedCount,
      pendingJobs,
      processingJobs,
      failedJobs
    ] = await Promise.all([
      prisma.translation.count(),
      prisma.translation.count({ where: { status: 'PENDING' } }),
      prisma.translation.count({ where: { status: 'TRANSLATED' } }),
      prisma.translation.count({ where: { isOutdated: true } }),
      prisma.translationJob.count({ where: { status: 'PENDING' } }),
      prisma.translationJob.count({ where: { status: 'PROCESSING' } }),
      prisma.translationJob.count({ where: { status: 'FAILED' } }),
    ])

    // Content Types für Filter
    const contentTypes = await prisma.translation.groupBy({
      by: ['contentType'],
      _count: true,
    })

    return NextResponse.json({
      translations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalTranslations,
        pendingTranslations,
        translatedCount,
        outdatedCount,
        pendingJobs,
        processingJobs,
        failedJobs,
      },
      contentTypes: contentTypes.map(ct => ({
        type: ct.contentType,
        count: ct._count,
      })),
    })
  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Übersetzungen' },
      { status: 500 }
    )
  }
}

// DELETE: Übersetzung löschen
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.translation.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting translation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen' },
      { status: 500 }
    )
  }
}
