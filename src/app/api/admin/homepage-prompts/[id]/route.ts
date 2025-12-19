import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/homepage-prompts/[id]
 * Einzelnen Prompt laden
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    const prompt = await prisma.homepagePrompt.findUnique({
      where: { id }
    })

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error fetching homepage prompt:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Prompts' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/homepage-prompts/[id]
 * Prompt aktualisieren
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { pageType, targetRole, category, title, prompt, description, icon, sortOrder, isActive } = body

    // Prüfen ob Prompt existiert
    const existingPrompt = await prisma.homepagePrompt.findUnique({
      where: { id }
    })

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt nicht gefunden' }, { status: 404 })
    }

    // Update
    const updatedPrompt = await prisma.homepagePrompt.update({
      where: { id },
      data: {
        ...(pageType !== undefined && { pageType }),
        ...(targetRole !== undefined && { targetRole }),
        ...(category !== undefined && { category }),
        ...(title !== undefined && { title }),
        ...(prompt !== undefined && { prompt }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({ prompt: updatedPrompt })
  } catch (error) {
    console.error('Error updating homepage prompt:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Prompts' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/homepage-prompts/[id]
 * Prompt löschen
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    // Prüfen ob Prompt existiert
    const existingPrompt = await prisma.homepagePrompt.findUnique({
      where: { id }
    })

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt nicht gefunden' }, { status: 404 })
    }

    await prisma.homepagePrompt.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Prompt gelöscht' })
  } catch (error) {
    console.error('Error deleting homepage prompt:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Prompts' },
      { status: 500 }
    )
  }
}



