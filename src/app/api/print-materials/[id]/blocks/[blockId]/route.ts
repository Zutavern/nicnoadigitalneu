import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string; blockId: string }>
}

// GET /api/print-materials/[id]/blocks/[blockId] - Einzelnen Block laden
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id, blockId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Prüfe ob Material existiert und dem User gehört
    const material = await prisma.printMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Print-Material nicht gefunden' },
        { status: 404 }
      )
    }

    const block = await prisma.printBlock.findFirst({
      where: {
        id: blockId,
        printMaterialId: id,
      },
    })

    if (!block) {
      return NextResponse.json(
        { error: 'Block nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ block })
  } catch (error) {
    console.error('Fehler beim Laden des Blocks:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// PUT /api/print-materials/[id]/blocks/[blockId] - Block aktualisieren
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id, blockId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Prüfe ob Material existiert und dem User gehört
    const material = await prisma.printMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Print-Material nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe ob Block existiert
    const existingBlock = await prisma.printBlock.findFirst({
      where: {
        id: blockId,
        printMaterialId: id,
      },
    })

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Block nicht gefunden' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      side,
      sortOrder,
      type,
      x,
      y,
      width,
      height,
      rotation,
      content,
      textAlign,
      fontSize,
      fontWeight,
      color,
      imageUrl,
      objectFit,
      borderRadius,
      qrCodeUrl,
      qrCodeLabel,
      qrCodeSize,
      showPhone,
      showEmail,
      showAddress,
      showWebsite,
      spacing,
    } = body

    const updateData: any = {}

    if (side !== undefined) updateData.side = side
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder
    if (type !== undefined) updateData.type = type
    if (x !== undefined) updateData.x = x
    if (y !== undefined) updateData.y = y
    if (width !== undefined) updateData.width = width
    if (height !== undefined) updateData.height = height
    if (rotation !== undefined) updateData.rotation = rotation
    if (content !== undefined) updateData.content = content
    if (textAlign !== undefined) updateData.textAlign = textAlign
    if (fontSize !== undefined) updateData.fontSize = fontSize
    if (fontWeight !== undefined) updateData.fontWeight = fontWeight
    if (color !== undefined) updateData.color = color
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (objectFit !== undefined) updateData.objectFit = objectFit
    if (borderRadius !== undefined) updateData.borderRadius = borderRadius
    if (qrCodeUrl !== undefined) updateData.qrCodeUrl = qrCodeUrl
    if (qrCodeLabel !== undefined) updateData.qrCodeLabel = qrCodeLabel
    if (qrCodeSize !== undefined) updateData.qrCodeSize = qrCodeSize
    if (showPhone !== undefined) updateData.showPhone = showPhone
    if (showEmail !== undefined) updateData.showEmail = showEmail
    if (showAddress !== undefined) updateData.showAddress = showAddress
    if (showWebsite !== undefined) updateData.showWebsite = showWebsite
    if (spacing !== undefined) updateData.spacing = spacing

    const block = await prisma.printBlock.update({
      where: { id: blockId },
      data: updateData,
    })

    return NextResponse.json({ block })
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Blocks:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// DELETE /api/print-materials/[id]/blocks/[blockId] - Block löschen
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id, blockId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Prüfe ob Material existiert und dem User gehört
    const material = await prisma.printMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Print-Material nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe ob Block existiert
    const existingBlock = await prisma.printBlock.findFirst({
      where: {
        id: blockId,
        printMaterialId: id,
      },
    })

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Block nicht gefunden' },
        { status: 404 }
      )
    }

    await prisma.printBlock.delete({
      where: { id: blockId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Blocks:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

