import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Hole alle aktiven Partner
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includeDetails = searchParams.get('includeDetails') === 'true'

    // Try to use Prisma model first
    let partners: any[]
    
    try {
      // Check if partner model exists by trying to access it
      if ('partner' in prisma && typeof (prisma as any).partner?.findMany === 'function') {
        const where = category
          ? { isActive: true, category }
          : { isActive: true }

        partners = await (prisma as any).partner.findMany({
          where,
          orderBy: [
            { category: 'asc' },
            { sortOrder: 'asc' },
          ],
        })
      } else {
        // Fallback: Use raw SQL query
        console.log('Using raw SQL query for partners')
        if (category) {
          partners = await prisma.$queryRaw`
            SELECT 
              id, name, slug, category, description, offer, code, 
              instructions, link, is_highlight as "isHighlight", 
              is_active as "isActive", sort_order as "sortOrder",
              logo_url as "logoUrl", created_at as "createdAt", 
              updated_at as "updatedAt"
            FROM partners 
            WHERE is_active = true AND category = ${category}
            ORDER BY category ASC, sort_order ASC
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
            ORDER BY category ASC, sort_order ASC
          ` as any[]
        }
      }
      } catch (error: any) {
      console.error('Error in partner query:', error)
      // Final fallback: Return empty array or try raw query
      try {
        if (category) {
          partners = await prisma.$queryRaw`
            SELECT 
              id, name, slug, category, description, offer, code, 
              instructions, link, is_highlight as "isHighlight", 
              is_active as "isActive", sort_order as "sortOrder",
              logo_url as "logoUrl", created_at as "createdAt", 
              updated_at as "updatedAt"
            FROM partners 
            WHERE is_active = true AND category = ${category}
            ORDER BY category ASC, sort_order ASC
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
            ORDER BY category ASC, sort_order ASC
          ` as any[]
        }
      } catch (rawError) {
        console.error('Raw query also failed:', rawError)
        // Bei Fehler leeres Array zurückgeben statt Fehler
        return NextResponse.json([])
      }
    }

    // Parse instructions JSON safely
    const partnersWithParsedInstructions = partners.map((partner) => {
      let parsedInstructions: string[] | undefined = undefined
      
      if (includeDetails && partner.instructions) {
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
        isHighlight: partner.isHighlight || false,
        isActive: partner.isActive !== undefined ? partner.isActive : true,
        sortOrder: partner.sortOrder || 0,
        logoUrl: partner.logoUrl || null,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt,
        instructions: parsedInstructions,
      }
    })

    return NextResponse.json(partnersWithParsedInstructions)
  } catch (error) {
    console.error('Error fetching partners:', error)
    // Bei Fehler leeres Array zurückgeben statt Fehler
    return NextResponse.json([])
  }
}

