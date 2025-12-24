import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MATERIAL_TYPE_CONFIGS, THEME_CONFIGS } from '@/lib/print-materials/types'
import type { PrintMaterialType } from '@prisma/client'

// GET /api/print-materials - Liste aller Print-Materialien des Users
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as PrintMaterialType | null

    const materials = await prisma.printMaterial.findMany({
      where: {
        userId: session.user.id,
        ...(type && { type }),
      },
      include: {
        blocks: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ materials })
  } catch (error) {
    console.error('Fehler beim Laden der Print-Materialien:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// POST /api/print-materials - Neues Print-Material erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      type = 'BUSINESS_CARD',
      templateId,
      ...customSettings
    } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      )
    }

    // Hole Material-Typ-Konfiguration
    const materialConfig = MATERIAL_TYPE_CONFIGS[type as PrintMaterialType]
    if (!materialConfig) {
      return NextResponse.json(
        { error: 'Ungültiger Material-Typ' },
        { status: 400 }
      )
    }

    // Hole Theme-Konfiguration wenn templateId angegeben
    const theme = templateId 
      ? THEME_CONFIGS.find(t => t.id === templateId) || THEME_CONFIGS[0]
      : THEME_CONFIGS[0]

    // Erstelle das Material
    const material = await prisma.printMaterial.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        type: type as PrintMaterialType,
        width: customSettings.width ?? materialConfig.width,
        height: customSettings.height ?? materialConfig.height,
        bleed: customSettings.bleed ?? 3,
        theme: theme.id,
        fontFamily: customSettings.fontFamily ?? theme.fontFamily,
        primaryColor: customSettings.primaryColor ?? theme.primaryColor,
        secondaryColor: customSettings.secondaryColor ?? theme.secondaryColor,
        backgroundColor: customSettings.backgroundColor ?? theme.backgroundColor,
        frontBackgroundUrl: customSettings.frontBackgroundUrl ?? null,
        backBackgroundUrl: customSettings.backBackgroundUrl ?? null,
      },
      include: {
        blocks: true,
      },
    })

    return NextResponse.json({ material }, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen des Print-Materials:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

