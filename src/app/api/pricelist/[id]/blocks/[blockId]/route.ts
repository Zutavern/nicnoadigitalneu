import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { UpdateBlockRequest, PriceVariantClient } from '@/lib/pricelist/types'

interface RouteParams {
  params: Promise<{ id: string; blockId: string }>
}

/**
 * GET /api/pricelist/[id]/blocks/[blockId]
 * Einzelnen Block abrufen
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: priceListId, blockId } = await params

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

    const block = await prisma.priceBlock.findFirst({
      where: { id: blockId, priceListId },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!block) {
      return NextResponse.json(
        { error: 'Block nicht gefunden' },
        { status: 404 }
      )
    }

    // Preise formatieren
    const formattedBlock = {
      ...block,
      price: block.price ? Number(block.price) : null,
      priceMax: block.priceMax ? Number(block.priceMax) : null,
      variants: block.variants.map(v => ({
        ...v,
        price: Number(v.price),
      })),
    }

    return NextResponse.json({ block: formattedBlock })
  } catch (error) {
    console.error('Error fetching block:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Blocks' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pricelist/[id]/blocks/[blockId]
 * Block aktualisieren
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: priceListId, blockId } = await params
    const body: UpdateBlockRequest & { variants?: PriceVariantClient[] } = await request.json()

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

    // Block existiert?
    const existingBlock = await prisma.priceBlock.findFirst({
      where: { id: blockId, priceListId },
      include: { variants: true },
    })

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Block nicht gefunden' },
        { status: 404 }
      )
    }

    // Block aktualisieren
    const updateData: Record<string, unknown> = {}
    if (body.type !== undefined) updateData.type = body.type
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder
    if (body.title !== undefined) updateData.title = body.title
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle
    if (body.itemName !== undefined) updateData.itemName = body.itemName
    if (body.description !== undefined) updateData.description = body.description
    if (body.priceType !== undefined) updateData.priceType = body.priceType
    if (body.price !== undefined) updateData.price = body.price
    if (body.priceMax !== undefined) updateData.priceMax = body.priceMax
    if (body.priceText !== undefined) updateData.priceText = body.priceText
    if (body.qualifier !== undefined) updateData.qualifier = body.qualifier
    if (body.content !== undefined) updateData.content = body.content
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.spacerSize !== undefined) updateData.spacerSize = body.spacerSize
    // Neue Felder
    if (body.parentBlockId !== undefined) updateData.parentBlockId = body.parentBlockId
    if (body.columnIndex !== undefined) updateData.columnIndex = body.columnIndex
    if (body.badgeText !== undefined) updateData.badgeText = body.badgeText
    if (body.badgeStyle !== undefined) updateData.badgeStyle = body.badgeStyle
    if (body.badgeColor !== undefined) updateData.badgeColor = body.badgeColor
    if (body.iconName !== undefined) updateData.iconName = body.iconName
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.email !== undefined) updateData.email = body.email
    if (body.address !== undefined) updateData.address = body.address
    if (body.website !== undefined) updateData.website = body.website
    if (body.socialLinks !== undefined) updateData.socialLinks = JSON.stringify(body.socialLinks)
    if (body.qrCodeUrl !== undefined) updateData.qrCodeUrl = body.qrCodeUrl
    if (body.qrCodeLabel !== undefined) updateData.qrCodeLabel = body.qrCodeLabel
    if (body.footerText !== undefined) updateData.footerText = body.footerText
    if (body.columnWidths !== undefined) updateData.columnWidths = JSON.stringify(body.columnWidths)
    if (body.textAlign !== undefined) updateData.textAlign = body.textAlign

    // Varianten aktualisieren falls vorhanden
    if (body.variants) {
      // Alle existierenden Varianten löschen und neue erstellen
      await prisma.priceVariant.deleteMany({
        where: { blockId },
      })

      if (body.variants.length > 0) {
        await prisma.priceVariant.createMany({
          data: body.variants.map((v, index) => ({
            blockId,
            label: v.label,
            price: v.price,
            sortOrder: v.sortOrder ?? index,
          })),
        })
      }
    }

    const block = await prisma.priceBlock.update({
      where: { id: blockId },
      data: updateData,
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
        childBlocks: {
          orderBy: { sortOrder: 'asc' },
          include: { variants: true },
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

    return NextResponse.json({ block: formattedBlock })
  } catch (error) {
    console.error('Error updating block:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Blocks' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pricelist/[id]/blocks/[blockId]
 * Block löschen
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: priceListId, blockId } = await params

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

    // Block existiert?
    const existingBlock = await prisma.priceBlock.findFirst({
      where: { id: blockId, priceListId },
    })

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Block nicht gefunden' },
        { status: 404 }
      )
    }

    // Block löschen (Varianten werden durch Cascade gelöscht)
    await prisma.priceBlock.delete({
      where: { id: blockId },
    })

    // sortOrder der verbleibenden Blöcke aktualisieren
    const remainingBlocks = await prisma.priceBlock.findMany({
      where: { priceListId },
      orderBy: { sortOrder: 'asc' },
    })

    await prisma.$transaction(
      remainingBlocks.map((block, index) =>
        prisma.priceBlock.update({
          where: { id: block.id },
          data: { sortOrder: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Blocks' },
      { status: 500 }
    )
  }
}


