import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Liste aller Templates
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const templates = await prisma.newsletterTemplate.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })

    // Transform to include contentBlocks at top level
    const transformedTemplates = templates.map(template => {
      const designJson = template.designJson as Record<string, unknown> | null
      return {
        ...template,
        contentBlocks: designJson?.contentBlocks || [],
      }
    })

    return NextResponse.json({ templates: transformedTemplates })
  } catch (error) {
    console.error('Templates GET error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Templates' },
      { status: 500 }
    )
  }
}

// POST - Neues Template erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, designJson, contentBlocks, thumbnail, category, isDefault } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      )
    }

    // Store contentBlocks inside designJson
    const finalDesignJson = contentBlocks 
      ? { contentBlocks, ...designJson }
      : designJson || { contentBlocks: [] }

    // Wenn isDefault, andere Templates auf false setzen
    if (isDefault) {
      await prisma.newsletterTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    const template = await prisma.newsletterTemplate.create({
      data: {
        name,
        description: description || null,
        designJson: finalDesignJson,
        thumbnail: thumbnail || null,
        category: category || 'general',
        isDefault: isDefault || false
      }
    })

    // Return with contentBlocks at top level
    const resultDesignJson = template.designJson as Record<string, unknown> | null
    return NextResponse.json({ 
      template: {
        ...template,
        contentBlocks: resultDesignJson?.contentBlocks || [],
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Template POST error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Templates' },
      { status: 500 }
    )
  }
}

// DELETE - Template löschen
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Template-ID erforderlich' },
        { status: 400 }
      )
    }

    await prisma.newsletterTemplate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Template DELETE error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Templates' },
      { status: 500 }
    )
  }
}
