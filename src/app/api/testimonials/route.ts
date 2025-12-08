import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Öffentliche Testimonials laden
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'STYLIST' oder 'SALON_OWNER'

    const where: any = { isActive: true }
    if (role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
      where.role = role
    }

    // Try to use Prisma model first
    let testimonials: any[] = []
    
    try {
      // Prisma generiert Model-Namen in camelCase, also 'testimonial' (lowercase)
      // Aber manchmal auch mit großem T: 'Testimonial'
      const TestimonialModel = (prisma as any).testimonial || (prisma as any).Testimonial
      
      if (TestimonialModel && typeof TestimonialModel.findMany === 'function') {
        testimonials = await TestimonialModel.findMany({
          where,
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        })
      } else {
        // Fallback: Use raw SQL query
        if (role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
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
      // Final fallback
      try {
        if (role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
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
      } catch (rawError) {
        console.error('Raw query also failed:', rawError)
        return NextResponse.json(
          { error: 'Fehler beim Laden der Testimonials' },
          { status: 500 }
        )
      }
    }

    const formattedTestimonials = testimonials.map((testimonial) => ({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role,
      text: testimonial.text,
      imageUrl: testimonial.imageUrl || testimonial.image_url || null,
      company: testimonial.company || null,
      sortOrder: testimonial.sortOrder || testimonial.sort_order || 0,
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

