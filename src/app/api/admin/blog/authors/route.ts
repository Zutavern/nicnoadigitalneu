import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Alle Autoren
export async function GET() {
  try {
    const authors = await prisma.blogAuthor.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json({ authors })
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

// POST: Neuen Autor erstellen
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()

    // Generate slug
    const slug = generateSlug(data.name)

    // Check if slug exists
    const existing = await prisma.blogAuthor.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Autor mit diesem Namen existiert bereits' },
        { status: 400 }
      )
    }

    const author = await prisma.blogAuthor.create({
      data: {
        name: data.name,
        slug,
        bio: data.bio,
        avatar: data.avatar,
        role: data.role,
        linkedinUrl: data.linkedinUrl,
        instagramUrl: data.instagramUrl,
        twitterUrl: data.twitterUrl,
        websiteUrl: data.websiteUrl,
        userId: data.userId,
      },
    })

    return NextResponse.json({ author }, { status: 201 })
  } catch (error) {
    console.error('Error creating author:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}

// PUT: Autor aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })
    }

    const author = await prisma.blogAuthor.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        bio: data.bio,
        avatar: data.avatar,
        role: data.role,
        linkedinUrl: data.linkedinUrl,
        instagramUrl: data.instagramUrl,
        twitterUrl: data.twitterUrl,
        websiteUrl: data.websiteUrl,
        isActive: data.isActive,
      },
    })

    return NextResponse.json({ author })
  } catch (error) {
    console.error('Error updating author:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}

// DELETE: Autor löschen
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })
    }

    // Check if author has posts
    const postsCount = await prisma.blogPost.count({
      where: { authorId: id },
    })

    if (postsCount > 0) {
      return NextResponse.json(
        { error: `Autor hat noch ${postsCount} Posts geschrieben` },
        { status: 400 }
      )
    }

    await prisma.blogAuthor.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting author:', error)
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


