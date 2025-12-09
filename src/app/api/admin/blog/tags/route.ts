import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Alle Tags
export async function GET() {
  try {
    const tags = await prisma.blogTag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST: Neuen Tag erstellen
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
    const existing = await prisma.blogTag.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Tag mit diesem Namen existiert bereits' },
        { status: 400 }
      )
    }

    const tag = await prisma.blogTag.create({
      data: {
        name: data.name,
        slug,
      },
    })

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}

// PUT: Tag aktualisieren
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

    const tag = await prisma.blogTag.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        isActive: data.isActive,
      },
    })

    return NextResponse.json({ tag })
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}

// DELETE: Tag löschen
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

    // Delete tag relations first
    await prisma.blogPostTag.deleteMany({
      where: { tagId: id },
    })

    await prisma.blogTag.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
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


