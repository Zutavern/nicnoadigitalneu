import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// seven.io SMS API
const SEVEN_IO_API_URL = 'https://gateway.seven.io/api/sms'

interface SevenIoResponse {
  success: string
  total_price: number
  balance: number
  debug: string
  sms_type: string
  messages: Array<{
    id: string
    sender: string
    recipient: string
    text: string
    encoding: string
    parts: number
    price: number
    success: boolean
    error: string | null
    error_text: string | null
  }>
}

// Return Codes von seven.io
const SEVEN_IO_CODES: Record<number, string> = {
  100: 'SMS wurde vom Gateway akzeptiert und wird gesendet',
  101: 'Senden an mindestens einen Empfänger fehlgeschlagen',
  201: 'Absender ungültig (max. 11 alphanumerische oder 16 numerische Zeichen)',
  202: 'Empfängernummer ungültig',
  301: 'Parameter "to" nicht gesetzt',
  305: 'Parameter "text" ungültig',
  401: 'Parameter "text" zu lang',
  402: 'Diese SMS wurde bereits innerhalb der letzten 180 Sekunden gesendet',
  403: 'Tageslimit für diese Empfängernummer erreicht',
  500: 'Zu wenig Guthaben auf dem Account',
  600: 'Fehler beim Senden aufgetreten',
  802: 'Ungültiges Label',
  900: 'Authentifizierung fehlgeschlagen - API-Key prüfen',
  901: 'Signatur-Hash-Verifizierung fehlgeschlagen',
  902: 'API-Key hat keine Zugriffsrechte für diesen Endpoint',
  903: 'IP-Adresse nicht in der Liste erlaubter IPs',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, text, from } = body

    if (!to || !text) {
      return NextResponse.json(
        { error: 'Felder "to" und "text" sind erforderlich' },
        { status: 400 }
      )
    }

    // Lade seven.io Konfiguration
    const settings = await prisma.platformSettings.findFirst()

    // Type-safe access
    const sevenIoEnabled = (settings as Record<string, unknown> | null)?.sevenIoEnabled === true
    const sevenIoApiKey = (settings as Record<string, unknown> | null)?.sevenIoApiKey as string | undefined
    const sevenIoSenderId = ((settings as Record<string, unknown> | null)?.sevenIoSenderId as string) || 'NICNOA'

    if (!sevenIoEnabled) {
      return NextResponse.json(
        { error: 'SMS-Verifizierung ist nicht aktiviert' },
        { status: 400 }
      )
    }

    if (!sevenIoApiKey) {
      return NextResponse.json(
        { error: 'seven.io API-Key nicht konfiguriert' },
        { status: 500 }
      )
    }

    // Telefonnummer normalisieren (für deutsches Format)
    let normalizedPhone = to.replace(/\s/g, '').replace(/[()-]/g, '')
    
    // Deutsche Handynummern normalisieren
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+49' + normalizedPhone.substring(1)
    } else if (normalizedPhone.startsWith('49') && !normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+49' + normalizedPhone
    }

    // SMS via seven.io senden
    const response = await fetch(SEVEN_IO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': sevenIoApiKey,
      },
      body: JSON.stringify({
        to: normalizedPhone,
        text,
        from: from || sevenIoSenderId,
      }),
    })

    // seven.io gibt verschiedene Response-Formate zurück
    const responseText = await response.text()
    
    // Prüfen ob es ein einfacher Status-Code ist (Legacy-Format)
    const statusCode = parseInt(responseText.trim(), 10)
    
    if (!isNaN(statusCode)) {
      // Legacy-Format: Nur Status-Code
      if (statusCode === 100) {
        return NextResponse.json({
          success: true,
          message: 'SMS erfolgreich gesendet',
          statusCode,
        })
      } else {
        return NextResponse.json(
          {
            error: SEVEN_IO_CODES[statusCode] || `Unbekannter Fehler (Code: ${statusCode})`,
            statusCode,
          },
          { status: statusCode >= 500 ? 500 : 400 }
        )
      }
    }

    // JSON-Format parsen
    try {
      const data: SevenIoResponse = JSON.parse(responseText)
      
      if (data.success === '100' || data.messages?.some(m => m.success)) {
        return NextResponse.json({
          success: true,
          message: 'SMS erfolgreich gesendet',
          messageId: data.messages?.[0]?.id,
          balance: data.balance,
        })
      } else {
        const errorMessage = data.messages?.[0]?.error_text || 
          SEVEN_IO_CODES[parseInt(data.success, 10)] || 
          'SMS konnte nicht gesendet werden'
        
        return NextResponse.json(
          { error: errorMessage, debug: data.debug },
          { status: 400 }
        )
      }
    } catch {
      // Response konnte nicht als JSON geparsed werden
      return NextResponse.json(
        { error: 'Unerwartete Antwort von seven.io', raw: responseText },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler beim SMS-Versand' },
      { status: 500 }
    )
  }
}

