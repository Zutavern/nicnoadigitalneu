import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { googleBusinessTokenService } from '@/lib/google-business/token-service'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const status = await googleBusinessTokenService.getConnectionStatus(session.user.id)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting Google Business status:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Status' },
      { status: 500 }
    )
  }
}

