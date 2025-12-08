import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Hole alle Fehlermeldungen
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const errorType = searchParams.get('errorType')

    const where = errorType ? { errorType, isActive: true } : { isActive: true }

    const messages = await prisma.errorMessage.findMany({
      where,
      orderBy: [
        { errorType: 'asc' },
        { sortOrder: 'asc' },
      ],
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching error messages:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Fehlermeldungen' },
      { status: 500 }
    )
  }
}

// POST - Erstelle neue Fehlermeldung
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { errorType, message, isActive = true } = body

    if (!errorType || !message) {
      return NextResponse.json(
        { error: 'errorType und message sind erforderlich' },
        { status: 400 }
      )
    }

    // Finde die höchste sortOrder für diesen Typ
    const maxOrder = await prisma.errorMessage.aggregate({
      where: { errorType },
      _max: { sortOrder: true },
    })

    const newMessage = await prisma.errorMessage.create({
      data: {
        id: `${errorType}-${Date.now()}`,
        errorType,
        message,
        isActive,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    })

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating error message:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Fehlermeldung' },
      { status: 500 }
    )
  }
}

