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
    const { salutation, salonName, street, city, zipCode, phone, employeeCount, chairCount, description } = body

    // Update or create salon profile
    await prisma.salonProfile.upsert({
      where: { userId: session.user.id },
      update: {
        salonName: salonName || "",
        street,
        city,
        zipCode,
        phone,
        employeeCount: employeeCount ? parseInt(employeeCount) : null,
        chairCount: chairCount ? parseInt(chairCount) : null,
        description,
      },
      create: {
        userId: session.user.id,
        salonName: salonName || "",
        street,
        city,
        zipCode,
        phone,
        employeeCount: employeeCount ? parseInt(employeeCount) : null,
        chairCount: chairCount ? parseInt(chairCount) : null,
        description,
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

