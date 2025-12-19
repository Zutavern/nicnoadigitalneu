/**
 * Domain Purchase API
 * 
 * POST: Kauft eine Domain über Vercel und erstellt Stripe Invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  checkDomainAvailability, 
  purchaseDomain, 
  addDomainToProject,
  isVercelConfigured 
} from '@/lib/vercel/domains'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' })
  : null

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Prüfe ob Vercel konfiguriert ist
    if (!isVercelConfigured()) {
      return NextResponse.json(
        { error: 'Domain-Service nicht verfügbar' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { domain, homepageProjectId } = body

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain erforderlich' },
        { status: 400 }
      )
    }

    // Validiere Domain-Format
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/i
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Ungültiges Domain-Format' },
        { status: 400 }
      )
    }

    // Hole User-Daten für Kontaktinformationen
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        salonProfile: true,
        stylistProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe Verfügbarkeit und Preis
    const availability = await checkDomainAvailability(domain.toLowerCase())

    if (!availability.available) {
      return NextResponse.json(
        { error: 'Domain ist nicht verfügbar', details: availability.message },
        { status: 400 }
      )
    }

    if (!availability.customerPriceEur) {
      return NextResponse.json(
        { error: 'Preis konnte nicht ermittelt werden' },
        { status: 500 }
      )
    }

    // Hole Stripe Customer ID
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId && stripe) {
      // Erstelle Stripe Customer wenn nicht vorhanden
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      stripeCustomerId = customer.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      })
    }

    // Erstelle Invoice bei Stripe
    let stripeInvoiceId: string | null = null

    if (stripe && stripeCustomerId) {
      // Erstelle einen Invoice Item
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        amount: Math.round(availability.customerPriceEur * 100), // In Cent
        currency: 'eur',
        description: `Domain-Registrierung: ${domain} (1 Jahr)`,
        metadata: {
          type: 'domain_purchase',
          domain,
          userId: user.id,
        },
      })

      // Erstelle und finalisiere Invoice
      const invoice = await stripe.invoices.create({
        customer: stripeCustomerId,
        auto_advance: true,
        collection_method: 'charge_automatically',
        metadata: {
          type: 'domain_purchase',
          domain,
          userId: user.id,
        },
      })

      // Finalisiere die Invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
      stripeInvoiceId = finalizedInvoice.id

      // Versuche sofort zu bezahlen (wenn Zahlungsmethode hinterlegt)
      try {
        await stripe.invoices.pay(invoice.id)
      } catch (payError) {
        console.log('Invoice payment deferred:', payError)
        // Zahlung wird später durchgeführt
      }
    }

    // Erstelle CustomDomain Eintrag in der Datenbank
    const customDomain = await prisma.customDomain.create({
      data: {
        userId: user.id,
        domain: domain.toLowerCase(),
        isPurchased: false, // Wird auf true gesetzt wenn Vercel-Kauf erfolgreich
        purchasePriceUsd: availability.vercelPriceUsd,
        customerPriceEur: availability.customerPriceEur,
        renewalPriceUsd: availability.vercelPriceUsd,
        stripeInvoiceId,
        verificationStatus: 'PENDING',
      },
    })

    // Verknüpfe mit Homepage-Projekt wenn angegeben
    if (homepageProjectId) {
      await prisma.homepageProject.update({
        where: { 
          id: homepageProjectId,
          userId: user.id, // Sicherheit: Nur eigene Projekte
        },
        data: { customDomainId: customDomain.id },
      })
    }

    // Hier könnte der echte Domain-Kauf stattfinden
    // Für jetzt fügen wir die Domain nur zum Projekt hinzu (externe Domain)
    const addResult = await addDomainToProject(domain.toLowerCase())

    if (addResult.success) {
      await prisma.customDomain.update({
        where: { id: customDomain.id },
        data: {
          vercelProjectId: process.env.VERCEL_PROJECT_ID,
          verificationStatus: addResult.verified ? 'VERIFIED' : 'VERIFYING',
          verificationMethod: addResult.verification?.type,
          verificationToken: addResult.verification?.token,
          verifiedAt: addResult.verified ? new Date() : null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      domain: customDomain.domain,
      customDomainId: customDomain.id,
      customerPriceEur: availability.customerPriceEur,
      stripeInvoiceId,
      verification: addResult.verification,
      verified: addResult.verified,
      message: addResult.verified 
        ? 'Domain erfolgreich hinzugefügt und verifiziert!'
        : 'Domain hinzugefügt. Bitte konfiguriere die DNS-Einstellungen.',
    })

  } catch (error) {
    console.error('Error purchasing domain:', error)
    return NextResponse.json(
      { error: 'Fehler beim Domain-Kauf' },
      { status: 500 }
    )
  }
}



