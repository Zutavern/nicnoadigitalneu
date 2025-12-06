import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
    .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
    .regex(/[a-z]/, "Passwort muss mindestens einen Kleinbuchstaben enthalten")
    .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten")
    .regex(/[^A-Za-z0-9]/, "Passwort muss mindestens ein Sonderzeichen enthalten"),
  role: z.enum(["SALON_OWNER", "STYLIST"]),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ein Benutzer mit dieser E-Mail existiert bereits" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        onboardingCompleted: false,
      },
    })

    // Create default profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
      },
    })

    // Create role-specific profile
    if (validatedData.role === "SALON_OWNER") {
      await prisma.salonProfile.create({
        data: {
          userId: user.id,
          salonName: "",
        },
      })
    } else if (validatedData.role === "STYLIST") {
      await prisma.stylistProfile.create({
        data: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json(
      { 
        message: "Registrierung erfolgreich",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}

