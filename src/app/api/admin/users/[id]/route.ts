import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET single user
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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        profile: true,
        salonProfile: true,
        stylistProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

// PATCH update user
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'SALON_OWNER', 'STYLIST']).optional(),
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
    const validatedData = updateUserSchema.parse(body)

    // Check if email is taken
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: validatedData.email, NOT: { id } },
      })
      if (existingUser) {
        return NextResponse.json(
          { error: "Diese E-Mail wird bereits verwendet" },
          { status: 400 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

// DELETE user (Soft Delete - 30 Tage Wiederherstellung möglich)
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

    // Prevent deleting own account
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Sie können Ihr eigenes Konto nicht löschen" },
        { status: 400 }
      )
    }

    // Prüfe ob der User existiert und kein Admin ist
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { role: true, isDeleted: true }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
    }

    if (userToDelete.role === 'ADMIN') {
      return NextResponse.json(
        { error: "Admin-Benutzer können nicht gelöscht werden" },
        { status: 403 }
      )
    }

    if (userToDelete.isDeleted) {
      return NextResponse.json(
        { error: "Benutzer ist bereits gelöscht" },
        { status: 400 }
      )
    }

    // Soft Delete: isDeleted Flag setzen statt echtem Löschen
    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    })

    // Alle Sessions des Users beenden
    await prisma.session.deleteMany({
      where: { userId: id },
    })

    // Security Log erstellen
    await prisma.securityLog.create({
      data: {
        userId: id,
        userEmail: 'admin-action',
        event: 'USER_DELETED',
        status: 'SUCCESS',
        message: `Benutzer wurde von Admin (${session.user.email}) gelöscht`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Benutzer wurde gelöscht und wird in 30 Tagen endgültig entfernt' 
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

