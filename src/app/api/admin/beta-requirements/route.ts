import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Alle Requirements laden
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const requirements = await prisma.betaRequirement.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(requirements)
  } catch (error) {
    console.error('Error fetching beta requirements:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anforderungen' },
      { status: 500 }
    )
  }
}

// POST - Neue Anforderung erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { text, sortOrder, isActive } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text ist erforderlich' },
        { status: 400 }
      )
    }

    // Stelle sicher, dass Config existiert
    await prisma.betaPageConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', heroTitle: 'Beta-Programm' },
      update: {},
    })

    const requirement = await prisma.betaRequirement.create({
      data: {
        text,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        configId: 'default',
      },
    })

    return NextResponse.json(requirement)
  } catch (error) {
    console.error('Error creating beta requirement:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Anforderung' },
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
        prisma.betaRequirement.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering beta requirements:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Reihenfolge' },
      { status: 500 }
    )
  }
}
