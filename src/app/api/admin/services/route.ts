import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all services
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const services = await prisma.service.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(activeOnly && { isActive: true }),
      },
      include: {
        category: true,
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
      ],
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Services' },
      { status: 500 }
    )
  }
}

// POST - Create a new service
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const body = await request.json()
    const { categoryId, name, description } = body

    if (!categoryId || !name) {
      return NextResponse.json(
        { error: 'Kategorie und Name sind erforderlich' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[äöüß]/g, (match: string) => {
        const map: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }
        return map[match] || match
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Get max sort order in category
    const maxOrder = await prisma.service.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    })

    const service = await prisma.service.create({
      data: {
        categoryId,
        name,
        slug,
        description: description || null,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Service' },
      { status: 500 }
    )
  }
}

