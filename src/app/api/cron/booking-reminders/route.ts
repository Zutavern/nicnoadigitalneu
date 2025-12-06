import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import emails from '@/lib/email'

// Vercel Cron: Runs daily at 8:00 AM UTC
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    // Find bookings for tomorrow
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        status: 'CONFIRMED',
      },
      include: {
        stylist: {
          select: { name: true, email: true },
        },
        customer: {
          select: { firstName: true, lastName: true, email: true },
        },
        salon: {
          select: { name: true, street: true, city: true, zipCode: true },
        },
        service: {
          select: { name: true },
        },
      },
    })

    let sentCount = 0
    const errors: string[] = []

    for (const booking of upcomingBookings) {
      // Send reminder to customer if email exists
      if (booking.customer?.email) {
        try {
          await emails.sendBookingReminder(
            booking.customer.email,
            `${booking.customer.firstName} ${booking.customer.lastName}`,
            booking.stylist.name || 'Ihr Stylist',
            booking.service?.name || booking.title,
            booking.startTime.toLocaleDateString('de-DE'),
            booking.startTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
          )
          sentCount++
        } catch (err) {
          errors.push(`Customer ${booking.customer.email}: ${err}`)
        }
      }
    }

    // Log the cron execution
    await prisma.securityLog.create({
      data: {
        event: 'CRON_EXECUTION',
        status: 'SUCCESS',
        message: `Booking reminders: ${sentCount} emails sent for ${upcomingBookings.length} bookings`,
        metadata: { 
          bookingsFound: upcomingBookings.length, 
          emailsSent: sentCount,
          errors: errors.length > 0 ? errors : undefined 
        },
      },
    })

    return NextResponse.json({
      success: true,
      bookingsFound: upcomingBookings.length,
      emailsSent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron booking-reminders error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}


