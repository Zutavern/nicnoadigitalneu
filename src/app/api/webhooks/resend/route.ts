import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Webhook } from 'svix'

// Resend Webhook Event Types
interface ResendWebhookEvent {
  type: 
    | 'email.sent'
    | 'email.delivered'
    | 'email.delivery_delayed'
    | 'email.complained'
    | 'email.bounced'
    | 'email.opened'
    | 'email.clicked'
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at: string
    // Zusätzliche Felder je nach Event-Typ
    bounce?: {
      message: string
    }
    click?: {
      link: string
      ipAddress: string
      userAgent: string
    }
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.text()
    
    // Headers für Webhook-Verifizierung
    const svixId = request.headers.get('svix-id')
    const svixTimestamp = request.headers.get('svix-timestamp')
    const svixSignature = request.headers.get('svix-signature')

    // Webhook Secret aus Platform Settings holen
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: { resendWebhookSecret: true },
    })

    // Wenn ein Webhook Secret konfiguriert ist, verifizieren
    if (settings?.resendWebhookSecret && svixId && svixTimestamp && svixSignature) {
      try {
        const wh = new Webhook(settings.resendWebhookSecret)
        wh.verify(payload, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        })
      } catch (verifyError) {
        console.error('Webhook verification failed:', verifyError)
        return NextResponse.json(
          { error: 'Webhook-Verifizierung fehlgeschlagen' },
          { status: 400 }
        )
      }
    }

    // Event parsen
    const event: ResendWebhookEvent = JSON.parse(payload)
    const resendId = event.data.email_id
    const eventType = event.type
    const eventTime = new Date(event.created_at)

    console.log(`Resend Webhook: ${eventType} für E-Mail ${resendId}`)

    // E-Mail in der Datenbank finden
    const emailLog = await prisma.emailLog.findFirst({
      where: { resendId },
    })

    if (!emailLog) {
      // E-Mail nicht in unserer Datenbank - eventuell außerhalb der App gesendet
      console.log(`E-Mail ${resendId} nicht in Datenbank gefunden`)
      return NextResponse.json({ received: true, matched: false })
    }

    // Status basierend auf Event-Typ aktualisieren
    switch (eventType) {
      case 'email.sent':
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'SENT',
            sentAt: eventTime,
          },
        })
        break

      case 'email.delivered':
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'DELIVERED',
            deliveredAt: eventTime,
          },
        })
        break

      case 'email.bounced':
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'BOUNCED',
            errorMessage: event.data.bounce?.message || 'E-Mail konnte nicht zugestellt werden',
          },
        })
        break

      case 'email.complained':
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'BOUNCED',
            errorMessage: 'Empfänger hat E-Mail als Spam markiert',
          },
        })
        break

      case 'email.opened':
        // Nur aktualisieren wenn noch nicht geöffnet
        if (!emailLog.openedAt) {
          await prisma.emailLog.update({
            where: { id: emailLog.id },
            data: {
              status: 'OPENED',
              openedAt: eventTime,
            },
          })
        }
        break

      case 'email.clicked':
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'CLICKED',
            clickedAt: eventTime,
            // Link-Info in Metadata speichern
            metadata: {
              ...(emailLog.metadata as object || {}),
              lastClick: {
                link: event.data.click?.link,
                time: eventTime.toISOString(),
              },
            },
          },
        })
        break

      case 'email.delivery_delayed':
        // Status bleibt auf SENT, aber wir loggen die Verzögerung
        console.log(`E-Mail ${resendId} Zustellung verzögert`)
        break
    }

    return NextResponse.json({ received: true, matched: true })
  } catch (error) {
    console.error('Resend Webhook Error:', error)
    return NextResponse.json(
      { error: 'Webhook-Verarbeitung fehlgeschlagen' },
      { status: 500 }
    )
  }
}

// Resend sendet manchmal HEAD-Requests zur Validierung
export async function HEAD() {
  return NextResponse.json({ ok: true })
}

