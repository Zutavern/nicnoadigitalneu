import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema für Post-Update
const updatePostSchema = z.object({
  content: z.string().min(1).max(2200).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  mediaTypes: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  linkUrl: z.string().url().optional().nullable(),
  platforms: z.array(z.enum([
    'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 
    'PINTEREST', 'TWITTER', 'YOUTUBE', 'THREADS'
  ])).optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'CANCELLED']).optional(),
  platformSettings: z.record(z.any()).optional(),
  accountIds: z.array(z.string().uuid()).optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/social/posts/[id] - Einzelnen Post abrufen
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { id } = await params
    
    const post = await prisma.socialMediaPost.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        postAccounts: {
          include: {
            account: {
              select: {
                id: true,
                platform: true,
                accountName: true,
                accountHandle: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    })
    
    if (!post) {
      return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 })
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('[Social Post GET] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Posts' },
      { status: 500 }
    )
  }
}

// PUT /api/social/posts/[id] - Post aktualisieren
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)
    
    // Prüfen ob Post existiert und dem User gehört
    const existingPost = await prisma.socialMediaPost.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })
    
    if (!existingPost) {
      return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 })
    }
    
    // Bereits veröffentlichte Posts können nicht bearbeitet werden
    if (existingPost.status === 'PUBLISHED' || existingPost.status === 'PUBLISHING') {
      return NextResponse.json(
        { error: 'Veröffentlichte Posts können nicht bearbeitet werden' },
        { status: 400 }
      )
    }
    
    // Update-Daten vorbereiten
    const updateData: Record<string, unknown> = {}
    
    if (validatedData.content !== undefined) updateData.content = validatedData.content
    if (validatedData.mediaUrls !== undefined) updateData.mediaUrls = validatedData.mediaUrls
    if (validatedData.mediaTypes !== undefined) updateData.mediaTypes = validatedData.mediaTypes
    if (validatedData.hashtags !== undefined) updateData.hashtags = validatedData.hashtags
    if (validatedData.mentions !== undefined) updateData.mentions = validatedData.mentions
    if (validatedData.linkUrl !== undefined) updateData.linkUrl = validatedData.linkUrl
    if (validatedData.platforms !== undefined) updateData.platforms = validatedData.platforms
    if (validatedData.platformSettings !== undefined) updateData.platformSettings = validatedData.platformSettings
    
    if (validatedData.scheduledFor !== undefined) {
      updateData.scheduledFor = validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null
    }
    
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }
    
    // Post aktualisieren
    const updatedPost = await prisma.socialMediaPost.update({
      where: { id },
      data: updateData,
      include: {
        postAccounts: {
          include: {
            account: {
              select: {
                id: true,
                platform: true,
                accountName: true,
                accountHandle: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    })
    
    // Account-Verknüpfungen aktualisieren wenn angegeben
    if (validatedData.accountIds !== undefined) {
      // Alte Verknüpfungen löschen
      await prisma.socialMediaPostAccount.deleteMany({
        where: { postId: id },
      })
      
      // Neue Verknüpfungen erstellen
      if (validatedData.accountIds.length > 0) {
        await prisma.socialMediaPostAccount.createMany({
          data: validatedData.accountIds.map(accountId => ({
            postId: id,
            accountId,
            status: updatedPost.status,
          })),
        })
      }
    }
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('[Social Post PUT] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Posts' },
      { status: 500 }
    )
  }
}

// DELETE /api/social/posts/[id] - Post löschen
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Prüfen ob Post existiert und dem User gehört
    const existingPost = await prisma.socialMediaPost.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })
    
    if (!existingPost) {
      return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 })
    }
    
    // Post löschen (Cascade löscht auch PostAccounts)
    await prisma.socialMediaPost.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Social Post DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Posts' },
      { status: 500 }
    )
  }
}

