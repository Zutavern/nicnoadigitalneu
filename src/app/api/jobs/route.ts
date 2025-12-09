import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Hole alle aktiven Jobs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category
      ? { isActive: true, category }
      : { isActive: true }

    const jobs = await prisma.jobPosting.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
      ],
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Jobs' },
      { status: 500 }
    )
  }
}


