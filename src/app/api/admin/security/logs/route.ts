import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockAdminSecurity } from '@/lib/mock-data'

// GET /api/admin/security/logs - Hole Security Logs
export async function GET(request: Request) {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive({ ignoreForAdmin: true })) {
      const mockData = getMockAdminSecurity()
      return NextResponse.json({
        logs: mockData.logs,
        pagination: { page: 1, limit: 50, total: mockData.logs.length, totalPages: 1 },
        stats: {
          successCount: mockData.logs.filter(l => l.status === 'SUCCESS').length,
          failedCount: mockData.logs.filter(l => l.status === 'FAILED').length,
          warningCount: mockData.logs.filter(l => l.status === 'WARNING').length,
          infoCount: mockData.logs.filter(l => l.status === 'INFO').length,
        }
      })
    }

    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const event = searchParams.get('event')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (event) where.event = event
    if (status) where.status = status
    if (userId) where.userId = userId
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate)
    }

    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.securityLog.count({ where })
    ])

    // Statistiken für die letzten 24 Stunden
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const stats = await prisma.securityLog.groupBy({
      by: ['status'],
      where: { createdAt: { gte: last24h } },
      _count: true
    })

    const statsMap = {
      successCount: stats.find(s => s.status === 'SUCCESS')?._count || 0,
      failedCount: stats.find(s => s.status === 'FAILED')?._count || 0,
      warningCount: stats.find(s => s.status === 'WARNING')?._count || 0,
      infoCount: stats.find(s => s.status === 'INFO')?._count || 0
    }

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: statsMap
    })
  } catch (error) {
    console.error('Error fetching security logs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Sicherheitslogs' },
      { status: 500 }
    )
  }
}

// POST /api/admin/security/logs - Erstelle einen Log-Eintrag (intern)
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { event, status, message, metadata } = body

    const log = await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email || 'unknown',
        event,
        status: status || 'INFO',
        message,
        metadata,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   undefined,
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating security log:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Logs' },
      { status: 500 }
    )
  }
}

