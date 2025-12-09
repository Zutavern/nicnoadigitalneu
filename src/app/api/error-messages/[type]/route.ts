import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Hole zufällige Fehlermeldung für einen Fehlertyp
export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params

    // Hole alle aktiven Meldungen für diesen Typ
    const messages = await prisma.errorMessage.findMany({
      where: {
        errorType: type,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    if (messages.length === 0) {
      // Fallback-Meldung
      return NextResponse.json({
        message: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.',
      })
    }

    // Wähle zufällige Meldung
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    return NextResponse.json({
      message: randomMessage.message,
    })
  } catch (error) {
    console.error('Error fetching random error message:', error)
    return NextResponse.json({
      message: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.',
    })
  }
}


