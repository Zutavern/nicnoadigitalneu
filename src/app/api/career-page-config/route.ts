import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Career Page Konfiguration abrufen (Public)
export async function GET() {
  try {
    let config = await prisma.careerPageConfig.findUnique({
      where: { id: 'default' },
    })

    // Wenn keine Konfiguration existiert, erstelle eine mit Standardwerten
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

    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error fetching career page config:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konfiguration' },
      { status: 500 }
    )
  }
}




