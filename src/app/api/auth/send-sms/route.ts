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

// seven.io API
const SEVEN_IO_API_URL = 'https://gateway.seven.io/api/sms'

/**
 * Generiert einen 4-stelligen numerischen Code
 * Im Testmodus wird immer "1111" zurückgegeben, außer seven.io ist aktiviert
 */
function generateCode(sevenIoEnabled: boolean): string {
  if (!sevenIoEnabled && process.env.NODE_ENV !== 'production') {
    return '1111' // Testcode wenn seven.io nicht aktiv
  }
  return crypto.randomInt(1000, 9999).toString()
}

/**
 * Normalisiert eine Telefonnummer (entfernt Leerzeichen, etc.)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '')
}

/**
 * Formatiert Telefonnummer für E.164 Format
 */
function formatPhoneE164(phone: string): string {
  let normalized = phone.replace(/[\s\-()]/g, '')
  
  // Deutsche Handynummern normalisieren
  if (normalized.startsWith('0')) {
    normalized = '+49' + normalized.substring(1)
  } else if (normalized.startsWith('49') && !normalized.startsWith('+')) {
    normalized = '+' + normalized
  } else if (!normalized.startsWith('+')) {
    normalized = '+49' + normalized
  }
  
  return normalized
}

/**
 * Sendet SMS über seven.io
 */
async function sendSmsViaSevenIo(
  phone: string, 
  text: string, 
  apiKey: string, 
  senderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(SEVEN_IO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        to: phone,
        text,
        from: senderId,
      }),
    })

    const responseText = await response.text()
    
    // Prüfen ob es ein einfacher Status-Code ist
    const statusCode = parseInt(responseText.trim(), 10)
    
    if (!isNaN(statusCode)) {
      if (statusCode === 100) {
        return { success: true }
      } else {
        return { success: false, error: `seven.io Fehlercode: ${statusCode}` }
      }
    }

    // JSON-Format
    try {
      const data = JSON.parse(responseText)
      if (data.success === '100' || data.messages?.some((m: { success: boolean }) => m.success)) {
        return { success: true }
      }
      return { success: false, error: data.messages?.[0]?.error_text || 'SMS konnte nicht gesendet werden' }
    } catch {
      return { success: false, error: 'Unerwartete Antwort von seven.io' }
    }
  } catch (error) {
    console.error('seven.io API error:', error)
    return { success: false, error: 'Verbindungsfehler zu seven.io' }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, sessionId } = sendSmsSchema.parse(body)
    
    const normalizedPhone = normalizePhone(phone)
    
    // Lade seven.io Konfiguration
    const settings = await prisma.platformSettings.findFirst()
    
    // Type-safe access mit optionalem Chaining
    const sevenIoEnabled = (settings as Record<string, unknown> | null)?.sevenIoEnabled === true
    const sevenIoApiKey = (settings as Record<string, unknown> | null)?.sevenIoApiKey as string | undefined
    const sevenIoSenderId = ((settings as Record<string, unknown> | null)?.sevenIoSenderId as string) || 'NICNOA'
    const sevenIoTestNumbers = ((settings as Record<string, unknown> | null)?.sevenIoTestNumbers as string) || ''
    
    // Prüfe ob dies eine Testnummer ist
    const testNumbersList = sevenIoTestNumbers
      .split(',')
      .map(n => normalizePhone(n.trim()))
      .filter(n => n.length > 0)
    const isTestNumber = testNumbersList.some(testNum => 
      normalizedPhone.includes(testNum) || testNum.includes(normalizedPhone)
    )
    
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
    
    // Neuen Code generieren (Testnummern bekommen immer "1111")
    const code = isTestNumber ? '1111' : generateCode(sevenIoEnabled)
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
    
    // SMS senden (Testnummern überspringen)
    const smsText = `Dein NICNOA&CO. Bestätigungscode ist: ${code}`
    
    if (isTestNumber) {
      // Testnummer - keine SMS senden, nur loggen
      console.log(`📱 [TEST-NUMMER] ${normalizedPhone} - Code ist "1111" - keine SMS gesendet`)
    } else if (sevenIoEnabled && sevenIoApiKey) {
      // SMS über seven.io senden
      const formattedPhone = formatPhoneE164(normalizedPhone)
      const result = await sendSmsViaSevenIo(formattedPhone, smsText, sevenIoApiKey, sevenIoSenderId)
      
      if (!result.success) {
        console.error(`📱 [seven.io] SMS-Fehler: ${result.error}`)
        return NextResponse.json({
          error: 'SMS-Versand fehlgeschlagen',
          message: result.error || 'Die SMS konnte nicht gesendet werden. Bitte versuche es später erneut.',
        }, { status: 500 })
      }
      
      console.log(`📱 [seven.io] SMS erfolgreich an ${formattedPhone} gesendet`)
    } else if (process.env.NODE_ENV !== 'production') {
      // Testmodus: Nur loggen
      console.log(`📱 [TEST] SMS an ${normalizedPhone}: ${smsText}`)
    } else {
      // Produktion ohne seven.io: Warnung loggen
      console.warn(`📱 [WARN] seven.io nicht konfiguriert - SMS wird nicht gesendet`)
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
      message: isTestNumber 
        ? 'Testnummer erkannt - Code ist "1111"' 
        : (sevenIoEnabled ? 'SMS wurde gesendet' : 'Bestätigungscode bereit (Test-Modus)'),
      maskedPhone,
      remainingSms: MAX_SMS_PER_NUMBER - (verification?.smsCount || 1),
      expiresIn: CODE_EXPIRES_MINUTES,
      isTestNumber,
      // Im Testmodus (ohne seven.io) oder bei Testnummern den Code zurückgeben
      ...(isTestNumber && { testCode: '1111' }),
      ...(!sevenIoEnabled && !isTestNumber && process.env.NODE_ENV !== 'production' && { testCode: code }),
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

