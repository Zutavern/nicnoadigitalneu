import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { googleBusinessTokenService } from '@/lib/google-business/token-service'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Get user's connection
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: session.user.id },
    })

    if (!connection) {
      return NextResponse.json(
        { error: 'Keine Verbindung gefunden' },
        { status: 404 }
      )
    }

    // Delete connection (and revoke tokens)
    await googleBusinessTokenService.deleteConnection(connection.id)

    return NextResponse.json({ 
      success: true,
      message: 'Google Business Verbindung erfolgreich getrennt'
    })
  } catch (error) {
    console.error('Error disconnecting Google Business:', error)
    return NextResponse.json(
      { error: 'Fehler beim Trennen der Verbindung' },
      { status: 500 }
    )
  }
}

