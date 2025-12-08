import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Alle Partner laden (auch inaktive für Admin)
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

    // Try to use Prisma model first
    let partners: any[]
    
    try {
      // Check if partner model exists by trying to access it
      if ('partner' in prisma && typeof (prisma as any).partner?.findMany === 'function') {
        const where = includeInactive ? {} : { isActive: true }

        partners = await (prisma as any).partner.findMany({
          where,
          orderBy: [
            { category: 'asc' },
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        })
      } else {
        // Fallback: Use raw SQL query
        if (includeInactive) {
          partners = await prisma.$queryRaw`
            SELECT 
              id, name, slug, category, description, offer, code, 
              instructions, link, is_highlight as "isHighlight", 
              is_active as "isActive", sort_order as "sortOrder",
              logo_url as "logoUrl", created_at as "createdAt", 
              updated_at as "updatedAt"
            FROM partners 
            ORDER BY category ASC, sort_order ASC, created_at DESC
          ` as any[]
        } else {
          partners = await prisma.$queryRaw`
            SELECT 
              id, name, slug, category, description, offer, code, 
              instructions, link, is_highlight as "isHighlight", 
              is_active as "isActive", sort_order as "sortOrder",
              logo_url as "logoUrl", created_at as "createdAt", 
              updated_at as "updatedAt"
            FROM partners 
            WHERE is_active = true
            ORDER BY category ASC, sort_order ASC, created_at DESC
          ` as any[]
        }
      }
    } catch (error: any) {
      console.error('Error in partner query:', error)
      // Final fallback: Return empty array or try raw query
      try {
        const whereClause = includeInactive ? '' : 'WHERE is_active = true'
        if (includeInactive) {
          partners = await prisma.$queryRaw`
            SELECT 
              id, name, slug, category, description, offer, code, 
              instructions, link, is_highlight as "isHighlight", 
              is_active as "isActive", sort_order as "sortOrder",
              logo_url as "logoUrl", created_at as "createdAt", 
              updated_at as "updatedAt"
            FROM partners 
            ORDER BY category ASC, sort_order ASC, created_at DESC
          ` as any[]
        } else {
          partners = await prisma.$queryRaw`
            SELECT 
              id, name, slug, category, description, offer, code, 
              instructions, link, is_highlight as "isHighlight", 
              is_active as "isActive", sort_order as "sortOrder",
              logo_url as "logoUrl", created_at as "createdAt", 
              updated_at as "updatedAt"
            FROM partners 
            WHERE is_active = true
            ORDER BY category ASC, sort_order ASC, created_at DESC
          ` as any[]
        }
      } catch (rawError) {
        console.error('Raw query also failed:', rawError)
        return NextResponse.json(
          { error: 'Fehler beim Laden der Partner aus der Datenbank' },
          { status: 500 }
        )
      }
    }

    // Parse instructions JSON safely
    const partnersWithParsedInstructions = partners.map((partner) => {
      let parsedInstructions: string[] = []
      
      if (partner.instructions) {
        try {
          parsedInstructions = typeof partner.instructions === 'string' 
            ? JSON.parse(partner.instructions) 
            : partner.instructions
        } catch (parseError) {
          console.error('Error parsing instructions for partner:', partner.id, parseError)
          parsedInstructions = []
        }
      }

      return {
        id: partner.id,
        name: partner.name,
        slug: partner.slug,
        category: partner.category,
        description: partner.description,
        offer: partner.offer,
        code: partner.code,
        link: partner.link,
        isHighlight: partner.isHighlight || partner.is_highlight || false,
        isActive: partner.isActive !== undefined ? partner.isActive : (partner.is_active !== undefined ? partner.is_active : true),
        sortOrder: partner.sortOrder || partner.sort_order || 0,
        logoUrl: partner.logoUrl || partner.logo_url || null,
        createdAt: partner.createdAt || partner.created_at,
        updatedAt: partner.updatedAt || partner.updated_at,
        instructions: parsedInstructions,
      }
    })

    return NextResponse.json(partnersWithParsedInstructions)
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Partner' },
      { status: 500 }
    )
  }
}

// POST - Neuen Partner erstellen
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
      slug,
      category,
      description,
      offer,
      code,
      instructions = [],
      link,
      logoUrl,
      isHighlight = false,
      isActive = true,
      sortOrder = 0,
    } = body

    // Validierung
    if (!name || !slug || !category || !description || !offer || !link) {
      return NextResponse.json(
        { error: 'Name, Slug, Kategorie, Beschreibung, Angebot und Link sind erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Slug bereits existiert
    const existingPartner = await prisma.partner.findUnique({
      where: { slug }
    })

    if (existingPartner) {
      return NextResponse.json(
        { error: 'Ein Partner mit diesem Slug existiert bereits' },
        { status: 400 }
      )
    }

    // Validiere Kategorie
    const validCategories = ['tools', 'booking', 'finance']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Ungültige Kategorie. Erlaubt: tools, booking, finance' },
        { status: 400 }
      )
    }

    // Erstelle Partner
    const partner = await prisma.partner.create({
      data: {
        name,
        slug,
        category,
        description,
        offer,
        code: code || null,
        instructions: JSON.stringify(instructions),
        link,
        logoUrl: logoUrl || null,
        isHighlight,
        isActive,
        sortOrder,
      },
    })

    return NextResponse.json({
      ...partner,
      instructions: JSON.parse(partner.instructions),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Partners' },
      { status: 500 }
    )
  }
}

// PUT - Partner aktualisieren
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
      slug,
      category,
      description,
      offer,
      code,
      instructions = [],
      link,
      logoUrl,
      isHighlight,
      isActive,
      sortOrder,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Partner-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Partner existiert
    const existingPartner = await prisma.partner.findUnique({
      where: { id }
    })

    if (!existingPartner) {
      return NextResponse.json(
        { error: 'Partner nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe ob Slug bereits von anderem Partner verwendet wird
    if (slug && slug !== existingPartner.slug) {
      const slugExists = await prisma.partner.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Ein Partner mit diesem Slug existiert bereits' },
          { status: 400 }
        )
      }
    }

    // Validiere Kategorie falls geändert
    if (category) {
      const validCategories = ['tools', 'booking', 'finance']
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: 'Ungültige Kategorie. Erlaubt: tools, booking, finance' },
          { status: 400 }
        )
      }
    }

    // Update Partner
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (category !== undefined) updateData.category = category
    if (description !== undefined) updateData.description = description
    if (offer !== undefined) updateData.offer = offer
    if (code !== undefined) updateData.code = code || null
    if (instructions !== undefined) updateData.instructions = JSON.stringify(instructions)
    if (link !== undefined) updateData.link = link
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null
    if (isHighlight !== undefined) updateData.isHighlight = isHighlight
    if (isActive !== undefined) updateData.isActive = isActive
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder

    const partner = await prisma.partner.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      ...partner,
      instructions: JSON.parse(partner.instructions),
    })
  } catch (error) {
    console.error('Error updating partner:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Partners' },
      { status: 500 }
    )
  }
}

// DELETE - Partner löschen
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
        { error: 'Partner-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Partner existiert
    const partner = await prisma.partner.findUnique({
      where: { id }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner nicht gefunden' },
        { status: 404 }
      )
    }

    // Lösche Partner
    await prisma.partner.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting partner:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Partners' },
      { status: 500 }
    )
  }
}

