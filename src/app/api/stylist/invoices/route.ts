import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, PaymentType, PaymentStatus } from '@prisma/client'
import { isDemoModeActive, getMockStylistInvoices } from '@/lib/mock-data'

// Map Payment to Invoice format
function mapPaymentToInvoice(payment: any) {
  const statusMap: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'SENT',
    [PaymentStatus.PAID]: 'PAID',
    [PaymentStatus.FAILED]: 'OVERDUE',
    [PaymentStatus.REFUNDED]: 'CANCELLED',
  }

  const typeMap: Record<PaymentType, string> = {
    [PaymentType.CHAIR_RENT]: 'RENT',
    [PaymentType.BOOKING_COMMISSION]: 'COMMISSION',
    [PaymentType.PLATFORM_FEE]: 'OTHER',
    [PaymentType.OTHER]: 'OTHER',
  }

  return {
    id: payment.id,
    invoiceNumber: `INV-${payment.id.slice(0, 8).toUpperCase()}`,
    type: typeMap[payment.type as PaymentType] || 'OTHER',
    amount: payment.amount.toNumber(),
    status: statusMap[payment.status as PaymentStatus] || 'SENT',
    issuedDate: payment.createdAt.toISOString(),
    dueDate: payment.dueDate?.toISOString() || payment.createdAt.toISOString(),
    paidDate: payment.status === PaymentStatus.PAID 
      ? payment.updatedAt.toISOString() 
      : null,
    description: payment.description || getDefaultDescription(payment.type),
    salon: payment.booking?.salon ? { name: payment.booking.salon.name } : null,
  }
}

function getDefaultDescription(type: PaymentType): string {
  switch (type) {
    case PaymentType.CHAIR_RENT:
      return 'Stuhlmiete'
    case PaymentType.BOOKING_COMMISSION:
      return 'Buchungsprovision'
    case PaymentType.PLATFORM_FEE:
      return 'Plattformgebühr'
    default:
      return 'Sonstige Zahlung'
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== UserRole.STYLIST) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    // Check if demo mode is active
    const demoMode = await isDemoModeActive()
    if (demoMode) {
      return NextResponse.json({
        invoices: getMockStylistInvoices().invoices,
        _source: 'demo',
        _message: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt'
      })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Build where clause
    const whereClause: any = {
      OR: [
        { payerId: session.user.id },
        { receiverId: session.user.id },
      ],
    }

    if (status && status !== 'ALL') {
      const statusMap: Record<string, PaymentStatus> = {
        DRAFT: PaymentStatus.PENDING,
        SENT: PaymentStatus.PENDING,
        PAID: PaymentStatus.PAID,
        OVERDUE: PaymentStatus.FAILED,
        CANCELLED: PaymentStatus.REFUNDED,
      }
      if (statusMap[status]) {
        whereClause.status = statusMap[status]
      }
    }

    if (type && type !== 'ALL') {
      const typeMap: Record<string, PaymentType> = {
        RENT: PaymentType.CHAIR_RENT,
        COMMISSION: PaymentType.BOOKING_COMMISSION,
        OTHER: PaymentType.OTHER,
      }
      if (typeMap[type]) {
        whereClause.type = typeMap[type]
      }
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            salon: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const invoices = payments.map(mapPaymentToInvoice)

    // Filter by search term if provided
    let filteredInvoices = invoices
    if (search) {
      const searchLower = search.toLowerCase()
      filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.description.toLowerCase().includes(searchLower) ||
        inv.salon?.name?.toLowerCase().includes(searchLower)
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

