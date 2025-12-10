import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Alle Timeline-Items laden
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const items = await prisma.betaTimelineItem.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching beta timeline items:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Timeline' },
      { status: 500 }
    )
  }
}

// POST - Neues Timeline-Item erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { date, title, description, sortOrder, isActive } = body

    if (!date || !title || !description) {
      return NextResponse.json(
        { error: 'Datum, Titel und Beschreibung sind erforderlich' },
        { status: 400 }
      )
    }

    // Stelle sicher, dass Config existiert
    await prisma.betaPageConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', heroTitle: 'Beta-Programm' },
      update: {},
    })

    const item = await prisma.betaTimelineItem.create({
      data: {
        date,
        title,
        description,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        configId: 'default',
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating beta timeline item:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Timeline-Eintrags' },
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
        prisma.betaTimelineItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering beta timeline items:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Reihenfolge' },
      { status: 500 }
    )
  }
}
