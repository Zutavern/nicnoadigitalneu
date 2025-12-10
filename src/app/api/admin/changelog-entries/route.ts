import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Alle Changelog-Einträge laden
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const entries = await prisma.changelogEntry.findMany({
      orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }],
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching changelog entries:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Changelog-Einträge' },
      { status: 500 }
    )
  }
}

// POST - Neuen Changelog-Eintrag erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { date, category, icon, title, description, isHighlight, sortOrder, isActive } = body

    if (!date || !category || !icon || !title || !description) {
      return NextResponse.json(
        { error: 'Datum, Kategorie, Icon, Titel und Beschreibung sind erforderlich' },
        { status: 400 }
      )
    }

    const entry = await prisma.changelogEntry.create({
      data: {
        date: new Date(date),
        category,
        icon,
        title,
        description,
        isHighlight: isHighlight ?? false,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error creating changelog entry:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Changelog-Eintrags' },
      { status: 500 }
    )
  }
}

// PUT - Bulk-Update für Reihenfolge
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items-Array ist erforderlich' },
        { status: 400 }
      )
    }

    await prisma.$transaction(
      items.map((item: { id: string; sortOrder: number }) =>
        prisma.changelogEntry.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering changelog entries:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Reihenfolge' },
      { status: 500 }
    )
  }
}
