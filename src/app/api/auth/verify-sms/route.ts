import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifySmsSchema = z.object({
  phone: z.string().regex(/^\+?[\d\s\-()]{8,20}$/, "Ungültige Telefonnummer"),
  code: z.string().regex(/^\d{4}$/, "Code muss 4 Ziffern haben"),
  sessionId: z.string().min(10, "Ungültige Session-ID"),
})

// Konfiguration
const MAX_ATTEMPTS = 5 // Max 5 Fehlversuche pro Code

/**
 * Normalisiert eine Telefonnummer (entfernt Leerzeichen, etc.)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, code, sessionId } = verifySmsSchema.parse(body)
    
    const normalizedPhone = normalizePhone(phone)
    
    // Verifikation suchen
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phone: normalizedPhone,
        sessionId,
        verified: false,
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!verification) {
      return NextResponse.json({
        error: 'Keine Verifizierung gefunden',
        message: 'Bitte fordere eine neue SMS an.',
      }, { status: 404 })
    }
    
    // Sperre prüfen
    if (verification.blockedUntil && verification.blockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (verification.blockedUntil.getTime() - Date.now()) / 60000
      )
      return NextResponse.json({
        error: 'Gesperrt',
        message: `Bitte warte ${remainingMinutes} Minuten.`,
        blockedUntil: verification.blockedUntil,
      }, { status: 429 })
    }
    
    // Ablauf prüfen
    if (verification.expiresAt < new Date()) {
      return NextResponse.json({
        error: 'Code abgelaufen',
        message: 'Dein Code ist abgelaufen. Bitte fordere eine neue SMS an.',
        expired: true,
      }, { status: 400 })
    }
    
    // Versuche prüfen
    if (verification.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({
        error: 'Zu viele Fehlversuche',
        message: 'Zu viele falsche Codes eingegeben. Bitte fordere eine neue SMS an.',
        maxAttemptsReached: true,
      }, { status: 400 })
    }
    
    // Code prüfen
    if (verification.code !== code) {
      // Fehlversuch zählen
      await prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } }
      })
      
      const remainingAttempts = MAX_ATTEMPTS - (verification.attempts + 1)
      
      return NextResponse.json({
        error: 'Falscher Code',
        message: remainingAttempts > 0 
          ? `Falscher Code. Noch ${remainingAttempts} ${remainingAttempts === 1 ? 'Versuch' : 'Versuche'}.`
          : 'Falscher Code. Bitte fordere eine neue SMS an.',
        remainingAttempts,
      }, { status: 400 })
    }
    
    // Erfolg! Verifikation abschließen
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { 
        verified: true,
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Telefonnummer erfolgreich verifiziert!',
      phone: normalizedPhone,
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Verify SMS error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Verifizierung' },
      { status: 500 }
    )
  }
}

