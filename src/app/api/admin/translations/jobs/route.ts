import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET: Jobs abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const languageId = searchParams.get('languageId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (languageId) where.languageId = languageId

    const [jobs, total] = await Promise.all([
      prisma.translationJob.findMany({
        where,
        include: {
          language: {
            select: { id: true, nativeName: true, flag: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.translationJob.count({ where })
    ])

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Jobs' },
      { status: 500 }
    )
  }
}

// DELETE: Jobs löschen (einzeln oder alle fehlgeschlagenen)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearFailed = searchParams.get('clearFailed')

    if (clearFailed === 'true') {
      const result = await prisma.translationJob.deleteMany({
        where: { status: 'FAILED' }
      })
      return NextResponse.json({ deleted: result.count })
    }

    if (id) {
      await prisma.translationJob.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'ID or clearFailed required' }, { status: 400 })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen' },
      { status: 500 }
    )
  }
}

// POST: Job neu starten (retry)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, retryAll } = await request.json()

    if (retryAll) {
      const result = await prisma.translationJob.updateMany({
        where: { status: 'FAILED' },
        data: {
          status: 'PENDING',
          attempts: 0,
          lastError: null,
        }
      })
      return NextResponse.json({ retried: result.count })
    }

    if (id) {
      await prisma.translationJob.update({
        where: { id },
        data: {
          status: 'PENDING',
          attempts: 0,
          lastError: null,
        }
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'ID or retryAll required' }, { status: 400 })
  } catch (error) {
    console.error('Error retrying job:', error)
    return NextResponse.json(
      { error: 'Fehler beim Neustarten' },
      { status: 500 }
    )
  }
}
