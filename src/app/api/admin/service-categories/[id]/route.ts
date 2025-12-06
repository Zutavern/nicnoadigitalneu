import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch single category
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching service category:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Kategorie' },
      { status: 500 }
    )
  }
}

// PUT - Update category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, icon, color, sortOrder, isActive } = body

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(name && {
          slug: name
            .toLowerCase()
            .replace(/[äöüß]/g, (match: string) => {
              const map: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }
              return map[match] || match
            })
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating service category:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kategorie' },
      { status: 500 }
    )
  }
}

// DELETE - Delete category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    await prisma.serviceCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service category:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Kategorie' },
      { status: 500 }
    )
  }
}

