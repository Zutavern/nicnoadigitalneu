import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET single salon
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

    const salon = await prisma.salonProfile.findUnique({
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
          },
        },
      },
    })

    if (!salon) {
      return NextResponse.json({ error: "Salon nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json(salon)
  } catch (error) {
    console.error("Error fetching salon:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

// PATCH update salon
const updateSalonSchema = z.object({
  salonName: z.string().min(2).optional(),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  employeeCount: z.number().optional().nullable(),
  chairCount: z.number().optional().nullable(),
  salonSize: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  openingHours: z.any().optional().nullable(),
  amenities: z.array(z.string()).optional(),
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
    const validatedData = updateSalonSchema.parse(body)

    const salon = await prisma.salonProfile.update({
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

    return NextResponse.json(salon)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Error updating salon:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

// DELETE salon
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

    await prisma.salonProfile.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting salon:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

