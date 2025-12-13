import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Hole alle Bewerbungen
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const jobId = searchParams.get('jobId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (jobId === 'initiative') {
      where.jobId = null
    } else if (jobId) {
      where.jobId = jobId
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Bewerbungen' },
      { status: 500 }
    )
  }
}

// POST - Erstelle neue Bewerbung (für öffentliches Bewerbungsformular)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      jobId,
      firstName,
      lastName,
      email,
      phone,
      coverLetter,
      cvUrl,
      cvFileName,
    } = body

    if (!firstName || !lastName || !email || !cvUrl || !cvFileName) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      )
    }

    // Prüfe ob Job existiert (wenn angegeben)
    if (jobId) {
      const job = await prisma.jobPosting.findUnique({
        where: { id: jobId },
      })
      if (!job) {
        return NextResponse.json(
          { error: 'Stelle nicht gefunden' },
          { status: 404 }
        )
      }
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobId || null,
        firstName,
        lastName,
        email,
        phone: phone || null,
        coverLetter: coverLetter || null,
        cvUrl,
        cvFileName,
        status: 'PENDING',
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Bewerbung' },
      { status: 500 }
    )
  }
}







