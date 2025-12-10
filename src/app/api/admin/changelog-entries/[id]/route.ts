import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Einzelnen Changelog-Eintrag laden
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    const entry = await prisma.changelogEntry.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Changelog-Eintrag nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching changelog entry:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Changelog-Eintrags' },
      { status: 500 }
    )
  }
}

// PUT - Changelog-Eintrag aktualisieren
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const entry = await prisma.changelogEntry.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        category: body.category,
        icon: body.icon,
        title: body.title,
        description: body.description,
        isHighlight: body.isHighlight,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating changelog entry:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Changelog-Eintrags' },
      { status: 500 }
    )
  }
}

// DELETE - Changelog-Eintrag löschen
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    await prisma.changelogEntry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting changelog entry:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Changelog-Eintrags' },
      { status: 500 }
    )
  }
}
