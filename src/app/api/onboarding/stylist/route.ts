import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { salutation, yearsExperience, specialties, street, city, zipCode, phone, bio } = body

    // Parse specialties
    const specialtiesArray = specialties 
      ? specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

    // Update or create stylist profile
    await prisma.stylistProfile.upsert({
      where: { userId: session.user.id },
      update: {
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        specialties: specialtiesArray,
        bio,
      },
      create: {
        userId: session.user.id,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        specialties: specialtiesArray,
        bio,
      },
    })

    // Update user profile
    await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        street,
        city,
        zipCode,
        phone,
      },
      create: {
        userId: session.user.id,
        street,
        city,
        zipCode,
        phone,
      },
    })

    // Mark onboarding as completed + save salutation
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        onboardingCompleted: true,
        ...(salutation && { salutation }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}

