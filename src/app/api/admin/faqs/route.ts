import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Alle FAQs laden (auch inaktive für Admin)
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
    const category = searchParams.get('category')

    // Try to use Prisma model first
    let faqs: any[] = []
    
    try {
      const FAQModel = (prisma as any).fAQ || (prisma as any).faq || (prisma as any).FAQ
      
      if (FAQModel && typeof FAQModel.findMany === 'function') {
        const where: any = includeInactive ? {} : { isActive: true }
        if (role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
          where.role = role
        }
        if (category) {
          where.category = category
        }

        faqs = await FAQModel.findMany({
          where,
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'desc' },
          ],
        })
      } else {
        // Fallback: Use raw SQL query
        let whereClause = includeInactive ? '' : 'WHERE is_active = true'
        if (role && (role === 'STYLIST' || role === 'SALON_OWNER')) {
          whereClause += (whereClause ? ' AND' : 'WHERE') + ` role = '${role}'`
        }
        if (category) {
          whereClause += (whereClause ? ' AND' : 'WHERE') + ` category = '${category}'`
        }

        faqs = await prisma.$queryRawUnsafe(`
          SELECT 
            id, question, answer, category, role,
            is_active as "isActive", sort_order as "sortOrder",
            created_at as "createdAt", updated_at as "updatedAt"
          FROM faqs 
          ${whereClause}
          ORDER BY sort_order ASC, created_at DESC
        `) as any[]
      }
    } catch (error: any) {
      console.error('Error in FAQ query:', error)
      return NextResponse.json(
        { error: 'Fehler beim Laden der FAQs' },
        { status: 500 }
      )
    }

    const formattedFAQs = faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || null,
      role: faq.role,
      isActive: faq.isActive !== undefined ? faq.isActive : (faq.is_active !== undefined ? faq.is_active : true),
      showOnHomepage: faq.showOnHomepage !== undefined ? faq.showOnHomepage : (faq.show_on_homepage !== undefined ? faq.show_on_homepage : false),
      sortOrder: faq.sortOrder || faq.sort_order || 0,
      createdAt: faq.createdAt || faq.created_at,
      updatedAt: faq.updatedAt || faq.updated_at,
    }))

    return NextResponse.json(formattedFAQs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der FAQs' },
      { status: 500 }
    )
  }
}

// POST - Neues FAQ erstellen
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
      question,
      answer,
      category,
      role,
      isActive = true,
      showOnHomepage = false,
      sortOrder = 0,
    } = body

    // Validierung
    if (!question || !answer || !role) {
      return NextResponse.json(
        { error: 'Frage, Antwort und Rolle sind erforderlich' },
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

    // Erstelle FAQ - Versuche verschiedene Model-Namen
    let faq: any
    
    try {
      const FAQModel = (prisma as any).fAQ || (prisma as any).faq || (prisma as any).FAQ
      
      if (FAQModel && typeof FAQModel.create === 'function') {
        faq = await FAQModel.create({
          data: {
            question,
            answer,
            category: category || null,
            role,
            isActive,
            showOnHomepage,
            sortOrder,
          },
        })
      } else {
        // Fallback: Use raw SQL
        const result = await prisma.$queryRaw`
          INSERT INTO faqs (question, answer, category, role, is_active, show_on_homepage, sort_order)
          VALUES (${question}, ${answer}, ${category || null}, ${role}, ${isActive}, ${showOnHomepage}, ${sortOrder})
          RETURNING id, question, answer, category, role, is_active as "isActive", show_on_homepage as "showOnHomepage", sort_order as "sortOrder", created_at as "createdAt", updated_at as "updatedAt"
        ` as any[]
        faq = result[0]
      }
    } catch (error: any) {
      console.error('Error creating FAQ:', error)
      // Fallback: Use raw SQL
      try {
        const result = await prisma.$queryRaw`
          INSERT INTO faqs (question, answer, category, role, is_active, show_on_homepage, sort_order)
          VALUES (${question}, ${answer}, ${category || null}, ${role}, ${isActive}, ${showOnHomepage}, ${sortOrder})
          RETURNING id, question, answer, category, role, is_active as "isActive", show_on_homepage as "showOnHomepage", sort_order as "sortOrder", created_at as "createdAt", updated_at as "updatedAt"
        ` as any[]
        faq = result[0]
      } catch (rawError) {
        console.error('Raw SQL also failed:', rawError)
        return NextResponse.json(
          { error: `Fehler beim Erstellen des FAQs: ${rawError instanceof Error ? rawError.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des FAQs' },
      { status: 500 }
    )
  }
}

// PUT - FAQ aktualisieren
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
      question,
      answer,
      category,
      role,
      isActive,
      showOnHomepage,
      sortOrder,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Validiere Rolle falls geändert
    if (role && role !== 'STYLIST' && role !== 'SALON_OWNER') {
      return NextResponse.json(
        { error: 'Ungültige Rolle. Erlaubt: STYLIST, SALON_OWNER' },
        { status: 400 }
      )
    }

    // Update FAQ
    let faq: any
    
    try {
      const FAQModel = (prisma as any).fAQ || (prisma as any).faq || (prisma as any).FAQ
      
      if (FAQModel && typeof FAQModel.update === 'function') {
        const updateData: any = {}
        if (question !== undefined) updateData.question = question
        if (answer !== undefined) updateData.answer = answer
        if (category !== undefined) updateData.category = category || null
        if (role !== undefined) updateData.role = role
        if (isActive !== undefined) updateData.isActive = isActive
        if (showOnHomepage !== undefined) updateData.showOnHomepage = showOnHomepage
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder

        faq = await FAQModel.update({
          where: { id },
          data: updateData,
        })
      } else {
        // Fallback: Use raw SQL - Build dynamic UPDATE
        const updates: string[] = []
        if (question !== undefined) {
          const escapedQuestion = String(question).replace(/'/g, "''")
          updates.push(`question = '${escapedQuestion}'`)
        }
        if (answer !== undefined) {
          const escapedAnswer = String(answer).replace(/'/g, "''")
          updates.push(`answer = '${escapedAnswer}'`)
        }
        if (category !== undefined) {
          if (category) {
            const escapedCategory = String(category).replace(/'/g, "''")
            updates.push(`category = '${escapedCategory}'`)
          } else {
            updates.push(`category = NULL`)
          }
        }
        if (role !== undefined) {
          updates.push(`role = '${role}'`)
        }
        if (isActive !== undefined) {
          updates.push(`is_active = ${isActive}`)
        }
        if (showOnHomepage !== undefined) {
          updates.push(`show_on_homepage = ${showOnHomepage}`)
        }
        if (sortOrder !== undefined) {
          updates.push(`sort_order = ${sortOrder}`)
        }
        updates.push(`updated_at = NOW()`)
        
        const query = `
          UPDATE faqs 
          SET ${updates.join(', ')}
          WHERE id = '${id}'
          RETURNING id, question, answer, category, role, is_active as "isActive", show_on_homepage as "showOnHomepage", sort_order as "sortOrder", created_at as "createdAt", updated_at as "updatedAt"
        `
        
        const result = await prisma.$queryRawUnsafe(query) as any[]
        if (result && result.length > 0) {
          faq = result[0]
        } else {
          return NextResponse.json(
            { error: 'FAQ nicht gefunden' },
            { status: 404 }
          )
        }
      }
    } catch (error: any) {
      console.error('Error updating FAQ:', error)
      return NextResponse.json(
        { error: `Fehler beim Aktualisieren des FAQs: ${error.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des FAQs' },
      { status: 500 }
    )
  }
}

// DELETE - FAQ löschen
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
        { error: 'FAQ-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Lösche FAQ
    try {
      const FAQModel = (prisma as any).fAQ || (prisma as any).faq || (prisma as any).FAQ
      
      if (FAQModel && typeof FAQModel.delete === 'function') {
        await FAQModel.delete({ where: { id } })
      } else {
        // Fallback: Use raw SQL
        await prisma.$queryRaw`DELETE FROM faqs WHERE id = ${id}`
      }
    } catch (error: any) {
      console.error('Error deleting FAQ:', error)
      // Fallback: Use raw SQL
      try {
        await prisma.$queryRaw`DELETE FROM faqs WHERE id = ${id}`
      } catch (rawError) {
        console.error('Raw SQL also failed:', rawError)
        return NextResponse.json(
          { error: 'Fehler beim Löschen des FAQs' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des FAQs' },
      { status: 500 }
    )
  }
}
