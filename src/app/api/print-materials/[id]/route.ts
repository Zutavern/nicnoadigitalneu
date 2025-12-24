import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/print-materials/[id] - Einzelnes Print-Material
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const material = await prisma.printMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        blocks: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Print-Material nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ material })
  } catch (error) {
    console.error('Fehler beim Laden des Print-Materials:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// PUT /api/print-materials/[id] - Print-Material aktualisieren
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Prüfe ob Material existiert und dem User gehört
    const existingMaterial = await prisma.printMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingMaterial) {
      return NextResponse.json(
        { error: 'Print-Material nicht gefunden' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      type,
      width,
      height,
      bleed,
      theme,
      fontFamily,
      primaryColor,
      secondaryColor,
      backgroundColor,
      frontBackgroundUrl,
      backBackgroundUrl,
      isPublished,
    } = body

    const updateData: any = {}

    if (name !== undefined) updateData.name = name.trim()
    if (type !== undefined) updateData.type = type
    if (width !== undefined) updateData.width = width
    if (height !== undefined) updateData.height = height
    if (bleed !== undefined) updateData.bleed = bleed
    if (theme !== undefined) updateData.theme = theme
    if (fontFamily !== undefined) updateData.fontFamily = fontFamily
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor
    if (frontBackgroundUrl !== undefined) updateData.frontBackgroundUrl = frontBackgroundUrl
    if (backBackgroundUrl !== undefined) updateData.backBackgroundUrl = backBackgroundUrl
    if (isPublished !== undefined) updateData.isPublished = isPublished

    const material = await prisma.printMaterial.update({
      where: { id },
      data: updateData,
      include: {
        blocks: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json({ material })
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Print-Materials:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// DELETE /api/print-materials/[id] - Print-Material löschen
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Prüfe ob Material existiert und dem User gehört
    const existingMaterial = await prisma.printMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingMaterial) {
      return NextResponse.json(
        { error: 'Print-Material nicht gefunden' },
        { status: 404 }
      )
    }

    // Lösche Material (Blöcke werden durch Cascade gelöscht)
    await prisma.printMaterial.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Print-Materials:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

