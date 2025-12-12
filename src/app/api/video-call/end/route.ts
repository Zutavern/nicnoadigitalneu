import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteRoom } from '@/lib/daily-server'
import { triggerPusherEvent, getUserChannel, PUSHER_EVENTS } from '@/lib/pusher-server'
import { isDemoModeActive } from '@/lib/mock-data'
import { handleCallEnded } from '@/lib/video-call-messages'

export const dynamic = 'force-dynamic'

/**
 * POST /api/video-call/end
 * End an active video call
 */
export async function POST(request: Request) {
  try {
    // Demo-Modus
    if (await isDemoModeActive()) {
      return NextResponse.json(
        { error: 'Video-Calls sind im Demo-Modus nicht verfügbar' },
        { status: 400 }
      )
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { callId, otherParticipantId, duration, conversationId } = body

    if (!callId) {
      return NextResponse.json(
        { error: 'callId ist erforderlich' },
        { status: 400 }
      )
    }

    // Get both users' info
    const [currentUser, otherUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, image: true },
      }),
      otherParticipantId ? prisma.user.findUnique({
        where: { id: otherParticipantId },
        select: { id: true, name: true, email: true, image: true },
      }) : null,
    ])

    // Notify the other participant that call ended
    if (otherParticipantId) {
      const otherChannel = getUserChannel(otherParticipantId)
      await triggerPusherEvent(otherChannel, PUSHER_EVENTS.CALL_ENDED, {
        callId,
        endedBy: {
          id: session.user.id,
          name: session.user.name,
        },
        duration: duration || 0,
        endedAt: new Date().toISOString(),
      })
    }

    // Create chat message and track analytics
    if (currentUser && otherUser && duration && duration > 0) {
      await handleCallEnded({
        callId,
        caller: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email || undefined,
          image: currentUser.image,
        },
        callee: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email || undefined,
          image: otherUser.image,
        },
        duration,
        conversationId,
      })
    }

    // Delete the room
    try {
      await deleteRoom(callId)
    } catch {
      // Ignore errors if room doesn't exist or already deleted
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error ending video call:', error)
    return NextResponse.json(
      { error: 'Fehler beim Beenden des Video-Calls' },
      { status: 500 }
    )
  }
}
