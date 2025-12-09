import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Alle Kategorien
export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST: Neue Kategorie erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()

    // Generate slug
    const slug = generateSlug(data.name)

    // Check if slug exists
    const existing = await prisma.blogCategory.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Kategorie mit diesem Namen existiert bereits' },
        { status: 400 }
      )
    }

    // Get max sortOrder
    const maxSort = await prisma.blogCategory.aggregate({
      _max: { sortOrder: true },
    })

    const category = await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        color: data.color || '#3B82F6',
        icon: data.icon,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}

// PUT: Kategorie aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })
    }

    const category = await prisma.blogCategory.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        color: data.color,
        icon: data.icon,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}

// DELETE: Kategorie löschen
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })
    }

    // Check if category has posts
    const postsCount = await prisma.blogPost.count({
      where: { categoryId: id },
    })

    if (postsCount > 0) {
      return NextResponse.json(
        { error: `Kategorie hat noch ${postsCount} Posts zugewiesen` },
        { status: 400 }
      )
    }

    await prisma.blogCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 })
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}


