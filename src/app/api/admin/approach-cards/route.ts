import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Alle Approach Cards laden
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const cards = await prisma.$queryRaw`
      SELECT 
        id, title, description, icon_name as "iconName",
        sort_order as "sortOrder", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM approach_cards
      ORDER BY sort_order ASC, created_at DESC
    ` as any[]

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching approach cards:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kacheln' },
      { status: 500 }
    )
  }
}

// POST - Neue Approach Card erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, iconName, sortOrder, isActive } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Titel und Beschreibung sind erforderlich' },
        { status: 400 }
      )
    }

    const result = await prisma.$queryRaw`
      INSERT INTO approach_cards (title, description, icon_name, sort_order, is_active, created_at, updated_at)
      VALUES (${title}, ${description}, ${iconName || null}, ${sortOrder || 0}, ${isActive !== false}, NOW(), NOW())
      RETURNING 
        id, title, description, icon_name as "iconName",
        sort_order as "sortOrder", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    ` as any[]

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error creating approach card:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Kachel' },
      { status: 500 }
    )
  }
}

// PUT - Approach Cards aktualisieren (Bulk Update für Sortierung)
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { cards } = body // Array von { id, sortOrder, isActive, ... }

    if (!Array.isArray(cards)) {
      return NextResponse.json(
        { error: 'Ungültiges Format' },
        { status: 400 }
      )
    }

    // Update alle Cards in einer Transaktion
    await prisma.$transaction(
      cards.map((card: any) =>
        prisma.$executeRaw`
          UPDATE approach_cards
          SET 
            title = ${card.title},
            description = ${card.description},
            icon_name = ${card.iconName || null},
            sort_order = ${card.sortOrder || 0},
            is_active = ${card.isActive !== false},
            updated_at = NOW()
          WHERE id = ${card.id}
        `
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating approach cards:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kacheln' },
      { status: 500 }
    )
  }
}

