import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const sendSmsSchema = z.object({
  phone: z.string().regex(/^\+?[\d\s\-()]{8,20}$/, "Ungültige Telefonnummer"),
  sessionId: z.string().min(10, "Ungültige Session-ID"),
})

// Spam-Schutz Konfiguration
const MAX_SMS_PER_NUMBER = 3 // Max 3 SMS pro Nummer
const BLOCK_DURATION_MINUTES = 15 // 15 Minuten Sperre nach Limit
const CODE_EXPIRES_MINUTES = 10 // Code gültig für 10 Minuten

/**
 * Generiert einen 4-stelligen numerischen Code
 * Im Testmodus wird immer "1111" zurückgegeben
 */
function generateCode(): string {
  if (process.env.NODE_ENV !== 'production') {
    return '1111' // Testcode
  }
  return crypto.randomInt(1000, 9999).toString()
}

/**
 * Normalisiert eine Telefonnummer (entfernt Leerzeichen, etc.)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, sessionId } = sendSmsSchema.parse(body)
    
    const normalizedPhone = normalizePhone(phone)
    
    // Prüfe auf bestehende Verifikation für diese Nummer
    const existingVerification = await prisma.phoneVerification.findFirst({
      where: { 
        phone: normalizedPhone,
        verified: false,
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Sperre prüfen
    if (existingVerification?.blockedUntil && existingVerification.blockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (existingVerification.blockedUntil.getTime() - Date.now()) / 60000
      )
      return NextResponse.json({
        error: 'Zu viele Versuche',
        message: `Bitte warte ${remainingMinutes} Minuten, bevor du eine neue SMS anforderst.`,
        blockedUntil: existingVerification.blockedUntil,
      }, { status: 429 })
    }
    
    // SMS-Limit prüfen
    if (existingVerification && existingVerification.smsCount >= MAX_SMS_PER_NUMBER) {
      // Nummer sperren
      const blockedUntil = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000)
      
      await prisma.phoneVerification.update({
        where: { id: existingVerification.id },
        data: { blockedUntil }
      })
      
      return NextResponse.json({
        error: 'SMS-Limit erreicht',
        message: `Du hast das Maximum von ${MAX_SMS_PER_NUMBER} SMS erreicht. Bitte warte ${BLOCK_DURATION_MINUTES} Minuten.`,
        blockedUntil,
      }, { status: 429 })
    }
    
    // Neuen Code generieren
    const code = generateCode()
    const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000)
    
    // Bestehende unverifizierten Einträge für diese Session löschen
    await prisma.phoneVerification.deleteMany({
      where: {
        sessionId,
        verified: false,
      }
    })
    
    // Neue Verifikation erstellen oder bestehende aktualisieren
    if (existingVerification && !existingVerification.verified) {
      await prisma.phoneVerification.update({
        where: { id: existingVerification.id },
        data: {
          sessionId,
          code,
          expiresAt,
          smsCount: { increment: 1 },
          lastSmsSentAt: new Date(),
          attempts: 0, // Reset Versuche bei neuem Code
        }
      })
    } else {
      await prisma.phoneVerification.create({
        data: {
          phone: normalizedPhone,
          sessionId,
          code,
          expiresAt,
          smsCount: 1,
          lastSmsSentAt: new Date(),
        }
      })
    }
    
    // SMS senden (im Testmodus nur loggen)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📱 [TEST] SMS an ${normalizedPhone}: Dein Bestätigungscode ist ${code}`)
    } else {
      // TODO: Echte SMS-Integration (Twilio, etc.)
      // await sendSmsViaTwilio(normalizedPhone, `Dein NICNOA&CO. Bestätigungscode ist: ${code}`)
      console.log(`📱 [PROD] SMS würde an ${normalizedPhone} gesendet werden`)
    }
    
    // Maskierte Telefonnummer für Anzeige
    const maskedPhone = normalizedPhone.slice(0, -4).replace(/./g, '*') + normalizedPhone.slice(-4)
    
    // SMS-Versuche zählen für verbleibende Anzeige
    const verification = await prisma.phoneVerification.findFirst({
      where: { phone: normalizedPhone, verified: false },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      message: 'SMS wurde gesendet',
      maskedPhone,
      remainingSms: MAX_SMS_PER_NUMBER - (verification?.smsCount || 1),
      expiresIn: CODE_EXPIRES_MINUTES,
      // Im Testmodus den Code zurückgeben (für einfaches Testen)
      ...(process.env.NODE_ENV !== 'production' && { testCode: code }),
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Send SMS error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der SMS' },
      { status: 500 }
    )
  }
}

