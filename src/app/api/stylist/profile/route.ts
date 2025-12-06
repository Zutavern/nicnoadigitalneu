import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeActive, getMockStylistProfile } from '@/lib/mock-data'

export async function GET() {
  try {
    // Demo-Modus prüfen
    if (await isDemoModeActive()) {
      return NextResponse.json(getMockStylistProfile())
    }

    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        stylistProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Statistiken abrufen
    const [bookingsCount, reviewsStats] = await Promise.all([
      prisma.booking.count({
        where: { stylistId: session.user.id },
      }),
      prisma.review.aggregate({
        where: { stylistId: session.user.id },
        _avg: { rating: true },
        _count: { id: true },
      }),
    ])

    // Skills aus dem Profil parsen (falls vorhanden)
    let skills: Array<{ name: string; rating: number }> = []
    try {
      skills = user.stylistProfile?.skills as Array<{ name: string; rating: number }> || []
    } catch {
      skills = []
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      profile: {
        bio: user.stylistProfile?.bio,
        phone: user.stylistProfile?.phone,
        address: user.stylistProfile?.address,
        city: user.stylistProfile?.city,
        zipCode: user.stylistProfile?.zipCode,
        experience: user.stylistProfile?.experience,
        instagram: user.stylistProfile?.instagram,
        website: user.stylistProfile?.website,
        skills,
      },
      stats: {
        totalBookings: bookingsCount,
        averageRating: reviewsStats._avg.rating || 0,
        totalReviews: reviewsStats._count.id,
      },
    })
  } catch (error) {
    console.error('Error fetching stylist profile:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Profils' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, phone, address, city, zipCode, instagram, website } = body

    // User-Name aktualisieren
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    })

    // Stylist-Profil aktualisieren oder erstellen
    await prisma.stylistProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        bio,
        phone,
        address,
        city,
        zipCode,
        instagram,
        website,
      },
      update: {
        bio,
        phone,
        address,
        city,
        zipCode,
        instagram,
        website,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating stylist profile:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Profils' },
      { status: 500 }
    )
  }
}
