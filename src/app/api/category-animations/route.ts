import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Aktive Category Animations abrufen (Public)
export async function GET() {
  try {
    const animations = await prisma.categoryAnimation.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        categoryKey: true,
        title: true,
        subtitle: true,
        description: true,
        badgeText: true,
        features: true,
        animationType: true,
        presetAnimation: true,
        customAnimationCode: true,
        lottieUrl: true,
        animationPosition: true,
        animationSize: true,
        animationSpeed: true,
        useDesignSystemColors: true,
        customPrimaryColor: true,
        customSecondaryColor: true,
        customAccentColor: true,
        sortOrder: true,
      },
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


