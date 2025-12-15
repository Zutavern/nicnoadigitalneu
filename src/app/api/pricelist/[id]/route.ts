import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { UpdatePriceListRequest } from '@/lib/pricelist/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/pricelist/[id]
 * Einzelne Preisliste mit allen Blöcken abrufen
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    const priceList = await prisma.priceList.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        blocks: {
          where: { parentBlockId: null }, // Nur Top-Level Blöcke
          orderBy: { sortOrder: 'asc' },
          include: {
            variants: {
              orderBy: { sortOrder: 'asc' },
            },
            childBlocks: {
              orderBy: { sortOrder: 'asc' },
              include: {
                variants: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    if (!priceList) {
      return NextResponse.json(
        { error: 'Preisliste nicht gefunden' },
        { status: 404 }
      )
    }

    // Hintergrund-URL laden wenn vorhanden
    let backgroundUrl = null
    if (priceList.backgroundId) {
      const background = await prisma.pricelistBackground.findUnique({
        where: { id: priceList.backgroundId },
        select: { url: true },
      })
      backgroundUrl = background?.url || null
    }

    // Preise von Decimal zu number konvertieren und JSON-Felder parsen
    const formattedPriceList = {
      ...priceList,
      backgroundUrl,
      blocks: priceList.blocks.map(block => ({
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
      })),
    }

    return NextResponse.json({ priceList: formattedPriceList })
  } catch (error) {
    console.error('Error fetching price list:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Preisliste' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pricelist/[id]
 * Preisliste aktualisieren
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body: UpdatePriceListRequest = await request.json()

    // Prüfen ob die Preisliste dem User gehört
    const existing = await prisma.priceList.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Preisliste nicht gefunden' },
        { status: 404 }
      )
    }

    const priceList = await prisma.priceList.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.pricingModel !== undefined && { pricingModel: body.pricingModel }),
        ...(body.theme !== undefined && { theme: body.theme }),
        ...(body.fontFamily !== undefined && { fontFamily: body.fontFamily }),
        ...(body.backgroundId !== undefined && { backgroundId: body.backgroundId }),
        ...(body.showLogo !== undefined && { showLogo: body.showLogo }),
        ...(body.showContact !== undefined && { showContact: body.showContact }),
        ...(body.columns !== undefined && { columns: body.columns }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
      },
      include: {
        blocks: {
          where: { parentBlockId: null }, // Nur Top-Level Blöcke
          orderBy: { sortOrder: 'asc' },
          include: {
            variants: {
              orderBy: { sortOrder: 'asc' },
            },
            childBlocks: {
              orderBy: { sortOrder: 'asc' },
              include: {
                variants: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    // Preise formatieren und JSON-Felder parsen
    const formattedPriceList = {
      ...priceList,
      blocks: priceList.blocks.map(block => ({
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
      })),
    }

    return NextResponse.json({ priceList: formattedPriceList })
  } catch (error) {
    console.error('Error updating price list:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Preisliste' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pricelist/[id]
 * Preisliste löschen
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params

    // Prüfen ob die Preisliste dem User gehört
    const existing = await prisma.priceList.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Preisliste nicht gefunden' },
        { status: 404 }
      )
    }

    // Löschen (Blöcke und Varianten werden durch Cascade gelöscht)
    await prisma.priceList.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting price list:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Preisliste' },
      { status: 500 }
    )
  }
}


