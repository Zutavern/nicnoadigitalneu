import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Alle Category Animations abrufen (Admin)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const animations = await prisma.categoryAnimation.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(animations)
  } catch (error) {
    console.error('Error fetching category animations:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kategorie-Animationen' },
      { status: 500 }
    )
  }
}

// POST - Neue Category Animation erstellen (Admin)
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const data = await request.json()

    // Prüfe ob categoryKey bereits existiert
    const existing = await prisma.categoryAnimation.findUnique({
      where: { categoryKey: data.categoryKey },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Eine Animation für diese Kategorie existiert bereits' },
        { status: 400 }
      )
    }

    const animation = await prisma.categoryAnimation.create({
      data: {
        categoryKey: data.categoryKey,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        badgeText: data.badgeText,
        features: data.features || [],
        animationType: data.animationType || 'preset',
        presetAnimation: data.presetAnimation,
        customAnimationCode: data.customAnimationCode,
        lottieUrl: data.lottieUrl,
        animationPosition: data.animationPosition || 'right',
        animationSize: data.animationSize || 'medium',
        animationSpeed: data.animationSpeed || 1.0,
        useDesignSystemColors: data.useDesignSystemColors ?? true,
        customPrimaryColor: data.customPrimaryColor,
        customSecondaryColor: data.customSecondaryColor,
        customAccentColor: data.customAccentColor,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder || 0,
      },
    })

    return NextResponse.json(animation, { status: 201 })
  } catch (error) {
    console.error('Error creating category animation:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Kategorie-Animation' },
      { status: 500 }
    )
  }
}


