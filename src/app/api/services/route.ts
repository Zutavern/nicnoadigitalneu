import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all active services grouped by category (public route for onboarding)
export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Services' },
      { status: 500 }
    )
  }
}

