import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Einzelne Category Animation abrufen (Admin)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    const animation = await prisma.categoryAnimation.findUnique({
      where: { id },
    })

    if (!animation) {
      return NextResponse.json(
        { error: 'Kategorie-Animation nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json(animation)
  } catch (error) {
    console.error('Error fetching category animation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kategorie-Animation' },
      { status: 500 }
    )
  }
}

// PUT - Category Animation aktualisieren (Admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    // Prüfe ob Animation existiert
    const existing = await prisma.categoryAnimation.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Kategorie-Animation nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe ob categoryKey geändert wird und bereits existiert
    if (data.categoryKey && data.categoryKey !== existing.categoryKey) {
      const duplicate = await prisma.categoryAnimation.findUnique({
        where: { categoryKey: data.categoryKey },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Eine Animation für diese Kategorie existiert bereits' },
          { status: 400 }
        )
      }
    }

    const animation = await prisma.categoryAnimation.update({
      where: { id },
      data: {
        categoryKey: data.categoryKey,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        badgeText: data.badgeText,
        features: data.features,
        animationType: data.animationType,
        presetAnimation: data.presetAnimation,
        customAnimationCode: data.customAnimationCode,
        lottieUrl: data.lottieUrl,
        animationPosition: data.animationPosition,
        animationSize: data.animationSize,
        animationSpeed: data.animationSpeed,
        useDesignSystemColors: data.useDesignSystemColors,
        customPrimaryColor: data.customPrimaryColor,
        customSecondaryColor: data.customSecondaryColor,
        customAccentColor: data.customAccentColor,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    })

    return NextResponse.json(animation)
  } catch (error) {
    console.error('Error updating category animation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kategorie-Animation' },
      { status: 500 }
    )
  }
}

// DELETE - Category Animation löschen (Admin)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const { id } = await params

    // Prüfe ob Animation existiert
    const existing = await prisma.categoryAnimation.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Kategorie-Animation nicht gefunden' },
        { status: 404 }
      )
    }

    await prisma.categoryAnimation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category animation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Kategorie-Animation' },
      { status: 500 }
    )
  }
}





