import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMediaStats } from '@/lib/media/media-service'

export const dynamic = 'force-dynamic'

// GET /api/media/stats - Medien-Statistiken
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const stats = await getMediaStats(session.user.id)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching media stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken' },
      { status: 500 }
    )
  }
}

