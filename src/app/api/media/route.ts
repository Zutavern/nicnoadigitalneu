import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { 
  getMediaFiles, 
  getMediaStats, 
  createMediaFile,
} from '@/lib/media/media-service'
import { UPLOAD_CONTEXT_TO_CATEGORY } from '@/lib/media'
import type { MediaCategory } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/media - Liste aller Medien mit Filterung
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const category = searchParams.get('category') as MediaCategory | null
    const search = searchParams.get('search') || undefined
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'size' | 'originalName'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    const includeStats = searchParams.get('stats') === 'true'

    // Admin sieht alle Medien, andere nur ihre eigenen
    const isAdmin = session.user.role === 'ADMIN'
    const userId = isAdmin ? null : session.user.id

    const result = await getMediaFiles(
      userId,
      { category: category || undefined, search, sortBy, sortOrder },
      page,
      limit
    )

    // Optional: Include stats
    let stats = null
    if (includeStats) {
      stats = await getMediaStats(userId)
    }

    return NextResponse.json({
      ...result,
      stats,
    })
  } catch (error) {
    console.error('Error fetching media files:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Medien' },
      { status: 500 }
    )
  }
}

// POST /api/media - Neue Datei hochladen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const contextRaw = formData.get('context') as string | null
    const categoryRaw = formData.get('category') as MediaCategory | null
    const alt = formData.get('alt') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp', 
      'image/svg+xml',
      'application/pdf',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Ungültiges Dateiformat. Erlaubt: JPEG, PNG, GIF, WebP, SVG, PDF' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei zu groß. Maximum: 10MB' },
        { status: 400 }
      )
    }

    // Determine category
    let category: MediaCategory = categoryRaw || 'GENERAL'
    if (!categoryRaw && contextRaw) {
      category = UPLOAD_CONTEXT_TO_CATEGORY[contextRaw] || 'GENERAL'
    }

    // Generate filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() || 'file'
    const categoryPath = category.toLowerCase().replace('_', '-')
    const filename = `media/${categoryPath}/${session.user.id}/${timestamp}-${randomString}.${extension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    })

    // Get image dimensions if it's an image
    let width: number | undefined
    let height: number | undefined
    // Note: For full dimension support, you'd need to use sharp or similar on the server

    // Create database entry
    const mediaFile = await createMediaFile({
      userId: session.user.id,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: blob.url,
      category,
      uploadContext: contextRaw || undefined,
      alt: alt || undefined,
      width,
      height,
    })

    return NextResponse.json({
      success: true,
      file: mediaFile,
      url: blob.url,
    })
  } catch (error) {
    console.error('Error uploading media file:', error)
    return NextResponse.json(
      { error: 'Fehler beim Hochladen' },
      { status: 500 }
    )
  }
}

