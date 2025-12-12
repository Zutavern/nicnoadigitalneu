import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteRoom } from '@/lib/daily-server'
import { triggerPusherEvent, getUserChannel, PUSHER_EVENTS } from '@/lib/pusher-server'
import { isDemoModeActive } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

/**
 * POST /api/video-call/reject
 * Reject an incoming video call
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
    const { callId, callerId, reason } = body

    if (!callId || !callerId) {
      return NextResponse.json(
        { error: 'callId und callerId sind erforderlich' },
        { status: 400 }
      )
    }

    // Notify caller that call was rejected
    const callerChannel = getUserChannel(callerId)
    await triggerPusherEvent(callerChannel, PUSHER_EVENTS.CALL_REJECTED, {
      callId,
      rejectedBy: {
        id: session.user.id,
        name: session.user.name,
      },
      reason: reason || 'declined',
      rejectedAt: new Date().toISOString(),
    })

    // Delete the room
    try {
      await deleteRoom(callId)
    } catch {
      // Ignore errors if room doesn't exist
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting video call:', error)
    return NextResponse.json(
      { error: 'Fehler beim Ablehnen des Video-Calls' },
      { status: 500 }
    )
  }
}
