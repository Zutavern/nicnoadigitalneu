import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

// POST /api/messages/conversations/[id]/messages - Nachricht senden
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { id: conversationId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nachricht darf nicht leer sein' },
        { status: 400 }
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

    // Sende Benachrichtigungen an andere Teilnehmer
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: session.user.id },
      },
      select: { userId: true },
    })

    await Promise.all(
      otherParticipants.map((p) =>
        createNotification({
          userId: p.userId,
          type: 'NEW_MESSAGE',
          title: 'Neue Nachricht',
          message: `${session.user.name || 'Jemand'} hat dir eine Nachricht gesendet`,
          link: `/admin/messaging?conversation=${conversationId}`,
          metadata: { conversationId, messageId: message.id },
        })
      )
    )

    // Format für Frontend
    const formattedMessage = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt.toISOString(),
      isRead: false,
      sender: message.sender,
    }

    return NextResponse.json(formattedMessage, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Nachricht' },
      { status: 500 }
    )
  }
}

