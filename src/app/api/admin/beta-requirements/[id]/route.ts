import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Einzelne Anforderung laden
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    const requirement = await prisma.betaRequirement.findUnique({
      where: { id },
    })

    if (!requirement) {
      return NextResponse.json(
        { error: 'Anforderung nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(requirement)
  } catch (error) {
    console.error('Error fetching beta requirement:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anforderung' },
      { status: 500 }
    )
  }
}

// PUT - Anforderung aktualisieren
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const requirement = await prisma.betaRequirement.update({
      where: { id },
      data: {
        text: body.text,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(requirement)
  } catch (error) {
    console.error('Error updating beta requirement:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Anforderung' },
      { status: 500 }
    )
  }
}

// DELETE - Anforderung löschen
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    await prisma.betaRequirement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting beta requirement:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Anforderung' },
      { status: 500 }
    )
  }
}
