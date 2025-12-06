import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all service categories
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const categories = await prisma.serviceCategory.findMany({
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching service categories:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Kategorien' },
      { status: 500 }
    )
  }
}

// POST - Create a new service category
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, icon, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Name ist erforderlich' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[äöüß]/g, (match: string) => {
        const map: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }
        return map[match] || match
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Get max sort order
    const maxOrder = await prisma.serviceCategory.aggregate({
      _max: { sortOrder: true },
    })

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        color: color || null,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating service category:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Kategorie' },
      { status: 500 }
    )
  }
}

