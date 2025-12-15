import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema für Post-Erstellung
const createPostSchema = z.object({
  content: z.string().min(1, 'Inhalt erforderlich').max(2200, 'Max. 2200 Zeichen'),
  mediaUrls: z.array(z.string().url()).optional().default([]),
  mediaTypes: z.array(z.string()).optional().default([]),
  hashtags: z.array(z.string()).optional().default([]),
  mentions: z.array(z.string()).optional().default([]),
  linkUrl: z.string().url().optional().nullable(),
  platforms: z.array(z.enum([
    'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 
    'PINTEREST', 'TWITTER', 'YOUTUBE', 'THREADS'
  ])).min(1, 'Mind. eine Plattform wählen'),
  scheduledFor: z.string().datetime().optional().nullable(),
  status: z.enum(['DRAFT', 'SCHEDULED']).optional().default('DRAFT'),
  platformSettings: z.record(z.any()).optional(),
  accountIds: z.array(z.string().uuid()).optional().default([]),
  // AI-Generierung
  aiGenerated: z.boolean().optional().default(false),
  aiPrompt: z.string().optional().nullable(),
  aiModel: z.string().optional().nullable(),
})

// GET /api/social/posts - Alle Posts abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    // Filter bauen
    const where: Record<string, unknown> = {
      userId: session.user.id,
    }
    
    if (status) {
      where.status = status
    }
    
    if (platform) {
      where.platforms = { has: platform }
    }
    
    const [posts, total] = await Promise.all([
      prisma.socialMediaPost.findMany({
        where,
        orderBy: [
          { scheduledFor: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
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
      }),
      prisma.socialMediaPost.count({ where }),
    ])
    
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Social Posts GET] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Posts' },
      { status: 500 }
    )
  }
}

// POST /api/social/posts - Neuen Post erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = createPostSchema.parse(body)
    
    // Post erstellen
    const post = await prisma.socialMediaPost.create({
      data: {
        userId: session.user.id,
        content: validatedData.content,
        mediaUrls: validatedData.mediaUrls,
        mediaTypes: validatedData.mediaTypes,
        hashtags: validatedData.hashtags,
        mentions: validatedData.mentions,
        linkUrl: validatedData.linkUrl,
        platforms: validatedData.platforms,
        scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null,
        status: validatedData.status === 'SCHEDULED' && validatedData.scheduledFor ? 'SCHEDULED' : 'DRAFT',
        platformSettings: validatedData.platformSettings || {},
        aiGenerated: validatedData.aiGenerated,
        aiPrompt: validatedData.aiPrompt,
        aiModel: validatedData.aiModel,
      },
    })
    
    // Wenn Account-IDs angegeben, Verknüpfungen erstellen
    if (validatedData.accountIds.length > 0) {
      await prisma.socialMediaPostAccount.createMany({
        data: validatedData.accountIds.map(accountId => ({
          postId: post.id,
          accountId,
          status: post.status,
        })),
      })
    }
    
    // Post mit Accounts zurückgeben
    const postWithAccounts = await prisma.socialMediaPost.findUnique({
      where: { id: post.id },
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
    
    return NextResponse.json(postWithAccounts, { status: 201 })
  } catch (error) {
    console.error('[Social Posts POST] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Posts' },
      { status: 500 }
    )
  }
}

