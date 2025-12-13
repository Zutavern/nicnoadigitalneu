import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/roadmap-items - Öffentliche Roadmap-Items (nur aktive)
export async function GET() {
  try {
    const items = await prisma.roadmapItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        quarter: true,
        title: true,
        description: true,
        icon: true,
        status: true,
        statusColor: true,
      }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching roadmap items:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Roadmap' },
      { status: 500 }
    )
  }
}






