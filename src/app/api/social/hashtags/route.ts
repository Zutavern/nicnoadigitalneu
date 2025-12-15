import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema für Collection-Erstellung
const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name erforderlich').max(100),
  description: z.string().max(500).optional(),
  hashtags: z.array(z.string().min(1).max(50)).min(1, 'Mind. 1 Hashtag').max(50, 'Max. 50 Hashtags'),
  category: z.string().max(50).optional(),
})

// GET /api/social/hashtags - Alle Hashtag-Sammlungen abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includeGlobal = searchParams.get('includeGlobal') !== 'false'
    
    // Eigene Collections + globale
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
    
    const collections = await prisma.hashtagCollection.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        hashtags: true,
        category: true,
        isGlobal: true,
        usageCount: true,
        createdAt: true,
        userId: true,
      },
    })
    
    // Nach Kategorie gruppieren
    const categories = [...new Set(collections.map(c => c.category).filter(Boolean))]
    
    return NextResponse.json({
      collections,
      categories,
      total: collections.length,
    })
  } catch (error) {
    console.error('[Social Hashtags GET] Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Hashtag-Sammlungen' },
      { status: 500 }
    )
  }
}

// POST /api/social/hashtags - Neue Hashtag-Sammlung erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = createCollectionSchema.parse(body)
    
    // Hashtags bereinigen (# entfernen falls vorhanden)
    const cleanedHashtags = validatedData.hashtags.map(h => 
      h.startsWith('#') ? h.substring(1) : h
    )
    
    const collection = await prisma.hashtagCollection.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        hashtags: cleanedHashtags,
        category: validatedData.category,
        isGlobal: false,
      },
    })
    
    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error('[Social Hashtags POST] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Hashtag-Sammlung' },
      { status: 500 }
    )
  }
}

