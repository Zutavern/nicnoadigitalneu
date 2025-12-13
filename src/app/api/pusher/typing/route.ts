import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { triggerPusherEvent, getConversationChannel, PUSHER_EVENTS } from '@/lib/pusher-server'

export const dynamic = 'force-dynamic'

// POST: Send typing indicator
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
    const { conversationId, isTyping } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId erforderlich' },
        { status: 400 }
      )
    }

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Zugriff verweigert' },
        { status: 403 }
      )
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Trigger typing event via Pusher
    const channel = getConversationChannel(conversationId)
    const event = isTyping ? PUSHER_EVENTS.USER_TYPING : PUSHER_EVENTS.USER_STOPPED_TYPING
    
    await triggerPusherEvent(channel, event, {
      userId: user.id,
      userName: user.name || 'Unbekannt',
      userImage: user.image,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Typing indicator error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden des Typing-Indicators' },
      { status: 500 }
    )
  }
}



