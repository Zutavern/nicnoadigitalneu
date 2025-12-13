import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST: Update user presence (heartbeat)
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'offline') {
      // User explicitly going offline
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isOnline: false,
          lastSeenAt: new Date(),
        },
      })
    } else {
      // Heartbeat - update lastSeenAt
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isOnline: true,
          lastSeenAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Presence update error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Präsenz' },
      { status: 500 }
    )
  }
}

// GET: Get online users for a conversation or globally
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    // Consider users online if they were seen in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)

    if (conversationId) {
      // Get online status for conversation participants
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
        },
      })

      const onlineStatus = participants.map((p) => ({
        userId: p.userId,
        name: p.user.name,
        image: p.user.image,
        isOnline: p.user.isOnline && p.user.lastSeenAt && p.user.lastSeenAt > twoMinutesAgo,
        lastSeenAt: p.user.lastSeenAt,
      }))

      return NextResponse.json({ participants: onlineStatus })
    }

    // Get all online users (for admin view)
    const onlineUsers = await prisma.user.findMany({
      where: {
        isOnline: true,
        lastSeenAt: { gte: twoMinutesAgo },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        lastSeenAt: true,
      },
      orderBy: { lastSeenAt: 'desc' },
    })

    return NextResponse.json({ onlineUsers })
  } catch (error) {
    console.error('Get presence error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Präsenz' },
      { status: 500 }
    )
  }
}



