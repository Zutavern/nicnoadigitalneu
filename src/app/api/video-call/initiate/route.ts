import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createVideoCall, isDailyEnabled } from '@/lib/daily-server'
import { triggerPusherEvent, getUserChannel, PUSHER_EVENTS } from '@/lib/pusher-server'
import { isDemoModeActive } from '@/lib/mock-data'
import { handleIncomingCall } from '@/lib/video-call-messages'

export const dynamic = 'force-dynamic'

/**
 * POST /api/video-call/initiate
 * Initiates a video call with another user
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

    // Check if Daily is enabled
    const dailyEnabled = await isDailyEnabled()
    if (!dailyEnabled) {
      return NextResponse.json(
        { error: 'Video-Calls sind deaktiviert' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { calleeId, conversationId } = body

    if (!calleeId) {
      return NextResponse.json(
        { error: 'calleeId ist erforderlich' },
        { status: 400 }
      )
    }

    // Get caller and callee info
    const [caller, callee] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, image: true, isOnline: true },
      }),
      prisma.user.findUnique({
        where: { id: calleeId },
        select: { id: true, name: true, email: true, image: true, isOnline: true },
      }),
    ])

    if (!caller || !callee) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Check if callee is online
    if (!callee.isOnline) {
      return NextResponse.json(
        { error: 'Der Benutzer ist nicht online' },
        { status: 400 }
      )
    }

    // Create the video call (room + tokens)
    const videoCall = await createVideoCall(
      caller.id,
      caller.name || caller.email,
      callee.id,
      callee.name || callee.email
    )

    // Send call invitation via Pusher to the callee
    const calleeChannel = getUserChannel(callee.id)
    await triggerPusherEvent(calleeChannel, PUSHER_EVENTS.INCOMING_CALL, {
      callId: videoCall.room.name,
      roomUrl: videoCall.room.url,
      token: videoCall.calleeToken,
      caller: {
        id: caller.id,
        name: caller.name,
        email: caller.email,
        image: caller.image,
      },
      conversationId,
      createdAt: new Date().toISOString(),
    })

    // Create notification and track analytics
    await handleIncomingCall({
      callId: videoCall.room.name,
      caller: {
        id: caller.id,
        name: caller.name,
        email: caller.email || undefined,
        image: caller.image,
      },
      callee: {
        id: callee.id,
        name: callee.name,
        email: callee.email || undefined,
        image: callee.image,
      },
    })

    return NextResponse.json({
      callId: videoCall.room.name,
      roomUrl: videoCall.room.url,
      token: videoCall.callerToken,
      callee: {
        id: callee.id,
        name: callee.name,
        image: callee.image,
      },
    })
  } catch (error) {
    console.error('Error initiating video call:', error)
    return NextResponse.json(
      { error: 'Fehler beim Starten des Video-Calls' },
      { status: 500 }
    )
  }
}

