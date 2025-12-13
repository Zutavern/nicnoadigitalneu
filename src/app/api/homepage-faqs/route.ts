import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Homepage-FAQs laden (nur die mit showOnHomepage = true)
export async function GET() {
  try {
    // Prisma Model für FAQs
    const FAQModel = (prisma as any).fAQ || (prisma as any).faq || (prisma as any).FAQ

    let stylistFaqs: any[] = []
    let salonOwnerFaqs: any[] = []

    try {
      if (FAQModel && typeof FAQModel.findMany === 'function') {
        // Prisma Model vorhanden
        const [stylistResult, salonOwnerResult] = await Promise.all([
          FAQModel.findMany({
            where: {
              isActive: true,
              showOnHomepage: true,
              role: 'STYLIST',
            },
            orderBy: [
              { sortOrder: 'asc' },
              { createdAt: 'desc' },
            ],
            select: {
              id: true,
              question: true,
              answer: true,
              category: true,
              role: true,
            },
          }),
          FAQModel.findMany({
            where: {
              isActive: true,
              showOnHomepage: true,
              role: 'SALON_OWNER',
            },
            orderBy: [
              { sortOrder: 'asc' },
              { createdAt: 'desc' },
            ],
            select: {
              id: true,
              question: true,
              answer: true,
              category: true,
              role: true,
            },
          }),
        ])

        stylistFaqs = stylistResult
        salonOwnerFaqs = salonOwnerResult
      } else {
        throw new Error('FAQ model not found, using raw SQL')
      }
    } catch (modelError) {
      // Fallback: Raw SQL
      try {
        const [stylistResult, salonOwnerResult] = await Promise.all([
          prisma.$queryRaw`
            SELECT 
              id, question, answer, category, role
            FROM faqs 
            WHERE is_active = true AND show_on_homepage = true AND role = 'STYLIST'
            ORDER BY sort_order ASC, created_at DESC
          ` as Promise<any[]>,
          prisma.$queryRaw`
            SELECT 
              id, question, answer, category, role
            FROM faqs 
            WHERE is_active = true AND show_on_homepage = true AND role = 'SALON_OWNER'
            ORDER BY sort_order ASC, created_at DESC
          ` as Promise<any[]>,
        ])

        stylistFaqs = stylistResult || []
        salonOwnerFaqs = salonOwnerResult || []
      } catch (rawError) {
        console.error('Raw query failed:', rawError)
        stylistFaqs = []
        salonOwnerFaqs = []
      }
    }

    return NextResponse.json({
      STYLIST: stylistFaqs,
      SALON_OWNER: salonOwnerFaqs,
    })
  } catch (error) {
    console.error('Error fetching homepage FAQs:', error)
    return NextResponse.json({
      STYLIST: [],
      SALON_OWNER: [],
    })
  }
}






