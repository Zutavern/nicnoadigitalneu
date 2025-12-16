import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStripe, isStripeConfigured } from '@/lib/stripe-server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    if (!isStripeConfigured) {
      return NextResponse.json({ error: 'Stripe ist nicht konfiguriert' }, { status: 503 })
    }

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true }
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ invoices: [] })
    }

    const stripe = getStripe()

    // Rechnungen vom Stripe-Kunden abrufen
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 24, // Letzte 2 Jahre bei monatlicher Abrechnung
    })

    // Formatiere die Rechnungen für das Frontend
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount: invoice.amount_due / 100, // Cent zu Euro
      currency: invoice.currency.toUpperCase(),
      created: invoice.created * 1000, // Unix zu JS Timestamp
      periodStart: invoice.period_start * 1000,
      periodEnd: invoice.period_end * 1000,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      paid: invoice.paid,
      description: invoice.description || `Rechnung ${invoice.number}`,
    }))

    return NextResponse.json({ invoices: formattedInvoices })

  } catch (error) {
    console.error('Invoice fetch error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Rechnungen' },
      { status: 500 }
    )
  }
}

