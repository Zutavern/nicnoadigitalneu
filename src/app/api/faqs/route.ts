import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Öffentliche FAQs laden
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'STYLIST' oder 'SALON_OWNER'
    const category = searchParams.get('category') // Optional: Filter nach Kategorie

    const where: any = { isActive: true }
    if (role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
      where.role = role
    }
    if (category) {
      where.category = category
    }

    // Try to use Prisma model first
    let faqs: any[] = []
    
    try {
      // Prisma generiert Model-Namen in camelCase, also 'fAQ' (wegen FAQ Model)
      const FAQModel = (prisma as any).fAQ || (prisma as any).faq || (prisma as any).FAQ
      
      if (FAQModel && typeof FAQModel.findMany === 'function') {
        faqs = await FAQModel.findMany({
          where,
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        })
      } else {
        throw new Error('FAQ model not found, using raw SQL')
      }
    } catch (modelError) {
      // Fallback: Use raw SQL query
      try {
        if (role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
          if (category) {
            faqs = await prisma.$queryRaw`
              SELECT 
                id, question, answer, category, role,
                is_active as "isActive", sort_order as "sortOrder",
                created_at as "createdAt", updated_at as "updatedAt"
              FROM faqs 
              WHERE is_active = true AND role = ${role} AND category = ${category}
              ORDER BY sort_order ASC, created_at DESC
            ` as any[]
          } else {
            faqs = await prisma.$queryRaw`
              SELECT 
                id, question, answer, category, role,
                is_active as "isActive", sort_order as "sortOrder",
                created_at as "createdAt", updated_at as "updatedAt"
              FROM faqs 
              WHERE is_active = true AND role = ${role}
              ORDER BY sort_order ASC, created_at DESC
            ` as any[]
          }
        } else {
          faqs = await prisma.$queryRaw`
            SELECT 
              id, question, answer, category, role,
              is_active as "isActive", sort_order as "sortOrder",
              created_at as "createdAt", updated_at as "updatedAt"
            FROM faqs 
            WHERE is_active = true
            ORDER BY sort_order ASC, created_at DESC
          ` as any[]
        }
      } catch (rawError: any) {
        console.error('Raw query also failed:', rawError)
        // Return empty array instead of error to prevent page crash
        faqs = []
      }
    }

    const formattedFAQs = faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || null,
      role: faq.role,
      sortOrder: faq.sortOrder || faq.sort_order || 0,
    }))

    return NextResponse.json(formattedFAQs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    // Return empty array instead of error to prevent page crash
    return NextResponse.json([])
  }
}

