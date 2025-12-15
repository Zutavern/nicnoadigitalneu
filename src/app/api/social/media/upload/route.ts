/**
 * Social Media Upload Route
 * 
 * POST /api/social/media/upload
 * Lädt Medien für Social Media Posts hoch
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put, del } from '@vercel/blob'

// Erlaubte Dateitypen
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif',
]

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/webm',
]

// Größenlimits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const platform = formData.get('platform') as string | null
    const postId = formData.get('postId') as string | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      )
    }
    
    // Dateityp prüfen
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { 
          error: 'Ungültiger Dateityp. Erlaubt: JPEG, PNG, WebP, GIF, MP4, MOV, WebM',
          allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES],
        },
        { status: 400 }
      )
    }
    
    // Größe prüfen
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: `Datei zu groß. Maximum: ${isImage ? '10MB' : '100MB'}`,
          maxSize,
          fileSize: file.size,
        },
        { status: 400 }
      )
    }
    
    // Eindeutigen Dateinamen generieren
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || (isImage ? 'jpg' : 'mp4')
    const mediaType = isImage ? 'images' : 'videos'
    const fileName = `${session.user.id}-${timestamp}.${extension}`
    const blobPath = `social/${mediaType}/${fileName}`
    
    // Zu Vercel Blob hochladen
    const blob = await put(blobPath, file, {
      access: 'public',
      contentType: file.type,
    })
    
    // Metadaten extrahieren
    const metadata = {
      originalName: file.name,
      size: file.size,
      type: file.type,
      isImage,
      isVideo,
      platform: platform?.toUpperCase() || null,
      postId: postId || null,
      uploadedAt: new Date().toISOString(),
    }
    
    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      mediaType: isImage ? 'image' : 'video',
      metadata,
    })
  } catch (error) {
    console.error('[Media Upload] Error:', error)
    return NextResponse.json(
      { error: 'Upload fehlgeschlagen' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Medien löschen
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL ist erforderlich' },
        { status: 400 }
      )
    }
    
    // Prüfen ob URL vom User ist (enthält User-ID im Pfad)
    if (!url.includes(session.user.id) && !url.includes('social/')) {
      return NextResponse.json(
        { error: 'Nicht berechtigt diese Datei zu löschen' },
        { status: 403 }
      )
    }
    
    // Von Vercel Blob löschen
    if (url.includes('blob.vercel-storage.com')) {
      await del(url)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Media Delete] Error:', error)
    return NextResponse.json(
      { error: 'Löschen fehlgeschlagen' },
      { status: 500 }
    )
  }
}

