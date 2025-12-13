import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPusherServer } from '@/lib/pusher-server'

export const dynamic = 'force-dynamic'

// POST: Authenticate Pusher channels (private & presence)
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Get Pusher server instance
    const pusher = await getPusherServer()
    if (!pusher) {
      return NextResponse.json(
        { error: 'Pusher nicht konfiguriert' },
        { status: 503 }
      )
    }

    // Parse form data from Pusher client
    const formData = await request.formData()
    const socketId = formData.get('socket_id') as string
    const channelName = formData.get('channel_name') as string

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'socket_id und channel_name erforderlich' },
        { status: 400 }
      )
    }

    // Validate channel access
    const canAccess = await validateChannelAccess(
      session.user.id,
      channelName
    )

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Zugriff auf Channel verweigert' },
        { status: 403 }
      )
    }

    // Presence channel auth (includes user data)
    if (channelName.startsWith('presence-')) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Benutzer nicht gefunden' },
          { status: 404 }
        )
      }

      // Update lastSeenAt
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          lastSeenAt: new Date(),
          isOnline: true,
        },
      })

      // Presence data for other users to see
      const presenceData = {
        user_id: user.id,
        user_info: {
          name: user.name || user.email,
          email: user.email,
          image: user.image,
          role: user.role,
        },
      }

      const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData)
      return NextResponse.json(authResponse)
    }

    // Private channel auth (no user data exposed)
    if (channelName.startsWith('private-')) {
      const authResponse = pusher.authorizeChannel(socketId, channelName)
      return NextResponse.json(authResponse)
    }

    // Public channels don't need auth
    return NextResponse.json(
      { error: 'Channel-Typ nicht unterstützt' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Pusher auth error:', error)
    return NextResponse.json(
      { error: 'Authentifizierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}

// Validate if user has access to the channel
async function validateChannelAccess(
  userId: string,
  channelName: string
): Promise<boolean> {
  // Global presence channel - all authenticated users can join
  if (channelName === 'presence-global') {
    return true
  }

  // User-specific private channel
  if (channelName.startsWith('private-user-')) {
    const targetUserId = channelName.replace('private-user-', '')
    return targetUserId === userId
  }

  // Conversation presence channel
  if (channelName.startsWith('presence-conversation-')) {
    const conversationId = channelName.replace('presence-conversation-', '')
    
    // Check if user is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    })

    return !!participant
  }

  // Unknown channel type - deny access
  return false
}


