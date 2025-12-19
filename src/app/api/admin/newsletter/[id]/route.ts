import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NewsletterStatus, NewsletterSegment } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Einzelnen Newsletter laden
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter nicht gefunden' },
        { status: 404 }
      )
    }

    // Return contentBlocks at top level for convenience
    const designJson = newsletter.designJson as Record<string, unknown> | null
    return NextResponse.json({ 
      newsletter: {
        ...newsletter,
        contentBlocks: designJson?.contentBlocks || [],
      }
    })
  } catch (error) {
    console.error('Newsletter GET error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Newsletters' },
      { status: 500 }
    )
  }
}

// PUT - Newsletter aktualisieren (für den neuen Editor)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Prüfen ob Newsletter existiert
    const existing = await prisma.newsletter.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Newsletter nicht gefunden' },
        { status: 404 }
      )
    }

    // Nur Drafts können bearbeitet werden
    if (existing.status !== NewsletterStatus.DRAFT) {
      return NextResponse.json(
        { error: 'Nur Entwürfe können bearbeitet werden' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.subject !== undefined) updateData.subject = body.subject
    if (body.preheader !== undefined) updateData.preheader = body.preheader
    
    // Handle contentBlocks - store in designJson
    if (body.contentBlocks !== undefined) {
      const existingDesignJson = (existing.designJson as Record<string, unknown>) || {}
      updateData.designJson = {
        ...existingDesignJson,
        contentBlocks: body.contentBlocks,
      }
    } else if (body.designJson !== undefined) {
      updateData.designJson = body.designJson
    }
    
    if (body.htmlContent !== undefined) updateData.htmlContent = body.htmlContent
    if (body.segment !== undefined) {
      updateData.segment = body.segment as NewsletterSegment
    }
    if (body.scheduledAt !== undefined) {
      updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null
      if (body.scheduledAt) {
        updateData.status = NewsletterStatus.SCHEDULED
      }
    }

    const newsletter = await prisma.newsletter.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Return contentBlocks at top level
    const designJson = newsletter.designJson as Record<string, unknown> | null
    return NextResponse.json({ 
      newsletter: {
        ...newsletter,
        contentBlocks: designJson?.contentBlocks || [],
      }
    })
  } catch (error) {
    console.error('Newsletter PUT error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Newsletters' },
      { status: 500 }
    )
  }
}

// PATCH - Newsletter aktualisieren (legacy)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params })
}

// DELETE - Newsletter löschen
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    // Prüfen ob Newsletter existiert
    const existing = await prisma.newsletter.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Newsletter nicht gefunden' },
        { status: 404 }
      )
    }

    // Nur Drafts können gelöscht werden
    if (existing.status !== NewsletterStatus.DRAFT) {
      return NextResponse.json(
        { error: 'Nur Entwürfe können gelöscht werden' },
        { status: 400 }
      )
    }

    await prisma.newsletter.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter DELETE error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Newsletters' },
      { status: 500 }
    )
  }
}
