import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * Resend Webhook Handler
 * 
 * Empfängt Events von Resend für Newsletter-Analytics:
 * - email.sent
 * - email.delivered  
 * - email.opened
 * - email.clicked
 * - email.bounced
 * - email.complained
 * 
 * Webhook-Setup in Resend Dashboard:
 * https://resend.com/webhooks
 * 
 * Endpoint: https://yourdomain.com/api/webhooks/resend
 */

// Resend Event Types
type ResendEventType = 
  | 'email.sent'
  | 'email.delivered'
  | 'email.opened'
  | 'email.clicked'
  | 'email.bounced'
  | 'email.complained'
  | 'email.delivery_delayed'

interface ResendWebhookEvent {
  type: ResendEventType
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    broadcast_id?: string
    template_id?: string
    tags?: Record<string, string>
    click?: {
      ipAddress: string
      link: string
      timestamp: string
      userAgent: string
    }
    bounce?: {
      message: string
      subType: string
      type: string
    }
  }
}

/**
 * Verifiziert die Webhook-Signatur von Resend
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string | null
): boolean {
  if (!signature || !secret) {
    console.warn('Missing webhook signature or secret')
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(`sha256=${expectedSignature}`)
    )
  } catch {
    return false
  }
}

/**
 * Extrahiert die Newsletter-ID aus den Tags oder dem Betreff
 */
function extractNewsletterId(event: ResendWebhookEvent): string | null {
  // Prüfe Tags zuerst
  if (event.data.tags?.newsletter_id) {
    return event.data.tags.newsletter_id
  }
  
  // Broadcast ID als Fallback
  if (event.data.broadcast_id) {
    return event.data.broadcast_id
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('svix-signature') || request.headers.get('resend-signature')
    
    // Webhook Secret aus Platform Settings laden
    const settings = await prisma.platformSettings.findFirst({
      select: { resendWebhookSecret: true }
    })
    
    // Signatur-Verifizierung (optional, aber empfohlen)
    if (settings?.resendWebhookSecret) {
      const isValid = verifyWebhookSignature(payload, signature, settings.resendWebhookSecret)
      if (!isValid) {
        console.warn('Invalid webhook signature')
        // In Produktion: return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event: ResendWebhookEvent = JSON.parse(payload)
    
    console.log(`[Resend Webhook] Received event: ${event.type}`, {
      email_id: event.data.email_id,
      subject: event.data.subject,
      broadcast_id: event.data.broadcast_id,
    })

    // Newsletter-ID extrahieren
    const newsletterId = extractNewsletterId(event)
    
    if (!newsletterId) {
      // Event ohne Newsletter-Zuordnung - trotzdem loggen
      console.log(`[Resend Webhook] Event ${event.type} has no newsletter_id`)
      return NextResponse.json({ received: true })
    }

    // Newsletter in der Datenbank finden
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId }
    })

    if (!newsletter) {
      console.log(`[Resend Webhook] Newsletter ${newsletterId} not found`)
      return NextResponse.json({ received: true })
    }

    // Statistiken basierend auf Event-Typ aktualisieren
    switch (event.type) {
      case 'email.opened':
        await prisma.newsletter.update({
          where: { id: newsletterId },
          data: { openCount: { increment: 1 } }
        })
        console.log(`[Resend Webhook] Incremented openCount for ${newsletterId}`)
        break

      case 'email.clicked':
        await prisma.newsletter.update({
          where: { id: newsletterId },
          data: { clickCount: { increment: 1 } }
        })
        console.log(`[Resend Webhook] Incremented clickCount for ${newsletterId}`, {
          link: event.data.click?.link
        })
        break

      case 'email.bounced':
        await prisma.newsletter.update({
          where: { id: newsletterId },
          data: { bounceCount: { increment: 1 } }
        })
        console.log(`[Resend Webhook] Incremented bounceCount for ${newsletterId}`, {
          type: event.data.bounce?.type,
          message: event.data.bounce?.message
        })
        break

      case 'email.complained':
        // Spam-Beschwerde - könnte auch bounceCount erhöhen
        await prisma.newsletter.update({
          where: { id: newsletterId },
          data: { bounceCount: { increment: 1 } }
        })
        console.log(`[Resend Webhook] Spam complaint for ${newsletterId}`)
        break

      case 'email.delivered':
        // Erfolgreiche Zustellung - optional loggen
        console.log(`[Resend Webhook] Email delivered for ${newsletterId}`)
        break

      case 'email.sent':
        // E-Mail wurde gesendet
        console.log(`[Resend Webhook] Email sent for ${newsletterId}`)
        break

      default:
        console.log(`[Resend Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Resend Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Resend sendet HEAD-Requests zum Testen
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
