import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/homepage-prompts
 * Liste aller Homepage-Prompts (mit Filtern)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageType = searchParams.get('pageType')
    const targetRole = searchParams.get('targetRole')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    // Filter aufbauen
    const where: Record<string, unknown> = {}
    if (pageType) where.pageType = pageType
    if (targetRole) where.targetRole = targetRole
    if (category) where.category = category
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const prompts = await prisma.homepagePrompt.findMany({
      where,
      orderBy: [
        { pageType: 'asc' },
        { category: 'asc' },
        { sortOrder: 'asc' }
      ]
    })

    // Statistiken
    const stats = {
      total: prompts.length,
      active: prompts.filter(p => p.isActive).length,
      byPageType: {} as Record<string, number>,
      byTargetRole: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    }

    prompts.forEach(p => {
      stats.byPageType[p.pageType] = (stats.byPageType[p.pageType] || 0) + 1
      stats.byTargetRole[p.targetRole] = (stats.byTargetRole[p.targetRole] || 0) + 1
      stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1
    })

    return NextResponse.json({ prompts, stats })
  } catch (error) {
    console.error('Error fetching homepage prompts:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Prompts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/homepage-prompts
 * Neuen Prompt erstellen
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { pageType, targetRole, category, title, prompt, description, icon, sortOrder, isActive } = body

    // Validierung
    if (!pageType || !targetRole || !category || !title || !prompt) {
      return NextResponse.json(
        { error: 'pageType, targetRole, category, title und prompt sind erforderlich' },
        { status: 400 }
      )
    }

    // Nächste sortOrder ermitteln wenn nicht angegeben
    let finalSortOrder = sortOrder
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const maxSortOrder = await prisma.homepagePrompt.aggregate({
        where: { pageType, category },
        _max: { sortOrder: true }
      })
      finalSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1
    }

    const newPrompt = await prisma.homepagePrompt.create({
      data: {
        pageType,
        targetRole,
        category,
        title,
        prompt,
        description: description || null,
        icon: icon || null,
        sortOrder: finalSortOrder,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json({ prompt: newPrompt }, { status: 201 })
  } catch (error) {
    console.error('Error creating homepage prompt:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Prompts' },
      { status: 500 }
    )
  }
}



