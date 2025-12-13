import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

// GET /api/messages/users/[id] - Benutzerdetails für Chat-Kontaktinfo
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Demo-Modus
    if (await isDemoModeActive()) {
      const demoUsers: Record<string, unknown> = {
        '00000000-0000-0000-0000-000000000001': {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Admin Test',
          email: 'admin@nicnoa.de',
          role: 'ADMIN',
          image: null,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          profile: {
            phone: '+49 123 456789',
            city: 'München',
            bio: 'Plattform-Administrator bei NICNOA',
          },
        },
        '00000000-0000-0000-0000-000000000002': {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'Salon Betreiber',
          email: 'salon@nicnoa.de',
          role: 'SALON_OWNER',
          image: null,
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          profile: {
            phone: '+49 89 12345678',
            city: 'München',
            salonName: 'Glamour Hair Studio',
            bio: 'Inhaber eines modernen Friseursalons mit 5 Stuhlplätzen.',
          },
        },
        '00000000-0000-0000-0000-000000000003': {
          id: '00000000-0000-0000-0000-000000000003',
          name: 'Stylist Test',
          email: 'stylist@nicnoa.de',
          role: 'STYLIST',
          image: null,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          profile: {
            phone: '+49 176 98765432',
            city: 'München',
            yearsExperience: 5,
            specialties: ['Balayage', 'Hochzeitsfrisuren', 'Colorationen'],
            instagramUrl: 'https://instagram.com/stylist_test',
            bio: 'Spezialisiert auf Balayage und moderne Colorations-Techniken.',
          },
        },
      }

      const user = demoUsers[id]
      if (user) {
        return NextResponse.json(user)
      }
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Lade Benutzer mit allen relevanten Profildaten
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            city: true,
            bio: true,
          },
        },
        salonProfile: {
          select: {
            salonName: true,
            phone: true,
            city: true,
            description: true,
          },
        },
        stylistProfile: {
          select: {
            phone: true,
            city: true,
            bio: true,
            yearsExperience: true,
            specialties: true,
            instagramUrl: true,
            tiktokUrl: true,
            websiteUrl: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Kombiniere Profildaten basierend auf der Rolle
    let profile: Record<string, unknown> = {}
    
    if (user.role === 'SALON_OWNER' && user.salonProfile) {
      profile = {
        phone: user.salonProfile.phone || user.profile?.phone,
        city: user.salonProfile.city || user.profile?.city,
        salonName: user.salonProfile.salonName,
        bio: user.salonProfile.description || user.profile?.bio,
      }
    } else if (user.role === 'STYLIST' && user.stylistProfile) {
      profile = {
        phone: user.stylistProfile.phone || user.profile?.phone,
        city: user.stylistProfile.city || user.profile?.city,
        bio: user.stylistProfile.bio || user.profile?.bio,
        yearsExperience: user.stylistProfile.yearsExperience,
        specialties: user.stylistProfile.specialties,
        instagramUrl: user.stylistProfile.instagramUrl,
        tiktokUrl: user.stylistProfile.tiktokUrl,
        websiteUrl: user.stylistProfile.websiteUrl,
      }
    } else if (user.profile) {
      profile = {
        phone: user.profile.phone,
        city: user.profile.city,
        bio: user.profile.bio,
      }
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      profile,
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Benutzerdaten' },
      { status: 500 }
    )
  }
}



