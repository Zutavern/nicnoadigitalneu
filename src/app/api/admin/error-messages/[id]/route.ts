import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Aktualisiere Fehlermeldung
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { message, isActive, sortOrder } = body

    const updated = await prisma.errorMessage.update({
      where: { id },
      data: {
        ...(message !== undefined && { message }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating error message:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Fehlermeldung' },
      { status: 500 }
    )
  }
}

// DELETE - Lösche Fehlermeldung
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    await prisma.errorMessage.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting error message:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Fehlermeldung' },
      { status: 500 }
    )
  }
}






