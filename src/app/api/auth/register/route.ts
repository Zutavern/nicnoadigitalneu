import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkRateLimit, logRateLimitedAction, rateLimits, rateLimitErrorResponse } from '@/lib/rate-limit'

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
  
  // Kontaktdaten (Pflicht)
  street: z.string().min(3, "Straße muss mindestens 3 Zeichen lang sein"),
  zipCode: z.string().regex(/^\d{5}$/, "PLZ muss 5 Ziffern haben"),
  city: z.string().min(2, "Stadt muss mindestens 2 Zeichen lang sein"),
  phone: z.string().regex(/^\+?[\d\s\-()]{8,20}$/, "Ungültige Telefonnummer"),
  
  // Social Media (Optional)
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  tiktok: z.string().optional().or(z.literal("")),
})

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    // Rate limiting check
    const rateLimit = await checkRateLimit({
      ...rateLimits.register,
      identifier: ipAddress,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(rateLimitErrorResponse(rateLimit), { status: 429 })
    }

    // Log the attempt for rate limiting
    await logRateLimitedAction(ipAddress, rateLimits.register.action)

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

    // Create user with contact and social media data
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        onboardingCompleted: false,
        
        // Kontaktdaten
        street: validatedData.street,
        zipCode: validatedData.zipCode,
        city: validatedData.city,
        phone: validatedData.phone,
        phoneVerified: false, // Muss noch per SMS verifiziert werden
        
        // Social Media (nur wenn nicht leer)
        website: validatedData.website || null,
        instagram: validatedData.instagram || null,
        facebook: validatedData.facebook || null,
        tiktok: validatedData.tiktok || null,
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

