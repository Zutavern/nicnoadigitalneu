import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Einzelnes Timeline-Item laden
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    const item = await prisma.betaTimelineItem.findUnique({
      where: { id },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Timeline-Eintrag nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching beta timeline item:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Timeline-Eintrags' },
      { status: 500 }
    )
  }
}

// PUT - Timeline-Item aktualisieren
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const item = await prisma.betaTimelineItem.update({
      where: { id },
      data: {
        date: body.date,
        title: body.title,
        description: body.description,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating beta timeline item:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Timeline-Eintrags' },
      { status: 500 }
    )
  }
}

// DELETE - Timeline-Item löschen
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    await prisma.betaTimelineItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting beta timeline item:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Timeline-Eintrags' },
      { status: 500 }
    )
  }
}
