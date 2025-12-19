import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Branding abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const role = session.user.role

    // Default-Werte falls kein Profil existiert
    const defaultBranding = {
      brandingLogoUrl: null,
      brandingColor: null,
    }

    // Je nach Rolle das richtige Profil laden
    if (role === 'STYLIST') {
      const profile = await prisma.stylistProfile.findUnique({
        where: { userId },
        select: {
          brandingLogoUrl: true,
          brandingColor: true,
        },
      })

      // Gib Default-Werte zurück falls kein Profil existiert
      return NextResponse.json(profile || defaultBranding)
    } 
    
    if (role === 'SALON_OWNER') {
      const profile = await prisma.salonProfile.findUnique({
        where: { userId },
        select: {
          brandingLogoUrl: true,
          brandingColor: true,
        },
      })

      // Gib Default-Werte zurück falls kein Profil existiert
      return NextResponse.json(profile || defaultBranding)
    }

    // Fallback für andere Rollen (z.B. ADMIN)
    console.log(`Branding GET: Unbekannte Rolle ${role} für User ${userId}`)
    return NextResponse.json(
      { error: `Ungültige Rolle für Branding: ${role}` },
      { status: 403 }
    )
  } catch (error) {
    console.error('Error fetching branding:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Brandings' },
      { status: 500 }
    )
  }
}

// PUT - Branding aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const role = session.user.role
    const body = await request.json()
    const { brandingColor, brandingLogoUrl } = body

    // Validiere Farbe falls vorhanden
    if (brandingColor && !/^#[0-9A-Fa-f]{6}$/.test(brandingColor)) {
      return NextResponse.json(
        { error: 'Ungültiges Farbformat. Erwartet: #RRGGBB' },
        { status: 400 }
      )
    }

    // Je nach Rolle das richtige Profil aktualisieren
    if (role === 'STYLIST') {
      const profile = await prisma.stylistProfile.upsert({
        where: { userId },
        create: {
          userId,
          brandingColor,
          brandingLogoUrl,
        },
        update: {
          brandingColor,
          brandingLogoUrl,
        },
        select: {
          brandingLogoUrl: true,
          brandingColor: true,
        },
      })

      return NextResponse.json(profile)
    }
    
    if (role === 'SALON_OWNER') {
      // Für Salon-Profile brauchen wir einen salonName als Pflichtfeld
      const existingProfile = await prisma.salonProfile.findUnique({
        where: { userId },
      })

      const profile = await prisma.salonProfile.upsert({
        where: { userId },
        create: {
          userId,
          salonName: existingProfile?.salonName || 'Mein Salon',
          brandingColor,
          brandingLogoUrl,
        },
        update: {
          brandingColor,
          brandingLogoUrl,
        },
        select: {
          brandingLogoUrl: true,
          brandingColor: true,
        },
      })

      return NextResponse.json(profile)
    }

    // Fallback für andere Rollen (z.B. ADMIN)
    console.log(`Branding PUT: Unbekannte Rolle ${role} für User ${userId}`)
    return NextResponse.json(
      { error: `Ungültige Rolle für Branding: ${role}` },
      { status: 403 }
    )
  } catch (error) {
    console.error('Error updating branding:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Brandings' },
      { status: 500 }
    )
  }
}

