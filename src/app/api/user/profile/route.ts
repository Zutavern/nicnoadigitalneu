import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben').optional(),
  phone: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  bio: z.string().max(500, 'Bio darf maximal 500 Zeichen haben').optional().nullable(),
  // Social Media (für Stylisten)
  instagramUrl: z.string().url().optional().nullable().or(z.literal('')),
  tiktokUrl: z.string().url().optional().nullable().or(z.literal('')),
  websiteUrl: z.string().url().optional().nullable().or(z.literal('')),
})

// GET /api/user/profile - Profil-Daten abrufen
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        password: true, // Um zu prüfen ob Passwort gesetzt ist
        emailVerified: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            street: true,
            city: true,
            zipCode: true,
            country: true,
            bio: true,
          },
        },
        stylistProfile: {
          select: {
            instagramUrl: true,
            tiktokUrl: true,
            websiteUrl: true,
            bio: true,
            phone: true,
            street: true,
            city: true,
            zipCode: true,
          },
        },
        salonProfile: {
          select: {
            phone: true,
            street: true,
            city: true,
            zipCode: true,
            website: true,
          },
        },
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Determine which profile data to use based on role
    let profileData = user.profile
    if (user.role === 'STYLIST' && user.stylistProfile) {
      profileData = {
        phone: user.stylistProfile.phone,
        street: user.stylistProfile.street,
        city: user.stylistProfile.city,
        zipCode: user.stylistProfile.zipCode,
        country: null,
        bio: user.stylistProfile.bio,
      }
    } else if (user.role === 'SALON_OWNER' && user.salonProfile) {
      profileData = {
        phone: user.salonProfile.phone,
        street: user.salonProfile.street,
        city: user.salonProfile.city,
        zipCode: user.salonProfile.zipCode,
        country: null,
        bio: null,
      }
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      hasPassword: !!user.password,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt,
      profile: profileData,
      socialMedia: user.role === 'STYLIST' ? {
        instagramUrl: user.stylistProfile?.instagramUrl,
        tiktokUrl: user.stylistProfile?.tiktokUrl,
        websiteUrl: user.stylistProfile?.websiteUrl,
      } : null,
      connectedAccounts: user.accounts.map(acc => ({
        provider: acc.provider,
        connected: true,
      })),
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

// PUT /api/user/profile - Profil aktualisieren
export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update user name if provided
    if (validatedData.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: validatedData.name },
      })
    }

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Update profile based on role
    if (user.role === 'STYLIST') {
      await prisma.stylistProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          phone: validatedData.phone,
          street: validatedData.street,
          city: validatedData.city,
          zipCode: validatedData.zipCode,
          bio: validatedData.bio,
          instagramUrl: validatedData.instagramUrl || null,
          tiktokUrl: validatedData.tiktokUrl || null,
          websiteUrl: validatedData.websiteUrl || null,
        },
        update: {
          phone: validatedData.phone,
          street: validatedData.street,
          city: validatedData.city,
          zipCode: validatedData.zipCode,
          bio: validatedData.bio,
          instagramUrl: validatedData.instagramUrl || null,
          tiktokUrl: validatedData.tiktokUrl || null,
          websiteUrl: validatedData.websiteUrl || null,
        },
      })
    } else if (user.role === 'SALON_OWNER') {
      await prisma.salonProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          salonName: '', // Required field
          phone: validatedData.phone,
          street: validatedData.street,
          city: validatedData.city,
          zipCode: validatedData.zipCode,
          website: validatedData.websiteUrl,
        },
        update: {
          phone: validatedData.phone,
          street: validatedData.street,
          city: validatedData.city,
          zipCode: validatedData.zipCode,
          website: validatedData.websiteUrl,
        },
      })
    } else {
      // Admin or other roles use UserProfile
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          phone: validatedData.phone,
          street: validatedData.street,
          city: validatedData.city,
          zipCode: validatedData.zipCode,
          country: validatedData.country,
          bio: validatedData.bio,
        },
        update: {
          phone: validatedData.phone,
          street: validatedData.street,
          city: validatedData.city,
          zipCode: validatedData.zipCode,
          country: validatedData.country,
          bio: validatedData.bio,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Profil aktualisiert' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}


