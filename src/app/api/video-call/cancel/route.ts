import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { triggerPusherEvent, getUserChannel, PUSHER_EVENTS } from '@/lib/pusher-server'
import { isDemoModeActive } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

/**
 * POST /api/video-call/cancel
 * Cancel an outgoing video call before it's answered
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
    const { callId, calleeId } = body

    if (!callId || !calleeId) {
      return NextResponse.json(
        { error: 'callId und calleeId sind erforderlich' },
        { status: 400 }
      )
    }

    // Notify the callee that the call was cancelled
    const calleeChannel = getUserChannel(calleeId)
    await triggerPusherEvent(calleeChannel, PUSHER_EVENTS.CALL_ENDED, {
      callId,
      cancelledBy: session.user.id,
      reason: 'cancelled',
      cancelledAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling video call:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abbrechen des Video-Calls' },
      { status: 500 }
    )
  }
}


