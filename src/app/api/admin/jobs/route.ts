import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Hole alle Jobs (inklusive inaktive für Admin)
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = includeInactive ? {} : { isActive: true }

    const jobs = await prisma.jobPosting.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
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

// POST - Erstelle neue Stelle
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      category,
      description,
      requirements,
      benefits,
      location,
      type,
      isActive,
      sortOrder,
    } = body

    if (!title || !slug || !category || !description || !requirements) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      )
    }

    // Prüfe ob Slug bereits existiert
    const existingJob = await prisma.jobPosting.findUnique({
      where: { slug },
    })

    if (existingJob) {
      return NextResponse.json(
        { error: 'Eine Stelle mit diesem Slug existiert bereits' },
        { status: 400 }
      )
    }

    const job = await prisma.jobPosting.create({
      data: {
        title,
        slug,
        category,
        description,
        requirements,
        benefits: benefits || null,
        location: location || 'München (Remote)',
        type: type || 'Vollzeit',
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Stelle' },
      { status: 500 }
    )
  }
}

// PUT - Aktualisiere Stelle
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      title,
      slug,
      category,
      description,
      requirements,
      benefits,
      location,
      type,
      isActive,
      sortOrder,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })
    }

    // Prüfe ob Slug bereits von einer anderen Stelle verwendet wird
    if (slug) {
      const existingJob = await prisma.jobPosting.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      })

      if (existingJob) {
        return NextResponse.json(
          { error: 'Eine andere Stelle mit diesem Slug existiert bereits' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (category !== undefined) updateData.category = category
    if (description !== undefined) updateData.description = description
    if (requirements !== undefined) updateData.requirements = requirements
    if (benefits !== undefined) updateData.benefits = benefits || null
    if (location !== undefined) updateData.location = location
    if (type !== undefined) updateData.type = type
    if (isActive !== undefined) updateData.isActive = isActive
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder

    const job = await prisma.jobPosting.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Stelle' },
      { status: 500 }
    )
  }
}

// DELETE - Lösche Stelle
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID fehlt' }, { status: 400 })
    }

    await prisma.jobPosting.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Stelle' },
      { status: 500 }
    )
  }
}


