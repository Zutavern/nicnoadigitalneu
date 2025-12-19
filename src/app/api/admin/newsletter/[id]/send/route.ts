import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NewsletterStatus, NewsletterSegment, UserRole } from '@prisma/client'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface RouteParams {
  params: Promise<{ id: string }>
}

interface RecipientData {
  email: string
  name: string | null
  salutation?: string | null
  salonName?: string | null
  companyName?: string | null
}

/**
 * Generiert die Anrede basierend auf salutation
 */
function getSalutationText(salutation: string | null, name: string | null): string {
  const firstName = name?.split(' ')[0] || ''
  
  switch (salutation) {
    case 'FRAU':
      return firstName ? `Liebe ${firstName}` : 'Liebe'
    case 'HERR':
      return firstName ? `Lieber ${firstName}` : 'Lieber'
    case 'DIVERS':
    case 'KEINE_ANGABE':
    default:
      return firstName ? `Hallo ${firstName}` : 'Hallo'
  }
}

/**
 * Ersetzt alle Personalisierungsplatzhalter im HTML
 */
function replacePersonalizationPlaceholders(
  html: string, 
  recipient: RecipientData
): string {
  const now = new Date()
  
  // Alle verfügbaren Platzhalter
  const replacements: Record<string, string> = {
    '{{anrede}}': getSalutationText(recipient.salutation, recipient.name),
    '{{name}}': recipient.name || 'Geschätzte/r Kunde/in',
    '{{vorname}}': recipient.name?.split(' ')[0] || 'Geschätzte/r Kunde/in',
    '{{email}}': recipient.email,
    '{{company}}': recipient.salonName || recipient.companyName || '',
    '{{date}}': format(now, 'dd. MMMM yyyy', { locale: de }),
    '{{year}}': now.getFullYear().toString(),
  }

  let result = html
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value)
  }

  return result
}

// POST - Newsletter versenden
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { testEmail } = body // Optional: Test-Mail an einzelne Adresse

    // Newsletter laden
    const newsletter = await prisma.newsletter.findUnique({ where: { id } })
    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfen ob HTML-Content vorhanden
    if (!newsletter.htmlContent) {
      return NextResponse.json(
        { error: 'Newsletter hat keinen HTML-Inhalt. Bitte zuerst speichern.' },
        { status: 400 }
      )
    }

    // Test-Mail versenden
    if (testEmail) {
      if (!resend) {
        return NextResponse.json(
          { error: 'Resend ist nicht konfiguriert' },
          { status: 500 }
        )
      }

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'NICNOA <noreply@nicnoa.online>',
        to: testEmail,
        subject: `[TEST] ${newsletter.subject}`,
        html: newsletter.htmlContent
      })

      return NextResponse.json({ 
        success: true, 
        message: `Test-Mail an ${testEmail} gesendet` 
      })
    }

    // Nur Drafts oder Scheduled können gesendet werden
    if (newsletter.status !== NewsletterStatus.DRAFT && 
        newsletter.status !== NewsletterStatus.SCHEDULED) {
      return NextResponse.json(
        { error: 'Newsletter wurde bereits versendet' },
        { status: 400 }
      )
    }

    // Status auf SENDING setzen
    await prisma.newsletter.update({
      where: { id },
      data: { status: NewsletterStatus.SENDING }
    })

    // Empfänger basierend auf Segment laden
    const roleFilter: UserRole[] = []
    switch (newsletter.segment) {
      case NewsletterSegment.STYLISTS:
        roleFilter.push(UserRole.STYLIST)
        break
      case NewsletterSegment.SALON_OWNERS:
        roleFilter.push(UserRole.SALON_OWNER)
        break
      case NewsletterSegment.ALL:
      default:
        roleFilter.push(UserRole.STYLIST, UserRole.SALON_OWNER)
        break
    }

    const recipients = await prisma.user.findMany({
      where: {
        role: { in: roleFilter },
        isDeleted: false,
        isBlocked: false,
        emailVerified: { not: null }
      },
      select: {
        email: true,
        name: true,
        salutation: true,
        salon: {
          select: {
            name: true
          }
        }
      }
    })

    if (recipients.length === 0) {
      await prisma.newsletter.update({
        where: { id },
        data: { status: NewsletterStatus.DRAFT }
      })
      return NextResponse.json(
        { error: 'Keine Empfänger gefunden' },
        { status: 400 }
      )
    }

    // Versand starten (Batch-Verarbeitung)
    if (!resend) {
      await prisma.newsletter.update({
        where: { id },
        data: { status: NewsletterStatus.FAILED }
      })
      return NextResponse.json(
        { error: 'Resend ist nicht konfiguriert' },
        { status: 500 }
      )
    }

    let sentCount = 0
    const batchSize = 50 // Resend Limit pro Batch
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'NICNOA <noreply@nicnoa.online>'

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      
      try {
        // Batch-Versand mit individuellen personalisierten Emails
        const sendPromises = batch.map(recipient => {
          const personalizedHtml = replacePersonalizationPlaceholders(
            newsletter.htmlContent!,
            {
              email: recipient.email,
              name: recipient.name,
              salutation: recipient.salutation,
              salonName: recipient.salon?.name,
            }
          )
          
          return resend.emails.send({
            from: fromEmail,
            to: recipient.email,
            subject: newsletter.subject,
            html: personalizedHtml
          })
        })

        await Promise.all(sendPromises)
        sentCount += batch.length
      } catch (batchError) {
        console.error('Batch send error:', batchError)
        // Weitermachen mit nächstem Batch
      }
    }

    // Status aktualisieren
    const finalStatus = sentCount > 0 ? NewsletterStatus.SENT : NewsletterStatus.FAILED

    await prisma.newsletter.update({
      where: { id },
      data: {
        status: finalStatus,
        sentAt: new Date(),
        sentCount
      }
    })

    return NextResponse.json({
      success: true,
      sentCount,
      totalRecipients: recipients.length,
      message: `Newsletter an ${sentCount} von ${recipients.length} Empfängern gesendet`
    })
  } catch (error) {
    console.error('Newsletter send error:', error)
    
    // Status zurücksetzen
    const { id } = await params
    await prisma.newsletter.update({
      where: { id },
      data: { status: NewsletterStatus.FAILED }
    }).catch(() => {})

    return NextResponse.json(
      { error: 'Fehler beim Versenden des Newsletters' },
      { status: 500 }
    )
  }
}


