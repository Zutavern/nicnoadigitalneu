import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Einzelnes Produkt-Feature abrufen
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const feature = await prisma.productFeature.findUnique({
      where: { id },
    })

    if (!feature) {
      return NextResponse.json(
        { error: 'Produkt-Feature nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(feature)
  } catch (error) {
    console.error('Error fetching product feature:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Produkt-Features' },
      { status: 500 }
    )
  }
}

// PUT - Produkt-Feature aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const feature = await prisma.productFeature.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        iconName: data.iconName,
        category: data.category,
        isActive: data.isActive,
        isHighlight: data.isHighlight,
        sortOrder: data.sortOrder,
      },
    })

    return NextResponse.json(feature)
  } catch (error) {
    console.error('Error updating product feature:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Produkt-Features' },
      { status: 500 }
    )
  }
}

// DELETE - Produkt-Feature löschen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.productFeature.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product feature:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Produkt-Features' },
      { status: 500 }
    )
  }
}

