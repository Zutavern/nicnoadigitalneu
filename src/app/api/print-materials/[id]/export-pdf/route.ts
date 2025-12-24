import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/print-materials/[id]/export-pdf
 * 
 * Exportiert die Drucksache als PDF mit Beschnittmarkierungen.
 * 
 * Für eine vollständige Implementierung wird empfohlen:
 * - puppeteer für Server-Side Rendering
 * - oder pdf-lib für direkte PDF-Erstellung
 * - oder jsPDF für Client-Side Export
 * 
 * Diese Route gibt aktuell die Daten zurück, die für den Client-Side
 * PDF-Export benötigt werden.
 */
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

    const body = await request.json().catch(() => ({}))
    const { format = 'print', includeCropMarks = true } = body

    // Berechne Dimensionen
    const bleed = material.bleed
    const totalWidth = material.width + (bleed * 2)
    const totalHeight = material.height + (bleed * 2)

    // Trenne Blöcke nach Seiten
    const frontBlocks = material.blocks.filter(b => b.side === 'FRONT')
    const backBlocks = material.blocks.filter(b => b.side === 'BACK')

    // Exportdaten für Client-Side PDF-Generierung
    const exportData = {
      material: {
        id: material.id,
        name: material.name,
        type: material.type,
        width: material.width,
        height: material.height,
        bleed: material.bleed,
        totalWidth,
        totalHeight,
        theme: material.theme,
        fontFamily: material.fontFamily,
        primaryColor: material.primaryColor,
        secondaryColor: material.secondaryColor,
        backgroundColor: material.backgroundColor,
        frontBackgroundUrl: material.frontBackgroundUrl,
        backBackgroundUrl: material.backBackgroundUrl,
      },
      pages: [
        {
          side: 'FRONT',
          blocks: frontBlocks.map(block => ({
            id: block.id,
            type: block.type,
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
            rotation: block.rotation,
            content: block.content,
            textAlign: block.textAlign,
            fontSize: block.fontSize,
            fontWeight: block.fontWeight,
            color: block.color,
            imageUrl: block.imageUrl,
            objectFit: block.objectFit,
            borderRadius: block.borderRadius,
            qrCodeUrl: block.qrCodeUrl,
            qrCodeLabel: block.qrCodeLabel,
            qrCodeSize: block.qrCodeSize,
            showPhone: block.showPhone,
            showEmail: block.showEmail,
            showAddress: block.showAddress,
            showWebsite: block.showWebsite,
          })),
        },
        {
          side: 'BACK',
          blocks: backBlocks.map(block => ({
            id: block.id,
            type: block.type,
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
            rotation: block.rotation,
            content: block.content,
            textAlign: block.textAlign,
            fontSize: block.fontSize,
            fontWeight: block.fontWeight,
            color: block.color,
            imageUrl: block.imageUrl,
            objectFit: block.objectFit,
            borderRadius: block.borderRadius,
            qrCodeUrl: block.qrCodeUrl,
            qrCodeLabel: block.qrCodeLabel,
            qrCodeSize: block.qrCodeSize,
            showPhone: block.showPhone,
            showEmail: block.showEmail,
            showAddress: block.showAddress,
            showWebsite: block.showWebsite,
          })),
        },
      ],
      exportSettings: {
        format, // 'print' oder 'web'
        includeCropMarks,
        dpi: format === 'print' ? 300 : 96,
        colorMode: format === 'print' ? 'CMYK' : 'RGB',
      },
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Fehler beim PDF-Export:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

