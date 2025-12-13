import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/roadmap-items/[id] - Einzelnes Item abrufen
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    const item = await prisma.roadmapItem.findUnique({
      where: { id }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching roadmap item:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Items' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/roadmap-items/[id] - Item aktualisieren
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    const item = await prisma.roadmapItem.update({
      where: { id },
      data: {
        quarter: data.quarter,
        title: data.title,
        description: data.description,
        icon: data.icon,
        status: data.status,
        statusColor: data.statusColor,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating roadmap item:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Items' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/roadmap-items/[id] - Item löschen
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    await prisma.roadmapItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting roadmap item:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Items' },
      { status: 500 }
    )
  }
}






