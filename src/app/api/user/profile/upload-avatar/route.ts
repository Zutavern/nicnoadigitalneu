import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Ungültiger Dateityp. Erlaubt: JPG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei zu groß. Maximal 5MB erlaubt.' },
        { status: 400 }
      )
    }

    // Get current user to check for existing avatar
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    })

    // Delete old avatar from Vercel Blob if it exists and is a Blob URL
    if (user?.image && user.image.includes('blob.vercel-storage.com')) {
      try {
        await del(user.image)
      } catch (error) {
        console.error('Error deleting old avatar:', error)
        // Continue anyway
      }
    }

    // Upload to Vercel Blob
    const filename = `avatars/${session.user.id}-${Date.now()}.${file.type.split('/')[1]}`
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    // Update user's image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: blob.url },
    })

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      message: 'Avatar erfolgreich hochgeladen' 
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json({ error: 'Fehler beim Hochladen' }, { status: 500 })
  }
}

// DELETE /api/user/profile/upload-avatar - Avatar löschen
export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    })

    // Delete from Vercel Blob if it's a Blob URL
    if (user?.image && user.image.includes('blob.vercel-storage.com')) {
      try {
        await del(user.image)
      } catch (error) {
        console.error('Error deleting avatar from blob:', error)
      }
    }

    // Remove image from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    })

    return NextResponse.json({ success: true, message: 'Avatar gelöscht' })
  } catch (error) {
    console.error('Error deleting avatar:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}


