import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/notifications/[id]/read - Einzelne Benachrichtigung als gelesen markieren
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

    const { id } = await params

    // Prüfen ob die Benachrichtigung dem User gehört
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Benachrichtigung nicht gefunden' },
        { status: 404 }
      )
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Fehler beim Markieren der Benachrichtigung' },
      { status: 500 }
    )
  }
}





