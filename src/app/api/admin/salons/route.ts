import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET all salons with their owner info
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
        { salonName: { contains: search, mode: 'insensitive' as const } },
        { city: { contains: search, mode: 'insensitive' as const } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
      ],
    } : {}

    const [salons, total] = await Promise.all([
      prisma.salonProfile.findMany({
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
              stripeSubscriptionStatus: true,
              stripePriceId: true,
            },
          },
        },
      }),
      prisma.salonProfile.count({ where }),
    ])

    // Transform data for frontend
    const transformedSalons = salons.map(salon => ({
      id: salon.id,
      userId: salon.userId,
      salonName: salon.salonName,
      street: salon.street,
      city: salon.city,
      zipCode: salon.zipCode,
      country: salon.country,
      phone: salon.phone,
      website: salon.website,
      employeeCount: salon.employeeCount,
      chairCount: salon.chairCount,
      salonSize: salon.salonSize,
      description: salon.description,
      openingHours: salon.openingHours,
      amenities: salon.amenities,
      images: salon.images,
      createdAt: salon.createdAt,
      updatedAt: salon.updatedAt,
      owner: {
        id: salon.user.id,
        name: salon.user.name,
        email: salon.user.email,
        image: salon.user.image,
        onboardingCompleted: salon.user.onboardingCompleted,
        subscriptionStatus: salon.user.stripeSubscriptionStatus,
        priceId: salon.user.stripePriceId,
      },
    }))

    return NextResponse.json({
      salons: transformedSalons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching salons:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

// POST create new salon (usually done via onboarding, but admin can create too)
const createSalonSchema = z.object({
  userId: z.string().uuid(),
  salonName: z.string().min(2),
  street: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  employeeCount: z.number().optional(),
  chairCount: z.number().optional(),
  description: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createSalonSchema.parse(body)

    // Check if user already has a salon
    const existingSalon = await prisma.salonProfile.findUnique({
      where: { userId: validatedData.userId },
    })

    if (existingSalon) {
      return NextResponse.json(
        { error: "Dieser Benutzer hat bereits ein Salon-Profil" },
        { status: 400 }
      )
    }

    // Check if user exists and is a salon owner
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
    }

    if (user.role !== 'SALON_OWNER') {
      return NextResponse.json(
        { error: "Benutzer muss die Rolle Salonbetreiber haben" },
        { status: 400 }
      )
    }

    const salon = await prisma.salonProfile.create({
      data: {
        userId: validatedData.userId,
        salonName: validatedData.salonName,
        street: validatedData.street,
        city: validatedData.city,
        zipCode: validatedData.zipCode,
        phone: validatedData.phone,
        website: validatedData.website,
        employeeCount: validatedData.employeeCount,
        chairCount: validatedData.chairCount,
        description: validatedData.description,
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

    return NextResponse.json(salon, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Error creating salon:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

