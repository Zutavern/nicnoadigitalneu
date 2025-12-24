import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { syncBlobFilesWithDatabase } from '@/lib/media/media-service'

export const dynamic = 'force-dynamic'

// POST /api/media/sync - Synchronisiert Blob-Dateien mit der Datenbank
export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Only admins can sync all files
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const result = await syncBlobFilesWithDatabase(session.user.id)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Error syncing media files:', error)
    return NextResponse.json(
      { error: 'Fehler beim Synchronisieren' },
      { status: 500 }
    )
  }
}

