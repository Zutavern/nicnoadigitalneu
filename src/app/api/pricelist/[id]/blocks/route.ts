import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CreateBlockRequest, ReorderBlocksRequest } from '@/lib/pricelist/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/pricelist/[id]/blocks
 * Neuen Block erstellen
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: priceListId } = await params
    const body: CreateBlockRequest = await request.json()

    // Prüfen ob die Preisliste dem User gehört
    const priceList = await prisma.priceList.findFirst({
      where: { id: priceListId, userId: session.user.id },
    })

    if (!priceList) {
      return NextResponse.json(
        { error: 'Preisliste nicht gefunden' },
        { status: 404 }
      )
    }

    // Höchste sortOrder ermitteln
    const maxSortOrder = await prisma.priceBlock.aggregate({
      where: { priceListId },
      _max: { sortOrder: true },
    })
    const nextSortOrder = body.sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1

    // Block mit Varianten erstellen
    const block = await prisma.priceBlock.create({
      data: {
        priceListId,
        type: body.type,
        sortOrder: nextSortOrder,
        parentBlockId: body.parentBlockId,
        columnIndex: body.columnIndex,
        title: body.title,
        subtitle: body.subtitle,
        itemName: body.itemName,
        description: body.description,
        priceType: body.priceType,
        price: body.price,
        priceMax: body.priceMax,
        priceText: body.priceText,
        qualifier: body.qualifier,
        content: body.content,
        imageUrl: body.imageUrl,
        spacerSize: body.spacerSize,
        // Neue Felder
        badgeText: body.badgeText,
        badgeStyle: body.badgeStyle,
        badgeColor: body.badgeColor,
        iconName: body.iconName,
        phone: body.phone,
        email: body.email,
        address: body.address,
        website: body.website,
        socialLinks: body.socialLinks ? JSON.stringify(body.socialLinks) : undefined,
        qrCodeUrl: body.qrCodeUrl,
        qrCodeLabel: body.qrCodeLabel,
        footerText: body.footerText,
        columnWidths: body.columnWidths ? JSON.stringify(body.columnWidths) : undefined,
        textAlign: body.textAlign,
        variants: body.variants?.length
          ? {
              create: body.variants.map((v, index) => ({
                label: v.label,
                price: v.price,
                sortOrder: v.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
        childBlocks: {
          orderBy: { sortOrder: 'asc' },
          include: {
            variants: true,
          },
        },
      },
    })

    // Preise formatieren und JSON-Felder parsen
    const formattedBlock = {
      ...block,
      price: block.price ? Number(block.price) : null,
      priceMax: block.priceMax ? Number(block.priceMax) : null,
      socialLinks: block.socialLinks ? JSON.parse(block.socialLinks) : null,
      columnWidths: block.columnWidths ? JSON.parse(block.columnWidths as string) : null,
      variants: block.variants.map(v => ({
        ...v,
        price: Number(v.price),
      })),
      childBlocks: block.childBlocks?.map(cb => ({
        ...cb,
        price: cb.price ? Number(cb.price) : null,
        priceMax: cb.priceMax ? Number(cb.priceMax) : null,
        socialLinks: cb.socialLinks ? JSON.parse(cb.socialLinks) : null,
        columnWidths: cb.columnWidths ? JSON.parse(cb.columnWidths as string) : null,
        variants: cb.variants.map(v => ({
          ...v,
          price: Number(v.price),
        })),
      })) || [],
    }

    return NextResponse.json({ block: formattedBlock }, { status: 201 })
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Blocks' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pricelist/[id]/blocks
 * Blöcke neu sortieren (Bulk-Update)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: priceListId } = await params
    const body: ReorderBlocksRequest = await request.json()

    // Prüfen ob die Preisliste dem User gehört
    const priceList = await prisma.priceList.findFirst({
      where: { id: priceListId, userId: session.user.id },
    })

    if (!priceList) {
      return NextResponse.json(
        { error: 'Preisliste nicht gefunden' },
        { status: 404 }
      )
    }

    // Alle Blöcke in einer Transaktion aktualisieren
    await prisma.$transaction(
      body.blocks.map(({ id, sortOrder }) =>
        prisma.priceBlock.update({
          where: { id },
          data: { sortOrder },
        })
      )
    )

    // Aktualisierte Blöcke zurückgeben
    const blocks = await prisma.priceBlock.findMany({
      where: { priceListId },
      orderBy: { sortOrder: 'asc' },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    // Preise formatieren
    const formattedBlocks = blocks.map(block => ({
      ...block,
      price: block.price ? Number(block.price) : null,
      priceMax: block.priceMax ? Number(block.priceMax) : null,
      variants: block.variants.map(v => ({
        ...v,
        price: Number(v.price),
      })),
    }))

    return NextResponse.json({ blocks: formattedBlocks })
  } catch (error) {
    console.error('Error reordering blocks:', error)
    return NextResponse.json(
      { error: 'Fehler beim Sortieren der Blöcke' },
      { status: 500 }
    )
  }
}


