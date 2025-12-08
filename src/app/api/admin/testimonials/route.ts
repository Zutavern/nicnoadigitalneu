import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Alle Testimonials laden (auch inaktive für Admin)
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const role = searchParams.get('role')

    // Try to use Prisma model first
    let testimonials: any[]
    
    try {
      if ('testimonial' in prisma && typeof (prisma as any).testimonial?.findMany === 'function') {
        const where: any = includeInactive ? {} : { isActive: true }
        if (role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
          where.role = role
        }

        testimonials = await (prisma as any).testimonial.findMany({
          where,
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        })
      } else {
        // Fallback: Use raw SQL query
        if (includeInactive && role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
          testimonials = await prisma.$queryRaw`
            SELECT 
              id, name, role, text, image_url as "imageUrl",
              company, is_active as "isActive", sort_order as "sortOrder",
              created_at as "createdAt", updated_at as "updatedAt"
            FROM testimonials 
            WHERE role = ${role}
            ORDER BY sort_order ASC, created_at DESC
          ` as any[]
        } else if (includeInactive) {
          testimonials = await prisma.$queryRaw`
            SELECT 
              id, name, role, text, image_url as "imageUrl",
              company, is_active as "isActive", sort_order as "sortOrder",
              created_at as "createdAt", updated_at as "updatedAt"
            FROM testimonials 
            ORDER BY sort_order ASC, created_at DESC
          ` as any[]
        } else if (role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
          testimonials = await prisma.$queryRaw`
            SELECT 
              id, name, role, text, image_url as "imageUrl",
              company, is_active as "isActive", sort_order as "sortOrder",
              created_at as "createdAt", updated_at as "updatedAt"
            FROM testimonials 
            WHERE is_active = true AND role = ${role}
            ORDER BY sort_order ASC, created_at DESC
          ` as any[]
        } else {
          testimonials = await prisma.$queryRaw`
            SELECT 
              id, name, role, text, image_url as "imageUrl",
              company, is_active as "isActive", sort_order as "sortOrder",
              created_at as "createdAt", updated_at as "updatedAt"
            FROM testimonials 
            WHERE is_active = true
            ORDER BY sort_order ASC, created_at DESC
          ` as any[]
        }
      }
    } catch (error: any) {
      console.error('Error in testimonial query:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Testimonials' },
        { status: 500 }
      )
    }

    const formattedTestimonials = testimonials.map((testimonial) => ({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      text: testimonial.text,
      imageUrl: testimonial.imageUrl || testimonial.image_url || null,
      company: testimonial.company || null,
      isActive: testimonial.isActive !== undefined ? testimonial.isActive : (testimonial.is_active !== undefined ? testimonial.is_active : true),
      sortOrder: testimonial.sortOrder || testimonial.sort_order || 0,
      createdAt: testimonial.createdAt || testimonial.created_at,
      updatedAt: testimonial.updatedAt || testimonial.updated_at,
    }))

    return NextResponse.json(formattedTestimonials)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Testimonials' },
      { status: 500 }
    )
  }
}

// POST - Neues Testimonial erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      role,
      text,
      imageUrl,
      company,
      isActive = true,
      sortOrder = 0,
    } = body

    // Validierung
    if (!name || !role || !text) {
      return NextResponse.json(
        { error: 'Name, Rolle und Text sind erforderlich' },
        { status: 400 }
      )
    }

    // Validiere Rolle
    if (role !== 'STYLIST' && role !== 'SALON_OWNER') {
      return NextResponse.json(
        { error: 'Ungültige Rolle. Erlaubt: STYLIST, SALON_OWNER' },
        { status: 400 }
      )
    }

    // Erstelle Testimonial
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role,
        text,
        imageUrl: imageUrl || null,
        company: company || null,
        isActive,
        sortOrder,
      },
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Testimonials' },
      { status: 500 }
    )
  }
}

// PUT - Testimonial aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      name,
      role,
      text,
      imageUrl,
      company,
      isActive,
      sortOrder,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Testimonial existiert
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id }
    })

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial nicht gefunden' },
        { status: 404 }
      )
    }

    // Validiere Rolle falls geändert
    if (role && role !== 'STYLIST' && role !== 'SALON_OWNER') {
      return NextResponse.json(
        { error: 'Ungültige Rolle. Erlaubt: STYLIST, SALON_OWNER' },
        { status: 400 }
      )
    }

    // Update Testimonial
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (text !== undefined) updateData.text = text
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null
    if (company !== undefined) updateData.company = company || null
    if (isActive !== undefined) updateData.isActive = isActive
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Testimonials' },
      { status: 500 }
    )
  }
}

// DELETE - Testimonial löschen
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Testimonial existiert
    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    })

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial nicht gefunden' },
        { status: 404 }
      )
    }

    // Lösche Testimonial
    await prisma.testimonial.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Testimonials' },
      { status: 500 }
    )
  }
}

