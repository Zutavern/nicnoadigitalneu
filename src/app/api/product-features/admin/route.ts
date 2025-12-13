import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Alle Produkt-Features für Admin (inkl. inaktive)
export async function GET() {
  try {
    const features = await prisma.productFeature.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(features)
  } catch (error) {
    console.error('Error fetching product features:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Produkt-Features' },
      { status: 500 }
    )
  }
}






