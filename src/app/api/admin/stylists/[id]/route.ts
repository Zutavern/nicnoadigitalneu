import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET single stylist
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 })
    }

    const { id } = await params

    const stylist = await prisma.stylistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            onboardingCompleted: true,
            createdAt: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            stripeSubscriptionStatus: true,
            stripePriceId: true,
            stripeCurrentPeriodEnd: true,
            profile: true,
          },
        },
      },
    })

    if (!stylist) {
      return NextResponse.json({ error: "Stylist nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json({
      ...stylist,
      hourlyRate: stylist.hourlyRate ? Number(stylist.hourlyRate) : null,
    })
  } catch (error) {
    console.error("Error fetching stylist:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

// PATCH update stylist
const updateStylistSchema = z.object({
  yearsExperience: z.number().optional().nullable(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  portfolio: z.array(z.string()).optional(),
  hourlyRate: z.number().optional().nullable(),
  availability: z.any().optional().nullable(),
  bio: z.string().optional().nullable(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateStylistSchema.parse(body)

    const stylist = await prisma.stylistProfile.update({
      where: { id },
      data: validatedData,
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

    return NextResponse.json({
      ...stylist,
      hourlyRate: stylist.hourlyRate ? Number(stylist.hourlyRate) : null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Error updating stylist:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

// DELETE stylist profile
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 })
    }

    const { id } = await params

    await prisma.stylistProfile.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting stylist:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}








