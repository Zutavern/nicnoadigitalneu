import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BLOCK_TYPE_CONFIGS } from '@/lib/print-materials/types'
import type { PrintBlockType, PrintSide } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/print-materials/[id]/blocks - Alle Blöcke eines Materials
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

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

    const { searchParams } = new URL(request.url)
    const side = searchParams.get('side') as PrintSide | null

    const blocks = await prisma.printBlock.findMany({
      where: {
        printMaterialId: id,
        ...(side && { side }),
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Fehler beim Laden der Blöcke:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// POST /api/print-materials/[id]/blocks - Neuen Block erstellen
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

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

    const body = await request.json()
    const {
      type,
      side = 'FRONT',
      sortOrder,
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

    if (!type) {
      return NextResponse.json(
        { error: 'Block-Typ ist erforderlich' },
        { status: 400 }
      )
    }

    const blockConfig = BLOCK_TYPE_CONFIGS[type as PrintBlockType]
    if (!blockConfig) {
      return NextResponse.json(
        { error: 'Ungültiger Block-Typ' },
        { status: 400 }
      )
    }

    // Hole höchste sortOrder für diese Seite
    const maxSortOrder = await prisma.printBlock.aggregate({
      where: {
        printMaterialId: id,
        side: side as PrintSide,
      },
      _max: { sortOrder: true },
    })

    const safeWidth = material.width - (material.bleed * 2)
    const safeHeight = material.height - (material.bleed * 2)

    const block = await prisma.printBlock.create({
      data: {
        printMaterialId: id,
        type: type as PrintBlockType,
        side: side as PrintSide,
        sortOrder: sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
        x: x ?? (safeWidth - blockConfig.defaultWidth) / 2,
        y: y ?? (safeHeight - blockConfig.defaultHeight) / 2,
        width: width ?? Math.min(blockConfig.defaultWidth, safeWidth),
        height: height ?? Math.min(blockConfig.defaultHeight, safeHeight),
        rotation: rotation ?? 0,
        content: content ?? null,
        textAlign: textAlign ?? 'center',
        fontSize: fontSize ?? (type === 'NAME' ? 14 : type === 'TAGLINE' ? 8 : 10),
        fontWeight: fontWeight ?? (type === 'NAME' ? 'bold' : 'normal'),
        color: color ?? material.primaryColor,
        imageUrl: imageUrl ?? null,
        objectFit: objectFit ?? 'contain',
        borderRadius: borderRadius ?? 0,
        qrCodeUrl: qrCodeUrl ?? null,
        qrCodeLabel: qrCodeLabel ?? null,
        qrCodeSize: qrCodeSize ?? 15,
        showPhone: showPhone ?? true,
        showEmail: showEmail ?? true,
        showAddress: showAddress ?? true,
        showWebsite: showWebsite ?? false,
        spacing: spacing ?? 2,
      },
    })

    return NextResponse.json({ block }, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen des Blocks:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// PUT /api/print-materials/[id]/blocks - Batch-Update für mehrere Blöcke (Reorder)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    const { id } = await params

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

    const body = await request.json()
    const { blocks } = body

    if (!Array.isArray(blocks)) {
      return NextResponse.json(
        { error: 'Blöcke müssen ein Array sein' },
        { status: 400 }
      )
    }

    // Update alle Blöcke in einer Transaktion
    await prisma.$transaction(
      blocks.map((block: { id: string; sortOrder: number }) =>
        prisma.printBlock.update({
          where: { id: block.id },
          data: { sortOrder: block.sortOrder },
        })
      )
    )

    // Hole aktualisierte Blöcke
    const updatedBlocks = await prisma.printBlock.findMany({
      where: { printMaterialId: id },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ blocks: updatedBlocks })
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Blöcke:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

