import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema für Template-Erstellung
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name erforderlich').max(100),
  description: z.string().max(500).optional(),
  content: z.string().min(1, 'Inhalt erforderlich').max(2200),
  category: z.string().max(50).optional(),
  hashtags: z.array(z.string()).optional().default([]),
  mediaUrls: z.array(z.string().url()).optional().default([]),
  recommendedPlatforms: z.array(z.enum([
    'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 
    'PINTEREST', 'TWITTER', 'YOUTUBE', 'THREADS'
  ])).optional().default([]),
})

// GET /api/social/templates - Alle Templates abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includeGlobal = searchParams.get('includeGlobal') !== 'false'
    
    // Eigene Templates + globale Templates
    const whereConditions = [
      { userId: session.user.id },
    ]
    
    if (includeGlobal) {
      whereConditions.push({ isGlobal: true } as typeof whereConditions[0])
    }
    
    const where: Record<string, unknown> = {
      OR: whereConditions,
    }
    
    if (category) {
      where.category = category
    }
    
    const templates = await prisma.contentTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
        category: true,
        hashtags: true,
        mediaUrls: true,
        recommendedPlatforms: true,
        isGlobal: true,
        usageCount: true,
        createdAt: true,
        userId: true,
      },
    })
    
    // Nach Kategorie gruppieren
    const categories = [...new Set(templates.map(t => t.category).filter(Boolean))]
    
    return NextResponse.json({
      templates,
      categories,
      total: templates.length,
    })
  } catch (error) {
    console.error('[Social Templates GET] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Templates' },
      { status: 500 }
    )
  }
}

// POST /api/social/templates - Neues Template erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)
    
    const template = await prisma.contentTemplate.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        content: validatedData.content,
        category: validatedData.category,
        hashtags: validatedData.hashtags,
        mediaUrls: validatedData.mediaUrls,
        recommendedPlatforms: validatedData.recommendedPlatforms,
        isGlobal: false, // User-Templates sind nie global
      },
    })
    
    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('[Social Templates POST] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Templates' },
      { status: 500 }
    )
  }
}

