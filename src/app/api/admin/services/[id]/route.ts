import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch single service
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

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Service' },
      { status: 500 }
    )
  }
}

// PUT - Update service
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
    const { categoryId, name, description, sortOrder, isActive } = body

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId }),
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
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Service' },
      { status: 500 }
    )
  }
}

// DELETE - Delete service
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

    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Service' },
      { status: 500 }
    )
  }
}

