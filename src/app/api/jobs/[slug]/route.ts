import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Hole Job-Details nach Slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const job = await prisma.jobPosting.findUnique({
      where: { slug, isActive: true },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Jobs' },
      { status: 500 }
    )
  }
}

