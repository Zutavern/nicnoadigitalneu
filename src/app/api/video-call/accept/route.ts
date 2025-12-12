import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { triggerPusherEvent, getUserChannel, PUSHER_EVENTS } from '@/lib/pusher-server'
import { isDemoModeActive } from '@/lib/mock-data'
import { handleCallAnswered } from '@/lib/video-call-messages'

export const dynamic = 'force-dynamic'

/**
 * POST /api/video-call/accept
 * Accept an incoming video call
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
    const { callId, callerId } = body

    if (!callId || !callerId) {
      return NextResponse.json(
        { error: 'callId und callerId sind erforderlich' },
        { status: 400 }
      )
    }

    // Notify caller that call was accepted
    const callerChannel = getUserChannel(callerId)
    await triggerPusherEvent(callerChannel, PUSHER_EVENTS.CALL_ACCEPTED, {
      callId,
      acceptedBy: {
        id: session.user.id,
        name: session.user.name,
      },
      acceptedAt: new Date().toISOString(),
    })

    // Track analytics
    await handleCallAnswered({
      callId,
      callerId,
      calleeId: session.user.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error accepting video call:', error)
    return NextResponse.json(
      { error: 'Fehler beim Annehmen des Video-Calls' },
      { status: 500 }
    )
  }
}
