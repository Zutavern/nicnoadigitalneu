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
  croppedMedia: z.record(z.any()).optional(),
  aiImagePrompt: z.string().optional().nullable(),
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
    
    // Nur Drafts und geplante Posts können bearbeitet werden
    if (!['DRAFT', 'SCHEDULED'].includes(existingPost.status)) {
      return NextResponse.json(
        { error: 'Veröffentlichte Posts können nicht bearbeitet werden' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)
    
    // Status-Logik
    let newStatus = validatedData.status || existingPost.status
    if (validatedData.scheduledFor) {
      newStatus = 'SCHEDULED'
    } else if (validatedData.status === 'DRAFT') {
      newStatus = 'DRAFT'
    }
    
    // Post aktualisieren
    const updatedPost = await prisma.socialMediaPost.update({
      where: { id },
      data: {
        ...(validatedData.content !== undefined && { content: validatedData.content }),
        ...(validatedData.mediaUrls !== undefined && { mediaUrls: validatedData.mediaUrls }),
        ...(validatedData.mediaTypes !== undefined && { mediaTypes: validatedData.mediaTypes }),
        ...(validatedData.hashtags !== undefined && { hashtags: validatedData.hashtags }),
        ...(validatedData.mentions !== undefined && { mentions: validatedData.mentions }),
        ...(validatedData.linkUrl !== undefined && { linkUrl: validatedData.linkUrl }),
        ...(validatedData.platforms !== undefined && { platforms: validatedData.platforms }),
        ...(validatedData.scheduledFor !== undefined && { 
          scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null 
        }),
        ...(validatedData.platformSettings !== undefined && { platformSettings: validatedData.platformSettings }),
        ...(validatedData.croppedMedia !== undefined && { croppedMedia: validatedData.croppedMedia }),
        ...(validatedData.aiImagePrompt !== undefined && { aiImagePrompt: validatedData.aiImagePrompt }),
        status: newStatus,
        updatedAt: new Date(),
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
    
    // Veröffentlichte Posts nicht löschen, sondern auf CANCELLED setzen
    if (existingPost.status === 'PUBLISHED') {
      await prisma.socialMediaPost.update({
        where: { id },
        data: { status: 'CANCELLED' },
      })
      return NextResponse.json({ message: 'Post wurde storniert' })
    }
    
    // Post-Account-Verknüpfungen löschen
    await prisma.socialMediaPostAccount.deleteMany({
      where: { postId: id },
    })
    
    // Post löschen
    await prisma.socialMediaPost.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: 'Post gelöscht' })
  } catch (error) {
    console.error('[Social Post DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Posts' },
      { status: 500 }
    )
  }
}

// POST /api/social/posts/[id] - Spezielle Aktionen (Duplizieren, Sofort veröffentlichen)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const action = body.action as string
    
    const existingPost = await prisma.socialMediaPost.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })
    
    if (!existingPost) {
      return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 })
    }
    
    switch (action) {
      case 'duplicate': {
        const duplicate = await prisma.socialMediaPost.create({
          data: {
            userId: session.user.id,
            content: existingPost.content,
            mediaUrls: existingPost.mediaUrls,
            mediaTypes: existingPost.mediaTypes,
            hashtags: existingPost.hashtags,
            mentions: existingPost.mentions,
            linkUrl: existingPost.linkUrl,
            platforms: existingPost.platforms,
            platformSettings: existingPost.platformSettings || {},
            croppedMedia: existingPost.croppedMedia || {},
            aiGenerated: existingPost.aiGenerated,
            aiPrompt: existingPost.aiPrompt,
            aiModel: existingPost.aiModel,
            aiImagePrompt: existingPost.aiImagePrompt,
            status: 'DRAFT',
          },
        })
        return NextResponse.json(duplicate, { status: 201 })
      }
      
      case 'schedule': {
        const scheduledFor = body.scheduledFor
        if (!scheduledFor) {
          return NextResponse.json({ error: 'Datum erforderlich' }, { status: 400 })
        }
        
        const scheduled = await prisma.socialMediaPost.update({
          where: { id },
          data: {
            scheduledFor: new Date(scheduledFor),
            status: 'SCHEDULED',
          },
        })
        return NextResponse.json(scheduled)
      }
      
      case 'publish_now': {
        // TODO: Implementiere tatsächliche Veröffentlichung
        const published = await prisma.socialMediaPost.update({
          where: { id },
          data: {
            status: 'PUBLISHING',
            scheduledFor: new Date(),
          },
        })
        return NextResponse.json(published)
      }
      
      default:
        return NextResponse.json({ error: 'Unbekannte Aktion' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Social Post Action] Error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Aktion' },
      { status: 500 }
    )
  }
}
