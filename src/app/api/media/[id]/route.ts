import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { 
  getMediaFileById, 
  updateMediaFile, 
  deleteMediaFile,
  restoreMediaFile,
} from '@/lib/media/media-service'
import type { MediaCategory } from '@prisma/client'

export const dynamic = 'force-dynamic'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/media/[id] - Einzelne Datei mit Verwendungsinfo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Admin hat Zugriff auf alle Dateien
    const isAdmin = session.user.role === 'ADMIN'
    const userId = isAdmin ? null : session.user.id

    const file = await getMediaFileById(id, userId)

    if (!file) {
      return NextResponse.json({ error: 'Datei nicht gefunden' }, { status: 404 })
    }

    // Zusätzliche Infos für Admin
    const isOwnFile = file.userId === session.user.id

    return NextResponse.json({ 
      file,
      isOwnFile,
      isDeleted: !!file.deletedAt,
    })
  } catch (error) {
    console.error('Error fetching media file:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Datei' },
      { status: 500 }
    )
  }
}

// PATCH /api/media/[id] - Datei-Metadaten aktualisieren
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Admin hat Zugriff auf alle Dateien
    const isAdmin = session.user.role === 'ADMIN'
    const userId = isAdmin ? null : session.user.id

    const body = await request.json()
    const { alt, category } = body as { alt?: string; category?: MediaCategory }

    const file = await updateMediaFile(id, userId, { alt, category })

    if (!file) {
      return NextResponse.json({ error: 'Datei nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      file,
    })
  } catch (error) {
    console.error('Error updating media file:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren' },
      { status: 500 }
    )
  }
}

// DELETE /api/media/[id] - Datei löschen (Soft-Delete oder permanent)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Admin hat Zugriff auf alle Dateien
    const isAdmin = session.user.role === 'ADMIN'
    const userId = isAdmin ? null : session.user.id

    const searchParams = request.nextUrl.searchParams
    const force = searchParams.get('force') === 'true'
    const permanent = searchParams.get('permanent') === 'true'

    const result = await deleteMediaFile(id, userId, session.user.id, { force, permanent })

    if (!result.success) {
      // If file is in use, return 409 Conflict with usage info
      if (result.usages && result.usages.length > 0) {
        return NextResponse.json(
          { 
            error: result.error,
            usages: result.usages,
            inUse: true,
          },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      softDeleted: result.softDeleted,
      permanentlyDeleted: result.permanentlyDeleted,
      referencesRemoved: result.referencesRemoved,
    })
  } catch (error) {
    console.error('Error deleting media file:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen' },
      { status: 500 }
    )
  }
}

// POST /api/media/[id] - Datei wiederherstellen (nur für soft-deleted)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body as { action: string }

    if (action !== 'restore') {
      return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 })
    }

    // Admin hat Zugriff auf alle Dateien
    const isAdmin = session.user.role === 'ADMIN'
    const userId = isAdmin ? null : session.user.id

    const result = await restoreMediaFile(id, userId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error restoring media file:', error)
    return NextResponse.json(
      { error: 'Fehler beim Wiederherstellen' },
      { status: 500 }
    )
  }
}

