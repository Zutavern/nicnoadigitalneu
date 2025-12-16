import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CreatePriceListRequest } from '@/lib/pricelist/types'

/**
 * GET /api/pricelist
 * Alle Preislisten des aktuellen Users abrufen
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const priceLists = await prisma.priceList.findMany({
      where: { userId: session.user.id },
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
      orderBy: { updatedAt: 'desc' },
    })

    // Hintergrund-URLs auflösen
    const backgroundIds = priceLists.map(pl => pl.backgroundId).filter(Boolean) as string[]
    const backgrounds = backgroundIds.length > 0 
      ? await prisma.pricelistBackground.findMany({
          where: { id: { in: backgroundIds } },
          select: { id: true, url: true },
        })
      : []
    const backgroundMap = new Map(backgrounds.map(bg => [bg.id, bg.url]))

    // Preise von Decimal zu number konvertieren und backgroundUrl hinzufügen
    const formattedPriceLists = priceLists.map(pl => ({
      ...pl,
      backgroundUrl: pl.backgroundId ? backgroundMap.get(pl.backgroundId) || null : null,
      blocks: pl.blocks.map(block => ({
        ...block,
        price: block.price ? Number(block.price) : null,
        priceMax: block.priceMax ? Number(block.priceMax) : null,
        columnWidths: block.columnWidths ? JSON.parse(block.columnWidths as string) : null,
        socialLinks: block.socialLinks ? JSON.parse(block.socialLinks) : null,
        variants: block.variants.map(v => ({
          ...v,
          price: Number(v.price),
        })),
        childBlocks: block.childBlocks?.map(cb => ({
          ...cb,
          price: cb.price ? Number(cb.price) : null,
          priceMax: cb.priceMax ? Number(cb.priceMax) : null,
          columnWidths: cb.columnWidths ? JSON.parse(cb.columnWidths as string) : null,
          socialLinks: cb.socialLinks ? JSON.parse(cb.socialLinks) : null,
          variants: cb.variants.map(v => ({
            ...v,
            price: Number(v.price),
          })),
        })) || [],
      })),
    }))

    return NextResponse.json({ priceLists: formattedPriceLists })
  } catch (error) {
    console.error('Error fetching price lists:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Preislisten' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pricelist
 * Neue Preisliste erstellen
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body: CreatePriceListRequest = await request.json()
    const {
      name,
      pricingModel,
      theme = 'elegant',
      fontFamily = 'playfair',
      backgroundId,
      showLogo = false, // Standard: Kein automatischer Titel, User kann eigenen Textblock nutzen
      showContact = false,
      columns = 1,
      paddingTop = 20,
      paddingBottom = 20,
      paddingLeft = 15,
      paddingRight = 15,
      contentScale = 1.0,
      contentOffsetX = 0,
      contentOffsetY = 0,
    } = body

    if (!name || !pricingModel) {
      return NextResponse.json(
        { error: 'Name und Preismodell sind erforderlich' },
        { status: 400 }
      )
    }

    const priceList = await prisma.priceList.create({
      data: {
        userId: session.user.id,
        name,
        pricingModel,
        theme,
        fontFamily,
        backgroundId,
        showLogo,
        showContact,
        columns,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        contentScale,
        contentOffsetX,
        contentOffsetY,
      },
      include: {
        blocks: {
          orderBy: { sortOrder: 'asc' },
          include: {
            variants: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    })

    return NextResponse.json({ priceList }, { status: 201 })
  } catch (error) {
    console.error('Error creating price list:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Preisliste' },
      { status: 500 }
    )
  }
}


