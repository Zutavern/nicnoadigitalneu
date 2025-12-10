import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/press - Öffentliche Presse-Artikel abrufen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const articles = await prisma.pressArticle.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { sortOrder: 'asc' }],
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        source: true,
        sourceUrl: true,
        sourceLogo: true,
        coverImage: true,
        publishedAt: true,
        category: true,
        isFeatured: true,
      },
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching press articles:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Artikel' },
      { status: 500 }
    )
  }
}
