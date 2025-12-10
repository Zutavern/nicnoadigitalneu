import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET /api/admin/press - Alle Presse-Artikel abrufen
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = includeInactive ? {} : { isActive: true }

    const articles = await prisma.pressArticle.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { sortOrder: 'asc' }],
    })

    // Stats berechnen
    const allArticles = await prisma.pressArticle.findMany()
    const stats = {
      total: allArticles.length,
      active: allArticles.filter(a => a.isActive).length,
      featured: allArticles.filter(a => a.isFeatured).length,
      byCategory: {
        news: allArticles.filter(a => a.category === 'news').length,
        feature: allArticles.filter(a => a.category === 'feature').length,
        interview: allArticles.filter(a => a.category === 'interview').length,
        announcement: allArticles.filter(a => a.category === 'announcement').length,
      },
    }

    return NextResponse.json({ articles, stats })
  } catch (error) {
    console.error('Error fetching press articles:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Artikel' },
      { status: 500 }
    )
  }
}

// POST /api/admin/press - Neuen Artikel erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      excerpt,
      source,
      sourceUrl,
      sourceLogo,
      coverImage,
      publishedAt,
      category,
      isFeatured,
      isActive,
      sortOrder,
    } = body

    if (!title || !source || !sourceUrl) {
      return NextResponse.json(
        { error: 'Titel, Quelle und URL sind erforderlich' },
        { status: 400 }
      )
    }

    // Generiere Slug
    let slug = generateSlug(title)
    
    // Prüfe ob Slug existiert
    const existingSlug = await prisma.pressArticle.findUnique({
      where: { slug },
    })
    
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const article = await prisma.pressArticle.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        source,
        sourceUrl,
        sourceLogo: sourceLogo || null,
        coverImage: coverImage || null,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        category: category || 'news',
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error creating press article:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Artikels' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/press - Artikel aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      title,
      excerpt,
      source,
      sourceUrl,
      sourceLogo,
      coverImage,
      publishedAt,
      category,
      isFeatured,
      isActive,
      sortOrder,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 })
    }

    const existingArticle = await prisma.pressArticle.findUnique({
      where: { id },
    })

    if (!existingArticle) {
      return NextResponse.json({ error: 'Artikel nicht gefunden' }, { status: 404 })
    }

    // Generiere neuen Slug wenn Titel geändert
    let slug = existingArticle.slug
    if (title && title !== existingArticle.title) {
      slug = generateSlug(title)
      const existingSlug = await prisma.pressArticle.findFirst({
        where: { slug, id: { not: id } },
      })
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`
      }
    }

    const article = await prisma.pressArticle.update({
      where: { id },
      data: {
        title: title ?? existingArticle.title,
        slug,
        excerpt: excerpt !== undefined ? excerpt || null : existingArticle.excerpt,
        source: source ?? existingArticle.source,
        sourceUrl: sourceUrl ?? existingArticle.sourceUrl,
        sourceLogo: sourceLogo !== undefined ? sourceLogo || null : existingArticle.sourceLogo,
        coverImage: coverImage !== undefined ? coverImage || null : existingArticle.coverImage,
        publishedAt: publishedAt ? new Date(publishedAt) : existingArticle.publishedAt,
        category: category ?? existingArticle.category,
        isFeatured: isFeatured ?? existingArticle.isFeatured,
        isActive: isActive ?? existingArticle.isActive,
        sortOrder: sortOrder ?? existingArticle.sortOrder,
      },
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error updating press article:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Artikels' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/press - Artikel löschen
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID ist erforderlich' }, { status: 400 })
    }

    await prisma.pressArticle.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting press article:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Artikels' },
      { status: 500 }
    )
  }
}
