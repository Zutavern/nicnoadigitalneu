import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Alle Produkt-Features abrufen
export async function GET() {
  try {
    const features = await prisma.productFeature.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(features)
  } catch (error) {
    console.error('Error fetching product features:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Produkt-Features' },
      { status: 500 }
    )
  }
}

// POST - Neues Produkt-Feature erstellen
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const feature = await prisma.productFeature.create({
      data: {
        title: data.title,
        description: data.description,
        iconName: data.iconName,
        category: data.category || 'core',
        isActive: data.isActive ?? true,
        isHighlight: data.isHighlight ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    })

    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    console.error('Error creating product feature:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Produkt-Features' },
      { status: 500 }
    )
  }
}

