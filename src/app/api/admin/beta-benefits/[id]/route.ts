import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Einzelnen Benefit laden
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    const benefit = await prisma.betaBenefit.findUnique({
      where: { id },
    })

    if (!benefit) {
      return NextResponse.json(
        { error: 'Vorteil nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(benefit)
  } catch (error) {
    console.error('Error fetching beta benefit:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Vorteils' },
      { status: 500 }
    )
  }
}

// PUT - Benefit aktualisieren
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const benefit = await prisma.betaBenefit.update({
      where: { id },
      data: {
        icon: body.icon,
        title: body.title,
        description: body.description,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(benefit)
  } catch (error) {
    console.error('Error updating beta benefit:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Vorteils' },
      { status: 500 }
    )
  }
}

// DELETE - Benefit löschen
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    await prisma.betaBenefit.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting beta benefit:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Vorteils' },
      { status: 500 }
    )
  }
}
