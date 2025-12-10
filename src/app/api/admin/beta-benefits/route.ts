import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Alle Benefits laden
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const benefits = await prisma.betaBenefit.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(benefits)
  } catch (error) {
    console.error('Error fetching beta benefits:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Vorteile' },
      { status: 500 }
    )
  }
}

// POST - Neuen Benefit erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { icon, title, description, sortOrder, isActive } = body

    if (!icon || !title || !description) {
      return NextResponse.json(
        { error: 'Icon, Titel und Beschreibung sind erforderlich' },
        { status: 400 }
      )
    }

    // Stelle sicher, dass Config existiert
    await prisma.betaPageConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', heroTitle: 'Beta-Programm' },
      update: {},
    })

    const benefit = await prisma.betaBenefit.create({
      data: {
        icon,
        title,
        description,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        configId: 'default',
      },
    })

    return NextResponse.json(benefit)
  } catch (error) {
    console.error('Error creating beta benefit:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Vorteils' },
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
        prisma.betaBenefit.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering beta benefits:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Reihenfolge' },
      { status: 500 }
    )
  }
}
