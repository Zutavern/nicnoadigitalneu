import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Einzelne Approach Card laden
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    const cards = await prisma.$queryRaw`
      SELECT 
        id, title, description, icon_name as "iconName",
        sort_order as "sortOrder", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM approach_cards
      WHERE id = ${id}
    ` as any[]

    if (cards.length === 0) {
      return NextResponse.json({ error: 'Kachel nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(cards[0])
  } catch (error) {
    console.error('Error fetching approach card:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kachel' },
      { status: 500 }
    )
  }
}

// PUT - Approach Card aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, iconName, sortOrder, isActive } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Titel und Beschreibung sind erforderlich' },
        { status: 400 }
      )
    }

    const result = await prisma.$queryRaw`
      UPDATE approach_cards
      SET 
        title = ${title},
        description = ${description},
        icon_name = ${iconName || null},
        sort_order = ${sortOrder || 0},
        is_active = ${isActive !== false},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING 
        id, title, description, icon_name as "iconName",
        sort_order as "sortOrder", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    ` as any[]

    if (result.length === 0) {
      return NextResponse.json({ error: 'Kachel nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating approach card:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kachel' },
      { status: 500 }
    )
  }
}

// DELETE - Approach Card löschen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    await prisma.$executeRaw`
      DELETE FROM approach_cards WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting approach card:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Kachel' },
      { status: 500 }
    )
  }
}

