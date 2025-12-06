import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET all stylists with their profile info
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const where = search ? {
      OR: [
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
        { specialties: { has: search } },
      ],
    } : {}

    const [stylists, total] = await Promise.all([
      prisma.stylistProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              onboardingCompleted: true,
              createdAt: true,
              stripeSubscriptionStatus: true,
              stripePriceId: true,
            },
          },
        },
      }),
      prisma.stylistProfile.count({ where }),
    ])

    // Transform data for frontend
    const transformedStylists = stylists.map(stylist => ({
      id: stylist.id,
      userId: stylist.userId,
      yearsExperience: stylist.yearsExperience,
      specialties: stylist.specialties,
      certifications: stylist.certifications,
      portfolio: stylist.portfolio,
      hourlyRate: stylist.hourlyRate ? Number(stylist.hourlyRate) : null,
      availability: stylist.availability,
      bio: stylist.bio,
      createdAt: stylist.createdAt,
      updatedAt: stylist.updatedAt,
      user: {
        id: stylist.user.id,
        name: stylist.user.name,
        email: stylist.user.email,
        image: stylist.user.image,
        onboardingCompleted: stylist.user.onboardingCompleted,
        registeredAt: stylist.user.createdAt,
        subscriptionStatus: stylist.user.stripeSubscriptionStatus,
        priceId: stylist.user.stripePriceId,
      },
    }))

    return NextResponse.json({
      stylists: transformedStylists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching stylists:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

// POST create new stylist profile (usually done via onboarding)
const createStylistSchema = z.object({
  userId: z.string().uuid(),
  yearsExperience: z.number().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  hourlyRate: z.number().optional(),
  bio: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createStylistSchema.parse(body)

    // Check if user already has a stylist profile
    const existingProfile = await prisma.stylistProfile.findUnique({
      where: { userId: validatedData.userId },
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: "Dieser Benutzer hat bereits ein Stylist-Profil" },
        { status: 400 }
      )
    }

    // Check if user exists and is a stylist
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
    }

    if (user.role !== 'STYLIST') {
      return NextResponse.json(
        { error: "Benutzer muss die Rolle Stylist haben" },
        { status: 400 }
      )
    }

    const stylist = await prisma.stylistProfile.create({
      data: {
        userId: validatedData.userId,
        yearsExperience: validatedData.yearsExperience,
        specialties: validatedData.specialties || [],
        certifications: validatedData.certifications || [],
        hourlyRate: validatedData.hourlyRate,
        bio: validatedData.bio,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(stylist, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Error creating stylist:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

