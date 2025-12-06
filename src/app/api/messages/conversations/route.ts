import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages/conversations - Alle Konversationen des Users
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
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
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Berechne ungelesene Nachrichten pro Konversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(
          (p) => p.userId === session.user.id
        )
        
        const unreadCount = participant?.lastReadAt
          ? await prisma.message.count({
              where: {
                conversationId: conv.id,
                createdAt: { gt: participant.lastReadAt },
                senderId: { not: session.user.id },
              },
            })
          : await prisma.message.count({
              where: {
                conversationId: conv.id,
                senderId: { not: session.user.id },
              },
            })

        return {
          ...conv,
          unreadCount,
          lastMessage: conv.messages[0] || null,
        }
      })
    )

    // Format für Frontend: participants als einfaches Array
    const formattedConversations = conversationsWithUnread.map((conv) => ({
      id: conv.id,
      type: conv.type,
      subject: conv.subject,
      participants: conv.participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        image: p.user.image,
        role: p.user.role,
      })),
      lastMessage: conv.lastMessage ? {
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt.toISOString(),
        isRead: conv.unreadCount === 0,
      } : null,
      unreadCount: conv.unreadCount,
      updatedAt: conv.updatedAt.toISOString(),
    }))

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Konversationen' },
      { status: 500 }
    )
  }
}

// POST /api/messages/conversations - Neue Konversation erstellen
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
    const { participantIds, subject, type = 'DIRECT', initialMessage } = body

    if (!participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Mindestens ein Teilnehmer erforderlich' },
        { status: 400 }
      )
    }

    // Füge den aktuellen User zu den Teilnehmern hinzu, falls nicht enthalten
    const allParticipantIds = [...new Set([...participantIds, session.user.id])]

    // Prüfe ob bereits eine direkte Konversation zwischen diesen Usern existiert
    if (type === 'DIRECT' && allParticipantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          AND: allParticipantIds.map((userId) => ({
            participants: {
              some: { userId },
            },
          })),
        },
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

      if (existingConversation) {
        return NextResponse.json(existingConversation)
      }
    }

    // Erstelle neue Konversation
    const conversation = await prisma.conversation.create({
      data: {
        type,
        subject,
        participants: {
          create: allParticipantIds.map((userId) => ({
            userId,
            role: userId === session.user.id ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
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

    // Sende initiale Nachricht, falls vorhanden
    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content: initialMessage,
        },
      })
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Konversation' },
      { status: 500 }
    )
  }
}

