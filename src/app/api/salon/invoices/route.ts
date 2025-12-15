import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, PaymentType, PaymentStatus } from '@prisma/client'
import { isDemoModeActive, getMockSalonInvoices } from '@/lib/mock-data'

// Map Payment to Invoice format
function mapPaymentToInvoice(payment: any) {
  const statusMap: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'SENT',
    [PaymentStatus.PAID]: 'PAID',
    [PaymentStatus.OVERDUE]: 'OVERDUE',
    [PaymentStatus.CANCELLED]: 'CANCELLED',
    [PaymentStatus.REFUNDED]: 'CANCELLED',
  }

  const typeMap: Record<PaymentType, string> = {
    [PaymentType.CHAIR_RENTAL]: 'RENT',
    [PaymentType.BOOKING]: 'COMMISSION',
    [PaymentType.SUBSCRIPTION]: 'FEE',
    [PaymentType.DEPOSIT]: 'FEE',
    [PaymentType.OTHER]: 'OTHER',
  }

  return {
    id: payment.id,
    invoiceNumber: `INV-${payment.id.slice(0, 8).toUpperCase()}`,
    type: typeMap[payment.type as PaymentType] || 'OTHER',
    amount: typeof payment.amount === 'object' && payment.amount.toNumber 
      ? payment.amount.toNumber() 
      : Number(payment.amount),
    status: statusMap[payment.status as PaymentStatus] || 'SENT',
    issuedDate: payment.createdAt.toISOString(),
    dueDate: payment.dueDate?.toISOString() || payment.createdAt.toISOString(),
    paidDate: payment.status === PaymentStatus.PAID 
      ? payment.updatedAt.toISOString() 
      : null,
    description: payment.description || getDefaultDescription(payment.type),
    stylist: payment.sender ? { 
      name: payment.sender.name || 'Unbekannt',
      email: payment.sender.email || '',
    } : null,
  }
}

function getDefaultDescription(type: PaymentType): string {
  switch (type) {
    case PaymentType.CHAIR_RENTAL:
      return 'Stuhlmiete'
    case PaymentType.BOOKING:
      return 'Buchungsprovision'
    case PaymentType.SUBSCRIPTION:
      return 'Abo-Gebühr'
    case PaymentType.DEPOSIT:
      return 'Kaution'
    default:
      return 'Sonstige Zahlung'
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.SALON_OWNER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Get salon for this owner
    const salon = await prisma.salon.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    // Check if demo mode is active OR no salon exists (show mock data)
    const demoMode = await isDemoModeActive()
    if (demoMode || !salon) {
      return NextResponse.json({
        invoices: getMockSalonInvoices().invoices,
        _source: 'demo',
        _message: !salon 
          ? 'Kein Salon vorhanden - Es werden Beispieldaten angezeigt'
          : 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Build where clause
    const whereClause: any = {
      receiverId: session.user.id,
    }

    if (status && status !== 'ALL') {
      const statusMap: Record<string, PaymentStatus> = {
        DRAFT: PaymentStatus.PENDING,
        SENT: PaymentStatus.PENDING,
        PAID: PaymentStatus.PAID,
        OVERDUE: PaymentStatus.OVERDUE,
        CANCELLED: PaymentStatus.CANCELLED,
      }
      if (statusMap[status]) {
        whereClause.status = statusMap[status]
      }
    }

    if (type && type !== 'ALL') {
      const typeMap: Record<string, PaymentType> = {
        RENT: PaymentType.CHAIR_RENTAL,
        COMMISSION: PaymentType.BOOKING,
        FEE: PaymentType.SUBSCRIPTION,
        OTHER: PaymentType.OTHER,
      }
      if (typeMap[type]) {
        whereClause.type = typeMap[type]
      }
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Get payer details separately
    const payerIds = [...new Set(payments.map(p => p.payerId))]
    const payers = payerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: payerIds } },
          select: { id: true, name: true, email: true },
        })
      : []
    const payerMap = new Map(payers.map(p => [p.id, p]))

    const invoices = payments.map(payment => {
      const payer = payerMap.get(payment.payerId)
      return mapPaymentToInvoice({ ...payment, sender: payer })
    })

    // Filter by search term if provided
    let filteredInvoices = invoices
    if (search) {
      const searchLower = search.toLowerCase()
      filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.description.toLowerCase().includes(searchLower) ||
        inv.stylist?.name?.toLowerCase().includes(searchLower) ||
        inv.stylist?.email?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json(filteredInvoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Rechnungen' },
      { status: 500 }
    )
  }
}
