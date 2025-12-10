import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/roadmap-items - Alle Roadmap-Items abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const items = await prisma.roadmapItem.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching roadmap items:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Roadmap-Items' },
      { status: 500 }
    )
  }
}

// POST /api/admin/roadmap-items - Neues Roadmap-Item erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()

    // Höchste sortOrder ermitteln
    const maxOrder = await prisma.roadmapItem.aggregate({
      _max: { sortOrder: true }
    })
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1

    const item = await prisma.roadmapItem.create({
      data: {
        quarter: data.quarter,
        title: data.title,
        description: data.description,
        icon: data.icon || 'sparkles',
        status: data.status || 'Planung',
        statusColor: data.statusColor,
        sortOrder: data.sortOrder ?? nextOrder,
        isActive: data.isActive ?? true,
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating roadmap item:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Roadmap-Items' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/roadmap-items - Reihenfolge aktualisieren (Batch)
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { items } = await request.json()

    // Reihenfolge für alle Items aktualisieren
    await Promise.all(
      items.map((item: { id: string; sortOrder: number }) =>
        prisma.roadmapItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating roadmap items order:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Reihenfolge' },
      { status: 500 }
    )
  }
}


