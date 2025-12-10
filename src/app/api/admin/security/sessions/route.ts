import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockAdminSecurity } from '@/lib/mock-data'

// GET /api/admin/security/sessions - Hole aktive Sessions
export async function GET(request: Request) {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      const mockData = getMockAdminSecurity()
      return NextResponse.json({
        sessions: mockData.sessions,
        pagination: { page: 1, limit: 20, total: mockData.sessions.length, totalPages: 1 },
        stats: { totalActive: mockData.summary.activeSessions }
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {
      isActive: true,
      expiresAt: { gte: new Date() }
    }
    
    if (userId) where.userId = userId

    const [sessions, total] = await Promise.all([
      prisma.activeSession.findMany({
        where,
        orderBy: { lastActiveAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.activeSession.count({ where })
    ])

    // Hole User-Infos für die Sessions
    const userIds = [...new Set(sessions.map(s => s.userId))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, image: true, role: true }
    })

    const usersMap = new Map(users.map(u => [u.id, u]))

    const sessionsWithUsers = sessions.map(s => ({
      ...s,
      user: usersMap.get(s.userId) || null
    }))

    // Statistiken
    const stats = {
      totalActive: total,
      byDevice: await prisma.activeSession.groupBy({
        by: ['device'],
        where: { isActive: true, expiresAt: { gte: new Date() } },
        _count: true
      }),
      byLocation: await prisma.activeSession.groupBy({
        by: ['location'],
        where: { isActive: true, expiresAt: { gte: new Date() }, location: { not: null } },
        _count: true,
        take: 10
      })
    }

    return NextResponse.json({
      sessions: sessionsWithUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Sessions' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/security/sessions - Beende eine oder alle Sessions
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    const terminateAll = searchParams.get('terminateAll') === 'true'

    if (!sessionId && !userId && !terminateAll) {
      return NextResponse.json(
        { error: 'sessionId, userId oder terminateAll Parameter erforderlich' },
        { status: 400 }
      )
    }

    let result

    if (sessionId) {
      // Einzelne Session beenden
      const targetSession = await prisma.activeSession.findUnique({
        where: { id: sessionId }
      })

      if (!targetSession) {
        return NextResponse.json({ error: 'Session nicht gefunden' }, { status: 404 })
      }

      // Markiere ActiveSession als inaktiv
      result = await prisma.activeSession.update({
        where: { id: sessionId },
        data: { isActive: false }
      })

      // Lösche auch die echte Next-Auth Session (falls vorhanden)
      if (targetSession.sessionToken) {
        await prisma.session.deleteMany({
          where: { sessionToken: targetSession.sessionToken }
        }).catch(() => {})
      }

      // Lösche alle Sessions des Users aus der Next-Auth sessions Tabelle
      await prisma.session.deleteMany({
        where: { userId: targetSession.userId }
      }).catch(() => {})

      // Log erstellen
      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          event: 'SESSION_TERMINATED',
          status: 'SUCCESS',
          message: `Session ${sessionId} beendet (User: ${targetSession.userId})`,
          metadata: { targetSessionId: sessionId, targetUserId: targetSession.userId }
        }
      })
    } else if (userId) {
      // Alle Sessions eines Users beenden
      result = await prisma.activeSession.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      })

      // Lösche echte Next-Auth Sessions des Users
      await prisma.session.deleteMany({
        where: { userId }
      }).catch(() => {})

      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          event: 'SESSION_TERMINATED',
          status: 'SUCCESS',
          message: `Alle Sessions von User ${userId} beendet`,
          metadata: { targetUserId: userId, count: result.count }
        }
      })
    } else if (terminateAll) {
      // Alle Sessions beenden (außer aktuelle Admin-Session)
      result = await prisma.activeSession.updateMany({
        where: { 
          isActive: true,
          userId: { not: session.user.id }
        },
        data: { isActive: false }
      })

      // Lösche alle echten Next-Auth Sessions (außer vom aktuellen Admin)
      await prisma.session.deleteMany({
        where: { 
          userId: { not: session.user.id }
        }
      }).catch(() => {})

      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          userEmail: session.user.email || 'unknown',
          event: 'SESSION_TERMINATED',
          status: 'WARNING',
          message: `Alle Sessions beendet (außer Admin)`,
          metadata: { count: result.count }
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Session(s) erfolgreich beendet',
      result 
    })
  } catch (error) {
    console.error('Error terminating sessions:', error)
    return NextResponse.json(
      { error: 'Fehler beim Beenden der Session(s)' },
      { status: 500 }
    )
  }
}
