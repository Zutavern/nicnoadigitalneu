import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Einzelne Section laden
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    const section = await prisma.legalSection.findUnique({
      where: { id },
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Abschnitt nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error fetching legal section:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Abschnitts' },
      { status: 500 }
    )
  }
}

// PUT - Section aktualisieren
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, sortOrder, isActive, isCollapsible } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titel und Inhalt sind erforderlich' },
        { status: 400 }
      )
    }

    const section = await prisma.legalSection.update({
      where: { id },
      data: {
        title,
        content,
        sortOrder: sortOrder ?? undefined,
        isActive: isActive ?? undefined,
        isCollapsible: isCollapsible ?? undefined,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating legal section:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Abschnitts' },
      { status: 500 }
    )
  }
}

// DELETE - Section löschen
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    await prisma.legalSection.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting legal section:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Abschnitts' },
      { status: 500 }
    )
  }
}
