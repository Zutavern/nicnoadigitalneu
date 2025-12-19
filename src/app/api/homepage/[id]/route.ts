import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/homepage/[id]
 * Lädt ein einzelnes Homepage-Projekt
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { id } = await params

    const project = await prisma.homepageProject.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfen ob der Benutzer Zugriff hat
    if (project.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Homepage GET [id] error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Projekts' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/homepage/[id]
 * Aktualisiert ein Homepage-Projekt
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { id } = await params

    // Prüfen ob Projekt existiert und Benutzer Zugriff hat
    const existing = await prisma.homepageProject.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      )
    }

    if (existing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Nur erlaubte Felder aktualisieren
    const updateData: Record<string, unknown> = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.contactData !== undefined) updateData.contactData = body.contactData
    if (body.pages !== undefined) updateData.pages = body.pages
    if (body.brandingColor !== undefined) updateData.brandingColor = body.brandingColor
    if (body.brandingLogoUrl !== undefined) updateData.brandingLogoUrl = body.brandingLogoUrl
    if (body.fontHeading !== undefined) updateData.fontHeading = body.fontHeading
    if (body.fontBody !== undefined) updateData.fontBody = body.fontBody
    if (body.status !== undefined) updateData.status = body.status
    if (body.v0GenerationId !== undefined) updateData.v0GenerationId = body.v0GenerationId
    if (body.v0Error !== undefined) updateData.v0Error = body.v0Error

    const project = await prisma.homepageProject.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Homepage PUT error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Projekts' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/homepage/[id]
 * Löscht ein Homepage-Projekt
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { id } = await params

    // Prüfen ob Projekt existiert und Benutzer Zugriff hat
    const existing = await prisma.homepageProject.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Projekt nicht gefunden' },
        { status: 404 }
      )
    }

    if (existing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      )
    }

    // Nicht löschen wenn veröffentlicht
    if (existing.isPublished) {
      return NextResponse.json(
        { error: 'Veröffentlichte Projekte können nicht gelöscht werden. Bitte zuerst die Veröffentlichung aufheben.' },
        { status: 400 }
      )
    }

    await prisma.homepageProject.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Homepage DELETE error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Projekts' },
      { status: 500 }
    )
  }
}



