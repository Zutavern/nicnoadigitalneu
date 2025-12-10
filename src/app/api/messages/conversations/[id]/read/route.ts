import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/messages/conversations/[id]/read - Konversation als gelesen markieren
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

    // Prüfe ob User Teilnehmer ist und update lastReadAt
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

    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    return NextResponse.json(
      { error: 'Fehler beim Markieren als gelesen' },
      { status: 500 }
    )
  }
}





