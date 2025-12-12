import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { isDemoModeActive } from '@/lib/mock-data'
import { 
  triggerPusherEvent, 
  getConversationChannel, 
  getUserChannel,
  PUSHER_EVENTS 
} from '@/lib/pusher-server'

// POST /api/messages/conversations/[id]/messages - Nachricht senden
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nachricht darf nicht leer sein' },
        { status: 400 }
      )
    }

    // Demo-Modus - simuliere eine Nachricht
    if (await isDemoModeActive()) {
      const demoMessage = {
        id: `demo-${Date.now()}`,
        content: content.trim(),
        senderId: '00000000-0000-0000-0000-000000000001',
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Admin Test',
          image: null,
        },
      }
      return NextResponse.json(demoMessage, { status: 201 })
    }

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Prüfe ob User Teilnehmer ist
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

    // Erstelle Nachricht
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // Update lastReadAt für den Sender
    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    })

    // Format für Frontend
    const formattedMessage = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt.toISOString(),
      isRead: false,
      sender: message.sender,
    }

    // 🔴 PUSHER: Sende Echtzeit-Event an alle Teilnehmer der Conversation
    const conversationChannel = getConversationChannel(conversationId)
    await triggerPusherEvent(conversationChannel, PUSHER_EVENTS.NEW_MESSAGE, {
      message: formattedMessage,
      conversationId,
    })

    // Sende Benachrichtigungen an andere Teilnehmer
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: session.user.id },
      },
      select: { userId: true },
    })

    // 🔴 PUSHER: Sende auch an private User Channels (für Badge-Updates etc.)
    await Promise.all(
      otherParticipants.map(async (p) => {
        // Pusher Event an User Channel
        const userChannel = getUserChannel(p.userId)
        await triggerPusherEvent(userChannel, PUSHER_EVENTS.NEW_NOTIFICATION, {
          type: 'NEW_MESSAGE',
          conversationId,
          messageId: message.id,
          senderName: session.user.name || 'Jemand',
        })

        // Datenbank Notification
        return createNotification({
          userId: p.userId,
          type: 'NEW_MESSAGE',
          title: 'Neue Nachricht',
          message: `${session.user.name || 'Jemand'} hat dir eine Nachricht gesendet`,
          link: `/admin/messaging?conversation=${conversationId}`,
          metadata: { conversationId, messageId: message.id },
        })
      })
    )

    return NextResponse.json(formattedMessage, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Nachricht' },
      { status: 500 }
    )
  }
}

