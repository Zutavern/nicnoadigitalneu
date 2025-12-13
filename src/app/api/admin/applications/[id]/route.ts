import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET - Hole einzelne Bewerbung
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Bewerbung nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Bewerbung' },
      { status: 500 }
    )
  }
}

// PUT - Aktualisiere Bewerbung (Status, Notizen)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const application = await prisma.jobApplication.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Bewerbung' },
      { status: 500 }
    )
  }
}

// DELETE - Lösche Bewerbung
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    await prisma.jobApplication.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Bewerbung' },
      { status: 500 }
    )
  }
}






