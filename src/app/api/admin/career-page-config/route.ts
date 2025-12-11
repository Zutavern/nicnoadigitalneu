import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Career Page Konfiguration abrufen (Admin)
export async function GET() {
  try {
    let config = await prisma.careerPageConfig.findUnique({
      where: { id: 'default' },
    })

    if (!config) {
      config = await prisma.careerPageConfig.create({
        data: {
          id: 'default',
          heroBadgeText: 'Wir suchen dich!',
          heroTitle: 'Werde Teil unseres Teams',
          heroDescription: 'Wir sind ein junges, dynamisches Startup in München und suchen talentierte Menschen, die mit uns die Zukunft der Salon-Branche gestalten wollen.',
          glowEffectEnabled: true,
          glowEffectSpread: 40,
          glowEffectProximity: 64,
          glowEffectBorderWidth: 3,
          glowUseDesignSystem: true,
          glowUseGradient: true,
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching career page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}

// PUT - Career Page Konfiguration aktualisieren (Admin)
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 })
    }

    const data = await request.json()

    const config = await prisma.careerPageConfig.upsert({
      where: { id: 'default' },
      update: {
        heroBadgeText: data.heroBadgeText,
        heroTitle: data.heroTitle,
        heroDescription: data.heroDescription,
        glowEffectEnabled: data.glowEffectEnabled,
        glowEffectSpread: data.glowEffectSpread,
        glowEffectProximity: data.glowEffectProximity,
        glowEffectBorderWidth: data.glowEffectBorderWidth,
        glowUseDesignSystem: data.glowUseDesignSystem,
        glowUseGradient: data.glowUseGradient,
        glowCustomPrimary: data.glowCustomPrimary,
        glowCustomSecondary: data.glowCustomSecondary,
        // SEO
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
      create: {
        id: 'default',
        ...data,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating career page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Konfiguration' },
      { status: 500 }
    )
  }
}
