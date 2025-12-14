import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const completeRegistrationSchema = z.object({
  userId: z.string().uuid("Ungültige User-ID"),
  sessionId: z.string().min(10, "Ungültige Session-ID"),
  phone: z.string().regex(/^\+?[\d\s\-()]{8,20}$/, "Ungültige Telefonnummer"),
})

/**
 * Normalisiert eine Telefonnummer (entfernt Leerzeichen, etc.)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, sessionId, phone } = completeRegistrationSchema.parse(body)
    
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
      where: { id: userId },
      data: {
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneVerified: true,
      }
    })
    
    // Verifikation mit User verknüpfen
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { userId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Registrierung abgeschlossen!',
      user,
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Complete registration error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abschließen der Registrierung' },
      { status: 500 }
    )
  }
}

