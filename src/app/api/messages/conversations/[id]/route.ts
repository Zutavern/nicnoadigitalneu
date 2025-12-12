import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockMessages, getMockConversations } from '@/lib/mock-data'

// GET /api/messages/conversations/[id] - Einzelne Konversation mit Nachrichten
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      const mockConvs = getMockConversations()
      const mockConv = mockConvs.conversations.find((c: { id: string }) => c.id === id)
      const mockMessages = getMockMessages(id)
      
      if (mockConv) {
        return NextResponse.json({
          conversation: {
            id: mockConv.id,
            type: mockConv.type,
            subject: mockConv.subject,
            participants: mockConv.participants.map((p: { user: { id: string; name: string; image: string | null; role: string } }) => ({
              id: p.user.id,
              name: p.user.name,
              image: p.user.image,
              role: p.user.role,
            })),
          },
          messages: mockMessages,
          hasMore: false,
          nextCursor: null,
        })
      }
    }

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const take = parseInt(searchParams.get('take') || '50')
    const cursor = searchParams.get('cursor')

    // Prüfe ob User Teilnehmer ist
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Zugriff verweigert' },
        { status: 403 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Konversation nicht gefunden' },
        { status: 404 }
      )
    }

    // Hole Nachrichten mit Pagination
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      take: take + 1, // +1 um zu prüfen ob es mehr gibt
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attachments: true,
      },
    })

    const hasMore = messages.length > take
    const returnMessages = hasMore ? messages.slice(0, -1) : messages

    // Format Messages für Frontend
    const formattedMessages = returnMessages.reverse().map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      createdAt: msg.createdAt.toISOString(),
      isRead: true, // Simplified for now
      sender: msg.sender,
    }))

    // Format participants
    const formattedParticipants = conversation.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      image: p.user.image,
      role: p.user.role,
    }))

    return NextResponse.json({
      conversation: {
        ...conversation,
        participants: formattedParticipants,
      },
      messages: formattedMessages, // Älteste zuerst für Chat-Ansicht
      hasMore,
      nextCursor: hasMore ? returnMessages[0]?.id : null,
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Konversation' },
      { status: 500 }
    )
  }
}

// DELETE /api/messages/conversations/[id] - Konversation verlassen/löschen
export async function DELETE(
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

    const { id } = await params

    // Prüfe ob User Teilnehmer ist
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Zugriff verweigert' },
        { status: 403 }
      )
    }

    // Entferne User aus Konversation
    await prisma.conversationParticipant.delete({
      where: { id: participant.id },
    })

    // Prüfe ob noch andere Teilnehmer vorhanden
    const remainingParticipants = await prisma.conversationParticipant.count({
      where: { conversationId: id },
    })

    // Lösche Konversation wenn keine Teilnehmer mehr
    if (remainingParticipants === 0) {
      await prisma.conversation.delete({
        where: { id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Konversation' },
      { status: 500 }
    )
  }
}

