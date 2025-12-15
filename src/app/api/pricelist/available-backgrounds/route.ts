import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/pricelist/available-backgrounds
 * Verfügbare Hintergründe für den User laden (Salon oder Admin)
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // 1. Prüfen ob der User einem Salon zugeordnet ist (als Stylist)
    const connection = await prisma.salonStylistConnection.findFirst({
      where: {
        stylistId: session.user.id,
        isActive: true,
      },
      select: { salonId: true },
    })

    let backgrounds = []
    let source: 'salon' | 'admin' = 'admin'

    if (connection?.salonId) {
      // 2. Salon-eigene Hintergründe prüfen
      const salonBackgrounds = await prisma.pricelistBackground.findMany({
        where: {
          salonId: connection.salonId,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          url: true,
          filename: true,
          sortOrder: true,
          isActive: true,
          type: true,
          createdAt: true,
        },
      })

      if (salonBackgrounds.length > 0) {
        backgrounds = salonBackgrounds
        source = 'salon'
      }
    }

    // 3. Falls keine Salon-Hintergründe: Admin-Hintergründe (salonId = null)
    if (backgrounds.length === 0) {
      backgrounds = await prisma.pricelistBackground.findMany({
        where: {
          salonId: null,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          url: true,
          filename: true,
          sortOrder: true,
          isActive: true,
          type: true,
          createdAt: true,
        },
      })
      source = 'admin'
    }

    return NextResponse.json({ backgrounds, source })
  } catch (error) {
    console.error('Error fetching backgrounds:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Hintergründe' },
      { status: 500 }
    )
  }
}
