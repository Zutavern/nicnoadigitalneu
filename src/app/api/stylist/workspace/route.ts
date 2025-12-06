import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Find active chair rental for this stylist
    const activeRental = await prisma.chairRental.findFirst({
      where: {
        stylistId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        chair: {
          select: {
            id: true,
            name: true,
            description: true,
            equipment: true,
          },
        },
        salon: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            owner: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    if (!activeRental) {
      return NextResponse.json(
        { error: 'Keine aktive Stuhlmiete gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(activeRental)
  } catch (error) {
    console.error('Error fetching workspace:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Arbeitsplatzes' },
      { status: 500 }
    )
  }
}

