import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  MAX_PROJECTS_PER_USER, 
  generateSlug, 
  generateInitialPages,
  PAGE_CONFIG_OPTIONS 
} from '@/lib/homepage-builder'
import type { 
  HomepageTemplate, 
  HomepagePageConfig, 
  HomepageDesignStyle,
  HomepageContactData 
} from '@/lib/homepage-builder'

/**
 * GET /api/homepage
 * Lädt alle Homepage-Projekte des aktuellen Benutzers (max 6)
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const projects = await prisma.homepageProject.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: MAX_PROJECTS_PER_USER
    })

    return NextResponse.json({ 
      projects,
      maxProjects: MAX_PROJECTS_PER_USER,
      canCreate: projects.length < MAX_PROJECTS_PER_USER
    })
  } catch (error) {
    console.error('Homepage GET error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Projekte' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/homepage
 * Erstellt ein neues Homepage-Projekt
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Prüfen ob Maximum erreicht
    const existingCount = await prisma.homepageProject.count({
      where: { userId: session.user.id }
    })

    if (existingCount >= MAX_PROJECTS_PER_USER) {
      return NextResponse.json(
        { error: `Du kannst maximal ${MAX_PROJECTS_PER_USER} Projekte erstellen` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      templateType,
      pageConfig,
      designStyle,
      contactData,
      brandingColor,
      brandingLogoUrl
    } = body as {
      name: string
      templateType: HomepageTemplate
      pageConfig: HomepagePageConfig
      designStyle: HomepageDesignStyle
      contactData: HomepageContactData
      brandingColor?: string
      brandingLogoUrl?: string
    }

    // Validierung
    if (!name || !templateType || !pageConfig || !designStyle) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt sein' },
        { status: 400 }
      )
    }

    // Slug generieren und auf Eindeutigkeit prüfen
    let slug = generateSlug(name)
    let slugSuffix = 0
    let slugExists = true

    while (slugExists) {
      const testSlug = slugSuffix > 0 ? `${slug}-${slugSuffix}` : slug
      const existing = await prisma.homepageProject.findUnique({
        where: { slug: testSlug }
      })
      if (!existing) {
        slug = testSlug
        slugExists = false
      } else {
        slugSuffix++
      }
    }

    // Rolle des Benutzers ermitteln
    const userRole = session.user.role === 'SALON_OWNER' ? 'SALON_OWNER' : 'STYLIST'

    // Initiale Seiten generieren
    const initialPages = generateInitialPages(pageConfig, userRole)

    // Projekt erstellen
    const project = await prisma.homepageProject.create({
      data: {
        userId: session.user.id,
        name,
        slug,
        templateType,
        pageConfig,
        designStyle,
        contactData: contactData || {},
        pages: initialPages,
        brandingColor,
        brandingLogoUrl,
        status: 'DRAFT'
      }
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Homepage POST error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Projekts' },
      { status: 500 }
    )
  }
}



