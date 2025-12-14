import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Verfügbare Hintergründe für Stuhlmieter (mit Vererbungslogik)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Stuhlmieter oder Salon - beide können Preislisten erstellen
    if (!['STYLIST', 'SALON'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    let salonBackgrounds: Array<{
      id: string
      url: string
      filename: string
      sortOrder: number
      isActive: boolean
      type: string
      createdAt: Date
    }> = []

    // Wenn Stuhlmieter, versuche Salon zu finden
    if (session.user.role === 'STYLIST') {
      // Prüfe ob Stuhlmieter einem Salon zugeordnet ist
      // Dafür müssten wir eine Beziehung StylistProfile -> Salon haben
      // Für jetzt: Stuhlmieter sehen Admin-Hintergründe direkt
      // In Zukunft: Workspace/Salon-Zuordnung berücksichtigen
      
      // TODO: Wenn Stuhlmieter-Salon-Beziehung existiert:
      // const stylistProfile = await prisma.stylistProfile.findUnique({
      //   where: { userId: session.user.id },
      //   include: { workspace: { include: { salon: true } } }
      // })
      // 
      // if (stylistProfile?.workspace?.salon) {
      //   salonBackgrounds = await prisma.pricelistBackground.findMany({
      //     where: { 
      //       type: 'salon',
      //       salonId: stylistProfile.workspace.salon.id,
      //       isActive: true,
      //     },
      //     orderBy: [{ sortOrder: 'asc' }],
      //   })
      // }
    }

    // Wenn Salon, hole eigene aktive Hintergründe
    if (session.user.role === 'SALON') {
      const salonProfile = await prisma.salonProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (salonProfile) {
        salonBackgrounds = await prisma.pricelistBackground.findMany({
          where: { 
            type: 'salon',
            salonId: salonProfile.id,
            isActive: true,
          },
          orderBy: [{ sortOrder: 'asc' }],
        })
      }
    }

    // Hat der Salon aktive eigene Hintergründe?
    const usesSalonBackgrounds = salonBackgrounds.length > 0

    // Admin-Hintergründe als Fallback
    const adminBackgrounds = await prisma.pricelistBackground.findMany({
      where: { 
        type: 'admin',
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }],
    })

    // Bestimme welche Hintergründe verwendet werden
    const backgrounds = usesSalonBackgrounds ? salonBackgrounds : adminBackgrounds

    return NextResponse.json({
      backgrounds,
      source: usesSalonBackgrounds ? 'salon' : 'admin',
      count: backgrounds.length,
    })
  } catch (error) {
    console.error('Error fetching available pricelist backgrounds:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Hintergründe' },
      { status: 500 }
    )
  }
}

