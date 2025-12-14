import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePhoneSchema = z.object({
  phone: z.string().regex(/^\+?[\d\s\-()]{8,20}$/, "Ungültige Telefonnummer"),
  sessionId: z.string().min(10, "Ungültige Session-ID"),
})

/**
 * Normalisiert eine Telefonnummer (entfernt Leerzeichen, etc.)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '')
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { phone, sessionId } = updatePhoneSchema.parse(body)
    
    const normalizedPhone = normalizePhone(phone)
    
    // Prüfe ob die Telefonnummer verifiziert wurde
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phone: normalizedPhone,
        sessionId,
        verified: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!verification) {
      return NextResponse.json({
        error: 'Telefonnummer nicht verifiziert',
        message: 'Bitte verifiziere zuerst deine Telefonnummer.',
      }, { status: 400 })
    }
    
    // User aktualisieren
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone: normalizedPhone,
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
      },
      select: {
        id: true,
        phone: true,
        phoneVerified: true,
      }
    })
    
    // Verifikation mit User verknüpfen
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { userId: session.user.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Telefonnummer erfolgreich aktualisiert',
      user,
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Update phone error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Telefonnummer' },
      { status: 500 }
    )
  }
}

