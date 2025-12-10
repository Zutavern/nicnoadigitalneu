import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LegalPageType } from '@prisma/client'

// GET - Alle Sections für einen Seitentyp laden
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as LegalPageType | null

    if (!type || !['IMPRESSUM', 'DATENSCHUTZ', 'AGB'].includes(type)) {
      return NextResponse.json(
        { error: 'Ungültiger Seitentyp. Erlaubt: IMPRESSUM, DATENSCHUTZ, AGB' },
        { status: 400 }
      )
    }

    const sections = await prisma.legalSection.findMany({
      where: { pageType: type },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching legal sections:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Abschnitte' },
      { status: 500 }
    )
  }
}

// POST - Neue Section erstellen
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { pageType, title, content, sortOrder, isActive, isCollapsible } = body

    if (!pageType || !['IMPRESSUM', 'DATENSCHUTZ', 'AGB'].includes(pageType)) {
      return NextResponse.json(
        { error: 'Ungültiger Seitentyp' },
        { status: 400 }
      )
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titel und Inhalt sind erforderlich' },
        { status: 400 }
      )
    }

    // Stelle sicher, dass die Config existiert
    await prisma.legalPageConfig.upsert({
      where: { pageType },
      create: {
        pageType,
        heroTitle: pageType === 'IMPRESSUM' ? 'Impressum' : 
                   pageType === 'DATENSCHUTZ' ? 'Datenschutzerklärung' : 
                   'Allgemeine Geschäftsbedingungen',
      },
      update: {},
    })

    const section = await prisma.legalSection.create({
      data: {
        pageType,
        title,
        content,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        isCollapsible: isCollapsible ?? true,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating legal section:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Abschnitts' },
      { status: 500 }
    )
  }
}

// PUT - Bulk-Update für Reihenfolge (Drag & Drop)
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const body = await request.json()
    const { sections } = body

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Sections-Array ist erforderlich' },
        { status: 400 }
      )
    }

    // Update sortOrder für alle Sections
    await prisma.$transaction(
      sections.map((section: { id: string; sortOrder: number }) =>
        prisma.legalSection.update({
          where: { id: section.id },
          data: { sortOrder: section.sortOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering legal sections:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Reihenfolge' },
      { status: 500 }
    )
  }
}
